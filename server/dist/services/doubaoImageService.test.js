import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const { fetchMock, readFileMock, imageSizeMock } = vi.hoisted(() => ({
    fetchMock: vi.fn(),
    readFileMock: vi.fn(),
    imageSizeMock: vi.fn(() => ({ width: 640, height: 480 })),
}));
vi.mock('node-fetch', () => ({
    __esModule: true,
    default: fetchMock,
}));
vi.mock('node:fs', () => ({
    promises: {
        readFile: readFileMock,
    },
}));
vi.mock('image-size', () => ({
    imageSize: imageSizeMock,
}));
vi.mock('https-proxy-agent', () => ({
    HttpsProxyAgent: vi.fn(),
}));
vi.mock('./imageAnalyzer.js', () => ({
    analyzeImage: vi.fn(),
}));
import { analyzeAttachmentImage, analyzeImageWithDoubao, isDoubaoImageEnabled } from './doubaoImageService.js';
import { analyzeImage as analyzeWithOpenAI } from './imageAnalyzer.js';
const mockedAnalyzeWithOpenAI = vi.mocked(analyzeWithOpenAI);
const baseRecord = {
    fileId: 'img-1',
    originalName: '样例图片.png',
    storedName: 'img-1.png',
    storedPath: '/tmp/img-1.png',
    mimeType: 'image/png',
    size: 4096,
    uploadedAt: new Date().toISOString(),
};
describe('Doubao image service', () => {
    const originalEnv = { ...process.env };
    beforeEach(() => {
        fetchMock.mockReset();
        readFileMock.mockReset();
        imageSizeMock.mockReset();
        imageSizeMock.mockReturnValue({ width: 640, height: 480 });
        mockedAnalyzeWithOpenAI.mockReset();
        Object.assign(process.env, originalEnv);
        delete process.env.DOUBAO_API_KEY;
        delete process.env.DOUBAO_IMAGE_API_BASE;
        delete process.env.DOUBAO_IMAGE_MODEL;
        delete process.env.DOUBAO_IMAGE_MAX_BYTES;
    });
    afterEach(() => {
        Object.assign(process.env, originalEnv);
    });
    it('reports disabled state when API key is missing', () => {
        delete process.env.DOUBAO_API_KEY;
        expect(isDoubaoImageEnabled()).toBe(false);
    });
    it('falls back to OpenAI analyzer when Doubao is disabled', async () => {
        delete process.env.DOUBAO_API_KEY;
        mockedAnalyzeWithOpenAI.mockResolvedValueOnce({
            fileId: baseRecord.fileId,
            originalName: baseRecord.originalName,
            mimeType: baseRecord.mimeType,
            size: baseRecord.size,
            caption: 'OpenAI caption',
            warnings: [],
            provider: 'openai',
        });
        const result = await analyzeAttachmentImage(baseRecord);
        expect(fetchMock).not.toHaveBeenCalled();
        expect(mockedAnalyzeWithOpenAI).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({
            caption: 'OpenAI caption',
            provider: 'openai',
        });
    });
    it('returns Doubao caption when request succeeds', async () => {
        process.env.DOUBAO_API_KEY = 'test-key';
        readFileMock.mockResolvedValueOnce(Buffer.from('mock-image'));
        imageSizeMock.mockReturnValueOnce({ width: 1024, height: 768 });
        fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                choices: [
                    {
                        message: {
                            content: '这是一张测试图片描述。',
                        },
                    },
                ],
                usage: { input_tokens: 120, output_tokens: 80 },
            }),
        });
        const result = await analyzeImageWithDoubao(baseRecord);
        expect(readFileMock).toHaveBeenCalledWith(baseRecord.storedPath);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({
            caption: '这是一张测试图片描述。',
            provider: 'doubao',
            width: 1024,
            height: 768,
            usage: { input_tokens: 120, output_tokens: 80 },
        });
    });
    it('falls back to OpenAI analyzer when Doubao call fails', async () => {
        process.env.DOUBAO_API_KEY = 'test-key';
        readFileMock.mockResolvedValueOnce(Buffer.from('mock-image'));
        fetchMock.mockResolvedValueOnce({
            ok: false,
            status: 500,
            text: async () => 'bad request',
        });
        mockedAnalyzeWithOpenAI.mockResolvedValueOnce({
            fileId: baseRecord.fileId,
            originalName: baseRecord.originalName,
            mimeType: baseRecord.mimeType,
            size: baseRecord.size,
            caption: 'Fallback caption',
            warnings: ['OpenAI warning'],
            provider: 'openai',
        });
        const result = await analyzeAttachmentImage(baseRecord);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(mockedAnalyzeWithOpenAI).toHaveBeenCalledTimes(1);
        expect(result.caption).toBe('Fallback caption');
        expect(result.provider).toBe('openai');
        expect(result.warnings).toContain('OpenAI warning');
        expect(result.warnings.some(warning => warning.includes('豆包图像识别接口返回异常'))).toBe(true);
    });
});
