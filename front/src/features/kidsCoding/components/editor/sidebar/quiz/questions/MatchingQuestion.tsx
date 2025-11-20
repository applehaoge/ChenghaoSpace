import { useEffect, useMemo, useState } from 'react';
import type { MatchingQuestion as MatchingQuestionType } from '@/features/kidsCoding/data/lessons';
import type { QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';
import { QuizFeedback } from '../components/QuizFeedback';

interface MatchingQuestionProps {
  question: MatchingQuestionType;
  questionState: QuizState;
  isDark: boolean;
  onQuestionResult: (status: QuizState, reward?: number) => void;
}

export function MatchingQuestion({
  question,
  questionState,
  isDark: _isDark,
  onQuestionResult,
}: MatchingQuestionProps) {
  const rightOptions = useMemo(() => shuffleArray(question.pairs.map(pair => pair.right)), [question.pairs]);
  const [selection, setSelection] = useState<Record<string, string>>({});

  useEffect(() => {
    setSelection({});
  }, [question.id]);

  const handleSelect = (pairId: string, value: string) => {
    setSelection(prev => ({ ...prev, [pairId]: value }));
  };

  const handleSubmit = () => {
    const isCorrect = question.pairs.every(pair => selection[pair.id] === pair.right);
    onQuestionResult(isCorrect ? 'correct' : 'incorrect', question.reward ?? 0);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="question-body">
        <p className="text-base font-semibold text-slate-100">{question.prompt}</p>
      </div>
      <div className="answer-area space-y-2">
        {question.pairs.map(pair => (
          <div key={pair.id} className="flex flex-col gap-2 rounded-xl py-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="text-slate-200">{pair.left}</span>
            <select
              value={selection[pair.id] ?? ''}
              onChange={event => handleSelect(pair.id, event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-slate-200 outline-none transition focus:border-blue-500 sm:w-48"
            >
              <option value="">选择策略</option>
              {rightOptions.map(option => (
                <option key={`${pair.id}-${option}`} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 active:scale-95"
        >
          提交配对
        </button>
      </div>
      <QuizFeedback questionState={questionState} reward={question.reward} />
    </div>
  );
}

function shuffleArray<T>(arr: T[]): T[] {
  const clone = [...arr];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}
