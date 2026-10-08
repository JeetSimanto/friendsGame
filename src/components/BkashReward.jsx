import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { playSelectSound, playCorrectSound } from '../utils/sound';
import { savePlayerBkash } from '../firebase';

export default function BkashReward({ playerName, relation = 'friend' }) {
  const [bkashNumber, setBkashNumber] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const storageKey = `friends_game_bkash_${playerName.trim().toLowerCase()}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setBkashNumber(saved);
        setIsSubmitted(true);
      }
    } catch (e) {}
  }, [storageKey]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanNumber = bkashNumber.trim();
    // Validate BD mobile number format: 11 digits starting with 01
    const regex = /^01[3-9]\d{8}$/;
    if (!regex.test(cleanNumber)) {
      setError('ENTER A VALID 11-DIGIT BKASH NUMBER (E.G. 017XXXXXXXX)');
      return;
    }

    setError('');
    try {
      localStorage.setItem(storageKey, cleanNumber);
      savePlayerBkash(playerName, cleanNumber, relation);
    } catch (e) {}

    playCorrectSound();
    setIsSubmitted(true);
  };

  const handleEdit = () => {
    playSelectSound();
    setIsSubmitted(false);
  };

  return (
    <div className="p-5 bg-slate-900 border-[3px] border-slate-950 rounded-2xl space-y-4">
      <div className="border-b border-slate-800 pb-3">
        <h3 className="font-pixel text-xs sm:text-sm text-retro-pink tracking-wider">
          CLAIM REWARD
        </h3>
        <p className="font-vt text-slate-400 text-sm tracking-wider uppercase">
          PROVIDE YOUR BKASH NUMBER
        </p>
      </div>

      {isSubmitted ? (
        <div className="p-4 bg-emerald-950/40 border-2 border-emerald-500/50 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 size={18} />
            <span className="font-pixel text-xs tracking-wider">NUMBER RECORDED</span>
          </div>
          <div className="font-mono text-base font-bold text-white bg-slate-950 px-3 py-2 rounded border border-slate-800">
            {bkashNumber}
          </div>
          <p className="font-vt text-slate-300 text-sm uppercase tracking-wide">
            JEET WILL VERIFY YOUR SCORE AND SEND YOUR TREAT DIRECTLY TO THIS NUMBER.
          </p>
          <button
            type="button"
            onClick={handleEdit}
            className="text-[11px] font-pixel text-retro-yellow hover:underline tracking-wider"
          >
            EDIT NUMBER
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-pixel text-slate-300 mb-2">
              BKASH NUMBER
            </label>
            <input
              type="tel"
              value={bkashNumber}
              onChange={(e) => {
                setBkashNumber(e.target.value);
                if (error) setError('');
              }}
              placeholder="01XXXXXXXXX"
              maxLength={11}
              className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 font-mono tracking-wider focus:outline-none focus:border-retro-pink text-sm sm:text-base"
              required
            />
          </div>

          {error && (
            <p className="text-xs font-pixel text-rose-400 leading-tight">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="retro-btn retro-btn-pink w-full py-3.5 text-xs sm:text-sm font-pixel flex items-center justify-center gap-2"
          >
            <Send size={15} /> SUBMIT BKASH NUMBER
          </button>
        </form>
      )}
    </div>
  );
}
