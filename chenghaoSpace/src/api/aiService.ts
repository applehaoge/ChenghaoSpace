const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8302';

type ChatResult = {
  success: boolean;
  answer?: string;
  result?: string;
  error?: string;
  sources?: Array<{ id: string; text: string; score?: number }>;
  provider?: string;
};

export interface AIService {
  createNewTask(taskType: string, content: string): Promise<{ success: boolean; taskId?: string; message?: string }>;
  sendAIRequest(taskType: string, prompt: string): Promise<ChatResult>;
  optimizeContent(content: string): Promise<{ success: boolean; optimizedContent?: string; suggestions?: string[]; error?: string }>;
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
}

class AIServiceImpl implements AIService {
  async createNewTask(taskType: string, content: string) {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return {
      success: true,
      taskId,
      message: `已创建 ${taskType} 任务`
    };
  }

  async sendAIRequest(taskType: string, prompt: string): Promise<ChatResult> {
    const query = this.buildTaskPrompt(taskType, prompt);
    return this.invokeChatEndpoint(query);
  }

  async optimizeContent(content: string) {
    const instruction = [
      '请帮我优化下面的文本，要求：',
      '1. 保持语义准确。',
      '2. 结构清晰、精炼。',
      '3. 列出 2 条可以参考的优化建议。',
      '',
      content
    ].join('\n');

    const response = await this.invokeChatEndpoint(instruction);
    if (!response.success || !response.answer) {
      return { success: false, error: response.error || '内容优化失败' };
    }

    const suggestions: string[] = [];
    const suggestionMatches = response.answer.match(/(?:建议|提示)[：:]\s*(.*)/g);
    if (suggestionMatches) {
      suggestionMatches.forEach(item => {
        const cleaned = item.replace(/^(?:建议|提示)[：:]\s*/, '').trim();
        if (cleaned) suggestions.push(cleaned);
      });
    }

    return {
      success: true,
      optimizedContent: response.answer,
      suggestions
    };
  }

  async getProjectDetails(projectId: string) {
    const projects: Record<string, any> = {
      project_ai_writing: {
        id: 'project_ai_writing',
        title: 'AI 智能写作助手',
        description: '基于豆包大模型的写作助手，可快速生成高质量内容并支持多轮润色。',
        imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=AI%20writing%20assistant%2C%20modern%20flat%20design%2C%20blue%20palette',
        bgColor: '#eff6ff',
        createdAt: '2025-10-01T08:30:00Z',
        updatedAt: '2025-10-20T09:12:00Z'
      }
    };

    const project = projects[projectId];
    if (!project) {
      return { success: false, error: '未找到对应项目' };
    }

    return { success: true, project };
  }

  async getInspiration() {
    const ideas = [
      '尝试把今天的工作拆分成三个 25 分钟的番茄钟。',
      '把手头的任务分类：必须做、应该做、可以做。',
      '记录一次灵感闪现的瞬间，帮助未来的自己。'
    ];
    return {
      success: true,
      inspiration: ideas[Math.floor(Math.random() * ideas.length)]
    };
  }

  private async invokeChatEndpoint(query: string): Promise<ChatResult> {
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, topK: 3 })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `调用失败，状态码 ${res.status}`);
      }

      const data = await res.json();
      const answer = data.answer || data.result || '';
      return {
        success: true,
        answer,
        result: answer,
        sources: data.sources || [],
        provider: data.provider
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '调用后端接口失败';
      console.error('调用后端接口失败:', error);
      return { success: false, error: message };
    }
  }

  private buildTaskPrompt(taskType: string, prompt: string) {
    const instructions: Record<string, string> = {
      写作: '请基于以下需求生成一段高质量的中文内容：',
      PPT: '请根据用户需求输出 PPT 大纲，包含 3-5 个要点：',
      设计: '请提出设计思路与关键元素：',
      Excel: '请给出可在 Excel 中实现的方案与公式：',
      网页: '请给出网页规划与实现建议：',
      播客: '请给出播客节目脚本与结构建议：'
    };
    const instruction = instructions[taskType] || '请根据以下输入提供最佳回答：';
    return `${instruction}\n\n${prompt}`;
  }
}

export const aiService: AIService = new AIServiceImpl();
