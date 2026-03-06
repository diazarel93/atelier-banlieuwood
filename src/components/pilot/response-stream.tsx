"use client";

import { AnimatePresence } from "motion/react";
import { ResponseCard, type ResponseCardResponse } from "./response-card";

interface ResponseStreamProps {
  responses: ResponseCardResponse[];
  sessionStatus: string;
  winnerResponseId?: string;
  onToggleSelect: (responseId: string, current: boolean) => void;
  onToggleHide: (responseId: string, current: boolean) => void;
  onValidate?: (response: ResponseCardResponse) => void;
  isPending?: boolean;
  // Teacher interaction callbacks
  onComment?: (responseId: string, comment: string | null) => void;
  onHighlight?: (responseId: string, highlighted: boolean) => void;
  onNudge?: (responseId: string, nudgeText: string) => void;
  onWarn?: (studentId: string) => void;
  onScore?: (responseId: string, score: number) => void;
  onReset?: (responseId: string) => void;
  onSpotlight?: (response: ResponseCardResponse) => void;
  isNudgePending?: boolean;
  isCommentPending?: boolean;
  isWarnPending?: boolean;
  isScorePending?: boolean;
  isResetPending?: boolean;
  studentWarnings?: Record<string, number>;
}

export function ResponseStream({
  responses,
  sessionStatus,
  winnerResponseId,
  onToggleSelect,
  onToggleHide,
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
  studentWarnings,
}: ResponseStreamProps) {
  // Pin selected responses at top
  const selected = responses.filter((r) => r.is_vote_option && !r.is_hidden);
  const rest = responses.filter((r) => !(r.is_vote_option && !r.is_hidden));

  const renderCard = (r: ResponseCardResponse) => {
    let state: "default" | "selected" | "hidden" | "winner" = "default";
    if (r.id === winnerResponseId) state = "winner";
    else if (r.is_hidden) state = "hidden";
    else if (r.is_vote_option) state = "selected";

    return (
      <ResponseCard
        key={r.id}
        response={r}
        state={state}
        sessionStatus={sessionStatus}
        onSelect={() => onToggleSelect(r.id, r.is_vote_option)}
        onHide={() => onToggleHide(r.id, r.is_hidden)}
        onValidate={onValidate ? () => onValidate(r) : undefined}
        isPending={isPending}
        onComment={onComment}
        onHighlight={onHighlight}
        onNudge={onNudge}
        onWarn={onWarn}
        onScore={onScore}
        onReset={onReset}
        onSpotlight={onSpotlight ? () => onSpotlight(r) : undefined}
        isNudgePending={isNudgePending}
        isCommentPending={isCommentPending}
        isWarnPending={isWarnPending}
        isScorePending={isScorePending}
        isResetPending={isResetPending}
        warnings={studentWarnings?.[r.student_id] || 0}
      />
    );
  };

  if (responses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-bw-muted text-sm">
          {sessionStatus === "responding"
            ? "Les réponses arrivent..."
            : "Ouvrez les réponses pour commencer."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {/* Selected pinned at top */}
        {selected.length > 0 && sessionStatus === "responding" && (
          <>
            {selected.map(renderCard)}
            {rest.length > 0 && (
              <div className="border-t border-white/5 my-2" />
            )}
          </>
        )}
        {/* Rest of responses */}
        {sessionStatus === "responding" ? rest.map(renderCard) : responses.map(renderCard)}
      </AnimatePresence>
    </div>
  );
}
