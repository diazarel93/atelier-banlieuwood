"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { type NextAction } from "@/lib/cockpit-next-action";
import { FloatingNextAction } from "@/components/pilot/floating-next-action";

interface FocusFooterProps {
  // Status
  sessionStatus: string;
  isStandardQA: boolean;

  // Response counts
  respondedCount: number;
  totalStudents: number;
  voteOptionCount: number;
  totalVotes?: number;
  allResponded: boolean;

  // Next action
  nextAction: NextAction | null;
  onNextAction: () => void;
  isPending: boolean;

  // Standard QA selection bar
  onSelectionBarAction: () => void;
  onQuickVote: () => void;

  // Plus menu
  onOpenPlus: () => void;

  // Projeter (broadcast highlight)
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

  // Don't show footer when session is done
  if (sessionStatus === "done") return null;

  // Determine CTA
  let ctaLabel = "";
  let ctaColor = "#2C2C2C";
  let ctaAction = onNextAction;
  let ctaDisabled = false;
  let showCountChip = false;
  let countChipText = "";
  let showQuickVote = false;

  if (isStandardQA && sessionStatus === "responding") {
    // Standard QA responding: show selection bar compact
    showCountChip = true;
    countChipText = `${respondedCount}/${totalStudents}`;
    if (voteOptionCount < 2) {
      ctaLabel = `${voteOptionCount}/2 min — sélectionner`;
      ctaColor = "#B0A99E";
      ctaDisabled = true;
      ctaAction = onSelectionBarAction;
      showQuickVote = respondedCount >= 2;
    } else {
      ctaLabel = "LANCER LE VOTE";
      ctaAction = onSelectionBarAction;
    }
  } else if (isStandardQA && sessionStatus === "voting") {
    showCountChip = true;
    countChipText = `${totalVotes}/${totalStudents} votes`;
    ctaLabel = "VOIR RÉSULTATS";
    ctaAction = onSelectionBarAction;
    ctaDisabled = totalVotes === 0;
  } else if (nextAction && nextAction.action) {
    // Module / non-QA: use nextAction
    ctaLabel = nextAction.label;
    ctaColor = nextAction.color || "#2C2C2C";
    ctaDisabled = !!nextAction.disabled;
    showCountChip = sessionStatus === "responding";
    countChipText = `${respondedCount}/${totalStudents}`;
  } else {
    // No action available — minimal footer
    if (sessionStatus === "responding") {
      showCountChip = true;
      countChipText = `${respondedCount}/${totalStudents}`;
    }
  }

  return (
    <>
      {/* Footer bar */}
      <div
        ref={footerRef}
        className="shrink-0 border-t border-gray-100 bg-white"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
      >
        <div className="flex items-center gap-2.5 px-4 py-3 max-w-2xl mx-auto">
          {/* Count chip */}
          {showCountChip && (
            <span className="shrink-0 px-3 py-1.5 rounded-full bg-gray-100 text-[13px] font-bold text-gray-700 tabular-nums">
              {countChipText}
            </span>
          )}

          {/* Quick vote button (compact) */}
          {showQuickVote && (
            <motion.button
              onClick={onQuickVote}
              className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-[12px] font-bold text-white cursor-pointer"
              style={{ background: "#F5A45B" }}
              whileTap={{ scale: 0.95 }}
              title="Vote rapide"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Rapide
            </motion.button>
          )}

          {/* CTA button (full width) */}
          {ctaLabel && (
            <motion.button
              onClick={ctaAction}
              disabled={ctaDisabled || isPending}
              className={`flex-1 h-12 rounded-2xl text-[14px] font-bold cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                allResponded && !ctaDisabled ? "ring-2 ring-emerald-300/50" : ""
              }`}
              style={{
                backgroundColor: ctaDisabled ? "#E8DFD2" : ctaColor,
                color: ctaDisabled ? "#B0A99E" : "white",
                boxShadow: ctaDisabled ? undefined : "0 4px 16px rgba(0,0,0,0.12)",
              }}
              whileTap={ctaDisabled ? {} : { scale: 0.97 }}
              animate={allResponded && !ctaDisabled ? { scale: [1, 1.01, 1] } : {}}
              transition={allResponded && !ctaDisabled ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } : {}}
            >
              {isPending ? "..." : ctaLabel}
              {!ctaDisabled && nextAction?.shortcut && (
                <kbd className="inline-flex items-center justify-center w-5 h-5 ml-2 rounded bg-white/[0.15] text-[10px] font-mono">
                  {nextAction.shortcut}
                </kbd>
              )}
            </motion.button>
          )}

          {/* Projeter button */}
          <button
            onClick={onProjectResponses}
            className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            title="Projeter"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </button>

          {/* Plus button */}
          <button
            onClick={onOpenPlus}
            className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            title="Plus d'actions"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Floating next action (appears when footer scrolls out) */}
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
