"use client";

import { motion } from "motion/react";

export interface MiniLeaderboardProps {
  entries: { id: string; displayName: string; avatar: string; xp: number }[];
  currentStudentId?: string;
  currentRank?: number;
}

const MEDAL_CONFIG = [
  { emoji: "\u{1F947}", bg: "#D4A843", label: "1er" },
  { emoji: "\u{1F948}", bg: "#C0C0C0", label: "2e" },
  { emoji: "\u{1F949}", bg: "#CD7F32", label: "3e" },
] as const;

export function MiniLeaderboard({ entries, currentStudentId, currentRank }: MiniLeaderboardProps) {
  if (!entries || entries.length < 1) return null;

  const top3 = [...entries]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 3);

  const isInTop3 = currentStudentId && top3.some((e) => e.id === currentStudentId);

  return (
    <div className="w-full max-w-[280px] space-y-1.5">
      <p className="text-xs text-bw-gold tracking-[0.2em] uppercase font-cinema text-center mb-2">
        Podium
      </p>
      {top3.map((entry, i) => {
        const medal = MEDAL_CONFIG[i];
        const isCurrent = currentStudentId === entry.id;

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.35, ease: "easeOut" }}
            className="glass-card rounded-lg h-10 flex items-center gap-2 px-3"
            style={{
              borderColor: isCurrent ? `${medal.bg}60` : undefined,
              boxShadow: isCurrent
                ? `0 0 12px ${medal.bg}40, inset 0 0 8px ${medal.bg}15`
                : undefined,
            }}
          >
            {/* Medal + rank background */}
            <span
              className="w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0"
              style={{ backgroundColor: `${medal.bg}20` }}
            >
              {medal.emoji}
            </span>

            {/* Avatar */}
            <span className="text-base leading-none shrink-0">{entry.avatar}</span>

            {/* Name */}
            <span
              className={`text-sm flex-1 truncate ${
                isCurrent ? "text-bw-heading font-semibold" : "text-bw-muted"
              }`}
            >
              {entry.displayName}
            </span>

            {/* XP */}
            <span className="text-xs font-bold text-bw-gold tabular-nums shrink-0">
              {entry.xp} pts
            </span>
          </motion.div>
        );
      })}

      {/* Show current player's rank if not in top 3 */}
      {!isInTop3 && currentRank && currentRank > 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-1.5 pt-1"
        >
          <span className="text-xs text-bw-muted">···</span>
          <span className="text-xs font-semibold text-bw-heading">Toi : {currentRank}e</span>
        </motion.div>
      )}
    </div>
  );
}
