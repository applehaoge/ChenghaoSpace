import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Medal } from 'lucide-react';
import type { QuizContent } from '@/features/kidsCoding/data/lessons';
import type { QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';

interface QuizSlideProps {
  quiz: QuizContent;
  quizState: QuizState;
  isDark: boolean;
  onSelectOption: (optionId: string) => void;
}

export function QuizSlide({ quiz, quizState, isDark, onSelectOption }: QuizSlideProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className={clsx(
        'rounded-2xl border px-4 py-4 shadow-inner space-y-4',
        isDark ? 'border-indigo-800/60 bg-slate-900/70' : 'border-indigo-100 bg-white',
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={clsx(
            'flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em]',
            isDark ? 'text-indigo-300' : 'text-indigo-500',
          )}
        >
          <Brain size={14} />
          测试题
        </div>
        <span
          className={clsx(
            'rounded-full px-2 py-0.5 text-[11px] font-semibold',
            isDark ? 'bg-indigo-500/10 text-indigo-200' : 'bg-indigo-100 text-indigo-600',
          )}
        >
          +{quiz.reward} T币
        </span>
      </div>
      <p className={clsx('text-sm font-medium', isDark ? 'text-indigo-50' : 'text-slate-700')}>{quiz.question}</p>
      <ul className="space-y-2">
        {quiz.options.map(option => {
          const isCorrect = quizState === 'correct' && option.id === quiz.correctOptionId;
          const isWrong = quizState === 'incorrect' && option.id !== quiz.correctOptionId;
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => onSelectOption(option.id)}
                className={clsx(
                  'flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition',
                  isDark ? 'border-indigo-800 bg-indigo-900/40 text-indigo-50' : 'border-indigo-100 bg-indigo-50/70 text-indigo-900',
                  isCorrect && 'border-emerald-300 bg-emerald-500/20 text-emerald-50',
                  quizState === 'incorrect' && option.id === quiz.correctOptionId && 'border-emerald-300',
                  isWrong && 'opacity-70',
                )}
              >
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold">{option.label}</span>
                <span>{option.text}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {quizState === 'correct' ? (
          <RewardBadge key="reward" reward={quiz.reward} isDark={isDark} />
        ) : quizState === 'incorrect' ? (
          <motion.p
            key="retry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={clsx('text-xs', isDark ? 'text-amber-200' : 'text-amber-600')}
          >
            再想想：颜色设置通常放在 `plt.plot` 中。
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.section>
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
        回答正确！奖励
      </div>
      <span className="text-base">+{reward} T币</span>
    </motion.div>
  );
}
