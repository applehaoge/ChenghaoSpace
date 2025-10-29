import { promises as fs } from 'node:fs';
import path from 'node:path';
import fetch from 'node-fetch';
import { imageSize } from 'image-size';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { analyzeImage as analyzeWithOpenAI } from './imageAnalyzer.js';
const DEFAULT_MODEL = 'doubao-seed-1-6-flash';
const DEFAULT_PROMPT = '请用中文详细描述这张图片（文件名：{filename}）的场景、关键元素、出现的文字信息以及可能需要注意的风险点。';
const DEFAULT_TIMEOUT = 20000;
const DEFAULT_MAX_BYTES = 8 * 1024 * 1024;
const knownMimeByExt = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
};
const sanitiseBaseUrl = (url) => {
    const fallback = 'https://ark.cn-beijing.volces.com/api/v3';
    if (!url)
        return fallback;
    return url.replace(/\s+/g, '').replace(/\/+$/, '') || fallback;
};
const shouldBypassProxy = (error) => {
    const code = error?.code || error?.cause?.code;
    if (!code)
        return false;
    const normalized = String(code).toUpperCase();
    return ['ECONNREFUSED', 'ECONNRESET', 'EHOSTUNREACH', 'ENOTFOUND', 'ETIMEDOUT'].includes(normalized);
};
const requestWithProxy = async (url, init) => {
    const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    if (!proxy) {
        return fetch(url, init);
    }
    const agent = new HttpsProxyAgent(proxy);
    try {
        return await fetch(url, { ...init, agent: agent });
    }
    catch (err) {
        if (shouldBypassProxy(err)) {
            console.warn('[DoubaoImageService] Proxy request failed, retrying without proxy:', err?.message || err);
            return fetch(url, { ...init, agent: undefined });
        }
        throw err;
    }
};
const resolveMimeType = (record) => {
    if (record.mimeType && record.mimeType.trim()) {
        return record.mimeType;
    }
    const filename = record.originalName || record.storedName || '';
    const ext = path.extname(filename).toLowerCase();
    return knownMimeByExt[ext] || 'application/octet-stream';
};
const formatPrompt = (template, displayName) => {
    const base = (template && template.trim()) || DEFAULT_PROMPT;
    return base.replace('{filename}', displayName);
};
const ensureUsageObject = (raw) => {
    if (!raw || typeof raw !== 'object')
        return undefined;
    return raw;
};
export const isDoubaoImageEnabled = () => Boolean((process.env.DOUBAO_API_KEY || '').trim());
export const analyzeImageWithDoubao = async (record, options = {}) => {
    const apiKey = (process.env.DOUBAO_API_KEY || '').trim();
    if (!apiKey) {
        throw new Error('缺少 DOUBAO_API_KEY，无法调用豆包图像识别接口');
    }
    const buffer = await fs.readFile(record.storedPath);
    const maxBytes = Number(process.env.DOUBAO_IMAGE_MAX_BYTES ?? DEFAULT_MAX_BYTES);
    if (Number.isFinite(maxBytes) && maxBytes > 0 && buffer.byteLength > maxBytes) {
        throw new Error(`图片体积 ${Math.round(buffer.byteLength / 1024)}KB 超出限制（${Math.round(maxBytes / 1024)}KB），已跳过豆包识别`);
    }
    const dimensions = imageSize(buffer);
    const width = dimensions.width ?? undefined;
    const height = dimensions.height ?? undefined;
    const mimeType = resolveMimeType(record);
    const baseUrl = sanitiseBaseUrl(process.env.DOUBAO_IMAGE_API_BASE || process.env.DOUBAO_API_BASE);
    const model = (process.env.DOUBAO_IMAGE_MODEL || process.env.DOUBAO_CHAT_MODEL || '').trim() || DEFAULT_MODEL;
    const timeoutMs = Number(process.env.DOUBAO_IMAGE_TIMEOUT_MS ?? process.env.DOUBAO_TIMEOUT_MS ?? DEFAULT_TIMEOUT);
    const displayName = record.originalName || record.storedName || record.fileId;
    const prompt = formatPrompt(options.prompt, displayName);
    const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    const messageContent = [
        {
            type: 'text',
            text: prompt,
        },
        {
            type: 'image_url',
            image_url: {
                url: dataUrl,
            },
        },
    ];
    const payload = {
        model,
        input: {
            messages: [
                {
                    role: 'user',
                    content: messageContent,
                },
            ],
        },
        messages: [
            {
                role: 'user',
                content: messageContent,
            },
        ],
        stream: false,
    };
    const parameters = {};
    const temperatureRaw = process.env.DOUBAO_IMAGE_TEMPERATURE ?? process.env.DOUBAO_TEMPERATURE;
    const maxTokensRaw = process.env.DOUBAO_IMAGE_MAX_OUTPUT_TOKENS ?? process.env.DOUBAO_MAX_OUTPUT_TOKENS;
    const topPRaw = process.env.DOUBAO_IMAGE_TOP_P ?? process.env.DOUBAO_TOP_P;
    const temperature = Number(temperatureRaw);
    if (!Number.isNaN(temperature) && temperature >= 0)
        parameters.temperature = temperature;
    const maxTokens = Number(maxTokensRaw);
    if (!Number.isNaN(maxTokens) && maxTokens > 0)
        parameters.max_output_tokens = maxTokens;
    const topP = Number(topPRaw);
    if (!Number.isNaN(topP) && topP > 0 && topP <= 1)
        parameters.top_p = topP;
    if (Object.keys(parameters).length > 0) {
        payload.parameters = parameters;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT);
    try {
        const url = `${baseUrl}/chat/completions`;
        const res = await requestWithProxy(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`豆包图像识别接口返回异常：${res.status} ${text}`);
        }
        const data = await res.json();
        const choice = data?.choices?.[0] || data?.output?.choices?.[0];
        const message = choice?.message || choice?.messages?.[0];
        const rawContent = Array.isArray(message?.content)
            ? message.content
                .map((segment) => typeof segment === 'string' ? segment : segment?.text || segment?.content || '')
                .join('')
            : message?.content || message?.text || '';
        const caption = typeof rawContent === 'string' ? rawContent.trim() : '';
        if (!caption) {
            throw new Error('豆包图像识别返回内容为空');
        }
        return {
            fileId: record.fileId,
            originalName: record.originalName,
            mimeType,
            size: record.size,
            width,
            height,
            caption,
            provider: 'doubao',
            warnings: [],
            usage: ensureUsageObject(data?.usage || data?.output?.usage || choice?.usage),
        };
    }
    finally {
        clearTimeout(timeout);
    }
};
export const analyzeAttachmentImage = async (record, options = {}) => {
    if (!isDoubaoImageEnabled()) {
        return analyzeWithOpenAI(record);
    }
    try {
        return await analyzeImageWithDoubao(record, options);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn('[DoubaoImageService] analyzeImageWithDoubao failed, fallback to OpenAI analyzer:', message);
        const fallback = await analyzeWithOpenAI(record);
        const nextWarnings = new Set(fallback.warnings);
        nextWarnings.add(message);
        return {
            ...fallback,
            warnings: Array.from(nextWarnings),
        };
    }
};
