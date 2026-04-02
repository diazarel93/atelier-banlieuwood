"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface FlipCounterProps {
  current: number;
  total: number;
  label?: string;
}

/**
 * Airport-style flip counter for the class projector screen.
 * Displays "current / total" with a flip animation on each increment.
 */
export function FlipCounter({ current, total, label = "reponses" }: FlipCounterProps) {
  const [prevValue, setPrevValue] = useState(current);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (current !== prevValue) {
      setFlipping(true);
      const t = setTimeout(() => {
        setPrevValue(current);
        setFlipping(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [current, prevValue]);

  const digits = String(current).padStart(2, "0").split("");
  const totalDigits = String(total).padStart(2, "0").split("");
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Progress ring */}
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background ring */}
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          {/* Progress ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="url(#flip-grad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 42}
            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - pct / 100) }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="flip-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-bw-teal)" />
              <stop offset="100%" stopColor="var(--color-bw-gold)" />
            </linearGradient>
          </defs>
        </svg>
        {/* Center digits */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-baseline gap-0.5">
            {digits.map((d, i) => (
              <AnimatePresence mode="popLayout" key={`pos-${i}`}>
                <motion.span
                  key={`${i}-${d}`}
                  initial={flipping ? { y: -20, opacity: 0 } : false}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="text-4xl font-bold font-cinema text-white tabular-nums"
                >
                  {d}
                </motion.span>
              </AnimatePresence>
            ))}
            <span className="text-lg text-white/30 mx-1">/</span>
            {totalDigits.map((d, i) => (
              <span key={`t-${i}`} className="text-2xl font-bold font-cinema text-white/40 tabular-nums">
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-white/50 tracking-wider uppercase">{label}</p>
    </div>
  );
}
