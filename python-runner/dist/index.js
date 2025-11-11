import { claimJob } from './apiClient.js';
import { executeJob } from './executor.js';
import { config } from './config.js';
const activeJobs = new Set();
let stopped = false;
process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    stopped = true;
});
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    stopped = true;
});
async function workerLoop() {
    while (!stopped) {
        if (activeJobs.size >= config.maxConcurrency) {
            await Promise.race(activeJobs);
            continue;
        }
        const job = await claimJob().catch(err => {
            console.error('Claim job failed:', err);
            return null;
        });
        if (!job) {
            await delay(config.pollIntervalMs);
            continue;
        }
        const runPromise = executeJob(job)
            .catch(err => {
            console.error(`Job ${job.jobId} failed:`, err);
        })
            .finally(() => {
            activeJobs.delete(runPromise);
        });
        activeJobs.add(runPromise);
    }
    await Promise.allSettled(activeJobs);
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
workerLoop().catch(err => {
    console.error('Runner crashed:', err);
    process.exit(1);
});
