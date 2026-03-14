"use client";

import { AnimatePresence, motion } from "motion/react";

interface XpToastProps {
  delta: { amount: number; key: number } | null;
}

export function XpToast({ delta }: XpToastProps) {
  return (
    <div className="fixed top-20 right-4 z-50 pointer-events-none" aria-live="assertive" aria-atomic="true" role="status">
      <AnimatePresence>
        {delta && (
          <motion.div
            key={delta.key}
            initial={{ opacity: 1, y: 0, scale: 1.2 }}
            animate={{ opacity: 0, y: -60, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-bw-gold font-cinema text-lg drop-shadow-[0_2px_8px_rgba(212,168,67,0.5)]"
          >
            +{delta.amount} XP
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
