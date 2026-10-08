import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, RotateCcw, ShieldCheck } from 'lucide-react';
import { playSelectSound } from '../utils/sound';

export default function RetroHeader({
  isMuted,
  onToggleMute,
  onReset,
  screen,
  onOpenAdmin,
}) {
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef(null);

  const handleTitleClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        if (onOpenAdmin) onOpenAdmin();
        return 0;
      }
      return next;
    });

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 2500);
  };

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur border-b-2 border-slate-950 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-md">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={handleTitleClick}
          className="text-left select-none focus:outline-none group flex items-center gap-2"
          title="Friends Game (Simanto Birthday Edition)"
        >
          <h1 className="font-pixel text-xs sm:text-sm text-retro-blueHeader tracking-wider font-bold group-hover:text-retro-yellow transition-colors">
            FRIENDS GAME
          </h1>
          {screen === 'admin' && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-retro-yellow border border-amber-500/40 text-[9px] font-pixel tracking-wider">
              ADMIN MODE
            </span>
          )}
        </button>
      </div>

      <div className="flex items-center space-x-2">
        {screen !== 'admin' && (
          <button
            onClick={() => {
              playSelectSound();
              if (onOpenAdmin) onOpenAdmin();
            }}
            className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
            title="Admin Panel (or type /#admin)"
          >
            <ShieldCheck size={16} />
          </button>
        )}

        {screen !== 'launch' && screen !== 'admin' && onReset && (
          <button
            onClick={() => {
              playSelectSound();
              onReset();
            }}
            className="px-2.5 py-1.5 text-xs bg-slate-800 text-slate-200 border-2 border-slate-950 rounded-lg hover:bg-slate-700 active:translate-y-0.5 flex items-center gap-1 font-bold"
            title="Reset Game"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">RESTART</span>
          </button>
        )}

        <button
          onClick={() => {
            onToggleMute();
            playSelectSound();
          }}
          className={`px-2.5 py-1.5 text-xs border-2 border-slate-950 rounded-lg font-bold flex items-center gap-1 transition-all ${
            isMuted
              ? 'bg-rose-600 text-white shadow-[0_2px_0_#881337]'
              : 'bg-emerald-500 text-slate-950 shadow-[0_2px_0_#065f46]'
          } active:translate-y-0.5`}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span className="text-[10px] tracking-wide uppercase font-pixel">
            {isMuted ? 'OFF' : 'ON'}
          </span>
        </button>
      </div>
    </header>
  );
}
