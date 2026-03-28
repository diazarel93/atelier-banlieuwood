"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { SessionState } from "@/hooks/use-session-polling";

export interface ResultStateProps {
  collectiveChoice: NonNullable<SessionState["collectiveChoice"]>;
  isMyResponseChosen?: boolean;
  comboCount?: number;
  onReveal?: () => void;
}

/**
 * Cinematic reveal sequence:
 * 1. blackout (0.5s)   — screen goes dark
 * 2. fade (0.6s)       — title fades in
 * 3. slide (0.4s)      — chosen text slides up
 * 4. celebrate          — combo/celebration if applicable
 */
type RevealPhase = "blackout" | "fade" | "slide" | "celebrate";

export function ResultState({ collectiveChoice, isMyResponseChosen, comboCount, onReveal }: ResultStateProps) {
  const categoryColor = CATEGORY_COLORS[collectiveChoice.category] || "#FF6B35";
  const [phase, setPhase] = useState<RevealPhase>("blackout");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("fade"), 500),
      setTimeout(() => setPhase("slide"), 1100),
      setTimeout(() => {
        setPhase("celebrate");
        onReveal?.();
      }, 1500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-6 w-full"
    >
      <AnimatePresence mode="wait">
        {/* Phase 1: Blackout */}
        {phase === "blackout" && (
          <motion.div
            key="blackout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center py-16 w-full"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-3 h-3 rounded-full bg-bw-gold"
            />
          </motion.div>
        )}

        {/* Phase 2: Fade — title appears */}
        {phase === "fade" && (
          <motion.div
            key="fade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-3 py-8"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-bw-violet to-bw-primary flex items-center justify-center"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </motion.div>
            <h2 className="text-xl sm:text-2xl tracking-wider font-cinema">LE CHOIX DU GROUPE</h2>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="h-px bg-gradient-to-r from-transparent via-bw-gold/60 to-transparent max-w-[200px]"
            />
          </motion.div>
        )}

        {/* Phase 3+4: Slide + Celebrate — content appears */}
        {(phase === "slide" || phase === "celebrate") && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-5 w-full"
          >
            {/* Title (instant) */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-bw-violet to-bw-violet/60 mx-auto flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl tracking-wider font-cinema">LE CHOIX DU GROUPE</h2>
            </div>

            {/* Chosen text — slides up */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              className="w-full rounded-xl p-4 sm:p-6 border"
              style={{ backgroundColor: `${categoryColor}10`, borderColor: `${categoryColor}40` }}
              aria-live="assertive"
              aria-atomic="true"
            >
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3 inline-block"
                style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
              >
                {collectiveChoice.restitution_label || collectiveChoice.category}
              </motion.span>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-base sm:text-lg leading-relaxed mt-2"
              >
                {collectiveChoice.chosen_text}
              </motion.p>
            </motion.div>

            {/* Category color bar — animated width */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="h-1 rounded-full max-w-xs"
              style={{ backgroundColor: categoryColor }}
            />

            {/* Celebrate phase — combo + "ton idee" */}
            {phase === "celebrate" && isMyResponseChosen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-full rounded-xl p-4 bg-gradient-to-r from-bw-amber/20 to-bw-primary/20 border border-bw-amber/40 text-center space-y-2"
              >
                {(comboCount ?? 0) >= 2 && (
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ delay: 0.1 }}
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
                  {(comboCount ?? 0) >= 2 ? "Encore ton idee choisie par le groupe !" : "Le groupe a choisi ton idee !"}
                </motion.p>
              </motion.div>
            )}

            <p className="text-sm text-bw-muted">En attente de la prochaine situation...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
