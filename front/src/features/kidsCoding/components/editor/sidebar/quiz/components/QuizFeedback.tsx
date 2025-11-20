import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Info, Medal } from 'lucide-react';
import type { QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';

interface QuizFeedbackProps {
  questionState: QuizState;
  reward?: number;
}

export function QuizFeedback({ questionState, reward = 0 }: QuizFeedbackProps) {
  const getFeedback = () => {
    if (questionState === 'correct') {
      return {
        key: 'correct',
        icon: <Medal size={16} />,
        className: 'bg-green-500/20 text-green-300',
        message: (
          <>
            做得好！{reward > 0 && <span>+{reward} T币</span>}
          </>
        ),
      };
    }
    if (questionState === 'incorrect') {
      return {
        key: 'incorrect',
        icon: <AlertTriangle size={16} />,
        className: 'bg-orange-500/20 text-orange-300',
        message: '再试试，仔细看提示~',
      };
    }
    return {
      key: 'idle',
      icon: <Info size={16} />,
      className: 'bg-blue-500/20 text-blue-300',
      message: '准备好了吗？认真观察题目再作答哦！',
    };
  };

  const feedback = getFeedback();

  return (
    <div className="min-h-[64px]">
      <AnimatePresence mode="wait">
        {feedback ? (
          <motion.div
            key={feedback.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className={clsx('flex items-center gap-2 rounded-lg p-3 text-sm font-semibold', feedback.className)}
          >
            {feedback.icon}
            <span>{feedback.message}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
