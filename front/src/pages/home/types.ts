export type UploadedAttachment = {
  fileId: string;
  name: string;
  mimeType: string;
  size: number;
  previewUrl?: string;
  downloadUrl?: string;
  publicPath?: string;
};

export type ChatBubble = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  provider?: string;
  sources?: Array<{ id: string; text: string; score?: number }>;
  error?: string;
  isStreaming?: boolean;
  attachments?: UploadedAttachment[];
};

export type TaskConversation = {
  id: string;
  name: string;
  icon: string;
  color: string;
  isBrand?: boolean;
  messages: ChatBubble[];
  createdAt: string;
  updatedAt: string;
  sessionId: string;
};
