import clsx from 'clsx';
import { toast } from 'sonner';

import {
  PANEL_BASE_CLASS,
  SECTION_HEADER_CLASS,
  SECTION_LABEL_CLASS,
  SECTION_TITLE_CLASS,
} from '@/features/kidsCoding/constants/learningCenter';
import { MissionContent } from '@/features/kidsCoding/types/learningCenter';

interface MissionPanelProps {
  content: MissionContent;
  className?: string;
  enableCollapse?: boolean;
  onCollapse?: () => void;
}

export function MissionPanel({ content, className, enableCollapse = false, onCollapse }: MissionPanelProps) {
  return (
    <aside className={clsx('flex h-full flex-col overflow-hidden', PANEL_BASE_CLASS, className)}>
      <div className={SECTION_HEADER_CLASS}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className={SECTION_LABEL_CLASS}>任务说明</span>
          <span className={SECTION_TITLE_CLASS}>{content.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast.info('任务列表会定期更新，敬请期待')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <i className="fa-solid fa-arrows-rotate" />
          </button>
          {enableCollapse && onCollapse ? (
            <button
              type="button"
              onClick={onCollapse}
              title="折叠任务说明"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              <i className="fa-solid fa-chevron-left" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex-1 space-y-6 overflow-auto px-4 py-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <i className="fa-solid fa-book-open text-blue-500" />
              任务剧情
            </h3>
            <p className="mt-2">{content.story}</p>
          </section>
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <i className="fa-solid fa-bullseye text-emerald-500" />
              任务目标
            </h3>
            <ul className="mt-3 space-y-2">
              {content.objectives.map(objective => (
                <li key={objective} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <i className="fa-solid fa-check" />
                  </span>
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <i className="fa-solid fa-lightbulb text-amber-500" />
              学习提示
            </h3>
            <ul className="mt-3 space-y-2">
              {content.hints.map(hint => (
                <li key={hint} className="flex items-start gap-2">
                  <span className="mt-0.5 text-amber-500">
                    <i className="fa-solid fa-star" />
                  </span>
                  <span>{hint}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <div className="flex items-center justify-between">
            <span>
              <i className="fa-solid fa-clock me-2 text-blue-500" />
              今日学习时长 12 分钟
            </span>
            <button
              type="button"
              onClick={() => toast.info('已复制复盘要点')}
              className="rounded-lg px-3 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              加入复盘
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
