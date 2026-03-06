"use client";

import { motion } from "motion/react";

interface SelectionBarProps {
  status: string;
  responsesCount: number;
  totalStudents: number;
  selectedCount: number;
  totalVotes?: number;
  onAction: () => void;
  onQuickVote?: () => void;
  actionDisabled?: boolean;
  isPending?: boolean;
  pulse?: boolean;
}

const CTA_GLOW: Record<string, string> = {
  "#FF6B35": "0 0 20px rgba(255,107,53,0.35), 0 0 40px rgba(255,107,53,0.15)",
  "#8B5CF6": "0 0 20px rgba(139,92,246,0.35), 0 0 40px rgba(139,92,246,0.15)",
  "#4ECDC4": "0 0 20px rgba(78,205,196,0.35), 0 0 40px rgba(78,205,196,0.15)",
};

export function SelectionBar({
  status,
  responsesCount,
  totalStudents,
  selectedCount,
  totalVotes = 0,
  onAction,
  onQuickVote,
  actionDisabled,
  isPending,
  pulse,
}: SelectionBarProps) {
  let leftText = "";
  let ctaLabel = "";
  let ctaColor = "#FF6B35";
  let shortcutKey = "N";

  if (status === "responding") {
    leftText = `${responsesCount}/${totalStudents} rep.`;
    if (selectedCount < 2) {
      ctaLabel = `${selectedCount}/2 min — sélectionner`;
      ctaColor = "#7D828A";
    } else {
      ctaLabel = "LANCER LE VOTE";
    }
  } else if (status === "voting") {
    leftText = `${totalVotes}/${totalStudents} votes`;
    ctaLabel = "VOIR RÉSULTATS";
    ctaColor = "#8B5CF6";
  } else if (status === "reviewing") {
    leftText = "";
    ctaLabel = "QUESTION SUIVANTE";
    ctaColor = "#4ECDC4";
  } else {
    return null;
  }

  const disabled = actionDisabled || isPending || (status === "responding" && selectedCount < 2);
  const showQuickVote = onQuickVote && status === "responding" && selectedCount < 2 && responsesCount >= 2;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 text-sm">
        {leftText && <span className="text-bw-muted font-medium tabular-nums">{leftText}</span>}
        {status === "responding" && selectedCount > 0 && (
          <span className="text-bw-primary font-bold tabular-nums">{selectedCount} sélect.</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {showQuickVote && (
          <motion.button
            onClick={onQuickVote}
            disabled={isPending}
            title="Vote rapide : auto-sélection + lancer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed bg-bw-primary text-white"
            style={{ boxShadow: "0 0 16px rgba(255,107,53,0.3), 0 0 4px rgba(255,107,53,0.2)" }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Vote rapide
          </motion.button>
        )}
        <motion.button
          onClick={onAction}
          disabled={disabled}
          className={`btn-glow px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            pulse && !disabled ? "ring-2 ring-bw-teal/50" : ""
          }`}
          style={{
            backgroundColor: disabled ? "#22252B" : ctaColor,
            color: ctaColor === "#7D828A" || disabled ? "#7D828A" : "white",
            boxShadow: disabled ? undefined : CTA_GLOW[ctaColor],
          }}
          whileTap={disabled ? {} : { scale: 0.95 }}
          whileHover={disabled ? {} : { scale: 1.02 }}
          animate={pulse && !disabled ? { scale: [1, 1.02, 1] } : {}}
          transition={pulse && !disabled ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } : {}}
        >
          {isPending ? "..." : ctaLabel} {!disabled && <span className="opacity-60 ml-1 text-xs">[{shortcutKey}]</span>}
        </motion.button>
      </div>
    </div>
  );
}
