import { config } from './config.js';
const headersForRunner = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (config.accessToken) {
        headers.Authorization = `Bearer ${config.accessToken}`;
    }
    return headers;
};
export async function claimJob() {
    const res = await fetch(`${config.serverUrl}/api/runner/jobs/claim`, {
        method: 'POST',
        headers: headersForRunner(),
    });
    if (res.status === 204)
        return null;
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to claim job: ${res.status} ${text}`);
    }
    const data = (await res.json());
    return data;
}
export async function sendRunnerEvent(jobId, event) {
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
