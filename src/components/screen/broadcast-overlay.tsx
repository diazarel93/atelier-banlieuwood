"use client";

import { motion, AnimatePresence } from "motion/react";

export interface BroadcastMessageOverlayProps {
  broadcastMsg: string | null;
}

/** Check if a broadcast message is a special screen control command */
export function isScreenCommand(msg: string | null | undefined): boolean {
  if (!msg) return false;
  return msg.startsWith("__SCREEN_MODE:") || msg === "__SCREEN_FROZEN";
}

/** Parse screen mode from broadcast message */
export function parseScreenMode(msg: string | null | undefined): string | null {
  if (!msg) return null;
  if (msg === "__SCREEN_FROZEN") return "frozen";
  if (msg.startsWith("__SCREEN_MODE:")) return msg.replace("__SCREEN_MODE:", "");
  return null;
}

export function BroadcastMessageOverlay({ broadcastMsg }: BroadcastMessageOverlayProps) {
  // Don't render overlay for screen control commands — these are handled by the screen page itself
  const isCommand = isScreenCommand(broadcastMsg);

  return (
    <AnimatePresence>
      {broadcastMsg && !isCommand && (
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

      {/* Screen frozen overlay (#22) */}
      {broadcastMsg === "__SCREEN_FROZEN" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center"
        >
          <div className="text-center space-y-4">
            <p className="text-6xl">&#10052;</p>
            <p className="text-2xl text-white/80 font-medium">Ecran en pause</p>
            <p className="text-sm text-white/40">Le professeur a mis l&apos;ecran en pause</p>
          </div>
        </motion.div>
      )}

      {/* Screen blank mode (#15) */}
      {broadcastMsg === "__SCREEN_MODE:blank" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black"
        />
      )}
    </AnimatePresence>
  );
}
