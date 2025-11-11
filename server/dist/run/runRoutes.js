import { randomUUID } from 'node:crypto';
import { createJobRecord, getJobRecord, updateJobStatus, appendJobOutput, setJobResult } from './jobStore.js';
import { enqueueJobId, claimNextJobId } from './jobQueue.js';
import { assertRunnerAuthorized } from './runnerAuth.js';
const MAX_TIMEOUT_MS = Number(process.env.RUN_JOB_TIMEOUT_MS ?? 60000);
const clampTimeout = (input) => {
    if (!input || Number.isNaN(input))
        return MAX_TIMEOUT_MS;
    return Math.min(Math.max(1000, input), MAX_TIMEOUT_MS);
};
export const registerRunRoutes = async (fastify) => {
    fastify.post('/api/run', async (request, reply) => {
        const body = request.body;
        if (!body || typeof body.code !== 'string' || !body.code.trim()) {
            return reply.code(400).send({ message: 'code is required' });
        }
        if (body.language && body.language !== 'python') {
            return reply.code(400).send({ message: 'Only python language is supported currently' });
        }
        const jobId = randomUUID();
        const job = createJobRecord({
            id: jobId,
            code: body.code,
            language: 'python',
            stdin: typeof body.stdin === 'string' ? body.stdin : undefined,
            timeoutMs: clampTimeout(body.timeout),
            createdAt: Date.now(),
        });
        enqueueJobId(job.id);
        return reply.code(202).send({ jobId: job.id, status: job.status });
    });
    fastify.get('/api/run/:jobId', async (request, reply) => {
        const { jobId } = request.params;
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
            code: job.code,
            stdin: job.stdin,
            language: job.language,
            timeoutMs: job.timeoutMs,
            createdAt: job.createdAt,
        };
    });
    fastify.post('/api/runner/jobs/:jobId/events', async (request, reply) => {
        assertRunnerAuthorized(request);
        const { jobId } = request.params;
        const event = request.body;
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
                    visualization: event.visualization,
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
            default:
                return reply.code(400).send({ message: 'Unknown event type' });
        }
        return reply.code(204).send();
    });
};
