"use client";

// ═══════════════════════════════════════════════════════════════
// VOTE SELECTION PANEL (F3) — intervenant choisit 2–4 réponses
// avant d'ouvrir le vote aux élèves
// ═══════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from "motion/react";
import { useCockpitActions } from "@/components/pilot/cockpit-context";
import type { Response } from "@/hooks/use-pilot-session";

const MIN_SELECTIONS = 2;
const MAX_SELECTIONS = 4;

interface VoteSelectionPanelProps {
  responses: Response[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function VoteSelectionPanel({ responses, onConfirm, onCancel }: VoteSelectionPanelProps) {
  const { toggleVoteOption } = useCockpitActions();

  const selected = responses.filter((r) => r.is_vote_option);
  const selectedCount = selected.length;
  const canConfirm = selectedCount >= MIN_SELECTIONS;

  function handleTap(r: Response) {
    if (!r.is_vote_option && selectedCount >= MAX_SELECTIONS) return;
    toggleVoteOption.mutate({ responseId: r.id, is_vote_option: !r.is_vote_option });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="rounded-2xl border-2 border-bw-violet-border bg-[#161633] p-5 shadow-[0_0_20px_rgba(139,92,246,0.08)] space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-bold text-[#f0f0f8]">Sélection pour le vote</h3>
          <p className="text-[11px] text-[#64748b] mt-0.5">Choisis {MIN_SELECTIONS}–{MAX_SELECTIONS} réponses</p>
        </div>
        <span
          className={`text-[13px] font-bold px-3 py-1 rounded-lg border transition-colors ${
            canConfirm
              ? "bg-bw-violet/10 text-bw-violet border-bw-violet/30"
              : "bg-[#1a1a35] text-[#64748b] border-[#2a2a50]"
          }`}
        >
          {selectedCount}/{MAX_SELECTIONS}
        </span>
      </div>

      {/* Response list */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {responses.length === 0 && (
            <p className="text-[12px] text-[#64748b] text-center py-4">Aucune réponse à afficher.</p>
          )}
          {responses.map((r, i) => {
            const isSelected = r.is_vote_option;
            const isDisabled = !isSelected && selectedCount >= MAX_SELECTIONS;
            return (
              <motion.button
                key={r.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleTap(r)}
                disabled={isDisabled}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 min-h-[44px] ${
                  isSelected
                    ? "border-bw-violet bg-bw-violet/10"
                    : isDisabled
                      ? "border-[#1a1a35] bg-[#0e0e1f] opacity-40 cursor-not-allowed"
                      : "border-[#2a2a50] bg-[#0e0e1f] hover:border-bw-violet/40"
                }`}
              >
                {/* Checkbox indicator */}
                <div
                  className={`w-5 h-5 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center border-2 transition-colors ${
                    isSelected ? "bg-bw-violet border-bw-violet" : "border-[#3a3a60]"
                  }`}
                >
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] leading-relaxed ${isSelected ? "text-[#f0f0f8]" : "text-[#94a3b8]"}`}>
                    {r.text}
                  </p>
                  <p className="text-[10px] text-[#475569] mt-0.5">{r.students.display_name}</p>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 min-h-[44px] py-2.5 rounded-xl text-[12px] font-semibold border border-[#2a2a50] bg-[#0e0e1f] text-[#64748b] hover:text-[#94a3b8] cursor-pointer transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={!canConfirm}
          className={`flex-[2] min-h-[44px] py-2.5 rounded-xl text-[12px] font-bold transition-all ${
            canConfirm
              ? "bg-bw-violet text-white cursor-pointer hover:brightness-110"
              : "bg-[#1a1a35] text-[#475569] cursor-not-allowed"
          }`}
        >
          {canConfirm ? `Ouvrir le vote (${selectedCount})` : `Sélectionne encore ${MIN_SELECTIONS - selectedCount}`}
        </button>
      </div>
    </motion.div>
  );
}
