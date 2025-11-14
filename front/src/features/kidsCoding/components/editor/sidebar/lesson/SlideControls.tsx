import { useMemo } from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import { ArrowLeft, ArrowRight, Video } from 'lucide-react';
import type { LessonSlide, QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';

interface SlideControlsProps {
  isDark: boolean;
  activeSlide: LessonSlide;
  quizState: QuizState;
  onNext: () => void;
  onPrev: () => void;
  onRequestVideo: () => void;
}

export function SlideControls({ isDark, activeSlide, quizState, onNext, onPrev, onRequestVideo }: SlideControlsProps) {
  const dots = useMemo(
    () => [
      { id: 'mission', label: '任务', active: activeSlide === 'mission' },
      { id: 'quiz', label: '测验', active: activeSlide === 'quiz' },
    ],
    [activeSlide],
  );

  const isMission = activeSlide === 'mission';

  return (
    <div
      className={clsx(
        'flex items-center justify-between rounded-2xl px-2 py-0.5 text-[11px]',
        isDark ? 'bg-blue-950/50 text-blue-200' : 'bg-blue-100/80 text-blue-700',
      )}
    >
      <div className="flex items-center gap-0.5">
        {dots.map(dot => (
          <span
            key={dot.id}
            className={clsx('h-1.5 rounded-full transition-all', dot.active ? 'w-4 bg-blue-400' : 'w-1.5 bg-blue-400/30')}
            title={dot.label}
          />
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <ActionButton
          isDark={isDark}
          ariaLabel="播放课程视频"
          title="播放课程视频"
          icon={<Video size={14} />}
          onClick={onRequestVideo}
          variant="ghost"
        />
        {isMission ? (
          <ActionButton
            isDark={isDark}
            ariaLabel="下一页"
            icon={<ArrowRight size={14} />}
            label="下一页"
            onClick={onNext}
          />
        ) : (
          <>
            <ActionButton
              isDark={isDark}
              ariaLabel="返回任务"
              icon={<ArrowLeft size={14} />}
              label="返回任务"
              onClick={onPrev}
              variant="outline"
            />
            <StatusBadge isDark={isDark} quizState={quizState} />
          </>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  isDark,
  icon,
  label,
  onClick,
  ariaLabel,
  title,
  variant = 'primary',
}: {
  isDark: boolean;
  icon: ReactNode;
  label?: string;
  onClick?: () => void;
  ariaLabel: string;
  title?: string;
  variant?: 'primary' | 'outline' | 'ghost';
}) {
  const base = 'inline-flex items-center justify-center gap-1 rounded-2xl text-xs font-semibold transition-all';
  const tone = (() => {
    switch (variant) {
      case 'outline':
        return isDark
          ? 'border border-blue-700/60 px-3 py-1 text-blue-100 hover:bg-blue-800/50'
          : 'border border-blue-200 px-3 py-1 text-blue-700 hover:bg-blue-100';
      case 'ghost':
        return isDark
          ? 'h-8 w-8 border border-blue-700/40 text-blue-200 hover:bg-blue-900/40'
          : 'h-8 w-8 border border-blue-200 text-blue-600 hover:bg-blue-100';
      default:
        return isDark
          ? 'border border-blue-700 bg-blue-700/80 px-4 py-1 text-white hover:bg-blue-600'
          : 'border border-blue-200 bg-blue-500 px-4 py-1 text-white hover:bg-blue-600';
    }
  })();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      className={clsx(base, tone, variant === 'ghost' ? '' : 'shadow-sm')}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  );
}

function StatusBadge({ isDark, quizState }: { isDark: boolean; quizState: QuizState }) {
  const label = quizState === 'correct' ? '完成' : '待完成';
  const tone = clsx(
    'inline-flex h-7 min-w-[40px] items-center justify-center rounded-full border px-2 text-[11px] font-semibold',
    quizState === 'correct'
      ? isDark
        ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100'
        : 'border-emerald-200 bg-emerald-50 text-emerald-600'
      : isDark
        ? 'border-blue-700 bg-blue-800/25 text-blue-200'
        : 'border-blue-200 bg-white text-blue-600',
  );

  return <span className={tone}>{label}</span>;
}
