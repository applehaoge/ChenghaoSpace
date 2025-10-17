import { LLMProvider } from './baseProvider';
import fetch from 'node-fetch';

export class OpenAIProvider implements LLMProvider {
  name = 'openai';
  apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  async embed(text: string | string[]) {
    const texts = Array.isArray(text) ? text : [text];
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: texts })
    });
    const data = await res.json();
    const embeddings = data.data.map((d: any) => d.embedding);
    return embeddings.length === 1 ? embeddings[0] : embeddings;
  }
  async chat(opts: { prompt: string; systemPrompt?: string; conversation?: any[] }) {
    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: opts.systemPrompt || 'You are a helpful assistant.' },
        ...(opts.conversation || []),
        { role: 'user', content: opts.prompt }
      ]
    };
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    const text = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : JSON.stringify(data);
    return { text, metadata: { provider: this.name } };
  }
}