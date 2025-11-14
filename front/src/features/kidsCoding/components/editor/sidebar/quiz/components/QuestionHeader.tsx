import clsx from 'clsx';
import { Brain } from 'lucide-react';
import type { QuizQuestion } from '@/features/kidsCoding/data/lessons';

interface QuestionHeaderProps {
  quizTitle: string;
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  isDark: boolean;
}

export function QuestionHeader({ quizTitle, question, questionIndex, totalQuestions, isDark }: QuestionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div
        className={clsx(
          'flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em]',
          isDark ? 'text-indigo-300' : 'text-indigo-500',
        )}
      >
        <Brain size={14} />
        {quizTitle}
      </div>
      <div className="flex items-center gap-2 text-xs">
        {question.optional && (
          <span className={clsx('rounded-full px-2 py-0.5', isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600')}>
            可选
          </span>
        )}
        <span className={clsx(isDark ? 'text-indigo-200' : 'text-indigo-600')}>
          {questionIndex + 1}/{totalQuestions}
        </span>
      </div>
    </div>
  );
}
