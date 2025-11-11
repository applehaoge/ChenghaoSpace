import { config } from './config.js';
import type { ClaimedJob, RunnerEvent } from './types.js';

const headersForRunner = () => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.accessToken) {
    headers.Authorization = `Bearer ${config.accessToken}`;
  }
  return headers;
};

export async function claimJob(): Promise<ClaimedJob | null> {
  const res = await fetch(`${config.serverUrl}/api/runner/jobs/claim`, {
    method: 'POST',
    headers: headersForRunner(),
  });

  if (res.status === 204) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to claim job: ${res.status} ${text}`);
  }
  const data = (await res.json()) as ClaimedJob;
  return data;
}

export async function sendRunnerEvent(jobId: string, event: RunnerEvent): Promise<void> {
  const res = await fetch(`${config.serverUrl}/api/runner/jobs/${jobId}/events`, {
    method: 'POST',
    headers: headersForRunner(),
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to send runner event: ${res.status} ${text}`);
  }
}
