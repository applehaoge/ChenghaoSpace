const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8302';

const toAbsoluteUrl = (raw?: string | null) => {
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('//')) {
    return `http:${raw}`;
  }
  try {
    return new URL(raw, API_BASE).toString();
  } catch (error) {
    console.warn('无法解析 URL，保留原值:', raw, error);
    return raw;
  }
};

type ChatResult = {
  success: boolean;
  answer?: string;
  result?: string;
  error?: string;
  sources?: Array<{ id: string; text: string; score?: number }>;
  provider?: string;
  attachments?: Array<{
    fileId: string;
    name: string;
    mimeType: string;
    size: number;
    previewUrl?: string;
    downloadUrl?: string;
    publicPath?: string;
  }>;
};

type AttachmentPayload = {
  fileId: string;
  name: string;
  mimeType: string;
  size: number;
  previewUrl?: string;
  downloadUrl?: string;
  publicPath?: string;
};

type ChatRequestOptions = {
  sessionId?: string;
  conversationId?: string;
  userMessage?: string;
  topK?: number;
  taskType?: string;
  extraContext?: Record<string, unknown>;
  attachments?: AttachmentPayload[];
};

type UploadResult = {
  success: boolean;
  fileId?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  url?: string;
  downloadUrl?: string;
  publicPath?: string;
  error?: string;
};

export interface AIService {
  createNewTask(
    taskType: string,
    content: string
  ): Promise<{ success: boolean; taskId?: string; message?: string }>;
  sendAIRequest(taskType: string, prompt: string, options?: ChatRequestOptions): Promise<ChatResult>;
  optimizeContent(content: string): Promise<{
    success: boolean;
    optimizedContent?: string;
    suggestions?: string[];
    error?: string;
  }>;
  getProjectDetails(projectId: string): Promise<{
    success: boolean;
    project?: {
      id: string;
      title: string;
      description: string;
      imageUrl: string;
      bgColor: string;
      createdAt: string;
      updatedAt: string;
    };
    error?: string;
  }>;
  getInspiration(): Promise<{ success: boolean; inspiration?: string; error?: string }>;
  uploadFile(file: File): Promise<UploadResult>;
}

class AIServiceImpl implements AIService {
  async createNewTask(taskType: string, _content: string) {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return {
      success: true,
      taskId,
      message: `已创建${taskType}任务`,
    };
  }

  async sendAIRequest(
    taskType: string,
    prompt: string,
    options: ChatRequestOptions = {}
  ): Promise<ChatResult> {
    if (taskType === '聊天') {
      const payload: ChatRequestOptions = {
        ...options,
        taskType,
        userMessage: options.userMessage ?? prompt,
      };
      return this.invokeChatEndpoint(prompt, payload);
    }

    const query = this.buildTaskPrompt(taskType, prompt);
    return this.invokeChatEndpoint(query, { ...options, taskType });
  }

  async optimizeContent(content: string) {
    const instruction = [
      '请根据以下文本进行优化，要求：',
      '1. 保持核心信息准确；',
      '2. 结构清晰、语言流畅；',
      '3. 给出 2 条可参考的优化建议；',
      '',
      content,
    ].join('\n');

    const response = await this.invokeChatEndpoint(instruction, { taskType: '内容优化' });
    if (!response.success || !response.answer) {
      return { success: false, error: response.error || '内容优化失败' };
    }

    const suggestions: string[] = [];
    const suggestionMatches =
      response.answer.match(/(?:建议|提示)[\d一二三四五六七八九十]+[:：]\s*(.*)/g);
    if (suggestionMatches) {
      suggestionMatches.forEach(item => {
        const cleaned = item.replace(/^(?:建议|提示)[\d一二三四五六七八九十]+[:：]\s*/, '').trim();
        if (cleaned) suggestions.push(cleaned);
      });
    }

    return {
      success: true,
      optimizedContent: response.answer,
      suggestions,
    };
  }

  async getProjectDetails(projectId: string) {
    const projects: Record<string, any> = {
      project_ai_writing: {
        id: 'project_ai_writing',
        title: 'AI 智能写作助手',
        description:
          '基于大模型的写作工具，可快速生成多种格式内容，并支持多语言写作。',
        imageUrl:
          'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=AI%20writing%20assistant%2C%20modern%20flat%20design%2C%20blue%20palette',
        bgColor: '#eff6ff',
        createdAt: '2025-10-01T08:30:00Z',
        updatedAt: '2025-10-20T09:12:00Z',
      },
    };

    const project = projects[projectId];
    if (!project) {
      return { success: false, error: '未找到对应的项目信息' };
    }

    return { success: true, project };
  }

  async getInspiration() {
    const ideas = [
      '尝试把最近的灵感整理成一篇 25 分钟的分享稿。',
      '从标题开始发散：列举 5 个完全不同的封面与故事线。',
      '记录一次让你印象深刻的对话，写成未来的演讲稿。',
    ];
    return {
      success: true,
      inspiration: ideas[Math.floor(Math.random() * ideas.length)],
    };
  }

  async uploadFile(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `上传失败，状态码 ${res.status}`);
      }

      const data = await res.json();
      const absoluteUrl = toAbsoluteUrl(data.downloadUrl || data.url || data.publicPath);

      return {
        success: true,
        fileId: data.fileId,
        fileName: data.fileName || data.filename,
        mimeType: data.mimeType,
        size: data.size,
        url: absoluteUrl,
        downloadUrl: absoluteUrl,
        publicPath: data.publicPath,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '上传失败';
      console.error('上传文件失败:', error);
      return { success: false, error: message };
    }
  }

  private async invokeChatEndpoint(query: string, extra: ChatRequestOptions = {}): Promise<ChatResult> {
    try {
      const payload: Record<string, unknown> = {
        query,
        topK: extra.topK ?? 3,
      };

      if (extra.taskType) payload.taskType = extra.taskType;
      if (extra.sessionId) payload.sessionId = extra.sessionId;
      if (extra.conversationId) payload.conversationId = extra.conversationId;
      if (extra.userMessage) payload.userMessage = extra.userMessage;
      if (extra.attachments && extra.attachments.length > 0) {
        payload.attachments = extra.attachments;
      }
      if (extra.extraContext) Object.assign(payload, extra.extraContext);

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `调用失败，状态码 ${res.status}`);
      }

      const data = await res.json();
      const answer = data.answer || data.result || '';
      const attachments = Array.isArray(data.attachments)
        ? (data.attachments
            .map((att: any) => {
              if (!att) return null;
              const fileId = att.fileId ?? att.id;
              if (!fileId) return null;
              const download = toAbsoluteUrl(att.downloadUrl || att.url || att.publicPath);
              const preview = toAbsoluteUrl(att.previewUrl) || download;
              const sizeValue =
                typeof att.size === 'number'
                  ? att.size
                  : Number.isFinite(Number(att.size))
                    ? Number(att.size)
                    : undefined;
              return {
                fileId,
                name: att.name ?? att.fileName ?? '附件',
                mimeType: att.mimeType ?? att.type ?? 'application/octet-stream',
                size: sizeValue ?? 0,
                previewUrl: preview,
                downloadUrl: download,
                publicPath: att.publicPath,
              };
            })
            .filter(Boolean) as ChatResult['attachments'])
        : undefined;
      return {
        success: true,
        answer,
        result: answer,
        sources: data.sources || [],
        provider: data.provider,
        attachments,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '调用后端接口失败';
      console.error('调用后端接口失败:', error);
      return { success: false, error: message };
    }
  }

  private buildTaskPrompt(taskType: string, prompt: string) {
    const instructions: Record<string, string> = {
      写作: '请帮我围绕以下主题写一段内容：',
      PPT: '请根据用户的输入，输出 PPT 的 3-5 个关键要点：',
      策划: '请列出策划方案的核心结构与关键元素：',
      Excel: '请说明如何使用 Excel 实现需求，并给出示例公式：',
      网页: '请输出网页设计的结构与实现思路：',
      剧本: '请给出剧本的分幕结构与场景要点：',
    };
    const instruction = instructions[taskType] || '请根据上下文提供高质量回答：';
    return `${instruction}\n\n${prompt}`;
  }
}

export const aiService: AIService = new AIServiceImpl();
