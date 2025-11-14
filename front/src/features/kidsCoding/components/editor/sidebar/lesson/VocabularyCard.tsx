import clsx from 'clsx';
import type { CSSProperties } from 'react';
import type { VocabularyCardContent } from '@/features/kidsCoding/data/vocabulary';

interface VocabularyCardProps {
  content: VocabularyCardContent;
  isDark: boolean;
  style?: CSSProperties;
}

export function VocabularyCard({ content, isDark, style }: VocabularyCardProps) {
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
        <div className="text-base font-semibold text-emerald-500 dark:text-emerald-300">{content.word}</div>
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
