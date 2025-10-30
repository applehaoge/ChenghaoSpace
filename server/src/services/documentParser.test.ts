import { afterEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import { Buffer } from 'node:buffer';
import * as XLSX from 'xlsx';

vi.mock('pdf-parse', () => ({
  default: vi.fn(),
}));

vi.mock('mammoth', () => ({
  default: {
    extractRawText: vi.fn(),
  },
}));

import { parseDocumentAttachment, isSupportedDocument } from './documentParser.js';
import type { StoredUploadRecord } from '../storage/uploadRegistry.js';
import pdfParseModule from 'pdf-parse';
import mammothModule from 'mammoth';

const readFileSpy = vi.spyOn(fs, 'readFile');
const mockedPdfParse = pdfParseModule as unknown as ReturnType<typeof vi.fn>;
const mammothExport = (mammothModule as any).default ?? mammothModule;
const mockedMammoth = (mammothExport.extractRawText ?? (mammothModule as any).extractRawText) as ReturnType<typeof vi.fn>;

const createRecord = (overrides: Partial<StoredUploadRecord>): StoredUploadRecord => ({
  fileId: 'doc-1',
  originalName: 'sample.txt',
  storedName: 'doc-1.txt',
  storedPath: '/mock/path/doc-1.txt',
  mimeType: 'text/plain',
  size: 128,
  uploadedAt: new Date().toISOString(),
  ...overrides,
});

afterEach(() => {
  readFileSpy.mockReset();
  mockedPdfParse.mockReset();
  mockedMammoth.mockReset();
});

describe('documentParser', () => {
  it('detects supported formats by mime and extension', () => {
    expect(
      isSupportedDocument(createRecord({ mimeType: 'application/pdf', storedName: 'file.pdf', originalName: 'file.pdf' }))
    ).toBeTruthy();
    expect(
      isSupportedDocument(createRecord({ mimeType: 'text/plain', storedName: 'note.txt', originalName: 'note.txt' }))
    ).toBeTruthy();
    expect(
      isSupportedDocument(
        createRecord({
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          storedName: 'table.xlsx',
          originalName: 'table.xlsx',
        })
      )
    ).toBeTruthy();
    expect(
      isSupportedDocument(
        createRecord({ mimeType: 'application/msword', storedName: 'legacy.doc', originalName: 'legacy.doc' })
      )
    ).toBeFalsy();
  });

  it('parses plain text documents', async () => {
    readFileSpy.mockResolvedValueOnce(Buffer.from('First line\nSecond line'));
    const result = await parseDocumentAttachment(createRecord({}));
    expect(result.text).toContain('First line');
    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.excerpt.length).toBeGreaterThan(0);
  });

  it('parses pdf documents', async () => {
    readFileSpy.mockResolvedValueOnce(Buffer.from('PDF'));
    mockedPdfParse.mockResolvedValueOnce({
      text: 'PDF example content\nSecond paragraph',
      numpages: 2,
      info: { Author: 'Tester' },
    });
    const result = await parseDocumentAttachment(
      createRecord({
        mimeType: 'application/pdf',
        storedName: 'sample.pdf',
        originalName: 'sample.pdf',
      })
    );
    expect(result.metadata.pages).toBe(2);
    expect(result.excerpt).toContain('PDF example content');
  });

  it('parses docx documents', async () => {
    mockedMammoth.mockResolvedValueOnce({
      value: 'This is a docx body. It contains another sentence.',
      messages: [],
    });
    const result = await parseDocumentAttachment(
      createRecord({
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        storedName: 'demo.docx',
        originalName: 'demo.docx',
      })
    );
    expect(result.excerpt).toContain('docx body');
  });

  it('parses xlsx documents', async () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['姓名', '分数'],
      ['张三', 95],
      ['李四', 88],
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, '成绩');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Uint8Array;
    readFileSpy.mockResolvedValueOnce(Buffer.from(buffer));

    const result = await parseDocumentAttachment(
      createRecord({
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        storedName: 'scores.xlsx',
        originalName: 'scores.xlsx',
      })
    );

    expect(result.excerpt).toContain('成绩');
    const metadata = result.metadata as { sheetNames?: string[]; sheets?: Array<{ name: string }> };
    expect(metadata.sheetNames).toContain('成绩');
    expect(metadata.sheets?.[0]?.name).toBe('成绩');
  });
});
