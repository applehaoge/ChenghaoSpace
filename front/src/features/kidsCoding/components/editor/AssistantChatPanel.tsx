import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bot } from 'lucide-react';
import clsx from 'clsx';
import { useConversationController } from '@/components/chat/useConversationController';
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
  { id: 'static-1', role: 'assistant', text: '你好，我是小智，随时准备陪伴你完成挑战。' },
  {
    id: 'static-2',
    role: 'assistant',
    text: '收到，我会把可视化演示和 AI 助手整合后的右栏保持与编辑器等高，并让发送栏任何时候都可见。',
  },
  { id: 'static-3', role: 'user', text: '帮我检查循环里有没有越界问题？' },
  { id: 'static-4', role: 'assistant', text: '第 18 行条件请改为 i < items.length，我已为你高亮。' },
];

export function AssistantChatPanel({ isDark }: AssistantChatPanelProps) {
  const [sessionId, setSessionId] = useState(() => createSessionId());
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

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
    [composerValue, isLoading, sendMessage]
  );

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
          isDark ? 'bg-gray-900/60 text-gray-100' : 'bg-blue-50 text-slate-700'
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
          className={clsx(
            'flex-1 rounded-2xl border px-4 py-2 transition-colors focus:outline-none focus:ring-0',
            isDark
              ? 'bg-gray-900/50 border-gray-700 text-gray-100 focus:border-blue-300 focus:bg-gray-900/60 focus:text-blue-50'
              : 'bg-white border-blue-200 text-slate-700 focus:border-blue-500 focus:bg-blue-50/90 focus:text-blue-700',
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          )}
        />
        <button
          type="submit"
          disabled={isLoading || !composerValue.trim()}
          className={clsx(
            'rounded-2xl px-4 py-2 font-medium shadow transition-colors',
            isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-500 text-white hover:bg-blue-600',
            isLoading || !composerValue.trim() ? 'opacity-60 cursor-not-allowed' : ''
          )}
        >
          {isLoading ? '发送中…' : '发送'}
        </button>
      </form>
    </div>
  );
}

function SimpleChatBubble({ bubble, isDark }: { bubble: SimpleBubble; isDark: boolean }) {
  const isAssistant = bubble.role === 'assistant';
  return (
    <div
      className={clsx('rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed', {
        'self-start bg-blue-500/20 text-blue-100': isAssistant && isDark,
        'self-start bg-blue-100 text-blue-700': isAssistant && !isDark,
        'self-end bg-gray-700 text-gray-100 ml-auto': !isAssistant && isDark,
        'self-end bg-white text-slate-700 shadow ml-auto': !isAssistant && !isDark,
      })}
    >
      {bubble.text || (isAssistant ? '小智正在思考...' : '...')}
      {bubble.isStreaming ? (
        <span className="ml-2 inline-flex items-center gap-1 text-xs opacity-70">
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          输入中
        </span>
      ) : null}
    </div>
  );
}

