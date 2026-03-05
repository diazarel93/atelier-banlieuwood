"use client";

import { useEffect, useState } from "react";

// ——— Typewriter Hook (per-word, not per-letter) ———
export function useTypewriter(text: string, msPerWord = 30) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    if (!text) return;

    const words = text.split(/(\s+)/); // Split keeping whitespace
    let wordIndex = 0;
    const interval = setInterval(() => {
      wordIndex++;
      setDisplayed(words.slice(0, wordIndex).join(""));
      if (wordIndex >= words.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, msPerWord);

    return () => clearInterval(interval);
  }, [text, msPerWord]);

  function skip() {
    setDisplayed(text);
    setDone(true);
  }

  return { displayed, done, skip };
}
