"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface CountdownTimerProps {
  /** ISO timestamp when the timer expires */
  endsAt: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Called when timer reaches 0 */
  onExpired?: () => void;
}

export function CountdownTimer({ endsAt, size = "md", onExpired }: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const diff = Math.ceil((new Date(endsAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.ceil((new Date(endsAt).getTime() - Date.now()) / 1000);
      const clamped = Math.max(0, diff);
      setSecondsLeft(clamped);
      if (clamped === 0) {
        clearInterval(interval);
        onExpired?.();
      }
    }, 250);
    return () => clearInterval(interval);
  }, [endsAt, onExpired]);

  const isUrgent = secondsLeft <= 5 && secondsLeft > 0;
  const isExpired = secondsLeft === 0;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const display = mins > 0
    ? `${mins}:${secs.toString().padStart(2, "0")}`
    : `${secs}s`;

  const sizeClasses = {
    sm: "text-sm px-2.5 py-1",
    md: "text-lg px-4 py-2 font-mono font-bold",
    lg: "text-3xl px-6 py-3 font-mono font-bold",
  };

  return (
    <AnimatePresence mode="wait">
      {isExpired ? (
        <motion.div
          key="expired"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`inline-flex items-center gap-2 rounded-xl glass ${sizeClasses[size]}`}
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            borderColor: "rgba(239, 68, 68, 0.25)",
            color: "#EF4444",
            boxShadow: "0 0 20px rgba(239, 68, 68, 0.15), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          Temps &eacute;coul&eacute; !
        </motion.div>
      ) : (
        <motion.div
          key="counting"
          animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
          transition={isUrgent ? { repeat: Infinity, duration: 0.5 } : {}}
          className={`inline-flex items-center gap-2 rounded-xl backdrop-blur-md ${sizeClasses[size]}`}
          style={{
            background: isUrgent
              ? "rgba(239, 68, 68, 0.12)"
              : "rgba(26, 29, 34, 0.7)",
            border: isUrgent
              ? "1px solid rgba(239, 68, 68, 0.3)"
              : "1px solid rgba(255, 255, 255, 0.06)",
            color: isUrgent ? "#EF4444" : "#F5F5F7",
            boxShadow: isUrgent
              ? "0 0 24px rgba(239, 68, 68, 0.2), 0 0 8px rgba(239, 68, 68, 0.1), inset 0 1px 0 rgba(255,255,255,0.04)"
              : "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          {display}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
