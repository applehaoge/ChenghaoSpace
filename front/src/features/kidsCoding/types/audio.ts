export interface AudioChunkDTO {
  jobId: string;
  sampleRate: number;
  channels: number;
  format: 'pcm_s16le';
  data: string; // base64 encoded PCM
  timestamp?: number;
  seq?: number;
  durationMs?: number;
}
