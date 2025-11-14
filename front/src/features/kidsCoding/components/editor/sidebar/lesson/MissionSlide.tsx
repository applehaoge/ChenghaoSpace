import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Lightbulb, Trophy } from 'lucide-react';
import type { MissionContent } from '@/features/kidsCoding/data/lessons';
import { SpeakableWord } from './SpeakableWord';

interface MissionSlideProps {
  mission: MissionContent;
  isDark: boolean;
}

export function MissionSlide({ mission, isDark }: MissionSlideProps) {
  const vocabSet = new Set(mission.vocabHighlights ?? []);
  const storyNodes = renderStoryWithVocabulary(mission.story, vocabSet, isDark);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className={clsx('px-3 py-3 shadow-inner space-y-3', isDark ? 'bg-gray-900/60' : 'bg-blue-50/60')}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-blue-400">今日任务</p>
          <h3 className={clsx('text-base font-semibold', isDark ? 'text-white/90' : 'text-slate-900')}>
            {mission.title}
          </h3>
          <p className={clsx('text-xs', isDark ? 'text-blue-200/80' : 'text-slate-500')}>{mission.subtitle}</p>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-blue-700/40">
        <img src={mission.coverImage} alt={mission.title} className="h-32 w-full object-cover" />
      </div>

      <p className={clsx('text-sm leading-relaxed space-x-1', isDark ? 'text-blue-50/90' : 'text-slate-600')}>
        {storyNodes}
      </p>

      <div
        className={clsx(
          'grid gap-3 rounded-2xl border px-3 py-3 text-sm',
          isDark ? 'border-blue-800 bg-blue-950/50 text-blue-100' : 'border-blue-100 bg-white text-slate-700',
        )}
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">
          <Trophy size={14} />
          任务目标
        </div>
        <ul className="space-y-2 text-sm">
          {mission.objectives.map(objective => (
            <li key={objective} className="flex items-start gap-2">
              <span
                className={clsx(
                  'mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  isDark ? 'bg-blue-600/30 text-blue-100' : 'bg-blue-100 text-blue-700',
                )}
              >
                ✓
              </span>
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={clsx(
          'rounded-2xl px-3 py-2 text-xs',
          isDark ? 'bg-blue-500/10 text-blue-100' : 'bg-blue-100 text-blue-800',
        )}
      >
        <span
          className={clsx('inline-flex items-center gap-1 font-semibold', isDark ? 'text-blue-200' : 'text-blue-700')}
        >
          <Lightbulb size={14} />
          提示
        </span>
        <div className="mt-2 space-y-1.5">
          {mission.tips.map(tip => (
            <p key={tip} className="flex items-start gap-2">
              <span>•</span>
              {tip}
            </p>
          ))}
        </div>
      </div>

      <p className={clsx('text-xs', isDark ? 'text-blue-200/80' : 'text-slate-500')}>
        建议完成时间：{mission.timeEstimate}
      </p>
    </motion.section>
  );
}

function renderStoryWithVocabulary(story: string, vocabSet: Set<string>, isDark: boolean) {
  if (!story || !vocabSet.size) {
    return [story];
  }
  const escaped = Array.from(vocabSet)
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const regex = new RegExp(`(${escaped})`, 'g');
  const segments = story.split(regex).filter(Boolean);
  return segments.map((segment, index) =>
    vocabSet.has(segment) ? <SpeakableWord key={`${segment}-${index}`} word={segment} isDark={isDark} /> : <span key={`${segment}-${index}`}>{segment}</span>,
  );
}
