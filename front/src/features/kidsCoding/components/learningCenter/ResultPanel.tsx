import clsx from 'clsx';
import { toast } from 'sonner';

import {
  ACTION_LINK_CLASS,
  PANEL_BASE_CLASS,
  SECTION_HEADER_CLASS,
  SECTION_LABEL_CLASS,
} from '@/features/kidsCoding/constants/learningCenter';
import { AiChatMessage, ResultFocus } from '@/features/kidsCoding/types/learningCenter';
import type { VisualizationFrame } from '@/features/kidsCoding/types/visualization';
import { VisualizationViewer } from '@/features/kidsCoding/components/visualization/VisualizationViewer';

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
  enableCollapse?: boolean;
  onCollapse?: () => void;
  visualizationFrame?: VisualizationFrame;
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
  enableCollapse = false,
  onCollapse,
  visualizationFrame,
}: ResultPanelProps) {
  return (
    <aside className={clsx(PANEL_BASE_CLASS, className)}>
      <div className={clsx(SECTION_HEADER_CLASS, 'text-sm lg:flex-row lg:items-center lg:justify-between')}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className={SECTION_LABEL_CLASS}>杩愯缁撴灉</span>
        </div>
        <div
          className={clsx(
            'flex items-center gap-2',
            !showFullLayout && 'mt-3 flex-wrap lg:mt-0',
          )}
        >
          {!showFullLayout ? (
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              {[
                { key: 'visualization', label: '鍙鍖?, icon: 'fa-display' },
                { key: 'ai', label: 'AI 鍔╂墜', icon: 'fa-robot' },
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
              鏌ョ湅鏁欏璧勬枡
            </button>
          )}
          {enableCollapse && onCollapse ? (
            <button
              type="button"
              onClick={onCollapse}
              title="鎶樺彔杩愯缁撴灉"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4 pb-4 pt-4">
        {(showFullLayout || activeFocus === 'visualization') ? (
          <VisualizationCard frame={visualizationFrame} />
        ) : null}
        {(showFullLayout || activeFocus === 'ai') ? (
          <AiAssistantCard
            aiInput={aiInput}
            aiMessages={aiMessages}
            onAiInputChange={onAiInputChange}
            onSendMessage={onSendMessage}
            onShowAssistantModal={onShowAssistantModal}
            showResourceAction={!showFullLayout}
          />
        ) : null}
      </div>
    </aside>
  );
}

function VisualizationCard({ frame }: { frame?: VisualizationFrame }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-slate-950/90 text-white shadow-inner">
      <VisualizationViewer frame={frame} isDark />
    </div>
  );
}
interface AiAssistantCardProps {
  aiMessages: AiChatMessage[];
  aiInput: string;
  onAiInputChange: (value: string) => void;
  onSendMessage: () => void;
  onShowAssistantModal: () => void;
  showResourceAction: boolean;
}

function AiAssistantCard({
  aiMessages,
  aiInput,
  onAiInputChange,
  onSendMessage,
  onShowAssistantModal,
  showResourceAction,
}: AiAssistantCardProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-inner dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-robot text-blue-500" />
          <span className="font-medium text-slate-800 dark:text-slate-100">AI 缂栫▼鍔╂墜</span>
        </div>
        {showResourceAction ? (
          <button
            type="button"
            onClick={onShowAssistantModal}
            className="rounded-lg px-3 py-1 text-xs text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
          >
            鏌ョ湅鏁欏璧勬枡
          </button>
        ) : null}
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
            placeholder='鍚?AI 缂栫▼鍔╂墜鎻愰棶锛屼緥濡傗€滃府鎴戜紭鍖栬兘閲忕鐞嗏€?
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
          />
          <button
            type="button"
            onClick={onSendMessage}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            鍙戦€?
          </button>
        </div>
      </div>
    </div>
  );
}
