import React, { useState } from 'react';
import TypewriterText from './TypewriterText';
import DuolingoDrawer from './DuolingoDrawer';
import { playSelectSound } from '../utils/sound';

import { verifyAnswer } from '../data/questions';

export default function QuizScreen({
  questionData,
  currentIndex,
  totalQuestions,
  onAnswerSubmit,
  playerName,
}) {
  const [selectedOption, setSelectedOption] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); // { isCorrect: boolean } | null

  const isTextType = questionData.type === 'text';

  const handleSelectOption = (option) => {
    if (feedback !== null) return;
    playSelectSound();
    setSelectedOption(option);
  };

  const handleCheck = async (e) => {
    if (e) e.preventDefault();
    if (feedback !== null) return;

    const candidate = isTextType ? textAnswer.trim() : selectedOption;
    if (!candidate) return;

    const isCorrect = await verifyAnswer(questionData.id, candidate);
    setLastSubmittedAnswer(candidate);
    setFeedback({ isCorrect });
  };

  const handleContinue = () => {
    const isCorrect = feedback.isCorrect;
    const answered = lastSubmittedAnswer;
    setFeedback(null);
    setSelectedOption('');
    setTextAnswer('');
    setLastSubmittedAnswer('');
    onAnswerSubmit(isCorrect, answered);
  };

  const isCheckDisabled = isTextType ? !textAnswer.trim() : !selectedOption;
  const progressPercent = Math.round(((currentIndex) / totalQuestions) * 100);

  return (
    <div className="space-y-7">
      {/* Progress Header */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center text-xs font-pixel text-slate-400">
          <span>QUESTION {String(currentIndex + 1).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}</span>
          <span className="text-retro-yellow">{progressPercent}% COMPLETED</span>
        </div>
        {/* Retro XP Progress Bar */}
        <div className="w-full h-3 bg-slate-950 border-2 border-slate-900 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-retro-yellow to-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Question - Centered with proper vertical breathing room */}
      <div className="py-4 min-h-[90px] flex items-center justify-center text-center">
        <h2 className="font-pixel text-base sm:text-xl leading-relaxed text-slate-100 tracking-wide max-w-xl mx-auto">
          <TypewriterText
            key={questionData.id}
            text={questionData.question}
            speed={28}
          />
        </h2>
      </div>

      {/* Answer Area */}
      {isTextType ? (
        <form onSubmit={handleCheck} className="space-y-4 max-w-md mx-auto">
          <input
            type="text"
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            disabled={feedback !== null}
            placeholder={questionData.placeholder || "TYPE YOUR ANSWER"}
            className="w-full px-4 py-4 bg-slate-900 border-[3px] border-slate-950 rounded-xl text-slate-100 placeholder-slate-500 font-bold tracking-wide text-center focus:outline-none focus:border-retro-blueHeader focus:ring-2 focus:ring-retro-blueHeader/50 shadow-inner text-base sm:text-lg"
            autoFocus
          />
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {questionData.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            return (
              <button
                key={idx}
                type="button"
                disabled={feedback !== null}
                onClick={() => handleSelectOption(option)}
                className={`retro-btn px-4 py-4 text-xs sm:text-sm text-left justify-start ${
                  isSelected ? 'selected' : 'retro-btn-option'
                }`}
              >
                <span className="w-6 h-6 mr-3 rounded bg-slate-950/40 border border-slate-700/60 flex items-center justify-center font-pixel text-[10px] text-retro-yellow flex-shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="truncate">{option}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Action / Check Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleCheck}
          disabled={isCheckDisabled || feedback !== null}
          className="retro-btn retro-btn-yellow w-full py-4 text-sm sm:text-base font-pixel tracking-wider"
        >
          CHECK ANSWER
        </button>
      </div>

      {/* Duolingo Slide-up Banner */}
      {feedback !== null && (
        <DuolingoDrawer
          isCorrect={feedback.isCorrect}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
