import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchRunJob, openRunJobStream, submitRunJob, type RunJobResponse, type RunJobStatus } from '@/features/kidsCoding/api/runClient';
import type { RunJobDTO } from '@/features/kidsCoding/types/run';
import type { VisualizationFrame } from '@/features/kidsCoding/types/visualization';

export interface RunConsoleState {
  jobId?: string;
  status: RunJobStatus;
  stdout: string;
  stderr: string;
  error?: string;
  createdAt?: number;
  startedAt?: number;
  finishedAt?: number;
  visualizationFrame?: VisualizationFrame;
}

const initialState: RunConsoleState = {
  status: 'idle',
  stdout: '',
  stderr: '',
};

const DONE_STATUSES: RunJobStatus[] = ['succeeded', 'failed', 'cancelled'];

export function useRunJob() {
  const [state, setState] = useState<RunConsoleState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const jobIdRef = useRef<string | null>(null);
  const latestStatusRef = useRef<RunJobStatus>('idle');

  const cleanupConnections = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    cleanupConnections();
    setState(initialState);
    jobIdRef.current = null;
    latestStatusRef.current = 'idle';
  }, [cleanupConnections]);

  const startPolling = useCallback((jobId: string) => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const job = await fetchRunJob(jobId);
        setState(convertJob(job));
        latestStatusRef.current = job.status;
        if (DONE_STATUSES.includes(job.status)) {
          cleanupConnections();
        }
      } catch (error) {
        console.error('轮询任务失败', error);
      }
    }, 1500);
  }, [cleanupConnections]);

  const runCode = useCallback(
    async (payload: RunJobDTO) => {
      cleanupConnections();
      setIsSubmitting(true);
      try {
        const { jobId, status } = await submitRunJob(payload);
        jobIdRef.current = jobId;
        setState({
          jobId,
          status,
          stdout: '',
          stderr: '',
        });
        wsRef.current = openRunJobStream(
          jobId,
          {
            onMessage: job => {
              setState(convertJob(job));
              latestStatusRef.current = job.status;
              if (DONE_STATUSES.includes(job.status)) {
                cleanupConnections();
              }
            },
            onError: () => {
              startPolling(jobId);
            },
            onClose: () => {
              const latest = jobIdRef.current;
              if (
                latest &&
                !pollRef.current &&
                !DONE_STATUSES.includes(latestStatusRef.current)
              ) {
                startPolling(latest);
              }
            },
          },
        );
      } catch (error) {
        console.error('提交运行任务失败', error);
        setState(prev => ({
          ...prev,
          status: 'failed',
          error: error instanceof Error ? error.message : '提交运行任务失败',
        }));
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [cleanupConnections, startPolling],
  );

  useEffect(() => {
    latestStatusRef.current = state.status;
  }, [state.status]);

  useEffect(() => () => cleanupConnections(), [cleanupConnections]);

  const isBusy = useMemo(
    () => isSubmitting || ['queued', 'running'].includes(state.status),
    [isSubmitting, state.status],
  );

  return {
    runState: state,
    runCode,
    resetRun: stop,
    isRunning: isBusy,
  };
}

const convertJob = (job: RunJobResponse): RunConsoleState => ({
  jobId: job.jobId,
  status: job.status,
  stdout: job.stdout ?? '',
  stderr: job.stderr ?? '',
  error: job.error,
  createdAt: job.createdAt,
  startedAt: job.startedAt,
  finishedAt: job.finishedAt,
  visualizationFrame: job.visualization?.latestFrame,
});
