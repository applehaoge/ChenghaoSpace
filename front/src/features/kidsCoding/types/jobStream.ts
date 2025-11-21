import type { AudioChunkDTO } from './audio';
import type { InputEventDTO } from './input';
import type { RunJobResponse } from '../api/runClient';

export type JobStreamEvent =
  | { type: 'audio'; chunk: AudioChunkDTO }
  | { type: 'input'; input: InputEventDTO };

export interface JobStreamMessage {
  jobId: string;
  job?: RunJobResponse;
  event?: JobStreamEvent;
}
