import Fastify from 'fastify';
import cors from 'fastify-cors';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({ logger: true });

fastify.register(cors, { origin: true });

// 简单内存文档存储（用于初期检索）
const documents: { id: string; text: string; embedding?: number[] }[] = [];

fastify.get('/health', async () => ({ ok: true }));

fastify.post('/api/seed', async (request, reply) => {
  const body = request.body as any;
  const items: { id: string; text: string }[] = body.items || [];
  items.forEach(it => documents.push({ id: it.id, text: it.text }));
  return { success: true, count: documents.length };
});

import { getProvider } from './providers/providerFactory';

const provider = getProvider();

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

const start = async () => {
  try {
    await fastify.listen({ port: 8000, host: '0.0.0.0' });
    console.log('Server running at http://localhost:8000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
