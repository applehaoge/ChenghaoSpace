import { useMemo, useState } from 'react';
import { getLessonContent, type LessonContent } from '@/features/kidsCoding/data/lessons';

export type LessonSlide = 'mission' | 'quiz';
export type QuizState = 'idle' | 'correct' | 'incorrect';

interface UseLessonSlidesOptions {
  lessonId?: string;
  onEarnTokens?: (amount: number) => void;
}

interface UseLessonSlidesResult {
  lesson: LessonContent;
  activeSlide: LessonSlide;
  quizState: QuizState;
  goToNextSlide: () => void;
  goToPreviousSlide: () => void;
  handleSelectOption: (optionId: string) => void;
  isVideoOpen: boolean;
  openVideo: () => void;
  closeVideo: () => void;
}

export function useLessonSlides(options: UseLessonSlidesOptions = {}): UseLessonSlidesResult {
  const { lessonId, onEarnTokens } = options;
  const lesson = useMemo(() => getLessonContent(lessonId), [lessonId]);
  const [activeSlide, setActiveSlide] = useState<LessonSlide>('mission');
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const goToNextSlide = () => {
    setActiveSlide('quiz');
  };

  const goToPreviousSlide = () => {
    setActiveSlide('mission');
  };

  const handleSelectOption = (optionId: string) => {
    if (quizState === 'correct') return;
    if (optionId === lesson.quiz.correctOptionId) {
      setQuizState('correct');
      onEarnTokens?.(lesson.quiz.reward);
    } else {
      setQuizState('incorrect');
    }
  };

  const openVideo = () => setIsVideoOpen(true);
  const closeVideo = () => setIsVideoOpen(false);

  return {
    lesson,
    activeSlide,
    quizState,
    goToNextSlide,
    goToPreviousSlide,
    handleSelectOption,
    isVideoOpen,
    openVideo,
    closeVideo,
  };
}
