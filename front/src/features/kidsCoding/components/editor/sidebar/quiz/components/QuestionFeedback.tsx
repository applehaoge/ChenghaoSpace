import clsx from 'clsx';
import type { QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';

interface QuestionFeedbackProps {
  state: QuizState;
  optional?: boolean;
}

const STATE_MAP: Record<
  QuizState | 'optional',
  { text: string; tone: string; icon: string }
> = {
  correct: {
    text: '🎉 太棒了！',
    tone: 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/50',
    icon: '🎉',
  },
  incorrect: {
    text: '⚠️ 再试一次~',
    tone: 'bg-orange-500/10 text-orange-300 border border-orange-400/50',
    icon: '⚠️',
  },
  skipped: {
    text: 'ℹ️ 已跳过本题',
    tone: 'bg-sky-500/10 text-sky-200 border border-sky-400/40',
    icon: 'ℹ️',
  },
  idle: {
    text: '👋 请作答后再继续',
    tone: 'bg-slate-800/60 text-slate-300 border border-slate-700/60',
    icon: '👋',
  },
  optional: {
    text: 'ℹ️ 这是可选题，可以跳过',
    tone: 'bg-sky-500/10 text-sky-200 border border-sky-400/40',
    icon: 'ℹ️',
  },
};

export function QuestionFeedback({ state, optional }: QuestionFeedbackProps) {
  const feedbackKey = optional && state === 'idle' ? 'optional' : state;
  const feedback = STATE_MAP[feedbackKey];

  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors',
        feedback.tone,
      )}
    >
      <span aria-hidden>{feedback.icon}</span>
      <span>{feedback.text}</span>
    </div>
  );
}

