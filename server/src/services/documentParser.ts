import { promises as fs } from 'node:fs';
import path from 'node:path';
import { TextDecoder } from 'node:util';
import type { StoredUploadRecord } from '../storage/uploadRegistry.js';

const DEFAULT_MAX_CHARS = 6000;
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;

type SupportedFormat = 'txt' | 'pdf' | 'docx' | 'xlsx';

const mimeToFormat: Record<string, SupportedFormat> = {
  'text/plain': 'txt',
  'application/pdf': 'pdf',
  'application/x-pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
};

const extensionToFormat: Record<string, SupportedFormat> = {
  '.txt': 'txt',
  '.pdf': 'pdf',
  '.docx': 'docx',
  '.xlsx': 'xlsx',
};

export type DocumentParseResult = {
  text: string;
  excerpt: string;
  wordCount: number;
  warnings: string[];
  metadata: Record<string, unknown>;
};

const normalizeWhitespace = (input: string) =>
  input
    .replace(/\u0000/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, '  ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const decodeTextBuffer = (buffer: Buffer) => {
  if (buffer.length >= 2) {
    const bom = buffer.slice(0, 2).toString('hex').toLowerCase();
    if (bom === 'fffe') {
      return buffer.toString('utf16le');
    }
    if (bom === 'feff') {
      const decoder = new TextDecoder('utf-16be');
      return decoder.decode(buffer.slice(2));
    }
  }
  if (buffer.length >= 3) {
    const bom3 = buffer.slice(0, 3).toString('hex').toLowerCase();
    if (bom3 === 'efbbbf') {
      return buffer.slice(3).toString('utf8');
    }
  }

  try {
    return buffer.toString('utf8');
  } catch {
    return buffer.toString('latin1');
  }
};

const buildExcerpt = (text: string, maxChars: number) => {
  if (text.length <= maxChars) {
    return text;
  }
  const slice = text.slice(0, maxChars);
  const lastBreak = slice.lastIndexOf('\n');
  if (lastBreak > maxChars * 0.6) {
    return slice.slice(0, lastBreak).trim();
  }
  return slice.trim();
};

const resolveFormat = (record: StoredUploadRecord): SupportedFormat | null => {
  const mime = record.mimeType?.split(';')[0]?.trim().toLowerCase();
  if (mime && mimeToFormat[mime]) {
    return mimeToFormat[mime];
  }
  const ext = path.extname(record.originalName || record.storedName).toLowerCase();
  return extensionToFormat[ext] ?? null;
};

const readTextFile = async (record: StoredUploadRecord): Promise<DocumentParseResult> => {
  const buffer = await fs.readFile(record.storedPath);
  const text = normalizeWhitespace(decodeTextBuffer(buffer));
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const maxChars = Number(process.env.DOCUMENT_PARSE_MAX_CHARS ?? DEFAULT_MAX_CHARS);
  const warnings: string[] = [];
  let excerpt = buildExcerpt(text, maxChars);
  if (excerpt.length < text.length) {
    warnings.push(`文档较长，仅截取前 ${maxChars} 个字符用于上下文。`);
  }
  return {
    text,
    excerpt,
    wordCount,
    warnings,
    metadata: {},
  };
};

const readPdfFile = async (record: StoredUploadRecord): Promise<DocumentParseResult> => {
  const buffer = await fs.readFile(record.storedPath);
  const pdfParseModule = await import('pdf-parse');
  const pdfParse = pdfParseModule.default ?? (pdfParseModule as any);
  const maxBytes = Number(process.env.DOCUMENT_PARSE_MAX_BYTES ?? DEFAULT_MAX_BYTES);
  const warnings: string[] = [];
  if (Number.isFinite(maxBytes) && maxBytes > 0 && buffer.byteLength > maxBytes) {
    warnings.push(
      `文件体积 ${Math.round(buffer.byteLength / 1024)}KB 超过解析上限 (${Math.round(maxBytes / 1024)}KB)，仅尝试截取前半部分。`
    );
  }
  const payload = await pdfParse(buffer);
  const text = normalizeWhitespace(payload.text || '');
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const maxChars = Number(process.env.DOCUMENT_PARSE_MAX_CHARS ?? DEFAULT_MAX_CHARS);
  const excerpt = buildExcerpt(text, maxChars);
  if (excerpt.length < text.length) {
    warnings.push(`PDF 内容较长，仅截取前 ${maxChars} 个字符用于上下文。`);
  }
  return {
    text,
    excerpt,
    wordCount,
    warnings,
    metadata: {
      pages: payload.numpages,
      info: payload.info,
    },
  };
};

const readDocxFile = async (record: StoredUploadRecord): Promise<DocumentParseResult> => {
  const mammothModule = await import('mammoth');
  const mammoth = mammothModule.default ?? (mammothModule as any);
  const result = await mammoth.extractRawText({ path: record.storedPath });
  const text = normalizeWhitespace(result.value || '');
  const warnings = Array.isArray(result.messages)
    ? result.messages.map(message => message.message || String(message)).filter(Boolean)
    : [];
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const maxChars = Number(process.env.DOCUMENT_PARSE_MAX_CHARS ?? DEFAULT_MAX_CHARS);
  const excerpt = buildExcerpt(text, maxChars);
  if (excerpt.length < text.length) {
    warnings.push(`Word 文档较长，仅截取前 ${maxChars} 个字符用于上下文。`);
  }
  return {
    text,
    excerpt,
    wordCount,
    warnings,
    metadata: {},
  };
};

const readXlsxFile = async (record: StoredUploadRecord): Promise<DocumentParseResult> => {
  const buffer = await fs.readFile(record.storedPath);
  const xlsxModule = await import('xlsx');
  const XLSX = (xlsxModule as any).default ?? xlsxModule;
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  const warnings: string[] = [];
  const sheetNames: string[] = Array.isArray(workbook.SheetNames) ? workbook.SheetNames : [];

  const maxSheets = Math.max(1, Number(process.env.DOCUMENT_PARSE_MAX_SHEETS ?? 3));
  const maxRows = Math.max(1, Number(process.env.DOCUMENT_PARSE_MAX_ROWS ?? 20));
  const maxColumns = Math.max(1, Number(process.env.DOCUMENT_PARSE_MAX_COLUMNS ?? 12));
  const maxChars = Number(process.env.DOCUMENT_PARSE_MAX_CHARS ?? DEFAULT_MAX_CHARS);

  const selectedSheets = sheetNames.slice(0, maxSheets);
  if (sheetNames.length > selectedSheets.length) {
    warnings.push(`工作簿包含 ${sheetNames.length} 个工作表，仅解析前 ${selectedSheets.length} 个。`);
  }

  const sections: string[] = [];
  const sheetSummaries: Array<{ name: string; rows: number; columns: number }> = [];

  const formatRow = (row: string[], columnLimit: number) =>
    row
      .slice(0, columnLimit)
      .map(cell => {
        if (!cell) return '-';
        return cell.length > 60 ? `${cell.slice(0, 57)}...` : cell;
      })
      .join(' | ');

  selectedSheets.forEach((name, index) => {
    const worksheet = workbook.Sheets[name];
    if (!worksheet) {
      warnings.push(`无法读取工作表「${name}」，已跳过。`);
      return;
    }

    const rows: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as string[][];
    const normalizedRows = rows.map(row =>
      Array.isArray(row) ? row.map(cell => (cell == null ? '' : String(cell).trim())) : []
    );
    const nonEmptyRows = normalizedRows.filter(row => row.some(cell => cell));

    sheetSummaries.push({
      name,
      rows: nonEmptyRows.length,
      columns: nonEmptyRows[0]?.length ?? 0,
    });

    const limitedRows = nonEmptyRows.slice(0, maxRows);
    if (nonEmptyRows.length > limitedRows.length) {
      warnings.push(`工作表「${name}」共有 ${nonEmptyRows.length} 行，仅保留前 ${maxRows} 行。`);
    }

    const lines: string[] = [`工作表${index + 1}：${name}`];
    if (!limitedRows.length) {
      lines.push('（表格为空）');
    } else {
      const headerRow = limitedRows[0] ?? [];
      const headerLine = formatRow(headerRow, maxColumns) || '(无表头)';
      if (headerRow.length > maxColumns) {
        warnings.push(`工作表「${name}」共有 ${headerRow.length} 列，仅展示前 ${maxColumns} 列。`);
      }
      lines.push(`表头：${headerLine}`);

      const dataRows = limitedRows.slice(1);
      if (!dataRows.length) {
        lines.push('（无数据行）');
      } else {
        dataRows.forEach((row, rowIndex) => {
          lines.push(`第${rowIndex + 1}行：${formatRow(row, maxColumns)}`);
        });
      }
    }

    sections.push(lines.join('\n'));
  });

  const text = normalizeWhitespace(sections.join('\n\n'));
  const excerpt = buildExcerpt(text, maxChars);
  if (excerpt.length < text.length && text.length > 0) {
    warnings.push(`Excel 内容较长，仅截取前 ${maxChars} 个字符用于上下文。`);
  }
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

  return {
    text,
    excerpt,
    wordCount,
    warnings,
    metadata: {
      sheetCount: sheetNames.length,
      sheetNames: selectedSheets,
      sheets: sheetSummaries,
    },
  };
};

export const isSupportedDocument = (record: StoredUploadRecord) => Boolean(resolveFormat(record));

export const parseDocumentAttachment = async (
  record: StoredUploadRecord
): Promise<DocumentParseResult> => {
  const format = resolveFormat(record);
  if (!format) {
    throw new Error(`暂不支持解析该文档类型: ${record.mimeType || record.originalName || record.storedName}`);
  }

  switch (format) {
    case 'txt':
      return readTextFile(record);
    case 'pdf':
      return readPdfFile(record);
    case 'docx':
      return readDocxFile(record);
    case 'xlsx':
      return readXlsxFile(record);
    default:
      throw new Error('未能识别的文档类型');
  }
};
