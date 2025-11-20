import { useEffect, useState } from 'react';
import clsx from 'clsx';
import type { ShortAnswerQuestion as ShortAnswerQuestionType } from '@/features/kidsCoding/data/lessons';
import type { QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';

interface ShortAnswerQuestionProps {
  question: ShortAnswerQuestionType;
  questionState: QuizState;
  isDark: boolean;
  onQuestionResult: (status: QuizState, reward?: number) => void;
}

export function ShortAnswerQuestion({
  question,
  questionState,
  isDark,
  onQuestionResult,
}: ShortAnswerQuestionProps) {
  const [showReference, setShowReference] = useState(false);

  useEffect(() => {
    setShowReference(false);
  }, [question.id]);

  const handleReveal = () => {
    setShowReference(prev => !prev);
    if (!showReference) {
      onQuestionResult('correct', question.reward ?? 0);
    }
  };

  return (
    <div className="space-y-3">
      <p className={clsx('text-sm font-medium', isDark ? 'text-indigo-50' : 'text-slate-700')}>{question.prompt}</p>
      <textarea
        rows={3}
        className={clsx(
          'w-full border-b px-1 py-2 text-sm bg-transparent focus:outline-none',
          isDark ? 'border-indigo-700 text-indigo-100' : 'border-indigo-300 text-slate-800',
        )}
        placeholder="写下你的想法……"
      />
      <button
        type="button"
        onClick={handleReveal}
        className={clsx(
          'text-xs underline',
          isDark ? 'text-indigo-200 hover:text-indigo-100' : 'text-indigo-600 hover:text-indigo-500',
        )}
      >
        {showReference ? '隐藏参考答案' : '查看参考答案'}
      </button>
      {showReference && (
        <p className={clsx('text-sm', isDark ? 'text-emerald-100' : 'text-emerald-700')}>{question.referenceAnswer}</p>
      )}
      {questionState === 'correct' && <p className={clsx('text-xs', isDark ? 'text-emerald-200' : 'text-emerald-600')}>已记录答案</p>}
    </div>
  );
}
