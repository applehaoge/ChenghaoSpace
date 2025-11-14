import { AnimatePresence } from 'framer-motion';
import type { LessonContent } from '@/features/kidsCoding/data/lessons';
import type { LessonSlide, QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';
import { MissionSlide } from './MissionSlide';
import { QuizSlide } from './QuizSlide';
import { SlideControls } from './SlideControls';

interface LessonTaskPanelProps {
  lesson: LessonContent;
  isDark: boolean;
  activeSlide: LessonSlide;
  quizState: QuizState;
  onNext: () => void;
  onPrev: () => void;
  onSelectOption: (optionId: string) => void;
  onRequestVideo: () => void;
}

export function LessonTaskPanel({
  lesson,
  isDark,
  activeSlide,
  quizState,
  onNext,
  onPrev,
  onSelectOption,
  onRequestVideo,
}: LessonTaskPanelProps) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeSlide === 'mission' ? (
            <MissionSlide key="mission" mission={lesson.mission} isDark={isDark} />
          ) : (
            <QuizSlide key="quiz" quiz={lesson.quiz} isDark={isDark} quizState={quizState} onSelectOption={onSelectOption} />
          )}
        </AnimatePresence>
      </div>

      <SlideControls
        isDark={isDark}
        activeSlide={activeSlide}
        quizState={quizState}
        onNext={onNext}
        onPrev={onPrev}
        onRequestVideo={onRequestVideo}
      />
    </div>
  );
}
