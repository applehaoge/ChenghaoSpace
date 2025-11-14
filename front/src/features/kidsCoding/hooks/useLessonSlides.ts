import { useMemo, useState } from 'react';
import { getLessonContent, listLessons, type LessonContent, type LessonSummary } from '@/features/kidsCoding/data/lessons';

export type LessonSlide = 'mission' | 'quiz';
export type QuizState = 'idle' | 'correct' | 'incorrect';

interface UseLessonSlidesOptions {
  lessonId?: string;
  onEarnTokens?: (amount: number) => void;
}

interface UseLessonSlidesResult {
  lesson: LessonContent;
  lessonId: string;
  lessons: LessonSummary[];
  activeSlide: LessonSlide;
  quizState: QuizState;
  goToNextSlide: () => void;
  goToPreviousSlide: () => void;
  handleSelectOption: (optionId: string) => void;
  changeLesson: (lessonId: string) => void;
  isVideoOpen: boolean;
  openVideo: () => void;
  closeVideo: () => void;
}

export function useLessonSlides(options: UseLessonSlidesOptions = {}): UseLessonSlidesResult {
  const { lessonId, onEarnTokens } = options;
  const lessonSummaries = useMemo(() => listLessons(), []);
  const initialLessonId = lessonId ?? lessonSummaries[0]?.id ?? 'mission-astro-weather';
  const [currentLessonId, setCurrentLessonId] = useState(initialLessonId);
  const [activeSlide, setActiveSlide] = useState<LessonSlide>('mission');
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const lesson = useMemo(() => getLessonContent(currentLessonId), [currentLessonId]);

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

  const changeLesson = (nextLessonId: string) => {
    if (!nextLessonId || nextLessonId === currentLessonId) return;
    setCurrentLessonId(nextLessonId);
    setActiveSlide('mission');
    setQuizState('idle');
  };

  const openVideo = () => setIsVideoOpen(true);
  const closeVideo = () => setIsVideoOpen(false);

  return {
    lesson,
    lessonId: currentLessonId,
    lessons: lessonSummaries,
    activeSlide,
    quizState,
    goToNextSlide,
    goToPreviousSlide,
    handleSelectOption,
    changeLesson,
    isVideoOpen,
    openVideo,
    closeVideo,
  };
}
