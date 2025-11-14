import { create } from 'zustand';
import type { QuizState } from '@/features/kidsCoding/hooks/useLessonSlides';

interface LessonProgress {
  [questionId: string]: QuizState;
}

interface QuizProgressState {
  lessons: Record<string, LessonProgress>;
  getQuestionState: (lessonId: string, questionId?: string | null) => QuizState;
  markQuestionState: (lessonId: string, questionId: string, state: QuizState) => void;
  resetLesson: (lessonId: string) => void;
}

export const useQuizProgressStore = create<QuizProgressState>((set, get) => ({
  lessons: {},
  getQuestionState: (lessonId, questionId) => {
    if (!lessonId || !questionId) return 'idle';
    return get().lessons[lessonId]?.[questionId] ?? 'idle';
  },
  markQuestionState: (lessonId, questionId, state) =>
    set(current => {
      const lessonProgress = current.lessons[lessonId] ?? {};
      if (lessonProgress[questionId] === 'correct') {
        return current;
      }
      return {
        lessons: {
          ...current.lessons,
          [lessonId]: {
            ...lessonProgress,
            [questionId]: state,
          },
        },
      };
    }),
  resetLesson: lessonId =>
    set(current => {
      if (!lessonId || !current.lessons[lessonId]) {
        return current;
      }
      const nextLessons = { ...current.lessons };
      delete nextLessons[lessonId];
      return { lessons: nextLessons };
    }),
}));
