import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Brain, Medal, SkipForward } from 'lucide-react';
import type {
  FillBlankQuestion,
  MatchingQuestion,
  QuizContent,
  QuizQuestion,
  ShortAnswerQuestion,
  SingleChoiceQuestion,
} from '@/features/kidsCoding/data/lessons';
import type { QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';

interface QuizSlideProps {
  quiz: QuizContent;
  question: QuizQuestion | null;
  questionIndex: number;
  totalQuestions: number;
  questionState: QuizState;
  isDark: boolean;
  onQuestionResult: (status: QuizState, reward?: number) => void;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
}

export function QuizSlide({
  quiz,
  question,
  questionIndex,
  totalQuestions,
  questionState,
  isDark,
  onQuestionResult,
  onNextQuestion,
  onPreviousQuestion,
}: QuizSlideProps) {
  if (!question) {
    return (
      <div
        className={clsx(
          'flex h-full items-center justify-center rounded-2xl border text-sm',
          isDark ? 'border-indigo-800/60 bg-slate-900/70 text-indigo-100' : 'border-indigo-100 bg-white text-slate-600',
        )}
      >
        暂无测试题，快去完成任务吧！
      </div>
    );
  }

  return (
    <motion.section
      key={question.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className={clsx(
        'rounded-2xl border px-4 py-4 shadow-inner space-y-4',
        isDark ? 'border-indigo-800/60 bg-slate-900/70' : 'border-indigo-100 bg-white',
      )}
    >
      <QuizHeader
        quiz={quiz}
        question={question}
        questionIndex={questionIndex}
        totalQuestions={totalQuestions}
        isDark={isDark}
      />

      <QuestionBody
        question={question}
        questionState={questionState}
        isDark={isDark}
        onQuestionResult={onQuestionResult}
      />

      <QuestionFooter
        questionIndex={questionIndex}
        totalQuestions={totalQuestions}
        onNextQuestion={onNextQuestion}
        onPreviousQuestion={onPreviousQuestion}
        isDark={isDark}
        optional={question.optional}
        questionState={questionState}
      />
    </motion.section>
  );
}

function QuizHeader({
  quiz,
  question,
  questionIndex,
  totalQuestions,
  isDark,
}: {
  quiz: QuizContent;
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  isDark: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div
        className={clsx(
          'flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em]',
          isDark ? 'text-indigo-300' : 'text-indigo-500',
        )}
      >
        <Brain size={14} />
        {quiz.title ?? '测验'}
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

function QuestionBody({
  question,
  questionState,
  isDark,
  onQuestionResult,
}: {
  question: QuizQuestion;
  questionState: QuizState;
  isDark: boolean;
  onQuestionResult: (status: QuizState, reward?: number) => void;
}) {
  switch (question.type) {
    case 'single-choice':
      return (
        <ChoiceQuestion
          question={question}
          questionState={questionState}
          isDark={isDark}
          onQuestionResult={onQuestionResult}
        />
      );
    case 'fill-blank':
      return (
        <FillBlankQuestionForm
          question={question}
          questionState={questionState}
          isDark={isDark}
          onQuestionResult={onQuestionResult}
        />
      );
    case 'short-answer':
      return (
        <ShortAnswerQuestionForm
          question={question}
          questionState={questionState}
          isDark={isDark}
          onQuestionResult={onQuestionResult}
        />
      );
    case 'matching':
      return (
        <MatchingQuestionForm
          question={question}
          questionState={questionState}
          isDark={isDark}
          onQuestionResult={onQuestionResult}
        />
      );
    default:
      return null;
  }
}

function QuestionFooter({
  questionIndex,
  totalQuestions,
  onNextQuestion,
  onPreviousQuestion,
  isDark,
  optional,
  questionState,
}: {
  questionIndex: number;
  totalQuestions: number;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  isDark: boolean;
  optional?: boolean;
  questionState: QuizState;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <button
        type="button"
        disabled={questionIndex === 0}
        onClick={onPreviousQuestion}
        className={clsx(
          'inline-flex items-center gap-1 rounded-full border px-3 py-1 transition',
          questionIndex === 0
            ? 'opacity-40 cursor-not-allowed'
            : isDark
              ? 'border-indigo-700 text-indigo-100 hover:bg-indigo-900/30'
              : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50',
        )}
      >
        <ArrowLeft size={12} />
        上一题
      </button>
      <div className={clsx('text-[11px]', isDark ? 'text-indigo-200' : 'text-indigo-500')}>
        {optional ? '可跳过' : questionState === 'correct' ? '已完成' : '建议尝试'}
      </div>
      <button
        type="button"
        onClick={onNextQuestion}
        className={clsx(
          'inline-flex items-center gap-1 rounded-full border px-3 py-1 transition',
          isDark ? 'border-indigo-600 text-indigo-100 hover:bg-indigo-900/40' : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50',
        )}
      >
        {questionIndex >= totalQuestions - 1 ? '完成' : '下一题'}
        {questionIndex >= totalQuestions - 1 ? <SkipForward size={12} /> : <ArrowRight size={12} />}
      </button>
    </div>
  );
}

function ChoiceQuestion({
  question,
  questionState,
  isDark,
  onQuestionResult,
}: {
  question: SingleChoiceQuestion;
  questionState: QuizState;
  isDark: boolean;
  onQuestionResult: (status: QuizState, reward?: number) => void;
}) {
  const disabled = questionState === 'correct';
  return (
    <>
      <p className={clsx('text-sm font-medium', isDark ? 'text-indigo-50' : 'text-slate-700')}>{question.prompt}</p>
      <ul className="space-y-2">
        {question.options.map(option => {
          const isCorrect = questionState === 'correct' && option.id === question.answerId;
          const isWrong = questionState === 'incorrect' && option.id !== question.answerId;
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() =>
                  onQuestionResult(option.id === question.answerId ? 'correct' : 'incorrect', question.reward ?? 0)
                }
                disabled={disabled}
                className={clsx(
                  'flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition',
                  isDark ? 'border-indigo-800 bg-indigo-900/40 text-indigo-50' : 'border-indigo-100 bg-indigo-50/70 text-indigo-900',
                  isCorrect && 'border-emerald-300 bg-emerald-500/20 text-emerald-50',
                  questionState === 'incorrect' && option.id === question.answerId && 'border-emerald-300',
                  !isCorrect && questionState === 'incorrect' && 'opacity-70',
                )}
              >
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold">{option.label}</span>
                <span>{option.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <ResultMessage state={questionState} isDark={isDark} reward={question.reward} />
    </>
  );
}

function FillBlankQuestionForm({
  question,
  questionState,
  isDark,
  onQuestionResult,
}: {
  question: FillBlankQuestion;
  questionState: QuizState;
  isDark: boolean;
  onQuestionResult: (status: QuizState, reward?: number) => void;
}) {
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
    <>
      <p className={clsx('text-sm font-medium', isDark ? 'text-indigo-50' : 'text-slate-700')}>{question.prompt}</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={event => setInputValue(event.target.value)}
          placeholder={question.placeholder ?? '输入答案'}
          className={clsx(
            'flex-1 rounded-xl border px-3 py-2 text-sm',
            isDark ? 'border-indigo-800 bg-slate-900 text-indigo-100' : 'border-indigo-200 bg-white text-slate-800',
          )}
        />
        <button
          type="button"
          onClick={handleCheck}
          className={clsx(
            'rounded-xl px-3 py-2 text-sm font-semibold',
            isDark ? 'bg-indigo-700 text-white' : 'bg-indigo-500 text-white',
          )}
        >
          检查
        </button>
      </div>
      <ResultMessage state={questionState} isDark={isDark} reward={question.reward} />
    </>
  );
}

function ShortAnswerQuestionForm({
  question,
  questionState,
  isDark,
  onQuestionResult,
}: {
  question: ShortAnswerQuestion;
  questionState: QuizState;
  isDark: boolean;
  onQuestionResult: (status: QuizState, reward?: number) => void;
}) {
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
    <>
      <p className={clsx('text-sm font-medium', isDark ? 'text-indigo-50' : 'text-slate-700')}>{question.prompt}</p>
      <textarea
        rows={3}
        className={clsx(
          'w-full rounded-2xl border px-3 py-2 text-sm',
          isDark ? 'border-indigo-800 bg-slate-900 text-indigo-100' : 'border-indigo-200 bg-white text-slate-800',
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
        <div
          className={clsx(
            'rounded-xl border px-3 py-2 text-sm',
            isDark ? 'border-emerald-500/40 text-emerald-100' : 'border-emerald-200 text-emerald-700',
          )}
        >
          {question.referenceAnswer}
        </div>
      )}
    </>
  );
}

function MatchingQuestionForm({
  question,
  questionState,
  isDark,
  onQuestionResult,
}: {
  question: MatchingQuestion;
  questionState: QuizState;
  isDark: boolean;
  onQuestionResult: (status: QuizState, reward?: number) => void;
}) {
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
    <>
      <p className={clsx('text-sm font-medium', isDark ? 'text-indigo-50' : 'text-slate-700')}>{question.prompt}</p>
      <div className="space-y-2 text-sm">
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
          isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white',
        )}
      >
        提交配对
      </button>
      <ResultMessage state={questionState} isDark={isDark} reward={question.reward} />
    </>
  );
}

function ResultMessage({ state, isDark, reward }: { state: QuizState; isDark: boolean; reward?: number }) {
  return (
    <AnimatePresence>
      {state === 'correct' ? (
        <RewardBadge key="reward" reward={reward ?? 0} isDark={isDark} />
      ) : state === 'incorrect' ? (
        <motion.p
          key="retry"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={clsx('text-xs', isDark ? 'text-amber-200' : 'text-amber-600')}
        >
          再试一次，仔细检查提示哦。
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

function RewardBadge({ reward, isDark }: { reward: number; isDark: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={clsx(
        'flex items-center justify-between rounded-2xl border px-3 py-2 text-sm font-semibold',
        isDark ? 'border-emerald-300/60 bg-emerald-500/20 text-emerald-100' : 'border-emerald-200 bg-emerald-50 text-emerald-600',
      )}
    >
      <div className="flex items-center gap-2">
        <Medal size={16} />
        做得好！
      </div>
      {reward > 0 && <span className="text-base">+{reward} T币</span>}
    </motion.div>
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
