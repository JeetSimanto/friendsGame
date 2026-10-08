import React, { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { playCorrectSound, playWrongSound, playSelectSound } from '../utils/sound';

export default function DuolingoDrawer({ isCorrect, onContinue }) {
  useEffect(() => {
    if (isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
  }, [isCorrect]);

  const handleContinue = () => {
    playSelectSound();
    onContinue();
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 border-t-4 border-slate-950 shadow-2xl transition-transform duration-200 transform translate-y-0 ${
        isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
      }`}
    >
      <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isCorrect ? (
            <CheckCircle2 size={36} className="text-white flex-shrink-0" />
          ) : (
            <XCircle size={36} className="text-white flex-shrink-0" />
          )}
          <div>
            <h3 className="font-pixel text-lg sm:text-xl text-white tracking-wider">
              {isCorrect ? 'CORRECT' : 'WRONG'}
            </h3>
            <p className="text-white/90 text-xs sm:text-sm font-vt uppercase tracking-widest">
              {isCorrect ? 'WORTHY ANSWER' : 'NOT ACCORDING TO PLAN'}
            </p>
          </div>
        </div>

        <button
          onClick={handleContinue}
          autoFocus
          className={`retro-btn px-8 py-3 text-sm sm:text-base font-pixel w-full sm:w-auto ${
            isCorrect ? 'retro-btn-yellow' : 'retro-btn-yellow'
          }`}
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}
