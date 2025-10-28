import { useState, useEffect, useRef, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { aiService } from '@/api/aiService';
import { AttachmentBadge, useFileUploader } from '@/components/attachments';
import { createSessionId } from '@/pages/home/taskUtils';
import type { ChatBubble, UploadedAttachment } from '@/pages/home/types';
import { ChatMessage } from '@/components/chat/ChatMessage';


export type ChatInterfaceProps = {
  conversationId: string;
  title: string;
  initialMessage: string;
  initialMessages: ChatBubble[];
  sessionId?: string;
  onBack: () => void;
  onConversationUpdate: (conversationId: string, messages: ChatBubble[]) => void;
  onSessionChange: (conversationId: string, sessionId: string) => void;
  onInitialMessageHandled?: () => void;
};

export function ChatInterface({
  conversationId,
  title,
  initialMessage,
  initialMessages,
  sessionId,
  onBack,
  onConversationUpdate,
  onSessionChange,
  onInitialMessageHandled,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatBubble[]>(() => initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const {
    attachments: chatAttachments,
    hasUploading: chatHasUploading,
    triggerFileDialog: openChatFileDialog,
    fileInputRef: chatFileInputRef,
    handleInputChange: handleChatFileInputChange,
    removeAttachment: removeChatAttachment,
    clearAttachments: clearChatAttachments,
  } = useFileUploader();
  const lastInitialMessageRef = useRef<{ conversationId: string | null; message: string | null }>(
    {
      conversationId: null,
      message: null,
    }
  );
  const streamingTimersRef = useRef<Record<string, number>>({});
  const sessionIdRef = useRef<string>(sessionId ?? '');
  const lastConversationIdRef = useRef<string | null>(null);
  const conversationIdRef = useRef(conversationId);
  const messagesRegistryRef = useRef<Record<string, ChatBubble[]>>({
    [conversationId]: initialMessages,
  });
  const currentMessagesRef = useRef<ChatBubble[]>(initialMessages);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const minHeight = 56;
    const maxHeight = 220;
    el.style.height = 'auto';
    const targetHeight = Math.min(maxHeight, el.scrollHeight);
    el.style.height = `${Math.max(minHeight, targetHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [newMessage, adjustTextareaHeight]);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    messagesRegistryRef.current[conversationId] = messages;
    currentMessagesRef.current = messages;
  }, [conversationId, messages]);

  const clearStreamingTimer = useCallback((id?: string) => {
    if (id) {
      const timer = streamingTimersRef.current[id];
      if (timer) {
        window.clearInterval(timer);
        delete streamingTimersRef.current[id];
      }
      return;
    }
    Object.values(streamingTimersRef.current).forEach(timer => window.clearInterval(timer));
    streamingTimersRef.current = {};
  }, []);

  const updateConversationMessages = useCallback(
    (
      targetConversationId: string,
      updater: (prev: ChatBubble[]) => ChatBubble[]
    ) => {
      const base =
        targetConversationId === conversationIdRef.current
          ? currentMessagesRef.current
          : messagesRegistryRef.current[targetConversationId] ?? [];
      const snapshot = [...base];
      const nextMessages = updater(snapshot);
      messagesRegistryRef.current[targetConversationId] = nextMessages;
      if (targetConversationId === conversationIdRef.current) {
        setMessages(nextMessages);
        currentMessagesRef.current = nextMessages;
      }
      onConversationUpdate(targetConversationId, nextMessages);
      return nextMessages;
    },
    [onConversationUpdate]
  );

  const resetSession = useCallback(() => {
    const next = createSessionId();
    sessionIdRef.current = next;
    onSessionChange(conversationId, next);
  }, [conversationId, onSessionChange]);

  const startStreaming = useCallback(
    (fullText: string, messageId: string, targetConversationId: string) => {
      clearStreamingTimer(messageId);

      if (!fullText) {
        updateConversationMessages(targetConversationId, prev =>
          prev.map(msg =>
            msg.id === messageId ? { ...msg, content: '', isStreaming: false } : msg
          )
        );
        return;
      }

      const totalLength = fullText.length;
      const chunkSize = Math.max(1, Math.floor(totalLength / 80));
      let index = 0;

      const pushUpdate = () => {
        index = Math.min(index + chunkSize, totalLength);
        const nextContent = fullText.slice(0, index);
        const finished = index >= totalLength;

        updateConversationMessages(targetConversationId, prev =>
          prev.map(msg =>
            msg.id === messageId ? { ...msg, content: nextContent, isStreaming: !finished } : msg
          )
        );

        if (finished) {
          clearStreamingTimer(messageId);
        }
      };

      pushUpdate();

      if (index < totalLength) {
        const timer = window.setInterval(pushUpdate, 30);
        streamingTimersRef.current[messageId] = timer;
      }
    },
    [clearStreamingTimer, updateConversationMessages]
  );

  const fetchAssistantReply = useCallback(
    async (userMessage: string, messageAttachments: UploadedAttachment[]) => {
      setIsLoading(true);
      const requestConversationId = conversationId;
      try {
        const response = await aiService.sendAIRequest('聊天', userMessage, {
          sessionId: sessionIdRef.current,
          conversationId: requestConversationId,
          userMessage,
          attachments: messageAttachments,
        });
        const text = response.answer || response.result || '';

        const assistantMessage: ChatBubble = {
          id: `msg_${Date.now()}_ai`,
          content: '',
          sender: 'ai',
          timestamp: new Date().toISOString(),
          provider: response.provider,
          sources: response.sources,
          error: response.success ? undefined : response.error,
          isStreaming: true,
          attachments: response.attachments?.map(att => ({
            fileId: att.fileId,
            name: att.name,
            mimeType: att.mimeType,
            size: att.size,
            previewUrl: att.previewUrl || att.downloadUrl,
            downloadUrl: att.downloadUrl || att.previewUrl,
          })) ?? undefined,
        };


        updateConversationMessages(requestConversationId, prev => [...prev, assistantMessage]);

        if (!response.success || !text) {
          clearStreamingTimer(assistantMessage.id);
          updateConversationMessages(requestConversationId, prev =>
            prev.map(msg =>
              msg.id === assistantMessage.id
                ? {
                    ...msg,
                    content: response.error || '抱歉，本次未获取到回复，请稍后重试',
                    isStreaming: false,
                  }
                : msg
            )
          );
          toast.error(response.error || '内容生成失败，请稍后重试');
          return false;
        }

        startStreaming(text, assistantMessage.id, requestConversationId);
        return true;
      } catch (error) {
        clearStreamingTimer();
        console.error('调用聊天接口失败:', error);
        updateConversationMessages(requestConversationId, prev => [
          ...prev,
          {
            id: `msg_${Date.now()}_ai_error`,
            content: '抱歉，生成过程中出现错误，请稍后重试',
            sender: 'ai',
            timestamp: new Date().toISOString(),
            error: (error as Error)?.message,
          },
        ]);
        toast.error('调用后端接口失败');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, startStreaming, clearStreamingTimer, updateConversationMessages]
  );

  const handleCopy = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      toast.error('复制失败，请手动复制');
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return () => {
      clearStreamingTimer();
    };
  }, [clearStreamingTimer]);

  useEffect(() => {
    if (lastConversationIdRef.current === conversationId) {
      return;
    }

    lastConversationIdRef.current = conversationId;
    clearStreamingTimer();
    messagesRegistryRef.current[conversationId] = initialMessages;
    setMessages(initialMessages);
    currentMessagesRef.current = initialMessages;
    setNewMessage('');
    lastInitialMessageRef.current = { conversationId, message: null };
  }, [conversationId, clearStreamingTimer, initialMessages]);

  useEffect(() => {
    sessionIdRef.current = sessionId ?? '';
    if (!sessionIdRef.current) {
      resetSession();
    }
  }, [conversationId, sessionId, resetSession]);

  useEffect(() => {
    const trimmed = initialMessage.trim();
    const lastHandled = lastInitialMessageRef.current;

    if (!trimmed) {
      if (lastHandled.conversationId === conversationId) {
        lastInitialMessageRef.current = { conversationId, message: null };
      }
      return;
    }

    if (
      lastHandled.conversationId === conversationId &&
      lastHandled.message === trimmed
    ) {
      return;
    }
    lastInitialMessageRef.current = { conversationId, message: trimmed };
    onInitialMessageHandled?.();
    resetSession();

    const first: ChatBubble = {
      id: `msg_${Date.now()}_user`,
      content: trimmed,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    clearStreamingTimer();
    updateConversationMessages(conversationId, () => [first]);
    setNewMessage('');
    void fetchAssistantReply(trimmed, []);
  }, [
    conversationId,
    initialMessage,
    fetchAssistantReply,
    clearStreamingTimer,
    resetSession,
    onInitialMessageHandled,
    updateConversationMessages,
  ]);

  useEffect(() => {
    clearChatAttachments();
  }, [conversationId, clearChatAttachments]);

  const handleSendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || isLoading) return;
    if (chatHasUploading) {
      toast.info('请等待文件上传完成');
      return;
    }
    if (chatAttachments.some(item => item.status === 'error')) {
      toast.error('请先移除上传失败的附件');
      return;
    }

    const completedAttachments = chatAttachments
      .filter(item => item.status === 'done' && item.fileId)
      .map(item => ({
        fileId: item.fileId as string,
        name: item.name,
        mimeType: item.mimeType,
        size: item.size,
        previewUrl: item.previewUrl || item.downloadUrl,
        downloadUrl: item.downloadUrl || item.previewUrl,
      }));

    const hasInvalidMetadata = chatAttachments.some(
      item => item.status === 'done' && !item.fileId
    );
    if (hasInvalidMetadata) {
      toast.error('附件信息不完整，请重新上传文件');
      return;
    }

    const userBubble: ChatBubble = {
      id: `msg_${Date.now()}_user`,
      content: trimmed,
      sender: 'user',
      timestamp: new Date().toISOString(),
      attachments: completedAttachments.length ? completedAttachments : undefined,
    };
    updateConversationMessages(conversationId, prev => [...prev, userBubble]);
    setNewMessage('');
    const succeeded = await fetchAssistantReply(trimmed, completedAttachments);
    if (succeeded) {
      clearChatAttachments();
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (chatHasUploading) {
        toast.info('请等待文件上传完成');
        return;
      }
      void handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    openChatFileDialog();
  };

  const disableSend =
    !newMessage.trim() ||
    isLoading ||
    chatHasUploading ||
    chatAttachments.some(item => item.status === 'error');

  return (
    <main className="flex-1 w-[calc(100%-260px)] bg-white border-l border-gray-100 flex flex-col min-h-0">
      <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={onBack}>
            <i className="fas fa-arrow-left text-gray-500"></i>
          </button>
          <h2 className="text-lg font-medium text-gray-800">{title || 'AI对话机器人'}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <i className="fas fa-clock-rotate-left text-gray-500"></i>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <i className="fas fa-share-nodes text-gray-500"></i>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <i className="fas fa-file-export text-gray-500"></i>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <i className="fas fa-ellipsis text-gray-500"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 bg-gray-50 chat-window min-h-0">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} onCopy={handleCopy} />
        ))}


        {isLoading && (
          <div className="flex justify-start mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
              <i className="fas fa-robot text-blue-500"></i>
            </div>
            <div className="bg-white border border-gray-200 text-gray-800 p-4 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-5 border-t border-gray-100">
        <div className="flex gap-2.5 mb-3">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <i className="fas fa-microphone text-gray-500"></i>
          </button>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={handleFileUpload}
          >
            <i className="fas fa-paperclip text-gray-500"></i>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <i className="fas fa-smile text-gray-500"></i>
          </button>
        </div>
        {chatAttachments.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
            {chatAttachments.map(item => (
              <AttachmentBadge key={item.id} attachment={item} onRemove={removeChatAttachment} />
            ))}
          </div>
        )}
        <div className="flex gap-2.5">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={event => setNewMessage(event.target.value)}
            onKeyDown={handleKeyPress}
            onInput={adjustTextareaHeight}
            className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            placeholder="我指的是……"
            rows={2}
            style={{ minHeight: 56, maxHeight: 220 }}
          />
          <button
            className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center hover:shadow-md transition-all disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={disableSend}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
        <input
          ref={chatFileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleChatFileInputChange}
        />
      </div>
    </main>
  );
}
