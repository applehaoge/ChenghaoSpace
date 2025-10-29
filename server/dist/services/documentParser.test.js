import { afterEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
vi.mock('pdf-parse', () => ({
    default: vi.fn(),
}));
vi.mock('mammoth', () => ({
    default: {
        extractRawText: vi.fn(),
    },
}));
import { parseDocumentAttachment, isSupportedDocument } from './documentParser.js';
import pdfParseModule from 'pdf-parse';
import mammothModule from 'mammoth';
const readFileSpy = vi.spyOn(fs, 'readFile');
const mockedPdfParse = pdfParseModule;
const mammothExport = mammothModule.default ?? mammothModule;
const mockedMammoth = (mammothExport.extractRawText ?? mammothModule.extractRawText);
const createRecord = (overrides) => ({
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
        expect(isSupportedDocument(createRecord({ mimeType: 'application/pdf', storedName: 'file.pdf', originalName: 'file.pdf' }))).toBeTruthy();
        expect(isSupportedDocument(createRecord({ mimeType: 'text/plain', storedName: 'note.txt', originalName: 'note.txt' }))).toBeTruthy();
        expect(isSupportedDocument(createRecord({ mimeType: 'application/msword', storedName: 'legacy.doc', originalName: 'legacy.doc' }))).toBeFalsy();
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
        const result = await parseDocumentAttachment(createRecord({
            mimeType: 'application/pdf',
            storedName: 'sample.pdf',
            originalName: 'sample.pdf',
        }));
        expect(result.metadata.pages).toBe(2);
        expect(result.excerpt).toContain('PDF example content');
    });
    it('parses docx documents', async () => {
        mockedMammoth.mockResolvedValueOnce({
            value: 'This is a docx body. It contains another sentence.',
            messages: [],
        });
        const result = await parseDocumentAttachment(createRecord({
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            storedName: 'demo.docx',
            originalName: 'demo.docx',
        }));
        expect(result.excerpt).toContain('docx body');
    });
});
