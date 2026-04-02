"use client";

import { motion } from "motion/react";
import { CATEGORY_COLORS } from "@/lib/constants";

interface ProjectionQuestionCardProps {
  questionText: string | null;
  categoryLabel: string;
  currentIndex: number;
  maxSituations: number;
}

/**
 * Direction C — Cabine de Projection
 * Card question adaptée au contexte physique :
 * - Fond crème (#F7F3EA) cohérent avec l'interface
 * - Texte 24px minimum (Phase 0 : lu à 3-8m par 24 élèves)
 * - Touch targets 56px (enseignant debout, stress)
 * - Pas de navigation prev/next (focus exclusif sur la question active)
 */
export function ProjectionQuestionCard({
  questionText,
  categoryLabel,
  currentIndex,
  maxSituations,
}: ProjectionQuestionCardProps) {
  if (!questionText) return null;

  const catColor = CATEGORY_COLORS[categoryLabel as keyof typeof CATEGORY_COLORS] || "var(--color-bw-primary)";
  const hasNav = maxSituations > 1;

  return (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-2xl overflow-hidden"
      style={{
        border: "1px solid rgba(255,107,53,0.25)",
        backgroundColor: "#fff",
        boxShadow: "0 0 24px rgba(255,107,53,0.08)",
      }}
    >
      {/* Barre couleur catégorie */}
      <div className="h-1.5" style={{ backgroundColor: catColor }} />

      <div className="p-6">
        {/* Catégorie + compteur */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="inline-flex items-center px-3 py-1 rounded-lg text-[12px] font-bold text-white"
            style={{ backgroundColor: catColor }}
          >
            {categoryLabel}
          </span>
          {hasNav && (
            <span className="text-body-sm font-semibold text-[#4A4A4A] tabular-nums">
              {currentIndex + 1} / {maxSituations}
            </span>
          )}
        </div>

        {/* Texte question — 24px minimum (Phase 0 compliance) */}
        <p className="text-[24px] font-bold text-[#2C2C2C] leading-snug">{questionText}</p>
      </div>
    </motion.div>
  );
}
