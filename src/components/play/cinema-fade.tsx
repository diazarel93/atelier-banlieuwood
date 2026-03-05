"use client";

import { motion } from "motion/react";

// ——— Cinema Fade Transition wrapper ———
export function CinemaFade({ children, viewKey }: { children: React.ReactNode; viewKey: string }) {
  return (
    <motion.div
      key={viewKey}
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Brief flash on enter */}
      <motion.div
        className="fixed inset-0 z-30 bg-white/[0.03] pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
      {children}
    </motion.div>
  );
}
