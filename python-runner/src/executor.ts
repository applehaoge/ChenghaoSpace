import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, posix as pathPosix } from 'node:path';
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { config } from './config.js';
import type { ClaimedJob, RunFileDTO } from './types.js';
import { sendRunnerEvent } from './apiClient.js';
import { createVisualizationBridge } from './viz/visualizationBridge.js';
import { startAudioBridge } from './audio/audioBridge.js';
import { VirtualFS } from './virtualFs.js';
import kidsVirtualFsPy from './assets/kids_virtual_fs.py?raw';

const dirPrefix = join(tmpdir(), 'python-runner-');
const DRIVE_PREFIX = /^[a-zA-Z]:/;

const sendSafeEvent = async (jobId: string, event: Parameters<typeof sendRunnerEvent>[1]) => {
  try {
    await sendRunnerEvent(jobId, event);
  } catch (err) {
    console.error(`Failed to send event for job ${jobId}:`, err);
  }
};

export const ensureSafeRelativePath = (path: string) => {
  if (!path) {
    throw new Error('File path cannot be empty');
  }
  const trimmed = path.trim();
  if (!trimmed) {
    throw new Error('File path cannot be empty');
  }
  if (trimmed.startsWith('/') || DRIVE_PREFIX.test(trimmed)) {
    throw new Error(`Absolute paths are not allowed: ${trimmed}`);
  }
  if (trimmed.includes('\\')) {
    throw new Error(`Backslashes are not allowed in file path: ${trimmed}`);
  }
  const normalized = pathPosix.normalize(trimmed);
  if (!normalized || normalized === '.' || normalized.startsWith('/') || normalized.startsWith('..')) {
    // 防止目录穿越，确保用户无法逃离临时工作目录
    throw new Error(`Invalid relative path "${path}"`);
  }
  return normalized;
};

export const materializeRunFiles = async (
  workDir: string,
  files: RunFileDTO[],
  vfs: VirtualFS,
): Promise<void> => {
  await Promise.all(
    files.map(async file => {
      const safePath = ensureSafeRelativePath(file.path);
      const targetPath = join(workDir, safePath);
      await mkdir(dirname(targetPath), { recursive: true });
      if (file.encoding === 'base64') {
        const buffer = Buffer.from(file.content ?? '', 'base64');
        vfs.setFile(safePath, buffer);
        await writeFile(targetPath, buffer);
        return;
      }
      const textBuffer = Buffer.from(file.content ?? '', 'utf8');
      vfs.setFile(safePath, textBuffer);
      await writeFile(targetPath, textBuffer);
    }),
  );
};

const attachStreamForwarders = (jobId: string, child: ChildProcess) => {
  child.stdout?.setEncoding('utf-8');
  child.stdout?.on('data', chunk => {
    void sendSafeEvent(jobId, { type: 'chunk', stream: 'stdout', chunk });
  });
  child.stderr?.setEncoding('utf-8');
  child.stderr?.on('data', chunk => {
    void sendSafeEvent(jobId, { type: 'chunk', stream: 'stderr', chunk });
  });
};

const setupTimeoutKill = (job: ClaimedJob, child: ChildProcess) => {
  const timer = setTimeout(() => {
    console.warn(`Job ${job.jobId} exceeded timeout ${job.timeoutMs}ms, killing process`);
    child.kill('SIGKILL');
  }, job.timeoutMs);
  return () => clearTimeout(timer);
};

const waitForExit = async (
  job: ClaimedJob,
  child: ChildProcess,
  fatalError: Promise<never>,
  clearTimer: () => void,
) => {
  let exitCode = 0;
  try {
    const [code] = (await Promise.race([once(child, 'exit'), fatalError])) as [number | null];
    exitCode = code ?? 1;
  } catch (err) {
    exitCode = 1;
    await sendSafeEvent(job.jobId, {
      type: 'failed',
      finishedAt: Date.now(),
      error: err instanceof Error ? err.message : 'Runner crashed',
    });
    throw err;
  } finally {
    clearTimer();
  }
  return exitCode;
};

const reportFinalStatus = async (jobId: string, exitCode: number) => {
  if (exitCode === 0) {
    await sendSafeEvent(jobId, {
      type: 'completed',
      finishedAt: Date.now(),
    });
    return;
  }
  await sendSafeEvent(jobId, {
    type: 'failed',
    finishedAt: Date.now(),
    error: `Python exited with code ${exitCode}`,
  });
};

const runPythonProcess = async (
  job: ClaimedJob,
  workDir: string,
  entryPath: string,
  extraEnv: NodeJS.ProcessEnv,
  stdinPayload?: string,
) => {
  await sendSafeEvent(job.jobId, { type: 'started', startedAt: Date.now() });
  const childEnv: NodeJS.ProcessEnv = { ...process.env, ...extraEnv };
  const child = spawn(config.pythonBinary, ['-u', entryPath], {
    cwd: workDir,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: childEnv,
  });

  const fatalError = once(child, 'error').then(err => {
    throw err;
  });

  if (stdinPayload && child.stdin) {
    child.stdin.write(`${stdinPayload}\n`);
    child.stdin.end();
  } else {
    child.stdin?.end();
  }

  const clearTimer = setupTimeoutKill(job, child);
  attachStreamForwarders(job.jobId, child);

  const exitCode = await waitForExit(job, child, fatalError, clearTimer);
  await reportFinalStatus(job.jobId, exitCode);
};

export async function executeJob(job: ClaimedJob) {
  const workDir = await mkdtemp(dirPrefix);
  const vfs = new VirtualFS();
  const entryPath = ensureSafeRelativePath(job.entryPath);
  const normalizedPaths = new Set(job.files.map(file => ensureSafeRelativePath(file.path)));
  if (!normalizedPaths.has(entryPath)) {
    throw new Error('Entry file is missing from files payload');
  }

  let vizBridge: Awaited<ReturnType<typeof createVisualizationBridge>> | null = null;
  let audioBridge: Awaited<ReturnType<typeof startAudioBridge>> | null = null;
  try {
    await materializeRunFiles(workDir, job.files, vfs);
    const helperPath = join(workDir, '__kids_virtual_fs.py');
    await writeFile(helperPath, kidsVirtualFsPy, 'utf-8');
    const bootstrapPath = join(workDir, '__runner_entry.py');
    const bootstrapSource = `
import __kids_virtual_fs  # noqa: F401
import runpy
runpy.run_path(${JSON.stringify(entryPath)}, run_name="__main__")
`.trimStart();
    await writeFile(bootstrapPath, bootstrapSource, 'utf-8');

    const forwardEvent = (event: unknown) => sendSafeEvent(job.jobId, event as any);

    vizBridge = await createVisualizationBridge(workDir, frame =>
      forwardEvent({ type: 'visualization', frame }),
    );
    audioBridge = await startAudioBridge(workDir, job.jobId, event => forwardEvent(event));

    const mergedEnv = { ...vizBridge.env, ...audioBridge.env };
    const vfsPayload = JSON.stringify({ vfs: { files: vfs.toBase64Object() } });
    await runPythonProcess(job, workDir, bootstrapPath, mergedEnv, vfsPayload);
  } finally {
    await audioBridge?.dispose();
    await vizBridge?.dispose();
    await rm(workDir, { recursive: true, force: true });
  }
}
