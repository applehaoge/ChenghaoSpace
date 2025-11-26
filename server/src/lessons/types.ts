// 课程模块类型定义，仅用于课程端（Lesson）运行与元数据管理
export type LessonLanguage = 'python';

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  language: LessonLanguage;
  activeVersionId: string;
}

export interface LessonVersion {
  id: string;
  lessonId: string;
  version: string;
  title: string;
  entryPath: string;
  rootDir: string;
}
