import { useEffect, useState } from 'react';
import clsx from 'clsx';
import type { ShortAnswerQuestion as ShortAnswerQuestionType } from '@/features/kidsCoding/data/lessons';
import type { QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';
import { QuizFeedback } from '../components/QuizFeedback';

interface ShortAnswerQuestionProps {
  question: ShortAnswerQuestionType;
  questionState: QuizState;
  isDark: boolean;
  onQuestionResult: (status: QuizState, reward?: number) => void;
}

export function ShortAnswerQuestion({
  question,
  questionState,
  isDark: _isDark,
  onQuestionResult,
}: ShortAnswerQuestionProps) {
  const [showReference, setShowReference] = useState(false);
  const isCompleted = questionState === 'correct';

  useEffect(() => {
    setShowReference(false);
  }, [question.id]);

  const handleSubmit = () => {
    if (isCompleted) return;
    onQuestionResult('correct', question.reward ?? 0);
  };

  const handleReveal = () => {
    setShowReference(prev => !prev);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="question-body">
        <p className="text-base font-semibold text-slate-100">{question.prompt}</p>
      </div>
      <div className="answer-area space-y-3">
        <textarea
          rows={5}
          className="w-full min-h-[120px] resize-none rounded-lg border border-slate-700 bg-slate-900/50 p-3 text-sm text-slate-200 transition focus:border-blue-500 focus:outline-none"
          placeholder="写下你的想法……"
        />
        <div className="flex flex-col items-start gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isCompleted}
            className={clsx(
              'rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 active:scale-95',
              isCompleted && 'cursor-not-allowed opacity-70',
            )}
          >
            提交回答
          </button>
          <button
            type="button"
            onClick={handleReveal}
            className="text-sm text-blue-300 underline transition hover:text-blue-200"
          >
            {showReference ? '隐藏参考答案' : '查看参考答案'}
          </button>
        </div>
        {showReference && (
          <div className="mt-2 rounded-lg border border-slate-700 bg-slate-800/40 p-3 text-sm text-slate-300">
            {question.referenceAnswer}
          </div>
        )}
      </div>
      <QuizFeedback questionState={questionState} reward={question.reward} />
    </div>
  );
}
