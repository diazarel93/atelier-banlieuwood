"use client";

import { useState, useEffect } from "react";

/**
 * Returns true if the user prefers reduced motion.
 * Updates reactively if the user changes the setting.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    function handler(e: MediaQueryListEvent) {
      setReduced(e.matches);
    }

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
