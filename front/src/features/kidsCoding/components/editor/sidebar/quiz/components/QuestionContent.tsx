import type { QuizQuestion } from '@/features/kidsCoding/data/lessons';
import type { QuizState, StudentAnswer } from '@/features/kidsCoding/hooks/useLessonSlides';
import type { QuestionProgress } from '@/features/kidsCoding/store/useQuizProgressStore';
import { SingleChoiceQuestion } from '../questions/SingleChoiceQuestion';
import { FillBlankQuestion } from '../questions/FillBlankQuestion';
import { MatchingQuestion } from '../questions/MatchingQuestion';
import { ShortAnswerQuestion } from '../questions/ShortAnswerQuestion';

interface QuestionContentProps {
  question: QuizQuestion;
  questionState: QuizState;
  progress: QuestionProgress;
  onAnswerChange: (answer: StudentAnswer) => void;
  onQuestionResult: (status: QuizState, reward?: number, answer?: StudentAnswer | null) => void;
}

export function QuestionContent({
  question,
  questionState,
  progress,
  onAnswerChange,
  onQuestionResult,
}: QuestionContentProps) {
  switch (question.type) {
    case 'single-choice':
      return (
        <SingleChoiceQuestion
          question={question}
          questionState={questionState}
          progress={progress}
          onAnswerChange={onAnswerChange}
          onQuestionResult={onQuestionResult}
        />
      );
    case 'fill-blank':
      return (
        <FillBlankQuestion
          question={question}
          questionState={questionState}
          progress={progress}
          onAnswerChange={onAnswerChange}
          onQuestionResult={onQuestionResult}
        />
      );
    case 'matching':
      return (
        <MatchingQuestion
          question={question}
          questionState={questionState}
          progress={progress}
          onAnswerChange={onAnswerChange}
          onQuestionResult={onQuestionResult}
        />
      );
    case 'short-answer':
      return (
        <ShortAnswerQuestion
          question={question}
          questionState={questionState}
          progress={progress}
          onAnswerChange={onAnswerChange}
          onQuestionResult={onQuestionResult}
        />
      );
    default:
      return null;
  }
}

