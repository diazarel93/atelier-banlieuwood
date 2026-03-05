"use client";

import { motion } from "motion/react";

/** Micro-celebration: animated green checkmark shown between situations */
export function SuccessCheck() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex flex-col items-center justify-center gap-3 py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="w-16 h-16 rounded-full bg-bw-green/20 border-2 border-bw-green flex items-center justify-center"
      >
        <motion.svg
          width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <polyline points="20 6 9 17 4 12" />
        </motion.svg>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-bw-green font-medium"
      >
        Envoyé !
      </motion.p>
    </motion.div>
  );
}
