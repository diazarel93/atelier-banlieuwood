"use client";

import { motion, AnimatePresence } from "motion/react";

interface BulkResponseToolbarProps {
  selectedCount: number;
  totalCount: number;
  onHideUnselected: () => void;
  onAiEvaluate: () => void;
  onDeselectAll: () => void;
  isEvaluating?: boolean;
}

/**
 * Floating toolbar that appears when ≥2 responses are selected.
 * Provides bulk actions: hide non-selected, AI evaluate, clear selection.
 */
export function BulkResponseToolbar({
  selectedCount,
  totalCount,
  onHideUnselected,
  onAiEvaluate,
  onDeselectAll,
  isEvaluating = false,
}: BulkResponseToolbarProps) {
  return (
    <AnimatePresence>
      {selectedCount >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="sticky bottom-4 z-10 mx-auto w-fit flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-bw-heading/95 backdrop-blur-sm text-white shadow-bw-lg"
        >
          <span className="text-xs font-medium tabular-nums">
            {selectedCount}/{totalCount} sélectionnée{selectedCount > 1 ? "s" : ""}
          </span>

          <div className="w-px h-4 bg-white/20" />

          <button
            onClick={onHideUnselected}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            Masquer non-sélectionnées
          </button>

          <button
            onClick={onAiEvaluate}
            disabled={isEvaluating}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-bw-teal/80 hover:bg-bw-teal transition-colors cursor-pointer disabled:opacity-50"
          >
            {isEvaluating ? "Évaluation..." : "Évaluer par IA"}
          </button>

          <button
            onClick={onDeselectAll}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            Tout décocher
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
