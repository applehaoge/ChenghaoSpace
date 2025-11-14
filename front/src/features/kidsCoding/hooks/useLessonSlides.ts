import { useMemo, useState } from 'react';
import {
  getLessonContent,
  listLessons,
  type LessonContent,
  type LessonSummary,
  type QuizQuestion,
} from '@/features/kidsCoding/data/lessons';

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
  changeLesson: (lessonId: string) => void;
  isVideoOpen: boolean;
  openVideo: () => void;
  closeVideo: () => void;
  quizQuestion: QuizQuestion | null;
  quizQuestionIndex: number;
  quizQuestionTotal: number;
  quizQuestionState: QuizState;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  markCurrentQuestion: (status: QuizState, reward?: number) => void;
}

export function useLessonSlides(options: UseLessonSlidesOptions = {}): UseLessonSlidesResult {
  const { lessonId, onEarnTokens } = options;
  const lessonSummaries = useMemo(() => listLessons(), []);
  const initialLessonId = lessonId ?? lessonSummaries[0]?.id ?? 'mission-astro-weather';
  const [currentLessonId, setCurrentLessonId] = useState(initialLessonId);
  const [activeSlide, setActiveSlide] = useState<LessonSlide>('mission');
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<Record<string, QuizState>>({});
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const lesson = useMemo(() => getLessonContent(currentLessonId), [currentLessonId]);
  const totalQuestions = lesson.quiz.questions.length;
  const currentQuestion = totalQuestions ? lesson.quiz.questions[quizQuestionIndex] : null;
  const quizState: QuizState = currentQuestion ? questionStates[currentQuestion.id] ?? 'idle' : 'idle';

  const goToNextSlide = () => {
    setQuizQuestionIndex(0);
    setActiveSlide('quiz');
  };

  const goToPreviousSlide = () => {
    setActiveSlide('mission');
  };

  const goToNextQuestion = () => {
    if (!totalQuestions) return;
    if (quizQuestionIndex >= totalQuestions - 1) {
      setActiveSlide('mission');
      return;
    }
    setQuizQuestionIndex(prev => Math.min(prev + 1, totalQuestions - 1));
    setActiveSlide('quiz');
  };

  const goToPreviousQuestion = () => {
    if (!totalQuestions) {
      setActiveSlide('mission');
      return;
    }
    if (quizQuestionIndex <= 0) {
      setActiveSlide('mission');
      return;
    }
    setQuizQuestionIndex(prev => Math.max(prev - 1, 0));
    setActiveSlide('quiz');
  };

  const markCurrentQuestion = (status: QuizState, reward = 0) => {
    if (!currentQuestion) return;
    setQuestionStates(prev => {
      if (prev[currentQuestion.id] === 'correct') return prev;
      return { ...prev, [currentQuestion.id]: status };
    });
    if (status === 'correct' && reward > 0) {
      onEarnTokens?.(reward);
    }
  };

  const changeLesson = (nextLessonId: string) => {
    if (!nextLessonId || nextLessonId === currentLessonId) return;
    setCurrentLessonId(nextLessonId);
    setQuizQuestionIndex(0);
    setQuestionStates({});
    setActiveSlide('mission');
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
    changeLesson,
    isVideoOpen,
    openVideo,
    closeVideo,
    quizQuestion: currentQuestion,
    quizQuestionIndex,
    quizQuestionTotal: totalQuestions,
    quizQuestionState: quizState,
    goToNextQuestion,
    goToPreviousQuestion,
    markCurrentQuestion,
  };
}
