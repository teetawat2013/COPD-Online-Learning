
import React, { useState, useMemo } from 'react';
import { QUIZ_QUESTIONS } from '../constants';
import { type QuizQuestion } from '../types';
import { CheckCircleIcon, XCircleIcon, TrophyIcon, PowerIcon } from './IconComponents';

interface QuizPageProps {
  isUnlocked: boolean;
  score: number | null;
  saveQuizScore: (score: number) => void;
  resetProgress: () => void;
  goToHome: () => void;
  goToLessons: () => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({ isUnlocked, score, saveQuizScore, resetProgress, goToHome, goToLessons }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion: QuizQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];

  const handleAnswerSelect = (optionIndex: number) => {
    if (selectedAnswer !== undefined) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionIndex }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const finalScore = calculateScore();
      saveQuizScore(finalScore);
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    QUIZ_QUESTIONS.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });
    return Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);
  };
  
  const handleFinishAndReset = () => {
      resetProgress();
      goToHome();
  }

  const finalScore = useMemo(() => {
    if(score !== null) return score;
    return calculateScore();
  }, [score, selectedAnswers]);

  if (!isUnlocked) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">แบบทดสอบถูกล็อกอยู่</h2>
        <p className="text-slate-600 mb-6">กรุณาเรียนให้จบบทเรียนทั้งหมดก่อนทำแบบทดสอบ</p>
        <button
          onClick={goToLessons}
          className="px-6 py-2 bg-cyan-500 text-white font-semibold rounded-full hover:bg-cyan-600 transition-colors"
        >
          กลับไปที่บทเรียน
        </button>
      </div>
    );
  }
  
  if (showResults || score !== null) {
      const passed = finalScore >= 60;
      return (
          <div className="text-center p-8 bg-white rounded-lg shadow-md animate-fade-in">
              <TrophyIcon />
              <h2 className="text-3xl font-bold mt-4 mb-2">{passed ? 'ยินดีด้วย! คุณผ่านการทดสอบ' : 'พยายามอีกครั้งนะ!'}</h2>
              <p className="text-xl text-slate-600 mb-4">คะแนนของคุณคือ</p>
              <p className={`text-6xl font-bold mb-6 ${passed ? 'text-green-500' : 'text-red-500'}`}>{finalScore}%</p>
              <p className="text-slate-500 mb-8">{passed ? 'คุณมีความเข้าใจในเนื้อหาเป็นอย่างดี' : 'เกณฑ์ผ่านคือ 60% คุณสามารถลองทำแบบทดสอบใหม่อีกครั้ง'}</p>
              <button
                  onClick={handleFinishAndReset}
                  className="px-8 py-3 bg-cyan-500 text-white font-semibold rounded-full hover:bg-cyan-600 transition-colors flex items-center justify-center mx-auto"
              >
                  <PowerIcon /> <span className="ml-2">เสร็จสิ้นและเริ่มต้นใหม่</span>
              </button>
          </div>
      )
  }

  return (
    <div className="p-4 sm:p-8 bg-white rounded-lg shadow-md animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-cyan-700">แบบทดสอบความรู้</h2>
        <span className="text-sm font-semibold text-slate-500">
          ข้อที่ {currentQuestionIndex + 1} / {QUIZ_QUESTIONS.length}
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6">
        <div
          className="bg-cyan-500 h-2.5 rounded-full"
          style={{ width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
        ></div>
      </div>
      
      <p className="text-lg font-semibold mb-6 h-16">{currentQuestion.question}</p>

      <div className="space-y-4">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = currentQuestion.correctAnswer === index;
          let buttonClass = 'bg-white hover:bg-cyan-50 text-slate-700 border-slate-300';
          if (isSelected) {
            buttonClass = isCorrect ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800';
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== undefined}
              className={`w-full text-left p-4 border-2 rounded-lg transition-colors duration-200 flex items-center justify-between ${buttonClass}`}
            >
              <span>{option}</span>
              {isSelected && (isCorrect ? <CheckCircleIcon className="text-green-600" /> : <XCircleIcon className="text-red-600" />)}
            </button>
          );
        })}
      </div>
      
      {selectedAnswer !== undefined && (
          <div className={`mt-6 p-4 rounded-lg animate-fade-in ${currentQuestion.correctAnswer === selectedAnswer ? 'bg-green-50' : 'bg-red-50'}`}>
              <h4 className="font-bold">{currentQuestion.correctAnswer === selectedAnswer ? 'ถูกต้อง!' : 'ยังไม่ถูกต้อง'}</h4>
              <p className="text-sm">{currentQuestion.explanation}</p>
          </div>
      )}

      <div className="mt-8 text-right">
        <button
          onClick={handleNextQuestion}
          disabled={selectedAnswer === undefined}
          className="px-8 py-3 bg-cyan-500 text-white font-semibold rounded-full hover:bg-cyan-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {currentQuestionIndex < QUIZ_QUESTIONS.length - 1 ? 'ข้อถัดไป' : 'ดูผลคะแนน'}
        </button>
      </div>
    </div>
  );
};
