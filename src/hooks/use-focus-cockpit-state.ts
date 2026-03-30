"use client";

/**
 * Focus Cockpit State — Composition of domain-specific hooks.
 *
 * Split into 4 sub-hooks (Cockpit V3 Chantier 8):
 * - use-cockpit-preview.ts — navigation, situations, auto-advance
 * - use-cockpit-responses.ts — filter, sort, highlight, reformulate
 * - use-cockpit-broadcast.ts — broadcast messages, nudge
 * - use-cockpit-module-state.ts — module data extraction, labels, question text
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useCockpitData, useCockpitActions } from "@/components/pilot/cockpit-context";
import { useCockpitModals } from "@/hooks/use-cockpit-modals";
import { useCockpitModuleFlags } from "@/hooks/use-cockpit-module-flags";
import { useCockpitDarkMode } from "@/hooks/use-cockpit-dark-mode";
import { useCockpitPreview } from "@/hooks/use-cockpit-preview";
import { useCockpitResponses } from "@/hooks/use-cockpit-responses";
import { useCockpitBroadcast } from "@/hooks/use-cockpit-broadcast";
import { useCockpitModuleState } from "@/hooks/use-cockpit-module-state";
import { getNextAction } from "@/lib/cockpit-next-action";
import { useSound } from "@/hooks/use-sound";
import { useStuckDetection } from "@/hooks/use-stuck-detection";
import { STUCK_DETECTION_DELAY_MS } from "@/components/pilot/pilot-settings";

export function useFocusCockpitState() {
  const { session, sessionId, responses, activeStudents, voteData, situationData, teams } = useCockpitData();
  const {
    updateSession,
    toggleHide: _toggleHide,
    toggleVoteOption,
    highlightResponse,
    onModuleComplete,
  } = useCockpitActions();
  const modals = useCockpitModals();
  const moduleFlags = useCockpitModuleFlags(session);
  const { isDarkMode, setIsDarkMode } = useCockpitDarkMode();
  const { play } = useSound();

  // ── Sub-hooks ──
  const moduleState = useCockpitModuleState(
    session,
    situationData,
    responses,
    (situationData as { situation?: { prompt?: string; restitutionLabel?: string; category?: string } })?.situation,
    moduleFlags,
  );

  const preview = useCockpitPreview(
    session,
    moduleFlags.canGoNext as boolean,
    moduleFlags.maxSituations as number,
    false, // allResponded — set below
    updateSession,
  );

  const responseState = useCockpitResponses(responses, highlightResponse);

  const broadcast = useCockpitBroadcast(updateSession, () => modals.setShowBroadcast(false));

  // ── Derived data ──
  const situation = (
    situationData as {
      situation?: {
        id: string;
        position: number;
        category: string;
        restitutionLabel: string;
        prompt: string;
        nudgeText: string | null;
      };
    }
  )?.situation;
  const visibleResponses = responses.filter((r) => !r.is_hidden);
  const voteOptionCount = responses.filter((r) => r.is_vote_option && !r.is_hidden).length;
  const currentQIndex = session.current_situation_index || 0;
  const respondedCount = responses.length;

  const nextAction = getNextAction(
    session.status,
    visibleResponses.length,
    voteOptionCount,
    !!(voteData && voteData.totalVotes > 0),
    session.current_module,
    moduleState.budgetSubmitted,
    moduleFlags.canGoNext as boolean,
    session.current_seance || 1,
    session.current_situation_index || 0,
    session.reveal_phase,
  );

  // ── Responded tracking ──
  const respondedStudentIds = useMemo(() => {
    const ids = new Set(responses.map((r) => r.student_id));
    for (const id of moduleState.moduleSubmittedIds) ids.add(id);
    return ids;
  }, [responses, moduleState.moduleSubmittedIds]);

  const activeStudentIds = useMemo(
    () => new Set((session.students || []).filter((s) => s.is_active).map((s) => s.id)),
    [session.students],
  );

  // ── Stuck detection ──
  const [respondingOpenedAt, setRespondingOpenedAt] = useState<number | null>(null);
  const [allResponded, setAllResponded] = useState(false);
  const allRespondedNotified = useRef(false);
  const prevResponseCountRef = useRef(0);

  const stuckLevels = useStuckDetection({
    respondedStudentIds,
    activeStudentIds,
    respondingOpenedAt: session.status === "responding" ? respondingOpenedAt : null,
  });

  const stuckStudents = useMemo(() => {
    if (session.status !== "responding" || !respondingOpenedAt) return [];
    const elapsed = Date.now() - respondingOpenedAt;
    if (elapsed < STUCK_DETECTION_DELAY_MS) return [];
    return activeStudents
      .filter((s) => !respondedStudentIds.has(s.id))
      .map((s) => ({ id: s.id, name: s.display_name, avatar: s.avatar }));
  }, [session.status, respondingOpenedAt, respondedStudentIds, activeStudents]);

  const notRespondedStudents = useMemo(() => {
    if (session.status !== "responding") return [];
    const ids = new Set(responses.map((r) => r.student_id));
    moduleState.moduleSubmittedIds.forEach((id) => ids.add(id));
    return activeStudents.filter((s) => !ids.has(s.id));
  }, [session.status, responses, activeStudents, moduleState.moduleSubmittedIds]);

  // ── Effects: responding state ──
  useEffect(() => {
    if (session.status === "responding") {
      setRespondingOpenedAt((prev) => prev ?? Date.now());
    } else {
      setRespondingOpenedAt(null);
      allRespondedNotified.current = false;
      setAllResponded(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status]);

  // All responded notification
  useEffect(() => {
    if (session.status !== "responding" || activeStudents.length === 0) return;
    if (responses.length >= activeStudents.length && !allRespondedNotified.current) {
      allRespondedNotified.current = true;
      setAllResponded(true);
      play("success");
      toast.success("Tout le monde a répondu !", { icon: "🎉" });
    }
  }, [responses.length, activeStudents.length, session.status, play]);

  // New response toast
  useEffect(() => {
    if (session.status !== "responding") {
      prevResponseCountRef.current = responses.length;
      return;
    }
    const prev = prevResponseCountRef.current;
    const curr = responses.length;
    if (curr > prev && prev > 0) {
      const newest = responses[responses.length - 1];
      const studentName = session.students?.find((s) => s.id === newest?.student_id)?.display_name;
      if (studentName) {
        toast(`${studentName} a répondu`, { icon: "✏️", duration: 2000, style: { fontSize: 13, padding: "8px 14px" } });
      }
    }
    prevResponseCountRef.current = curr;
  }, [responses.length, responses, session.status, session.students]);

  // ── Action handlers ──
  function handleNextAction() {
    if (!nextAction || !nextAction.action || nextAction.disabled) return;
    if (nextAction.action === "reveal-next") {
      const currentPhase = session.reveal_phase ?? 0;
      updateSession.mutate({ reveal_phase: currentPhase + 1 });
      return;
    }
    if (nextAction.action === "next") {
      if (moduleFlags.canGoNext) preview.nextSituation();
      else onModuleComplete();
    } else if (nextAction.action === "done-module") {
      onModuleComplete();
    } else {
      updateSession.mutate({ status: nextAction.action, timer_ends_at: null });
    }
  }

  function handleSelectionBarAction() {
    if (session.status === "responding") {
      if (voteOptionCount >= 2) updateSession.mutate({ status: "voting", timer_ends_at: null });
    } else if (session.status === "voting") {
      if (voteData && voteData.totalVotes > 0) updateSession.mutate({ status: "reviewing", timer_ends_at: null });
    } else if (session.status === "reviewing") {
      if (moduleFlags.canGoNext) preview.nextSituation();
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

  const [plusOpen, setPlusOpen] = useState(false);
  const [showStudentSheet, setShowStudentSheet] = useState(false);

  const winnerResponseId = (session.status === "reviewing" && voteData?.results?.[0]?.response?.id) || undefined;

  return {
    // Session data
    session,
    sessionId,
    responses,
    activeStudents,
    voteData,
    situationData,
    teams,

    // Computed
    situation,
    visibleResponses,
    voteOptionCount,
    currentQIndex,
    respondedCount,
    nextAction,
    moduleFlags,
    stuckStudents,
    notRespondedStudents,
    respondedStudentIds,
    stuckLevels,
    winnerResponseId,
    allResponded,
    respondingOpenedAt,

    // Sub-hook: module state
    ...moduleState,

    // Sub-hook: preview/navigation
    ...preview,

    // Sub-hook: responses
    filteredResponses: responseState.filteredResponses,
    responseFilter: responseState.responseFilter,
    setResponseFilter: responseState.setResponseFilter,
    responseSortMode: responseState.responseSortMode,
    setResponseSortMode: responseState.setResponseSortMode,
    selectedResponseIds: responseState.selectedResponseIds,
    setSelectedResponseIds: responseState.setSelectedResponseIds,
    reformulating: responseState.reformulating,
    setReformulating: responseState.setReformulating,
    handleHighlightAllVisible: responseState.handleHighlightAllVisible,
    handleClearAllHighlights: responseState.handleClearAllHighlights,
    handleHighlightBoth: responseState.handleHighlightBoth,

    // Sub-hook: broadcast
    broadcastHistory: broadcast.broadcastHistory,
    handleBroadcast: broadcast.handleBroadcast,
    handleNudgeAllStuck: () => broadcast.handleNudgeAllStuck(notRespondedStudents.length),

    // Local state
    plusOpen,
    setPlusOpen,
    showStudentSheet,
    setShowStudentSheet,
    isDarkMode,
    setIsDarkMode,

    // Modals
    modals,

    // Handlers
    handleNextAction,
    handleSelectionBarAction,
    handleQuickVote,
  };
}
