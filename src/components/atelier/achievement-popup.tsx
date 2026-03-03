"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ACHIEVEMENT_MAP } from "@/lib/models/achievements";
import confetti from "canvas-confetti";

export function AchievementPopup({
  achievementIds,
}: {
  achievementIds: string[];
}) {
  const [queue, setQueue] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);

  // When new IDs arrive, add to queue
  useEffect(() => {
    if (achievementIds.length > 0) {
      setQueue((prev) => [...prev, ...achievementIds]);
    }
  }, [achievementIds]);

  // Process queue one at a time
  useEffect(() => {
    if (current || queue.length === 0) return;

    const next = queue[0];
    setCurrent(next);
    setQueue((prev) => prev.slice(1));

    // Mini confetti burst
    confetti({
      particleCount: 30,
      spread: 40,
      origin: { y: 0.9, x: 0.5 },
      colors: ["#fbbf24", "#f97316", "#34d399"],
    });

    const timer = setTimeout(() => setCurrent(null), 4000);
    return () => clearTimeout(timer);
  }, [current, queue]);

  const def = current ? ACHIEVEMENT_MAP.get(current) : null;

  return (
    <AnimatePresence>
      {def && (
        <motion.div
          key={current}
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-3 bg-card border-2 border-yellow-500/30 rounded-2xl px-5 py-3 shadow-2xl shadow-yellow-500/10">
            <span className="text-3xl">{def.emoji}</span>
            <div>
              <p className="text-xs uppercase tracking-wider font-black text-yellow-600 dark:text-yellow-400">
                Succes debloque !
              </p>
              <p className="text-sm font-bold">{def.label}</p>
              <p className="text-xs text-muted-foreground">
                {def.description}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
