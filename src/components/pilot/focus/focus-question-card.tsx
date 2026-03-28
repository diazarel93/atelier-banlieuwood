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
      className={`rounded-2xl bg-white border p-5 shadow-sm ${
        isPreviewing ? "border-amber-300 bg-amber-50/30" : "border-gray-100"
      }`}
    >
      {/* Category badge + nav */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white"
          style={{ backgroundColor: catColor }}
        >
          {categoryLabel}
        </span>

        {hasNav && (
          <div className="flex items-center gap-1.5 relative" ref={listRef}>
            <button
              onClick={onPrev}
              disabled={currentIndex <= 0}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
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
                hasQuestionList ? "text-gray-500 hover:bg-gray-100 cursor-pointer" : "text-gray-400 cursor-default"
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
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
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
                  className="absolute right-0 top-full mt-2 w-[300px] sm:w-[360px] max-h-[320px] overflow-y-auto bg-white rounded-xl border border-gray-200 shadow-lg z-30"
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
                            isCurrent ? "bg-orange-50 border border-orange-200" : "hover:bg-gray-50"
                          }`}
                        >
                          {/* Index circle */}
                          <span
                            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5 ${
                              isLive
                                ? "bg-orange-500 text-white"
                                : isPast
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-gray-100 text-gray-500"
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
                                isCurrent ? "font-bold text-gray-900" : "font-medium text-gray-700"
                              }`}
                            >
                              {sit.prompt}
                            </p>
                            {sit.category && (
                              <span className="text-[10px] text-gray-400 uppercase tracking-wider">
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
      <p className="text-[20px] sm:text-[22px] font-bold text-gray-900 leading-snug">{questionText}</p>
    </motion.div>
  );
}
