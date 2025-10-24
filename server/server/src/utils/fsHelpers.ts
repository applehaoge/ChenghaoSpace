import { promises as fs } from 'node:fs';
import path from 'node:path';

export const ensureDirectory = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

export const resolveWithinCwd = (...segments: string[]) => {
  return path.resolve(process.cwd(), ...segments);
};
