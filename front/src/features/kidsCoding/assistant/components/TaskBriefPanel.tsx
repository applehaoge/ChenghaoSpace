import clsx from 'clsx';
import type { TaskBrief } from '../types/assistant';

interface TaskBriefPanelProps {
  tasks: TaskBrief[];
  isDark: boolean;
  isLoading: boolean;
}

export function TaskBriefPanel({ tasks, isDark, isLoading }: TaskBriefPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className={clsx('animate-pulse rounded-2xl p-4', isDark ? 'bg-gray-800/80' : 'bg-slate-100')}
          >
            <div className="h-4 w-32 rounded bg-slate-400/40" />
            <div className="mt-2 h-3 w-full rounded bg-slate-300/40" />
            <div className="mt-1 h-3 w-2/3 rounded bg-slate-300/30" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <article
          key={task.id}
          className={clsx(
            'rounded-2xl border p-4 shadow-sm',
            isDark ? 'border-blue-900/40 bg-gray-900/70' : 'border-blue-100 bg-white/80',
          )}
        >
          <header className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.15em] text-blue-400">任务提示</span>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{task.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-200">{task.summary}</p>
          </header>
          <ul className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-200">
            {task.highlights.map(highlight => (
              <li key={highlight} className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                {highlight}
              </li>
            ))}
          </ul>
          {task.assets.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {task.assets.map(asset => (
                <div
                  key={asset.id}
                  className={clsx(
                    'rounded-xl border p-3 text-sm',
                    isDark ? 'border-blue-800/50 bg-blue-950/30' : 'border-blue-100 bg-blue-50/70',
                  )}
                >
                  <p className="font-medium text-blue-500 dark:text-blue-200">{asset.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-300 capitalize">{asset.type}</p>
                  {asset.description && (
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-200">{asset.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
