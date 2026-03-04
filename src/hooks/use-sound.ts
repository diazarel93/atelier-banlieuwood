"use client";

import { useCallback, useRef } from "react";

// Lightweight sound effects using Web Audio API — no external files needed
// Each sound is generated procedurally

type SoundName = "send" | "success" | "vote" | "reveal" | "jingle" | "drumroll" | "cardReveal" | "tick" | "fanfare" | "levelUp";

function createAudioContext(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  } catch {
    return null;
  }
}

function playSend(ctx: AudioContext) {
  // Quick ascending "woosh" — two short tones
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "sine";
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

function playSuccess(ctx: AudioContext) {
  // Two-note "ding ding" — cheerful confirmation
  [0, 0.12].forEach((delay, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(i === 0 ? 523 : 659, ctx.currentTime + delay); // C5, E5

    gain.gain.setValueAtTime(0.12, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.25);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.25);
  });
}

function playVote(ctx: AudioContext) {
  // Soft "pop" — quick tap
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "sine";
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
}

function playReveal(ctx: AudioContext) {
  // Triumphant three-note chord — C E G
  [523, 659, 784].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

    gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.4);

    osc.start(ctx.currentTime + i * 0.08);
    osc.stop(ctx.currentTime + i * 0.08 + 0.4);
  });
}

function playJingle(ctx: AudioContext) {
  // Cinema jingle — ascending C major arpeggio with reverb-like tail
  // C4 → E4 → G4 → C5 with increasing volume
  const notes = [
    { freq: 262, delay: 0, dur: 0.3 },
    { freq: 330, delay: 0.15, dur: 0.3 },
    { freq: 392, delay: 0.3, dur: 0.35 },
    { freq: 523, delay: 0.45, dur: 0.6 },
  ];
  notes.forEach(({ freq, delay, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(0.12, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + dur);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + dur);
  });
}

function playDrumroll(ctx: AudioContext) {
  // Quick suspense drumroll — noise bursts
  for (let i = 0; i < 8; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sawtooth";
    const t = ctx.currentTime + i * 0.08;
    osc.frequency.setValueAtTime(80 + i * 5, t);
    gain.gain.setValueAtTime(0.04 + i * 0.01, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
    osc.start(t);
    osc.stop(t + 0.06);
  }
}

function playCardReveal(ctx: AudioContext) {
  // Short stamp (thump) + shimmer — card level-up sound
  // Thump: low sine hit
  const thump = ctx.createOscillator();
  const thumpGain = ctx.createGain();
  thump.connect(thumpGain);
  thumpGain.connect(ctx.destination);
  thump.type = "sine";
  thump.frequency.setValueAtTime(120, ctx.currentTime);
  thump.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.12);
  thumpGain.gain.setValueAtTime(0.18, ctx.currentTime);
  thumpGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  thump.start(ctx.currentTime);
  thump.stop(ctx.currentTime + 0.15);

  // Shimmer: high sparkle chord (E5 + G#5)
  [659, 831].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + 0.08 + i * 0.04);
    gain.gain.setValueAtTime(0.07, ctx.currentTime + 0.08 + i * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08 + i * 0.04 + 0.3);
    osc.start(ctx.currentTime + 0.08 + i * 0.04);
    osc.stop(ctx.currentTime + 0.08 + i * 0.04 + 0.3);
  });
}

function playTick(ctx: AudioContext) {
  // Short 800Hz sine tick — 50ms
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

function playFanfare(ctx: AudioContext) {
  // Bright C-E-G-C triangle fanfare — 0.6s
  [523, 659, 784, 1047].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "triangle";
    const t = ctx.currentTime + i * 0.12;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    osc.start(t);
    osc.stop(t + 0.25);
  });
}

function playLevelUp(ctx: AudioContext) {
  // Sweep 200→1200Hz + sparkle E6+G6
  const sweep = ctx.createOscillator();
  const sweepGain = ctx.createGain();
  sweep.connect(sweepGain);
  sweepGain.connect(ctx.destination);
  sweep.type = "sine";
  sweep.frequency.setValueAtTime(200, ctx.currentTime);
  sweep.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.35);
  sweepGain.gain.setValueAtTime(0.12, ctx.currentTime);
  sweepGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
  sweep.start(ctx.currentTime);
  sweep.stop(ctx.currentTime + 0.4);

  // Sparkle: E6 + G6
  [1319, 1568].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    const t = ctx.currentTime + 0.3 + i * 0.06;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    osc.start(t);
    osc.stop(t + 0.3);
  });
}

const SOUNDS: Record<SoundName, (ctx: AudioContext) => void> = {
  send: playSend,
  success: playSuccess,
  vote: playVote,
  reveal: playReveal,
  jingle: playJingle,
  drumroll: playDrumroll,
  cardReveal: playCardReveal,
  tick: playTick,
  fanfare: playFanfare,
  levelUp: playLevelUp,
};

export function useSound(opts?: { muted?: boolean }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const mutedRef = useRef(opts?.muted ?? false);
  mutedRef.current = opts?.muted ?? false;

  const play = useCallback((name: SoundName) => {
    if (mutedRef.current) return;

    // Lazy init — AudioContext requires user interaction first
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext();
    }
    const ctx = ctxRef.current;
    if (!ctx) return;

    // Resume if suspended (browser policy)
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    SOUNDS[name]?.(ctx);
  }, []);

  return { play };
}
