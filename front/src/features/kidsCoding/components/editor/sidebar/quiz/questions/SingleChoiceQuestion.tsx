import { useEffect, useState } from 'react';
import clsx from 'clsx';
import type { SingleChoiceQuestion as SingleChoiceQuestionType } from '@/features/kidsCoding/data/lessons';
import type { QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';
import { QuizFeedback } from '../components/QuizFeedback';

interface SingleChoiceQuestionProps {
  question: SingleChoiceQuestionType;
  questionState: QuizState;
  isDark: boolean;
  onQuestionResult: (status: QuizState, reward?: number) => void;
}

export function SingleChoiceQuestion({
  question,
  questionState,
  isDark: _isDark,
  onQuestionResult,
}: SingleChoiceQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const disabled = questionState === 'correct';

  useEffect(() => {
    setSelectedOption(null);
  }, [question.id]);

  const handleSelect = (optionId: string) => {
    if (disabled) return;
    setSelectedOption(optionId);
    onQuestionResult(optionId === question.answerId ? 'correct' : 'incorrect', question.reward ?? 0);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="question-body">
        <p className="text-base font-semibold text-slate-100">{question.prompt}</p>
      </div>
      <div className="answer-area space-y-3">
        <ul className="space-y-3">
          {question.options.map(option => {
            const isCorrectOption = questionState === 'correct' && option.id === question.answerId;
            const isWrongSelection =
              questionState === 'incorrect' && selectedOption === option.id && option.id !== question.answerId;
            const isSelected = selectedOption === option.id;

            return (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-left text-sm text-slate-200 transition hover:bg-slate-700/50 active:scale-95',
                    disabled && 'cursor-not-allowed',
                    isSelected && 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20',
                    isCorrectOption && 'border-green-400 bg-green-500/20 text-green-200',
                    isWrongSelection && 'border-orange-400 bg-orange-500/20 text-orange-300',
                  )}
                >
                  <span
                    className={clsx(
                      'flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 font-bold transition',
                      (isSelected || isCorrectOption) && 'bg-white/30 text-white',
                      isWrongSelection && 'bg-orange-500/20 text-orange-200',
                    )}
                  >
                    {option.label}
                  </span>
                  <span>{option.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <QuizFeedback questionState={questionState} reward={question.reward} />
    </div>
  );
}
