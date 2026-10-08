import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { playWinSound, playLoseSound, playSelectSound } from '../utils/sound';
import Certificate from './Certificate';
import BkashReward from './BkashReward';
import { RotateCcw, ArrowRight, ArrowLeft, Award, Gift } from 'lucide-react';

export default function ResultScreen({
  playerName,
  relation,
  score,
  totalQuestions,
  onRetry,
}) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const isWorthy = percentage >= 50;
  
  // 'summary' | 'certificate' | 'bkash'
  const [phase, setPhase] = useState('summary');

  useEffect(() => {
    if (isWorthy) {
      playWinSound();
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#38bdf8', '#ec4899', '#22c55e'],
        });
      } catch (e) {}
    } else {
      playLoseSound();
    }
  }, [isWorthy]);

  return (
    <div className="space-y-6">
      {/* 1. NOT WORTHY STATE */}
      {!isWorthy && (
        <div className="py-8 sm:py-12 text-center max-w-md mx-auto animate-fadeIn flex flex-col items-center">
          <div className="mb-4 inline-block px-4 py-1.5 border-2 rounded-full text-xs font-pixel tracking-widest uppercase bg-rose-950/60 border-rose-500 text-rose-400">
            FAILURE
          </div>

          <h2 className="text-3xl sm:text-4xl font-pixel tracking-wider text-rose-500 mb-6 drop-shadow-sm">
            YOU ARE NOT WORTHY
          </h2>

          <div className="mb-8 px-6 py-3 bg-slate-900 border-2 border-slate-800 rounded-xl shadow-inner inline-block">
            <p className="font-pixel text-sm sm:text-base text-slate-200 tracking-wider">
              SCORE: <span className="text-retro-yellow">{score} / {totalQuestions}</span> ({percentage}%)
            </p>
          </div>

          <p className="font-vt text-slate-400 text-lg sm:text-xl uppercase tracking-widest leading-relaxed max-w-xs mx-auto mb-10">
            YOU NEEDED AT LEAST 50% TO PROVE YOUR WORTH TO SIMANTO.
          </p>

          <div className="w-full">
            <button
              type="button"
              onClick={() => {
                playSelectSound();
                onRetry();
              }}
              className="retro-btn retro-btn-yellow w-full py-4 text-sm sm:text-base font-pixel flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> TRY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* 2. WORTHY STATE - STEP 1: SUMMARY SCREEN */}
      {isWorthy && phase === 'summary' && (
        <div className="py-8 sm:py-12 text-center max-w-md mx-auto animate-fadeIn flex flex-col items-center">
          <div className="mb-4 inline-block px-4 py-1.5 border-2 rounded-full text-xs font-pixel tracking-widest uppercase bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-sm">
            MISSION ACCOMPLISHED
          </div>

          <h2 className="text-3xl sm:text-4xl font-pixel tracking-wider text-emerald-400 mb-6 drop-shadow-sm">
            YOU ARE WORTHY
          </h2>

          <div className="mb-8 px-6 py-3 bg-slate-900 border-2 border-slate-800 rounded-xl shadow-inner inline-block">
            <p className="font-pixel text-sm sm:text-base text-slate-200 tracking-wider">
              SCORE: <span className="text-retro-yellow font-bold">{score} / {totalQuestions}</span> ({percentage}%)
            </p>
          </div>

          <p className="font-vt text-slate-400 text-lg sm:text-xl uppercase tracking-widest leading-relaxed max-w-xs mx-auto mb-10">
            YOU HAVE PROVED YOUR TRUE WORTH TO SIMANTO.
          </p>

          <div className="w-full">
            <button
              type="button"
              onClick={() => {
                playSelectSound();
                setPhase('certificate');
              }}
              className="retro-btn retro-btn-green w-full py-4 text-sm sm:text-base font-pixel flex items-center justify-center gap-2 shadow-lg"
            >
              <Award size={18} /> CLAIM CERTIFICATE <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 3. WORTHY STATE - STEP 2: DEDICATED CERTIFICATE SCREEN */}
      {isWorthy && phase === 'certificate' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Back Navigation */}
          <div className="flex items-center justify-start max-w-xl mx-auto">
            <button
              type="button"
              onClick={() => {
                playSelectSound();
                setPhase('summary');
              }}
              className="font-pixel text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
            >
              <ArrowLeft size={13} /> BACK TO SCORE
            </button>
          </div>

          {/* Certificate */}
          <Certificate
            playerName={playerName}
            relation={relation}
            score={score}
            totalQuestions={totalQuestions}
          />

          {/* Proceed to bKash Reward Button */}
          <div className="max-w-xl mx-auto pt-2">
            <button
              type="button"
              onClick={() => {
                playSelectSound();
                setPhase('bkash');
              }}
              className="retro-btn retro-btn-pink w-full py-4 text-xs sm:text-sm font-pixel flex items-center justify-center gap-2 shadow-lg"
            >
              <Gift size={16} /> CLAIM BKASH TREAT <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 4. WORTHY STATE - STEP 3: DEDICATED BKASH REWARD SCREEN */}
      {isWorthy && phase === 'bkash' && (
        <div className="space-y-6 max-w-md mx-auto animate-fadeIn">
          {/* Top Back Navigation */}
          <div className="flex items-center justify-start">
            <button
              type="button"
              onClick={() => {
                playSelectSound();
                setPhase('certificate');
              }}
              className="font-pixel text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
            >
              <ArrowLeft size={13} /> BACK TO CERTIFICATE
            </button>
          </div>

          {/* bKash Reward Card */}
          <BkashReward playerName={playerName} relation={relation} />

          {/* Navigation Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                playSelectSound();
                setPhase('certificate');
              }}
              className="retro-btn retro-btn-option flex-1 py-3 text-xs font-pixel flex items-center justify-center gap-2"
            >
              <Award size={14} /> VIEW CERTIFICATE
            </button>
            <button
              type="button"
              onClick={() => {
                playSelectSound();
                onRetry();
              }}
              className="retro-btn retro-btn-blue flex-1 py-3 text-xs font-pixel flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} /> PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
