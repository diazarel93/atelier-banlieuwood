"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CATEGORY_COLORS } from "@/lib/constants";

interface SituationPreview {
  position: number;
  category: string;
  restitutionLabel: string;
  prompt: string;
}

interface FocusQuestionCardProps {
  questionText: string | null;
  categoryLabel: string;
  currentIndex: number;
  maxSituations: number;
  isPreviewing: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  allSituations?: SituationPreview[];
  liveIndex?: number;
  onGoToSituation?: (index: number) => void;
}

export function FocusQuestionCard({
  questionText,
  categoryLabel,
  currentIndex,
  maxSituations,
  isPreviewing,
  onPrev,
  onNext,
  allSituations,
  liveIndex,
  onGoToSituation,
}: FocusQuestionCardProps) {
  const [showList, setShowList] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!showList) return;
    function handleClick(e: MouseEvent) {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setShowList(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showList]);

  if (!questionText) return null;

  const catColor = CATEGORY_COLORS[categoryLabel as keyof typeof CATEGORY_COLORS] || "#6B7280";
  const hasNav = maxSituations > 1;
  const hasQuestionList = allSituations && allSituations.length > 1;
  const actualLiveIndex = liveIndex ?? currentIndex;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-l-4 border p-5 shadow-lg ${
        isPreviewing
          ? "border-amber-400 bg-amber-900/20"
          : "bg-bw-cockpit-canvas border-[var(--color-bw-cockpit-border)]"
      }`}
      style={{ borderLeftColor: isPreviewing ? undefined : catColor }}
    >
      {/* Top color accent bar */}
      <div className="h-1 -mx-5 -mt-5 mb-4 rounded-t-2xl" style={{ backgroundColor: catColor + "22" }} />

      {/* Category badge + nav */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-bold text-white shadow-sm"
            style={{ backgroundColor: catColor }}
          >
            {categoryLabel}
          </span>
          {hasNav && (
            <span className="text-[11px] font-semibold text-bw-cockpit-muted tabular-nums">
              Q{currentIndex + 1}/{maxSituations}
            </span>
          )}
        </div>

        {hasNav && (
          <div className="flex items-center gap-1.5 relative" ref={listRef}>
            <button
              onClick={onPrev}
              disabled={currentIndex <= 0}
              className="w-11 h-11 rounded-full bg-bw-cockpit-surface hover:bg-bw-cockpit-elevated disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
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
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Tappable question counter — opens list */}
            <button
              onClick={() => hasQuestionList && setShowList(!showList)}
              className={`text-[12px] font-bold tabular-nums min-w-[32px] text-center rounded-full px-2 py-0.5 transition-colors ${
                hasQuestionList
                  ? "text-bw-cockpit-muted hover:bg-bw-cockpit-surface cursor-pointer"
                  : "text-bw-cockpit-muted/60 cursor-default"
              }`}
              title={hasQuestionList ? "Voir toutes les questions" : undefined}
            >
              {currentIndex + 1}/{maxSituations}
              {hasQuestionList && (
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className={`inline-block ml-0.5 transition-transform ${showList ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              )}
            </button>

            <button
              onClick={onNext}
              disabled={currentIndex >= maxSituations - 1}
              className="w-11 h-11 rounded-full bg-bw-cockpit-surface hover:bg-bw-cockpit-elevated disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
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
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {/* Question list dropdown */}
            <AnimatePresence>
              {showList && hasQuestionList && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-[300px] sm:w-[360px] max-h-[320px] overflow-y-auto bg-bw-cockpit-canvas rounded-xl border border-[var(--color-bw-cockpit-border)] shadow-lg z-30"
                >
                  <div className="p-2 space-y-0.5">
                    {allSituations!.map((sit, i) => {
                      const isCurrent = i === currentIndex;
                      const isLive = i === actualLiveIndex;
                      const isPast = i < actualLiveIndex;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (onGoToSituation) onGoToSituation(i);
                            setShowList(false);
                          }}
                          className={`w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                            isCurrent ? "bg-orange-900/20 border border-orange-500/30" : "hover:bg-bw-cockpit-surface"
                          }`}
                        >
                          {/* Index circle */}
                          <span
                            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5 ${
                              isLive
                                ? "bg-orange-500 text-white"
                                : isPast
                                  ? "bg-emerald-900/30 text-emerald-400"
                                  : "bg-bw-cockpit-surface text-bw-cockpit-muted"
                            }`}
                          >
                            {isPast ? (
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                              >
                                <path d="M5 12l5 5L20 7" />
                              </svg>
                            ) : (
                              i + 1
                            )}
                          </span>

                          {/* Question text */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-[13px] leading-snug line-clamp-2 ${
                                isCurrent ? "font-bold text-[#f0f0f8]" : "font-medium text-[#c4b5fd]"
                              }`}
                            >
                              {sit.prompt}
                            </p>
                            {sit.category && (
                              <span className="text-[11px] text-bw-cockpit-muted uppercase tracking-wider">
                                {sit.restitutionLabel || sit.category}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Preview badge */}
      {isPreviewing && (
        <span className="inline-flex items-center gap-1 mb-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Aperçu
        </span>
      )}

      {/* Question text */}
      <p className="text-[18px] sm:text-[22px] font-bold text-[#f0f0f8] leading-snug mt-1">{questionText}</p>
    </motion.div>
  );
}
