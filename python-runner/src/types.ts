import type { VisualizationFramePayload } from './viz/types.js';

export type RunJobLanguage = 'python';

export type RunFileEncoding = 'utf8' | 'base64';

export interface RunFileDTO {
  path: string;
  content: string;
  encoding: RunFileEncoding;
}

export interface ClaimedJob {
  jobId: string;
  language: RunJobLanguage;
  protocolVersion: 2;
  files: RunFileDTO[];
  entryPath: string;
  timeoutMs: number;
  createdAt: number;
}

export type RunnerEvent =
  | { type: 'started'; startedAt?: number }
  | { type: 'chunk'; stream: 'stdout' | 'stderr'; chunk: string }
  | { type: 'visualization'; frame: VisualizationFramePayload }
  | { type: 'completed'; stdout?: string; stderr?: string; finishedAt?: number }
  | { type: 'failed'; error: string; stderr?: string; finishedAt?: number };
