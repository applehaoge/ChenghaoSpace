import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bot } from 'lucide-react';
import clsx from 'clsx';
import { useConversationController } from '@/components/chat/useConversationController';
import { KIDS_CODING_CONSOLE_ASK_AI } from '@/features/kidsCoding/constants/events';
import type { ChatBubble as AppChatBubble } from '@/pages/home/types';
import { createSessionId } from '@/pages/home/taskUtils';

type AssistantChatPanelProps = {
  isDark: boolean;
};

type SimpleBubble = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  isStreaming?: boolean;
};

const DEFAULT_STATIC_MESSAGES: SimpleBubble[] = [
  { id: 'static-1', role: 'assistant', text: 'ä½ å¥½ï¼ææ¯å°æºï¼éæ¶åå¤éªä½ å®æææåï½' },
  {
    id: 'static-2',
    role: 'assistant',
    text: 'æä¼å¸®ä½ æå¯è§åæ¼ç¤ºå AI å©ææçå¥½ï¼è®©å³ä¾§åºåå§ç»åç¼è¾å¨å¯¹é½ã',
  },
  { id: 'static-3', role: 'user', text: 'å¸®ææ£æ¥å¾ªç¯éææ²¡æè¶çé®é¢ï¼' },
  { id: 'static-4', role: 'assistant', text: 'å¥½çï¼ç¬¬ 18 è¡æ¡ä»¶éè¦æ¹æ i < items.lengthï¼æå·²ç»å¸®ä½ æ è®°å¦ã' },
];

export function AssistantChatPanel({ isDark }: AssistantChatPanelProps) {
  const [sessionId, setSessionId] = useState(() => createSessionId());
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    messages,
    composerValue,
    setComposerValue,
    isLoading,
    messagesEndRef,
    sendMessage,
    setAutoScrollEnabled,
  } = useConversationController({
    conversationId: 'kids-coding-editor-assistant',
    initialMessage: '',
    initialMessages: [],
    sessionId,
    onConversationUpdate: () => {},
    onSessionChange: useCallback((_, nextSessionId) => {
      setSessionId(nextSessionId);
    }, []),
  });

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const nearBottom = scrollHeight - (scrollTop + clientHeight) <= 48;
      setAutoScrollEnabled(nearBottom);
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [setAutoScrollEnabled]);

  const displayMessages: SimpleBubble[] = useMemo(() => {
    if (!messages.length) {
      return DEFAULT_STATIC_MESSAGES;
    }
    return messages.map<SimpleBubble>((message: AppChatBubble) => ({
      id: message.id,
      role: message.sender === 'user' ? 'user' : 'assistant',
      text: message.content || '',
      isStreaming: Boolean(message.isStreaming),
    }));
  }, [messages]);

  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();
      const trimmed = composerValue.trim();
      if (!trimmed || isLoading) return;
      await sendMessage(trimmed, []);
    },
    [composerValue, isLoading, sendMessage],
  );

  useEffect(() => {
    const handleConsoleAsk = (event: Event) => {
      const detail = (event as CustomEvent<{ text: string }>).detail;
      if (!detail?.text?.trim()) return;
      setComposerValue(detail.text);
      inputRef.current?.focus();
    };

    window.addEventListener(KIDS_CODING_CONSOLE_ASK_AI, handleConsoleAsk as EventListener);
    return () => window.removeEventListener(KIDS_CODING_CONSOLE_ASK_AI, handleConsoleAsk as EventListener);
  }, [setComposerValue]);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-hidden min-h-0">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Bot size={16} />
        AI 编程助手
      </div>

      <div
        ref={scrollContainerRef}
        className={clsx(
          'flex-1 space-y-3 overflow-y-auto rounded-2xl px-4 py-3 text-sm shadow-inner',
          isDark ? 'bg-gray-900/60 text-gray-100' : 'bg-blue-50 text-slate-700',
        )}
      >
        {displayMessages.map(bubble => (
          <SimpleChatBubble key={bubble.id} bubble={bubble} isDark={isDark} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        className="mt-auto flex items-center gap-2 text-sm"
        onSubmit={event => {
          void handleSubmit(event);
        }}
      >
        <input
          type="text"
          value={composerValue}
          disabled={isLoading}
          onChange={event => setComposerValue(event.target.value)}
          placeholder="输入你的问题或需求..."
          ref={inputRef}
          className={clsx(
            'flex-1 rounded-2xl border px-4 py-2 transition-colors focus:outline-none focus:ring-0',
            isDark
              ? 'bg-gray-900/50 border-gray-700 text-gray-100 focus:border-blue-300 focus:bg-gray-900/60 focus:text-blue-50'
              : 'bg-white border-blue-200 text-slate-700 focus:border-blue-500 focus:bg-blue-50/90 focus:text-blue-700',
            isLoading ? 'opacity-70 cursor-not-allowed' : '',
          )}
        />
        <button
          type="submit"
          disabled={isLoading || !composerValue.trim()}
          className={clsx(
            'rounded-2xl px-4 py-2 font-medium shadow transition-colors',
            isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-500 text-white hover:bg-blue-600',
            isLoading || !composerValue.trim() ? 'opacity-60 cursor-not-allowed' : '',
          )}
        >
          {isLoading ? '发送中...' : '发送'}
        </button>
      </form>
    </div>
  );
}

function SimpleChatBubble({ bubble, isDark }: { bubble: SimpleBubble; isDark: boolean }) {
  const isAssistant = bubble.role === 'assistant';
  const alignmentClass = isAssistant ? 'justify-start' : 'justify-end';

  return (
    <div className={clsx('flex w-full', alignmentClass)}>
      <div
        className={clsx(
          'inline-flex max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed',
          {
            'bg-blue-500/20 text-blue-100 text-left': isAssistant && isDark,
            'bg-blue-100 text-blue-700 text-left': isAssistant && !isDark,
            'bg-gray-700 text-gray-100 text-right': !isAssistant && isDark,
            'bg-white text-slate-700 shadow text-right': !isAssistant && !isDark,
          },
        )}
      >
        <span>
          {bubble.text || (isAssistant ? '小智正在思考...' : '...')}
          {bubble.isStreaming ? (
            <span className="ml-2 inline-flex items-center gap-1 text-xs opacity-70">
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              输入中
            </span>
          ) : null}
        </span>
      </div>
    </div>
  );
}
