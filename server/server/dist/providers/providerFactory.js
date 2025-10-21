import { OpenAIProvider } from './openaiProvider.js';
import { MockProvider } from './mockProvider.js';
import { DoubaoProvider } from './doubaoProvider.js';
export function getProvider(name) {
    const p = (process.env.PROVIDER || name || 'openai').toLowerCase();
    if (p === 'mock')
        return new MockProvider();
    if (p === 'openai')
        return new OpenAIProvider(process.env.OPENAI_API_KEY || '', process.env.OPENAI_API_BASE || process.env.OPENAI_API_URL || undefined);
    if (p === 'doubao')
        return new DoubaoProvider(process.env.DOUBAO_API_KEY || '', process.env.DOUBAO_API_BASE || undefined);
    // future: add bao bao, tongyi providers
    return new MockProvider();
}
// note: export default compatibility for compiled js
export default getProvider;
