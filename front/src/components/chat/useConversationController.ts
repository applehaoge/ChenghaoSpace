import { useState, useEffect, useRef, useCallback } from 'react';
import type { RefObject } from 'react';
import { toast } from 'sonner';
import { aiService } from '@/api/aiService';
import { createSessionId } from '@/pages/home/taskUtils';
import type { ChatBubble, UploadedAttachment } from '@/pages/home/types';

type UseConversationControllerParams = {
  conversationId: string;
  initialMessage: string;
  initialMessages: ChatBubble[];
  sessionId?: string;
  onConversationUpdate: (conversationId: string, messages: ChatBubble[]) => void;
  onSessionChange: (conversationId: string, sessionId: string) => void;
  onInitialMessageHandled?: () => void;
};

type ConversationControllerReturn = {
  messages: ChatBubble[];
  composerValue: string;
  setComposerValue: (value: string) => void;
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
  textareaRef: RefObject<HTMLTextAreaElement>;
  adjustTextareaHeight: () => void;
  sendMessage: (content: string, attachments: UploadedAttachment[]) => Promise<boolean>;
  handleCopy: (content: string) => Promise<void>;
};

export function useConversationController({
  conversationId,
  initialMessage,
  initialMessages,
  sessionId,
  onConversationUpdate,
  onSessionChange,
  onInitialMessageHandled,
}: UseConversationControllerParams): ConversationControllerReturn {
  const [messages, setMessages] = useState<ChatBubble[]>(() => initialMessages);
  const [composerValue, setComposerValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const streamingTimersRef = useRef<Record<string, number>>({});
  const lastInitialMessageRef = useRef<{ conversationId: string | null; message: string | null }>({
    conversationId: null,
    message: null,
  });
  const sessionIdRef = useRef<string>(sessionId ?? '');
  const conversationIdRef = useRef(conversationId);
  const lastConversationIdRef = useRef<string | null>(null);
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
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    messagesRegistryRef.current[conversationId] = messages;
    currentMessagesRef.current = messages;
  }, [conversationId, messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [composerValue, adjustTextareaHeight]);

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
    onSessionChange(conversationIdRef.current, next);
  }, [onSessionChange]);

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
            msg.id === messageId
              ? { ...msg, content: nextContent, isStreaming: !finished }
              : msg
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
      const requestConversationId = conversationIdRef.current;
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
          // AI 回复只显示文字，不重复附带用户上传的文件
          attachments: undefined,
        };

        updateConversationMessages(requestConversationId, prev => [...prev, assistantMessage]);

        if (!response.success || !text) {
          clearStreamingTimer(assistantMessage.id);
          updateConversationMessages(requestConversationId, prev =>
            prev.map(msg =>
              msg.id === assistantMessage.id
                ? {
                    ...msg,
                    content: response.error || '抱歉，暂时无法获取回复，请稍后再试。',
                    isStreaming: false,
                  }
                : msg
            )
          );
          toast.error(response.error || '获取回复失败，请稍后再试');
          return false;
        }

        startStreaming(text, assistantMessage.id, requestConversationId);
        return true;
      } catch (error) {
        clearStreamingTimer();
        console.error('调用对话接口失败:', error);
        updateConversationMessages(requestConversationId, prev =>
          prev.map(msg =>
            msg.isStreaming && msg.sender === 'ai'
              ? {
                  ...msg,
                  content: '抱歉，调用接口时出现异常，请稍后再试。',
                  isStreaming: false,
                  error: (error as Error)?.message,
                }
              : msg
          )
        );
        toast.error('调用后端接口失败');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [clearStreamingTimer, startStreaming, updateConversationMessages]
  );

  const sendMessage = useCallback(
    async (content: string, attachments: UploadedAttachment[]) => {
      const trimmed = content.trim();
      if (!trimmed) return false;

      const userBubble: ChatBubble = {
        id: `msg_${Date.now()}_user`,
        content: trimmed,
        sender: 'user',
        timestamp: new Date().toISOString(),
        attachments: attachments.length ? attachments : undefined,
      };

      updateConversationMessages(conversationIdRef.current, prev => [...prev, userBubble]);
      setComposerValue('');
      return fetchAssistantReply(trimmed, attachments);
    },
    [fetchAssistantReply, updateConversationMessages]
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

  useEffect(
    () => () => {
      clearStreamingTimer();
    },
    [clearStreamingTimer]
  );

  useEffect(() => {
    if (lastConversationIdRef.current === conversationId) {
      return;
    }

    lastConversationIdRef.current = conversationId;
    clearStreamingTimer();
    messagesRegistryRef.current[conversationId] = initialMessages;
    currentMessagesRef.current = initialMessages;
    setMessages(initialMessages);
    setComposerValue('');
    lastInitialMessageRef.current = { conversationId, message: null };
  }, [conversationId, initialMessages, clearStreamingTimer]);

  useEffect(() => {
    sessionIdRef.current = sessionId ?? '';
    if (!sessionIdRef.current) {
      resetSession();
    }
  }, [sessionId, resetSession]);

  useEffect(() => {
    const trimmed = initialMessage.trim();
    const lastHandled = lastInitialMessageRef.current;

    if (!trimmed) {
      if (lastHandled.conversationId === conversationId) {
        lastInitialMessageRef.current = { conversationId, message: null };
      }
      return;
    }

    if (lastHandled.conversationId === conversationId && lastHandled.message === trimmed) {
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
    setComposerValue('');
    void fetchAssistantReply(trimmed, []);
  }, [
    conversationId,
    initialMessage,
    onInitialMessageHandled,
    resetSession,
    clearStreamingTimer,
    updateConversationMessages,
    fetchAssistantReply,
  ]);

  return {
    messages,
    composerValue,
    setComposerValue,
    isLoading,
    messagesEndRef,
    textareaRef,
    adjustTextareaHeight,
    sendMessage,
    handleCopy,
  };
}
