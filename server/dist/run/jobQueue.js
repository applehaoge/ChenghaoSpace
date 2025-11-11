import { EventEmitter } from 'node:events';
const queue = [];
const queueEvents = new EventEmitter();
export const enqueueJobId = (jobId) => {
    queue.push(jobId);
    queueEvents.emit('updated');
};
export const claimNextJobId = () => {
    return queue.shift() ?? null;
};
export const waitForNextJobId = async () => {
    const jobId = claimNextJobId();
    if (jobId)
        return jobId;
    return new Promise(resolve => {
        const onUpdate = () => {
            const claimed = claimNextJobId();
            if (claimed) {
                queueEvents.off('updated', onUpdate);
                resolve(claimed);
            }
        };
        queueEvents.on('updated', onUpdate);
    });
};
export const getQueueSize = () => queue.length;
