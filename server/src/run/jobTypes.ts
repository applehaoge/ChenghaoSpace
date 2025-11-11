export type RunJobLanguage = 'python';

export type RunJobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface RunJobRequest {
  id: string;
  language: RunJobLanguage;
  code: string;
  stdin?: string;
  timeoutMs: number;
  createdAt: number;
}

export interface RunJobRecord extends RunJobRequest {
  status: RunJobStatus;
  stdout: string;
  stderr: string;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
  visualization?: unknown;
}

export interface JobChunk {
  jobId: string;
  stream: 'stdout' | 'stderr';
  chunk: string;
  timestamp: number;
}

export interface RunnerEventStarted {
  type: 'started';
  startedAt?: number;
}

export interface RunnerEventChunk {
  type: 'chunk';
  stream: 'stdout' | 'stderr';
  chunk: string;
}

export interface RunnerEventCompleted {
  type: 'completed';
  stdout?: string;
  stderr?: string;
  visualization?: unknown;
  finishedAt?: number;
}

export interface RunnerEventFailed {
  type: 'failed';
  error: string;
  stderr?: string;
  finishedAt?: number;
}

export type RunnerEvent =
  | RunnerEventStarted
  | RunnerEventChunk
  | RunnerEventCompleted
  | RunnerEventFailed;
