export type MediaKind = 'image' | 'video' | 'audio';

export interface HeroShowcase {
  title: string;
  subtitle: string;
  description: string;
  videoUrl: string;
  posterUrl: string;
  soundtrackUrl: string;
  tasks: Array<{ title: string; detail: string; badge: string }>;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  accent: string;
  mediaType: MediaKind;
}

export type PracticeQuestionType = 'choice' | 'fill' | 'match';

export interface PracticeQuestionBase {
  id: string;
  title: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: PracticeQuestionType;
}

export interface ChoiceQuestion extends PracticeQuestionBase {
  type: 'choice';
  prompt: string;
  options: string[];
  answerIndex: number;
}

export interface FillQuestion extends PracticeQuestionBase {
  type: 'fill';
  prompt: string;
  blanks: string[];
}

export interface MatchQuestion extends PracticeQuestionBase {
  type: 'match';
  leftColumn: string[];
  rightColumn: string[];
}

export type PracticeQuestion = ChoiceQuestion | FillQuestion | MatchQuestion;

export interface ProgrammingAssistantContent {
  hero: HeroShowcase;
  gallery: GalleryItem[];
  practice: PracticeQuestion[];
  highlights: string[];
  knowledgePoints: KnowledgePoint[];
}

export interface KnowledgePoint {
  id: string;
  title: string;
  summary: string;
  mediaUrl: string;
  mediaType: MediaKind;
  tips: string[];
}
