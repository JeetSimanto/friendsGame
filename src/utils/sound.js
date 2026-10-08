// Web Audio API Retro 8-bit Synthesizer
let audioCtx = null;
let isMuted = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setMuted(muted) {
  isMuted = muted;
  try {
    localStorage.setItem('friends_game_muted', muted ? 'true' : 'false');
  } catch (e) {
    // Ignore storage errors
  }
}

export function getMuted() {
  try {
    const stored = localStorage.getItem('friends_game_muted');
    if (stored !== null) {
      isMuted = stored === 'true';
    }
  } catch (e) {}
  return isMuted;
}

let lastTypingTime = 0;

// Single retro typewriter character click
export function playTypingSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  if (now - lastTypingTime < 0.03) return;
  lastTypingTime = now;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Subtle square/triangle click
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(650 + Math.random() * 150, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.025);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.025);
}

// Option selection / button click
export function playSelectSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

// Correct answer chime (Duolingo / 8-bit uplifting style)
export function playCorrectSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = ctx.currentTime + idx * 0.08;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.2);
  });
}

// Wrong answer buzz (Duolingo style)
export function playWrongSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(160, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.28);

  gain.gain.setValueAtTime(0.22, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

// Win Fanfare
export function playWinSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const melody = [
    { freq: 523.25, duration: 0.12 }, // C5
    { freq: 659.25, duration: 0.12 }, // E5
    { freq: 783.99, duration: 0.12 }, // G5
    { freq: 1046.50, duration: 0.25 }, // C6
    { freq: 880.00, duration: 0.12 }, // A5
    { freq: 1046.50, duration: 0.4 }, // C6
  ];

  let current = ctx.currentTime;
  melody.forEach((note) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(note.freq, current);

    gain.gain.setValueAtTime(0.15, current);
    gain.gain.exponentialRampToValueAtTime(0.001, current + note.duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(current);
    osc.stop(current + note.duration);

    current += note.duration;
  });
}

// Lose / Defeat Sound
export function playLoseSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const tones = [400, 350, 300, 220];
  let current = ctx.currentTime;

  tones.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, current);

    gain.gain.setValueAtTime(0.18, current);
    gain.gain.exponentialRampToValueAtTime(0.001, current + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(current);
    osc.stop(current + 0.2);

    current += 0.18;
  });
}

// Retro Arcade Coin / Boot Jingle
export function playCoinSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
  osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6

  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.35);
}
