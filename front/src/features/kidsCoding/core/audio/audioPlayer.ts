import type { AudioChunkDTO } from '@/features/kidsCoding/types/audio';

const DEFAULT_PAD_SECONDS = 0.05;

export class AudioPlayer {
  private context: AudioContext;
  private scheduledTime = 0;
  private disposed = false;

  constructor(context?: AudioContext) {
    this.context = context ?? new AudioContext();
  }

  async enqueue(chunk: AudioChunkDTO) {
    if (this.disposed) return;
    if (chunk.format !== 'pcm_s16le') return;
    await this.ensureContextReady();
    const pcm = decodeBase64(chunk.data);
    if (!pcm.byteLength || chunk.channels <= 0 || chunk.sampleRate <= 0) return;
    const int16 = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.byteLength / 2));
    const frameCount = Math.floor(int16.length / chunk.channels);
    if (frameCount <= 0) return;

    const buffer = this.context.createBuffer(chunk.channels, frameCount, chunk.sampleRate);
    for (let ch = 0; ch < chunk.channels; ch += 1) {
      const channelData = buffer.getChannelData(ch);
      let writeIndex = 0;
      for (let i = ch; i < int16.length && writeIndex < frameCount; i += chunk.channels, writeIndex += 1) {
        channelData[writeIndex] = int16[i] / 32768;
      }
    }

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    const baseTime = Math.max(this.scheduledTime, this.context.currentTime + DEFAULT_PAD_SECONDS);
    const startTime = chunk.timestamp ? Math.max(baseTime, chunk.timestamp / 1000) : baseTime;
    source.start(startTime);
    this.scheduledTime = startTime + buffer.duration;
  }

  async dispose() {
    this.disposed = true;
    await this.context.close().catch(() => {});
  }

  private async ensureContextReady() {
    if (this.context.state === 'suspended') {
      try {
        await this.context.resume();
      } catch {
        // ignore resume failure
      }
    }
  }
}

function decodeBase64(source: string): Uint8Array {
  if (typeof atob === 'function') {
    const binary = atob(source);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      out[i] = binary.charCodeAt(i);
    }
    return out;
  }
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(source, 'base64'));
  }
  return new Uint8Array();
}
