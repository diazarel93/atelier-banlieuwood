"use client";

import { motion } from "motion/react";

export function PausedState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-4 text-center"
    >
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-bw-amber to-bw-amber/40 mx-auto flex items-center justify-center">
        <div className="flex gap-1.5">
          <div className="w-2 h-7 bg-white rounded-sm" />
          <div className="w-2 h-7 bg-white rounded-sm" />
        </div>
      </div>
      <h2
        className="text-xl sm:text-2xl tracking-wider text-bw-amber font-cinema"
      >
        PAUSE
      </h2>
      <p className="text-bw-muted text-sm">Le facilitateur a mis la partie en pause</p>
    </motion.div>
  );
}
