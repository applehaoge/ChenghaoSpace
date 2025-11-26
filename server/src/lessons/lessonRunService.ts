import { randomUUID } from 'node:crypto';
import path, { posix as pathPosix } from 'node:path';
import { promises as fs } from 'node:fs';
import type { LessonVersion } from './types.js';
import type { RunFileDTO, RunJobDTO } from '../run/jobTypes.js';
import { sanitizeRunJobDTO } from '../run/runJobValidator.js';
import { createJobRecord } from '../run/jobStore.js';
import { enqueueJobId } from '../run/jobQueue.js';

const MAX_TIMEOUT_MS = Number(process.env.RUN_JOB_TIMEOUT_MS ?? 60000);

const clampTimeout = (input?: number) => {
  if (!input || Number.isNaN(input)) return MAX_TIMEOUT_MS;
  return Math.min(Math.max(1000, input), MAX_TIMEOUT_MS);
};

const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.bmp',
  '.wav',
  '.mp3',
  '.ogg',
  '.mp4',
  '.avi',
  '.pdf',
]);

const isBinaryFile = (filePath: string) => {
  const ext = path.extname(filePath).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
};

const toPosixRelativePath = (fullPath: string, rootDir: string) => {
  const relative = path.relative(rootDir, fullPath);
  const posixPath = relative.split(path.sep).join('/');
  const normalized = pathPosix.normalize(posixPath);
  if (!normalized || normalized === '.' || normalized.startsWith('..') || normalized.startsWith('/')) {
    // 防止课程目录意外向外泄露
    throw new Error(`Invalid lesson file path: ${fullPath}`);
  }
  return normalized;
};

const walkLessonFiles = async (rootDir: string): Promise<string[]> => {
  const results: string[] = [];
  const entries = await fs.readdir(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    // 避免跟随符号链接造成路径逃逸
    if (entry.isSymbolicLink()) continue;
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      const child = await walkLessonFiles(fullPath);
      results.push(...child);
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }

  return results;
};

const readLessonFile = async (fullPath: string, rootDir: string): Promise<RunFileDTO> => {
  const buffer = await fs.readFile(fullPath);
  const pathInLesson = toPosixRelativePath(fullPath, rootDir);
  if (isBinaryFile(fullPath)) {
    return {
      path: pathInLesson,
      content: buffer.toString('base64'),
      encoding: 'base64',
    };
  }
  return {
    path: pathInLesson,
    content: buffer.toString('utf8'),
    encoding: 'utf8',
  };
};

const buildRunJobDto = async (lessonVersion: LessonVersion): Promise<RunJobDTO> => {
  const filesOnDisk = await walkLessonFiles(lessonVersion.rootDir);
  const files: RunFileDTO[] = [];

  for (const fullPath of filesOnDisk) {
    const runFile = await readLessonFile(fullPath, lessonVersion.rootDir);
    files.push(runFile);
  }

  const normalizedEntry = pathPosix.normalize(lessonVersion.entryPath);
  if (!normalizedEntry || normalizedEntry.startsWith('..') || normalizedEntry.startsWith('/')) {
    throw new Error(`Invalid lesson entry path: ${lessonVersion.entryPath}`);
  }

  return {
    protocolVersion: 2,
    language: 'python',
    entryPath: normalizedEntry,
    files,
  };
};

export const createLessonRunJob = async (lessonVersion: LessonVersion): Promise<{ jobId: string }> => {
  const dto = await buildRunJobDto(lessonVersion);
  const sanitized = sanitizeRunJobDTO(dto);

  const jobId = randomUUID();
  const job = createJobRecord({
    id: jobId,
    timeoutMs: clampTimeout(undefined),
    createdAt: Date.now(),
    ...sanitized,
  });

  enqueueJobId(job.id);

  return { jobId: job.id };
};
