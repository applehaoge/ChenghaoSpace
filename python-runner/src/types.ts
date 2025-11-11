export type RunJobLanguage = 'python';

export interface ClaimedJob {
  jobId: string;
  language: RunJobLanguage;
  code: string;
  stdin?: string;
  timeoutMs: number;
  createdAt: number;
}

export type RunnerEvent =
  | { type: 'started'; startedAt?: number }
  | { type: 'chunk'; stream: 'stdout' | 'stderr'; chunk: string }
  | { type: 'completed'; stdout?: string; stderr?: string; visualization?: unknown; finishedAt?: number }
  | { type: 'failed'; error: string; stderr?: string; finishedAt?: number };
