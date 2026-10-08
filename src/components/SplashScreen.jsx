import React, { useState, useEffect } from 'react';
import { playTypingSound, playCoinSound } from '../utils/sound';

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [bootText, setBootText] = useState('BOOTING SYSTEM...');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const bootSteps = [
      { at: 20, text: 'LOADING RETRO PROTOCOLS...' },
      { at: 55, text: 'INITIALIZING WORTHINESS TEST...' },
      { at: 85, text: 'CONNECTING TO JEET SIMANTO...' },
      { at: 100, text: 'SYSTEM READY' },
    ];

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }
        const next = prev + 5;
        const currentStep = bootSteps.find((s) => s.at <= next && s.at > prev);
        if (currentStep) {
          setBootText(currentStep.text);
          playTypingSound();
        }
        return next;
      });
    }, 70);

    return () => clearInterval(timer);
  }, []);

  const handleEnter = () => {
    playCoinSound();
    onComplete();
  };

  return (
    <div
      onClick={isReady ? handleEnter : undefined}
      className="fixed inset-0 z-50 bg-[#0f172a] flex flex-col items-center justify-center p-6 select-none cursor-pointer overflow-hidden"
    >
      {/* Background Retro Grid & Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>
      <div className="absolute w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Arcade Splash Container */}
      <div className="relative z-10 text-center space-y-6 max-w-lg w-full animate-fadeIn">
        {/* Retro Badge */}
        <div className="inline-block px-3 py-1 bg-slate-900 border-2 border-slate-800 rounded text-[11px] font-pixel text-retro-yellow tracking-widest uppercase shadow-md">
          BIRTHDAY TEST
        </div>

        {/* Big Animated Title */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-pixel text-slate-100 tracking-wider drop-shadow-[0_4px_0_#0284c7]">
            FRIENDS GAME
          </h1>
          <p className="text-xs sm:text-sm font-vt text-slate-400 tracking-widest uppercase text-base">
            PROVE YOUR WORTH AND CLAIM YOUR REWARD
          </p>
        </div>

        {/* Retro Progress / Booting Bar */}
        <div className="pt-4 space-y-2 max-w-xs mx-auto">
          <div className="w-full h-3.5 bg-slate-950 border-2 border-slate-800 rounded-full p-0.5 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-retro-yellow via-retro-blueHeader to-emerald-400 rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-pixel text-slate-500 tracking-wider">
            <span>{bootText}</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Action Prompt */}
        <div className="pt-6 min-h-[60px] flex items-center justify-center">
          {isReady ? (
            <button
              onClick={handleEnter}
              className="retro-btn retro-btn-yellow px-8 py-4 text-xs sm:text-sm font-pixel tracking-widest animate-pulse"
            >
              PRESS START TO ENTER
            </button>
          ) : (
            <div className="text-[11px] font-pixel text-slate-500 tracking-widest uppercase">
              INITIALIZING...
            </div>
          )}
        </div>

        {/* Footer Credit */}
        <div className="pt-8">
          <p className="font-pixel text-[9px] text-slate-600 uppercase tracking-widest">
            SIMANTO BISWAS JEET &bull; BIRTHDAY EDITION
          </p>
        </div>
      </div>
    </div>
  );
}
