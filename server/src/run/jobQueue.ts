import { EventEmitter } from 'node:events';

const queue: string[] = [];
const queueEvents = new EventEmitter();

export const enqueueJobId = (jobId: string) => {
  queue.push(jobId);
  queueEvents.emit('updated');
};

export const claimNextJobId = (): string | null => {
  return queue.shift() ?? null;
};

export const waitForNextJobId = async (): Promise<string> => {
  const jobId = claimNextJobId();
  if (jobId) return jobId;
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
