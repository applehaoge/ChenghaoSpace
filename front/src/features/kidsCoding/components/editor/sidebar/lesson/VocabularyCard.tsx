import clsx from 'clsx';
import { Volume2 } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { VocabularyCardContent } from '@/features/kidsCoding/data/vocabulary';

interface VocabularyCardProps {
  content: VocabularyCardContent;
  isDark: boolean;
  style?: CSSProperties;
  onSpeak?: () => void;
}

export function VocabularyCard({ content, isDark, style, onSpeak }: VocabularyCardProps) {
  return (
    <div
      style={style}
      className={clsx(
        'z-20 rounded-2xl border px-3 py-3 shadow-lg backdrop-blur-sm',
        'flex flex-col items-stretch gap-3 text-left',
        isDark
          ? 'border-emerald-500/30 bg-slate-900/90 text-emerald-50'
          : 'border-emerald-200 bg-white text-slate-700',
      )}
    >
      <img
        src={content.image}
        alt={content.word}
        className="h-32 w-full rounded-xl object-cover shadow-sm"
      />
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <div className="text-base font-semibold text-emerald-500 dark:text-emerald-300">{content.word}</div>
          {onSpeak ? (
            <button
              type="button"
              onClick={onSpeak}
              className={clsx(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70',
                isDark
                  ? 'border-emerald-500/40 text-emerald-100 hover:bg-emerald-500/20'
                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
              )}
            >
              <Volume2 size={14} />
              朗读
            </button>
          ) : null}
        </div>
        {content.pronunciation ? (
          <p className="text-sm text-emerald-400 dark:text-emerald-200">{content.pronunciation}</p>
        ) : null}
        <p className="text-sm leading-relaxed">{content.description}</p>
        {content.example ? (
          <p className="text-xs text-slate-500 dark:text-emerald-200/80">示例：{content.example}</p>
        ) : null}
      </div>
    </div>
  );
}
