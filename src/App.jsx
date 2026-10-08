import React, { useState, useEffect } from 'react';
import { QUESTIONS } from './data/questions';
import { getMuted, setMuted } from './utils/sound';
import RetroHeader from './components/RetroHeader';
import SplashScreen from './components/SplashScreen';
import LaunchScreen from './components/LaunchScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import AdminPanel from './components/AdminPanel';
import { recordGameAttempt } from './firebase';

export default function App() {
  const [screen, setScreen] = useState('splash'); // 'splash' | 'launch' | 'quiz' | 'result' | 'admin'
  const [player, setPlayer] = useState({ name: '', relation: '' });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  useEffect(() => {
    setIsAudioMuted(getMuted());

    // Hash-based routing for Admin (#admin)
    const handleHashSync = () => {
      if (window.location.hash === '#admin') {
        setScreen('admin');
      } else if (screen === 'admin' && window.location.hash !== '#admin') {
        setScreen('launch');
      }
    };

    handleHashSync();
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, [screen]);

  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const quizStartTimeRef = React.useRef(Date.now());

  const handleToggleMute = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    setMuted(nextMuted);
  };

  const handleStartGame = ({ name, relation }) => {
    setPlayer({ name, relation });
    setCurrentQuestionIndex(0);
    setScore(0);
    setSubmittedAnswers([]);
    quizStartTimeRef.current = Date.now();
    setScreen('quiz');
  };

  const handleAnswerSubmit = (isCorrect, answer) => {
    const nextScore = isCorrect ? score + 1 : score;
    const answerEntry = {
      questionId: QUESTIONS[currentQuestionIndex].id,
      questionText: QUESTIONS[currentQuestionIndex].question,
      answer: answer || '',
      isCorrect,
    };
    const nextAnswers = [...submittedAnswers, answerEntry];
    setSubmittedAnswers(nextAnswers);

    if (isCorrect) {
      setScore(nextScore);
    }

    if (currentQuestionIndex + 1 < QUESTIONS.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Quiz complete: record attempt with audit trail
      const durationSeconds = Math.round((Date.now() - quizStartTimeRef.current) / 1000);
      if (player.name) {
        recordGameAttempt(player.name, player.relation, nextScore, QUESTIONS.length, {
          submittedAnswers: nextAnswers,
          durationSeconds,
        });
      }
      setScreen('result');
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSubmittedAnswers([]);
    quizStartTimeRef.current = Date.now();
    setScreen('quiz');
  };

  const handleFullReset = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSubmittedAnswers([]);
    setScreen('launch');
  };

  const handleOpenAdmin = () => {
    window.location.hash = '#admin';
    setScreen('admin');
  };

  const handleExitAdmin = () => {
    if (window.location.hash === '#admin') {
      window.history.pushState(null, '', window.location.pathname);
    }
    setScreen('launch');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Header */}
      <RetroHeader
        isMuted={isAudioMuted}
        onToggleMute={handleToggleMute}
        onReset={handleFullReset}
        screen={screen}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Main Game Screen - Direct and open on screen, no card box */}
      <main className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        {screen === 'splash' && (
          <div className="max-w-xl mx-auto w-full">
            <SplashScreen onComplete={() => setScreen('launch')} />
          </div>
        )}

        {screen === 'launch' && (
          <div className="max-w-xl mx-auto w-full">
            <LaunchScreen onStartGame={handleStartGame} />
          </div>
        )}

        {screen === 'quiz' && (
          <div className="max-w-xl mx-auto w-full">
            <QuizScreen
              questionData={QUESTIONS[currentQuestionIndex]}
              currentIndex={currentQuestionIndex}
              totalQuestions={QUESTIONS.length}
              onAnswerSubmit={handleAnswerSubmit}
              playerName={player.name}
            />
          </div>
        )}

        {screen === 'result' && (
          <div className="max-w-xl mx-auto w-full">
            <ResultScreen
              playerName={player.name}
              relation={player.relation}
              score={score}
              totalQuestions={QUESTIONS.length}
              onRetry={handleRetry}
            />
          </div>
        )}

        {screen === 'admin' && (
          <AdminPanel onExit={handleExitAdmin} />
        )}
      </main>

      {/* Footer Info */}
      <footer className="py-4 text-center">
        <p className="font-pixel text-[10px] text-slate-500 uppercase tracking-widest">
          SIMANTO BISWAS JEET &bull; BIRTHDAY EDITION
        </p>
      </footer>
    </div>
  );
}
