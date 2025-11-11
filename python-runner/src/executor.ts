import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { config } from './config.js';
import type { ClaimedJob } from './types.js';
import { sendRunnerEvent } from './apiClient.js';

const dirPrefix = join(tmpdir(), 'python-runner-');

const sendSafeEvent = async (jobId: string, event: Parameters<typeof sendRunnerEvent>[1]) => {
  try {
    await sendRunnerEvent(jobId, event);
  } catch (err) {
    console.error(`Failed to send event for job ${jobId}:`, err);
  }
};

export async function executeJob(job: ClaimedJob) {
  const workDir = await mkdtemp(dirPrefix);
  const scriptPath = join(workDir, 'main.py');
  await writeFile(scriptPath, job.code, 'utf-8');

  await sendSafeEvent(job.jobId, { type: 'started', startedAt: Date.now() });

  const child = spawn(config.pythonBinary, ['-u', scriptPath], {
    cwd: workDir,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  const fatalError = once(child, 'error').then(err => {
    throw err;
  });

  if (job.stdin) {
    child.stdin?.write(job.stdin);
  }
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
    await rm(workDir, { recursive: true, force: true });
  }
}
