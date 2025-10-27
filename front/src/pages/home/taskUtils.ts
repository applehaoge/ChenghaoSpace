import type { ChatBubble, TaskConversation } from './types';

export const TASK_STORAGE_KEY = 'chspace_tasks_v1';

export const createSessionId = () =>
  `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const normalizeMessages = (messages: ChatBubble[]): ChatBubble[] =>
  messages.map(message => ({
    ...message,
    timestamp: message.timestamp || new Date().toISOString(),
    isStreaming: message.isStreaming ? false : message.isStreaming,
  }));

export const loadStoredTasks = (): TaskConversation[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(TASK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TaskConversation[];
    const filtered = parsed.filter(task => {
      if (!task || typeof task !== 'object') return false;
      const id = task.id ?? '';
      if (!id) return false;
      const messages = Array.isArray(task.messages) ? task.messages : [];
      const isPlaceholder = /^task_\d+$/.test(id);
      if (isPlaceholder && messages.length === 0) {
        return false;
      }
      return true;
    });

    return filtered.map(task => ({
      ...task,
      messages: normalizeMessages(task.messages ?? []),
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: task.updatedAt || new Date().toISOString(),
      sessionId: task.sessionId || createSessionId(),
    }));
  } catch (error) {
    console.error('读取本地任务记录失败:', error);
    return [];
  }
};

export const summarizeMessage = (text: string, limit = 24) => {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (!compact) return '';
  return compact.length > limit ? `${compact.slice(0, limit)}...` : compact;
};

const PLACEHOLDER_TITLE_PATTERN =
  /^(新聊天|未命名对话|AI对话|AI 对话|快速对话|待命名对话)/;

export const isPlaceholderName = (name: string) => {
  if (!name) return true;
  const trimmed = name.trim();
  if (!trimmed) return true;
  return PLACEHOLDER_TITLE_PATTERN.test(trimmed);
};

export const deriveConversationTitle = (
  messages: ChatBubble[],
  currentName: string
) => {
  const firstUserMessage = messages.find(
    msg => msg.sender === 'user' && msg.content?.trim()
  );
  if (!firstUserMessage) {
    return currentName;
  }

  const firstLine = firstUserMessage.content.split(/\r?\n+/)[0]?.trim() ?? '';
  if (!firstLine) {
    return currentName;
  }

  const cleaned = firstLine.replace(/^[#>*\-\d\.\)\(]+\s*/, '').trim();
  if (!cleaned) {
    return currentName;
  }

  const candidate = summarizeMessage(cleaned, 20);
  if (!candidate) {
    return currentName;
  }

  if (isPlaceholderName(currentName) || candidate !== currentName) {
    return candidate;
  }

  return currentName;
};
