import { LLMProvider } from './baseProvider';

export class MockProvider implements LLMProvider {
  name = 'mock';
  async embed(text: string | string[]) {
    if (Array.isArray(text)) return text.map(() => Array.from({ length: 8 }, () => Math.random()));
    return Array.from({ length: 8 }, () => Math.random());
  }
  async chat(opts: { prompt: string; systemPrompt?: string; conversation?: any[] }) {
    const text = `（模拟Provider）根据 prompt: ${opts.prompt.substring(0, 120)}... 返回示例回答。`;
    return { text, metadata: { provider: this.name } };
  }
}