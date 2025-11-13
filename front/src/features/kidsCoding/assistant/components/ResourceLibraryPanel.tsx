import clsx from 'clsx';
import type { LessonResource } from '../types/assistant';

interface ResourceLibraryPanelProps {
  resources: LessonResource[];
  isDark: boolean;
  isLoading: boolean;
}

const typeLabelMap: Record<LessonResource['type'], string> = {
  video: '视频',
  document: '课件',
  audio: '音乐',
  image: '图片',
};

export function ResourceLibraryPanel({ resources, isDark, isLoading }: ResourceLibraryPanelProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className={clsx('h-32 animate-pulse rounded-2xl', isDark ? 'bg-gray-800/80' : 'bg-slate-100')} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {resources.map(resource => (
        <article
          key={resource.id}
          className={clsx(
            'flex h-full flex-col rounded-2xl border p-4 shadow-sm',
            isDark ? 'border-indigo-900/40 bg-gray-900/70' : 'border-indigo-100 bg-white/90',
          )}
        >
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.1em] text-indigo-400">
            {typeLabelMap[resource.type]}
            {resource.duration && <span>{Math.round(resource.duration / 60)}min</span>}
          </div>
          <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{resource.title}</h3>
          <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-200">{resource.description}</p>
          {resource.tags && (
            <div className="mt-2 flex flex-wrap gap-1">
              {resource.tags.map(tag => (
                <span
                  key={tag}
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-[11px]',
                    isDark ? 'bg-indigo-900/60 text-indigo-100' : 'bg-indigo-50 text-indigo-700',
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <button
            type="button"
            className={clsx(
              'mt-4 inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-medium transition-colors',
              isDark ? 'bg-indigo-500/30 text-indigo-100 hover:bg-indigo-500/50' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
            )}
          >
            打开资源
          </button>
        </article>
      ))}
    </div>
  );
}
