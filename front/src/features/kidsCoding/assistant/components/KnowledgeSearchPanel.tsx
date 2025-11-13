import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Search } from 'lucide-react';
import type { KnowledgeNote } from '../types/assistant';

interface KnowledgeSearchPanelProps {
  notes: KnowledgeNote[];
  isDark: boolean;
  isLoading: boolean;
}

export function KnowledgeSearchPanel({ notes, isDark, isLoading }: KnowledgeSearchPanelProps) {
  const [query, setQuery] = useState('');
  const filteredNotes = useMemo(() => {
    if (!query.trim()) {
      return notes;
    }
    const lower = query.toLowerCase();
    return notes.filter(note => `${note.title} ${note.summary} ${note.content} ${note.keywords.join(' ')}`.toLowerCase().includes(lower));
  }, [notes, query]);

  return (
    <div className="space-y-4">
      <label
        className={clsx(
          'flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm',
          isDark ? 'border-blue-900/40 bg-gray-900/70 text-slate-100' : 'border-blue-100 bg-white text-slate-700',
        )}
      >
        <Search size={16} />
        <input
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
          className={clsx('flex-1 bg-transparent outline-none placeholder:text-slate-400', isDark ? 'text-slate-100' : 'text-slate-800')}
          placeholder="搜索函数、上一节知识点..."
        />
        <button
          type="button"
          className={clsx(
            'rounded-full px-3 py-0.5 text-xs font-medium transition-colors',
            isDark ? 'bg-blue-500/30 text-blue-100 hover:bg-blue-500/40' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
          )}
          onClick={() => setQuery('')}
        >
          清空
        </button>
      </label>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className={clsx('h-20 animate-pulse rounded-2xl', isDark ? 'bg-gray-800/80' : 'bg-slate-100')} />
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-300">暂无匹配的讲义，可尝试不同的关键词。</p>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map(note => (
            <article
              key={note.id}
              className={clsx(
                'rounded-2xl border p-4 shadow-sm',
                isDark ? 'border-blue-900/40 bg-gray-900/70' : 'border-blue-100 bg-white/90',
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{note.title}</h3>
                {note.previousLesson && (
                  <span
                    className={clsx(
                      'rounded-full px-2 py-0.5 text-[11px] font-medium',
                      isDark ? 'bg-purple-500/20 text-purple-100' : 'bg-purple-50 text-purple-600',
                    )}
                  >
                    上一节
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-200">{note.summary}</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">{note.content}</p>
              <div className="mt-3 flex flex-wrap gap-1 text-[11px]">
                {note.keywords.map(keyword => (
                  <button
                    key={keyword}
                    type="button"
                    className={clsx(
                      'rounded-full px-2 py-0.5 transition-colors',
                      isDark ? 'bg-gray-800 text-gray-100 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    )}
                    onClick={() => setQuery(keyword)}
                  >
                    #{keyword}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
