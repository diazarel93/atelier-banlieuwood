"use client";

import { motion, AnimatePresence } from "motion/react";

interface SessionStateBannerProps {
  status: string;
  respondedCount: number;
  totalStudents: number;
  voteCount?: number;
  onViewResults?: () => void;
  onTogglePause?: () => void;
}

const STATE_CONFIG: Record<string, { bg: string; border: string; text: string; accent: string; label: string }> = {
  waiting: {
    bg: "rgba(139,92,246,0.06)",
    border: "rgba(139,92,246,0.15)",
    text: "#8B5CF6",
    accent: "#8B5CF6",
    label: "Pret a lancer",
  },
  responding: {
    bg: "rgba(78,205,196,0.06)",
    border: "rgba(78,205,196,0.15)",
    text: "#4ECDC4",
    accent: "#4ECDC4",
    label: "Reponses ouvertes",
  },
  voting: {
    bg: "rgba(255,107,53,0.06)",
    border: "rgba(255,107,53,0.15)",
    text: "#FF6B35",
    accent: "#FF6B35",
    label: "Vote en cours",
  },
  paused: {
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.15)",
    text: "#F59E0B",
    accent: "#F59E0B",
    label: "En pause",
  },
  done: {
    bg: "rgba(16,185,129,0.06)",
    border: "rgba(16,185,129,0.15)",
    text: "#10B981",
    accent: "#10B981",
    label: "Termine",
  },
};

export function SessionStateBanner({
  status,
  respondedCount,
  totalStudents,
  voteCount = 0,
  onViewResults,
  onTogglePause,
}: SessionStateBannerProps) {
  const config = STATE_CONFIG[status];
  if (!config) return null;

  // Counter text
  const counterText = (() => {
    if (status === "responding") return `${respondedCount}/${totalStudents}`;
    if (status === "voting") return `${voteCount} vote${voteCount !== 1 ? "s" : ""}`;
    return null;
  })();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex-shrink-0 flex items-center gap-2.5 px-4 py-1.5"
        style={{
          background: config.bg,
          borderBottom: `1px solid ${config.border}`,
          borderLeft: `3px solid ${config.accent}`,
        }}
      >
        {/* Dot */}
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: config.accent }} />

        {/* Label */}
        <span className="cinema-title text-sm" style={{ color: config.text }}>{config.label}</span>

        {/* Counter */}
        {counterText && (
          <span className="text-xs font-bold tabular-nums" style={{ color: config.text }}>{counterText}</span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Paused: resume */}
        {status === "paused" && onTogglePause && (
          <button onClick={onTogglePause}
            className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors border"
            style={{ borderColor: `${config.accent}40`, color: config.text }}>
            Reprendre
          </button>
        )}

        {/* Done: results */}
        {status === "done" && onViewResults && (
          <button onClick={onViewResults}
            className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors border"
            style={{ borderColor: `${config.accent}40`, color: config.text }}>
            Resultats →
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
