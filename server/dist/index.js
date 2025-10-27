import Fastify from 'fastify';
import dotenv from 'dotenv';
import multipart from '@fastify/multipart';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { promises as fs } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { registerUpload } from './storage/uploadRegistry.js';
dotenv.config();
const fastify = Fastify({ logger: true });
const uploadLimitMb = Number(process.env.UPLOAD_MAX_SIZE_MB ?? '25');
const maxUploadBytes = Number.isFinite(uploadLimitMb) && uploadLimitMb > 0 ? uploadLimitMb * 1024 * 1024 : 25 * 1024 * 1024;
fastify.register(multipart, {
    limits: {
        fileSize: maxUploadBytes,
        files: 10,
    },
});
const resolveUploadDirectory = () => {
    const customDir = process.env.UPLOAD_DIR;
    if (!customDir) {
        return path.resolve(process.cwd(), 'server_data', 'uploads');
    }
    return path.isAbsolute(customDir) ? customDir : path.resolve(process.cwd(), customDir);
};
const uploadDirectory = resolveUploadDirectory();
const ensureDirectoryExists = async (dir) => {
    await fs.mkdir(dir, { recursive: true });
};
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
                const logger = request.log;
                logger?.warn?.('Removed invalid Content-Length header to avoid parsing error');
            }
        }
    }
    catch (err) {
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
    }
    catch (err) {
        done(err instanceof Error ? err : new Error('Invalid JSON'));
    }
});
// 简单内存文档存储（用于初期检索）
const documents = [];
const keywordSearch = (query, topK = 3) => {
    if (!query)
        return [];
    return documents
        .map(d => ({ id: d.id, text: d.text, score: d.text && query ? (d.text.includes(query) ? 1 : 0) : 0 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
};
const buildDocumentContext = (hits) => {
    if (!hits.length)
        return '';
    return hits
        .map((hit, index) => `资料${index + 1}：${hit.text}`)
        .join('\n\n');
};
const formatHistory = (history) => history.map(msg => `${msg.role === 'user' ? '用户' : '助手'}：${msg.content}`).join('\n');
const buildPromptFromMemory = (memoryContext, docContext, userMessage) => {
    const sections = [
        '你是一位专业且可靠的中文 AI 助手，请结合记忆与提供的参考资料回答用户问题。',
    ];
    if (memoryContext.summary) {
        sections.push(`会话摘要：\n${memoryContext.summary}`);
    }
    if (memoryContext.relevantFacts.length) {
        sections.push(`相关长期记忆：\n${memoryContext.relevantFacts.map((fact, idx) => `${idx + 1}. ${fact}`).join('\n')}`);
    }
    if (docContext) {
        sections.push(`参考资料：\n${docContext}`);
    }
    if (memoryContext.recentHistory.length) {
        sections.push(`最近对话：\n${formatHistory(memoryContext.recentHistory)}`);
    }
    sections.push(`用户当前问题：\n${userMessage}`);
    return sections.join('\n\n');
};
const processChatRequest = async (body = {}, request) => {
    const taskType = body.taskType || 'general';
    const sessionId = body.sessionId || body.conversationId || `session-${Date.now()}`;
    const topK = Number(body.topK || 3);
    const rawQuery = typeof body.query === 'string' ? body.query : '';
    const userMessage = (body.userMessage || '').toString().trim() || rawQuery;
    if (!userMessage) {
        return { status: 400, payload: { error: '缺少用户输入' } };
    }
    if (taskType === '聊天') {
        const searchRes = keywordSearch(userMessage, topK);
        const docContext = buildDocumentContext(searchRes);
        const memoryContext = await memoryManager.prepareContext(sessionId, userMessage);
        const prompt = buildPromptFromMemory(memoryContext, docContext, userMessage);
        try {
            const res = await provider.chat({ prompt, systemPrompt: 'You are a helpful assistant.' });
            const answer = res.text;
            const memoryMeta = await memoryManager.recordInteraction(sessionId, userMessage, answer);
            return {
                status: 200,
                payload: {
                    answer,
                    sources: searchRes,
                    provider: res.metadata?.provider || 'unknown',
                    memory: {
                        sessionId,
                        summary: memoryContext.summary,
                        factsUsed: memoryContext.relevantFacts,
                        recentCount: memoryContext.recentHistory.length,
                        totalMessages: memoryMeta.totalMessages,
                    },
                },
            };
        }
        catch (err) {
            request?.log?.error?.(err);
            const fallbackContextParts = [];
            if (docContext)
                fallbackContextParts.push(docContext);
            if (memoryContext.summary)
                fallbackContextParts.push(memoryContext.summary);
            if (memoryContext.relevantFacts.length)
                fallbackContextParts.push(memoryContext.relevantFacts.join('；'));
            const fallbackBasis = fallbackContextParts.join(' / ') || '暂无有效记忆';
            const fallback = `（模拟回退）基于记忆与资料：${fallbackBasis.substring(0, 120)}... 对问题 "${userMessage}" 的回答是：示例答案。`;
            return {
                status: 200,
                payload: { answer: fallback, sources: searchRes, warning: 'provider.chat failed, used fallback', memory: { sessionId } },
            };
        }
    }
    const query = rawQuery || userMessage;
    const searchRes = keywordSearch(query, topK);
    const context = buildDocumentContext(searchRes);
    const prompt = `根据以下上下文回答用户问题：\n${context}\n\n问题: ${query}`;
    try {
        const res = await provider.chat({ prompt, systemPrompt: 'You are a helpful assistant.' });
        const answer = res.text;
        return { status: 200, payload: { answer, sources: searchRes, provider: res.metadata?.provider || 'unknown' } };
    }
    catch (err) {
        const fallback = `（模拟回退）基于检索到的内容：${context.substring(0, 120)}... 对问题 "${query}" 的回答是：示例答案。`;
        return { status: 200, payload: { answer: fallback, sources: searchRes, warning: 'provider.chat failed, used fallback' } };
    }
};
fastify.get('/health', async () => ({ ok: true }));
fastify.post('/api/seed', async (request, reply) => {
    const body = request.body;
    const items = body.items || [];
    items.forEach(it => documents.push({ id: it.id, text: it.text }));
    return { success: true, count: documents.length };
});
import { getProvider } from './providers/providerFactory.js';
import { ConversationMemoryManager } from './memory/conversationMemory.js';
import { FileMemoryStore } from './memory/storage/fileMemoryStore.js';
// Provide a local proxy-style passthrough endpoint to avoid relying on external routing.
// This proxy endpoint will accept OpenAI-compatible requests and forward them to the configured provider.
// It preserves Authorization header if present, otherwise uses process.env.OPENAI_API_KEY.
const provider = getProvider();
const toNumber = (value, fallback) => {
    const parsed = typeof value === 'string' ? Number(value) : Number(value ?? NaN);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const memoryStoreDir = process.env.MEMORY_STORE_DIR || path.resolve(process.cwd(), 'server_data', 'memory');
const memoryStore = new FileMemoryStore({ directory: memoryStoreDir });
const memoryManager = new ConversationMemoryManager(provider, {
    maxHistoryMessages: toNumber(process.env.MEMORY_MAX_HISTORY, 8),
    maxStoredVectors: toNumber(process.env.MEMORY_VECTOR_LIMIT, 40),
    vectorSimilarityK: toNumber(process.env.MEMORY_VECTOR_K, 3),
    summaryInterval: toNumber(process.env.MEMORY_SUMMARY_INTERVAL, 6),
    minFactLength: toNumber(process.env.MEMORY_MIN_FACT_LENGTH, 16),
    store: memoryStore,
});
// OpenAI-compatible local proxy endpoints
import { OpenAIProvider } from './providers/openaiProvider.js';
fastify.post('/proxy/v1/chat/completions', async (request, reply) => {
    const body = request.body || {};
    // Support both messages-based and prompt-based requests
    const messages = body.messages || [];
    const prompt = body.prompt || (Array.isArray(messages) ? messages.map((m) => (typeof m === 'string' ? m : m.content)).join('\n') : '');
    const systemPrompt = (Array.isArray(messages) && messages.length && messages[0].role === 'system') ? messages[0].content : (body.system || 'You are a helpful assistant.');
    // Determine client key to present to upstream proxy/openai
    const authHeader = (request.headers['authorization'] || request.headers['Authorization']);
    const xApiKey = (request.headers['x-api-key'] || request.headers['X-API-Key']);
    let clientKey;
    if (authHeader && authHeader.startsWith('Bearer '))
        clientKey = authHeader.replace(/^Bearer\s+/i, '').trim();
    else if (xApiKey)
        clientKey = xApiKey.trim();
    else
        clientKey = process.env.OPENAI_API_KEY;
    // Create a per-request provider that will use the client-supplied key when calling the upstream base URL
    const upstreamBase = process.env.OPENAI_API_BASE || process.env.OPENAI_API_URL || 'https://api.openai.com';
    const upstreamProvider = new OpenAIProvider(clientKey || '', upstreamBase);
    try {
        const res = await upstreamProvider.chat({ prompt, systemPrompt });
        return reply.send({ id: 'local-' + Date.now(), object: 'chat.completion', choices: [{ message: { role: 'assistant', content: res.text } }], metadata: res.metadata });
    }
    catch (err) {
        return reply.code(502).send({ error: 'provider failed', detail: String(err) });
    }
});
fastify.post('/api/upload', async (request, reply) => {
    const multipartFile = await request.file();
    if (!multipartFile) {
        return reply.code(400).send({ success: false, error: '缺少文件' });
    }
    const originalName = multipartFile.filename || '未命名文件';
    const extension = path.extname(originalName);
    const fileId = randomUUID();
    const storedName = `${fileId}${extension}`;
    const destinationPath = path.join(uploadDirectory, storedName);
    try {
        await ensureDirectoryExists(uploadDirectory);
        await pipeline(multipartFile.file, createWriteStream(destinationPath));
        const streamInfo = multipartFile.file ?? {};
        if (streamInfo.truncated) {
            await fs.rm(destinationPath, { force: true }).catch(() => { });
            return reply.code(413).send({ success: false, error: '文件超出允许的大小限制' });
        }
        const stats = await fs.stat(destinationPath);
        await registerUpload({
            fileId,
            originalName,
            storedName,
            storedPath: destinationPath,
            mimeType: multipartFile.mimetype,
            size: stats.size,
            uploadedAt: new Date().toISOString(),
        });
        return reply.send({
            success: true,
            fileId,
            fileName: originalName,
            mimeType: multipartFile.mimetype,
            size: stats.size,
            path: path.relative(process.cwd(), destinationPath).replace(/\\/g, '/'),
            url: null,
        });
    }
    catch (err) {
        await fs.rm(destinationPath, { force: true }).catch(() => { });
        request.log.error({ err }, '文件上传失败');
        return reply.code(500).send({ success: false, error: '文件保存失败，请稍后重试' });
    }
});
// Existing embed endpoint
fastify.post('/api/embed', async (request, reply) => {
    const body = request.body;
    const texts = body.texts || [];
    try {
        const embeddings = await provider.embed(texts);
        // 将 embeddings 写入 documents（按顺序匹配）
        const arr = Array.isArray(embeddings[0]) ? embeddings : [embeddings];
        arr.forEach((v, i) => {
            if (documents[i])
                documents[i].embedding = v;
        });
        return { embeddings: arr };
    }
    catch (err) {
        // 回退到随机向量
        const fallback = texts.map(t => Array.from({ length: 8 }, () => Math.random()));
        fallback.forEach((v, i) => {
            if (documents[i])
                documents[i].embedding = v;
        });
        return { embeddings: fallback, warning: 'provider.embed failed, used fallback' };
    }
});
fastify.post('/api/search', async (request, reply) => {
    const body = request.body;
    const query = body.query || '';
    const topK = body.topK || 3;
    // 简单基于包含关键字的检索
    const hits = documents
        .map(d => ({ id: d.id, text: d.text, score: d.text.includes(query) ? 1 : 0 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
    return { hits };
});
fastify.get('/api/chat', async (request, reply) => {
    const query = (request.query && request.query.query) || '';
    const topK = (request.query && request.query.topK) ? Number(request.query.topK) : 3;
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
    }
    catch (err) {
        const fallback = `（模拟回退）基于检索到的内容：${context.substring(0, 120)}... 对问题 "${query}" 的回答是：示例答案。`;
        return { answer: fallback, sources: searchRes, warning: 'provider.chat failed, used fallback' };
    }
});
fastify.post('/api/chat', async (request, reply) => {
    const body = request.body;
    const result = await processChatRequest(body, request);
    return reply.code(result.status).send(result.payload);
});
// 新增原始 POST 接口，直接从 Node 原始请求流读取 body，绕过 Fastify 的 body 解析，以便在 Content-Length 不匹配时仍能接收请求
fastify.post('/api/chat-raw', async (request, reply) => {
    try {
        // 读取原始请求流
        const rawBuf = await new Promise((resolve, reject) => {
            const chunks = [];
            request.raw.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))));
            request.raw.on('end', () => resolve(Buffer.concat(chunks)));
            request.raw.on('error', err => reject(err));
            // If no data event arrives and request already ended, resolve with empty buffer
        }).catch(() => null);
        let body = {};
        if (rawBuf) {
            const str = rawBuf.toString('utf8').trim();
            if (str) {
                try {
                    body = JSON.parse(str);
                }
                catch (err) {
                    return reply.code(400).send({ error: 'Invalid JSON in raw body' });
                }
            }
        }
        const result = await processChatRequest(body, request);
        return reply.code(result.status).send(result.payload);
    }
    catch (err) {
        // 捕获流读取等其他错误，返回 500
        const logger = request.log;
        logger?.error?.(err);
        return reply.code(500).send({ error: 'Failed to read raw body' });
    }
});
const start = async () => {
    try {
        const port = Number(process.env.PORT) || 8000;
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`Server running at http://localhost:${port}`);
    }
    catch (err) {
        fastify.log.error?.(err);
        process.exit(1);
    }
};
start();
