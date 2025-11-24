import type { FileEntry } from '@/features/kidsCoding/types/editor';
import { MAX_BINARY_FILE_SIZE_BYTES, MAX_TEXT_FILE_SIZE_BYTES } from '@/features/kidsCoding/core/fileSizeLimits';
import type { RunFileDTO, RunJobDTO } from '@/features/kidsCoding/types/run';

const MAX_FILE_COUNT = 30;
const textEncoder = new TextEncoder();
const DRIVE_PREFIX = /^[a-zA-Z]:/;

const normalizeRelativePath = (path: string) => {
  const trimmed = path.trim();
  if (!trimmed) {
    throw new Error('文件路径不能为空');
  }
  if (trimmed.startsWith('/') || DRIVE_PREFIX.test(trimmed)) {
    throw new Error(`禁止使用绝对路径：${trimmed}`);
  }
  if (trimmed.includes('\\')) {
    throw new Error(`文件路径不能包含 " \\" ：${trimmed}`);
  }

  const parts = trimmed.split('/');
  const resolved: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') {
      throw new Error(`文件路径不能包含 ".."：${trimmed}`);
    }
    resolved.push(part);
  }
  if (!resolved.length) {
    throw new Error(`无法解析文件路径：${trimmed}`);
  }
  return resolved.join('/');
};

const toByteLength = (content: string, encoding: RunFileDTO['encoding']) => {
  if (encoding === 'base64') {
    const cleaned = content.trim();
    if (!cleaned) return 0;
    const padding = (cleaned.endsWith('==') ? 2 : cleaned.endsWith('=') ? 1 : 0);
    return Math.max(0, Math.floor((cleaned.length * 3) / 4) - padding);
  }
  return textEncoder.encode(content ?? '').length;
};

export function buildRunJobPayload(files: FileEntry[], activeFileId?: string | null): RunJobDTO {
  const fileEntries = files.filter(file => file.kind !== 'folder');
  if (!fileEntries.length) {
    throw new Error('没有可运行的文件');
  }
  if (fileEntries.length > MAX_FILE_COUNT) {
    throw new Error(`文件数量超过限制（最多 ${MAX_FILE_COUNT} 个）`);
  }

  const sanitizedFiles: RunFileDTO[] = [];
  const seenPaths = new Set<string>();
  const pathByEntryId = new Map<string, string>();

  fileEntries.forEach(file => {
    const rawPath = file.path ?? file.name;
    if (!rawPath) {
      throw new Error('文件缺少有效路径');
    }
    const safePath = normalizeRelativePath(rawPath);
    if (seenPaths.has(safePath)) {
      throw new Error(`存在重复的文件路径：${safePath}`);
    }
    const encoding: RunFileDTO['encoding'] = file.encoding ?? 'utf8';
    if (encoding !== 'utf8' && encoding !== 'base64') {
      throw new Error(`不支持的文件编码：${encoding}`);
    }
    const content = file.content ?? '';
    const byteLength = toByteLength(content, encoding);
    const limit = encoding === 'utf8' ? MAX_TEXT_FILE_SIZE_BYTES : MAX_BINARY_FILE_SIZE_BYTES;
    if (byteLength > limit) {
      throw new Error(`文件 ${safePath} 超过大小限制（最大 ${limit} 字节）`);
    }
    sanitizedFiles.push({ path: safePath, content, encoding });
    seenPaths.add(safePath);
    pathByEntryId.set(file.id, safePath);
  });

  if (!activeFileId) {
    throw new Error('需要选择要运行的 Python 文件');
  }
  const entryPath = pathByEntryId.get(activeFileId);
  if (!entryPath) {
    throw new Error('当前激活文件不存在或不可运行');
  }
  if (!entryPath.toLowerCase().endsWith('.py')) {
    throw new Error('入口文件必须是 Python 文件');
  }
  if (!seenPaths.has(entryPath)) {
    throw new Error('入口文件未包含在打包列表中');
  }

  return {
    protocolVersion: 2,
    language: 'python',
    files: sanitizedFiles,
    entryPath,
  };
}
