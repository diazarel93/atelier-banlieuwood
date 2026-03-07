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
  let ctaColor = "#2C2C2C";
  const shortcutKey = "N";

  if (status === "responding") {
    leftText = `${responsesCount}/${totalStudents} rep.`;
    if (selectedCount < 2) {
      ctaLabel = `${selectedCount}/2 min — selectionner`;
      ctaColor = "#B0A99E";
    } else {
      ctaLabel = "LANCER LE VOTE";
      ctaColor = "#2C2C2C";
    }
  } else if (status === "voting") {
    leftText = `${totalVotes}/${totalStudents} votes`;
    ctaLabel = "VOIR RESULTATS";
    ctaColor = "#2C2C2C";
  } else if (status === "reviewing") {
    leftText = "";
    ctaLabel = "QUESTION SUIVANTE";
    ctaColor = "#2C2C2C";
  } else {
    return null;
  }

  const disabled = actionDisabled || isPending || (status === "responding" && selectedCount < 2);
  const showQuickVote = onQuickVote && status === "responding" && selectedCount < 2 && responsesCount >= 2;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 text-[13px]">
        {leftText && <span className="text-[#7A7A7A] font-medium tabular-nums">{leftText}</span>}
        {status === "responding" && selectedCount > 0 && (
          <span className="text-[#6B8CFF] font-bold tabular-nums">{selectedCount} select.</span>
        )}
      </div>
      <div className="flex items-center gap-2.5">
        {showQuickVote && (
          <motion.button
            onClick={onQuickVote}
            disabled={isPending}
            title="Vote rapide : auto-selection + lancer"
            className="flex items-center gap-1.5 h-11 px-4 rounded-[12px] text-[13px] font-bold cursor-pointer transition-all hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed text-white"
            style={{ background: "#F5A45B", boxShadow: "0 4px 12px rgba(245,164,91,0.25)" }}
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
          className={`h-11 px-5 rounded-[12px] text-[14px] font-bold cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            pulse && !disabled ? "ring-2 ring-[#57C4B6]/40" : ""
          }`}
          style={{
            backgroundColor: disabled ? "#E8DFD2" : ctaColor,
            color: disabled ? "#B0A99E" : "white",
            boxShadow: disabled ? undefined : "0 4px 12px rgba(0,0,0,0.15)",
          }}
          whileTap={disabled ? {} : { scale: 0.95 }}
          whileHover={disabled ? {} : { scale: 1.02 }}
          animate={pulse && !disabled ? { scale: [1, 1.02, 1] } : {}}
          transition={pulse && !disabled ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } : {}}
        >
          {isPending ? "..." : ctaLabel} {!disabled && <kbd className="inline-flex items-center justify-center w-5 h-5 ml-1.5 rounded bg-white/[0.15] text-[10px] font-mono">{shortcutKey}</kbd>}
        </motion.button>
      </div>
    </div>
  );
}
