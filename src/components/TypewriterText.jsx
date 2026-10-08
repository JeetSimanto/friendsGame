import React, { useState, useEffect } from 'react';
import { playTypingSound } from '../utils/sound';

export default function TypewriterText({ text, speed = 28, onComplete, className = '' }) {
  const [index, setIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setIndex(0);
    setIsTyping(true);

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex <= text.length) {
        setIndex(currentIndex);
        if (text[currentIndex - 1] !== ' ') {
          playTypingSound();
        }
      } else {
        clearInterval(interval);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  const handleSkip = () => {
    if (isTyping) {
      setIndex(text.length);
      setIsTyping(false);
      if (onComplete) onComplete();
    }
  };

  const visibleText = text.slice(0, index);
  const hiddenText = text.slice(index);

  return (
    <span
      onClick={handleSkip}
      className={`cursor-pointer select-none inline ${className}`}
      title="Click to skip animation"
    >
      <span>{visibleText}</span>
      {isTyping && (
        <span className="inline-block w-[3px] h-[0.85em] ml-0.5 bg-retro-blueHeader align-baseline animate-pulse" />
      )}
      {isTyping && (
        <span className="opacity-0 pointer-events-none select-none" aria-hidden="true">
          {hiddenText}
        </span>
      )}
    </span>
  );
}
