"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CINEMA_FACTS } from "@/lib/cinema-facts";

export interface SentStateProps {
  responsesCount?: number;
  connectedCount?: number;
  streak?: number;
  lastXpGain?: number;
}

export function SentState({ responsesCount, connectedCount, streak, lastXpGain }: SentStateProps) {
  const [factIndex, setFactIndex] = useState(() => Math.floor(Math.random() * CINEMA_FACTS.length));

  // Rotate facts every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % CINEMA_FACTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
        className="w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, rgba(78,205,196,0.25), rgba(16,185,129,0.15))" }}
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4ECDC4"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-12 h-12"
        >
          <motion.path d="M5 13l4 4L19 7" />
        </motion.svg>
      </motion.div>

      <div className="space-y-2">
        <h2
          className="text-xl sm:text-2xl tracking-wider font-cinema"
        >
          ENVOY&Eacute; !
        </h2>
        <div className="h-0.5 w-10 mx-auto rounded-full bg-gradient-to-r from-bw-teal to-bw-green" />
        <p className="text-bw-muted text-sm">
          En attente des autres joueurs...
        </p>
      </div>

      {/* Streak + XP badge */}
      <div className="flex items-center gap-2">
        {(streak ?? 0) >= 2 && (
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-bw-amber/20 to-bw-primary/20 border border-bw-amber/40 rounded-full px-4 py-1.5"
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="text-base"
            >
              {"\uD83D\uDD25"}
            </motion.span>
            <span className="text-sm font-bold text-bw-amber">x{streak}</span>
            <span className="text-xs text-bw-amber/70">streak</span>
          </motion.div>
        )}
        {(lastXpGain ?? 0) > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
            className="text-sm font-bold text-bw-gold"
          >
            +{lastXpGain} XP
          </motion.span>
        )}
      </div>

      {/* Live counter */}
      {responsesCount != null && connectedCount != null && connectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card px-5 py-3"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-sm text-bw-muted">
            <span className="text-bw-teal font-semibold">{responsesCount}</span>
            <span className="text-bw-muted">/{connectedCount}</span>
            {" "}ont r&eacute;pondu
          </p>
        </motion.div>
      )}

      {/* Cinema fun fact */}
      <motion.div
        className="max-w-[280px] sm:max-w-xs px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className="rounded-xl px-4 py-3" style={{ background: "linear-gradient(135deg, rgba(212,168,67,0.08), rgba(139,92,246,0.05))", border: "1px solid rgba(212,168,67,0.12)" }}>
          <p className="text-[9px] uppercase tracking-widest text-bw-gold mb-1 font-bold">Le saviez-vous ?</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={factIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-bw-text leading-relaxed"
            >
              {CINEMA_FACTS[factIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="flex gap-1"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
            className="w-2 h-2 rounded-full bg-bw-teal"
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
