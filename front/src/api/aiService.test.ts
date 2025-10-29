import { afterEach, describe, expect, it, vi } from 'vitest';

import { aiService } from './aiService';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const createJsonResponse = (payload: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(payload), {
    status: init.status ?? 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('aiService.sendAIRequest', () => {
  it('sends chat payload with prompt and session info', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse({ answer: '好的' }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await aiService.sendAIRequest('聊天', '你好', {
      sessionId: 'sess-1',
      conversationId: 'conv-1',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:8302/api/chat');
    expect(options).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const body = JSON.parse((options as RequestInit).body as string);
    expect(body).toMatchObject({
      query: '你好',
      userMessage: '你好',
      taskType: '聊天',
      sessionId: 'sess-1',
      conversationId: 'conv-1',
      topK: 3,
    });

    expect(result.success).toBe(true);
    expect(result.answer).toBe('好的');
  });

  it('handles non-200 responses as failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('Service unavailable', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await aiService.sendAIRequest('聊天', 'ping');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Service unavailable');
    errorSpy.mockRestore();
  });
});

describe('aiService.uploadFile', () => {
  it('uploads file via multipart request and normalises response', async () => {
    const mockResponse = {
      fileId: 'file-1',
      fileName: 'demo.png',
      mimeType: 'image/png',
      size: 1024,
      downloadUrl: '/uploads/file-1',
    };

    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(mockResponse));
    vi.stubGlobal('fetch', fetchMock);

    const file = new File(['demo'], 'demo.png', { type: 'image/png' });
    const result = await aiService.uploadFile(file);

    expect(result.success).toBe(true);
    expect(result.fileId).toBe('file-1');
    expect(result.downloadUrl).toBe('http://localhost:8302/uploads/file-1');

    const [, options] = fetchMock.mock.calls[0];
    const body = (options as RequestInit).body;
    expect(body instanceof FormData).toBe(true);
    const appendedFile = (body as FormData).get('file');
    expect(appendedFile).toBeInstanceOf(File);
    expect((appendedFile as File).name).toBe('demo.png');
  });
});

