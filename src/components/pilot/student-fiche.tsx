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
  /** When the current question was opened (for response time calc) */
  respondingOpenedAt?: number | null;
  onBack: () => void;
  onNudge: (studentId: string, text: string) => void;
  onWarn: (studentId: string) => void;
  onBroadcast?: () => void;
  onPrivateHint?: (studentId: string, text: string) => void;
  onViewProgression?: (studentId: string) => void;
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
  // #24 — Pause / reactivate student
  onToggleActive?: (studentId: string, isActive: boolean) => void;
  isToggleActivePending?: boolean;
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
  onPrivateHint,
  onViewProgression,
  respondingOpenedAt,
  toggleHide,
  toggleVoteOption,
  commentResponse,
  highlightResponse,
  scoreResponse,
  resetResponse,
  nudgeStudent,
  warnStudent,
  studentWarnings,
  onToggleActive,
  isToggleActivePending,
}: StudentFicheProps) {
  const [nudgeText, setNudgeText] = useState("");
  const [showNudgeInput, setShowNudgeInput] = useState(false);
  const [showHintInput, setShowHintInput] = useState(false);
  const [hintText, setHintText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const hintInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showNudgeInput) inputRef.current?.focus();
  }, [showNudgeInput]);

  useEffect(() => {
    if (showHintInput) hintInputRef.current?.focus();
  }, [showHintInput]);

  const stateInfo = STATE_LABEL[state] || STATE_LABEL.active;
  const warnings = student.warnings ?? 0;

  function handleSendNudge(text?: string) {
    const msg = (text || nudgeText).trim();
    if (!msg) return;
    onNudge(student.id, msg);
    setNudgeText("");
    setShowNudgeInput(false);
  }

  function handleSendHint() {
    const msg = hintText.trim();
    if (!msg || !onPrivateHint) return;
    onPrivateHint(student.id, msg);
    setHintText("");
    setShowHintInput(false);
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
        className="flex items-center gap-1.5 text-xs text-bw-muted hover:text-bw-heading cursor-pointer transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
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
                <span className="text-xs" style={{ color: stateInfo.color }}>
                  {stateInfo.label}
                </span>
              </span>
              {student.hand_raised_at && <span className="text-xs text-amber-400 font-medium">✋ Main levée</span>}
              {warnings > 0 && <span className="text-xs text-amber-400 font-medium">{warnings}/3 avert.</span>}
              {!student.is_active && <span className="text-xs text-red-500 font-medium">En pause</span>}
            </div>
          </div>
        </div>
      </div>

      {/* #24 — Paused student banner */}
      {!student.is_active && onToggleActive && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] bg-red-50 border border-red-200">
          <span className="text-sm">⏸</span>
          <span className="text-xs font-medium text-red-700 flex-1">
            Cet élève est en pause. Il ne peut pas répondre.
          </span>
          <button
            onClick={() => onToggleActive(student.id, true)}
            disabled={isToggleActivePending}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer transition-all disabled:opacity-50"
          >
            {isToggleActivePending ? "..." : "Réactiver"}
          </button>
        </div>
      )}

      {/* Response time indicator */}
      {responses.length > 0 &&
        respondingOpenedAt &&
        (() => {
          const firstResponse = responses[0];
          const responseMs = new Date(firstResponse.submitted_at).getTime() - respondingOpenedAt;
          if (responseMs <= 0 || responseMs > 600000) return null;
          const secs = Math.round(responseMs / 1000);
          const isFast = secs < 20;
          const isSlow = secs > 60;
          return (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-[10px]"
              style={{
                background: isFast
                  ? "rgba(76,175,80,0.06)"
                  : isSlow
                    ? "rgba(235,87,87,0.06)"
                    : "rgba(107,140,255,0.06)",
                border: `1px solid ${isFast ? "rgba(76,175,80,0.15)" : isSlow ? "rgba(235,87,87,0.15)" : "rgba(107,140,255,0.15)"}`,
              }}
            >
              <span className="text-[10px]">{isFast ? "⚡" : isSlow ? "🐢" : "⏱️"}</span>
              <span
                className="text-[11px] font-semibold"
                style={{ color: isFast ? "#2E7D32" : isSlow ? "#C62828" : "#3B5998" }}
              >
                Temps de reponse : {secs}s
              </span>
              <span className="text-[10px] text-bw-muted">{isFast ? "(rapide)" : isSlow ? "(lent)" : ""}</span>
            </div>
          );
        })()}

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
                state={r.is_hidden ? "hidden" : r.is_vote_option ? "selected" : "default"}
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
          <div className="bg-bw-surface rounded-xl border border-black/[0.04] p-4 text-center">
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
                className="text-xs px-2.5 py-1.5 rounded-lg bg-black/[0.04] border border-black/[0.06] text-bw-text hover:bg-black/[0.06] hover:border-black/[0.12] cursor-pointer transition-all leading-snug text-left active:scale-95"
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
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendNudge();
                if (e.key === "Escape") setShowNudgeInput(false);
              }}
              placeholder="Message personnalisé..."
              className="flex-1 bg-bw-bg border border-bw-border rounded-lg px-3 py-2 text-sm text-bw-text placeholder:text-bw-muted/50 outline-none focus:border-bw-primary/40 transition-colors"
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

        {/* Private hint input */}
        {showHintInput && onPrivateHint && (
          <div className="flex gap-1.5">
            <input
              ref={hintInputRef}
              value={hintText}
              onChange={(e) => setHintText(e.target.value.slice(0, 300))}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendHint();
                if (e.key === "Escape") setShowHintInput(false);
              }}
              placeholder="Indice prive pour cet eleve..."
              className="flex-1 bg-bw-bg border border-bw-border rounded-lg px-3 py-2 text-sm text-bw-text placeholder:text-bw-muted/50 outline-none focus:border-[#F5A45B]/40 transition-colors"
            />
            <button
              onClick={handleSendHint}
              disabled={!hintText.trim()}
              className="px-3 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-30 cursor-pointer hover:brightness-110 transition-all"
              style={{ background: "#F5A45B" }}
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
              showNudgeInput ? "text-bw-primary bg-bw-primary/10" : "text-bw-text hover:bg-black/[0.05]"
            }`}
          >
            <span className="text-sm">💬</span>
            {showNudgeInput ? "Annuler" : "Relancer"}
          </button>
          {onPrivateHint && (
            <button
              onClick={() => {
                setShowHintInput(!showHintInput);
                setShowNudgeInput(false);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                showHintInput ? "text-[#F5A45B] bg-[#F5A45B]/10" : "text-bw-text hover:bg-black/[0.05]"
              }`}
            >
              <span className="text-sm">💡</span>
              {showHintInput ? "Annuler" : "Indice prive"}
            </button>
          )}
          {onBroadcast && (
            <button
              onClick={onBroadcast}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-bw-text hover:bg-black/[0.05] cursor-pointer transition-all"
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
          {/* #24 — Pause / Reactivate toggle */}
          {onToggleActive && (
            <button
              onClick={() => onToggleActive(student.id, !student.is_active)}
              disabled={isToggleActivePending}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all active:scale-95 disabled:opacity-50 ${
                student.is_active ? "text-red-500 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              <span className="text-sm">{student.is_active ? "⏸" : "▶️"}</span>
              {isToggleActivePending ? "..." : student.is_active ? "Mettre en pause" : "Réactiver"}
            </button>
          )}
        </div>

        {/* View progression link */}
        {onViewProgression && (
          <button
            onClick={() => onViewProgression(student.id)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#3B5998] hover:bg-[#3B5998]/5 cursor-pointer transition-all"
          >
            <span className="text-sm">📈</span>
            Voir la progression complete
          </button>
        )}
      </div>
    </motion.div>
  );
}
