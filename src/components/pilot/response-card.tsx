"use client";

import { motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { memo, useCallback, useState } from "react";
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
  onSpotlight?: () => void;
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

// NOTE: Parent components should wrap callback props (onSelect, onHide, onComment, onHighlight,
// onNudge, onWarn, onScore, onReset, onValidate) with useCallback to maximize memo effectiveness.
function ResponseCardInner({
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
  onSpotlight,
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
      ? "#F5A45B"
      : state === "selected"
        ? "#6B8CFF"
        : state === "winner"
          ? "#57C4B6"
          : "rgba(255,255,255,0.5)";

  const hasInteractions = !!(onComment && onHighlight && onNudge && onWarn && onScore);

  // "New" response: arrived less than 3 seconds ago
  const isNew = Date.now() - new Date(response.submitted_at).getTime() < 3000;

  // Issue 6 — Cinema card hierarchy classes
  const hierarchyClass = state === "winner"
    ? "poster-card"
    : response.is_highlighted
      ? "cinema-accent"
      : "";

  return (
    <motion.article
      aria-label={`Réponse de ${response.students?.display_name || "élève"}`}
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        boxShadow: isNew
          ? ["0 0 0 0px rgba(255,107,53,0.3)", "0 0 0 6px rgba(255,107,53,0)", "0 2px 8px rgba(61,43,16,0.04)"]
          : state === "winner"
            ? "0 4px 16px rgba(87,196,182,0.15)"
            : response.is_highlighted
              ? "0 4px 16px rgba(245,164,91,0.12)"
              : "0 2px 8px rgba(61,43,16,0.04)",
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 22,
        boxShadow: isNew ? { duration: 0.8, ease: "easeOut" } : undefined,
      }}
      whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(61,43,16,0.10)" }}
      style={{
        borderColor,
        x,
        opacity: state === "hidden" ? 0.15 : undefined,
        filter: state === "hidden" ? "grayscale(1)" : undefined,
        background: state === "winner"
          ? "rgba(240,250,248,0.75)"
          : response.is_highlighted
            ? "rgba(255,248,240,0.75)"
            : "rgba(255,255,255,0.7)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      drag={sessionStatus === "responding" && !response.reset_at ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      className={`rounded-[14px] border p-4 transition-all duration-200 card-paper-hover ${hierarchyClass}
      ${swiped === "left" ? "border-[#EB5757]/40" : swiped === "right" ? "border-[#6B8CFF]/40" : ""}
      ${response.reset_at ? "opacity-50" : ""}`}
    >
      {/* Header: avatar + name + time + status buttons */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-lg">{response.students?.avatar}</span>
            <span className={`text-[14px] font-semibold ${state === "hidden" ? "line-through text-[#B0A99E]" : "text-bw-heading"}`}>
              {response.students?.display_name}
            </span>
            <span className="text-[12px] text-[#B0A99E]">{relativeTime(response.submitted_at)}</span>
            {response.reset_at && (
              <span className="text-xs px-1.5 py-px rounded-full bg-bw-amber/15 text-bw-amber border border-bw-amber/20">relancé</span>
            )}
          </div>
          <p className={`text-[14px] leading-relaxed ${state === "hidden" ? "line-through text-[#B0A99E]" : response.reset_at ? "line-through text-[#B0A99E]" : "text-bw-text"}`}>
            {response.text}
          </p>
          {response.teacher_comment && (
            <TeacherCommentBadge comment={response.teacher_comment} />
          )}
          {/* Score badges */}
          {((response.teacher_score && response.teacher_score > 0) || (response.ai_score && response.ai_score > 0)) && (
            <div className="mt-1.5 flex items-center gap-2">
              {response.teacher_score !== undefined && response.teacher_score > 0 && (
                <div className="flex items-center gap-1 bg-bw-green/10 rounded-lg px-2 py-0.5 border border-bw-green/20">
                  <span className="text-xs text-bw-green">Prof</span>
                  <span className="text-xs font-bold text-bw-green">{response.teacher_score}/5</span>
                </div>
              )}
              {response.ai_score !== undefined && response.ai_score > 0 && (
                <div className="flex items-center gap-1 bg-bw-violet/10 rounded-lg px-2 py-0.5 border border-bw-violet/20">
                  <span className="text-xs text-bw-violet">IA</span>
                  <span className="text-xs font-bold text-bw-violet">{response.ai_score}/5</span>
                </div>
              )}
            </div>
          )}
          {/* AI feedback inline */}
          {response.ai_feedback && (
            <p className="text-xs text-bw-violet leading-snug mt-0.5">{response.ai_feedback}</p>
          )}
        </div>

        {/* Status buttons (select/hide/validate) */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {sessionStatus === "responding" && !response.is_hidden && (
            <button
              onClick={onSelect}
              disabled={isPending}
              aria-label={state === "selected" ? "Retirer du vote" : "Sélectionner pour le vote"}
              aria-pressed={state === "selected"}
              className={`h-7 px-2.5 text-[12px] rounded-[9px] cursor-pointer transition-all duration-200 font-semibold focus-visible:ring-2 focus-visible:ring-[#6B8CFF] focus-visible:outline-none ${
                state === "selected"
                  ? "bg-[#6B8CFF] text-white border border-[#6B8CFF]"
                  : "hover:bg-[#EEF2FF] hover:text-[#6B8CFF] text-[#7A7A7A] border border-[#E8DFD2]"
              }`}
            >
              {state === "selected" ? "Au vote" : "Select."}
            </button>
          )}
          {sessionStatus === "responding" && (
            <button
              onClick={onHide}
              disabled={isPending}
              aria-label={state === "hidden" ? "Montrer la réponse" : "Masquer la réponse"}
              className="h-7 px-2.5 text-[12px] rounded-[9px] hover:bg-[#F7F3EA] hover:text-bw-heading cursor-pointer transition-all duration-200 text-[#B0A99E] border border-[#E8DFD2] font-medium focus-visible:ring-2 focus-visible:ring-[#6B8CFF] focus-visible:outline-none active:scale-95"
            >
              {state === "hidden" ? "Montrer" : "Masquer"}
            </button>
          )}
          {sessionStatus === "responding" && onReset && !response.is_hidden && !response.reset_at && (
            <button
              onClick={() => onReset(response.id)}
              disabled={isResetPending}
              aria-label="Relancer la question pour cet élève"
              className="px-2 py-1.5 text-xs rounded-xl hover:bg-bw-amber/10 cursor-pointer transition-colors duration-200 text-bw-amber/70 hover:text-bw-amber focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none"
              title="Relancer la question pour cet élève"
            >
              🔄
            </button>
          )}
          {onSpotlight && !response.is_hidden && (
            <button
              onClick={onSpotlight}
              aria-label="Projeter cette réponse"
              className="h-7 px-2 text-[12px] rounded-[9px] hover:bg-[#FFF0E0] hover:text-[#F5A45B] cursor-pointer transition-all duration-200 text-[#B0A99E] border border-[#E8DFD2] font-medium focus-visible:ring-2 focus-visible:ring-[#F5A45B] focus-visible:outline-none active:scale-95"
              title="Projeter en grand"
            >
              🔦
            </button>
          )}
          {sessionStatus === "reviewing" && !response.is_hidden && onValidate && (
            <button
              onClick={onValidate}
              aria-label="Valider cette réponse"
              className="btn-glow px-3 py-1.5 text-xs bg-bw-primary/10 text-bw-primary rounded-xl hover:bg-bw-primary/20 cursor-pointer transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none"
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
    </motion.article>
  );
}

export const ResponseCard = memo(ResponseCardInner);
