import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('../storage/uploadRegistry.js', () => ({
    getUploadRecord: vi.fn(),
}));
vi.mock('./doubaoImageService.js', () => ({
    analyzeAttachmentImage: vi.fn(),
}));
vi.mock('./documentParser.js', () => ({
    parseDocumentAttachment: vi.fn(),
    isSupportedDocument: vi.fn(),
}));
import { buildAttachmentContext } from './attachmentContext.js';
import { getUploadRecord } from '../storage/uploadRegistry.js';
import { analyzeAttachmentImage } from './doubaoImageService.js';
import { parseDocumentAttachment, isSupportedDocument } from './documentParser.js';
const mockedGetUploadRecord = vi.mocked(getUploadRecord);
const mockedAnalyzeAttachmentImage = vi.mocked(analyzeAttachmentImage);
const mockedParseDocumentAttachment = vi.mocked(parseDocumentAttachment);
const mockedIsSupportedDocument = vi.mocked(isSupportedDocument);
afterEach(() => {
    vi.resetAllMocks();
});
describe('buildAttachmentContext', () => {
    it('collects context for image attachments', async () => {
        mockedGetUploadRecord.mockResolvedValueOnce({
            fileId: 'img-1',
            originalName: '产品截图.png',
            storedName: 'img-1.png',
            storedPath: '/mock/path',
            mimeType: 'image/png',
            size: 2048,
            uploadedAt: new Date().toISOString(),
        });
        mockedAnalyzeAttachmentImage.mockResolvedValueOnce({
            fileId: 'img-1',
            originalName: '产品截图.png',
            mimeType: 'image/png',
            size: 2048,
            caption: '界面展示按钮与列表。',
            warnings: [],
            width: 800,
            height: 600,
            provider: 'doubao',
            usage: {},
            previewUrl: '/uploads/img-1.png',
        });
        mockedIsSupportedDocument.mockReturnValue(false);
        const result = await buildAttachmentContext([{ fileId: 'img-1', mimeType: 'image/png', size: 2048 }]);
        expect(result.notes).toHaveLength(0);
        expect(result.contextText).toContain('附件1：产品截图.png');
        expect(result.contextText).toContain('基础信息：image/png');
        expect(result.contextText).toContain('图像描述：界面展示按钮与列表。');
        expect(result.analyses).toHaveLength(1);
        expect(result.analyses[0]).toMatchObject({
            fileId: 'img-1',
            caption: '界面展示按钮与列表。',
            provider: 'doubao',
            previewUrl: '/uploads/img-1.png',
        });
    });
    it('parses supported documents and records summary', async () => {
        mockedGetUploadRecord.mockResolvedValueOnce({
            fileId: 'doc-1',
            originalName: '说明文档.pdf',
            storedName: 'doc-1.pdf',
            storedPath: '/mock/path/doc-1.pdf',
            mimeType: 'application/pdf',
            size: 4096,
            uploadedAt: new Date().toISOString(),
        });
        mockedIsSupportedDocument.mockReturnValueOnce(true);
        mockedParseDocumentAttachment.mockResolvedValueOnce({
            text: '这是一个测试 PDF 文档，包含若干段落。\n第二段内容展示了主要要点。',
            excerpt: '这是一个测试 PDF 文档，包含若干段落。\n第二段内容展示了主要要点。',
            wordCount: 16,
            warnings: [],
            metadata: { pages: 2 },
        });
        const result = await buildAttachmentContext([{ fileId: 'doc-1', mimeType: 'application/pdf', size: 4096 }]);
        expect(result.notes).toHaveLength(0);
        expect(result.contextText).toContain('附件1：说明文档.pdf');
        expect(result.contextText).toContain('文档内容摘要：这是一个测试 PDF 文档，包含若干段落。');
        expect(result.analyses).toHaveLength(1);
        expect(result.analyses[0]).toMatchObject({
            fileId: 'doc-1',
            document: {
                wordCount: 16,
                metadata: { pages: 2 },
            },
        });
    });
    it('records notes for missing or duplicated attachments', async () => {
        mockedGetUploadRecord.mockResolvedValueOnce(null);
        const result = await buildAttachmentContext([
            { fileId: 'missing' },
            { fileId: 'missing' },
        ]);
        expect(result.contextText).toBe('');
        expect(result.analyses).toHaveLength(0);
        expect(result.notes).toEqual([
            '未找到 ID 为 missing 的上传记录，可能文件已被清理。',
            '附件 missing 已处理，跳过重复引用。',
        ]);
    });
});
