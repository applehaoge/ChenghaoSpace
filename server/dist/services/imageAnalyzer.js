import { promises as fs } from 'node:fs';
import fetch from 'node-fetch';
import { imageSize } from 'image-size';
const DEFAULT_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-4o-mini';
const MAX_IMAGE_BYTES = Number(process.env.IMAGE_ANALYSIS_MAX_BYTES || 5 * 1024 * 1024);
const MAX_TOKENS = Number(process.env.IMAGE_ANALYSIS_MAX_TOKENS || 500);
const REQUEST_TIMEOUT = Number(process.env.IMAGE_ANALYSIS_TIMEOUT_MS || 20000);
const formatBytes = (value) => {
    if (!Number.isFinite(value) || value <= 0)
        return '未知大小';
    const units = ['B', 'KB', 'MB', 'GB'];
    let idx = 0;
    let current = value;
    while (current >= 1024 && idx < units.length - 1) {
        current /= 1024;
        idx += 1;
    }
    const precision = current >= 10 || idx === 0 ? 0 : 1;
    return `${current.toFixed(precision)}${units[idx]}`;
};
const buildOpenAIUrl = (path) => {
    const base = (process.env.OPENAI_API_BASE || process.env.OPENAI_API_URL || 'https://api.openai.com')
        .trim()
        .replace(/\s+/g, '')
        .replace(/\/+$/, '');
    const root = base.replace(/\/v1(?:\/.*)?$/i, '');
    const apiPath = (process.env.OPENAI_API_PATH || path).replace(/^[\/]+/, '');
    return `${root}/${apiPath}`;
};
const requestVisionCaption = async (buffer, mimeType, displayName) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('缺少 OPENAI_API_KEY，无法调用图像识别接口');
    }
    const url = buildOpenAIUrl('v1/chat/completions');
    const base64 = buffer.toString('base64');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: DEFAULT_MODEL,
                max_tokens: MAX_TOKENS,
                messages: [
                    {
                        role: 'system',
                        content: '你是一位专业的图像分析助手，请用中文准确描述图片的关键信息。',
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `请详细描述这张图片的场景、重要元素以及可能包含的文字。文件名：${displayName}`,
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${mimeType};base64,${base64}`,
                                },
                            },
                        ],
                    },
                ],
            }),
            signal: controller.signal,
        });
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`调用图像识别接口失败：${res.status} ${body}`);
        }
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (typeof content === 'string')
            return content.trim();
        if (Array.isArray(content)) {
            return content.map((segment) => (typeof segment === 'string' ? segment : segment?.text || '')).join('').trim();
        }
        return JSON.stringify(content ?? {});
    }
    finally {
        clearTimeout(timeout);
    }
};
const buildMetadataFallback = (record, width, height) => {
    const parts = [
        `文件名：${record.originalName}`,
        `类型：${record.mimeType || '未知类型'}`,
        `大小：${formatBytes(record.size)}`,
    ];
    if (width && height) {
        parts.push(`尺寸：${width}×${height}`);
    }
    parts.push('由于未启用图像识别接口，仅提供基础信息。');
    return parts.join('；');
};
export const analyzeImage = async (record) => {
    const warnings = [];
    let width;
    let height;
    let caption;
    let provider;
    try {
        const buffer = await fs.readFile(record.storedPath);
        const dimensions = imageSize(buffer);
        width = dimensions.width ?? undefined;
        height = dimensions.height ?? undefined;
        if (!process.env.OPENAI_API_KEY) {
            warnings.push('缺少 OPENAI_API_KEY，无法生成详细图像描述。');
            caption = buildMetadataFallback(record, width, height);
        }
        else if (buffer.byteLength > MAX_IMAGE_BYTES) {
            warnings.push(`图片体积为 ${formatBytes(buffer.byteLength)}，超过限制 ${formatBytes(MAX_IMAGE_BYTES)}，跳过详细识别。`);
            caption = buildMetadataFallback(record, width, height);
        }
        else {
            try {
                caption = await requestVisionCaption(buffer, record.mimeType, record.originalName);
                provider = 'openai';
            }
            catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                warnings.push(`调用图像识别接口失败：${message}`);
                caption = buildMetadataFallback(record, width, height);
            }
        }
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        warnings.push(`读取图片失败：${message}`);
        caption = '读取图片内容失败，无法提供描述。';
    }
    return {
        fileId: record.fileId,
        originalName: record.originalName,
        mimeType: record.mimeType,
        size: record.size,
        width,
        height,
        caption,
        provider,
        warnings,
    };
};
