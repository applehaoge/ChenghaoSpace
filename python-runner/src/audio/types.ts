export interface AudioChunkPayload {
  type: 'audio';
  sampleRate: number;
  channels: number;
  format: 'pcm_s16le';
  data: string;
  timestamp?: number;
  seq?: number;
  durationMs?: number;
}
