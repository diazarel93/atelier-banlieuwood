"use client";

import { memo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import { NUDGE_PRESETS, QUICK_REACTIONS } from "./pilot-settings";

interface InlineActionsProps {
  responseId: string;
  studentId: string;
  isHighlighted: boolean;
  teacherComment: string | null;
  isCommenting: boolean;
  commentText: string;
  onComment: (responseId: string, comment: string | null) => void;
  onHighlight: (responseId: string, highlighted: boolean) => void;
  onFlag?: (responseId: string, flag: string | null) => void;
  onNudge: (responseId: string, nudgeText: string) => void;
  onWarn: (studentId: string) => void;
  onScore: (responseId: string, score: number) => void;
  onStartComment: () => void;
  onCancelComment: () => void;
  onChangeComment: (text: string) => void;
  studentName: string;
  teacherFlag?: string | null;
  isNudgePending?: boolean;
  isCommentPending?: boolean;
  isWarnPending?: boolean;
  isScorePending?: boolean;
  warnings?: number;
  teacherScore?: number;
}

function InlineActionsInner({
  responseId,
  studentId,
  isHighlighted,
  teacherComment,
  isCommenting,
  commentText,
  onComment,
  onHighlight,
  onFlag,
  onNudge,
  onWarn,
  onScore,
  onStartComment,
  onCancelComment,
  onChangeComment,
  studentName,
  teacherFlag = null,
  isNudgePending,
  isCommentPending,
  isWarnPending,
  isScorePending,
  warnings = 0,
  teacherScore = 0,
}: InlineActionsProps) {
  const [showNudgePicker, setShowNudgePicker] = useState(false);
  const [customNudge, setCustomNudge] = useState("");
  const [lastNudge, setLastNudge] = useState(NUDGE_PRESETS[0]);
  const [showScorePicker, setShowScorePicker] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);
  const [sentReaction, setSentReaction] = useState<string | null>(null);
  const [showOverflow, setShowOverflow] = useState(false);

  const handleToggleHighlight = useCallback(() => {
    onHighlight(responseId, !isHighlighted);
  }, [onHighlight, responseId, isHighlighted]);

  const handleWarn = useCallback(() => {
    onWarn(studentId);
  }, [onWarn, studentId]);

  const handleDeleteComment = useCallback(() => {
    onComment(responseId, null);
  }, [onComment, responseId]);

  const handleSubmitComment = useCallback(() => {
    if (commentText.trim()) onComment(responseId, commentText.trim());
  }, [onComment, responseId, commentText]);

  return (
    <div className="space-y-2">
      {/* Quick reaction buttons — one-click feedback with sent flash */}
      <div className="flex items-center gap-1 pt-1.5 border-t border-black/[0.04]">
        {QUICK_REACTIONS.map((r) => (
          <motion.button
            key={r.emoji}
            onClick={() => {
              onNudge(responseId, r.text);
              setSentReaction(r.emoji);
              setTimeout(() => setSentReaction(null), 1200);
            }}
            disabled={isNudgePending}
            title={r.text}
            className="relative flex items-center gap-0.5 px-1.5 py-1 rounded-lg text-xs cursor-pointer transition-all disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none"
            style={{
              background: sentReaction === r.emoji ? `${r.color}30` : `${r.color}12`,
              border: `1px solid ${sentReaction === r.emoji ? `${r.color}60` : `${r.color}20`}`,
              boxShadow: sentReaction === r.emoji ? `0 0 12px ${r.color}30` : undefined,
            }}
            whileTap={{ scale: 0.85 }}
            animate={sentReaction === r.emoji ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <span className="text-xs leading-none">{sentReaction === r.emoji ? "✓" : r.emoji}</span>
          </motion.button>
        ))}
        <div className="w-px h-4 bg-black/[0.04] mx-0.5" />
      </div>

      {/* Action buttons row — 2 primary + overflow */}
      <div className="flex items-center gap-1.5">
        {/* Projeter — PRIMARY action */}
        <button
          onClick={handleToggleHighlight}
          aria-label={isHighlighted ? "Retirer la mise en avant" : "Mettre en avant la réponse"}
          aria-pressed={isHighlighted}
          className={`btn-glow flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none ${
            isHighlighted
              ? "bg-bw-primary/15 text-bw-primary"
              : "text-bw-muted hover:text-bw-primary hover:bg-bw-primary/10"
          }`}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill={isHighlighted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {isHighlighted ? "Projete" : "Projeter"}
        </button>

        {/* Parler — PRIMARY action */}
        <button
          onClick={onStartComment}
          aria-label={teacherComment ? "Modifier le commentaire" : "Commenter la reponse"}
          className={`btn-glow flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none ${
            teacherComment || isCommenting
              ? "bg-bw-teal/15 text-bw-teal"
              : "text-bw-muted hover:text-bw-text hover:bg-white/5"
          }`}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          {teacherComment ? "Commente" : "Parler"}
        </button>

        {teacherComment && !isCommenting && (
          <button onClick={handleDeleteComment} aria-label="Supprimer le commentaire"
            className="px-1 py-1 rounded-md text-xs cursor-pointer transition-colors text-bw-muted hover:text-bw-danger focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none"
            title="Supprimer commentaire">✕</button>
        )}

        <div className="flex-1" />

        {/* Overflow menu — remaining actions */}
        <div className="relative">
          <button
            onClick={() => setShowOverflow(p => !p)}
            aria-label="Plus d'actions"
            className="flex items-center px-2 py-1 rounded-xl text-xs text-bw-muted hover:text-bw-text hover:bg-white/5 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none"
          >
            ⋯
          </button>
          <AnimatePresence>
            {showOverflow && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowOverflow(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 bottom-full mb-1.5 z-50 w-44 bg-bw-surface border border-black/[0.06] rounded-xl shadow-2xl overflow-hidden"
                >
                  {/* Relancer */}
                  <button onClick={() => { setShowNudgePicker(!showNudgePicker); setShowOverflow(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-bw-text hover:bg-black/[0.05] cursor-pointer transition-colors flex items-center gap-2">
                    <span className="w-4 text-center">🔄</span> Relancer
                  </button>
                  {/* Noter */}
                  <button onClick={() => { setShowScorePicker(!showScorePicker); setShowOverflow(false); }}
                    disabled={isScorePending}
                    className="w-full text-left px-3 py-2 text-xs text-bw-text hover:bg-black/[0.05] cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-40">
                    <span className="w-4 text-center">⭐</span> {teacherScore > 0 ? `Note: ${teacherScore}/5` : "Noter"}
                  </button>
                  {/* Annotation flags */}
                  {onFlag && ([
                    { key: "star", icon: "⭐", label: "Excellent" },
                    { key: "flag", icon: "🚩", label: "A revoir" },
                    { key: "bookmark", icon: "🔖", label: "A projeter" },
                  ] as const).map((f) => (
                    <button key={f.key}
                      onClick={() => { onFlag(responseId, teacherFlag === f.key ? null : f.key); setShowOverflow(false); }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-black/[0.05] cursor-pointer transition-colors flex items-center gap-2 ${
                        teacherFlag === f.key ? "text-bw-teal" : "text-bw-text"
                      }`}>
                      <span className="w-4 text-center">{f.icon}</span> {teacherFlag === f.key ? `✓ ${f.label}` : f.label}
                    </button>
                  ))}
                  {/* Signaler */}
                  <button onClick={() => { handleWarn(); setShowOverflow(false); }}
                    disabled={isWarnPending}
                    className="w-full text-left px-3 py-2 text-xs text-bw-danger hover:bg-bw-danger/10 cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-40 border-t border-black/[0.04]">
                    <span className="w-4 text-center">🚩</span> Signaler {warnings > 0 && `(${warnings}/3)`}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nudge picker — preset messages + custom */}
      <AnimatePresence>
        {showNudgePicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-bw-surface border border-bw-amber/20 rounded-xl p-2.5 space-y-2">
              <span className="text-xs text-bw-amber font-medium uppercase tracking-wider">
                Message pour {studentName}
              </span>
              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1.5">
                {NUDGE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setLastNudge(preset);
                      onNudge(responseId, preset.text);
                      setShowNudgePicker(false);
                    }}
                    aria-label={`Envoyer : ${preset.text}`}
                    className="px-2.5 py-1.5 bg-bw-bg border border-black/[0.04] rounded-xl text-xs text-bw-text hover:border-bw-amber/30 hover:text-bw-amber cursor-pointer transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              {/* Custom input */}
              <div className="flex gap-1.5">
                <Input
                  type="text"
                  value={customNudge}
                  onChange={(e) => setCustomNudge(e.target.value)}
                  placeholder="Message perso..."
                  className="flex-1 h-auto bg-bw-bg border-white/10 text-xs text-bw-heading placeholder:text-bw-muted focus:border-bw-amber px-2 py-1.5"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customNudge.trim()) {
                      onNudge(responseId, customNudge.trim());
                      setCustomNudge("");
                      setShowNudgePicker(false);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (customNudge.trim()) {
                      onNudge(responseId, customNudge.trim());
                      setCustomNudge("");
                      setShowNudgePicker(false);
                    }
                  }}
                  disabled={!customNudge.trim()}
                  aria-label="Envoyer le message personnalisé"
                  className="px-3 py-1.5 rounded-xl bg-bw-amber text-black text-xs font-semibold cursor-pointer hover:brightness-110 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none"
                >
                  Envoyer
                </button>
              </div>
              <button
                onClick={() => setShowNudgePicker(false)}
                aria-label="Annuler la relance"
                className="w-full py-1 text-xs text-bw-muted hover:text-bw-text cursor-pointer focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score picker — 1-5 stars */}
      <AnimatePresence>
        {showScorePicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-bw-surface border border-bw-green/20 rounded-xl p-2.5 space-y-2">
              <span className="text-xs text-bw-green font-medium uppercase tracking-wider">
                Note qualite
              </span>
              <div className="flex items-center gap-1" role="radiogroup" aria-label="Note de 1 à 5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    role="radio"
                    aria-checked={teacherScore === star}
                    aria-label={`${star} étoile${star > 1 ? "s" : ""} — ${["", "Faible", "Moyen", "Bien", "Très bien", "Excellent"][star]}`}
                    onMouseEnter={() => setHoverStar(star)}
                    onMouseLeave={() => setHoverStar(0)}
                    onFocus={() => setHoverStar(star)}
                    onBlur={() => setHoverStar(0)}
                    onClick={() => {
                      onScore(responseId, star === teacherScore ? 0 : star);
                      setShowScorePicker(false);
                      setHoverStar(0);
                    }}
                    className="p-1 cursor-pointer transition-transform hover:scale-125 focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none focus-visible:rounded-sm"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill={(hoverStar || teacherScore) >= star ? "#10B981" : "none"}
                      stroke="#10B981"
                      strokeWidth="1.5"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                ))}
                <span className="ml-2 text-xs text-bw-muted">
                  {(hoverStar || teacherScore) > 0
                    ? ["", "Faible", "Moyen", "Bien", "Tres bien", "Excellent"][hoverStar || teacherScore]
                    : "Cliquer pour noter"}
                </span>
              </div>
              <button
                onClick={() => { setShowScorePicker(false); setHoverStar(0); }}
                aria-label="Fermer le sélecteur de note"
                className="w-full py-1 text-xs text-bw-muted hover:text-bw-text cursor-pointer focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment input — slides open inline */}
      <AnimatePresence>
        {isCommenting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-bw-surface border border-bw-teal/20 rounded-xl p-2.5 space-y-2">
              <span className="text-xs text-bw-teal font-medium uppercase tracking-wider">
                Commentaire pour {studentName}
              </span>
              <Textarea
                value={commentText}
                onChange={(e) => onChangeComment(e.target.value)}
                placeholder="Bien vu ! Creuse cette idée..."
                rows={2}
                autoFocus
                className="bg-bw-bg border-white/10 text-xs text-bw-heading placeholder:text-bw-muted focus:border-bw-teal resize-none min-h-0 p-2"
              />
              <div className="flex gap-1.5">
                <button onClick={onCancelComment}
                  aria-label="Annuler le commentaire"
                  className="flex-1 py-1.5 rounded-xl bg-bw-bg text-bw-muted text-xs font-medium cursor-pointer border border-black/[0.04] focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none">
                  Annuler
                </button>
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || isCommentPending}
                  aria-label="Envoyer le commentaire"
                  className="flex-1 py-1.5 rounded-xl bg-bw-teal text-black text-xs font-semibold cursor-pointer hover:brightness-110 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none">
                  {isCommentPending ? "..." : "Envoyer"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const InlineActions = memo(InlineActionsInner);

// Inline display of teacher comment (below the response text)
function TeacherCommentBadgeInner({ comment }: { comment: string }) {
  return (
    <div className="mt-1.5 flex items-start gap-1.5 bg-bw-teal/5 rounded-xl px-2.5 py-1.5 border border-bw-teal/10">
      <span className="text-xs text-bw-teal flex-shrink-0 mt-0.5">Prof:</span>
      <span className="text-xs text-bw-teal/80 leading-snug">{comment}</span>
    </div>
  );
}

export const TeacherCommentBadge = memo(TeacherCommentBadgeInner);

// ─── Generic Inline Actions ──────────────────────────────────────────────
// Same visual as InlineActions but works with any entity type (scenes, budgets, etc.)
// Uses broadcast_message for student-facing feedback instead of response-specific endpoints.

interface GenericInlineActionsProps {
  entityId: string;
  studentId: string;
  studentName: string;
  isHighlighted?: boolean;
  onBroadcast: (message: string) => void;
  onHighlight?: (entityId: string, highlighted: boolean) => void;
  onWarn: (studentId: string) => void;
  isWarnPending?: boolean;
  warnings?: number;
}

function GenericInlineActionsInner({
  entityId,
  studentId,
  studentName,
  isHighlighted = false,
  onBroadcast,
  onHighlight,
  onWarn,
  isWarnPending,
  warnings = 0,
}: GenericInlineActionsProps) {
  const [showNudgePicker, setShowNudgePicker] = useState(false);
  const [customNudge, setCustomNudge] = useState("");
  const [lastNudge, setLastNudge] = useState(NUDGE_PRESETS[0]);
  const [showScorePicker, setShowScorePicker] = useState(false);
  const [localScore, setLocalScore] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [savedComment, setSavedComment] = useState<string | null>(null);

  const handleToggleHighlight = useCallback(() => {
    onHighlight?.(entityId, !isHighlighted);
  }, [onHighlight, entityId, isHighlighted]);

  const handleWarn = useCallback(() => {
    onWarn(studentId);
  }, [onWarn, studentId]);

  return (
    <div className="space-y-2">
      {/* Quick reaction buttons — same as InlineActions */}
      <div className="flex items-center gap-1 pt-1.5 border-t border-black/[0.04]">
        {QUICK_REACTIONS.map((r) => (
          <button
            key={r.emoji}
            onClick={() => onBroadcast(`${studentName} : ${r.text}`)}
            title={r.text}
            className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg text-xs cursor-pointer transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none"
            style={{ background: `${r.color}12`, border: `1px solid ${r.color}20` }}
          >
            <span className="text-xs leading-none">{r.emoji}</span>
          </button>
        ))}
        <div className="w-px h-4 bg-black/[0.04] mx-0.5" />
      </div>

      {/* Action buttons row — identical layout to InlineActions */}
      <div className="flex items-center gap-1.5">
        {/* Parler / Commenter */}
        <button
          onClick={() => setIsCommenting(true)}
          aria-label={savedComment ? "Modifier le commentaire" : "Commenter"}
          className={`btn-glow flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-medium cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none ${
            savedComment || isCommenting
              ? "bg-bw-teal/15 text-bw-teal"
              : "text-bw-muted hover:text-bw-text hover:bg-white/5"
          }`}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          {savedComment ? "Commenté" : "Parler"}
        </button>

        {/* Relancer / Nudge — split button */}
        <div className="flex items-center">
          <button
            onClick={() => onBroadcast(`${studentName} : ${lastNudge.text}`)}
            aria-label={`Relancer : ${lastNudge.label}`}
            className={`btn-glow flex items-center gap-1 px-2 py-1 rounded-l-xl text-xs font-medium cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none ${
              showNudgePicker
                ? "bg-bw-amber/15 text-bw-amber"
                : "text-bw-muted hover:text-bw-amber hover:bg-bw-amber/10"
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
            </svg>
            {lastNudge.label}
          </button>
          <button
            onClick={() => setShowNudgePicker(!showNudgePicker)}
            aria-label="Choisir un autre message de relance"
            aria-expanded={showNudgePicker}
            className={`flex items-center px-1 py-1 rounded-r-xl border-l border-white/10 text-xs cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none ${
              showNudgePicker
                ? "bg-bw-amber/15 text-bw-amber"
                : "text-bw-muted hover:text-bw-amber hover:bg-bw-amber/10"
            }`}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Projeter */}
        {onHighlight && (
          <button
            onClick={handleToggleHighlight}
            aria-label={isHighlighted ? "Retirer la mise en avant" : "Mettre en avant"}
            aria-pressed={isHighlighted}
            className={`btn-glow flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-medium cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none ${
              isHighlighted
                ? "bg-bw-primary/15 text-bw-primary"
                : "text-bw-muted hover:text-bw-primary hover:bg-bw-primary/10"
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill={isHighlighted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {isHighlighted ? "Projeté" : "Projeter"}
          </button>
        )}

        {/* Noter (score) */}
        <button
          onClick={() => setShowScorePicker(!showScorePicker)}
          aria-label={localScore > 0 ? `Note actuelle : ${localScore} sur 5` : "Noter"}
          aria-expanded={showScorePicker}
          className={`btn-glow flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-medium cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none ${
            localScore > 0 || showScorePicker
              ? "bg-bw-green/15 text-bw-green"
              : "text-bw-muted hover:text-bw-green hover:bg-bw-green/10"
          }`}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill={localScore > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {localScore > 0 ? `${localScore}/5` : "Noter"}
        </button>

        {/* Signaler (warn) */}
        <button
          onClick={handleWarn}
          disabled={isWarnPending}
          aria-label={`Signaler l'élève — ${warnings} sur 3 avertissements`}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors text-bw-muted hover:text-bw-danger hover:bg-bw-danger/10 disabled:opacity-40 ml-auto focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none"
          title={`Signaler — ${warnings}/3 avertissement${warnings > 1 ? "s" : ""}`}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
          {warnings > 0 && (
            <span className={`text-xs font-bold ${warnings >= 2 ? "text-bw-danger" : "text-bw-amber"}`}>
              {warnings}/3
            </span>
          )}
        </button>
      </div>

      {/* Nudge picker — preset messages + custom */}
      <AnimatePresence>
        {showNudgePicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-bw-surface border border-bw-amber/20 rounded-xl p-2.5 space-y-2">
              <span className="text-xs text-bw-amber font-medium uppercase tracking-wider">
                Message pour {studentName}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {NUDGE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setLastNudge(preset);
                      onBroadcast(`${studentName} : ${preset.text}`);
                      setShowNudgePicker(false);
                    }}
                    aria-label={`Envoyer : ${preset.text}`}
                    className="px-2.5 py-1.5 bg-bw-bg border border-black/[0.04] rounded-xl text-xs text-bw-text hover:border-bw-amber/30 hover:text-bw-amber cursor-pointer transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <Input
                  type="text"
                  value={customNudge}
                  onChange={(e) => setCustomNudge(e.target.value)}
                  placeholder="Message perso..."
                  className="flex-1 h-auto bg-bw-bg border-white/10 text-xs text-bw-heading placeholder:text-bw-muted focus:border-bw-amber px-2 py-1.5"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customNudge.trim()) {
                      onBroadcast(`${studentName} : ${customNudge.trim()}`);
                      setCustomNudge("");
                      setShowNudgePicker(false);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (customNudge.trim()) {
                      onBroadcast(`${studentName} : ${customNudge.trim()}`);
                      setCustomNudge("");
                      setShowNudgePicker(false);
                    }
                  }}
                  disabled={!customNudge.trim()}
                  aria-label="Envoyer le message personnalisé"
                  className="px-3 py-1.5 rounded-xl bg-bw-amber text-black text-xs font-semibold cursor-pointer hover:brightness-110 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none"
                >
                  Envoyer
                </button>
              </div>
              <button
                onClick={() => setShowNudgePicker(false)}
                aria-label="Annuler la relance"
                className="w-full py-1 text-xs text-bw-muted hover:text-bw-text cursor-pointer focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score picker — 1-5 stars */}
      <AnimatePresence>
        {showScorePicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-bw-surface border border-bw-green/20 rounded-xl p-2.5 space-y-2">
              <span className="text-xs text-bw-green font-medium uppercase tracking-wider">
                Note qualite
              </span>
              <div className="flex items-center gap-1" role="radiogroup" aria-label="Note de 1 à 5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    role="radio"
                    aria-checked={localScore === star}
                    aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
                    onMouseEnter={() => setHoverStar(star)}
                    onMouseLeave={() => setHoverStar(0)}
                    onFocus={() => setHoverStar(star)}
                    onBlur={() => setHoverStar(0)}
                    onClick={() => {
                      const newScore = star === localScore ? 0 : star;
                      setLocalScore(newScore);
                      if (newScore > 0) onBroadcast(`${studentName} : Note ${newScore}/5 ⭐`);
                      setShowScorePicker(false);
                      setHoverStar(0);
                    }}
                    className="p-1 cursor-pointer transition-transform hover:scale-125 focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none focus-visible:rounded-sm"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill={(hoverStar || localScore) >= star ? "#10B981" : "none"}
                      stroke="#10B981"
                      strokeWidth="1.5"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                ))}
                <span className="ml-2 text-xs text-bw-muted">
                  {(hoverStar || localScore) > 0
                    ? ["", "Faible", "Moyen", "Bien", "Tres bien", "Excellent"][hoverStar || localScore]
                    : "Cliquer pour noter"}
                </span>
              </div>
              <button
                onClick={() => { setShowScorePicker(false); setHoverStar(0); }}
                aria-label="Fermer le sélecteur de note"
                className="w-full py-1 text-xs text-bw-muted hover:text-bw-text cursor-pointer focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment input — slides open inline */}
      <AnimatePresence>
        {isCommenting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-bw-surface border border-bw-teal/20 rounded-xl p-2.5 space-y-2">
              <span className="text-xs text-bw-teal font-medium uppercase tracking-wider">
                Commentaire pour {studentName}
              </span>
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Bien vu ! Creuse cette idée..."
                rows={2}
                autoFocus
                className="bg-bw-bg border-white/10 text-xs text-bw-heading placeholder:text-bw-muted focus:border-bw-teal resize-none min-h-0 p-2"
              />
              <div className="flex gap-1.5">
                <button onClick={() => { setIsCommenting(false); setCommentText(""); }}
                  aria-label="Annuler le commentaire"
                  className="flex-1 py-1.5 rounded-xl bg-bw-bg text-bw-muted text-xs font-medium cursor-pointer border border-black/[0.04] focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none">
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (commentText.trim()) {
                      onBroadcast(`💬 ${studentName} : ${commentText.trim()}`);
                      setSavedComment(commentText.trim());
                      setIsCommenting(false);
                      setCommentText("");
                    }
                  }}
                  disabled={!commentText.trim()}
                  aria-label="Envoyer le commentaire"
                  className="flex-1 py-1.5 rounded-xl bg-bw-teal text-black text-xs font-semibold cursor-pointer hover:brightness-110 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none">
                  Envoyer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved comment display */}
      {savedComment && !isCommenting && (
        <div className="mt-1.5 flex items-start gap-1.5 bg-bw-teal/5 rounded-xl px-2.5 py-1.5 border border-bw-teal/10">
          <span className="text-xs text-bw-teal flex-shrink-0 mt-0.5">Prof:</span>
          <span className="text-xs text-bw-teal/80 leading-snug flex-1">{savedComment}</span>
          <button onClick={() => setSavedComment(null)} className="text-bw-muted hover:text-bw-danger text-xs cursor-pointer">✕</button>
        </div>
      )}
    </div>
  );
}

export const GenericInlineActions = memo(GenericInlineActionsInner);
