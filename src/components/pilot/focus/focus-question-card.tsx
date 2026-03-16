"use client";

import { motion } from "motion/react";
import { CATEGORY_COLORS } from "@/lib/constants";

interface FocusQuestionCardProps {
  questionText: string | null;
  categoryLabel: string;
  currentIndex: number;
  maxSituations: number;
  isPreviewing: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}

export function FocusQuestionCard({
  questionText,
  categoryLabel,
  currentIndex,
  maxSituations,
  isPreviewing,
  onPrev,
  onNext,
}: FocusQuestionCardProps) {
  if (!questionText) return null;

  const catColor = CATEGORY_COLORS[categoryLabel as keyof typeof CATEGORY_COLORS] || "#6B7280";
  const hasNav = maxSituations > 1;

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
          <div className="flex items-center gap-1.5">
            <button
              onClick={onPrev}
              disabled={currentIndex <= 0}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <span className="text-[12px] font-bold text-gray-400 tabular-nums min-w-[32px] text-center">
              {currentIndex + 1}/{maxSituations}
            </span>
            <button
              onClick={onNext}
              disabled={currentIndex >= maxSituations - 1}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Preview badge */}
      {isPreviewing && (
        <span className="inline-flex items-center gap-1 mb-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Aperçu
        </span>
      )}

      {/* Question text */}
      <p className="text-[20px] sm:text-[22px] font-bold text-gray-900 leading-snug">
        {questionText}
      </p>
    </motion.div>
  );
}
