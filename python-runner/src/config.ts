import dotenv from 'dotenv';

dotenv.config();

const env = process.env;

const defaultPythonBinary = process.platform === 'win32' ? 'python' : 'python3';

export const config = {
  serverUrl: env.RUNNER_SERVER_URL || 'http://127.0.0.1:8000',
  pollIntervalMs: Number(env.RUNNER_POLL_INTERVAL_MS ?? '5000'),
  accessToken: env.RUNNER_ACCESS_TOKEN || undefined,
  maxConcurrency: Number(env.RUNNER_MAX_CONCURRENCY ?? '1'),
  pythonBinary: env.RUNNER_PYTHON_BIN || defaultPythonBinary,
};

if (!Number.isFinite(config.pollIntervalMs) || config.pollIntervalMs < 200) {
  config.pollIntervalMs = 500;
}

if (!Number.isFinite(config.maxConcurrency) || config.maxConcurrency < 1) {
  config.maxConcurrency = 1;
}
