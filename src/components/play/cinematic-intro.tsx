"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

// ——— Cinematic Title Screen ———
interface CinematicIntroProps {
  onComplete: () => void;
  sessionTitle?: string;
  studentName?: string;
  studentAvatar?: string;
}

export function CinematicIntro({ onComplete, sessionTitle, studentName, studentAvatar }: CinematicIntroProps) {
  const [phase, setPhase] = useState<"curtain" | "clap" | "title" | "welcome" | "fade">("curtain");

  useEffect(() => {
    const t0 = setTimeout(() => setPhase("clap"), 600);
    const t1 = setTimeout(() => setPhase("title"), 1400);
    const t2 = setTimeout(() => setPhase("welcome"), 2800);
    const t3 = setTimeout(() => setPhase("fade"), 4200);
    const t4 = setTimeout(onComplete, 4800);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#0a0a0a] flex items-center justify-center overflow-hidden"
      animate={phase === "fade" ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      onClick={onComplete}
    >
      {/* Film grain overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none film-grain" />

      {/* Curtain open effect */}
      <AnimatePresence>
        {phase === "curtain" && (
          <>
            <motion.div
              key="curtain-left"
              className="absolute inset-y-0 left-0 w-1/2 bg-[#1a0a0a]"
              initial={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(139,0,0,0.05) 30px, rgba(139,0,0,0.05) 32px)" }} />
            </motion.div>
            <motion.div
              key="curtain-right"
              className="absolute inset-y-0 right-0 w-1/2 bg-[#1a0a0a]"
              initial={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(139,0,0,0.05) 30px, rgba(139,0,0,0.05) 32px)" }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content phases */}
      <AnimatePresence mode="wait">
        {phase === "clap" && (
          <motion.div
            key="clap"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#08090E] border-2 border-bw-gold/40 flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 8h20" />
                  <path d="M8 4l-2 4" /><path d="M14 4l-2 4" /><path d="M20 4l-2 4" />
                </svg>
              </div>
              <motion.div
                className="absolute -top-3 left-2 right-2 h-6 rounded-t-lg bg-bw-gold origin-bottom-left"
                initial={{ rotate: -30 }}
                animate={{ rotate: [null, 0] }}
                transition={{ delay: 0.3, duration: 0.15, ease: "easeIn" }}
              >
                <div className="h-full flex items-center justify-center">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="w-3 h-1 bg-[#0a0a0a] rounded-full" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {phase === "title" && (
          <motion.div
            key="title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center space-y-3"
          >
            <h1 className="text-4xl font-bold tracking-wider font-cinema text-white">
              BANLIEU<span className="text-bw-primary">WOOD</span>
            </h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="h-px bg-gradient-to-r from-transparent via-bw-gold to-transparent mx-auto max-w-[200px]"
            />
            {sessionTitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-bw-gold/80 tracking-wide max-w-[280px] mx-auto"
              >
                {sessionTitle.replace(/\s*[-—]\s*$/, "")}
              </motion.p>
            )}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-bw-gold/60 tracking-[0.3em] uppercase"
            >
              presente
            </motion.p>
          </motion.div>
        )}

        {(phase === "welcome" || phase === "fade") && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            {studentAvatar && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="text-5xl"
              >
                {studentAvatar}
              </motion.div>
            )}
            <div className="space-y-1">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white/60 text-sm"
              >
                Bienvenue sur le plateau
              </motion.p>
              {studentName && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white text-xl font-semibold"
                >
                  {studentName}
                </motion.p>
              )}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2 justify-center text-bw-gold/50"
            >
              <div className="w-8 h-px bg-bw-gold/30" />
              <span className="text-[10px] tracking-[0.4em] uppercase">Action !</span>
              <div className="w-8 h-px bg-bw-gold/30" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 text-[10px] text-white/30 tracking-wide"
      >
        Toucher pour passer
      </motion.p>
    </motion.div>
  );
}
