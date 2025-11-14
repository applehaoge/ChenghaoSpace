import clsx from 'clsx';
import { motion } from 'framer-motion';
import type { QuizContent, QuizQuestion } from '@/features/kidsCoding/data/lessons';
import type { QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';
import { QuestionHeader } from './components/QuestionHeader';
import { QuizFeedback } from './components/QuizFeedback';
import { SingleChoiceQuestion } from './questions/SingleChoiceQuestion';
import { FillBlankQuestion } from './questions/FillBlankQuestion';
import { ShortAnswerQuestion } from './questions/ShortAnswerQuestion';
import { MatchingQuestion } from './questions/MatchingQuestion';

interface QuizSlideProps {
  quiz: QuizContent;
  question: QuizQuestion | null;
  questionIndex: number;
  totalQuestions: number;
  questionState: QuizState;
  isDark: boolean;
  onQuestionResult: (status: QuizState, reward?: number) => void;
}

export function QuizSlide({
  quiz,
  question,
  questionIndex,
  totalQuestions,
  questionState,
  isDark,
  onQuestionResult,
}: QuizSlideProps) {
  if (!question) {
    return (
      <div
        className={clsx(
          'flex h-full items-center justify-center rounded-2xl border px-4 py-4 text-sm',
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
        'rounded-2xl border px-4 py-4 shadow-inner space-y-4 relative',
        isDark ? 'border-indigo-800/60 bg-slate-900/70' : 'border-indigo-100 bg-white',
      )}
    >
      <QuestionHeader
        quizTitle={quiz.title ?? '测验'}
        question={question}
        questionIndex={questionIndex}
        totalQuestions={totalQuestions}
        isDark={isDark}
      />

      <QuestionRenderer
        question={question}
        questionState={questionState}
        isDark={isDark}
        onQuestionResult={onQuestionResult}
      />

      <QuizFeedback questionState={questionState} reward={question.reward} isDark={isDark} />
    </motion.section>
  );
}

function QuestionRenderer({
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
        <SingleChoiceQuestion
          question={question}
          questionState={questionState}
          isDark={isDark}
          onQuestionResult={onQuestionResult}
        />
      );
    case 'fill-blank':
      return (
        <FillBlankQuestion
          question={question}
          questionState={questionState}
          isDark={isDark}
          onQuestionResult={onQuestionResult}
        />
      );
    case 'short-answer':
      return (
        <ShortAnswerQuestion
          question={question}
          questionState={questionState}
          isDark={isDark}
          onQuestionResult={onQuestionResult}
        />
      );
    case 'matching':
      return (
        <MatchingQuestion
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
