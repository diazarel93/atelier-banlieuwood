"use client";

import { useState, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ResponseCard, type ResponseCardResponse } from "./response-card";
import { useCockpit } from "./cockpit-context";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.15, ease: "easeIn" as const },
  },
};

const PAGE_SIZE = 20;

interface ResponseStreamProps {
  responses: ResponseCardResponse[];
  winnerResponseId?: string;
  onValidate?: (response: ResponseCardResponse) => void;
  onSpotlight?: (response: ResponseCardResponse) => void;
}

export function ResponseStream({ responses, winnerResponseId, onValidate, onSpotlight }: ResponseStreamProps) {
  // ── Mutations from context (no more prop drilling) ──
  const {
    session,
    studentWarnings,
    toggleVoteOption,
    toggleHide,
    commentResponse,
    highlightResponse,
    nudgeStudent,
    warnStudent,
    scoreResponse,
    resetResponse,
  } = useCockpit();

  const sessionStatus = session.status;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Pin selected responses at top
  const selected = useMemo(() => responses.filter((r) => r.is_vote_option && !r.is_hidden), [responses]);
  const rest = useMemo(() => responses.filter((r) => !(r.is_vote_option && !r.is_hidden)), [responses]);

  // Paginate the "rest" list (selected are always shown)
  const displayedRest = useMemo(() => rest.slice(0, visibleCount), [rest, visibleCount]);
  const displayedAll = useMemo(() => responses.slice(0, visibleCount), [responses, visibleCount]);
  const hasMore = sessionStatus === "responding" ? rest.length > visibleCount : responses.length > visibleCount;
  const remaining = sessionStatus === "responding" ? rest.length - visibleCount : responses.length - visibleCount;

  const showMore = useCallback(() => setVisibleCount((v) => v + PAGE_SIZE), []);

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
        onSelect={() => toggleVoteOption.mutate({ responseId: r.id, is_vote_option: !r.is_vote_option })}
        onHide={() => toggleHide.mutate({ responseId: r.id, is_hidden: !r.is_hidden })}
        onValidate={onValidate ? () => onValidate(r) : undefined}
        isPending={toggleVoteOption.isPending || toggleHide.isPending}
        onComment={(id, comment) => commentResponse.mutate({ responseId: id, comment })}
        onHighlight={(id, highlighted) => highlightResponse.mutate({ responseId: id, highlighted })}
        onNudge={(id, text) => nudgeStudent.mutate({ responseId: id, nudgeText: text })}
        onWarn={(sid) => warnStudent.mutate(sid)}
        onScore={(id, score) => scoreResponse.mutate({ responseId: id, score })}
        onReset={(id) => resetResponse.mutate(id)}
        onSpotlight={onSpotlight ? () => onSpotlight(r) : undefined}
        isNudgePending={nudgeStudent.isPending}
        isCommentPending={commentResponse.isPending}
        isWarnPending={warnStudent.isPending}
        isScorePending={scoreResponse.isPending}
        isResetPending={resetResponse.isPending}
        warnings={studentWarnings[r.student_id] || 0}
      />
    );
  };

  if (responses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-bw-muted text-sm">
          {sessionStatus === "responding" ? "Les réponses arrivent..." : "Ouvrez les réponses pour commencer."}
        </p>
      </div>
    );
  }

  const renderCardWithMotion = (r: ResponseCardResponse) => (
    <motion.div key={r.id} variants={itemVariants} layout>
      {renderCard(r)}
    </motion.div>
  );

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
          {/* Selected pinned at top */}
          {selected.length > 0 && sessionStatus === "responding" && (
            <>
              {selected.map(renderCardWithMotion)}
              {rest.length > 0 && <div className="border-t border-bw-border my-2" />}
            </>
          )}
          {/* Rest of responses (paginated) */}
          {sessionStatus === "responding"
            ? displayedRest.map(renderCardWithMotion)
            : displayedAll.map(renderCardWithMotion)}
        </motion.div>
      </AnimatePresence>

      {/* Show more button */}
      {hasMore && (
        <button
          onClick={showMore}
          className="w-full py-2 rounded-xl text-xs font-medium text-bw-muted hover:text-bw-text bg-bw-elevated border border-black/[0.06] hover:bg-black/[0.03] cursor-pointer transition-colors"
        >
          Voir {Math.min(remaining, PAGE_SIZE)} de plus ({remaining} restantes)
        </button>
      )}
    </div>
  );
}
