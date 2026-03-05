"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

// ——— Cinematic Title Screen ———
export function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"clap" | "title" | "fade">("clap");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("title"), 800);
    const t2 = setTimeout(() => setPhase("fade"), 2200);
    const t3 = setTimeout(onComplete, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-bw-bg flex items-center justify-center"
      animate={phase === "fade" ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Clap board */}
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
            {/* Clap board SVG */}
            <div className="relative w-28 h-28">
              {/* Board body */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-bw-elevated to-[#08090E] border-2 border-bw-gold/40 flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 8h20" />
                  <path d="M8 4l-2 4" /><path d="M14 4l-2 4" /><path d="M20 4l-2 4" />
                </svg>
              </div>
              {/* Clap top — animated */}
              <motion.div
                className="absolute -top-3 left-2 right-2 h-6 rounded-t-lg bg-bw-gold origin-bottom-left"
                initial={{ rotate: -30 }}
                animate={{ rotate: [null, 0] }}
                transition={{ delay: 0.3, duration: 0.15, ease: "easeIn" }}
              >
                <div className="h-full flex items-center justify-center">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="w-3 h-1 bg-bw-bg rounded-full" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {(phase === "title" || phase === "fade") && (
          <motion.div
            key="title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <h1 className="text-4xl font-bold tracking-wider font-cinema">
              BANLIEU<span className="text-bw-primary">WOOD</span>
            </h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="h-px bg-gradient-to-r from-transparent via-bw-gold to-transparent mx-auto max-w-[200px]"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xs text-bw-gold tracking-[0.3em] uppercase"
            >
              Action !
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
