import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { config } from './config.js';
import type { ClaimedJob } from './types.js';
import { sendRunnerEvent } from './apiClient.js';
import { createVisualizationBridge } from './viz/visualizationBridge.js';

const dirPrefix = join(tmpdir(), 'python-runner-');

const sendSafeEvent = async (jobId: string, event: Parameters<typeof sendRunnerEvent>[1]) => {
  try {
    await sendRunnerEvent(jobId, event);
  } catch (err) {
    console.error(`Failed to send event for job ${jobId}:`, err);
  }
};

const ensureSafePath = (path: string) => {
  if (!path || path.includes('/') || path.includes('\\') || path.includes('..')) {
    // 防止用户构造路径穿透到工作目录之外
    throw new Error(`Invalid file path "${path}"`);
  }
  return path;
};

export async function executeJob(job: ClaimedJob) {
  const workDir = await mkdtemp(dirPrefix);
  const entryPath = ensureSafePath(job.entryPath);
  const sanitizedFiles = job.files.map(file => ({
    path: ensureSafePath(file.path),
    content: file.content ?? '',
  }));
  if (!sanitizedFiles.some(file => file.path === entryPath)) {
    throw new Error('Entry file is missing from files payload');
  }

  await Promise.all(
    sanitizedFiles.map(file => writeFile(join(workDir, file.path), file.content, 'utf-8')),
  );

  const vizBridge = await createVisualizationBridge(workDir, frame =>
    sendSafeEvent(job.jobId, { type: 'visualization', frame }),
  );

  await sendSafeEvent(job.jobId, { type: 'started', startedAt: Date.now() });

  const childEnv: NodeJS.ProcessEnv = { ...process.env, ...vizBridge.env };

  const child = spawn(config.pythonBinary, ['-u', entryPath], {
    cwd: workDir,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: childEnv,
  });

  const fatalError = once(child, 'error').then(err => {
    throw err;
  });

  child.stdin?.end();

  const timeout = setTimeout(() => {
    console.warn(`Job ${job.jobId} exceeded timeout ${job.timeoutMs}ms, killing process`);
    child.kill('SIGKILL');
  }, job.timeoutMs);

  child.stdout?.setEncoding('utf-8');
  child.stdout?.on('data', chunk => {
    void sendSafeEvent(job.jobId, { type: 'chunk', stream: 'stdout', chunk });
  });

  child.stderr?.setEncoding('utf-8');
  child.stderr?.on('data', chunk => {
    void sendSafeEvent(job.jobId, { type: 'chunk', stream: 'stderr', chunk });
  });

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
    clearTimeout(timeout);
  }

  try {
    if (exitCode === 0) {
      await sendSafeEvent(job.jobId, {
        type: 'completed',
        finishedAt: Date.now(),
      });
    } else {
      await sendSafeEvent(job.jobId, {
        type: 'failed',
        finishedAt: Date.now(),
        error: `Python exited with code ${exitCode}`,
      });
    }
  } finally {
    await vizBridge.dispose();
    await rm(workDir, { recursive: true, force: true });
  }
}
