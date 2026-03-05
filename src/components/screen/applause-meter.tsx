"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ApplauseEntry {
  responseId: string;
  text: string;
  studentName: string;
  avatar: string;
  clapCount: number;
}

interface ApplauseMeterProps {
  entries: ApplauseEntry[];
  accentColor?: string;
  /** Show top N only (0 = show all) */
  topN?: number;
}

export function ApplauseMeter({ entries, accentColor = "#FF6B35", topN = 5 }: ApplauseMeterProps) {
  const sorted = useMemo(() => {
    const s = [...entries].sort((a, b) => b.clapCount - a.clapCount);
    return topN > 0 ? s.slice(0, topN) : s;
  }, [entries, topN]);

  const maxClaps = sorted[0]?.clapCount || 1;

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }} className="text-bw-muted text-lg">
          En attente des applaudissements...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-6 space-y-4">
      <div className="flex items-center justify-center gap-2 mb-2">
        <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} className="text-2xl">
          👏
        </motion.span>
        <span className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: accentColor }}>
          Applaudimètre
        </span>
        <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.6 }} className="text-2xl">
          👏
        </motion.span>
      </div>

      <AnimatePresence mode="popLayout">
        {sorted.map((entry, i) => {
          const pct = Math.max(5, (entry.clapCount / maxClaps) * 100);
          const isTop = i === 0 && entry.clapCount > 0;
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;

          return (
            <motion.div
              key={entry.responseId}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 25 }}
              className="relative"
            >
              {/* Student info row */}
              <div className="flex items-center gap-2 mb-1">
                {medal && <span className="text-lg">{medal}</span>}
                <span className="text-base">{entry.avatar}</span>
                <span className="text-sm font-medium text-bw-heading truncate max-w-[200px]">{entry.studentName}</span>
                <span className="ml-auto text-xs text-bw-muted tabular-nums">{entry.clapCount} 👏</span>
              </div>

              {/* Response text preview */}
              <p className="text-[11px] text-bw-muted truncate mb-1.5 pl-1">{entry.text}</p>

              {/* Bar */}
              <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                  className="h-full rounded-full relative"
                  style={{
                    background: isTop
                      ? `linear-gradient(90deg, ${accentColor}, ${accentColor}CC)`
                      : `linear-gradient(90deg, ${accentColor}60, ${accentColor}30)`,
                  }}
                >
                  {/* Shimmer on top entry */}
                  {isTop && (
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute inset-0 w-1/3"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
                    />
                  )}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/**
 * Compact applause button for student play page.
 * Students tap to clap for a response during review phase.
 */
export function ClapButton({
  onClap,
  clapCount = 0,
  disabled,
}: {
  onClap: () => void;
  clapCount?: number;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={onClap}
      disabled={disabled}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-bw-amber/10 border border-bw-amber/20 text-bw-amber cursor-pointer transition-all hover:bg-bw-amber/20 disabled:opacity-40"
    >
      <motion.span
        key={clapCount}
        initial={{ scale: 1.5, rotate: 10 }}
        animate={{ scale: 1, rotate: 0 }}
        className="text-lg"
      >
        👏
      </motion.span>
      {clapCount > 0 && (
        <span className="text-sm font-bold tabular-nums">{clapCount}</span>
      )}
    </motion.button>
  );
}
