import dotenv from 'dotenv';
dotenv.config();
const env = process.env;
export const config = {
    serverUrl: env.RUNNER_SERVER_URL || 'http://127.0.0.1:8000',
    pollIntervalMs: Number(env.RUNNER_POLL_INTERVAL_MS ?? '1500'),
    accessToken: env.RUNNER_ACCESS_TOKEN || undefined,
    maxConcurrency: Number(env.RUNNER_MAX_CONCURRENCY ?? '1'),
    pythonBinary: env.RUNNER_PYTHON_BIN || 'python',
};
if (!Number.isFinite(config.pollIntervalMs) || config.pollIntervalMs < 200) {
    config.pollIntervalMs = 500;
}
if (!Number.isFinite(config.maxConcurrency) || config.maxConcurrency < 1) {
    config.maxConcurrency = 1;
}
