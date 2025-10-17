import { OpenAIProvider } from './openaiProvider';
import { MockProvider } from './mockProvider';

export function getProvider(name?: string) {
  const p = (process.env.PROVIDER || name || 'openai').toLowerCase();
  if (p === 'mock') return new MockProvider();
  if (p === 'openai') return new OpenAIProvider(process.env.OPENAI_API_KEY || '');
  // future: add bao bao, tongyi providers
  return new MockProvider();
}