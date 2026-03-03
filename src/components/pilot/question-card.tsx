"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { QuestionGuide } from "@/lib/guide-data";

interface QuestionCardProps {
  position: number;
  category: string;
  restitutionLabel: string;
  prompt: string;
  questionGuide: QuestionGuide | undefined;
}

export function QuestionCard({
  position,
  category,
  restitutionLabel,
  prompt,
  questionGuide,
}: QuestionCardProps) {
  const [guideExpanded, setGuideExpanded] = useState(false);
  const color = CATEGORY_COLORS[category] || "#FF6B35";

  return (
    <div className="glass-card overflow-hidden" style={{ borderColor: `${color}20`, background: `linear-gradient(135deg, ${color}08, rgba(26,29,34,0.6) 60%)` }}>
      {/* Color accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}60)` }} />
      {/* Question header */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-bold uppercase px-2.5 py-1 rounded-full"
            style={{ background: `linear-gradient(135deg, ${color}25, ${color}10)`, color, border: `1px solid ${color}30` }}
          >
            {restitutionLabel || category}
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/[0.06] text-bw-text">Q{position}</span>
        </div>
        <p className="text-lg leading-relaxed">{prompt}</p>
      </div>

      {/* Inline guide strip */}
      {questionGuide && (
        <div className="border-t" style={{ borderColor: `${color}15` }}>
          <button
            onClick={() => setGuideExpanded(!guideExpanded)}
            className="w-full px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-center gap-3 text-xs text-bw-muted min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-bold flex-shrink-0 px-1.5 py-0.5 rounded" style={{ color: "#FF6B35", background: "rgba(255,107,53,0.1)" }}>
                Guide
              </span>
              <span className="truncate">
                {questionGuide.whatToExpect.slice(0, 80)}
                {questionGuide.whatToExpect.length > 80 ? "…" : ""}
              </span>
            </div>
            <svg
              width={12}
              height={12}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7D828A"
              strokeWidth={2}
              strokeLinecap="round"
              className={`flex-shrink-0 ml-2 transition-transform ${guideExpanded ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          <AnimatePresence>
            {guideExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-4 space-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-bw-muted mb-0.5">
                      Ce qu&apos;on attend
                    </p>
                    <p className="text-xs text-bw-text leading-relaxed">
                      {questionGuide.whatToExpect}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-bw-muted mb-0.5">
                      Pièges fréquents
                    </p>
                    <p className="text-xs text-bw-amber leading-relaxed">
                      {questionGuide.commonPitfalls}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
