"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { SeatStudent } from "./seat-card";

const STATE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  responded: { label: "A repondu", color: "#4CAF50", bg: "#F0FAF4" },
  active: { label: "En cours", color: "#F2C94C", bg: "#FFFCF5" },
  stuck: { label: "Bloque", color: "#EB5757", bg: "#FFF5F5" },
  disconnected: { label: "Deconnecte", color: "#C4BDB2", bg: "#F7F5F2" },
};

const QUICK_NUDGES = [
  "Continue, tu es sur la bonne piste !",
  "N'hesite pas a repondre, il n'y a pas de mauvaise reponse.",
  "Besoin d'aide ? Leve la main.",
  "Relis bien la question avant de repondre.",
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
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(44,44,44,0.3)", backdropFilter: "blur(4px)" }}
      >
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="w-[360px] max-w-[92vw] overflow-hidden"
          style={{
            borderRadius: 16,
            background: "#FFFFFF",
            border: "1px solid #E8DFD2",
            boxShadow: "0 16px 48px rgba(61,43,16,0.15), 0 4px 12px rgba(61,43,16,0.06)",
          }}
        >
          {/* Color bar */}
          <div
            className="h-1 w-full"
            style={{ background: `linear-gradient(90deg, ${stateInfo.color}, ${stateInfo.color}80)` }}
          />

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
              style={{
                background: stateInfo.bg,
                border: `2px solid ${stateInfo.color}`,
              }}
            >
              {student.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-[#2C2C2C] truncate">{student.display_name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stateInfo.color }} />
                  <span className="text-[12px] font-medium" style={{ color: stateInfo.color }}>
                    {stateInfo.label}
                  </span>
                </span>
                {student.hand_raised_at && (
                  <span className="text-[12px] font-medium" style={{ color: "#F5A45B" }}>
                    ✋ Main levee
                  </span>
                )}
                {warnings > 0 && (
                  <span className="text-[12px] font-medium" style={{ color: "#F5A45B" }}>
                    {warnings}/3 avert.
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[8px] cursor-pointer transition-colors"
              style={{ color: "#B0A99E" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#F7F3EA";
                e.currentTarget.style.color = "#2C2C2C";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "";
                e.currentTarget.style.color = "#B0A99E";
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Last response */}
          {lastResponse && (
            <div
              className="mx-3.5 mb-2.5 rounded-[10px] p-3"
              style={{ background: "#F0FAF4", border: "1px solid #C6E9D0" }}
            >
              <p className="text-[11px] uppercase tracking-wider font-bold mb-1" style={{ color: "#4CAF50" }}>
                Reponse
              </p>
              <p className="text-[13px] text-[#2C2C2C] leading-relaxed">{lastResponse}</p>
            </div>
          )}

          {/* No response yet */}
          {!lastResponse && student.state !== "disconnected" && (
            <div
              className="mx-3.5 mb-2.5 rounded-[10px] p-3"
              style={{ background: "#FAF6EE", border: "1px solid #EFE4D8" }}
            >
              <p className="text-[12px] text-[#B0A99E]">Pas encore de reponse</p>
            </div>
          )}

          {/* Quick nudge chips */}
          {!showNudgeInput && (student.state === "active" || student.state === "stuck") && (
            <div className="px-3.5 pb-2.5">
              <p className="text-[11px] uppercase tracking-wider font-bold text-[#B0A99E] mb-1.5">Relance rapide</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_NUDGES.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleSendNudge(text)}
                    className="text-[12px] px-2.5 py-1.5 rounded-[8px] cursor-pointer transition-all leading-snug text-left"
                    style={{
                      background: "#FAF6EE",
                      border: "1px solid #EFE4D8",
                      color: "#5B5B5B",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#F0EBE0";
                      e.currentTarget.style.borderColor = "#E8DFD2";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#FAF6EE";
                      e.currentTarget.style.borderColor = "#EFE4D8";
                    }}
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
                <div className="px-3.5 pb-2.5">
                  <div className="flex gap-1.5">
                    <input
                      ref={inputRef}
                      value={nudgeText}
                      onChange={(e) => setNudgeText(e.target.value.slice(0, 300))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendNudge();
                        if (e.key === "Escape") setShowNudgeInput(false);
                      }}
                      placeholder="Message personnalise..."
                      className="flex-1 rounded-[8px] px-3 py-2 text-[13px] outline-none transition-colors"
                      style={{
                        background: "#FAF6EE",
                        border: "1px solid #EFE4D8",
                        color: "#2C2C2C",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#6B8CFF";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#EFE4D8";
                      }}
                    />
                    <button
                      onClick={() => handleSendNudge()}
                      disabled={!nudgeText.trim()}
                      className="px-3.5 py-2 rounded-[8px] text-[13px] font-semibold text-white cursor-pointer transition-all disabled:opacity-30"
                      style={{ background: "#2C2C2C" }}
                    >
                      Envoyer
                    </button>
                  </div>
                  <p className="text-[11px] mt-1 text-right tabular-nums" style={{ color: "#B0A99E" }}>
                    {nudgeText.length}/300
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="p-2 flex gap-1.5" style={{ borderTop: "1px solid #EFE4D8" }}>
            <ActionButton
              icon="💬"
              label={showNudgeInput ? "Annuler" : "Message"}
              onClick={() => setShowNudgeInput(!showNudgeInput)}
              active={showNudgeInput}
              grow
            />
            {onBroadcast && (
              <ActionButton
                icon="📢"
                label="Tous"
                onClick={() => {
                  onBroadcast(student.id);
                  onClose();
                }}
                grow
              />
            )}
            <ActionButton
              icon="⚠️"
              label={warnings > 0 ? `Avertir (${warnings}/3)` : "Avertir"}
              onClick={() => {
                onWarn(student.id);
                onClose();
              }}
              variant="warning"
              grow
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  variant,
  active,
  grow,
}: {
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
      className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-[12px] font-medium cursor-pointer transition-all ${grow ? "flex-1" : ""}`}
      style={{
        borderRadius: 10,
        color: variant === "warning" ? "#EB5757" : active ? "#6B8CFF" : "#5B5B5B",
        background: variant === "warning" ? "#FFF5F5" : active ? "#EEF2FF" : "#FAF6EE",
        border: `1px solid ${variant === "warning" ? "#F5C4C4" : active ? "#D4DEFF" : "#EFE4D8"}`,
      }}
    >
      <span className="text-sm">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
