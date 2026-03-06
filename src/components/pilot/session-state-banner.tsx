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

const STATE_CONFIG: Record<string, { bg: string; border: string; text: string; accent: string; icon: React.ReactNode; label: string; subtext?: string }> = {
  waiting: {
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.20)",
    text: "#8B5CF6",
    accent: "#8B5CF6",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    label: "Pret a lancer",
    subtext: "Ouvrez les reponses quand vous etes pret",
  },
  responding: {
    bg: "rgba(78,205,196,0.08)",
    border: "rgba(78,205,196,0.20)",
    text: "#4ECDC4",
    accent: "#4ECDC4",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    label: "Reponses ouvertes",
  },
  voting: {
    bg: "rgba(255,107,53,0.08)",
    border: "rgba(255,107,53,0.20)",
    text: "#FF6B35",
    accent: "#FF6B35",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round">
        <path d="M9 12l2 2 4-4" /><rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
    label: "Vote en cours",
  },
  paused: {
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.20)",
    text: "#F59E0B",
    accent: "#F59E0B",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round">
        <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
      </svg>
    ),
    label: "En pause",
    subtext: "Les eleves voient un ecran de pause",
  },
  done: {
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.20)",
    text: "#10B981",
    accent: "#10B981",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5L20 7" />
      </svg>
    ),
    label: "Module termine",
  },
};

function ProgressRing({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? value / max : 0;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  // Color coding: red <50%, amber 50-80%, green 80%+
  let ringColor = color;
  if (pct < 0.5) ringColor = "#EF4444";
  else if (pct < 0.8) ringColor = "#F59E0B";
  else ringColor = "#10B981";

  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
      <circle cx="20" cy="20" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
      <motion.circle
        cx="20" cy="20" r={radius} fill="none"
        stroke={ringColor}
        strokeWidth="3" strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </svg>
  );
}

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

  const showCounter = status === "responding" || status === "voting";
  const counterValue = status === "voting" ? voteCount : respondedCount;
  const counterMax = totalStudents;

  // Dynamic subtext
  const subtext = (() => {
    if (config.subtext) return config.subtext;
    if (status === "responding") return `${respondedCount}/${totalStudents} ont repondu`;
    if (status === "voting") return `${voteCount} vote${voteCount > 1 ? "s" : ""} recu${voteCount > 1 ? "s" : ""}`;
    return null;
  })();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25 }}
        className="flex-shrink-0"
        style={{
          background: config.bg,
          borderBottom: `1px solid ${config.border}`,
          borderLeft: `4px solid ${config.accent}`,
        }}
      >
        <div className="flex items-center gap-3 px-4 py-2.5">
          {/* Icon */}
          <div className="flex-shrink-0">{config.icon}</div>

          {/* Label + subtext */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: config.text }}>{config.label}</p>
            {subtext && (
              <p className="text-xs mt-0.5" style={{ color: `${config.text}99` }}>{subtext}</p>
            )}
          </div>

          {/* Hero counter with progress ring */}
          {showCounter && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative">
                <ProgressRing value={counterValue} max={counterMax} color={config.accent} />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums" style={{ color: config.text }}>
                  {Math.round((counterValue / (counterMax || 1)) * 100)}%
                </span>
              </div>
              <span className="text-2xl font-bold tabular-nums" style={{ color: config.text }}>
                {counterValue}/{counterMax}
              </span>
            </div>
          )}

          {/* Paused: resume button */}
          {status === "paused" && onTogglePause && (
            <button
              onClick={onTogglePause}
              className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors bg-bw-amber/15 border border-bw-amber/30 text-bw-amber hover:bg-bw-amber/25"
            >
              Reprendre
            </button>
          )}

          {/* Done: view results link */}
          {status === "done" && onViewResults && (
            <button
              onClick={onViewResults}
              className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors bg-bw-green/15 border border-bw-green/30 text-bw-green hover:bg-bw-green/25"
            >
              Voir les resultats →
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
