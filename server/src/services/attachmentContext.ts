import { getUploadRecord, type StoredUploadRecord } from '../storage/uploadRegistry.js';
import { analyzeAttachmentImage } from './doubaoImageService.js';
import { parseDocumentAttachment, isSupportedDocument } from './documentParser.js';

export type ChatAttachmentInput = {
  fileId?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
};

export type AttachmentAnalysis = {
  fileId: string;
  originalName: string;
  mimeType: string;
  size: number;
  summary: string;
  caption?: string;
  provider?: string;
  warnings: string[];
  width?: number;
  height?: number;
  usage?: Record<string, unknown>;
  publicPath?: string;
  downloadUrl?: string;
  previewUrl?: string;
  document?: {
    excerpt: string;
    wordCount: number;
    metadata: Record<string, unknown>;
  };
};

export type AttachmentContextResult = {
  contextText: string;
  analyses: AttachmentAnalysis[];
  notes: string[];
};

const formatBytes = (value?: number | null) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return '未知大小';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let current = value;
  let index = 0;
  while (current >= 1024 && index < units.length - 1) {
    current /= 1024;
    index += 1;
  }
  const fractionDigits = current >= 10 || index === 0 ? 0 : 1;
  return `${current.toFixed(fractionDigits)}${units[index]}`;
};

const createUnsupportedBlock = (index: number, record: StoredUploadRecord, reason: string) => {
  const name = record.originalName || record.storedName;
  return [
    `附件${index}：${name}`,
    `基础信息：${record.mimeType || '未知类型'}，大小 ${formatBytes(record.size)}`,
    `当前暂不支持自动解析该类型（${reason}），请结合用户说明自行参考。`,
  ].join('\n');
};

const createImageAnalysis = async (
  record: StoredUploadRecord,
  index: number,
  contextBlocks: string[],
  analyses: AttachmentAnalysis[],
  notes: string[]
) => {
  const baseInfoParts = [
    record.mimeType || '未知类型',
    `大小 ${formatBytes(record.size)}`,
  ];

  try {
    const insight = await analyzeAttachmentImage(record, {
      prompt: `请描述这张图片（文件名：${record.originalName || record.storedName}），重点说明场景、关键元素、文字信息以及潜在风险提示。`,
    });

    const lines = [
      `附件${index}：${record.originalName || record.storedName}`,
      `基础信息：${baseInfoParts.join('，')}`,
    ];

    if (insight.width && insight.height) {
      lines.push(`图像尺寸：${insight.width}×${insight.height}`);
    }
    if (insight.caption) {
      lines.push(`图像描述：${insight.caption}`);
    }
    if (insight.warnings.length) {
      lines.push(`注意事项：${insight.warnings.join('；')}`);
    }

    contextBlocks.push(lines.join('\n'));
    const publicPath = `/uploads/${record.storedName}`;
    analyses.push({
      fileId: insight.fileId,
      originalName: insight.originalName,
      mimeType: insight.mimeType,
      size: insight.size,
      summary: insight.caption || lines.slice(1).join('，'),
      caption: insight.caption,
      provider: insight.provider,
      warnings: insight.warnings,
      width: insight.width,
      height: insight.height,
      usage: insight.usage,
      publicPath,
      downloadUrl: publicPath,
      previewUrl: insight.previewUrl || publicPath,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    notes.push(`解析图片 ${record.originalName || record.storedName} 失败：${message}`);
    contextBlocks.push(createUnsupportedBlock(index, record, '图像解析过程发生异常'));
  }
};

const createDocumentAnalysis = async (
  record: StoredUploadRecord,
  index: number,
  contextBlocks: string[],
  analyses: AttachmentAnalysis[],
  notes: string[]
) => {
  const baseInfoParts = [
    record.mimeType || '未知类型',
    `大小 ${formatBytes(record.size)}`,
  ];

  try {
    const parseResult = await parseDocumentAttachment(record);
    const lines = [
      `附件${index}：${record.originalName || record.storedName}`,
      `基础信息：${baseInfoParts.join('，')}`,
    ];

    if (parseResult.excerpt) {
      lines.push(`文档内容摘要：${parseResult.excerpt}`);
    } else {
      lines.push('文档内容摘要：暂无可用文本。');
    }

    if (parseResult.warnings.length) {
      lines.push(`注意事项：${parseResult.warnings.join('；')}`);
    }

    contextBlocks.push(lines.join('\n'));
    analyses.push({
      fileId: record.fileId,
      originalName: record.originalName,
      mimeType: record.mimeType,
      size: record.size,
      summary: parseResult.excerpt || lines.slice(1).join('，'),
      caption: parseResult.excerpt,
      warnings: parseResult.warnings,
      document: {
        excerpt: parseResult.excerpt,
        wordCount: parseResult.wordCount,
        metadata: parseResult.metadata,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    notes.push(`解析文档 ${record.originalName || record.storedName} 失败：${message}`);
    contextBlocks.push(createUnsupportedBlock(index, record, '文档解析过程发生异常'));
  }
};

export const buildAttachmentContext = async (
  attachments: ChatAttachmentInput[]
): Promise<AttachmentContextResult> => {
  if (!attachments.length) {
    return { contextText: '', analyses: [], notes: [] };
  }

  const seenIds = new Set<string>();
  const contextBlocks: string[] = [];
  const analyses: AttachmentAnalysis[] = [];
  const notes: string[] = [];

  let index = 0;
  for (const item of attachments) {
    if (!item || typeof item !== 'object') {
      notes.push('收到格式异常的附件描述，已忽略。');
      continue;
    }

    const fileId = (item.fileId || '').trim();
    if (!fileId) {
      notes.push('附件缺少 fileId，无法关联上传记录。');
      continue;
    }

    if (seenIds.has(fileId)) {
      notes.push(`附件 ${fileId} 已处理，跳过重复引用。`);
      continue;
    }
    seenIds.add(fileId);

    const record = await getUploadRecord(fileId);
    if (!record) {
      notes.push(`未找到 ID 为 ${fileId} 的上传记录，可能文件已被清理。`);
      continue;
    }

    index += 1;
    if (record.mimeType?.startsWith('image/')) {
      await createImageAnalysis(record, index, contextBlocks, analyses, notes);
      continue;
    }

    if (isSupportedDocument(record)) {
      await createDocumentAnalysis(record, index, contextBlocks, analyses, notes);
      continue;
    }

    contextBlocks.push(createUnsupportedBlock(index, record, '目前仅支持图片及常见文档解析'));
  }

  return {
    contextText: contextBlocks.join('\n\n'),
    analyses,
    notes,
  };
};

