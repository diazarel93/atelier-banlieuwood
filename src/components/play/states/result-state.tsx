"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CATEGORY_COLORS } from "@/lib/constants";
import { MiniLeaderboard } from "@/components/play/mini-leaderboard";
import type { SessionState } from "@/hooks/use-session-polling";

export interface ResultStateProps {
  collectiveChoice: NonNullable<SessionState["collectiveChoice"]>;
  isMyResponseChosen?: boolean;
  comboCount?: number;
  onReveal?: () => void;
  topStudents?: { id: string; displayName: string; avatar: string; xp: number }[];
  currentStudentId?: string;
  currentRank?: number;
}

export function ResultState({
  collectiveChoice,
  isMyResponseChosen,
  comboCount,
  onReveal,
  topStudents,
  currentStudentId,
  currentRank,
}: ResultStateProps) {
  const categoryColor = CATEGORY_COLORS[collectiveChoice.category] || "#FF6B35";
  const [phase, setPhase] = useState<"suspense" | "revealed">("suspense");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("revealed");
      onReveal?.();
    }, 2200);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-6 w-full"
    >
      <AnimatePresence mode="wait">
        {phase === "suspense" ? (
          <motion.div
            key="suspense"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="flex flex-col items-center gap-4 py-8"
          >
            {/* Pulsing envelope icon */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, -3, 3, 0] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-bw-violet to-bw-primary flex items-center justify-center"
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </motion.div>
            {/* Countdown dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.2, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.6, duration: 0.3 }}
                  className="w-3 h-3 rounded-full bg-bw-violet"
                />
              ))}
            </div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-base tracking-wider text-bw-gold font-cinema"
            >
              LE CHOIX ARRIVE...
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="flex flex-col items-center gap-5 w-full"
          >
            <div className="text-center space-y-2">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-bw-violet to-bw-violet/60 mx-auto flex items-center justify-center"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </motion.div>
              <h2
                className="text-xl sm:text-2xl tracking-wider font-cinema"
              >
                CHOIX COLLECTIF
              </h2>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full rounded-xl p-4 sm:p-6 border"
              style={{ backgroundColor: `${categoryColor}10`, borderColor: `${categoryColor}40` }}
              aria-live="assertive"
              aria-atomic="true"
            >
              <span
                className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3 inline-block"
                style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
              >
                {collectiveChoice.restitution_label || collectiveChoice.category}
              </span>
              <p className="text-base sm:text-lg leading-relaxed mt-2">{collectiveChoice.chosen_text}</p>
            </motion.div>

            {/* "Ton idee retenue" celebration -- with combo */}
            {isMyResponseChosen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="w-full rounded-xl p-4 bg-gradient-to-r from-bw-amber/20 to-bw-primary/20 border border-bw-amber/40 text-center space-y-2"
              >
                {(comboCount ?? 0) >= 2 && (
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-bw-gold font-cinema"
                  >
                    COMBO x{comboCount}
                  </motion.p>
                )}
                <motion.p
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: 2, duration: 0.4 }}
                  className="text-sm font-bold text-bw-amber"
                >
                  {(comboCount ?? 0) >= 2
                    ? "Encore ton idée choisie par le groupe !"
                    : "Le groupe a choisi ton idée !"}
                </motion.p>
              </motion.div>
            )}

            {/* Mini leaderboard — top 3 after result */}
            {topStudents && topStudents.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex justify-center">
                <MiniLeaderboard entries={topStudents} currentStudentId={currentStudentId} currentRank={currentRank} />
              </motion.div>
            )}

            <p className="text-sm text-bw-muted">
              En attente de la prochaine situation...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
