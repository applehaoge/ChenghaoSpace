import { randomUUID } from 'node:crypto';
import { mkdir, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import type { InputEventDTO } from './types.js';

const FILE_SUFFIX = '.json';

export interface InputBridge {
  env: Record<string, string>;
  handleInput: (event: InputEventDTO) => Promise<void>;
  dispose: () => Promise<void>;
}

export async function createInputBridge(workDir: string): Promise<InputBridge> {
  const inputDir = join(workDir, 'input');
  await mkdir(inputDir, { recursive: true });

  const writeEvent = async (event: InputEventDTO) => {
    const payload = JSON.stringify({ type: 'input', input: event });
    const tmpPath = join(inputDir, `${Date.now()}-${randomUUID()}.json.tmp`);
    const finalPath = tmpPath.slice(0, -4);
    await writeFile(tmpPath, payload, 'utf-8');
    await rm(finalPath, { force: true }).catch(() => {});
    await rename(tmpPath, finalPath).catch(async () => {
      // fallback: best-effort write if rename fails on some FS
      await writeFile(finalPath, payload, 'utf-8');
      await rm(tmpPath, { force: true }).catch(() => {});
    });
  };

  const purgeExisting = async () => {
    try {
      const entries = await readdir(inputDir);
      await Promise.all(entries.filter(name => name.endsWith(FILE_SUFFIX)).map(name => rm(join(inputDir, name), { force: true })));
    } catch {
      // ignore cleanup errors
    }
  };

  return {
    env: { KIDS_INPUT_DIR: inputDir },
    handleInput: writeEvent,
    dispose: async () => {
      await purgeExisting();
      // allow python侧读取中的文件句柄自然结束
      await delay(20);
      await rm(inputDir, { recursive: true, force: true }).catch(() => {});
    },
  };
}
