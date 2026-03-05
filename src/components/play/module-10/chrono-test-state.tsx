"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import type { Module10Data } from "@/hooks/use-session-polling";

export interface ChronoTestStateProps {
  module10: Module10Data;
  sessionId: string;
  studentId: string;
  onDone: (data: { chronoSeconds: number }) => void;
}

export function ChronoTestState({
  module10, sessionId, studentId, onDone,
}: ChronoTestStateProps) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(module10.chronoSeconds != null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const DURATION = 30;

  useEffect(() => {
    if (running && elapsed < DURATION) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= DURATION - 1) {
            setRunning(false);
            return DURATION;
          }
          return prev + 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [running, elapsed]);

  async function handleStop() {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      await fetch(`/api/sessions/${sessionId}/pitch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, chronoSeconds: elapsed }),
      });
      setDone(true);
      onDone({ chronoSeconds: elapsed });
    } catch {
      toast.error("Erreur de sauvegarde — réessaie");
      setRunning(false);
    }
  }

  const remaining = DURATION - elapsed;
  const isLow = remaining <= 10;
  const progress = elapsed / DURATION;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-6 w-full max-w-md mx-auto px-4">
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-bw-amber/20 text-bw-amber">
        Chrono Pitch
      </motion.span>
      {module10.pitchText && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ delay: 0.2 }}
          className="w-full p-3 rounded-xl bg-bw-elevated border border-white/[0.06] text-xs text-bw-muted max-h-32 overflow-y-auto">
          {module10.pitchText}
        </motion.div>
      )}
      {/* Timer circle with SVG progress ring */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={running && isLow
          ? { scale: [1, 1.06, 1], opacity: 1 }
          : { scale: 1, opacity: 1 }}
        transition={running && isLow
          ? { scale: { repeat: Infinity, duration: 0.8 }, opacity: { duration: 0 } }
          : { type: "spring", stiffness: 150, damping: 15, delay: 0.3 }}
        className="relative w-36 h-36">
        {/* SVG ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 144 144">
          <circle cx="72" cy="72" r="66" fill="none" stroke="currentColor" strokeWidth="4"
            className={done ? "text-bw-green/20" : "text-white/5"} />
          {running && (
            <motion.circle cx="72" cy="72" r="66" fill="none" strokeWidth="4" strokeLinecap="round"
              className={isLow ? "text-bw-danger" : "text-bw-amber"}
              strokeDasharray={2 * Math.PI * 66}
              strokeDashoffset={2 * Math.PI * 66 * (1 - progress)} />
          )}
          {done && (
            <motion.circle cx="72" cy="72" r="66" fill="none" strokeWidth="4" strokeLinecap="round"
              className="text-bw-green"
              strokeDasharray={2 * Math.PI * 66}
              initial={{ strokeDashoffset: 2 * Math.PI * 66 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }} />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                className="flex flex-col items-center">
                <span className="text-3xl">✅</span>
                <span className="text-xs text-bw-green font-medium mt-1">{module10.chronoSeconds ?? elapsed}s</span>
              </motion.div>
            ) : (
              <motion.span key="timer" exit={{ scale: 0.5, opacity: 0 }}
                className={`text-4xl font-bold tabular-nums ${isLow && running ? "text-bw-danger" : "text-bw-text"}`}>
                {remaining}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-bw-muted text-center">
        {done ? "Chrono terminé ! Bien joué 🎤" : running ? "Lis ton pitch à voix haute !" : "Appuie sur START quand tu es prêt"}
      </motion.p>
      {/* Animated button swap */}
      <AnimatePresence mode="wait">
        {!done && !running && (
          <motion.button key="start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setRunning(true)}
            className="px-8 py-3 rounded-xl bg-bw-amber text-white font-bold text-lg cursor-pointer shadow-lg shadow-bw-amber/20 hover:brightness-110">
            START
          </motion.button>
        )}
        {running && (
          <motion.button key="stop"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStop}
            className="px-8 py-3 rounded-xl bg-bw-green text-white font-bold text-sm cursor-pointer shadow-lg shadow-bw-green/20">
            J&apos;ai fini !
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
