import { useMemo } from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import { ArrowLeft, ArrowRight, Video } from 'lucide-react';
import type { LessonSlide, QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';

interface SlideControlsProps {
  isDark: boolean;
  activeSlide: LessonSlide;
  quizState: QuizState;
  quizQuestionIndex?: number;
  quizQuestionTotal?: number;
  quizQuestionOptional?: boolean;
  onNextQuestion?: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRequestVideo: () => void;
}

export function SlideControls({
  isDark,
  activeSlide,
  quizState,
  quizQuestionIndex,
  quizQuestionTotal,
  quizQuestionOptional,
  onNextQuestion,
  onNext,
  onPrev,
  onRequestVideo,
}: SlideControlsProps) {
  const dots = useMemo(
    () => [
      { id: 'mission', label: '任务', active: activeSlide === 'mission' },
      { id: 'quiz', label: '测验', active: activeSlide === 'quiz' },
    ],
    [activeSlide],
  );

  const isMission = activeSlide === 'mission';
  const isLastQuestion =
    typeof quizQuestionIndex === 'number' && typeof quizQuestionTotal === 'number'
      ? quizQuestionIndex >= quizQuestionTotal - 1
      : true;

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

      <div className="flex items-center gap-2">
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
            ariaLabel="前往测验"
            icon={<ArrowRight size={14} />}
            onClick={onNext}
          />
        ) : (
          <>
            <ActionButton
              isDark={isDark}
              ariaLabel="返回任务"
              icon={<ArrowLeft size={14} />}
              onClick={onPrev}
              variant="outline"
            />
            <ActionButton
              isDark={isDark}
              ariaLabel={isLastQuestion ? '完成测验' : '下一题'}
              icon={<ArrowRight size={14} />}
              onClick={onNextQuestion ?? onNext}
              disabled={!onNextQuestion}
            />
            <StatusBadge isDark={isDark} quizState={quizState} optional={quizQuestionOptional} />
          </>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  isDark,
  icon,
  onClick,
  ariaLabel,
  title,
  variant = 'primary',
  disabled = false,
}: {
  isDark: boolean;
  icon: ReactNode;
  onClick?: () => void;
  ariaLabel: string;
  title?: string;
  variant?: 'primary' | 'outline' | 'ghost';
  disabled?: boolean;
}) {
  const base = 'inline-flex items-center justify-center rounded-full transition-all';
  const tone = (() => {
    switch (variant) {
      case 'outline':
        return isDark
          ? 'border border-blue-700/60 h-8 w-8 text-blue-100 hover:bg-blue-800/50'
          : 'border border-blue-200 h-8 w-8 text-blue-700 hover:bg-blue-100';
      case 'ghost':
        return isDark
          ? 'h-8 w-8 border border-blue-700/40 text-blue-200 hover:bg-blue-900/40'
          : 'h-8 w-8 border border-blue-200 text-blue-600 hover:bg-blue-100';
      default:
        return isDark
          ? 'border border-blue-700 bg-blue-700/80 h-8 w-8 text-white hover:bg-blue-600'
          : 'border border-blue-200 bg-blue-500 h-8 w-8 text-white hover:bg-blue-600';
    }
  })();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      className={clsx(base, tone, variant === 'ghost' ? '' : 'shadow-sm', disabled && 'opacity-50 cursor-not-allowed')}
    >
      {icon}
    </button>
  );
}

function StatusBadge({
  isDark,
  quizState,
  optional,
}: {
  isDark: boolean;
  quizState: QuizState;
  optional?: boolean;
}) {
  const label =
    quizState === 'correct' ? '已完成' : optional ? '可跳过' : quizState === 'incorrect' ? '再试试' : '待完成';
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
