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

export const materializeRunFiles = async (workDir: string, files: RunFileDTO[]): Promise<void> => {
  await Promise.all(
    files.map(async file => {
      const safePath = ensureSafeRelativePath(file.path);
      const targetPath = join(workDir, safePath);
      await mkdir(dirname(targetPath), { recursive: true });
      const data =
        file.encoding === 'base64'
          ? Buffer.from(file.content ?? '', 'base64')
          : Buffer.from(file.content ?? '', 'utf8');
      await writeFile(targetPath, data);
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

  child.stdin?.end();

  const clearTimer = setupTimeoutKill(job, child);
  attachStreamForwarders(job.jobId, child);

  const exitCode = await waitForExit(job, child, fatalError, clearTimer);
  await reportFinalStatus(job.jobId, exitCode);
};

export async function executeJob(job: ClaimedJob) {
  const workDir = await mkdtemp(dirPrefix);
  const entryPath = ensureSafeRelativePath(job.entryPath);
  const normalizedPaths = new Set(job.files.map(file => ensureSafeRelativePath(file.path)));
  if (!normalizedPaths.has(entryPath)) {
    throw new Error('Entry file is missing from files payload');
  }

  let vizBridge: Awaited<ReturnType<typeof createVisualizationBridge>> | null = null;
  try {
    await materializeRunFiles(workDir, job.files);

    vizBridge = await createVisualizationBridge(workDir, frame =>
      sendSafeEvent(job.jobId, { type: 'visualization', frame }),
    );

    await runPythonProcess(job, workDir, entryPath, vizBridge.env);
  } finally {
    await vizBridge?.dispose();
    await rm(workDir, { recursive: true, force: true });
  }
}
