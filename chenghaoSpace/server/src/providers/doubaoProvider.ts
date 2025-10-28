import { LLMProvider } from './baseProvider';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

type DoubaoChatOptions = {
  prompt: string;
  systemPrompt?: string;
  conversation?: Array<{ role: string; content: string }>;
};

const DEFAULT_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';
const DEFAULT_CHAT_MODEL = 'doubao-seed-1-6-flash';
const DEFAULT_EMBED_MODEL = 'doubao-embedding-v1';

function sanitiseBaseUrl(url?: string) {
  if (!url) return DEFAULT_BASE_URL;
  return url.replace(/\s+/g, '').replace(/\/+$/, '') || DEFAULT_BASE_URL;
}

export class DoubaoProvider implements LLMProvider {
  name = 'doubao';
  private chatModel: string;
  private embedModel: string;
  private baseUrl: string;

  constructor(private apiKey: string, baseUrl?: string, chatModel?: string, embedModel?: string) {
    this.baseUrl = sanitiseBaseUrl(baseUrl || process.env.DOUBAO_API_BASE);
    this.chatModel = (chatModel || process.env.DOUBAO_CHAT_MODEL || '').trim() || DEFAULT_CHAT_MODEL;
    this.embedModel = (embedModel || process.env.DOUBAO_EMBED_MODEL || '').trim() || DEFAULT_EMBED_MODEL;
  }

  private buildAgent() {
    const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    return proxy ? new HttpsProxyAgent(proxy) : undefined;
  }

  private get headers() {
    if (!this.apiKey) {
      throw new Error('Missing DOUBAO_API_KEY');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  async embed(text: string | string[]) {
    const texts = Array.isArray(text) ? text : [text];
    const agent = this.buildAgent();
    const url = `${this.baseUrl}/embeddings`;
    const payload = {
      model: this.embedModel,
      input: {
        texts,
      },
      texts,
    };

    const res = await fetch(url, {
      method: 'POST',
      agent,
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Doubao embeddings failed: ${res.status} ${errText}`);
    }

    const data: any = await res.json();
    const vectors: number[][] = (data?.data || data?.output || data?.embeddings || []).map((item: any) => {
      if (Array.isArray(item?.embedding)) return item.embedding;
      if (Array.isArray(item?.vector)) return item.vector;
      if (Array.isArray(item)) return item;
      if (Array.isArray(item?.data)) return item.data;
      return [];
    });

    if (!vectors.length || vectors.some(v => !Array.isArray(v) || !v.length)) {
      throw new Error('Doubao embeddings response missing vectors');
    }

    return Array.isArray(text) ? vectors : vectors[0];
  }

  async chat(opts: DoubaoChatOptions) {
    const agent = this.buildAgent();
    const url = `${this.baseUrl}/chat/completions`;
    const messages = [
      opts.systemPrompt ? { role: 'system', content: opts.systemPrompt } : undefined,
      ...(opts.conversation || []).filter(Boolean),
      { role: 'user', content: opts.prompt },
    ].filter(Boolean);

    const payload: any = {
      model: this.chatModel,
      input: { messages },
      messages,
      stream: false,
    };

    const temperature = process.env.DOUBAO_TEMPERATURE ? Number(process.env.DOUBAO_TEMPERATURE) : undefined;
    const maxTokens = process.env.DOUBAO_MAX_OUTPUT_TOKENS ? Number(process.env.DOUBAO_MAX_OUTPUT_TOKENS) : undefined;
    const topP = process.env.DOUBAO_TOP_P ? Number(process.env.DOUBAO_TOP_P) : undefined;

    const parameters: Record<string, number> = {};
    if (temperature !== undefined && !Number.isNaN(temperature) && temperature >= 0) parameters.temperature = temperature;
    if (maxTokens !== undefined && !Number.isNaN(maxTokens) && maxTokens > 0) parameters.max_output_tokens = maxTokens;
    if (topP !== undefined && !Number.isNaN(topP) && topP > 0) parameters.top_p = topP;
    if (Object.keys(parameters).length > 0) {
      payload.parameters = parameters;
    }

    const res = await fetch(url, {
      method: 'POST',
      agent,
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Doubao chat failed: ${res.status} ${errText}`);
    }

    const data: any = await res.json();
    const choice = data?.choices?.[0] || data?.output?.choices?.[0];
    const message = choice?.message || choice?.messages?.[0];
    const content = Array.isArray(message?.content)
      ? message.content.map((c: any) => (typeof c === 'string' ? c : c?.text || '')).join('')
      : message?.content || message?.text || '';

    if (!content) {
      throw new Error('Doubao chat response missing content');
    }

    return {
      text: content,
      metadata: {
        provider: this.name,
        raw: {
          id: data?.id,
          usage: data?.usage || data?.output?.usage,
        },
      },
    };
  }
}

export default DoubaoProvider;
