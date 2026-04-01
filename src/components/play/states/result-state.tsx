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

// Deterministic particles — no Math.random to avoid SSR hydration mismatch
const CONFETTI_PARTICLES = [
  { id: 0, dx: -280, dy: -220, color: "#FF6B35", duration: 0.9, rotate: 240 },
  { id: 1, dx: 180, dy: -300, color: "#D4A843", duration: 1.1, rotate: -160 },
  { id: 2, dx: 310, dy: -120, color: "#4ECDC4", duration: 0.8, rotate: 320 },
  { id: 3, dx: -140, dy: 260, color: "#8B5CF6", duration: 1.0, rotate: -80 },
  { id: 4, dx: 240, dy: 200, color: "#F59E0B", duration: 0.75, rotate: 180 },
  { id: 5, dx: -320, dy: 60, color: "#10B981", duration: 1.2, rotate: -300 },
  { id: 6, dx: 80, dy: 290, color: "#FF6B35", duration: 0.65, rotate: 120 },
  { id: 7, dx: -200, dy: -280, color: "#D4A843", duration: 1.0, rotate: 280 },
  { id: 8, dx: 260, dy: -240, color: "#4ECDC4", duration: 0.85, rotate: -200 },
  { id: 9, dx: -100, dy: 310, color: "#8B5CF6", duration: 1.15, rotate: 360 },
  { id: 10, dx: 300, dy: 90, color: "#F59E0B", duration: 0.7, rotate: -140 },
  { id: 11, dx: -260, dy: 180, color: "#10B981", duration: 0.95, rotate: 220 },
  { id: 12, dx: 130, dy: -310, color: "#FF6B35", duration: 1.05, rotate: -40 },
  { id: 13, dx: -310, dy: -100, color: "#D4A843", duration: 0.8, rotate: 300 },
  { id: 14, dx: 200, dy: 270, color: "#4ECDC4", duration: 1.1, rotate: -260 },
  { id: 15, dx: -60, dy: -290, color: "#8B5CF6", duration: 0.9, rotate: 80 },
  { id: 16, dx: 280, dy: -180, color: "#F59E0B", duration: 0.75, rotate: -320 },
  { id: 17, dx: -220, dy: 240, color: "#10B981", duration: 1.0, rotate: 160 },
  { id: 18, dx: 160, dy: 300, color: "#FF6B35", duration: 0.85, rotate: -100 },
  { id: 19, dx: -290, dy: -160, color: "#D4A843", duration: 1.2, rotate: 260 },
  { id: 20, dx: 320, dy: 150, color: "#4ECDC4", duration: 0.65, rotate: -180 },
  { id: 21, dx: -80, dy: 280, color: "#8B5CF6", duration: 1.05, rotate: 340 },
  { id: 22, dx: 240, dy: -270, color: "#F59E0B", duration: 0.9, rotate: -60 },
  { id: 23, dx: -190, dy: -50, color: "#10B981", duration: 0.75, rotate: 200 },
];

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

            {/* Celebrate phase — confetti + "ton idée" */}
            {phase === "celebrate" && isMyResponseChosen && (
              <>
                {/* Screen flash */}
                <motion.div
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="fixed inset-0 pointer-events-none z-50"
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(212,168,67,0.35) 0%, transparent 70%)",
                  }}
                />

                {/* Confetti burst — 24 particles */}
                <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                  {CONFETTI_PARTICLES.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ x: "50vw", y: "50vh", scale: 0, opacity: 1 }}
                      animate={{
                        x: `calc(50vw + ${p.dx}px)`,
                        y: `calc(50vh + ${p.dy}px)`,
                        scale: [0, 1, 0.6],
                        opacity: [1, 1, 0],
                        rotate: p.rotate,
                      }}
                      transition={{ duration: p.duration, ease: "easeOut" }}
                      className="absolute w-2 h-2 rounded-sm"
                      style={{ backgroundColor: p.color, top: 0, left: 0 }}
                    />
                  ))}
                </div>

                {/* Celebration card */}
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 18 }}
                  className="w-full rounded-2xl p-5 text-center space-y-3 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(212,168,67,0.18) 0%, rgba(255,107,53,0.14) 100%)",
                    border: "1px solid rgba(212,168,67,0.45)",
                    boxShadow: "0 0 40px rgba(212,168,67,0.2), 0 4px 16px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* Shimmer sweep */}
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }}
                  />

                  {(comboCount ?? 0) >= 2 && (
                    <motion.p
                      initial={{ scale: 0, rotate: -8 }}
                      animate={{ scale: [0, 1.4, 1], rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                      className="text-3xl font-black text-bw-gold font-cinema tracking-widest"
                    >
                      COMBO ×{comboCount}
                    </motion.p>
                  )}

                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-4xl"
                  >
                    🎬
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-base font-bold text-bw-amber leading-snug"
                  >
                    {(comboCount ?? 0) >= 2
                      ? "Encore ton idée choisie par le groupe !"
                      : "Le groupe a choisi ton idée !"}
                  </motion.p>
                </motion.div>
              </>
            )}

            <p className="text-sm text-bw-muted">En attente de la prochaine situation...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
