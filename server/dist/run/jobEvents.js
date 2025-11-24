import { EventEmitter } from 'node:events';
const eventBus = new EventEmitter();
export const publishJobEvent = (jobId, event) => {
    eventBus.emit(jobId, event);
};
export const subscribeJobEvents = (jobId, listener) => {
    eventBus.on(jobId, listener);
    return () => eventBus.off(jobId, listener);
};
