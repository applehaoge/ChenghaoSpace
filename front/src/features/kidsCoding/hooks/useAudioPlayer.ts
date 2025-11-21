import { useCallback, useEffect, useRef } from 'react';
import type { AudioChunkDTO } from '@/features/kidsCoding/types/audio';

const MAX_INT16 = 32768;

const isAudioSupported = () => typeof AudioContext !== 'undefined';

export function useAudioPlayer() {
  const contextRef = useRef<AudioContext | null>(null);
  const nextStartRef = useRef(0);
  const activeSources = useRef<AudioBufferSourceNode[]>([]);

  const stop = useCallback(async () => {
    activeSources.current.forEach(source => {
      try {
        source.stop(0);
      } catch {
        // ignore
      }
    });
    activeSources.current = [];
    if (contextRef.current) {
      try {
        await contextRef.current.close();
      } catch {
        // ignore
      } finally {
        contextRef.current = null;
        nextStartRef.current = 0;
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      void stop();
    };
  }, [stop]);

  const ensureContext = () => {
    if (!isAudioSupported()) return null;
    if (!contextRef.current) {
      contextRef.current = new AudioContext();
      nextStartRef.current = contextRef.current.currentTime;
    }
    return contextRef.current;
  };

  const playChunk = useCallback(
    (chunk: AudioChunkDTO) => {
      const context = ensureContext();
      if (!context) return;

      const buffer = decodePcmChunk(context, chunk);
      if (!buffer) return;

      const startAt = Math.max(context.currentTime, nextStartRef.current);
      nextStartRef.current = startAt + buffer.duration;

      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.onended = () => {
        activeSources.current = activeSources.current.filter(item => item !== source);
      };
      try {
        source.start(startAt);
        void context.resume();
        activeSources.current.push(source);
      } catch (error) {
        console.error('播放音频片段失败', error);
      }
    },
    [ensureContext],
  );

  return {
    playChunk,
    reset: stop,
  };
}

function decodePcmChunk(context: AudioContext, chunk: AudioChunkDTO): AudioBuffer | null {
  const { data, channels, sampleRate, format } = chunk;
  if (!data || channels <= 0 || !Number.isFinite(sampleRate)) return null;
  if (format !== 'pcm_s16le') return null;

  let pcm: Int16Array;
  try {
    const binary = typeof atob === 'function' ? base64ToUint8(data) : Uint8Array.from(Buffer.from(data, 'base64'));
    pcm = new Int16Array(binary.buffer, binary.byteOffset, Math.floor(binary.byteLength / 2));
  } catch (error) {
    console.error('解码音频失败', error);
    return null;
  }

  const frameCount = Math.floor(pcm.length / channels);
  if (frameCount <= 0) return null;

  const buffer = context.createBuffer(channels, frameCount, sampleRate);
  for (let channel = 0; channel < channels; channel += 1) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i += 1) {
      const sampleIndex = i * channels + channel;
      channelData[i] = pcm[sampleIndex] / MAX_INT16;
    }
  }
  return buffer;
}

function base64ToUint8(source: string): Uint8Array {
  const binary = atob(source);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i);
  }
  return array;
}
