"use client";

import { motion, AnimatePresence } from "motion/react";
import { Flame } from "lucide-react";

export function StreakHud({ streak }: { streak: number }) {
  return (
    <AnimatePresence>
      {streak >= 2 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-1.5"
        >
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-black text-orange-600 dark:text-orange-400">
            {streak}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
