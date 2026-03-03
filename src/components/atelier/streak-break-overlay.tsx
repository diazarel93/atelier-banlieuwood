"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function StreakBreakOverlay({
  previousStreak,
  show,
}: {
  previousStreak: number;
  show: boolean;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 1500);
      return () => clearTimeout(t);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-center space-y-3 bg-card/95 border-2 border-orange-500/30 rounded-3xl p-8 shadow-2xl"
          >
            <div className="text-5xl">💔</div>
            <h3 className="text-xl font-black text-orange-600 dark:text-orange-400">
              Serie perdue !
            </h3>
            <p className="text-sm text-muted-foreground">
              {previousStreak} reponses parfaites d&apos;affilee
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
