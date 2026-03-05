"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { SeatStudent } from "./seat-card";

const STATE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  responded: { label: "A répondu", color: "#4ECDC4", bg: "rgba(78,205,196,0.08)" },
  active: { label: "En cours", color: "#FF6B35", bg: "rgba(255,107,53,0.08)" },
  stuck: { label: "Bloqué", color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
  disconnected: { label: "Déconnecté", color: "#666", bg: "rgba(100,100,100,0.08)" },
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="glass-card w-[340px] max-w-[92vw] p-0 overflow-hidden"
        >
          {/* Header with state color bar */}
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${stateInfo.color}, ${stateInfo.color}60)` }} />

          <div className="flex items-center gap-3 px-4 py-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
              style={{ boxShadow: `0 0 0 2.5px ${stateInfo.color}`, background: stateInfo.bg }}
            >
              {student.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-bw-heading truncate">{student.display_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stateInfo.color }} />
                <span className="text-[11px]" style={{ color: stateInfo.color }}>{stateInfo.label}</span>
                {student.hand_raised_at && (
                  <span className="text-[11px] text-bw-amber ml-1 font-medium">✋ Main levée</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-bw-muted hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Last response */}
          {lastResponse && (
            <div className="mx-3 mb-2 rounded-lg p-2.5" style={{ background: "rgba(78,205,196,0.05)", border: "1px solid rgba(78,205,196,0.12)" }}>
              <p className="text-[9px] uppercase tracking-wider font-bold text-bw-teal mb-1">Dernière réponse</p>
              <p className="text-[13px] text-bw-text leading-relaxed line-clamp-4">{lastResponse}</p>
            </div>
          )}

          {/* Quick nudge chips */}
          {!showNudgeInput && (student.state === "active" || student.state === "stuck") && (
            <div className="px-3 pb-2">
              <p className="text-[9px] uppercase tracking-wider font-bold text-bw-muted mb-1.5">Relance rapide</p>
              <div className="flex flex-wrap gap-1">
                {QUICK_NUDGES.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleSendNudge(text)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-bw-primary/8 border border-bw-primary/15 text-bw-text hover:bg-bw-primary/15 hover:border-bw-primary/30 cursor-pointer transition-all leading-snug text-left"
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
                      ↗
                    </button>
                  </div>
                  <p className="text-[9px] text-bw-muted mt-1 text-right tabular-nums">{nudgeText.length}/300</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="border-t border-white/[0.06] p-1.5 grid grid-cols-2 gap-1">
            {lastResponse && onViewResponse && (
              <ActionButton icon="👁" label="Voir réponse" onClick={() => { onViewResponse(); onClose(); }} />
            )}
            <ActionButton
              icon="💬"
              label={showNudgeInput ? "Annuler" : "Message perso"}
              onClick={() => setShowNudgeInput(!showNudgeInput)}
              active={showNudgeInput}
            />
            {onBroadcast && (
              <ActionButton icon="📢" label="Broadcast" onClick={() => { onBroadcast(student.id); onClose(); }} />
            )}
            <ActionButton
              icon="⚠️"
              label="Avertir"
              onClick={() => { onWarn(student.id); onClose(); }}
              variant="warning"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ActionButton({ icon, label, onClick, variant, active }: {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: "warning";
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
        variant === "warning"
          ? "text-bw-amber hover:bg-bw-amber/10"
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
