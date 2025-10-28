export interface LLMProvider {
  name: string;
  embed(text: string | string[]): Promise<number[][] | number[]>;
  chat(opts: { prompt: string; systemPrompt?: string; conversation?: any[] }): Promise<{ text: string; metadata?: any }>;
}