import { EventEmitter } from 'node:events';
import type { AudioChunkDTO } from './jobTypes.js';

const eventBus = new EventEmitter();

export const publishJobEvent = (jobId: string, event: { type: 'audio'; chunk: AudioChunkDTO }) => {
  eventBus.emit(jobId, event);
};

export const subscribeJobEvents = (
  jobId: string,
  listener: (event: { type: 'audio'; chunk: AudioChunkDTO }) => void,
) => {
  eventBus.on(jobId, listener);
  return () => eventBus.off(jobId, listener);
};
