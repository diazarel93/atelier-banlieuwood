"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { SeatStudent } from "./seat-card";

const STATE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  responded: { label: "A répondu", color: "#4ECDC4", bg: "rgba(78,205,196,0.06)" },
  active: { label: "En cours", color: "#8894A0", bg: "rgba(136,148,160,0.06)" },
  stuck: { label: "Bloqué", color: "#EF6461", bg: "rgba(239,100,97,0.06)" },
  disconnected: { label: "Déconnecté", color: "#555", bg: "rgba(80,80,80,0.06)" },
};

const QUICK_NUDGES = [
  "Continue, tu es sur la bonne piste !",
  "N'hésite pas à répondre, il n'y a pas de mauvaise réponse.",
  "Besoin d'aide ? Lève la main.",
  "Relis bien la question avant de répondre.",
];

export function StudentActionPopover({
  student,
  lastResponse,
  onClose,
  onNudge,
  onWarn,
  onViewResponse,
  onBroadcast,
}: {
  student: SeatStudent;
  lastResponse: string | null;
  onClose: () => void;
  onNudge: (studentId: string, text: string) => void;
  onWarn: (studentId: string) => void;
  onViewResponse?: () => void;
  onBroadcast?: (studentId: string) => void;
}) {
  const [nudgeText, setNudgeText] = useState("");
  const [showNudgeInput, setShowNudgeInput] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) handleClose();
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [handleClose]);

  useEffect(() => {
    if (showNudgeInput) inputRef.current?.focus();
  }, [showNudgeInput]);

  const stateInfo = STATE_LABEL[student.state] || STATE_LABEL.active;
  const warnings = student.warnings ?? 0;

  function handleSendNudge(text?: string) {
    const msg = (text || nudgeText).trim();
    if (!msg) return;
    onNudge(student.id, msg);
    setNudgeText("");
    setShowNudgeInput(false);
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="glass-card w-[340px] max-w-[92vw] p-0 overflow-hidden"
        >
          {/* Color bar */}
          <div className="h-0.5 w-full" style={{ background: stateInfo.color }} />

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
              style={{ boxShadow: `0 0 0 2px ${stateInfo.color}`, background: stateInfo.bg }}
            >
              {student.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-bw-heading truncate">{student.display_name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stateInfo.color }} />
                  <span className="text-xs" style={{ color: stateInfo.color }}>{stateInfo.label}</span>
                </span>
                {student.hand_raised_at && (
                  <span className="text-xs text-amber-400 font-medium">✋ Main levée</span>
                )}
                {warnings > 0 && (
                  <span className="text-xs text-amber-400 font-medium">{warnings}/3 avert.</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-bw-muted hover:text-bw-heading cursor-pointer p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Last response — the main thing the teacher wants to see */}
          {lastResponse && (
            <div className="mx-3 mb-2 rounded-lg p-2.5" style={{ background: "rgba(78,205,196,0.04)", border: "1px solid rgba(78,205,196,0.10)" }}>
              <p className="text-xs uppercase tracking-wider font-bold text-bw-teal mb-1">Réponse</p>
              <p className="text-[13px] text-bw-text leading-relaxed">{lastResponse}</p>
            </div>
          )}

          {/* No response yet */}
          {!lastResponse && student.state !== "disconnected" && (
            <div className="mx-3 mb-2 rounded-lg p-2.5 bg-black/[0.02] border border-black/[0.04]">
              <p className="text-xs text-bw-muted">Pas encore de réponse</p>
            </div>
          )}

          {/* Quick nudge chips — shown for active & stuck */}
          {!showNudgeInput && (student.state === "active" || student.state === "stuck") && (
            <div className="px-3 pb-2">
              <p className="text-xs uppercase tracking-wider font-bold text-bw-muted mb-1.5">Relance rapide</p>
              <div className="flex flex-wrap gap-1">
                {QUICK_NUDGES.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleSendNudge(text)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-black/[0.03] border border-black/[0.06] text-bw-text hover:bg-black/[0.05] cursor-pointer transition-all leading-snug text-left"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom nudge input */}
          <AnimatePresence>
            {showNudgeInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-2">
                  <div className="flex gap-1.5">
                    <input
                      ref={inputRef}
                      value={nudgeText}
                      onChange={(e) => setNudgeText(e.target.value.slice(0, 300))}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSendNudge(); if (e.key === "Escape") setShowNudgeInput(false); }}
                      placeholder="Message personnalisé..."
                      className="flex-1 bg-bw-bg border border-white/10 rounded-lg px-3 py-2 text-sm text-bw-text placeholder:text-bw-muted/50 outline-none focus:border-bw-primary/40 transition-colors"
                    />
                    <button
                      onClick={() => handleSendNudge()}
                      disabled={!nudgeText.trim()}
                      className="px-3 py-2 rounded-lg text-sm font-medium bg-bw-primary text-white disabled:opacity-30 cursor-pointer hover:brightness-110 transition-all"
                    >
                      Envoyer
                    </button>
                  </div>
                  <p className="text-xs text-bw-muted mt-1 text-right tabular-nums">{nudgeText.length}/300</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="border-t border-black/[0.04] p-1.5 flex gap-1">
            <ActionButton
              icon="💬"
              label={showNudgeInput ? "Annuler" : "Message"}
              onClick={() => setShowNudgeInput(!showNudgeInput)}
              active={showNudgeInput}
              grow
            />
            {onBroadcast && (
              <ActionButton icon="📢" label="Tous" onClick={() => { onBroadcast(student.id); onClose(); }} grow />
            )}
            <ActionButton
              icon="⚠️"
              label={warnings > 0 ? `Avertir (${warnings}/3)` : "Avertir"}
              onClick={() => { onWarn(student.id); onClose(); }}
              variant="warning"
              grow
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ActionButton({ icon, label, onClick, variant, active, grow }: {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: "warning";
  active?: boolean;
  grow?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${grow ? "flex-1" : ""} ${
        variant === "warning"
          ? "text-amber-400 hover:bg-amber-500/10"
          : active
            ? "text-bw-primary bg-bw-primary/10"
            : "text-bw-text hover:bg-white/5"
      }`}
    >
      <span className="text-sm">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
