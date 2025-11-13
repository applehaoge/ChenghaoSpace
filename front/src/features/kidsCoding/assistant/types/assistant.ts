export type AssistantMediaType = 'image' | 'audio' | 'video' | 'document';

export interface AssistantMediaAsset {
  id: string;
  type: AssistantMediaType;
  title: string;
  url: string;
  thumbnail?: string;
  description?: string;
  duration?: number;
}

export interface TaskBrief {
  id: string;
  title: string;
  summary: string;
  highlights: string[];
  assets: AssistantMediaAsset[];
}

export interface LessonResource {
  id: string;
  type: AssistantMediaType;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  tags?: string[];
  duration?: number;
}

export interface PracticeItem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  link: string;
  tags?: string[];
}

export interface KnowledgeNote {
  id: string;
  title: string;
  summary: string;
  keywords: string[];
  content: string;
  previousLesson?: boolean;
}

export interface AssistantResourceBundle {
  tasks: TaskBrief[];
  resources: LessonResource[];
  practice: PracticeItem[];
  knowledge: KnowledgeNote[];
}
