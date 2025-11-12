import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { watch } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { KIDS_CAPTURE_HELPER } from '../pythonHelpers/kidsCaptureHelper.js';
import type { VisualizationFramePayload } from './types.js';

type FrameHandler = (frame: VisualizationFramePayload) => void | Promise<void>;

const FILE_SUFFIX = '.json';

export interface VisualizationBridge {
  env: Record<string, string>;
  dispose: () => Promise<void>;
}

export async function createVisualizationBridge(
  workDir: string,
  onFrame: FrameHandler,
): Promise<VisualizationBridge> {
  const vizDir = join(workDir, 'viz');
  await mkdir(vizDir, { recursive: true });
  await writeKidsCaptureHelper(workDir);

  let disposed = false;
  const pending = new Set<string>();

  const processFile = async (fileName: string) => {
    if (disposed) return;
    const filePath = join(vizDir, fileName);
    try {
      const buffer = await readFile(filePath, 'utf-8');
      const payload = JSON.parse(buffer) as VisualizationFramePayload;
      if (payload?.type === 'frame') {
        await onFrame(payload);
      }
    } catch (error) {
      console.warn('[VisualizationBridge] Failed to read frame', error);
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
    }, 25);
  };

  const watcher = watch(vizDir, { persistent: false }, (eventType, fileName) => {
    if (disposed || eventType !== 'rename' || !fileName?.endsWith(FILE_SUFFIX)) return;
    scheduleProcess(fileName);
  });

  const sweepExisting = async () => {
    try {
      const entries = await readdir(vizDir);
      entries.filter(name => name.endsWith(FILE_SUFFIX)).forEach(scheduleProcess);
    } catch {
      // ignore
    }
  };
  await sweepExisting();

  return {
    env: { KIDS_VIZ_DIR: vizDir },
    dispose: async () => {
      disposed = true;
      watcher.close();
      // allow pending frames to flush
      if (pending.size > 0) {
        await delay(50);
      }
      await sweepExisting();
      await rm(vizDir, { recursive: true, force: true }).catch(() => {});
    },
  };
}

async function writeKidsCaptureHelper(workDir: string) {
  const helperPath = join(workDir, 'kids_capture.py');
  await writeFile(helperPath, KIDS_CAPTURE_HELPER, 'utf-8');
}
