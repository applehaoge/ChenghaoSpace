import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import type { MatchingQuestion as MatchingQuestionType } from '@/features/kidsCoding/data/lessons';
import type { QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';

interface MatchingQuestionProps {
  question: MatchingQuestionType;
  questionState: QuizState;
  isDark: boolean;
  onQuestionResult: (status: QuizState, reward?: number) => void;
}

export function MatchingQuestion({
  question,
  questionState,
  isDark,
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
    <div className="space-y-3 text-sm">
      <p className={clsx('font-medium', isDark ? 'text-indigo-50' : 'text-slate-700')}>{question.prompt}</p>
      <div className="space-y-2">
        {question.pairs.map(pair => (
          <div key={pair.id} className="flex items-center gap-3">
            <span className={clsx('flex-1 rounded-xl px-3 py-2', isDark ? 'bg-slate-800 text-indigo-50' : 'bg-indigo-50 text-indigo-900')}>
              {pair.left}
            </span>
            <select
              value={selection[pair.id] ?? ''}
              onChange={event => handleSelect(pair.id, event.target.value)}
              className={clsx(
                'w-40 rounded-xl border px-2 py-1',
                isDark ? 'border-indigo-700 bg-slate-900 text-indigo-100' : 'border-indigo-200 bg-white text-slate-700',
              )}
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
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className={clsx(
          'self-end rounded-full px-4 py-1 text-xs font-semibold',
          isDark ? 'bg-indigo-600 text白' : 'bg-indigo-500 text-white',
        )}
      >
        提交配对
      </button>
      {questionState === 'correct' && <p className={clsx('text-xs', isDark ? 'text-emerald-200' : 'text-emerald-600')}>配对正确！</p>}
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
