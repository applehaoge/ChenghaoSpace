export type ResultFocus = 'visualization' | 'ai';

export interface AiChatMessage {
  id: number;
  text: string;
  isAI: boolean;
}

export interface MissionContent {
  title: string;
  story: string;
  objectives: string[];
  hints: string[];
}
