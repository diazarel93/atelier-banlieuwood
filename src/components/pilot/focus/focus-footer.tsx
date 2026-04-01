"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { type NextAction } from "@/lib/cockpit-next-action";
import { FloatingNextAction } from "@/components/pilot/floating-next-action";

interface FocusFooterProps {
  sessionStatus: string;
  isStandardQA: boolean;
  respondedCount: number;
  totalStudents: number;
  voteOptionCount: number;
  totalVotes?: number;
  allResponded: boolean;
  nextAction: NextAction | null;
  onNextAction: () => void;
  isPending: boolean;
  onSelectionBarAction: () => void;
  onQuickVote: () => void;
  onOpenPlus: () => void;
  onProjectResponses: () => void;
}

export function FocusFooter({
  sessionStatus,
  isStandardQA,
  respondedCount,
  totalStudents,
  voteOptionCount,
  totalVotes = 0,
  allResponded,
  nextAction,
  onNextAction,
  isPending,
  onSelectionBarAction,
  onQuickVote,
  onOpenPlus,
  onProjectResponses,
}: FocusFooterProps) {
  const footerRef = useRef<HTMLDivElement | null>(null);

  if (sessionStatus === "done") return null;

  // CTA logic
  let ctaLabel = "";
  let ctaGradient = "from-bw-cockpit-surface to-bw-cockpit-canvas";
  let ctaAction = onNextAction;
  let ctaDisabled = false;
  let showCountChip = false;
  let countChipText = "";
  let countChipColor = "bg-bw-cockpit-canvas text-bw-cockpit-muted border border-[var(--color-bw-cockpit-border)]";
  let showQuickVote = false;

  if (isStandardQA && sessionStatus === "responding") {
    showCountChip = true;
    countChipText = `${respondedCount}/${totalStudents}`;
    countChipColor = allResponded
      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
      : "bg-bw-cockpit-canvas text-bw-cockpit-muted border border-[var(--color-bw-cockpit-border)]";
    if (voteOptionCount < 2) {
      ctaLabel = `${voteOptionCount}/2 min — selectionner`;
      ctaGradient = "from-bw-cockpit-surface to-bw-cockpit-canvas";
      ctaDisabled = true;
      ctaAction = onSelectionBarAction;
      showQuickVote = respondedCount >= 2;
    } else {
      ctaLabel = "LANCER LE VOTE";
      ctaGradient = "from-orange-500 to-orange-600";
      ctaAction = onSelectionBarAction;
    }
  } else if (isStandardQA && sessionStatus === "voting") {
    showCountChip = true;
    countChipText = `${totalVotes}/${totalStudents} votes`;
    countChipColor = "bg-orange-500/10 text-orange-400 border border-orange-500/30";
    ctaLabel = "VOIR RESULTATS";
    ctaGradient = "from-purple-500 to-purple-600";
    ctaAction = onSelectionBarAction;
    ctaDisabled = totalVotes === 0;
  } else if (isStandardQA && sessionStatus === "reviewing") {
    ctaLabel = nextAction?.label || "SUIVANT";
    ctaGradient = "from-emerald-500 to-emerald-600";
    ctaAction = onSelectionBarAction;
  } else if (nextAction?.action) {
    ctaLabel = nextAction.label;
    ctaGradient = "from-bw-cockpit-surface to-bw-cockpit-canvas";
    ctaDisabled = !!nextAction.disabled;
    showCountChip = sessionStatus === "responding";
    countChipText = `${respondedCount}/${totalStudents}`;
  } else if (sessionStatus === "responding") {
    showCountChip = true;
    countChipText = `${respondedCount}/${totalStudents}`;
  }

  return (
    <>
      <div
        ref={footerRef}
        className="shrink-0 border-t border-[var(--color-bw-cockpit-border)] bg-bw-cockpit-canvas/90 backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 max-w-2xl mx-auto">
          {/* Count chip */}
          {showCountChip && (
            <span className={`shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-bold tabular-nums ${countChipColor}`}>
              {countChipText}
            </span>
          )}

          {/* Quick vote */}
          {showQuickVote && (
            <motion.button
              onClick={onQuickVote}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-body-xs font-bold text-white cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm"
              whileTap={{ scale: 0.95 }}
              title="Vote rapide (top 2)"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Rapide
            </motion.button>
          )}

          {/* CTA button */}
          {ctaLabel && (
            <motion.button
              onClick={ctaAction}
              disabled={ctaDisabled || isPending}
              className={`flex-1 h-11 rounded-xl text-body-sm font-bold tracking-wide cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white shadow-md bg-gradient-to-r ${ctaGradient} ${
                allResponded && !ctaDisabled ? "ring-2 ring-emerald-400/40" : ""
              }`}
              whileTap={ctaDisabled ? {} : { scale: 0.97 }}
              animate={allResponded && !ctaDisabled ? { scale: [1, 1.01, 1] } : {}}
              transition={allResponded && !ctaDisabled ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } : {}}
            >
              {isPending ? "..." : ctaLabel}
              {!ctaDisabled && nextAction?.shortcut && (
                <kbd className="inline-flex items-center justify-center w-5 h-5 ml-2 rounded bg-white/20 text-[9px] font-mono">
                  {nextAction.shortcut}
                </kbd>
              )}
            </motion.button>
          )}

          {/* Project button */}
          <button
            onClick={onProjectResponses}
            aria-label="Projeter les réponses"
            className="shrink-0 flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl bg-bw-cockpit-canvas hover:bg-bw-cockpit-surface border border-[var(--color-bw-cockpit-border)] transition-colors cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </button>

          {/* Plus menu */}
          <button
            onClick={onOpenPlus}
            aria-label="Plus d'actions"
            className="shrink-0 flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl bg-bw-cockpit-canvas hover:bg-bw-cockpit-surface border border-[var(--color-bw-cockpit-border)] transition-colors cursor-pointer"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </div>

      <FloatingNextAction
        nextAction={nextAction}
        onExecute={onNextAction}
        isPending={isPending}
        allResponded={allResponded}
        footerRef={footerRef}
      />
    </>
  );
}
