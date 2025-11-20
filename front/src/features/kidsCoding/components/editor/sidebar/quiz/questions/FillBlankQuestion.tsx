import { useEffect, useState } from 'react';
import clsx from 'clsx';
import type { FillBlankQuestion as FillBlankQuestionType } from '@/features/kidsCoding/data/lessons';
import type { QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';
import { QuizFeedback } from '../components/QuizFeedback';

interface FillBlankQuestionProps {
  question: FillBlankQuestionType;
  questionState: QuizState;
  isDark: boolean;
  onQuestionResult: (status: QuizState, reward?: number) => void;
}

export function FillBlankQuestion({
  question,
  questionState,
  isDark: _isDark,
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
    <div className="space-y-4 w-full">
      <div className="question-body">
        <p className="text-base font-semibold text-slate-100">{question.prompt}</p>
      </div>
      <div className="answer-area space-y-3">
        <input
          type="text"
          value={inputValue}
          onChange={event => setInputValue(event.target.value)}
          placeholder={question.placeholder ?? '输入答案'}
          className={clsx(
            'w-full rounded-lg border border-slate-700 bg-slate-900/50 p-3 text-sm text-slate-200 placeholder:text-slate-500 transition focus:border-blue-500 focus:outline-none',
          )}
        />
        <button
          type="button"
          onClick={handleCheck}
          className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 active:scale-95"
        >
          检查答案
        </button>
      </div>
      <QuizFeedback questionState={questionState} reward={question.reward} />
    </div>
  );
}
