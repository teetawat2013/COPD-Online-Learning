import type { ReactNode } from 'react';

export enum Section {
  Home = 'home',
  Lesson1 = 'lesson1',
  Lesson2 = 'lesson2',
  Lesson3 = 'lesson3',
  Lesson4 = 'lesson4',
  Lesson5 = 'lesson5',
  Quiz = 'quiz',
  Videos = 'videos',
}

export interface Lesson {
  id: number;
  title: string;
  section: Section;
  content: ReactNode;
  hasDynamicVideo?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ProgressData {
  completedLessons: number[];
  quizScore: number | null;
}

export interface Video {
    id: string;
    url: string;
    title: string;
}

export interface LessonVideo {
    url: string;
    title: string;
}
