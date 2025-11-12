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

export interface VisualizationFramePayload {
  width: number;
  height: number;
  format: 'RGB';
  data: string;
  timestamp?: number;
}

export interface VisualizationSnapshot {
  latestFrame?: VisualizationFramePayload;
}

export interface RunJobRecord extends RunJobRequest {
  status: RunJobStatus;
  stdout: string;
  stderr: string;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
  visualization?: VisualizationSnapshot;
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
  finishedAt?: number;
}

export interface RunnerEventFailed {
  type: 'failed';
  error: string;
  stderr?: string;
  finishedAt?: number;
}

export interface RunnerEventVisualization {
  type: 'visualization';
  frame: VisualizationFramePayload;
}

export type RunnerEvent =
  | RunnerEventStarted
  | RunnerEventChunk
  | RunnerEventCompleted
  | RunnerEventFailed
  | RunnerEventVisualization;
