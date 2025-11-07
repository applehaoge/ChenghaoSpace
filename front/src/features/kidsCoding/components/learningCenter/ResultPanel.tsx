import clsx from 'clsx';
import { toast } from 'sonner';

import {
  ACTION_LINK_CLASS,
  PANEL_BASE_CLASS,
  SECTION_HEADER_CLASS,
  SECTION_LABEL_CLASS,
  SECTION_TITLE_CLASS,
} from '@/features/kidsCoding/constants/learningCenter';
import { AiChatMessage, ResultFocus } from '@/features/kidsCoding/types/learningCenter';

interface ResultPanelProps {
  className?: string;
  showFullLayout: boolean;
  activeFocus: ResultFocus;
  onFocusChange: (focus: ResultFocus) => void;
  aiMessages: AiChatMessage[];
  aiInput: string;
  onAiInputChange: (value: string) => void;
  onSendMessage: () => void;
  onShowAssistantModal: () => void;
}

export function ResultPanel({
  className,
  showFullLayout,
  activeFocus,
  onFocusChange,
  aiMessages,
  aiInput,
  onAiInputChange,
  onSendMessage,
  onShowAssistantModal,
}: ResultPanelProps) {
  return (
    <aside className={clsx(PANEL_BASE_CLASS, className)}>
      <div className={clsx(SECTION_HEADER_CLASS, 'text-sm lg:flex-row lg:items-center lg:justify-between')}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className={SECTION_LABEL_CLASS}>运行结果</span>
          <span className={SECTION_TITLE_CLASS}>可视化 & AI 助手</span>
        </div>
        {!showFullLayout ? (
          <div className="mt-3 flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-300 lg:mt-0">
            {[
              { key: 'visualization', label: '可视化', icon: 'fa-display' },
              { key: 'ai', label: 'AI 助手', icon: 'fa-robot' },
            ].map(option => (
              <button
                key={option.key}
                type="button"
                onClick={() => onFocusChange(option.key as ResultFocus)}
                className={clsx(
                  'flex items-center gap-1 rounded-lg px-3 py-1 transition',
                  activeFocus === option.key
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700',
                )}
              >
                <i className={`fa-solid ${option.icon}`} />
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <button type="button" onClick={onShowAssistantModal} className={ACTION_LINK_CLASS}>
            查看教学资料
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4 pb-4 pt-4">
        {(showFullLayout || activeFocus === 'visualization') ? <VisualizationCard /> : null}
        {(showFullLayout || activeFocus === 'ai') ? (
          <AiAssistantCard
            aiInput={aiInput}
            aiMessages={aiMessages}
            onAiInputChange={onAiInputChange}
            onSendMessage={onSendMessage}
          />
        ) : null}
      </div>
    </aside>
  );
}

function VisualizationCard() {
  return (
    <div className="overflow-hidden rounded-2xl bg-slate-950/90 p-5 text-white shadow-inner">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>
          <i className="fa-solid fa-cubes me-2 text-blue-400" />
          可视化演示
        </span>
        <button
          type="button"
          onClick={() => toast.info('全屏演示模式即将推出')}
          className="rounded-lg px-3 py-1 text-xs text-slate-300 transition hover:bg-white/10"
        >
          <i className="fa-solid fa-up-right-and-down-left-from-center me-1" />
          全屏
        </button>
      </div>
      <div className="mt-6 flex h-full min-h-[220px] flex-col items-center justify-center gap-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-500 text-3xl font-bold shadow-lg shadow-blue-700/40">
          AI
        </div>
        <p className="max-w-xs text-center text-sm text-blue-100">
          小智正在依次执行问候、学习、工作、休息技能，运行时动画和状态条会同步刷新。
        </p>
        <div className="flex w-full max-w-xs justify-center gap-3 text-xs text-slate-200">
          <span>
            <i className="fa-solid fa-bolt me-1 text-amber-300" />
            能量 90%
          </span>
          <span>
            <i className="fa-solid fa-brain me-1 text-emerald-300" />
            知识 35%
          </span>
        </div>
      </div>
    </div>
  );
}

interface AiAssistantCardProps {
  aiMessages: AiChatMessage[];
  aiInput: string;
  onAiInputChange: (value: string) => void;
  onSendMessage: () => void;
}

function AiAssistantCard({ aiMessages, aiInput, onAiInputChange, onSendMessage }: AiAssistantCardProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-inner dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-robot text-blue-500" />
          <span className="font-medium text-slate-800 dark:text-slate-100">AI 编程助手</span>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-auto px-4 py-4 text-sm">
        {aiMessages.map(message => (
          <div key={message.id} className={clsx('flex', message.isAI ? 'justify-start' : 'justify-end')}>
            <div
              className={clsx(
                'max-w-[80%] rounded-2xl px-3 py-2',
                message.isAI
                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  : 'bg-blue-600 text-white',
              )}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex gap-2">
          <input
            value={aiInput}
            onChange={event => onAiInputChange(event.target.value)}
            placeholder="向 AI 编程助手提问，例如“帮我优化能量管理”"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
          />
          <button
            type="button"
            onClick={onSendMessage}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
