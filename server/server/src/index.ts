import Fastify from 'fastify';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const fastify = Fastify({ logger: true });

// Simple CORS handling without external plugin
fastify.addHook('onRequest', async (request, reply) => {
  // 添加 CORS 响应头
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 防御性处理：当请求使用 chunked Transfer-Encoding 或 Content-Length 非法时，删除 Content-Length
  // 避免 Fastify 在 body 长度与 Content-Length 不一致时报错 FST_ERR_CTP_INVALID_CONTENT_LENGTH
  try {
    const te = (request.headers['transfer-encoding'] || '').toString().toLowerCase();
    const cl = request.headers['content-length'];
    if (cl !== undefined) {
      const clNum = Number(cl);
      const clIsInvalid = Number.isNaN(clNum) || String(clNum) !== String(cl).trim();
      if ((te && te.includes('chunked')) || clIsInvalid) {
        delete request.headers['content-length'];
        const logger = request.log as any;
        logger?.warn?.('Removed invalid Content-Length header to avoid parsing error');
      }
    }
  } catch (err) {
    // 忽略处理错误，继续请求流程
  }
});

// Handle preflight OPTIONS explicitly to avoid interfering with body parsing
fastify.options('/*', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return reply.code(204).send();
});

// Add a robust JSON body parser to avoid Content-Length mismatch errors
fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, function (req, body, done) {
  try {
    const str = body.toString('utf8');
    const json = str ? JSON.parse(str) : {};
    done(null, json);
  } catch (err) {
    done(err instanceof Error ? err : new Error('Invalid JSON'));
  }
});

// 简单内存文档存储（用于初期检索）
const documents: { id: string; text: string; embedding?: number[] }[] = [];

fastify.get('/health', async () => ({ ok: true }));

fastify.post('/api/seed', async (request, reply) => {
  const body = request.body as any;
  const items: { id: string; text: string }[] = body.items || [];
  items.forEach(it => documents.push({ id: it.id, text: it.text }));
  return { success: true, count: documents.length };
});

import { getProvider } from './providers/providerFactory.js';

// Provide a local proxy-style passthrough endpoint to avoid relying on external routing.
// This proxy endpoint will accept OpenAI-compatible requests and forward them to the configured provider.
// It preserves Authorization header if present, otherwise uses process.env.OPENAI_API_KEY.
const provider = getProvider();


// OpenAI-compatible local proxy endpoints
import { OpenAIProvider } from './providers/openaiProvider.js';
fastify.post('/proxy/v1/chat/completions', async (request, reply) => {
  const body = request.body as any || {};
  // Support both messages-based and prompt-based requests
  const messages = body.messages || [];
  const prompt = body.prompt || (Array.isArray(messages) ? messages.map((m: any) => (typeof m === 'string' ? m : m.content)).join('\n') : '');
  const systemPrompt = (Array.isArray(messages) && messages.length && messages[0].role === 'system') ? messages[0].content : (body.system || 'You are a helpful assistant.');

  // Determine client key to present to upstream proxy/openai
  const authHeader = (request.headers['authorization'] || request.headers['Authorization']) as string | undefined;
  const xApiKey = (request.headers['x-api-key'] || request.headers['X-API-Key']) as string | undefined;
  let clientKey: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) clientKey = authHeader.replace(/^Bearer\s+/i, '').trim();
  else if (xApiKey) clientKey = xApiKey.trim();
  else clientKey = process.env.OPENAI_API_KEY;

  // Create a per-request provider that will use the client-supplied key when calling the upstream base URL
  const upstreamBase = process.env.OPENAI_API_BASE || process.env.OPENAI_API_URL || 'https://api.openai.com';
  const upstreamProvider = new OpenAIProvider(clientKey || '', upstreamBase);

  try {
    const res = await upstreamProvider.chat({ prompt, systemPrompt });
    return reply.send({ id: 'local-' + Date.now(), object: 'chat.completion', choices: [{ message: { role: 'assistant', content: res.text } }], metadata: res.metadata });
  } catch (err) {
    return reply.code(502).send({ error: 'provider failed', detail: String(err) });
  }
});

// Existing embed endpoint
fastify.post('/api/embed', async (request, reply) => {
  const body = request.body as any;
  const texts: string[] = body.texts || [];
  try {
    const embeddings = await provider.embed(texts);
    // 将 embeddings 写入 documents（按顺序匹配）
    const arr = Array.isArray(embeddings[0]) ? embeddings as number[][] : [embeddings as number[]];
    arr.forEach((v, i) => {
      if (documents[i]) documents[i].embedding = v as number[];
    });
    return { embeddings: arr };
  } catch (err) {
    // 回退到随机向量
    const fallback = texts.map(t => Array.from({ length: 8 }, () => Math.random()));
    fallback.forEach((v, i) => {
      if (documents[i]) documents[i].embedding = v;
    });
    return { embeddings: fallback, warning: 'provider.embed failed, used fallback' };
  }
});

fastify.post('/api/search', async (request, reply) => {
  const body = request.body as any;
  const query: string = body.query || '';
  const topK: number = body.topK || 3;
  // 简单基于包含关键字的检索
  const hits = documents
    .map(d => ({ id: d.id, text: d.text, score: d.text.includes(query) ? 1 : 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  return { hits };
});

fastify.get('/api/chat', async (request, reply) => {
  const query = (request.query && (request.query as any).query) || '';
  const topK: number = (request.query && (request.query as any).topK) ? Number((request.query as any).topK) : 3;
  // 检索（基于关键字匹配，后续替换为向量相似度）
  const searchRes = documents
    .map(d => ({ id: d.id, text: d.text, score: d.text.includes(query) ? 1 : 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  // 拼接上下文
  const context = searchRes.map(h => h.text).join('\n');
  const prompt = `根据以下上下文回答用户问题:\n${context}\n问题: ${query}`;

  try {
    const res = await provider.chat({ prompt, systemPrompt: 'You are a helpful assistant.' });
    const answer = res.text;
    return { answer, sources: searchRes, provider: res.metadata?.provider || 'unknown' };
  } catch (err) {
    const fallback = `（模拟回退）基于检索到的内容：${context.substring(0, 120)}... 对问题 "${query}" 的回答是：示例答案。`;
    return { answer: fallback, sources: searchRes, warning: 'provider.chat failed, used fallback' };
  }
});

fastify.post('/api/chat', async (request, reply) => {
  const body = request.body as any;
  const query: string = body.query || '';
  const topK: number = body.topK || 3;
  // 检索（基于关键字匹配，后续替换为向量相似度）
  const searchRes = documents
    .map(d => ({ id: d.id, text: d.text, score: d.text.includes(query) ? 1 : 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  // 拼接上下文
  const context = searchRes.map(h => h.text).join('\n');
  const prompt = `根据以下上下文回答用户问题:\n${context}\n问题: ${query}`;

  try {
    // 使用 provider.chat 调用真实 LLM
    const res = await provider.chat({ prompt, systemPrompt: 'You are a helpful assistant.' });
    const answer = res.text;
    return { answer, sources: searchRes, provider: res.metadata?.provider || 'unknown' };
  } catch (err) {
    // 回退到模拟回答，保证可用性
    const fallback = `（模拟回退）基于检索到的内容：${context.substring(0, 120)}... 对问题 "${query}" 的回答是：示例答案。`;
    return { answer: fallback, sources: searchRes, warning: 'provider.chat failed, used fallback' };
  }
});

// 新增原始 POST 接口，直接从 Node 原始请求流读取 body，绕过 Fastify 的 body 解析，以便在 Content-Length 不匹配时仍能接收请求
fastify.post('/api/chat-raw', async (request, reply) => {
  try {
    // 读取原始请求流
    const rawBuf = await new Promise<Buffer | null>((resolve, reject) => {
      const chunks: Buffer[] = [];
      request.raw.on('data', (chunk: Buffer) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))));
      request.raw.on('end', () => resolve(Buffer.concat(chunks)));
      request.raw.on('error', err => reject(err));
      // If no data event arrives and request already ended, resolve with empty buffer
    }).catch(() => null);

    let body: any = {};
    if (rawBuf) {
      const str = rawBuf.toString('utf8').trim();
      if (str) {
        try {
          body = JSON.parse(str);
        } catch (err) {
          return reply.code(400).send({ error: 'Invalid JSON in raw body' });
        }
      }
    }

    const query: string = body.query || '';
    const topK: number = body.topK || 3;
    // 简单检索（与 /api/chat 相同的逻辑）
    const searchRes = documents
      .map(d => ({ id: d.id, text: d.text, score: d.text.includes(query) ? 1 : 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    const context = searchRes.map(h => h.text).join('\n');
    const prompt = `根据以下上下文回答用户问题:\n${context}\n问题: ${query}`;

    try {
      const res = await provider.chat({ prompt, systemPrompt: 'You are a helpful assistant.' });
      const answer = res.text;
      return { answer, sources: searchRes, provider: res.metadata?.provider || 'unknown' };
    } catch (err) {
      const fallback = `（模拟回退）基于检索到的内容：${context.substring(0, 120)}... 对问题 "${query}" 的回答是：示例答案。`;
      return { answer: fallback, sources: searchRes, warning: 'provider.chat failed, used fallback' };
    }
  } catch (err) {
    // 捕获流读取等其他错误，返回 500
    const logger = request.log as any;
    logger?.error?.(err);
    return reply.code(500).send({ error: 'Failed to read raw body' });
  }
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 8000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server running at http://localhost:${port}`);
  } catch (err) {
    (fastify.log as any).error?.(err);
    process.exit(1);
  }
};

start();
