
import { useState, useEffect, useCallback, useMemo } from 'react';
import { type ProgressData } from '../types';
import { LESSONS } from '../constants';

const STORAGE_KEY = 'copdLearningProgress';

export const useLearningSystem = () => {
  const [progress, setProgress] = useState<ProgressData>({
    completedLessons: [],
    quizScore: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(STORAGE_KEY);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error('Failed to load progress from localStorage', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (error) {
        console.error('Failed to save progress to localStorage', error);
      }
    }
  }, [progress, isLoaded]);

  const completeLesson = useCallback((lessonId: number) => {
    setProgress(prev => {
      if (prev.completedLessons.includes(lessonId)) {
        return prev;
      }
      const newCompleted = [...prev.completedLessons, lessonId].sort((a, b) => a - b);
      return { ...prev, completedLessons: newCompleted };
    });
  }, []);

  const saveQuizScore = useCallback((score: number) => {
    setProgress(prev => ({ ...prev, quizScore: score }));
  }, []);
  
  const resetQuiz = useCallback(() => {
    setProgress(prev => ({ ...prev, quizScore: null }));
  }, []);
  
  const resetProgress = useCallback(() => {
    const initialProgress = { completedLessons: [], quizScore: null };
    setProgress(initialProgress);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset progress in localStorage', error);
    }
  }, []);

  const isLessonCompleted = useCallback((lessonId: number) => {
    return progress.completedLessons.includes(lessonId);
  }, [progress.completedLessons]);

  const isLessonUnlocked = useCallback((lessonId: number) => {
    if (lessonId === 1) return true;
    return isLessonCompleted(lessonId - 1);
  }, [isLessonCompleted]);

  const allLessonsCompleted = useMemo(() => {
    return progress.completedLessons.length === LESSONS.length;
  }, [progress.completedLessons.length]);

  const isQuizUnlocked = useMemo(() => {
    return allLessonsCompleted;
  }, [allLessonsCompleted]);

  const overallProgress = useMemo(() => {
    const lessonsCompleted = progress.completedLessons.length;
    const quizCompleted = progress.quizScore !== null ? 1 : 0;
    const totalTasks = LESSONS.length + 1; // 4 lessons + 1 quiz
    
    if (totalTasks === 0) return 0;
    return Math.round(((lessonsCompleted + quizCompleted) / totalTasks) * 100);
  }, [progress.completedLessons, progress.quizScore]);

  return {
    progress,
    isLoaded,
    completeLesson,
    saveQuizScore,
    resetQuiz,
    resetProgress,
    isLessonCompleted,
    isLessonUnlocked,
    isQuizUnlocked,
    allLessonsCompleted,
    overallProgress,
  };
};
