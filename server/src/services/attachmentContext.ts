import { getUploadRecord, type StoredUploadRecord } from '../storage/uploadRegistry.js';
import { analyzeAttachmentImage } from './doubaoImageService.js';
import type { ImageInsight } from './imageAnalyzer.js';

export type ChatAttachmentInput = {
  fileId?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
};

export type AttachmentAnalysis = ImageInsight & {
  summary: string;
  publicPath?: string;
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
    `当前暂不支持自动解析该类型（${reason}），请根据用户描述自行参考。`,
  ].join('\n');
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
    if (!record.mimeType?.startsWith('image/')) {
      contextBlocks.push(createUnsupportedBlock(index, record, '仅支持图片识别'));
      continue;
    }

    try {
      const insight = await analyzeAttachmentImage(record, {
        prompt: `请描述这张图片（文件名：${record.originalName || record.storedName}），重点说明场景、关键元素、文字信息以及潜在风险提示。`,
      });
      const baseInfoParts = [
        record.mimeType || '未知类型',
        `大小 ${formatBytes(record.size)}`,
      ];
      if (insight.width && insight.height) {
        baseInfoParts.push(`尺寸 ${insight.width}×${insight.height}`);
      }

      const lines = [
        `附件${index}：${record.originalName || record.storedName}`,
        `基础信息：${baseInfoParts.join('，')}`,
      ];

      if (insight.caption) {
        lines.push(`图像描述：${insight.caption}`);
      }
      if (insight.warnings.length) {
        lines.push(`注意事项：${insight.warnings.join('；')}`);
      }

      contextBlocks.push(lines.join('\n'));
      const publicPath = `/uploads/${record.storedName}`;
      analyses.push({
        ...insight,
        summary: insight.caption || lines.slice(1).join('，'),
        publicPath,
        downloadUrl: publicPath,
        previewUrl: insight.previewUrl || (record.mimeType?.startsWith('image/') ? publicPath : undefined),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      notes.push(`解析附件 ${record.originalName || record.storedName} 失败：${message}`);
      contextBlocks.push(createUnsupportedBlock(index, record, '解析过程发生异常'));
    }
  }

  return {
    contextText: contextBlocks.join('\n\n'),
    analyses,
    notes,
  };
};

