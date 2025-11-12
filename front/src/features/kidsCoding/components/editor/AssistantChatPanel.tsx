import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
  {
    id: 'static-1',
    role: 'assistant',
    text: '你好，我是小智～有任何代码报错、调试问题或学习想法都可以在下方告诉我，我会马上帮你分析。',
  },
];

export function AssistantChatPanel({ isDark }: AssistantChatPanelProps) {
  const [sessionId, setSessionId] = useState(() => createSessionId());
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

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

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = 'auto';
    const maxHeight = 160;
    const nextHeight = Math.min(input.scrollHeight, maxHeight);
    input.style.height = `${nextHeight}px`;
    input.style.overflowY = input.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [composerValue]);

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
        className="mt-auto flex items-end gap-2 text-sm"
        onSubmit={event => {
          void handleSubmit(event);
        }}
      >
        <textarea
          value={composerValue}
          disabled={isLoading}
          rows={1}
          onChange={event => setComposerValue(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void handleSubmit();
            }
          }}
          placeholder="输入你的问题或需求..."
          ref={inputRef}
          className={clsx(
              'flex-1 rounded-2xl border px-4 py-2 transition-colors focus:outline-none focus:ring-0 resize-none',
            isDark
              ? 'bg-gray-900/50 border-gray-700 text-gray-100 focus:border-blue-300 focus:bg-gray-900/60 focus:text-blue-50'
              : 'bg-white border-blue-200 text-slate-700 focus:border-blue-500 focus:bg-blue-50/90 focus:text-blue-700',
            isLoading ? 'opacity-70 cursor-not-allowed' : '',
          )}
        ></textarea>
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
