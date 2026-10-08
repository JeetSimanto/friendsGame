import React, { useState } from 'react';
import { RELATION_OPTIONS } from '../data/questions';
import { playSelectSound } from '../utils/sound';
import TypewriterText from './TypewriterText';
import { ArrowRight, ArrowLeft, Play } from 'lucide-react';

export default function LaunchScreen({ onStartGame }) {
  const [step, setStep] = useState(1); // 1 = Name, 2 = Relation Choice, 3 = Challenge Message
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);

  const handleNextStep = (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;
    playSelectSound();
    setStep(2);
  };

  const handleSelectRelation = (relId) => {
    playSelectSound();
    setRelation(relId);
    setIsTypingDone(false);
    setStep(3); // Move to Step 3 for the challenge message!
  };

  const handleStart = (e) => {
    if (e) e.preventDefault();
    if (!name.trim() || !relation) return;
    playSelectSound();
    onStartGame({ name: name.trim(), relation });
  };

  const selectedRelationLabel = RELATION_OPTIONS.find((r) => r.id === relation)?.label || relation;

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Hero / Title */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-block px-3 py-1 bg-slate-900 border-2 border-slate-950 rounded text-[11px] font-pixel text-retro-yellow tracking-widest uppercase">
          BIRTHDAY TEST
        </div>
        <h2 className="text-2xl sm:text-4xl font-pixel text-slate-100 tracking-wider">
          FRIENDS GAME
        </h2>
        <p className="font-vt text-slate-400 tracking-widest uppercase text-base sm:text-lg">
          PROVE YOUR WORTH AND CLAIM YOUR REWARD
        </p>
      </div>

      <div className="max-w-md mx-auto">
        {/* Step 1: WHAT IS YOUR NAME? */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-6 animate-fadeIn">
            <div className="space-y-4 text-center">
              <label className="block text-sm sm:text-base font-pixel text-retro-blueHeader tracking-wider">
                <TypewriterText text="WHAT IS YOUR NAME?" speed={25} />
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ENTER YOUR NAME"
                className="w-full px-4 py-4 bg-slate-900 border-[3px] border-slate-950 rounded-xl text-slate-100 placeholder-slate-500 font-bold tracking-wide text-center focus:outline-none focus:border-retro-blueHeader focus:ring-2 focus:ring-retro-blueHeader/50 shadow-inner text-base sm:text-lg"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="retro-btn retro-btn-yellow w-full py-4 text-sm font-pixel tracking-wider flex items-center justify-center gap-2"
            >
              NEXT <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Step 2: WHO ARE YOU TO ME? */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Back Navigation */}
            <div className="flex items-center justify-start">
              <button
                type="button"
                onClick={() => {
                  playSelectSound();
                  setStep(1);
                }}
                className="font-pixel text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={13} /> BACK
              </button>
            </div>

            {/* Question Heading */}
            <div className="text-center space-y-5">
              <h3 className="text-base sm:text-lg font-pixel text-retro-blueHeader tracking-wider">
                <TypewriterText text="WHO ARE YOU TO ME?" speed={25} />
              </h3>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                {RELATION_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectRelation(item.id)}
                    className="retro-btn retro-btn-option px-4 py-4 text-xs sm:text-sm font-pixel tracking-wider"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: THE CHALLENGE MESSAGE & START GAME */}
        {step === 3 && (
          <div className="space-y-7 animate-fadeIn text-center">
            {/* Back Navigation */}
            <div className="flex items-center justify-start">
              <button
                type="button"
                onClick={() => {
                  playSelectSound();
                  setStep(2);
                }}
                className="font-pixel text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={13} /> BACK
              </button>
            </div>

            {/* Challenge Message - Big & Central */}
            <div className="py-6 min-h-[100px] flex items-center justify-center">
              <p className="font-pixel text-sm sm:text-base text-retro-yellow leading-loose tracking-wide">
                <TypewriterText
                  key={relation}
                  text={`IF YOU TRULY ARE MY ${selectedRelationLabel.toUpperCase()}, THEN PROVE YOU ARE WORTHY TO BE ONE.`}
                  speed={28}
                  onComplete={() => setIsTypingDone(true)}
                />
              </p>
            </div>

            {/* Start Game Button */}
            <div className="pt-2 animate-fadeIn">
              <button
                type="button"
                onClick={handleStart}
                className="retro-btn retro-btn-green w-full py-4 text-sm sm:text-base tracking-widest font-pixel flex items-center justify-center gap-2"
              >
                <Play size={16} fill="currentColor" /> START GAME
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
