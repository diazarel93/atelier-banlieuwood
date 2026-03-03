"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SoundName =
  | "submit"
  | "score-1"
  | "score-2"
  | "score-3"
  | "chapter-complete"
  | "badge-gold"
  | "combo"
  | "streak-break";

const SOUND_FILES: Record<SoundName, string> = {
  submit: "/sounds/atelier/submit.mp3",
  "score-1": "/sounds/atelier/score-1.mp3",
  "score-2": "/sounds/atelier/score-2.mp3",
  "score-3": "/sounds/atelier/score-3.mp3",
  "chapter-complete": "/sounds/atelier/chapter-complete.mp3",
  "badge-gold": "/sounds/atelier/badge-gold.mp3",
  combo: "/sounds/atelier/combo.mp3",
  "streak-break": "/sounds/atelier/streak-break.mp3",
};

const STORAGE_KEY = "atelier-muted";

export function useSound() {
  const audioCache = useRef<Map<SoundName, HTMLAudioElement>>(new Map());
  const [muted, setMuted] = useState(false);

  // Load mute state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") setMuted(true);
    } catch {
      // no localStorage
    }
  }, []);

  // Preload audio elements
  useEffect(() => {
    if (typeof window === "undefined") return;
    for (const [name, src] of Object.entries(SOUND_FILES)) {
      if (!audioCache.current.has(name as SoundName)) {
        const audio = new Audio(src);
        audio.preload = "auto";
        audio.volume = 0.5;
        audioCache.current.set(name as SoundName, audio);
      }
    }
  }, []);

  const play = useCallback(
    (name: SoundName) => {
      if (muted) return;
      const audio = audioCache.current.get(name);
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Autoplay blocked — ignore
        });
      }
    },
    [muted]
  );

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // no localStorage
      }
      return next;
    });
  }, []);

  return { play, muted, toggleMute };
}
