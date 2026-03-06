"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

// ═══════════════════════════════════════════════════════════════
// CELEBRATIONS — Achievement unlocks, level ups, streak milestones
// ═══════════════════════════════════════════════════════════════

interface CelebrationProps {
  type: "achievement" | "level_up" | "streak" | "retained" | "combo";
  title: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  visible: boolean;
  onDismiss: () => void;
  autoHide?: number; // ms
}

export function CelebrationOverlay({
  type,
  title,
  subtitle,
  icon,
  color = "#FF6B35",
  visible,
  onDismiss,
  autoHide = 4000,
}: CelebrationProps) {
  useEffect(() => {
    if (visible && autoHide > 0) {
      const timer = setTimeout(onDismiss, autoHide);
      return () => clearTimeout(timer);
    }
  }, [visible, autoHide, onDismiss]);

  const fireConfetti = useCallback(async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      if (type === "level_up") {
        // Big burst for level up
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ["#FF6B35", "#D4A843", "#4ECDC4", "#8B5CF6"],
        });
      } else if (type === "achievement") {
        // Double burst
        confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } });
        confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } });
      } else {
        // Small burst
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      }
    } catch { /* confetti not available */ }
  }, [type]);

  useEffect(() => {
    if (visible) fireConfetti();
  }, [visible, fireConfetti]);

  const backgrounds: Record<string, string> = {
    achievement: "linear-gradient(135deg, #D4A843, #F5ECCE)",
    level_up: "linear-gradient(135deg, #FF6B35, #D4A843)",
    streak: "linear-gradient(135deg, #EF4444, #FF6B35)",
    retained: "linear-gradient(135deg, #4ECDC4, #2B9A93)",
    combo: "linear-gradient(135deg, #8B5CF6, #EC4899)",
  };

  const defaultIcons: Record<string, string> = {
    achievement: "🏅",
    level_up: "⬆️",
    streak: "🔥",
    retained: "🏆",
    combo: "💥",
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.5, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={onDismiss}
            className="pointer-events-auto cursor-pointer rounded-3xl px-8 py-6 text-center max-w-xs"
            style={{
              background: backgrounds[type] || `linear-gradient(135deg, ${color}, ${color}CC)`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.3), 0 0 40px ${color}40`,
            }}
          >
            <motion.span
              className="text-5xl inline-block"
              animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {icon || defaultIcons[type] || "🎉"}
            </motion.span>
            <motion.h2
              className="text-xl font-black text-white mt-3"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {title}
            </motion.h2>
            {subtitle && (
              <motion.p
                className="text-sm text-white/80 mt-1"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                {subtitle}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// XP delta animation — floating "+10 XP" text
export function XPDelta({ amount, visible }: { amount: number; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && amount > 0 && (
        <motion.span
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -30, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="fixed top-4 right-4 z-50 text-lg font-black pointer-events-none"
          style={{ color: "#FF6B35", textShadow: "0 2px 8px rgba(255,107,53,0.4)" }}
        >
          +{amount} XP
        </motion.span>
      )}
    </AnimatePresence>
  );
}
