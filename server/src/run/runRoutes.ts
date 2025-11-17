import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import {
  createJobRecord,
  getJobRecord,
  updateJobStatus,
  appendJobOutput,
  setJobResult,
  setJobVisualizationFrame,
} from './jobStore.js';
import { enqueueJobId, claimNextJobId } from './jobQueue.js';
import { assertRunnerAuthorized } from './runnerAuth.js';
import type { RunJobDTO, RunnerEvent } from './jobTypes.js';
import { sanitizeRunJobDTO } from './runJobValidator.js';

const MAX_TIMEOUT_MS = Number(process.env.RUN_JOB_TIMEOUT_MS ?? 60000);

const clampTimeout = (input?: number) => {
  if (!input || Number.isNaN(input)) return MAX_TIMEOUT_MS;
  return Math.min(Math.max(1000, input), MAX_TIMEOUT_MS);
};

export const registerRunRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/api/run', async (request, reply) => {
    const body = request.body as RunJobDTO;
    let sanitized: RunJobDTO;
    try {
      sanitized = sanitizeRunJobDTO(body);
    } catch (error) {
      return reply.code(400).send({ message: (error as Error).message });
    }

    const jobId = randomUUID();
    const job = createJobRecord({
      id: jobId,
      language: 'python',
      timeoutMs: clampTimeout(undefined),
      createdAt: Date.now(),
      ...sanitized,
    });

    enqueueJobId(job.id);

    return reply.code(202).send({ jobId: job.id, status: job.status });
  });

  fastify.get('/api/run/:jobId', async (request, reply) => {
    const { jobId } = request.params as { jobId: string };
    const job = getJobRecord(jobId);
    if (!job) {
      return reply.code(404).send({ message: 'Job not found' });
    }
    return {
      jobId: job.id,
      status: job.status,
      stdout: job.stdout,
      stderr: job.stderr,
      error: job.error,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      finishedAt: job.finishedAt,
      visualization: job.visualization,
    };
  });

  fastify.post('/api/runner/jobs/claim', async (request, reply) => {
    assertRunnerAuthorized(request);
    const jobId = claimNextJobId();
    if (!jobId) {
      return reply.code(204).send();
    }
    const job = getJobRecord(jobId);
    if (!job) {
      return reply.code(404).send({ message: 'Job disappeared' });
    }
    updateJobStatus(jobId, 'running');
    return {
      jobId: job.id,
      language: job.language,
      timeoutMs: job.timeoutMs,
      createdAt: job.createdAt,
      protocolVersion: job.protocolVersion,
      files: job.files,
      entryPath: job.entryPath,
    };
  });

  fastify.post('/api/runner/jobs/:jobId/events', async (request, reply) => {
    assertRunnerAuthorized(request);
    const { jobId } = request.params as { jobId: string };
    const event = request.body as RunnerEvent;
    const job = getJobRecord(jobId);
    if (!job) {
      return reply.code(404).send({ message: 'Job not found' });
    }

    switch (event.type) {
      case 'started':
        updateJobStatus(jobId, 'running');
        if (event.startedAt) {
          job.startedAt = event.startedAt;
        }
        break;
      case 'chunk':
        appendJobOutput(jobId, event.stream, event.chunk);
        break;
      case 'completed':
        setJobResult(jobId, {
          stdout: event.stdout ?? job.stdout,
          stderr: event.stderr ?? job.stderr,
          finishedAt: event.finishedAt,
        });
        updateJobStatus(jobId, 'succeeded');
        break;
      case 'failed':
        setJobResult(jobId, {
          stderr: event.stderr ?? job.stderr,
          error: event.error,
          finishedAt: event.finishedAt,
        });
        updateJobStatus(jobId, 'failed');
        break;
      case 'visualization':
        setJobVisualizationFrame(jobId, event.frame);
        break;
      default:
        return reply.code(400).send({ message: 'Unknown event type' });
    }

    return reply.code(204).send();
  });
};
