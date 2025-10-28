import type { ChatBubble, TaskConversation, UploadedAttachment } from './types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8302';

const toAbsoluteUrl = (raw?: string | null) => {
  if (!raw) return undefined;
  if (/^(blob:|data:)/i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('//')) {
    return `http:${raw}`;
  }
  try {
    return new URL(raw, API_BASE).toString();
  } catch (error) {
    console.warn('无法解析附件 URL，保留原值:', raw, error);
    return raw;
  }
};

const normalizeAttachment = (attachment: UploadedAttachment): UploadedAttachment => {
  const existingDownload = toAbsoluteUrl(attachment.downloadUrl) || toAbsoluteUrl(attachment.previewUrl);
  let resolvedUrl = existingDownload;

  if (!resolvedUrl && attachment.fileId) {
    const name = attachment.name || '';
    const match = name.match(/(\.[a-zA-Z0-9]+)$/);
    const extension = match ? match[1].toLowerCase() : '';
    if (extension) {
      resolvedUrl = `${API_BASE}/uploads/${attachment.fileId}${extension}`;
    }
  }

  if (!resolvedUrl && attachment.publicPath) {
    resolvedUrl = toAbsoluteUrl(attachment.publicPath);
  }

  if (!resolvedUrl && attachment.fileId) {
    resolvedUrl = `${API_BASE}/uploads/${attachment.fileId}`;
  }

  const next: UploadedAttachment = {
    ...attachment,
    downloadUrl: resolvedUrl || attachment.downloadUrl,
  };

  if (resolvedUrl) {
    if (!next.previewUrl || next.previewUrl.startsWith('blob:')) {
      next.previewUrl = resolvedUrl;
    }
  }

  return next;
};

export const TASK_STORAGE_KEY = 'chspace_tasks_v1';

export const createSessionId = () =>
  `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const normalizeMessages = (messages: ChatBubble[]): ChatBubble[] =>
  messages.map(message => ({
    ...message,
    timestamp: message.timestamp || new Date().toISOString(),
    isStreaming: message.isStreaming ? false : message.isStreaming,
    attachments: Array.isArray(message.attachments)
      ? message.attachments.map(normalizeAttachment)
      : message.attachments,
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
