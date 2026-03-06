"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface CompareResponse {
  id: string;
  text: string;
  studentName: string;
  studentAvatar: string;
  is_highlighted: boolean;
}

interface CompareResponsesModalProps {
  open: boolean;
  onClose: () => void;
  responses: CompareResponse[];
  onHighlightBoth: (idA: string, idB: string) => void;
  onClearHighlights: () => void;
}

export function CompareResponsesModal({
  open,
  onClose,
  responses,
  onHighlightBoth,
  onClearHighlights,
}: CompareResponsesModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  const selectedA = responses.find((r) => r.id === selectedIds[0]);
  const selectedB = responses.find((r) => r.id === selectedIds[1]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] max-w-[95vw] max-h-[80vh] glass-card rounded-2xl border border-black/[0.06] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-black/[0.04] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚖️</span>
                <h3 className="text-sm font-semibold">Comparer 2 réponses</h3>
                <span className="text-xs text-bw-muted">{selectedIds.length}/2 sélectionnées</span>
              </div>
              <button onClick={onClose} className="text-bw-muted hover:text-bw-heading text-sm cursor-pointer">✕</button>
            </div>

            {/* Comparison view (when 2 selected) */}
            {selectedA && selectedB && (
              <div className="px-5 py-3 border-b border-black/[0.04] flex-shrink-0">
                <div className="grid grid-cols-2 gap-3">
                  {[selectedA, selectedB].map((r, i) => (
                    <div key={r.id} className="p-3 rounded-xl border border-bw-primary/20" style={{ background: `linear-gradient(135deg, rgba(255,107,53,${0.06 + i * 0.02}), transparent)` }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-sm">{r.studentAvatar}</span>
                        <span className="text-xs font-medium">{r.studentName}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{r.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-2 mt-3">
                  <button
                    onClick={() => { onHighlightBoth(selectedA.id, selectedB.id); onClose(); }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:brightness-110"
                    style={{ backgroundColor: "#F5A45B", color: "white" }}
                  >
                    Projeter les 2 →
                  </button>
                  <button
                    onClick={() => { onClearHighlights(); onClose(); }}
                    className="px-4 py-2 rounded-xl text-xs font-medium cursor-pointer border border-black/[0.04] hover:border-black/10 text-bw-muted hover:text-bw-heading transition-colors"
                  >
                    Tout dé-projeter
                  </button>
                </div>
              </div>
            )}

            {/* Response list */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-bw-muted font-semibold mb-2">
                Cliquez pour sélectionner ({responses.length} réponses)
              </p>
              {responses.map((r) => {
                const isSelected = selectedIds.includes(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => toggleSelect(r.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-bw-primary/40 bg-bw-primary/5"
                        : "border-black/[0.04] hover:border-black/10 hover:bg-black/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{r.studentAvatar}</span>
                      <span className="text-xs font-medium">{r.studentName}</span>
                      {isSelected && <span className="text-xs px-1.5 py-0.5 rounded bg-bw-primary/15 text-bw-primary font-bold">✓</span>}
                      {r.is_highlighted && <span className="text-xs px-1.5 py-0.5 rounded bg-bw-teal/15 text-bw-teal">Projeté</span>}
                    </div>
                    <p className="text-xs text-bw-text leading-relaxed line-clamp-2">{r.text}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
