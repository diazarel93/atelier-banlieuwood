"use client";

import { motion } from "motion/react";

interface SessionProgressBarProps {
  currentIndex: number;
  total: number;
  /** Status per question: "done" | "current" | "upcoming" */
  getStatus?: (index: number) => "done" | "current" | "upcoming";
}

export function SessionProgressBar({ currentIndex, total, getStatus }: SessionProgressBarProps) {
  if (total <= 1) return null;

  const status = (i: number) => {
    if (getStatus) return getStatus(i);
    if (i < currentIndex) return "done";
    if (i === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="flex items-center gap-1.5 px-4 py-1.5">
      {Array.from({ length: total }, (_, i) => {
        const s = status(i);
        return (
          <motion.div
            key={i}
            className={`h-1.5 rounded-full transition-colors duration-300 ${
              s === "done" ? "bg-bw-teal" : s === "current" ? "bg-bw-primary" : "bg-black/[0.08]"
            }`}
            style={{ flex: 1 }}
            initial={false}
            animate={s === "current" ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
            transition={s === "current" ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } : { duration: 0.3 }}
          />
        );
      })}
      <span className="text-[10px] text-bw-muted tabular-nums ml-1.5">
        {currentIndex + 1}/{total}
      </span>
    </div>
  );
}
