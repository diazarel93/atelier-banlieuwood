"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { ResponseCard, type ResponseCardResponse } from "./response-card";

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

interface StudentFicheProps {
  studentId: string;
  student: {
    id: string;
    display_name: string;
    avatar: string;
    is_active: boolean;
    hand_raised_at?: string | null;
    warnings?: number;
  };
  state: string;
  responses: ResponseCardResponse[];
  sessionStatus: string;
  onBack: () => void;
  onNudge: (studentId: string, text: string) => void;
  onWarn: (studentId: string) => void;
  onBroadcast?: () => void;
  // Response card action mutations
  toggleHide: { mutate: (args: { responseId: string; is_hidden: boolean }) => void; isPending: boolean };
  toggleVoteOption: { mutate: (args: { responseId: string; is_vote_option: boolean }) => void; isPending: boolean };
  commentResponse: { mutate: (args: { responseId: string; comment: string | null }) => void; isPending: boolean };
  highlightResponse: { mutate: (args: { responseId: string; highlighted: boolean }) => void; isPending: boolean };
  scoreResponse: { mutate: (args: { responseId: string; score: number }) => void; isPending: boolean };
  resetResponse: { mutate: (args: string) => void; isPending: boolean };
  nudgeStudent: { mutate: (args: { responseId: string; nudgeText: string }) => void; isPending: boolean };
  warnStudent: { mutate: (args: string) => void; isPending: boolean };
  studentWarnings: Record<string, number>;
}

export function StudentFiche({
  student,
  state,
  responses,
  sessionStatus,
  onBack,
  onNudge,
  onWarn,
  onBroadcast,
  toggleHide,
  toggleVoteOption,
  commentResponse,
  highlightResponse,
  scoreResponse,
  resetResponse,
  nudgeStudent,
  warnStudent,
  studentWarnings,
}: StudentFicheProps) {
  const [nudgeText, setNudgeText] = useState("");
  const [showNudgeInput, setShowNudgeInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showNudgeInput) inputRef.current?.focus();
  }, [showNudgeInput]);

  const stateInfo = STATE_LABEL[state] || STATE_LABEL.active;
  const warnings = student.warnings ?? 0;

  function handleSendNudge(text?: string) {
    const msg = (text || nudgeText).trim();
    if (!msg) return;
    onNudge(student.id, msg);
    setNudgeText("");
    setShowNudgeInput(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-bw-muted hover:text-white cursor-pointer transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Retour au flux
      </button>

      {/* Student header */}
      <div className="glass-card overflow-hidden">
        <div className="h-0.5 w-full" style={{ background: stateInfo.color }} />
        <div className="flex items-center gap-3 px-4 py-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
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
        </div>
      </div>

      {/* Student responses */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider font-semibold text-bw-muted">
          Réponses de {student.display_name} ({responses.length})
        </p>
        {responses.length > 0 ? (
          <div className="space-y-2">
            {responses.map((r) => (
              <ResponseCard
                key={r.id}
                response={r}
                state={
                  r.is_hidden ? "hidden"
                    : r.is_vote_option ? "selected"
                    : "default"
                }
                sessionStatus={sessionStatus}
                onSelect={() => toggleVoteOption.mutate({ responseId: r.id, is_vote_option: !r.is_vote_option })}
                onHide={() => toggleHide.mutate({ responseId: r.id, is_hidden: !r.is_hidden })}
                isPending={toggleVoteOption.isPending || toggleHide.isPending}
                onComment={(id, comment) => commentResponse.mutate({ responseId: id, comment })}
                onHighlight={(id, highlighted) => highlightResponse.mutate({ responseId: id, highlighted })}
                onNudge={(id, text) => nudgeStudent.mutate({ responseId: id, nudgeText: text })}
                onWarn={(sid) => warnStudent.mutate(sid)}
                onScore={(id, score) => scoreResponse.mutate({ responseId: id, score })}
                onReset={(id) => resetResponse.mutate(id)}
                isNudgePending={nudgeStudent.isPending}
                isCommentPending={commentResponse.isPending}
                isWarnPending={warnStudent.isPending}
                isScorePending={scoreResponse.isPending}
                isResetPending={resetResponse.isPending}
                warnings={studentWarnings[r.student_id] || 0}
              />
            ))}
          </div>
        ) : (
          <div className="bg-bw-surface rounded-xl border border-white/[0.06] p-4 text-center">
            <p className="text-xs text-bw-muted">Pas encore de réponse</p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider font-semibold text-bw-muted">Actions rapides</p>

        {/* Quick nudge chips */}
        {!showNudgeInput && (
          <div className="flex flex-wrap gap-1.5">
            {QUICK_NUDGES.map((text) => (
              <button
                key={text}
                onClick={() => handleSendNudge(text)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.10] text-bw-text hover:bg-white/[0.10] hover:border-white/[0.16] cursor-pointer transition-all leading-snug text-left active:scale-95"
              >
                {text}
              </button>
            ))}
          </div>
        )}

        {/* Custom nudge input */}
        {showNudgeInput && (
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
        )}

        {/* Action buttons */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setShowNudgeInput(!showNudgeInput)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              showNudgeInput ? "text-bw-primary bg-bw-primary/10" : "text-bw-text hover:bg-white/[0.08]"
            }`}
          >
            <span className="text-sm">💬</span>
            {showNudgeInput ? "Annuler" : "Relancer"}
          </button>
          {onBroadcast && (
            <button
              onClick={onBroadcast}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-bw-text hover:bg-white/[0.08] cursor-pointer transition-all"
            >
              <span className="text-sm">📢</span>
              Message classe
            </button>
          )}
          <button
            onClick={() => onWarn(student.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-bw-amber hover:bg-bw-amber/10 cursor-pointer transition-all active:scale-95"
          >
            <span className="text-sm">⚠️</span>
            {warnings > 0 ? `Avertir (${warnings}/3)` : "Avertir"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
