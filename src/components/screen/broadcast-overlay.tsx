"use client";

import { motion, AnimatePresence } from "motion/react";

export interface BroadcastMessageOverlayProps {
  broadcastMsg: string | null;
}

export function BroadcastMessageOverlay({ broadcastMsg }: BroadcastMessageOverlayProps) {
  return (
    <AnimatePresence>
      {broadcastMsg && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[600px] max-w-[90vw]"
        >
          <div className="px-8 py-5 rounded-2xl bg-bw-primary/20 border border-bw-primary/40 text-center backdrop-blur-md shadow-lg shadow-bw-primary/10">
            <p className="text-xs text-bw-primary font-semibold uppercase tracking-[0.2em] mb-2">Message du professeur</p>
            <p className="text-xl text-white font-medium line-clamp-3">{broadcastMsg}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
