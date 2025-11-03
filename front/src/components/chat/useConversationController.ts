import { useState, useEffect, useRef, useCallback } from 'react';
import type { RefObject } from 'react';
import { toast } from 'sonner';
import { aiService } from '@/api/aiService';
import { createSessionId } from '@/pages/home/taskUtils';
import type { ChatBubble, UploadedAttachment } from '@/pages/home/types';

const STREAM_MIN_INTERVAL = 64;

type StreamingState = {
  pendingTokens: string[];
  displayedTokens: string[];
  timerId: number | null;
  lastFlushTime: number;
};

const getNow = () =>
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();

const tokenizeForStreaming = (raw: string): string[] => {
  if (!raw) return [];
  const pattern = /(\r\n|\n|\s+|[A-Za-z0-9]+|[\u4e00-\u9fff]|[。，！？、“”’·；：—……（）\[\]{}<>《》【】|\\-]|[^A-Za-z0-9\s])/g;
  const matches = raw.match(pattern);
  if (!matches) {
    return [raw];
  }
  return matches.filter(token => token.length > 0);
};

const getTokensPerTick = (pendingCount: number): number => {
  if (pendingCount > 220) return 4;
  if (pendingCount > 160) return 4;
  if (pendingCount > 110) return 3;
  if (pendingCount > 70) return 3;
  if (pendingCount > 36) return 2;
  if (pendingCount > 16) return 2;
  if (pendingCount > 8) return 2;
  return 1;
};

const getFlushDelay = (pendingCount: number): number => {
  if (pendingCount > 220) return 40;
  if (pendingCount > 160) return 48;
  if (pendingCount > 110) return 56;
  if (pendingCount > 70) return 64;
  if (pendingCount > 36) return 72;
  if (pendingCount > 16) return 84;
  if (pendingCount > 8) return 92;
  return STREAM_MIN_INTERVAL;
};

type UseConversationControllerParams = {
  conversationId: string;
  initialMessage: string;
  initialMessages: ChatBubble[];
  sessionId?: string;
  initialAttachments?: UploadedAttachment[];
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
  scrollToLatest: () => void;
  setAutoScrollEnabled: (value: boolean) => void;
};

export function useConversationController({
  conversationId,
  initialMessage,
  initialMessages,
  sessionId,
  initialAttachments,
  onConversationUpdate,
  onSessionChange,
  onInitialMessageHandled,
}: UseConversationControllerParams): ConversationControllerReturn {
  const [messages, setMessages] = useState<ChatBubble[]>(() => initialMessages);
  const [composerValue, setComposerValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastAutoScrollTimeRef = useRef(0);
  const streamingStateRef = useRef<Record<string, StreamingState>>({});
  const lastInitialMessageRef = useRef<{ conversationId: string | null; message: string | null }>({
    conversationId: null,
    message: null,
  });
  const initialAttachmentsRef = useRef<UploadedAttachment[]>(initialAttachments ?? []);
  const sessionIdRef = useRef<string>(sessionId ?? '');
  const conversationIdRef = useRef(conversationId);
  const lastConversationIdRef = useRef<string | null>(null);
  const messagesRegistryRef = useRef<Record<string, ChatBubble[]>>({
    [conversationId]: initialMessages,
  });
  const currentMessagesRef = useRef<ChatBubble[]>(initialMessages);
  const autoScrollEnabledRef = useRef(true);

  const scrollToBottomImmediate = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const autoScrollToBottom = useCallback(() => {
    if (!autoScrollEnabledRef.current) return;
    scrollToBottomImmediate();
  }, [scrollToBottomImmediate]);

  const setAutoScrollEnabled = useCallback((value: boolean) => {
    autoScrollEnabledRef.current = value;
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

  useEffect(() => {
    initialAttachmentsRef.current = initialAttachments ?? [];
  }, [initialAttachments]);

  const clearStreamingTimer = useCallback((id?: string) => {
    const cancel = (targetId: string) => {
      const state = streamingStateRef.current[targetId];
      if (!state) {
        return;
      }
      if (state.timerId != null) {
        window.clearTimeout(state.timerId);
      }
      delete streamingStateRef.current[targetId];
    };

    if (id) {
      cancel(id);
      return;
    }

    Object.keys(streamingStateRef.current).forEach(cancel);
    streamingStateRef.current = {};
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

  const scheduleTokenFlush = useCallback((messageId: string, targetConversationId: string) => {
    const state = streamingStateRef.current[messageId];
    if (!state || state.pendingTokens.length === 0) {
      clearStreamingTimer(messageId);
      return;
    }

    if (state.timerId != null) {
      window.clearTimeout(state.timerId);
    }

    const flushTokens = () => {
      const current = streamingStateRef.current[messageId];
      if (!current) {
        return;
      }

      if (current.pendingTokens.length === 0) {
        clearStreamingTimer(messageId);
        return;
      }

      const tokensToConsume = getTokensPerTick(current.pendingTokens.length);
      const nextTokens = current.pendingTokens.splice(0, tokensToConsume);
      if (nextTokens.length === 0) {
        clearStreamingTimer(messageId);
        return;
      }

      current.displayedTokens.push(...nextTokens);
      const nextContent = current.displayedTokens.join('');
      const remaining = current.pendingTokens.length;
      current.lastFlushTime = getNow();

      updateConversationMessages(targetConversationId, prev =>
        prev.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                content: nextContent,
                isStreaming: remaining > 0,
                streamingChunks:
                  remaining > 0 ? current.displayedTokens.slice() : undefined,
              }
            : msg
        )
      );

      const now = current.lastFlushTime;
      if (now - lastAutoScrollTimeRef.current > 120) {
        autoScrollToBottom();
        lastAutoScrollTimeRef.current = now;
      }

      if (remaining === 0) {
        clearStreamingTimer(messageId);
        return;
      }

      const delay = getFlushDelay(remaining);
      current.timerId = window.setTimeout(flushTokens, delay);
    };

    const initialDelay = getFlushDelay(state.pendingTokens.length);
    state.timerId = window.setTimeout(flushTokens, initialDelay);
  }, [autoScrollToBottom, clearStreamingTimer, updateConversationMessages]);

  const startStreaming = useCallback((fullText: string, messageId: string, targetConversationId: string) => {
    clearStreamingTimer(messageId);

    if (!fullText) {
      updateConversationMessages(targetConversationId, prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, content: '', isStreaming: false, streamingChunks: undefined }
            : msg
        )
      );
      return;
    }

    const tokens = tokenizeForStreaming(fullText);
    if (tokens.length === 0) {
      updateConversationMessages(targetConversationId, prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, content: fullText, isStreaming: false, streamingChunks: undefined }
            : msg
        )
      );
      return;
    }

    const initialBatchSize = Math.min(tokens.length, Math.max(1, Math.min(2, getTokensPerTick(tokens.length))));
    const initialTokens = tokens.splice(0, initialBatchSize);
    const initialContent = initialTokens.join('');

    const initialState: StreamingState = {
      pendingTokens: tokens,
      displayedTokens: initialTokens.slice(),
      timerId: null,
      lastFlushTime: getNow(),
    };

    streamingStateRef.current[messageId] = initialState;

    updateConversationMessages(targetConversationId, prev =>
      prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              content: initialContent,
              isStreaming: tokens.length > 0,
              streamingChunks: initialState.displayedTokens.slice(),
            }
          : msg
      )
    );

    lastAutoScrollTimeRef.current = getNow();
    autoScrollToBottom();

    if (tokens.length === 0) {
      clearStreamingTimer(messageId);
      return;
    }

    scheduleTokenFlush(messageId, targetConversationId);
  }, [autoScrollToBottom, clearStreamingTimer, scheduleTokenFlush, updateConversationMessages]);
  const fetchAssistantReply = useCallback(
    async (userMessage: string, messageAttachments: UploadedAttachment[]) => {
      setIsLoading(true);
      const requestConversationId = conversationIdRef.current;
      try {
        const response = await aiService.sendAIRequest('鑱婂ぉ', userMessage, {
          sessionId: sessionIdRef.current,
          conversationId: requestConversationId,
          userMessage,
          attachments: messageAttachments,
        });
        const text = response.answer || response.result || '';
        const responseAttachments = response.attachments ?? [];
        const attachmentNotes = response.attachmentNotes ?? [];

        if (attachmentNotes.length) {
          attachmentNotes.forEach((note, idx) => {
            toast.info(note, {
              id: `attachment-note-${requestConversationId}-${idx}`,
            });
          });
        }

        const warningMessages = responseAttachments.reduce<string[]>((accumulator, attachment) => {
          if (Array.isArray(attachment.warnings)) {
            attachment.warnings
              .map(item => (typeof item === 'string' ? item.trim() : ''))
              .filter((item): item is string => item.length > 0)
              .forEach(message => {
                if (!accumulator.includes(message)) {
                  accumulator.push(message);
                }
              });
          }
          return accumulator;
        }, []);

        warningMessages.forEach((message, idx) => {
          toast.warning(message, {
            id: `attachment-warning-${requestConversationId}-${idx}`,
          });
        });

        const assistantMessage: ChatBubble = {
          id: `msg_${Date.now()}_ai`,
          content: '',
          sender: 'ai',
          timestamp: new Date().toISOString(),
          provider: response.provider,
          sources: response.sources,
          error: response.success ? undefined : response.error,
          isStreaming: true,
          attachments: undefined,
          attachmentNotes: attachmentNotes.length ? attachmentNotes : undefined,
          streamingChunks: [],
        };

        updateConversationMessages(requestConversationId, prev => [...prev, assistantMessage]);

        if (!response.success || !text) {
          clearStreamingTimer(assistantMessage.id);
          updateConversationMessages(requestConversationId, prev =>
            prev.map(msg =>
              msg.id === assistantMessage.id
                ? {
                    ...msg,
                    content: response.error || '\u62b1\u6b49\uff0c\u6682\u65f6\u65e0\u6cd5\u83b7\u53d6\u56de\u590d\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002',
                    isStreaming: false,
                    streamingChunks: undefined,
                  }
                : msg
            )
          );
          toast.error(response.error || '\u83b7\u53d6\u56de\u590d\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5');
          return false;
        }

        startStreaming(text, assistantMessage.id, requestConversationId);
        return true;
      } catch (error) {
        clearStreamingTimer();
        console.error('\u8c03\u7528\u5bf9\u8bdd\u63a5\u53e3\u5931\u8d25:', error);
        updateConversationMessages(requestConversationId, prev =>
          prev.map(msg =>
            msg.isStreaming && msg.sender === 'ai'
              ? {
                  ...msg,
                  content: '\u62b1\u6b49\uff0c\u8c03\u7528\u63a5\u53e3\u65f6\u51fa\u73b0\u5f02\u5e38\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002',
                  isStreaming: false,
                  streamingChunks: undefined,
                  error: (error as Error)?.message,
                }
              : msg
          )
        );
        toast.error('\u8c03\u7528\u540e\u7aef\u63a5\u53e3\u5931\u8d25');
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
      if (!trimmed && attachments.length === 0) return false;

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
      toast.success('\u5df2\u590d\u5236\u5230\u526a\u8d34\u677f');
    } catch (error) {
      console.error('\u590d\u5236\u5931\u8d25:', error);
      toast.error('\u590d\u5236\u5931\u8d25\uff0c\u8bf7\u624b\u52a8\u590d\u5236');
    }
  }, []);

  useEffect(() => {
    autoScrollToBottom();
  }, [autoScrollToBottom, messages]);

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

    const attachmentsForInitial = initialAttachmentsRef.current;
    initialAttachmentsRef.current = [];

    const first: ChatBubble = {
      id: `msg_${Date.now()}_user`,
      content: trimmed,
      sender: 'user',
      timestamp: new Date().toISOString(),
      attachments: attachmentsForInitial.length ? attachmentsForInitial : undefined,
    };

    clearStreamingTimer();
    updateConversationMessages(conversationId, () => [first]);
    setComposerValue('');
    void fetchAssistantReply(trimmed, attachmentsForInitial);
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
    scrollToLatest: scrollToBottomImmediate,
    setAutoScrollEnabled,
  };
}



