"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { SeatStudent } from "./seat-card";

const STATE_LABEL: Record<string, { label: string; color: string }> = {
  responded: { label: "A répondu", color: "#4ECDC4" },
  active: { label: "En cours", color: "#FF6B35" },
  stuck: { label: "Bloqué", color: "#F59E0B" },
  disconnected: { label: "Déconnecté", color: "#666" },
};

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

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    if (showNudgeInput) inputRef.current?.focus();
  }, [showNudgeInput]);

  const stateInfo = STATE_LABEL[student.state] || STATE_LABEL.active;

  function handleSendNudge() {
    if (!nudgeText.trim()) return;
    onNudge(student.id, nudgeText.trim());
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="glass-card w-[320px] max-w-[90vw] p-0 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/[0.06]">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl ring-2"
              style={{ boxShadow: `0 0 0 2px ${stateInfo.color}` }}
            >
              {student.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-bw-heading truncate">{student.display_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stateInfo.color }} />
                <span className="text-[11px] text-bw-muted">{stateInfo.label}</span>
                {student.hand_raised_at && (
                  <span className="text-xs ml-1">✋ Main levée</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-bw-muted hover:text-white cursor-pointer p-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Last response */}
          {lastResponse && (
            <div className="px-4 py-3 border-b border-white/[0.06] bg-bw-teal/5">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-bw-teal mb-1">Dernière réponse</p>
              <p className="text-sm text-bw-text leading-relaxed line-clamp-3">{lastResponse}</p>
            </div>
          )}

          {/* Nudge input */}
          {showNudgeInput && (
            <div className="px-4 py-3 border-b border-white/[0.06] bg-bw-primary/5">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={nudgeText}
                  onChange={(e) => setNudgeText(e.target.value.slice(0, 300))}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendNudge(); }}
                  placeholder="Message de relance..."
                  className="flex-1 bg-bw-bg border border-white/10 rounded-lg px-3 py-2 text-sm text-bw-text placeholder:text-bw-muted/50 outline-none focus:border-bw-primary/40"
                />
                <button
                  onClick={handleSendNudge}
                  disabled={!nudgeText.trim()}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-bw-primary text-white disabled:opacity-30 cursor-pointer hover:brightness-110 transition-all"
                >
                  Envoyer
                </button>
              </div>
              <p className="text-[10px] text-bw-muted mt-1 text-right">{nudgeText.length}/300</p>
            </div>
          )}

          {/* Actions */}
          <div className="p-2 space-y-0.5">
            {lastResponse && onViewResponse && (
              <button
                onClick={() => { onViewResponse(); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-bw-text hover:bg-white/5 cursor-pointer transition-colors"
              >
                <span className="text-base">👁</span>
                <span>Voir réponse</span>
              </button>
            )}
            <button
              onClick={() => setShowNudgeInput(!showNudgeInput)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-bw-text hover:bg-white/5 cursor-pointer transition-colors"
            >
              <span className="text-base">💬</span>
              <span>Relancer</span>
            </button>
            {onBroadcast && (
              <button
                onClick={() => { onBroadcast(student.id); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-bw-text hover:bg-white/5 cursor-pointer transition-colors"
              >
                <span className="text-base">📢</span>
                <span>Message ciblé</span>
              </button>
            )}
            <button
              onClick={() => { onWarn(student.id); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-bw-amber hover:bg-bw-amber/10 cursor-pointer transition-colors"
            >
              <span className="text-base">⚠️</span>
              <span>Avertir</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
