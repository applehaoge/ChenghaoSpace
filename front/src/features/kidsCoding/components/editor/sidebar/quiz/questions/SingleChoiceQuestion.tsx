import clsx from 'clsx';
import type { SingleChoiceQuestion as SingleChoiceQuestionType } from '@/features/kidsCoding/data/lessons';
import type { QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';

interface SingleChoiceQuestionProps {
  question: SingleChoiceQuestionType;
  questionState: QuizState;
  isDark: boolean;
  onQuestionResult: (status: QuizState, reward?: number) => void;
}

export function SingleChoiceQuestion({
  question,
  questionState,
  isDark,
  onQuestionResult,
}: SingleChoiceQuestionProps) {
  const disabled = questionState === 'correct';
  return (
    <div className="space-y-3">
      <p className={clsx('text-sm font-medium', isDark ? 'text-indigo-50' : 'text-slate-700')}>{question.prompt}</p>
      <ul className="space-y-2">
        {question.options.map(option => {
          const isCorrect = questionState === 'correct' && option.id === question.answerId;
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() =>
                  onQuestionResult(option.id === question.answerId ? 'correct' : 'incorrect', question.reward ?? 0)
                }
                disabled={disabled}
                className={clsx(
                  'flex w-full items-center gap-3 px-1 py-2 text-left text-sm transition',
                  isDark ? 'text-indigo-50' : 'text-indigo-900',
                  isCorrect && (isDark ? 'text-emerald-200' : 'text-emerald-600'),
                  questionState === 'incorrect' && option.id === question.answerId && (isDark ? 'text-emerald-200' : 'text-emerald-600'),
                  !isCorrect && questionState === 'incorrect' && 'opacity-70',
                  disabled && !isCorrect && 'cursor-not-allowed',
                )}
              >
                <span className={clsx('text-xs font-semibold', isDark ? 'text-indigo-200' : 'text-indigo-500')}>{option.label}</span>
                <span>{option.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
