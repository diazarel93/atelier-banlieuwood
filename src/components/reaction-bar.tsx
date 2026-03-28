"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const EMOJIS = ["👍", "❤️", "😂", "🎯", "💡"] as const;

export interface ReactionCounts {
  [emoji: string]: { count: number; studentIds: string[] };
}

interface ReactionBarProps {
  responseId: string;
  studentId?: string; // undefined = read-only mode (screen)
  sessionId: string;
  counts?: ReactionCounts;
  onReact?: (responseId: string, emoji: string) => void;
  compact?: boolean;
}

export function ReactionBar({ responseId, studentId, sessionId, counts = {}, onReact, compact }: ReactionBarProps) {
  const [pending, setPending] = useState<string | null>(null);
  const [localCounts, setLocalCounts] = useState<ReactionCounts>(counts);

  // Sync when counts change from parent
  const countsKey = JSON.stringify(counts);
  useEffect(() => {
    setLocalCounts(counts);
  }, [countsKey]);

  const hasReacted = useCallback(
    (emoji: string) => (studentId ? localCounts[emoji]?.studentIds?.includes(studentId) : false),
    [localCounts, studentId],
  );

  async function toggleReaction(emoji: string) {
    if (!studentId || pending) return;
    setPending(emoji);

    // Optimistic update
    const alreadyReacted = hasReacted(emoji);
    setLocalCounts((prev) => {
      const current = prev[emoji] || { count: 0, studentIds: [] };
      if (alreadyReacted) {
        return {
          ...prev,
          [emoji]: {
            count: Math.max(0, current.count - 1),
            studentIds: current.studentIds.filter((id) => id !== studentId),
          },
        };
      }
      return {
        ...prev,
        [emoji]: {
          count: current.count + 1,
          studentIds: [...current.studentIds, studentId],
        },
      };
    });

    try {
      await fetch(`/api/sessions/${sessionId}/reactions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ responseId, studentId, emoji }),
      });
      onReact?.(responseId, emoji);
    } catch {
      // Revert optimistic update
      setLocalCounts(counts);
    } finally {
      setPending(null);
    }
  }

  // Read-only mode: just show counts
  if (!studentId) {
    const active = EMOJIS.filter((e) => (localCounts[e]?.count || 0) > 0);
    if (active.length === 0) return null;
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {active.map((emoji) => (
          <span
            key={emoji}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/[0.06] text-xs"
          >
            {emoji}
            <span className="font-mono text-xs text-bw-muted tabular-nums">{localCounts[emoji]?.count}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${compact ? "" : "mt-1"}`}>
      {EMOJIS.map((emoji) => {
        const count = localCounts[emoji]?.count || 0;
        const active = hasReacted(emoji);
        return (
          <motion.button
            key={emoji}
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              toggleReaction(emoji);
            }}
            disabled={!!pending}
            className={`inline-flex items-center gap-0.5 rounded-full transition-all cursor-pointer ${
              compact ? "px-1 py-0.5 text-[12px]" : "px-1.5 py-0.5 text-[13px]"
            } ${
              active
                ? "bg-bw-primary/20 border border-bw-primary/40"
                : "bg-white/[0.04] border border-transparent hover:bg-white/[0.08]"
            }`}
          >
            <span>{emoji}</span>
            <AnimatePresence mode="wait">
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="font-mono text-xs tabular-nums text-bw-muted"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
