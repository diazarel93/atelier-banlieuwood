"use client";

import { motion, AnimatePresence } from "motion/react";

export type MentorMood =
  | "neutral"
  | "thinking"
  | "happy"
  | "impressed"
  | "encouraging"
  | "concerned";

const MOOD_CONFIG: Record<
  MentorMood,
  { emoji: string; bg: string; message: string }
> = {
  neutral: {
    emoji: "🎬",
    bg: "bg-muted/50",
    message: "Pret a ecrire !",
  },
  thinking: {
    emoji: "🤔",
    bg: "bg-amber-500/10",
    message: "Hmm, voyons voir...",
  },
  happy: {
    emoji: "😄",
    bg: "bg-emerald-500/10",
    message: "C'est bien parti !",
  },
  impressed: {
    emoji: "🤩",
    bg: "bg-yellow-500/10",
    message: "Impressionnant !",
  },
  encouraging: {
    emoji: "💪",
    bg: "bg-accent/10",
    message: "Tu peux faire mieux !",
  },
  concerned: {
    emoji: "🧐",
    bg: "bg-orange-500/10",
    message: "Creuse encore...",
  },
};

export function MentorAvatar({
  mood,
  size = "md",
  showMessage = true,
}: {
  mood: MentorMood;
  size?: "sm" | "md" | "lg";
  showMessage?: boolean;
}) {
  const config = MOOD_CONFIG[mood];
  const sizeClasses = {
    sm: "w-10 h-10 text-xl",
    md: "w-14 h-14 text-3xl",
    lg: "w-20 h-20 text-5xl",
  }[size];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mood}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="flex flex-col items-center gap-1"
      >
        <div
          className={`${sizeClasses} ${config.bg} rounded-full flex items-center justify-center border border-border/50`}
        >
          {config.emoji}
        </div>
        {showMessage && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-muted-foreground font-medium"
          >
            {config.message}
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
