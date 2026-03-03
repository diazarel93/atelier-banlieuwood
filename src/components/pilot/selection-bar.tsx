"use client";

import { motion } from "motion/react";

interface SelectionBarProps {
  status: string;
  responsesCount: number;
  totalStudents: number;
  selectedCount: number;
  totalVotes?: number;
  onAction: () => void;
  actionDisabled?: boolean;
  isPending?: boolean;
}

export function SelectionBar({
  status,
  responsesCount,
  totalStudents,
  selectedCount,
  totalVotes = 0,
  onAction,
  actionDisabled,
  isPending,
}: SelectionBarProps) {
  let leftText = "";
  let ctaLabel = "";
  let ctaColor = "#FF6B35";

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

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky bottom-0 z-10 bg-bw-surface/95 backdrop-blur-sm border-t border-white/10 px-4 py-3 -mx-4 mt-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm">
          {leftText && <span className="text-bw-muted">{leftText}</span>}
          {status === "responding" && selectedCount > 0 && (
            <span className="text-bw-primary font-medium">{selectedCount} sélect.</span>
          )}
        </div>
        <button
          onClick={onAction}
          disabled={disabled}
          className="btn-glow px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: disabled ? "#22252B" : ctaColor,
            color: ctaColor === "#7D828A" || disabled ? "#7D828A" : "white",
          }}
        >
          {isPending ? "..." : ctaLabel} {!disabled && status !== "reviewing" && "→"}
        </button>
      </div>
    </motion.div>
  );
}
