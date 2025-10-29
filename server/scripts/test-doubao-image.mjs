#!/usr/bin/env node
/**
 * Quick connectivity check for doubao-seed-1-6-flash with image input.
 * Does not touch business logic; run manually with: pnpm --dir server node scripts/test-doubao-image.mjs [imageUrl]
 */
import 'dotenv/config';
import fetch from 'node-fetch';
import path from 'node:path';
import { promises as fs } from 'node:fs';

const apiKey = process.env.DOUBAO_API_KEY;
if (!apiKey) {
  console.error('Missing DOUBAO_API_KEY; please populate server/.env before running this script.');
  process.exit(1);
}

const baseUrl = (process.env.DOUBAO_API_BASE || 'https://ark.cn-beijing.volces.com/api/v3').trim().replace(/\s+/g, '').replace(/\/+$/, '');
const model = (process.env.DOUBAO_CHAT_MODEL || 'doubao-seed-1-6-flash').trim() || 'doubao-seed-1-6-flash';

const defaultImage = 'https://lf3-static.bytednsdoc.com/obj/eden-cn/qfass21apm/static/images/ark/doubao-demo.jpg';
const imageInput = process.argv[2] || defaultImage;

const knownMimeByExt = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
};

const toImagePart = async (input) => {
  if (/^https?:\/\//i.test(input) || input.startsWith('data:')) {
    return {
      type: 'image_url',
      image_url: { url: input },
    };
  }

  const absolutePath = path.isAbsolute(input) ? input : path.join(process.cwd(), input);
  const buffer = await fs.readFile(absolutePath);
  const ext = path.extname(absolutePath).toLowerCase();
  const mimeType = knownMimeByExt[ext] || 'application/octet-stream';
  return {
    type: 'image_url',
    image_url: {
      url: `data:${mimeType};base64,${buffer.toString('base64')}`,
    },
  };
};

const buildPayload = async () => {
  const imagePart = await toImagePart(imageInput);
  const messageContent = [
    {
      type: 'text',
      text: '请描述图片的主要内容，并确认你是否能够读取其中的视觉细节。',
    },
    imagePart,
  ];

  return {
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
};

const url = `${baseUrl}/chat/completions`;

const run = async () => {
  console.log(`[doubao] Probing ${model} with image: ${imageInput}`);
  try {
    const payload = await buildPayload();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const bodyText = await res.text();
    if (!res.ok) {
      console.error(`[doubao] Request failed: ${res.status} ${res.statusText}`);
      console.error(bodyText);
      process.exitCode = 1;
      return;
    }

    const data = JSON.parse(bodyText);
    const choice = data?.choices?.[0] || data?.output?.choices?.[0];
    const message = choice?.message || choice?.messages?.[0];
    const content = Array.isArray(message?.content)
      ? message.content.map((segment) => (typeof segment === 'string' ? segment : segment?.text || segment?.content || '')).join('')
      : message?.content || message?.text || '';

    console.log('[doubao] Raw usage metadata:', data?.usage || data?.output?.usage || choice?.usage || 'N/A');
    console.log('[doubao] Model response:');
    console.log(content || '(empty content)');
  } catch (err) {
    console.error('[doubao] Error while probing model:', err instanceof Error ? err.message : err);
    process.exitCode = 1;
  }
};

run();
