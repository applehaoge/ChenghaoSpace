import { useEffect, useState } from 'react';
import clsx from 'clsx';
import type { FillBlankQuestion as FillBlankQuestionType } from '@/features/kidsCoding/data/lessons';
import type { QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';

interface FillBlankQuestionProps {
  question: FillBlankQuestionType;
  questionState: QuizState;
  isDark: boolean;
  onQuestionResult: (status: QuizState, reward?: number) => void;
}

export function FillBlankQuestion({
  question,
  questionState,
  isDark,
  onQuestionResult,
}: FillBlankQuestionProps) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setInputValue('');
  }, [question.id]);

  const handleCheck = () => {
    const normalized = inputValue.replace(/\s+/g, '').toLowerCase();
    const target = question.answer.replace(/\s+/g, '').toLowerCase();
    onQuestionResult(normalized === target ? 'correct' : 'incorrect', question.reward ?? 0);
  };

  return (
    <div className="space-y-3">
      <p className={clsx('text-sm font-medium', isDark ? 'text-indigo-50' : 'text-slate-700')}>{question.prompt}</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={event => setInputValue(event.target.value)}
          placeholder={question.placeholder ?? '输入答案'}
          className={clsx(
            'flex-1 border-b px-1 py-2 text-sm focus:outline-none',
            isDark ? 'border-indigo-700 text-indigo-100 bg-transparent' : 'border-indigo-300 text-slate-800 bg-transparent',
          )}
        />
        <button
          type="button"
          onClick={handleCheck}
          className={clsx(
            'px-3 py-2 text-sm font-semibold',
            isDark ? 'bg-indigo-700 text-white' : 'bg-indigo-500 text-white',
          )}
        >
          检查
        </button>
      </div>
      {questionState === 'correct' && <p className={clsx('text-xs', isDark ? 'text-emerald-200' : 'text-emerald-600')}>回答正确！</p>}
    </div>
  );
}
