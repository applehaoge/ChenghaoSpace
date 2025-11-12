import { EventEmitter } from 'node:events';
import {
  RunJobRecord,
  RunJobRequest,
  RunJobStatus,
  VisualizationFramePayload,
  VisualizationSnapshot,
} from './jobTypes.js';

const jobs = new Map<string, RunJobRecord>();
const jobEvents = new EventEmitter();

const JOB_TTL_MS = 1000 * 60 * 60; // 1 hour

export const createJobRecord = (request: RunJobRequest) => {
  const record: RunJobRecord = {
    ...request,
    status: 'queued',
    stdout: '',
    stderr: '',
  };
  jobs.set(record.id, record);
  scheduleCleanup(record.id);
  jobEvents.emit(record.id, record);
  return record;
};

export const getJobRecord = (jobId: string) => jobs.get(jobId);

export const updateJobStatus = (jobId: string, status: RunJobStatus) => {
  const job = jobs.get(jobId);
  if (!job) return;
  job.status = status;
  if (status === 'running' && !job.startedAt) {
    job.startedAt = Date.now();
  }
  if ((status === 'succeeded' || status === 'failed' || status === 'cancelled') && !job.finishedAt) {
    job.finishedAt = Date.now();
  }
  jobEvents.emit(jobId, job);
};

export const appendJobOutput = (jobId: string, stream: 'stdout' | 'stderr', chunk: string) => {
  const job = jobs.get(jobId);
  if (!job) return;
  if (stream === 'stdout') {
    job.stdout += chunk;
  } else {
    job.stderr += chunk;
  }
  jobEvents.emit(jobId, job);
};

export const setJobResult = (
  jobId: string,
  result: Partial<Pick<RunJobRecord, 'stdout' | 'stderr' | 'error' | 'visualization' | 'finishedAt'>>,
) => {
  const job = jobs.get(jobId);
  if (!job) return;
  Object.assign(job, { ...result, visualization: mergeVisualization(job.visualization, result.visualization) });
  if (!job.finishedAt) {
    job.finishedAt = Date.now();
  }
  jobEvents.emit(jobId, job);
};

export const setJobVisualizationFrame = (jobId: string, frame: VisualizationFramePayload) => {
  const job = jobs.get(jobId);
  if (!job) return;
  job.visualization = mergeVisualization(job.visualization, { latestFrame: frame });
  jobEvents.emit(jobId, job);
};

const cleanupTimers = new Map<string, NodeJS.Timeout>();

const scheduleCleanup = (jobId: string) => {
  if (cleanupTimers.has(jobId)) {
    clearTimeout(cleanupTimers.get(jobId));
  }
  const timer = setTimeout(() => {
    jobs.delete(jobId);
    cleanupTimers.delete(jobId);
  }, JOB_TTL_MS);
  cleanupTimers.set(jobId, timer);
};

export const subscribeJob = (jobId: string, listener: (job: RunJobRecord) => void) => {
  const handler = (job: RunJobRecord) => listener(job);
  jobEvents.on(jobId, handler);
  const current = jobs.get(jobId);
  if (current) {
    listener(current);
  }
  return () => jobEvents.off(jobId, handler);
};

const mergeVisualization = (
  current?: VisualizationSnapshot,
  next?: VisualizationSnapshot,
): VisualizationSnapshot | undefined => {
  if (!current && !next) return undefined;
  return {
    latestFrame: next?.latestFrame ?? current?.latestFrame,
  };
};
