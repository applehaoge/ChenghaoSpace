export type RunJobLanguage = 'python';

export type RunJobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface RunFileDTOV1 {
  path: string;
  content: string;
}

export interface RunJobDTOV1 {
  protocolVersion: 1;
  files: RunFileDTOV1[];
  entryPath: string;
}

export type RunFileEncoding = 'utf8' | 'base64';

export interface RunFileDTO {
  path: string;
  content: string;
  encoding: RunFileEncoding;
}

export interface RunJobDTO {
  protocolVersion: 2;
  language: RunJobLanguage;
  files: RunFileDTO[];
  entryPath: string;
}

export interface RunJobRequest extends RunJobDTO {
  id: string;
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

export interface AudioChunkDTO {
  jobId: string;
  seq?: number;
  timestamp?: number;
  sampleRate: number;
  channels: number;
  format: string;
  durationMs?: number;
  data: string;
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

export interface RunnerEventAudio extends AudioChunkDTO {
  type: 'audio';
}

export type RunnerEvent =
  | RunnerEventStarted
  | RunnerEventChunk
  | RunnerEventCompleted
  | RunnerEventFailed
  | RunnerEventVisualization
  | RunnerEventAudio;
