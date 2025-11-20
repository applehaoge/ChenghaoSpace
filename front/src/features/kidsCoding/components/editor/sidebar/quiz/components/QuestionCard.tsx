import type { ReactNode } from 'react';
import clsx from 'clsx';
import type { QuizQuestion } from '@/features/kidsCoding/data/lessons';

type QuestionCardVariant = QuizQuestion['type'];

interface QuestionCardProps {
  variant: QuestionCardVariant;
  isDark: boolean;
  title: string;
  tip?: string;
  icon: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function QuestionCard({ variant, isDark, title, tip, icon, children, footer }: QuestionCardProps) {
  const tone = getVariantTone(variant, isDark);
  return (
    <div
      className={clsx(
        'flex h-full min-h-[320px] flex-col justify-between rounded-[28px] border-2 p-4 shadow-xl transition-all',
        tone.wrapper,
      )}
    >
      <div className="flex items-start gap-3">
        <span className={clsx('flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-inner', tone.icon)}>
          {icon}
        </span>
        <div className="flex-1 space-y-1">
          <p className={clsx('text-base font-bold leading-relaxed', tone.title)}>{title}</p>
          {tip ? <p className={clsx('text-[12px] font-medium leading-snug', tone.tip)}>{tip}</p> : null}
        </div>
      </div>
      <div className="mt-4 flex-1 min-h-0">{children}</div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}

interface ToneSet {
  wrapper: string;
  title: string;
  tip: string;
  icon: string;
}

const TONE_MAP: Record<QuestionCardVariant, { light: ToneSet; dark: ToneSet }> = {
  'single-choice': {
    light: {
      wrapper: 'border-sky-100 bg-gradient-to-br from-white via-sky-50 to-cyan-50',
      title: 'text-slate-800',
      tip: 'text-slate-500',
      icon: 'bg-sky-500 shadow-sky-200',
    },
    dark: {
      wrapper: 'border-sky-900/70 bg-slate-950/40',
      title: 'text-sky-50',
      tip: 'text-slate-300',
      icon: 'bg-sky-600/80 shadow-sky-900/40',
    },
  },
  'fill-blank': {
    light: {
      wrapper: 'border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50',
      title: 'text-slate-800',
      tip: 'text-slate-500',
      icon: 'bg-indigo-500 shadow-indigo-200',
    },
    dark: {
      wrapper: 'border-indigo-900/60 bg-slate-950/40',
      title: 'text-indigo-50',
      tip: 'text-slate-300',
      icon: 'bg-indigo-600/80 shadow-indigo-900/40',
    },
  },
  matching: {
    light: {
      wrapper: 'border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-teal-50',
      title: 'text-slate-800',
      tip: 'text-slate-500',
      icon: 'bg-emerald-500 shadow-emerald-200',
    },
    dark: {
      wrapper: 'border-emerald-900/60 bg-slate-950/40',
      title: 'text-emerald-50',
      tip: 'text-slate-300',
      icon: 'bg-emerald-600/80 shadow-emerald-900/40',
    },
  },
  'short-answer': {
    light: {
      wrapper: 'border-amber-100 bg-gradient-to-br from-white via-amber-50 to-orange-50',
      title: 'text-slate-800',
      tip: 'text-slate-500',
      icon: 'bg-amber-500 shadow-amber-200',
    },
    dark: {
      wrapper: 'border-amber-900/60 bg-slate-950/40',
      title: 'text-amber-50',
      tip: 'text-slate-300',
      icon: 'bg-amber-500/80 shadow-amber-900/40',
    },
  },
};

function getVariantTone(variant: QuestionCardVariant, isDark: boolean): ToneSet {
  const tone = TONE_MAP[variant];
  return isDark ? tone.dark : tone.light;
}
