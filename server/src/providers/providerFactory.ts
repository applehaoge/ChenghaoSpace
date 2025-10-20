import { OpenAIProvider } from './openaiProvider.js';
import { MockProvider } from './mockProvider.js';

export function getProvider(name?: string) {
  const p = (process.env.PROVIDER || name || 'openai').toLowerCase();
  if (p === 'mock') return new MockProvider();
  if (p === 'openai') return new OpenAIProvider(process.env.OPENAI_API_KEY || '', process.env.OPENAI_API_BASE || process.env.OPENAI_API_URL || undefined);
  // future: add bao bao, tongyi providers
  return new MockProvider();
}

// note: export default compatibility for compiled js
export default getProvider;