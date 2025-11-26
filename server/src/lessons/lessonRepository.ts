import path from 'node:path';
import { promises as fs } from 'node:fs';
import type { Lesson, LessonVersion } from './types.js';

// 课程资源根目录：默认 server_data/lessons，可通过 LESSON_ROOT_DIR 覆盖
export const LESSONS_ROOT_DIR =
  process.env.LESSON_ROOT_DIR && process.env.LESSON_ROOT_DIR.trim()
    ? path.resolve(process.cwd(), process.env.LESSON_ROOT_DIR.trim())
    : path.resolve(process.cwd(), 'server_data', 'lessons');

const lessons: Lesson[] = [
  {
    id: 'python_basic/L01_intro_pygame',
    title: 'Pygame 入门示例',
    description: '课程端示例，演示如何通过 runner 执行课程代码。',
    language: 'python',
    activeVersionId: 'v1',
  },
];

const lessonVersions: LessonVersion[] = lessons.map(lesson => ({
  id: `${lesson.id}@${lesson.activeVersionId}`,
  lessonId: lesson.id,
  version: lesson.activeVersionId,
  title: `${lesson.title} ${lesson.activeVersionId}`,
  entryPath: 'main.py',
  rootDir: path.join(LESSONS_ROOT_DIR, lesson.id, lesson.activeVersionId),
}));

const ensureDirExists = async (dir: string): Promise<boolean> => {
  try {
    await fs.access(dir);
    return true;
  } catch {
    return false;
  }
};

export const getLessonById = async (lessonId: string): Promise<Lesson | null> => {
  const found = lessons.find(item => item.id === lessonId);
  return found ?? null;
};

export const getActiveVersion = async (lessonId: string): Promise<LessonVersion | null> => {
  const lesson = lessons.find(item => item.id === lessonId);
  if (!lesson) return null;

  const version = lessonVersions.find(item => item.lessonId === lessonId && item.version === lesson.activeVersionId);
  if (!version) return null;

  const exists = await ensureDirExists(version.rootDir);
  if (!exists) {
    // 确保不存在的课程目录不会继续执行，减少误报
    return null;
  }

  return version;
};
