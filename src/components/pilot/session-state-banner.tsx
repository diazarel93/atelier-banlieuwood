"use client";

import { motion, AnimatePresence } from "motion/react";

interface SessionStateBannerProps {
  status: string;
  respondedCount: number;
  totalStudents: number;
  voteCount?: number;
  onViewResults?: () => void;
  onTogglePause?: () => void;
  /** Compact inline mode for embedding in the header status bar */
  compact?: boolean;
}

const STATE_CONFIG: Record<
  string,
  { bg: string; border: string; text: string; accent: string; label: string; sub: string }
> = {
  waiting: {
    bg: "#F5F0FF",
    border: "#E8DFFF",
    text: "#6B4DC7",
    accent: "#8B5CF6",
    label: "Pret a lancer",
    sub: "Ouvrez les reponses quand vous etes pret",
  },
  responding: {
    bg: "#EFFAF8",
    border: "#D5EDE8",
    text: "#1B7A6E",
    accent: "#57C4B6",
    label: "Reponses ouvertes",
    sub: "ont repondu",
  },
  voting: {
    bg: "#FFF5EB",
    border: "#F0DFC8",
    text: "#B86E1D",
    accent: "#F5A45B",
    label: "Vote en cours",
    sub: "votes recus",
  },
  paused: {
    bg: "#FFF8E6",
    border: "#F0E4C0",
    text: "#8B6914",
    accent: "#F2C94C",
    label: "En pause",
    sub: "Les eleves voient un ecran de pause",
  },
  done: {
    bg: "#EDFCF2",
    border: "#C6F6D5",
    text: "#16774E",
    accent: "#4CAF50",
    label: "Module termine",
    sub: "Voir les resultats",
  },
};

export function SessionStateBanner({
  status,
  respondedCount,
  totalStudents,
  voteCount = 0,
  onViewResults,
  onTogglePause,
  compact = false,
}: SessionStateBannerProps) {
  const config = STATE_CONFIG[status];
  if (!config) return null;

  // Counter text
  const counterText = (() => {
    if (status === "responding") return `${respondedCount}/${totalStudents}`;
    if (status === "voting") return `${voteCount} vote${voteCount !== 1 ? "s" : ""}`;
    return null;
  })();

  // Sub-text with dynamic data
  const subText = (() => {
    if (status === "responding") return `${respondedCount}/${totalStudents} ${config.sub}`;
    if (status === "voting") return `${voteCount} ${config.sub}`;
    return config.sub;
  })();

  // Progress ring for responding
  const pct = totalStudents > 0 ? (respondedCount / totalStudents) * 100 : 0;
  const showRing = status === "responding" && totalStudents > 0;

  // ── Compact mode: inline dot + label + counter, no background band ──
  if (compact) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-2"
        >
          {/* Pulse dot */}
          <motion.span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: config.accent }}
            animate={status === "responding" || status === "voting" ? { scale: [1, 1.3, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />

          {/* Label */}
          <span className="text-[12px] font-semibold whitespace-nowrap" style={{ color: config.text }}>
            {config.label}
          </span>

          {/* Counter */}
          {counterText && (
            <span className="text-[12px] font-medium tabular-nums" style={{ color: `${config.text}CC` }}>
              {counterText}
            </span>
          )}

          {/* Compact actions */}
          {status === "paused" && onTogglePause && (
            <button
              onClick={onTogglePause}
              className="h-6 px-2 rounded-md text-[11px] font-semibold cursor-pointer transition-colors"
              style={{ background: config.accent, color: "#fff" }}
            >
              Reprendre
            </button>
          )}
          {status === "done" && onViewResults && (
            <button
              onClick={onViewResults}
              className="h-6 px-2 rounded-md text-[11px] font-semibold cursor-pointer transition-colors"
              style={{ background: config.accent, color: "#fff" }}
            >
              Resultats
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Full mode: original banner ──
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex-shrink-0 flex items-center gap-4 px-6 py-2"
        style={{
          background: config.bg,
          borderBottom: `1px solid ${config.border}`,
          borderLeft: `4px solid ${config.accent}`,
        }}
      >
        {/* Icon dot */}
        <motion.span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: config.accent }}
          animate={status === "responding" || status === "voting" ? { scale: [1, 1.3, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />

        {/* Label + sub */}
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-[14px] font-semibold" style={{ color: config.text }}>
            {config.label}
          </span>
          <span className="text-[12px]" style={{ color: `${config.text}99` }}>
            {subText}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Counter hero — responding */}
        {showRing && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <svg className="-rotate-90" width="28" height="28" viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="11" fill="none" stroke={config.border} strokeWidth="2.5" />
              <motion.circle
                cx="14"
                cy="14"
                r="11"
                fill="none"
                stroke={config.accent}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 11}`}
                animate={{ strokeDashoffset: (1 - pct / 100) * 2 * Math.PI * 11 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </svg>
            <span className="text-[18px] font-bold tabular-nums" style={{ color: config.text }}>
              {respondedCount}/{totalStudents}
            </span>
          </div>
        )}

        {/* Counter — voting */}
        {status === "voting" && (
          <span className="text-[16px] font-bold tabular-nums flex-shrink-0" style={{ color: config.text }}>
            {voteCount} votes
          </span>
        )}

        {/* Paused: resume */}
        {status === "paused" && onTogglePause && (
          <button
            onClick={onTogglePause}
            className="h-7 px-3 rounded-[8px] text-[12px] font-semibold cursor-pointer transition-colors"
            style={{ background: config.accent, color: "#fff" }}
          >
            Reprendre
          </button>
        )}

        {/* Done: results */}
        {status === "done" && onViewResults && (
          <button
            onClick={onViewResults}
            className="h-7 px-3 rounded-[8px] text-[12px] font-semibold cursor-pointer transition-colors"
            style={{ background: config.accent, color: "#fff" }}
          >
            Resultats →
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
