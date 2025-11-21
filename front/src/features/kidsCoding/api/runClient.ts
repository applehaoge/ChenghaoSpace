import type { RunJobDTO } from '@/features/kidsCoding/types/run';
import type { VisualizationSnapshot } from '@/features/kidsCoding/types/visualization';
import type { JobStreamEvent, JobStreamMessage } from '@/features/kidsCoding/types/jobStream';

const API_BASE = import.meta.env.VITE_RUNNER_API_BASE || 'http://localhost:8000';

const resolveApiUrl = (path: string) => new URL(path, API_BASE).toString();

const resolveWsUrl = (path: string) => {
  const url = new URL(path, API_BASE);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
};

export type RunJobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled' | 'idle';

export interface RunJobResponse {
  jobId: string;
  status: RunJobStatus;
  stdout?: string;
  stderr?: string;
  error?: string;
  createdAt?: number;
  startedAt?: number;
  finishedAt?: number;
  visualization?: VisualizationSnapshot;
}

export async function submitRunJob(payload: RunJobDTO) {
  const res = await fetch(resolveApiUrl('/api/run'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || '提交运行任务失败');
  }

  return (await res.json()) as { jobId: string; status: RunJobStatus };
}

export async function fetchRunJob(jobId: string) {
  const res = await fetch(resolveApiUrl(`/api/run/${jobId}`));
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || '查询任务状态失败');
  }
  return (await res.json()) as RunJobResponse;
}

export const openRunJobStream = (
  jobId: string,
  handlers: {
    onMessage?: (job: RunJobResponse) => void;
    onEvent?: (event: JobStreamEvent) => void;
    onError?: (event: Event) => void;
    onClose?: () => void;
  },
) => {
  const ws = new WebSocket(resolveWsUrl(`/api/run/${jobId}/stream`));

  ws.onmessage = event => {
    try {
      const parsed = JSON.parse(event.data as string) as JobStreamMessage;
      if (parsed.event) handlers.onEvent?.(parsed.event);
      if (parsed.job) handlers.onMessage?.({ ...parsed.job, jobId: parsed.job.jobId ?? jobId });
    } catch (error) {
      console.error('解析任务流数据失败', error);
    }
  };

  ws.onerror = event => {
    handlers.onError?.(event);
  };

  ws.onclose = () => {
    handlers.onClose?.();
  };

  return ws;
};
