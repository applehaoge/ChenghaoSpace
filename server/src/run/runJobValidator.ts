import { posix as pathPosix } from 'node:path';
import type { RunFileDTO, RunFileEncoding, RunJobDTO } from './jobTypes.js';

const MAX_FILE_COUNT = 30;
const MAX_FILE_SIZE_BYTES = 200 * 1024;
const DRIVE_PREFIX = /^[a-zA-Z]:/;

export class RunJobValidationError extends Error {
  constructor(public readonly errorCode: string, message: string) {
    super(message);
    this.name = 'RunJobValidationError';
  }
}

const throwValidationError = (code: string, message: string): never => {
  throw new RunJobValidationError(code, message);
};

const ensureSafePath = (path: unknown) => {
  if (typeof path !== 'string') {
    throwValidationError('INVALID_FILE_PATH', '文件路径必须是字符串');
  }
  const trimmed = path.trim();
  if (!trimmed) {
    throwValidationError('INVALID_FILE_PATH', '文件路径不能为空');
  }
  if (trimmed.startsWith('/') || DRIVE_PREFIX.test(trimmed)) {
    throwValidationError('INVALID_FILE_PATH', `禁止使用绝对路径：${trimmed}`);
  }
  if (trimmed.includes('\\')) {
    throwValidationError('INVALID_FILE_PATH', `文件路径不能包含 "\\"：${trimmed}`);
  }
  const normalized = pathPosix.normalize(trimmed);
  if (!normalized || normalized === '.' || normalized.startsWith('..') || normalized.startsWith('/')) {
    // 防止目录穿越写出工作目录以外的文件
    throwValidationError('INVALID_FILE_PATH', `非法的相对路径：${trimmed}`);
  }
  return normalized;
};

const ensureEncoding = (encoding: unknown): RunFileEncoding => {
  if (encoding === 'utf8' || encoding === 'base64') {
    return encoding;
  }
  throwValidationError('INVALID_ENCODING', '仅支持 utf8 或 base64 编码');
};

const ensureContent = (content: unknown, encoding: RunFileEncoding, path: string) => {
  if (typeof content !== 'string') {
    throwValidationError('INVALID_FILE_CONTENT', `文件 ${path} 内容必须是字符串`);
  }
  let byteLength = 0;
  if (encoding === 'base64') {
    let buffer: Buffer;
    try {
      buffer = Buffer.from(content, 'base64');
    } catch {
      throwValidationError('INVALID_FILE_CONTENT', `文件 ${path} base64 内容无效`);
    }
    byteLength = buffer.length;
  } else {
    byteLength = Buffer.byteLength(content, 'utf8');
  }
  if (byteLength > MAX_FILE_SIZE_BYTES) {
    throwValidationError('FILE_TOO_LARGE', `文件 ${path} 超过大小限制（最大 ${MAX_FILE_SIZE_BYTES} 字节）`);
  }
  return content;
};

export const sanitizeRunJobDTO = (payload: RunJobDTO): RunJobDTO => {
  if (payload.protocolVersion !== 2) {
    throwValidationError('UNSUPPORTED_PROTOCOL', '当前仅支持 protocolVersion = 2');
  }
  if (payload.language !== 'python') {
    throwValidationError('UNSUPPORTED_LANGUAGE', '当前仅支持 Python 语言');
  }
  if (!Array.isArray(payload.files) || !payload.files.length) {
    throwValidationError('EMPTY_FILES', '请至少提供一个待执行的文件');
  }
  if (payload.files.length > MAX_FILE_COUNT) {
    throwValidationError('FILE_COUNT_EXCEEDED', `Python 文件数量超过限制（最多 ${MAX_FILE_COUNT} 个）`);
  }

  const sanitizedFiles: RunFileDTO[] = [];
  const seen = new Set<string>();
  for (const file of payload.files) {
    const safePath = ensureSafePath(file.path);
    if (seen.has(safePath)) {
      throwValidationError('DUPLICATE_FILE_PATH', `存在重复的文件路径：${safePath}`);
    }
    const encoding = ensureEncoding(file.encoding);
    const content = ensureContent(file.content, encoding, safePath);
    sanitizedFiles.push({ path: safePath, content, encoding });
    seen.add(safePath);
  }

  const entryPath = ensureSafePath(payload.entryPath);
  if (!entryPath.toLowerCase().endsWith('.py')) {
    throwValidationError('INVALID_ENTRY', '入口文件必须是 Python 文件');
  }
  if (!seen.has(entryPath)) {
    throwValidationError('ENTRY_NOT_FOUND', '入口文件未包含在 files 列表中');
  }

  return {
    protocolVersion: 2,
    language: 'python',
    files: sanitizedFiles,
    entryPath,
  };
};
