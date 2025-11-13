import clsx from 'clsx';
import type { PracticeItem } from '../types/assistant';

interface PracticeHubPanelProps {
  practice: PracticeItem[];
  isDark: boolean;
  isLoading: boolean;
}

const difficultyColor: Record<PracticeItem['difficulty'], string> = {
  easy: 'text-emerald-600 bg-emerald-50 dark:text-emerald-200 dark:bg-emerald-500/10',
  medium: 'text-amber-600 bg-amber-50 dark:text-amber-200 dark:bg-amber-500/10',
  hard: 'text-rose-600 bg-rose-50 dark:text-rose-200 dark:bg-rose-500/10',
};

export function PracticeHubPanel({ practice, isDark, isLoading }: PracticeHubPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className={clsx('h-20 animate-pulse rounded-2xl', isDark ? 'bg-gray-800/80' : 'bg-slate-100')} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {practice.map(item => (
        <article
          key={item.id}
          className={clsx(
            'rounded-2xl border p-4 shadow-sm',
            isDark ? 'border-emerald-900/40 bg-gray-900/70' : 'border-emerald-100 bg-white/90',
          )}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
            <span className={clsx('rounded-full px-2 py-0.5 text-[11px] font-medium', difficultyColor[item.difficulty])}>
              {item.difficulty === 'easy' ? '入门' : item.difficulty === 'medium' ? '进阶' : '挑战'}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-200">{item.description}</p>
          {item.tags && (
            <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
              {item.tags.map(tag => (
                <span
                  key={tag}
                  className={clsx(
                    'rounded-full px-2 py-0.5',
                    isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700',
                  )}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <button
            type="button"
            className={clsx(
              'mt-3 inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-medium transition-colors',
              isDark ? 'bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/40' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
            )}
          >
            前往练习
          </button>
        </article>
      ))}
    </div>
  );
}
