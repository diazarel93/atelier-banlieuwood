"use client";

import { motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { useCallback, useState } from "react";
import { InlineActions, TeacherCommentBadge } from "./response-actions";

export interface ResponseCardResponse {
  id: string;
  student_id: string;
  text: string;
  submitted_at: string;
  is_hidden: boolean;
  is_vote_option: boolean;
  is_highlighted?: boolean;
  teacher_comment?: string | null;
  teacher_score?: number;
  ai_score?: number;
  ai_feedback?: string | null;
  reset_at?: string | null;
  previous_text?: string | null;
  students: { display_name: string; avatar: string };
}

type CardState = "default" | "selected" | "hidden" | "winner";

interface ResponseCardProps {
  response: ResponseCardResponse;
  state: CardState;
  sessionStatus: string;
  onSelect: () => void;
  onHide: () => void;
  onValidate?: () => void;
  isPending?: boolean;
  // Teacher interaction callbacks
  onComment?: (responseId: string, comment: string | null) => void;
  onHighlight?: (responseId: string, highlighted: boolean) => void;
  onNudge?: (responseId: string, nudgeText: string) => void;
  onWarn?: (studentId: string) => void;
  onScore?: (responseId: string, score: number) => void;
  onReset?: (responseId: string) => void;
  isNudgePending?: boolean;
  isCommentPending?: boolean;
  isWarnPending?: boolean;
  isScorePending?: boolean;
  isResetPending?: boolean;
  warnings?: number;
}

function relativeTime(iso: string): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diff < 10) return "à l'instant";
  if (diff < 60) return `il y a ${diff}s`;
  const mins = Math.floor(diff / 60);
  return `il y a ${mins}min`;
}

export function ResponseCard({
  response,
  state,
  sessionStatus,
  onSelect,
  onHide,
  onValidate,
  isPending,
  onComment,
  onHighlight,
  onNudge,
  onWarn,
  onScore,
  onReset,
  isNudgePending,
  isCommentPending,
  isWarnPending,
  isScorePending,
  isResetPending,
  warnings,
}: ResponseCardProps) {
  const [swiped, setSwiped] = useState<"left" | "right" | null>(null);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-120, 0, 120], [0.5, 1, 0.5]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (Math.abs(info.offset.x) < 60) return;
      if (info.offset.x < -60) {
        setSwiped("left");
        onHide();
      } else if (info.offset.x > 60) {
        setSwiped("right");
        onSelect();
      }
      setTimeout(() => setSwiped(null), 300);
    },
    [onHide, onSelect]
  );

  const borderColor =
    response.is_highlighted
      ? "#FF6B35"
      : state === "selected"
        ? "#FF6B35"
        : state === "winner"
          ? "#4ECDC4"
          : "rgba(255,255,255,0.05)";

  const hasInteractions = !!(onComment && onHighlight && onNudge && onWarn && onScore);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        borderColor,
        x,
        opacity: state === "hidden" ? 0.3 : undefined,
        background: state === "winner"
          ? "linear-gradient(135deg, rgba(78,205,196,0.08), rgba(18,20,24,0.95))"
          : response.is_highlighted
            ? "linear-gradient(135deg, rgba(255,107,53,0.06), rgba(18,20,24,0.95))"
            : "linear-gradient(135deg, rgba(26,29,34,0.6), rgba(18,20,24,0.95))"
      }}
      drag={sessionStatus === "responding" && !response.reset_at ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      className={`glass-surface rounded-xl p-3 transition-colors ${
        state === "winner" ? "shadow-[0_0_16px_rgba(78,205,196,0.2)]" : ""
      } ${response.is_highlighted ? "shadow-[0_0_12px_rgba(255,107,53,0.15)]" : ""}
      ${swiped === "left" ? "border-red-500/40" : swiped === "right" ? "border-bw-primary/40" : ""}
      ${response.reset_at ? "opacity-50" : ""}`}
    >
      {/* Header: avatar + name + time + status buttons */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{response.students?.avatar}</span>
            <span className={`text-sm font-medium ${state === "hidden" ? "line-through text-bw-muted" : ""}`}>
              {response.students?.display_name}
            </span>
            <span className="text-[10px] text-bw-muted">{relativeTime(response.submitted_at)}</span>
            {response.reset_at && (
              <span className="text-[9px] px-1.5 py-px rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/20">relancé</span>
            )}
          </div>
          <p className={`text-sm leading-relaxed ${state === "hidden" ? "line-through text-bw-muted" : response.reset_at ? "line-through text-bw-muted" : "text-bw-text"}`}>
            {response.text}
          </p>
          {response.teacher_comment && (
            <TeacherCommentBadge comment={response.teacher_comment} />
          )}
          {/* Score badges */}
          {((response.teacher_score && response.teacher_score > 0) || (response.ai_score && response.ai_score > 0)) && (
            <div className="mt-1.5 flex items-center gap-2">
              {response.teacher_score !== undefined && response.teacher_score > 0 && (
                <div className="flex items-center gap-1 bg-bw-green/10 rounded px-2 py-0.5 border border-bw-green/20">
                  <span className="text-[10px] text-bw-green">Prof</span>
                  <span className="text-[10px] font-bold text-bw-green">{response.teacher_score}/5</span>
                </div>
              )}
              {response.ai_score !== undefined && response.ai_score > 0 && (
                <div className="flex items-center gap-1 bg-bw-violet/10 rounded px-2 py-0.5 border border-bw-violet/20" title={response.ai_feedback || undefined}>
                  <span className="text-[10px] text-bw-violet">IA</span>
                  <span className="text-[10px] font-bold text-bw-violet">{response.ai_score}/5</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status buttons (select/hide/validate) */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {sessionStatus === "responding" && !response.is_hidden && (
            <button
              onClick={onSelect}
              disabled={isPending}
              className={`px-2.5 py-1.5 text-xs rounded-xl cursor-pointer transition-all duration-200 font-medium ${
                state === "selected"
                  ? "bg-bw-primary/20 text-bw-primary border border-bw-primary/30 shadow-[0_0_8px_rgba(255,107,53,0.15)]"
                  : "hover:bg-bw-primary/10 hover:text-bw-primary text-bw-muted border border-transparent"
              }`}
            >
              {state === "selected" ? "Au vote" : "Sélect."}
            </button>
          )}
          {sessionStatus === "responding" && (
            <button
              onClick={onHide}
              disabled={isPending}
              className="px-2 py-1.5 text-xs rounded-xl hover:bg-white/5 cursor-pointer transition-colors duration-200 text-bw-muted"
            >
              {state === "hidden" ? "Montrer" : "Masquer"}
            </button>
          )}
          {sessionStatus === "responding" && onReset && !response.is_hidden && !response.reset_at && (
            <button
              onClick={() => onReset(response.id)}
              disabled={isResetPending}
              className="px-2 py-1.5 text-xs rounded-xl hover:bg-amber-400/10 cursor-pointer transition-colors duration-200 text-amber-400/70 hover:text-amber-400"
              title="Relancer la question pour cet élève"
            >
              🔄
            </button>
          )}
          {sessionStatus === "reviewing" && !response.is_hidden && onValidate && (
            <button
              onClick={onValidate}
              className="btn-glow px-3 py-1.5 text-xs bg-bw-primary/10 text-bw-primary rounded-xl hover:bg-bw-primary/20 cursor-pointer transition-colors duration-200"
            >
              Valider
            </button>
          )}
        </div>
      </div>

      {/* Inline teacher actions — directly in the card */}
      {hasInteractions && !response.is_hidden && (
        <InlineActions
          responseId={response.id}
          studentId={response.student_id}
          studentName={response.students?.display_name || ""}
          isHighlighted={response.is_highlighted || false}
          teacherComment={response.teacher_comment || null}
          isCommenting={isCommenting}
          commentText={commentText}
          onComment={(id, comment) => {
            onComment!(id, comment);
            setIsCommenting(false);
            setCommentText("");
          }}
          onHighlight={onHighlight!}
          onNudge={onNudge!}
          onWarn={onWarn!}
          onScore={onScore!}
          onStartComment={() => { setIsCommenting(true); setCommentText(response.teacher_comment || ""); }}
          onCancelComment={() => { setIsCommenting(false); setCommentText(""); }}
          onChangeComment={setCommentText}
          isNudgePending={isNudgePending}
          isCommentPending={isCommentPending}
          isWarnPending={isWarnPending}
          isScorePending={isScorePending}
          warnings={warnings}
          teacherScore={response.teacher_score || 0}
        />
      )}
    </motion.div>
  );
}
