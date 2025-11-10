import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Bot, Maximize2, ChevronUp, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface InsightsSidebarProps {
  isDark: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}

const CARD_BASE =
  'rounded-3xl border shadow-xl backdrop-blur-md transition-colors p-5 flex flex-col gap-4';

export function InsightsSidebar({ isDark, isCollapsed, onToggle }: InsightsSidebarProps) {
  const [showVisualization, setShowVisualization] = useState(true);

  return (
    <div className={clsx('relative shrink-0 transition-all duration-300', isCollapsed ? 'w-0' : 'w-[320px]')}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={isCollapsed ? '展开洞察面板' : '收起洞察面板'}
        className={clsx(
          'absolute top-1/2 -left-5 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg transition-colors',
          isDark
            ? 'bg-gray-900/85 text-blue-200 border-blue-700/60 hover:bg-gray-800'
            : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50',
        )}
      >
        {isCollapsed ? <ArrowLeft size={16} strokeWidth={2.4} /> : <ArrowRight size={16} strokeWidth={2.4} />}
      </button>

      {!isCollapsed && (
        <div className="flex flex-col gap-4">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={clsx(
              CARD_BASE,
              isDark
                ? 'bg-gradient-to-b from-blue-900/60 to-blue-800/40 border-blue-700/40 text-gray-100'
                : 'bg-gradient-to-b from-blue-50/90 to-indigo-50/70 border-blue-100 text-slate-800',
            )}
          >
            <header className="flex items-center justify-between text-sm font-semibold">
              <span className="inline-flex items-center gap-2">可视化演示</span>
              <button
                type="button"
                className={clsx(
                  'flex items-center gap-1 text-xs font-medium',
                  isDark ? 'text-blue-200' : 'text-blue-600',
                )}
              >
                <Maximize2 size={14} />
                全屏
              </button>
            </header>

            <div className="flex items-center justify-between text-xs font-medium">
              <span
                className={clsx(
                  'rounded-full px-3 py-1 text-[11px]',
                  isDark ? 'bg-blue-800/40 text-blue-100' : 'bg-blue-100 text-blue-700',
                )}
              >
                小动画 / 图形
              </span>
              <button
                type="button"
                onClick={() => setShowVisualization(prev => !prev)}
                className={clsx(
                  'inline-flex items-center gap-1 text-xs font-medium',
                  isDark ? 'text-blue-200' : 'text-blue-600',
                )}
              >
                {showVisualization ? (
                  <>
                    <ChevronUp size={14} />
                    收起
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    展开
                  </>
                )}
              </button>
            </div>

            {showVisualization && (
              <div
                className={clsx(
                  'flex h-48 items-center justify-center rounded-2xl border-2 border-dashed text-sm',
                  isDark ? 'border-blue-500/40 text-blue-100' : 'border-blue-300 text-blue-500',
                )}
              >
                动画演示区域
              </div>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className={clsx(
              CARD_BASE,
              isDark ? 'bg-gray-900/70 border-gray-700 text-gray-50' : 'bg-white border-blue-100 text-slate-800',
            )}
          >
            <header className="flex items-center gap-2 text-sm font-semibold">
              <Bot size={16} />
              AI 编程助手
            </header>

            <div
              className={clsx(
                'rounded-2xl px-4 py-3 text-sm shadow-inner space-y-3',
                isDark ? 'bg-gray-800/80 text-gray-200' : 'bg-blue-50 text-slate-700',
              )}
            >
              <ChatBubble isDark={isDark} role="assistant" text="你好，我是小智，随时准备陪伴你完成挑战。" />
              <ChatBubble isDark={isDark} role="user" text="帮我检查循环里有没有越界问题？" />
              <ChatBubble
                isDark={isDark}
                role="assistant"
                text="第 18 行条件请改为 i < items.length，我已为你高亮。"
              />
            </div>
          </motion.section>
        </div>
      )}
    </div>
  );
}

function ChatBubble({ role, text, isDark }: { role: 'assistant' | 'user'; text: string; isDark: boolean }) {
  const isAssistant = role === 'assistant';
  return (
    <div
      className={clsx('rounded-2xl px-3 py-2 text-sm', {
        'self-start bg-blue-500/20 text-blue-100': isAssistant && isDark,
        'self-start bg-blue-100 text-blue-700': isAssistant && !isDark,
        'self-end bg-gray-700 text-gray-100': !isAssistant && isDark,
        'self-end bg-white text-slate-700 shadow': !isAssistant && !isDark,
      })}
    >
      {text}
    </div>
  );
}
