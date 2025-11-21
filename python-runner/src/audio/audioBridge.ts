import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { watch } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import type { AudioChunkPayload } from './types.js';
import { KIDS_AUDIO_HELPER } from '../pythonHelpers/kidsAudioHelper.js';

type AudioHandler = (chunk: AudioChunkPayload) => void | Promise<void>;

const FILE_SUFFIX = '.json';

export interface AudioBridge {
  env: Record<string, string>;
  dispose: () => Promise<void>;
}

export async function createAudioBridge(workDir: string, onAudio: AudioHandler): Promise<AudioBridge> {
  const audioDir = join(workDir, 'audio');
  await mkdir(audioDir, { recursive: true });
  await writeKidsAudioHelper(workDir);

  let disposed = false;
  const pending = new Set<string>();

  const processFile = async (fileName: string) => {
    if (disposed) return;
    const filePath = join(audioDir, fileName);
    try {
      const buffer = await readFile(filePath, 'utf-8');
      const payload = JSON.parse(buffer) as AudioChunkPayload;
      if (payload?.type === 'audio') {
        await onAudio(payload);
      }
    } catch (error) {
      console.warn('[AudioBridge] Failed to read audio chunk', error);
    } finally {
      await rm(filePath, { force: true }).catch(() => {});
      pending.delete(fileName);
    }
  };

  const scheduleProcess = (fileName: string) => {
    if (pending.has(fileName)) return;
    pending.add(fileName);
    setTimeout(() => {
      void processFile(fileName);
    }, 10);
  };

  const watcher = watch(audioDir, { persistent: false }, (eventType, fileName) => {
    if (disposed || eventType !== 'rename' || !fileName?.endsWith(FILE_SUFFIX)) return;
    scheduleProcess(fileName);
  });

  const sweepExisting = async () => {
    try {
      const entries = await readdir(audioDir);
      entries.filter(name => name.endsWith(FILE_SUFFIX)).forEach(scheduleProcess);
    } catch {
      // ignore
    }
  };
  await sweepExisting();

  return {
    env: { KIDS_AUDIO_DIR: audioDir },
    dispose: async () => {
      disposed = true;
      watcher.close();
      if (pending.size > 0) {
        await delay(30);
      }
      await sweepExisting();
      await rm(audioDir, { recursive: true, force: true }).catch(() => {});
    },
  };
}

async function writeKidsAudioHelper(workDir: string) {
  const helperPath = join(workDir, 'kids_audio.py');
  await writeFile(helperPath, KIDS_AUDIO_HELPER, 'utf-8');
}
