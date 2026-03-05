"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

const REACTION_EMOJIS = ["🎬", "🔥", "💡", "👏", "⭐", "🎭", "✨", "💥"];

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number; // 0-100 (%)
}

let nextId = 0;

/**
 * Floating reaction bubbles on the projection screen.
 * Emits a new bubble each time `triggerCount` increments (e.g. new response received).
 */
export function FloatingReactions({ triggerCount }: { triggerCount: number }) {
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const prevCount = useRef(triggerCount);

  const spawnReaction = useCallback(() => {
    const reaction: FloatingReaction = {
      id: ++nextId,
      emoji: REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)],
      x: 5 + Math.random() * 90,
    };
    setReactions((prev) => [...prev.slice(-15), reaction]); // Keep max 15
    // Auto-remove after animation
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
    }, 3000);
  }, []);

  useEffect(() => {
    if (triggerCount > prevCount.current) {
      // Spawn 1-2 reactions per new response
      spawnReaction();
      if (Math.random() > 0.5) {
        setTimeout(spawnReaction, 200 + Math.random() * 400);
      }
    }
    prevCount.current = triggerCount;
  }, [triggerCount, spawnReaction]);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {reactions.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: "100vh", scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], y: "-10vh", scale: [0.5, 1.2, 1, 0.8] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.8, ease: "easeOut" }}
            className="absolute text-3xl"
            style={{ left: `${r.x}%`, bottom: 0 }}
          >
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
