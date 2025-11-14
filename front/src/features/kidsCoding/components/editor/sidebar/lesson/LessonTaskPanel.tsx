import { AnimatePresence } from 'framer-motion';
import type { LessonContent, QuizQuestion } from '@/features/kidsCoding/data/lessons';
import type { LessonSlide, QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';
import { MissionSlide } from './MissionSlide';
import { QuizSlide } from './QuizSlide';
import { SlideControls } from './SlideControls';

interface LessonTaskPanelProps {
  lesson: LessonContent;
  isDark: boolean;
  activeSlide: LessonSlide;
  quizState: QuizState;
  quizQuestion: QuizQuestion | null;
  quizQuestionIndex: number;
  quizQuestionTotal: number;
  quizQuestionState: QuizState;
  onQuestionResult: (status: QuizState, reward?: number) => void;
  onNextQuestion: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRequestVideo: () => void;
}

export function LessonTaskPanel({
  lesson,
  isDark,
  activeSlide,
  quizState,
  quizQuestion,
  quizQuestionIndex,
  quizQuestionTotal,
  quizQuestionState,
  onQuestionResult,
  onNextQuestion,
  onNext,
  onPrev,
  onRequestVideo,
}: LessonTaskPanelProps) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeSlide === 'mission' ? (
            <MissionSlide key="mission" mission={lesson.mission} isDark={isDark} />
          ) : (
            <QuizSlide
              key={quizQuestion?.id ?? 'quiz'}
              quiz={lesson.quiz}
              question={quizQuestion}
              questionIndex={quizQuestionIndex}
              totalQuestions={quizQuestionTotal}
              questionState={quizQuestionState}
              isDark={isDark}
              onQuestionResult={onQuestionResult}
            />
          )}
        </AnimatePresence>
      </div>

      <SlideControls
        isDark={isDark}
        activeSlide={activeSlide}
        quizState={quizState}
        quizQuestionIndex={quizQuestionIndex}
        quizQuestionTotal={quizQuestionTotal}
        quizQuestionOptional={quizQuestion?.optional}
        onNextQuestion={onNextQuestion}
        onNext={onNext}
        onPrev={onPrev}
        onRequestVideo={onRequestVideo}
      />
    </div>
  );
}
