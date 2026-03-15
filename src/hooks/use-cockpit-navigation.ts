"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useCockpit } from "@/components/pilot/cockpit-context";
import { useCockpitModuleFlags } from "@/hooks/use-cockpit-module-flags";
import { getNextAction, type NextAction } from "@/lib/cockpit-next-action";

/**
 * Navigation: goToSituation, next/prev/skip, auto-advance, preview mode.
 * Extracted from CockpitContent for clarity.
 */
export function useCockpitNavigation({
  allResponded,
  respondingOpenedAt,
  setRespondingOpenedAt,
}: {
  allResponded: boolean;
  respondingOpenedAt: number | null;
  setRespondingOpenedAt: (v: number | null) => void;
}) {
  const { session, responses, voteData, updateSession, toggleVoteOption, onModuleComplete } = useCockpit();

  const visibleResponses = responses.filter((r) => !r.is_hidden);
  const voteOptionCount = responses.filter((r) => r.is_vote_option && !r.is_hidden).length;

  const {
    canGoNext,
    maxSituations,
    isBudgetQuiz,
  } = useCockpitModuleFlags(session);

  const budgetStats = (session as unknown as Record<string, unknown>)?.budgetStats as { submittedCount: number } | undefined;
  const budgetSubmitted = budgetStats?.submittedCount || 0;

  const nextAction = getNextAction(
    session.status,
    visibleResponses.length,
    voteOptionCount,
    !!(voteData && voteData.totalVotes > 0),
    session.current_module,
    budgetSubmitted,
    canGoNext,
    session.current_seance || 1,
    session.current_situation_index || 0,
    session.reveal_phase
  );

  // ── Preview state ──
  const currentQIndex = session.current_situation_index || 0;
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const isPreviewing = previewIndex !== null && previewIndex !== currentQIndex;
  const displayIndex = previewIndex ?? currentQIndex;

  // Reset preview when session index changes
  useEffect(() => {
    if (previewIndex !== null && previewIndex === currentQIndex) {
      setPreviewIndex(null);
    }
  }, [currentQIndex, previewIndex]);

  // ── Track responding opened at ──
  useEffect(() => {
    if (session.status === "responding") {
      setRespondingOpenedAt(respondingOpenedAt ?? Date.now());
    } else {
      setRespondingOpenedAt(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status]);

  // ── Auto-advance ──
  const [autoAdvance, setAutoAdvance] = useState(false);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(0);

  function goToSituation(index: number) {
    setPreviewIndex(null);
    updateSession.mutate({
      current_situation_index: index,
      status: "responding",
      timer_ends_at: null,
      reveal_phase: null,
    });
  }

  function previewSituation(index: number) {
    if (index === currentQIndex) setPreviewIndex(null);
    else setPreviewIndex(index);
  }

  function previewNext() {
    const idx = previewIndex ?? currentQIndex;
    if (idx < maxSituations - 1) setPreviewIndex(idx + 1);
  }

  function previewPrev() {
    const idx = previewIndex ?? currentQIndex;
    if (idx > 0) setPreviewIndex(idx - 1);
  }

  function nextSituation() {
    if (!canGoNext) return;
    goToSituation(session.current_situation_index + 1);
  }

  function skipSituation() {
    if (!canGoNext) return;
    goToSituation(session.current_situation_index + 1);
    toast("Question passée");
  }

  function prevSituation() {
    const idx = session.current_situation_index || 0;
    if (idx <= 0) return;
    goToSituation(idx - 1);
    toast("Retour à la question précédente");
  }

  const handleNextAction = useCallback(() => {
    if (!nextAction || !nextAction.action || (nextAction as { disabled?: boolean }).disabled) return;
    if (nextAction.action === "reveal-next") {
      const currentPhase = session.reveal_phase ?? 0;
      updateSession.mutate({ reveal_phase: currentPhase + 1 });
      return;
    }
    if (nextAction.action === "next") {
      if (canGoNext) nextSituation();
      else onModuleComplete();
    } else if (nextAction.action === "done-module") {
      onModuleComplete();
    } else {
      updateSession.mutate({ status: nextAction.action, timer_ends_at: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextAction, canGoNext, updateSession, session.reveal_phase]);

  function handleSelectionBarAction() {
    if (session.status === "responding") {
      if (voteOptionCount >= 2) updateSession.mutate({ status: "voting", timer_ends_at: null });
    } else if (session.status === "voting") {
      if (voteData && voteData.totalVotes > 0) updateSession.mutate({ status: "reviewing", timer_ends_at: null });
    } else if (session.status === "reviewing") {
      if (canGoNext) nextSituation();
      else onModuleComplete();
    }
  }

  function handleQuickVote() {
    const visible = responses.filter((r) => !r.is_hidden && !r.is_vote_option);
    const sorted = [...visible].sort((a, b) => (b.text?.length || 0) - (a.text?.length || 0));
    const top2 = sorted.slice(0, 2);
    if (top2.length < 2) return;
    for (const r of top2) toggleVoteOption.mutate({ responseId: r.id, is_vote_option: true });
    setTimeout(() => updateSession.mutate({ status: "voting", timer_ends_at: null }), 150);
  }

  // ── Auto-advance timer ──
  useEffect(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setAutoAdvanceCountdown(0);
    if (!autoAdvance || !allResponded || session.status !== "responding") return;

    let remaining = 4;
    setAutoAdvanceCountdown(remaining);
    const countdownInterval = setInterval(() => {
      remaining -= 1;
      setAutoAdvanceCountdown(remaining);
      if (remaining <= 0) clearInterval(countdownInterval);
    }, 1000);

    autoAdvanceTimerRef.current = setTimeout(() => {
      const idx = session.current_situation_index || 0;
      if (idx < maxSituations - 1) goToSituation(idx + 1);
    }, 4000);

    return () => {
      clearInterval(countdownInterval);
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAdvance, allResponded, session.status]);

  return {
    // Navigation
    goToSituation,
    nextSituation,
    prevSituation,
    skipSituation,
    handleNextAction,
    handleSelectionBarAction,
    handleQuickVote,
    nextAction,
    // Preview
    previewIndex,
    setPreviewIndex,
    previewSituation,
    previewNext,
    previewPrev,
    isPreviewing,
    displayIndex,
    currentQIndex,
    // Auto-advance
    autoAdvance,
    setAutoAdvance,
    autoAdvanceCountdown,
    // Derived
    voteOptionCount,
    visibleResponses,
  };
}
