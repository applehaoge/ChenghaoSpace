import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('../storage/uploadRegistry.js', () => ({
    getUploadRecord: vi.fn(),
}));
vi.mock('./doubaoImageService.js', () => ({
    analyzeAttachmentImage: vi.fn(),
}));
import { buildAttachmentContext } from './attachmentContext.js';
import { getUploadRecord } from '../storage/uploadRegistry.js';
import { analyzeAttachmentImage } from './doubaoImageService.js';
const mockedGetUploadRecord = vi.mocked(getUploadRecord);
const mockedAnalyzeAttachmentImage = vi.mocked(analyzeAttachmentImage);
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
            caption: '界面包含按钮与列表',
            warnings: [],
            width: 800,
            height: 600,
            provider: 'doubao',
            publicPath: '/uploads/img-1.png',
            downloadUrl: '/uploads/img-1.png',
        });
        const result = await buildAttachmentContext([
            { fileId: 'img-1', mimeType: 'image/png', size: 2048 },
        ]);
        expect(result.notes).toHaveLength(0);
        expect(result.contextText).toContain('附件1：产品截图.png');
        expect(result.contextText).toContain('基础信息：image/png，大小 2.0KB，尺寸 800×600');
        expect(result.contextText).toContain('图像描述：界面包含按钮与列表');
        expect(result.analyses).toHaveLength(1);
        expect(result.analyses[0]).toMatchObject({
            summary: '界面包含按钮与列表',
            width: 800,
            height: 600,
            provider: 'doubao',
            publicPath: '/uploads/img-1.png',
            downloadUrl: '/uploads/img-1.png',
        });
    });
    it('records notes for missing or unsupported attachments', async () => {
        mockedGetUploadRecord
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
            fileId: 'doc-1',
            originalName: '说明文档.pdf',
            storedName: 'doc-1.pdf',
            storedPath: '/mock/path',
            mimeType: 'application/pdf',
            size: 4096,
            uploadedAt: new Date().toISOString(),
        });
        const result = await buildAttachmentContext([
            { fileId: 'missing' },
            { fileId: 'doc-1', mimeType: 'application/pdf', size: 4096 },
            { fileId: 'doc-1' }, // 重复引用
        ]);
        expect(result.contextText).toContain('附件1：说明文档.pdf');
        expect(result.contextText).toContain('当前暂不支持自动解析该类型（仅支持图片识别）');
        expect(result.analyses).toHaveLength(0);
        expect(result.notes).toEqual([
            '未找到 ID 为 missing 的上传记录，可能文件已被清理。',
            '附件 doc-1 已处理，跳过重复引用。',
        ]);
    });
});
