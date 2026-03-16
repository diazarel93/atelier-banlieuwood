"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useCockpitData, useCockpitActions } from "@/components/pilot/cockpit-context";
import { useCockpitModals } from "@/hooks/use-cockpit-modals";
import { useCockpitModuleFlags } from "@/hooks/use-cockpit-module-flags";
import { useCockpitDarkMode } from "@/hooks/use-cockpit-dark-mode";
import { getNextAction } from "@/lib/cockpit-next-action";
import { useSound } from "@/hooks/use-sound";
import { useQuery } from "@tanstack/react-query";
import { MODULES } from "@/lib/modules-data";
import { getQuestionGuide } from "@/lib/guide-data";
import { STUCK_DETECTION_DELAY_MS } from "@/components/pilot/pilot-settings";
import { useStuckDetection } from "@/hooks/use-stuck-detection";

export function useFocusCockpitState() {
  const {
    session, sessionId, responses, activeStudents, voteData,
    situationData, teams,
  } = useCockpitData();
  const {
    updateSession, toggleHide, toggleVoteOption,
    highlightResponse, onModuleComplete,
  } = useCockpitActions();
  const modals = useCockpitModals();
  const moduleFlags = useCockpitModuleFlags(session);
  const { isDarkMode, setIsDarkMode } = useCockpitDarkMode();
  const { play } = useSound();

  // ── Local state ──
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [showStudentSheet, setShowStudentSheet] = useState(false);
  const [selectedResponseIds, setSelectedResponseIds] = useState<Set<string>>(new Set());
  const [allResponded, setAllResponded] = useState(false);
  const [respondingOpenedAt, setRespondingOpenedAt] = useState<number | null>(null);
  const [broadcastHistory, setBroadcastHistory] = useState<{ text: string; sentAt: Date }[]>([]);
  const [responseFilter, setResponseFilter] = useState<"all" | "visible" | "highlighted">("all");
  const [responseSortMode, setResponseSortMode] = useState<"time" | "highlighted">("time");
  const [reformulating, setReformulating] = useState<typeof responses[0] | null>(null);
  const allRespondedNotified = useRef(false);
  const prevResponseCountRef = useRef(0);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(0);

  // ── Derived data ──
  const situation = (situationData as { situation?: { id: string; position: number; category: string; restitutionLabel: string; prompt: string; nudgeText: string | null } })?.situation;
  const budgetStats = (situationData as { budgetStats?: { submittedCount: number } })?.budgetStats;
  const budgetSubmitted = budgetStats?.submittedCount || 0;
  const visibleResponses = responses.filter((r) => !r.is_hidden);
  const voteOptionCount = responses.filter((r) => r.is_vote_option && !r.is_hidden).length;
  const currentQIndex = session.current_situation_index || 0;
  const respondedCount = responses.length;

  const { canGoNext, maxSituations, isQAModule, isM2ECSpecial, isM2ECComparison, isM10Any, isM10SpecialPosition, isBudgetQuiz } = moduleFlags;

  const nextAction = getNextAction(
    session.status, visibleResponses.length, voteOptionCount,
    !!(voteData && voteData.totalVotes > 0),
    session.current_module, budgetSubmitted, canGoNext,
    session.current_seance || 1, session.current_situation_index || 0,
    session.reveal_phase
  );

  // Module data
  const module1Data = (situationData as { module1?: { type: string; questions?: { index: number; text: string }[]; question?: { text: string }; responsesCount?: number; optionDistribution?: Record<string, number> | null } })?.module1;
  const module10Data = (situationData as { module10?: { type: string; allSubmissions?: { studentId: string; text: string }[] } })?.module10;
  const module12Data = (situationData as { module12?: { mancheLabel: string; manche: number } })?.module12;
  const module13Data = (situationData as { module13?: { stepEmoji: string; stepLabel: string } })?.module13;
  const module6Data = (situationData as { module6?: { type: string } })?.module6;
  const module7Data = (situationData as { module7?: { type: string } })?.module7;
  const module8Data = (situationData as { module8?: { type: string } })?.module8;

  // Module label
  const currentMod = MODULES.find(
    (m) => m.dbModule === session.current_module && m.dbSeance === (session.current_seance || 1)
  );
  const moduleLabel = currentMod?.title || "Module";
  const moduleColor = currentMod?.color || "#FF6B35";

  // Question guide
  const questionGuide = getQuestionGuide(
    session.current_seance || 1,
    (session.current_situation_index || 0) + 1,
    session.current_module
  );

  // Situations preview
  const [allSituations, setAllSituations] = useState<{ position: number; category: string; restitutionLabel: string; prompt: string }[]>([]);
  const { data: situationsPreviewData } = useQuery<{ situations: typeof allSituations }>({
    queryKey: ["situations-preview", session?.id, session?.current_module, session?.current_seance],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${session.id}/situations-preview`);
      if (!res.ok) return { situations: [] };
      return res.json();
    },
    enabled: !!session?.id,
    staleTime: 60_000,
  });
  useEffect(() => {
    if (situationsPreviewData?.situations) setAllSituations(situationsPreviewData.situations);
  }, [situationsPreviewData]);

  // Module-submitted IDs
  const moduleSubmittedIds = useMemo(() => {
    const ids = new Set<string>();
    if (module10Data?.allSubmissions) {
      for (const s of module10Data.allSubmissions) ids.add(s.studentId);
    }
    return ids;
  }, [module10Data?.allSubmissions]);

  // Responded student IDs
  const respondedStudentIds = useMemo(() => {
    const ids = new Set(responses.map((r) => r.student_id));
    for (const id of moduleSubmittedIds) ids.add(id);
    return ids;
  }, [responses, moduleSubmittedIds]);

  const activeStudentIds = useMemo(
    () => new Set((session.students || []).filter((s) => s.is_active).map((s) => s.id)),
    [session.students]
  );

  // Stuck detection
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

  // Not responded students
  const notRespondedStudents = useMemo(() => {
    if (session.status !== "responding") return [];
    const respondedIds = new Set(responses.map(r => r.student_id));
    moduleSubmittedIds.forEach(id => respondedIds.add(id));
    return activeStudents.filter(s => !respondedIds.has(s.id));
  }, [session.status, responses, activeStudents, moduleSubmittedIds]);

  // Filtered responses
  const filteredResponses = useMemo(() => {
    let filtered = responses;
    if (responseFilter === "visible") filtered = filtered.filter((r) => !r.is_hidden);
    else if (responseFilter === "highlighted") filtered = filtered.filter((r) => r.is_highlighted);
    if (responseSortMode === "highlighted") {
      filtered = [...filtered].sort((a, b) => {
        if (a.is_highlighted && !b.is_highlighted) return -1;
        if (!a.is_highlighted && b.is_highlighted) return 1;
        if (a.is_hidden && !b.is_hidden) return 1;
        if (!a.is_hidden && b.is_hidden) return -1;
        return 0;
      });
    }
    return filtered;
  }, [responses, responseFilter, responseSortMode]);

  // Preview
  const isPreviewing = previewIndex !== null && previewIndex !== currentQIndex;
  const displayIndex = previewIndex ?? currentQIndex;

  useEffect(() => {
    if (previewIndex !== null && previewIndex === currentQIndex) setPreviewIndex(null);
  }, [currentQIndex, previewIndex]);

  // Responding opened at tracking
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
      const studentName = session.students?.find(s => s.id === newest?.student_id)?.display_name;
      if (studentName) {
        toast(`${studentName} a répondu`, { icon: "✏️", duration: 2000, style: { fontSize: 13, padding: "8px 14px" } });
      }
    }
    prevResponseCountRef.current = curr;
  }, [responses.length, responses, session.status, session.students]);

  // Auto-advance
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
      const currentIdx = session.current_situation_index || 0;
      if (currentIdx < maxSituations - 1) goToSituation(currentIdx + 1);
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

  // ── Navigation handlers ──
  function goToSituation(index: number) {
    setPreviewIndex(null);
    updateSession.mutate({ current_situation_index: index, status: "responding", timer_ends_at: null, reveal_phase: null });
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

  function handleNextAction() {
    if (!nextAction || !nextAction.action || nextAction.disabled) return;
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
  }

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

  function handleBroadcast(message: string) {
    updateSession.mutate({ broadcast_message: message, broadcast_at: new Date().toISOString() });
    setBroadcastHistory((prev) => [{ text: message, sentAt: new Date() }, ...prev].slice(0, 10));
    modals.setShowBroadcast(false);
    play("send");
    toast.success("Message envoyé à toute la classe");
  }

  function handleNudgeAllStuck() {
    updateSession.mutate({ broadcast_message: "N'oubliez pas de répondre à la question !", broadcast_at: new Date().toISOString() });
    play("send");
    toast.success(`Relance envoyée à la classe (${notRespondedStudents.length} en attente)`);
  }

  function handleHighlightAllVisible() {
    const toHighlight = responses.filter((r) => !r.is_hidden && !r.is_highlighted);
    for (const r of toHighlight) highlightResponse.mutate({ responseId: r.id, highlighted: true });
    toast.success(`${toHighlight.length} réponse${toHighlight.length > 1 ? "s" : ""} projetée${toHighlight.length > 1 ? "s" : ""}`);
  }

  function handleClearAllHighlights() {
    const highlighted = responses.filter((r) => r.is_highlighted);
    for (const r of highlighted) highlightResponse.mutate({ responseId: r.id, highlighted: false });
    toast.success(`${highlighted.length} réponse${highlighted.length > 1 ? "s" : ""} dé-projetée${highlighted.length > 1 ? "s" : ""}`);
  }

  function handleHighlightBoth(idA: string, idB: string) {
    highlightResponse.mutate({ responseId: idA, highlighted: true });
    highlightResponse.mutate({ responseId: idB, highlighted: true });
    toast.success("2 réponses projetées pour comparaison");
  }

  // Universal question text
  const universalQuestionText = useMemo((): string | null => {
    if (situation?.prompt) return situation.prompt;
    if (moduleFlags.isM1Positioning && module1Data?.questions?.[currentQIndex]) return module1Data.questions[currentQIndex].text;
    if (module1Data?.question?.text) return module1Data.question.text;
    if (module12Data) return module12Data.mancheLabel || `Manche ${module12Data.manche || 1}`;
    if (module13Data) return `${module13Data.stepEmoji} ${module13Data.stepLabel}`;
    return null;
  }, [situation, moduleFlags.isM1Positioning, module1Data, module12Data, module13Data, currentQIndex]);

  // Universal category
  const universalCategoryLabel = useMemo((): string => {
    if (situation?.restitutionLabel || situation?.category) return situation.restitutionLabel || situation.category;
    if (moduleFlags.isM1Positioning) return "Positionnement";
    if (moduleFlags.isM1Image) return "Image";
    if (moduleFlags.isM1Notebook) return "Carnet";
    if (isBudgetQuiz) return "Budget";
    if (isM10Any && moduleFlags.isM10Etsi) return "Et si...";
    if (isM10Any && moduleFlags.isM10Pitch) return "Pitch";
    if (moduleFlags.isM2ECChecklist) return "Checklist";
    if (moduleFlags.isM2ECSceneBuilder) return "Scène";
    if (moduleFlags.isM2ECComparison) return "Confrontation";
    if (moduleFlags.isM12Any) return "Construction";
    if (moduleFlags.isM13Any) return "Post-prod";
    if (moduleFlags.isM6Any) return "Scénario";
    if (moduleFlags.isM7Any) return "Mise en scène";
    if (moduleFlags.isM8Any) return "Équipe";
    return moduleLabel;
  }, [situation, moduleFlags, isBudgetQuiz, isM10Any, moduleLabel]);

  // Unified responded count (module-aware)
  const unifiedRespondedCount = useMemo(() => {
    if (moduleFlags.isM1Positioning) {
      const dist = module1Data?.optionDistribution || {};
      return Object.values(dist).reduce((sum, v) => sum + (v as number), 0);
    }
    if (isBudgetQuiz) return budgetSubmitted;
    if ((moduleFlags.isM1Image || moduleFlags.isM1Notebook) && module1Data?.responsesCount) return module1Data.responsesCount;
    if (isM10Any && module10Data?.allSubmissions) return module10Data.allSubmissions.length;
    return responses.length;
  }, [moduleFlags, module1Data, isBudgetQuiz, budgetSubmitted, isM10Any, module10Data, responses.length]);

  // Standard QA detection
  const isStandardQA = useMemo(() => {
    const mod = session.current_module;
    const isM3orM4 = mod === 3 || mod === 4;
    const isM9QA = mod === 9 && !isBudgetQuiz;
    const isM2ECQA = mod === 2 && !isM2ECSpecial && !isM2ECComparison;
    const isM10QA = isM10Any && !isM10SpecialPosition;
    return isM3orM4 || isM9QA || isM2ECQA || isM10QA;
  }, [session.current_module, isBudgetQuiz, isM2ECSpecial, isM2ECComparison, isM10Any, isM10SpecialPosition]);

  const winnerResponseId = (session.status === "reviewing" && voteData?.results?.[0]?.response?.id) || undefined;

  return {
    // Session data
    session, sessionId, responses, activeStudents, voteData, situationData, teams,

    // Computed
    situation, visibleResponses, voteOptionCount, currentQIndex, respondedCount,
    nextAction, moduleFlags, moduleLabel, moduleColor, questionGuide,
    allSituations, filteredResponses, isPreviewing, displayIndex,
    stuckStudents, notRespondedStudents, respondedStudentIds, stuckLevels,
    universalQuestionText, universalCategoryLabel, unifiedRespondedCount,
    isStandardQA, winnerResponseId, budgetSubmitted,

    // Local state
    previewIndex, setPreviewIndex,
    autoAdvance, setAutoAdvance,
    autoAdvanceCountdown,
    plusOpen, setPlusOpen,
    showStudentSheet, setShowStudentSheet,
    selectedResponseIds, setSelectedResponseIds,
    allResponded,
    respondingOpenedAt,
    broadcastHistory,
    responseFilter, setResponseFilter,
    responseSortMode, setResponseSortMode,
    reformulating, setReformulating,
    isDarkMode, setIsDarkMode,

    // Modals
    modals,

    // Handlers
    goToSituation, nextSituation, skipSituation, prevSituation,
    handleNextAction, handleSelectionBarAction, handleQuickVote,
    handleBroadcast, handleNudgeAllStuck,
    handleHighlightAllVisible, handleClearAllHighlights, handleHighlightBoth,
  };
}
