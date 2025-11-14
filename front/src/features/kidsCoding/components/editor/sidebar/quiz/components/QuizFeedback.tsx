import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { Medal } from 'lucide-react';
import type { QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';

interface QuizFeedbackProps {
  questionState: QuizState;
  reward?: number;
  isDark: boolean;
}

export function QuizFeedback({ questionState, reward = 0, isDark }: QuizFeedbackProps) {
  return (
    <div className="flex justify-end">
      <AnimatePresence>
        {questionState === 'correct' ? (
          <motion.div
            key="reward"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className={clsx(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
              isDark
                ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100'
                : 'border-emerald-200 bg-emerald-50 text-emerald-600',
            )}
          >
            <Medal size={14} />
            做得好！{reward > 0 && <span>+{reward} T币</span>}
          </motion.div>
        ) : questionState === 'incorrect' ? (
          <motion.span
            key="retry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={clsx('text-xs', isDark ? 'text-amber-200' : 'text-amber-600')}
          >
            再试试，仔细看提示~
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
