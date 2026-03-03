"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CATEGORY_COLORS, PRODUCTION_CATEGORIES, getSeanceMax } from "@/lib/constants";
import { QRCodeSVG } from "qrcode.react";
import { getModuleGuide, getQuestionGuide } from "@/lib/guide-data";
import { MODULES, PHASES, getModuleByDb, getPhaseForModule } from "@/lib/modules-data";

// Cockpit components
import { InlineActions, TeacherCommentBadge } from "@/components/pilot/response-actions";
import { QuestionCard } from "@/components/pilot/question-card";
import { ResponseStream } from "@/components/pilot/response-stream";
import { type ResponseCardResponse } from "@/components/pilot/response-card";
import { InlineReformulation } from "@/components/pilot/inline-reformulation";
import { SelectionBar } from "@/components/pilot/selection-bar";
import { QuickPhrases } from "@/components/pilot/quick-phrases";
import { ChoicesHistory, type CollectiveChoice } from "@/components/pilot/choices-history";
import type { StudentState } from "@/components/pilot/pulse-ring";
import { CONTENT_CATALOG, EMOTIONS, SCENE_ELEMENTS, TIER_COLORS, TIER_LABELS, MAX_SLOTS, MAX_TOKENS, getElement } from "@/lib/module5-data";
import { DiceBearAvatarMini } from "@/components/avatar-dicebear";

// Layout components
import { PilotTopBar } from "@/components/pilot/pilot-top-bar";
import { ModuleSidebar, MobileSidebarDrawer } from "@/components/pilot/module-sidebar";
import { WelcomePanel } from "@/components/pilot/welcome-panel";
import { ModuleBriefing } from "@/components/pilot/module-briefing";
import { ContextPanel } from "@/components/pilot/context-panel";

interface Session {
  id: string;
  title: string;
  level: string;
  status: string;
  join_code: string;
  current_module: number;
  current_seance: number;
  current_situation_index: number;
  timer_ends_at: string | null;
  completed_modules: string[];
  sharing_enabled: boolean;
  students: Student[];
}

interface Student {
  id: string;
  display_name: string;
  avatar: string;
  is_active: boolean;
  last_seen_at: string;
  warnings: number;
  kicked: boolean;
}

interface Response {
  id: string;
  student_id: string;
  situation_id: string;
  text: string;
  submitted_at: string;
  is_hidden: boolean;
  is_vote_option: boolean;
  is_highlighted: boolean;
  teacher_comment: string | null;
  teacher_score?: number;
  ai_score?: number;
  ai_feedback?: string | null;
  reset_at?: string | null;
  previous_text?: string | null;
  students: { display_name: string; avatar: string };
}

interface VoteResult {
  response: { id: string; text: string; students: { display_name: string; avatar: string } };
  count: number;
  voters: { display_name: string; avatar: string }[];
}



// ——————————————————————————————————————————————————————
// COCKPIT — The in-game facilitator view
// ——————————————————————————————————————————————————————

// Guided flow: the next logical action based on current status
function getNextAction(status: string, visibleCount: number, voteOptionCount: number, hasVoteResults: boolean, currentModule: number, budgetSubmitted: number, canGoNext?: boolean, currentSeance?: number, currentSituationIndex?: number) {
  // Module 9 séance 2 = budget quiz (special flow, old Module 2)
  const isBudgetQuiz = currentModule === 9 && currentSeance === 2;

  // Module 2 special flows — Émotion Cachée (checklist s1i0, scene builder s2i1)
  if (currentModule === 2) {
    const isChecklist = currentSeance === 1 && currentSituationIndex === 0;
    const isSceneBuilder = currentSeance === 2 && currentSituationIndex === 1;

    if (isChecklist || isSceneBuilder) {
      switch (status) {
        case "waiting":
          return { label: "Ouvrir", action: "responding", color: "#EC4899" };
        case "responding":
          return { label: "Question suivante", action: "next", color: "#4ECDC4" };
        default:
          return null;
      }
    }
    // Standard Q&A for other module 2 EC steps — fall through to default handler
  }

  if (currentModule === 1) {
    const isImageSeance = currentSeance && currentSeance >= 2 && currentSeance <= 4;
    switch (status) {
      case "waiting":
        return { label: "Ouvrir les réponses", action: "responding", color: "#8B5CF6" };
      case "responding":
        if (isImageSeance) {
          // Image séances: go to reviewing for confrontation
          if (visibleCount === 0) return null;
          return { label: "Voir les réponses", action: "reviewing", color: "#8B5CF6" };
        }
        // Positioning: auto-advance handled by situation_index, or done
        if (canGoNext === false) {
          return { label: "Terminer le module", action: "done-module", color: "#10B981" };
        }
        return { label: "Question suivante", action: "next", color: "#4ECDC4" };
      case "reviewing":
        // Image confrontation: teacher is reviewing, highlight 2 responses → project
        return { label: "Terminer le module", action: "done-module", color: "#10B981" };
      case "done":
        return null;
      default:
        return null;
    }
  }

  // Module 10 — Et si... + Pitch: special components advance with "next"
  if (currentModule === 10) {
    switch (status) {
      case "waiting":
        return { label: "Ouvrir", action: "responding", color: "#06B6D4" };
      case "responding":
        if (canGoNext === false) {
          return { label: "Terminer le module", action: "done-module", color: "#10B981" };
        }
        return { label: "Étape suivante", action: "next", color: "#06B6D4" };
      case "done":
        return null;
      default:
        return null;
    }
  }

  if (isBudgetQuiz) {
    switch (status) {
      case "waiting":
        return { label: "Lancer les choix", action: "responding", color: "#4ECDC4" };
      case "responding":
        if (budgetSubmitted === 0) return null;
        return { label: `Terminer (${budgetSubmitted} soumis)`, action: "reviewing", color: "#8B5CF6" };
      case "reviewing":
        return { label: "Terminé", action: "done-module", color: "#10B981" };
      default:
        return null;
    }
  }

  switch (status) {
    case "waiting":
      return { label: "Ouvrir les réponses", action: "responding", color: "#4ECDC4" };
    case "responding":
      if (visibleCount === 0) return null;
      if (voteOptionCount < 2) return { label: `Sélectionner pour le vote (${voteOptionCount}/2 min)`, action: "", color: "#888", disabled: true };
      return { label: `Lancer le vote (${voteOptionCount} options)`, action: "voting", color: "#FF6B35" };
    case "voting":
      if (!hasVoteResults) return null;
      return { label: "Voir les résultats", action: "reviewing", color: "#8B5CF6" };
    case "reviewing":
      return { label: "Question suivante", action: "next", color: "#4ECDC4" };
    default:
      return null;
  }
}

function CockpitContent({
  session,
  situationData,
  responses,
  voteData,
  activeStudents,
  collectiveChoices,
  onModuleComplete,
  updateSession,
  toggleHide,
  toggleVoteOption,
  validateChoice,
  removeStudent,
  commentResponse,
  highlightResponse,
  nudgeStudent,
  warnStudent,
  scoreResponse,
  aiEvaluate,
  resetResponse,
  resetAllResponses,
  commentingResponse,
  setCommentingResponse,
  commentText,
  setCommentText,
  sessionId,
  router,
  showStudents,
  setShowStudents,
  sidebarWidth,
  rightPanelWidth,
  onSelectStudent,
}: {
  session: Session;
  situationData: Record<string, unknown> | null;
  responses: Response[];
  voteData: { totalVotes: number; results: VoteResult[] } | undefined;
  activeStudents: Student[];
  collectiveChoices: CollectiveChoice[];
  onModuleComplete: () => void;
  updateSession: ReturnType<typeof useMutation<unknown, Error, Record<string, unknown>>>;
  toggleHide: ReturnType<typeof useMutation<unknown, Error, { responseId: string; is_hidden: boolean }>>;
  toggleVoteOption: ReturnType<typeof useMutation<unknown, Error, { responseId: string; is_vote_option: boolean }>>;
  validateChoice: ReturnType<typeof useMutation<unknown, Error, { response: Response; text: string }>>;
  removeStudent: ReturnType<typeof useMutation<unknown, Error, string>>;
  commentResponse: ReturnType<typeof useMutation<unknown, Error, { responseId: string; comment: string | null }>>;
  highlightResponse: ReturnType<typeof useMutation<unknown, Error, { responseId: string; highlighted: boolean }>>;
  nudgeStudent: ReturnType<typeof useMutation<unknown, Error, { responseId: string; nudgeText: string }>>;
  warnStudent: ReturnType<typeof useMutation<unknown, Error, string>>;
  scoreResponse: ReturnType<typeof useMutation<unknown, Error, { responseId: string; score: number }>>;
  aiEvaluate: ReturnType<typeof useMutation<unknown, Error, string[]>>;
  resetResponse: ReturnType<typeof useMutation<unknown, Error, string>>;
  resetAllResponses: ReturnType<typeof useMutation<{ resetCount: number }, Error, string>>;
  commentingResponse: string | null;
  setCommentingResponse: (id: string | null) => void;
  commentText: string;
  setCommentText: (text: string) => void;
  sessionId: string;
  router: ReturnType<typeof useRouter>;
  showStudents: boolean;
  setShowStudents: (v: boolean) => void;
  sidebarWidth: number;
  rightPanelWidth: number;
  onSelectStudent: (student: Student) => void;
}) {
  const [reformulating, setReformulating] = useState<Response | null>(null);
  const [reformulatedText, setReformulatedText] = useState("");
  const [respondingStartedAt] = useState<number>(Date.now());
  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [responseFilter, setResponseFilter] = useState<"all" | "visible" | "highlighted">("all");
  const [responseSortMode, setResponseSortMode] = useState<"time" | "highlighted">("time");
  const queryClient = useQueryClient();

  const situation = (situationData as { situation?: { id: string; position: number; category: string; restitutionLabel: string; prompt: string } })?.situation;
  const budgetStats = (situationData as { budgetStats?: { submittedCount: number; averages: Record<string, number> } })?.budgetStats;
  const budgetSubmitted = budgetStats?.submittedCount || 0;
  const budgetAverages = budgetStats?.averages || {};
  const totalStudents = session.students?.length || 0;
  const visibleResponses = responses.filter((r) => !r.is_hidden);
  const hiddenCount = responses.length - visibleResponses.length;
  const voteOptionCount = responses.filter((r) => r.is_vote_option && !r.is_hidden).length;

  // Build warnings map: studentId → warning count
  const studentWarnings: Record<string, number> = {};
  for (const s of session.students || []) {
    studentWarnings[s.id] = s.warnings || 0;
  }

  // Fetch individual student budgets for Module 9 (old M2 budget quiz)
  const { data: budgetData } = useQuery<{
    budgets: Array<{
      id: string;
      student_id: string;
      choices: Record<string, number>;
      credits_remaining: number;
      summary: string;
      students: { display_name: string; avatar: string };
    }>;
    averages: Record<string, number>;
    count: number;
  }>({
    queryKey: ["budget", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/budget`);
      if (!res.ok) throw new Error("Failed to fetch budgets");
      return res.json();
    },
    enabled: session.current_module === 9 && (session.current_seance || 1) === 2,
    refetchInterval: session.current_module === 9 && (session.current_seance || 1) === 2 ? 4000 : false,
  });

  // Fetch all scenes for Module 2 EC (séances 2-3)
  interface M2ECScene {
    id: string;
    emotion: string;
    intention: string;
    obstacle: string;
    changement: string;
    elements: { key: string }[];
    tokens_used: number;
    slots_used: number;
    students: { display_name: string; avatar: string } | null;
  }
  const isM2ECWithScenes = session.current_module === 2 && ((session.current_seance || 1) === 2 || (session.current_seance || 1) === 3);
  const { data: scenesData } = useQuery<{ scenes: M2ECScene[]; emotionDistribution: Record<string, number>; count: number }>({
    queryKey: ["m2ec-scenes", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/scene`);
      if (!res.ok) return { scenes: [], emotionDistribution: {}, count: 0 };
      return res.json();
    },
    enabled: isM2ECWithScenes,
    refetchInterval: isM2ECWithScenes ? 5000 : false,
  });

  const selectComparison = useMutation({
    mutationFn: async ({ sceneAId, sceneBId }: { sceneAId: string; sceneBId: string }) => {
      const res = await fetch(`/api/sessions/${sessionId}/scene-compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneAId, sceneBId }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Scènes sélectionnées pour la confrontation");
      queryClient.invalidateQueries({ queryKey: ["pilot-situation", sessionId] });
      setSelectedSceneIds([]);
    },
    onError: () => toast.error("Erreur de sélection"),
  });

  const isBudgetQuiz = session.current_module === 9 && (session.current_seance || 1) === 2;
  const isM1Positioning = session.current_module === 1 && (session.current_seance || 1) === 1;
  const isM1Image = session.current_module === 1 && (session.current_seance || 1) >= 2 && (session.current_seance || 1) <= 4;
  const isM1Notebook = session.current_module === 1 && (session.current_seance || 1) === 5;
  const isM2ECChecklist = session.current_module === 2 && (session.current_seance || 1) === 1 && (session.current_situation_index || 0) === 0;
  const isM2ECSceneBuilder = session.current_module === 2 && (session.current_seance || 1) === 2 && (session.current_situation_index || 0) === 1;
  const isM2ECComparison = session.current_module === 2 && (session.current_seance || 1) === 3 && (session.current_situation_index || 0) === 0;
  const isM10Etsi = session.current_module === 10 && (session.current_seance || 1) === 1;
  const isM10Pitch = session.current_module === 10 && (session.current_seance || 1) === 2;
  const isM10Any = session.current_module === 10;
  // M10 special = positions with custom components (not standard Q&A)
  // Séance 1: pos 0 (etsi), pos 2 (idea-bank) are special; pos 1 (qcm) is standard
  // Séance 2: all positions are special (avatar, objectif, pitch, chrono, confrontation)
  const isM10SpecialPosition = isM10Any && !(isM10Etsi && (session.current_situation_index || 0) === 1);
  const isM2ECSpecial = isM2ECChecklist || isM2ECSceneBuilder;
  const isQAModule = session.current_module === 3 || session.current_module === 4 || isM1Positioning || session.current_module === 9 || (session.current_module === 2 && !isM2ECSpecial && !isM2ECComparison) || (isM10Any && !isM10SpecialPosition);
  const seance = session.current_seance || 1;
  const maxSituations = isM1Positioning ? 8
    : (isM1Image || isM1Notebook) ? 1
    : session.current_module === 4 ? 8
    : getSeanceMax(session.current_module, seance);
  const isM2ECAny = session.current_module === 2;
  const canGoNext = (isQAModule || isM2ECAny || isM10Any) && (session.current_situation_index || 0) < maxSituations - 1;
  const canGoPrev = (isQAModule || isM2ECAny || isM10Any) && (session.current_situation_index || 0) > 0;

  const nextAction = getNextAction(session.status, visibleResponses.length, voteOptionCount, !!(voteData && voteData.totalVotes > 0), session.current_module, budgetSubmitted, canGoNext, session.current_seance || 1, session.current_situation_index || 0);

  // Module 1 data from situationData (redesigned)
  const module1Data = (situationData as { module1?: {
    type: "positioning" | "image" | "notebook";
    questions?: { index: number; situationId: string; text: string; measure: string; options?: { key: string; label: string }[] }[];
    responseCounts?: Record<number, number>;
    optionDistribution?: Record<string, number> | null;
    image?: { position: number; title: string; description: string; url: string } | null;
    question?: { situationId: string; text: string; relance: string; measure: string };
    responsesCount?: number;
    confrontation?: { responseA: string; responseB: string } | null;
    existingText?: string;
    totalSeances: number;
    currentSeance: number;
  } })?.module1;

  // Module 2 EC data from situationData
  const module5Data = (situationData as { module5?: {
    type: "checklist" | "scene-builder" | "comparison";
    submittedCount?: number;
    topItems?: { key: string; count: number }[];
    emotionDistribution?: Record<string, number>;
  } })?.module5;

  // Module 10 data from situationData
  const module10Data = (situationData as { module10?: {
    type: string;
    image?: { id: string; url: string; title: string; description: string } | null;
    etsiText?: string;
    helpUsed?: boolean;
    submitted?: boolean;
    submittedCount?: number;
    ideaBankCount?: number;
    ideaBankItems?: { id: string; text: string; votes: number }[];
    personnage?: { prenom: string; age: string; trait: string; avatar: Record<string, string> } | null;
    objectif?: string | null;
    obstacle?: string | null;
    pitchText?: string | null;
    chronoSeconds?: number | null;
    confrontation?: { pitchA: { text: string; prenom: string }; pitchB: { text: string; prenom: string } } | null;
    allSubmissions?: { studentName: string; text: string; studentId: string; avatar?: Record<string, unknown> }[];
  } })?.module10;

  // Module label & guide data
  const currentMod = MODULES.find(
    (m) => m.dbModule === session.current_module && m.dbSeance === (session.current_seance || 1)
  );
  const moduleLabel = currentMod?.title || "Module";
  const moduleColor = currentMod?.color || "#FF6B35";
  const moduleGuide = currentMod ? getModuleGuide(currentMod.id) : undefined;
  const questionGuide = (session.current_module === 1 || session.current_module === 3 || session.current_module === 4 || session.current_module === 9 || (session.current_module === 2 && !isM2ECSpecial && !isM2ECComparison) || isM10Any)
    ? getQuestionGuide(session.current_seance || 1, (session.current_situation_index || 0) + 1, session.current_module)
    : undefined;

  // Compute student states for pulse ring / grid (M3 only)
  const studentStates = useMemo((): { id: string; state: StudentState; display_name: string; avatar: string }[] => {
    if (!session.students) return [];
    const now = Date.now();
    return session.students.map((s) => {
      const hasResponded = responses.some((r) => r.student_id === s.id);
      if (!s.is_active) return { id: s.id, state: "disconnected" as StudentState, display_name: s.display_name, avatar: s.avatar };
      if (hasResponded) return { id: s.id, state: "responded" as StudentState, display_name: s.display_name, avatar: s.avatar };
      // Stuck: active, no response, > 60s since responding started
      if (session.status === "responding" && (now - respondingStartedAt) > 60_000) {
        return { id: s.id, state: "stuck" as StudentState, display_name: s.display_name, avatar: s.avatar };
      }
      return { id: s.id, state: "active" as StudentState, display_name: s.display_name, avatar: s.avatar };
    });
  }, [session.students, session.status, responses, respondingStartedAt]);

  // Actually change the session (launches the question for students)
  function goToSituation(index: number) {
    setPreviewIndex(null);
    updateSession.mutate({ current_situation_index: index, status: "waiting", timer_ends_at: null });
  }

  // Local-only preview — doesn't affect students
  function previewSituation(index: number) {
    if (index === currentQIndex) {
      setPreviewIndex(null); // back to current
    } else {
      setPreviewIndex(index);
    }
  }

  function previewNext() {
    const displayIdx = previewIndex ?? currentQIndex;
    if (displayIdx < maxSituations - 1) setPreviewIndex(displayIdx + 1);
  }

  function previewPrev() {
    const displayIdx = previewIndex ?? currentQIndex;
    if (displayIdx > 0) setPreviewIndex(displayIdx - 1);
  }

  // Real navigation — advances session for students (called by action buttons)
  function nextSituation() {
    if (!canGoNext) return;
    goToSituation(session.current_situation_index + 1);
  }

  function skipSituation() {
    if (!canGoNext) return;
    goToSituation(session.current_situation_index + 1);
    toast("Situation passée");
  }


  function handleNextAction() {
    if (!nextAction || !nextAction.action || (nextAction as { disabled?: boolean }).disabled) return;
    if (nextAction.action === "next") {
      if (canGoNext) {
        nextSituation();
      } else {
        onModuleComplete();
      }
    } else if (nextAction.action === "done-module") {
      onModuleComplete();
    } else {
      updateSession.mutate({ status: nextAction.action, timer_ends_at: null });
    }
  }

  // M3 action handler for selection bar
  function handleSelectionBarAction() {
    if (session.status === "responding") {
      if (voteOptionCount >= 2) {
        updateSession.mutate({ status: "voting", timer_ends_at: null });
      }
    } else if (session.status === "voting") {
      if (voteData && voteData.totalVotes > 0) {
        updateSession.mutate({ status: "reviewing", timer_ends_at: null });
      }
    } else if (session.status === "reviewing") {
      if (canGoNext) nextSituation();
      else onModuleComplete();
    }
  }

  // ═══════════════════════════════════════════════════
  // UNIFIED SINGLE-COLUMN COCKPIT — All modules
  // ═══════════════════════════════════════════════════
  const winnerResponseId = (session.status === "reviewing" && voteData?.results?.[0]?.response?.id) || undefined;
  const currentQIndex = session.current_situation_index || 0;
  const respondedCount = responses.length;
  const isM3orM4 = session.current_module === 3 || session.current_module === 4;
  const isM9QA = session.current_module === 9 && !isBudgetQuiz;
  const isM2ECQA = session.current_module === 2 && !isM2ECSpecial && !isM2ECComparison;
  const isM10QA = isM10Any && !isM10SpecialPosition; // M10 QCM positions use standard Q&A flow
  const isStandardQA = isM3orM4 || isM9QA || isM2ECQA || isM10QA; // modules with question card + nav pills + response stream
  const highlightedCount = responses.filter((r) => r.is_highlighted).length;

  // Filtered & sorted responses for the stream
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

  // Preview mode — teacher browses questions locally without affecting students
  const isPreviewing = previewIndex !== null && previewIndex !== currentQIndex;
  const displayIndex = previewIndex ?? currentQIndex;

  // Reset preview when session index changes (e.g. after launching a question)
  useEffect(() => {
    if (previewIndex !== null && previewIndex === currentQIndex) {
      setPreviewIndex(null);
    }
  }, [currentQIndex, previewIndex]);

  // Guide data for the previewed question
  const previewGuide = isPreviewing
    ? getQuestionGuide(session.current_seance || 1, displayIndex + 1, session.current_module)
    : undefined;

  // Display-level M2EC flags (based on displayIndex for preview)
  const showM2ECChecklist = session.current_module === 2 && (session.current_seance || 1) === 1 && displayIndex === 0;
  const showM2ECSceneBuilder = session.current_module === 2 && (session.current_seance || 1) === 2 && displayIndex === 1;
  const showM2ECComparison = session.current_module === 2 && (session.current_seance || 1) === 3 && displayIndex === 0;
  const showM2ECSpecial = showM2ECChecklist || showM2ECSceneBuilder;
  // Display-level M10 flags (based on displayIndex for preview)
  // Séance 1: pos 0 (etsi), pos 2 (idea-bank) are special; pos 1 (qcm) is standard
  // Séance 2: all positions are special
  const showM10Special = isM10Any && !(isM10Etsi && displayIndex === 1);
  const showStandardQA = isStandardQA || (isM2ECAny && !showM2ECSpecial && !showM2ECComparison) || (isM10Any && !showM10Special);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── STATUS BAR ── */}
      {session.status === "paused" && (
        <motion.div
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="bg-bw-amber/10 border-b border-bw-amber/20 px-4 py-3 text-center flex-shrink-0 flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round">
            <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
          </svg>
          <p className="text-sm text-bw-amber font-semibold">En pause</p>
        </motion.div>
      )}
      {session.status === "done" && (
        <div className="bg-bw-green/10 border-b border-bw-green/20 px-4 py-3 text-center flex-shrink-0 flex items-center justify-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
          <p className="text-sm text-bw-green font-semibold">Module terminé</p>
          <button onClick={() => router.push(`/session/${sessionId}/results`)}
            className="text-sm text-bw-primary hover:underline cursor-pointer">Voir les résultats →</button>
        </div>
      )}

      {/* ── SINGLE COLUMN — scrollable center ── */}
      <main className="flex-1 overflow-y-auto pb-36">
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

          {/* ── CONTEXT ZONE — what the teacher needs to see ── */}

          {/* Standard Q&A: Question card (M9 non-budget, M3, M4, M2EC QA) */}
          {showStandardQA && (
            <>
              {/* Preview banner when looking ahead */}
              {isPreviewing && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-bw-amber/10 border border-bw-amber/30 rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xs text-bw-amber">Prévisualisation Q{displayIndex + 1} — les élèves ne voient pas ce changement</span>
                  <div className="flex-1" />
                  <button onClick={() => setPreviewIndex(null)}
                    className="text-xs text-bw-muted hover:text-white cursor-pointer transition-colors duration-200">Retour Q{currentQIndex + 1}</button>
                  <button onClick={() => { goToSituation(displayIndex); }}
                    className="btn-glow text-xs px-3 py-1 bg-bw-amber text-black rounded-xl font-medium cursor-pointer transition-all duration-200 hover:brightness-110">
                    Lancer Q{displayIndex + 1}
                  </button>
                </motion.div>
              )}

              {/* Show question card: real situation for current Q, guide preview for other Qs */}
              {isPreviewing && previewGuide ? (
                <div className="bg-bw-elevated rounded-xl border border-bw-amber/20 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: CATEGORY_COLORS[previewGuide.category] || "#888", color: "white" }}>
                      {previewGuide.category}
                    </span>
                    <span className="text-xs text-bw-muted">Q{displayIndex + 1}</span>
                  </div>
                  <p className="text-sm text-bw-heading leading-snug">{previewGuide.label}</p>
                  <div className="bg-bw-bg rounded-xl p-3 space-y-1.5 mt-2">
                    <p className="text-[10px] text-bw-muted uppercase font-semibold tracking-wider">Ce qu'on attend</p>
                    <p className="text-xs text-bw-muted">{previewGuide.whatToExpect}</p>
                  </div>
                  {previewGuide.relancePhrase && (
                    <div className="bg-bw-bg rounded-xl p-3 space-y-1.5">
                      <p className="text-[10px] text-bw-muted uppercase font-semibold tracking-wider">Phrase de relance</p>
                      <p className="text-xs text-bw-muted italic">&ldquo;{previewGuide.relancePhrase}&rdquo;</p>
                    </div>
                  )}
                </div>
              ) : isPreviewing ? (
                <div className="bg-bw-elevated rounded-xl border border-bw-amber/20 p-6 text-center">
                  <p className="text-sm text-bw-muted">Q{displayIndex + 1} — Aperçu non disponible</p>
                  <p className="text-xs text-bw-muted mt-1">Cliquez &ldquo;Lancer&rdquo; pour ouvrir cette question</p>
                </div>
              ) : situation ? (
                <QuestionCard
                  position={situation.position}
                  category={situation.category}
                  restitutionLabel={situation.restitutionLabel}
                  prompt={situation.prompt}
                  questionGuide={questionGuide}
                />
              ) : (
                <div className="bg-bw-elevated rounded-xl p-6 border border-white/[0.06] text-center">
                  <p className="text-bw-muted text-sm">Chargement de la question...</p>
                </div>
              )}

              {/* Question nav pills — LOCAL preview only */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {Array.from({ length: maxSituations }, (_, i) => {
                  const isLive = i === currentQIndex;
                  const isPreview = i === displayIndex;
                  const isPast = i < currentQIndex;
                  return (
                    <button key={i} onClick={() => previewSituation(i)}
                      className={`w-9 h-9 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 flex items-center justify-center ${
                        isPreview ? "text-white scale-110 shadow-lg"
                          : isLive ? "ring-2 ring-offset-1 ring-offset-bw-bg text-white"
                          : isPast ? "bg-bw-teal/15 text-bw-teal"
                          : "bg-bw-elevated text-bw-muted hover:text-bw-text hover:bg-bw-surface"
                      }`}
                      style={isPreview
                        ? { backgroundColor: isPreviewing ? "#F59E0B" : moduleColor, boxShadow: `0 0 12px ${isPreviewing ? "#F59E0B" : moduleColor}40` }
                        : isLive && isPreviewing ? { backgroundColor: moduleColor } : undefined
                      }>
                      {isPast && !isPreview ? (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7"/></svg>
                      ) : i + 1}
                    </button>
                  );
                })}
                <div className="flex-1" />
                <button onClick={previewPrev} disabled={displayIndex <= 0}
                  className="px-3 py-2 rounded-xl text-sm text-bw-muted hover:text-white bg-bw-elevated border border-white/[0.06] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200">
                  ←
                </button>
                <button onClick={previewNext} disabled={displayIndex >= maxSituations - 1}
                  className="px-3 py-2 rounded-xl text-sm text-bw-muted hover:text-white bg-bw-elevated border border-white/[0.06] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200">
                  →
                </button>
              </div>

              {/* Quick phrases */}
              <QuickPhrases questionGuide={questionGuide} />
            </>
          )}

          {/* M1 Positioning: question nav + option distribution */}
          {isM1Positioning && module1Data?.type === "positioning" && module1Data.questions && (
            <>
              {/* Question nav pills */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {Array.from({ length: maxSituations }, (_, i) => {
                  const isCurrent = i === currentQIndex;
                  const isPast = i < currentQIndex;
                  return (
                    <button key={i} onClick={() => previewSituation(i)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 ${
                        isCurrent ? "bg-bw-violet text-white shadow-lg shadow-bw-violet/20"
                          : isPast ? "bg-bw-teal/15 text-bw-teal"
                          : "bg-bw-elevated text-bw-muted hover:text-bw-text hover:bg-bw-surface"
                      }`}>
                      {isPast && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="inline mr-1"><path d="M5 12l5 5L20 7"/></svg>
                      )}
                      Q{i + 1}
                    </button>
                  );
                })}
              </div>
              {/* Current question */}
              {module1Data.questions[currentQIndex] && (
                <div className="bg-bw-elevated rounded-xl border border-white/[0.08] p-4 space-y-3">
                  <p className="text-sm text-bw-heading leading-snug">
                    <span className="text-bw-violet font-medium mr-1.5">Q{currentQIndex + 1}</span>
                    {module1Data.questions[currentQIndex].text}
                  </p>
                  {/* Option distribution bars */}
                  {module1Data.questions[currentQIndex].options?.map((opt) => {
                    const count = module1Data.optionDistribution?.[opt.key] || 0;
                    const total = activeStudents.length;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={opt.key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-bw-text">
                            <span className="text-bw-violet font-bold mr-1.5">{opt.key.toUpperCase()}</span>
                            {opt.label}
                          </span>
                          <span className="text-bw-muted tabular-nums">{count}/{total}</span>
                        </div>
                        <div className="h-2 bg-bw-bg rounded-full overflow-hidden">
                          <motion.div className="h-full bg-bw-violet rounded-full" animate={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Quick phrases for positioning */}
              <QuickPhrases questionGuide={questionGuide} />
            </>
          )}

          {/* M1 Image: image display + single question + responses with highlight/confrontation */}
          {isM1Image && module1Data?.type === "image" && (
            <>
              {module1Data.image ? (
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-bw-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={module1Data.image.url} alt={module1Data.image.title}
                      className="w-full aspect-[16/10] object-cover" />
                  </div>
                  <p className="text-sm text-bw-muted text-center">{module1Data.image.title}</p>
                </div>
              ) : (
                <div className="rounded-xl bg-bw-surface border border-white/[0.08] aspect-[16/10] flex items-center justify-center">
                  <p className="text-sm text-bw-muted">Image non disponible</p>
                </div>
              )}
              {/* Single question */}
              {module1Data.question && (
                <div className="bg-bw-elevated rounded-xl border border-white/[0.08] p-4">
                  <p className="text-sm text-bw-heading leading-snug">{module1Data.question.text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-16 h-1.5 bg-bw-bg rounded-full overflow-hidden">
                      <motion.div className="h-full bg-bw-teal rounded-full"
                        animate={{ width: `${activeStudents.length > 0 ? Math.round(((module1Data.responsesCount || 0) / activeStudents.length) * 100) : 0}%` }} />
                    </div>
                    <span className="text-xs text-bw-muted tabular-nums">{module1Data.responsesCount || 0}/{activeStudents.length}</span>
                  </div>
                </div>
              )}
              {/* Responses stream — teacher can highlight 2 for confrontation */}
              {responses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-bw-muted uppercase tracking-wider font-semibold">
                    Réponses {session.status === "reviewing" ? "— Sélectionne 2 pour la confrontation" : ""}
                  </p>
                  {responses.map((r) => (
                    <div key={r.id} className={`bg-bw-elevated rounded-xl border p-3.5 ${r.is_highlighted ? "border-bw-primary/40 bg-bw-primary/5" : "border-white/[0.08]"}`}>
                      <div className="flex items-start gap-2">
                        <span className="text-sm flex-shrink-0">{r.students?.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-bw-muted">{r.students?.display_name}</span>
                          <p className="text-sm text-bw-heading leading-snug">{r.text}</p>
                        </div>
                        <button
                          onClick={() => highlightResponse.mutate({ responseId: r.id, highlighted: !r.is_highlighted })}
                          className={`flex-shrink-0 px-2 py-1 rounded text-xs cursor-pointer transition-all duration-200 ${
                            r.is_highlighted ? "bg-bw-primary text-white" : "bg-white/5 text-bw-muted hover:text-white"
                          }`}>
                          {r.is_highlighted ? "Sélectionné" : "Projeter"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Quick phrases for image */}
              <QuickPhrases questionGuide={questionGuide} />
            </>
          )}

          {/* M1 Notebook: show submitted notebooks count + list */}
          {isM1Notebook && module1Data?.type === "notebook" && (
            <>
              {/* Activity description */}
              <div className="glass-card p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📓</span>
                  <span className="text-sm font-semibold text-bw-heading">Carnet d&apos;idées</span>
                </div>
                <p className="text-xs text-bw-muted leading-relaxed">
                  Les élèves écrivent librement leurs premières idées de film : personnages, lieux, situations, émotions.
                  C&apos;est un moment d&apos;écriture individuelle sans contrainte.
                </p>
                {module1Data.question && (
                  <div className="bg-bw-violet/10 rounded-xl p-3 mt-1">
                    <p className="text-xs text-bw-violet font-medium">Consigne affichée</p>
                    <p className="text-sm text-bw-text mt-1">{module1Data.question.text}</p>
                  </div>
                )}
              </div>
              {/* Progress counter */}
              <div className="bg-bw-violet/10 rounded-xl p-4 border border-bw-violet/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-bw-violet font-medium">Carnets soumis</span>
                  <span className="text-xl font-bold text-bw-violet tabular-nums">{module1Data.responsesCount || 0}/{activeStudents.length}</span>
                </div>
                <div className="mt-2 h-2 bg-bw-bg rounded-full overflow-hidden">
                  <div className="h-full bg-bw-violet rounded-full transition-all"
                    style={{ width: `${activeStudents.length > 0 ? Math.round(((module1Data.responsesCount || 0) / activeStudents.length) * 100) : 0}%` }} />
                </div>
              </div>
              {/* Notebooks list */}
              {responses.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-bw-muted uppercase tracking-wider font-semibold">Textes des élèves</p>
                  {responses.map((r) => (
                    <div key={r.id} className="bg-bw-elevated rounded-xl border border-white/[0.08] p-3.5">
                      <div className="flex items-start gap-2">
                        <span className="text-sm flex-shrink-0">{r.students?.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-bw-muted">{r.students?.display_name}</span>
                          <p className="text-sm text-bw-heading leading-snug whitespace-pre-wrap">{r.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : session.status === "responding" ? (
                <div className="bg-bw-surface rounded-xl border border-white/[0.06] p-6 text-center space-y-2">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="text-2xl">✍️</motion.div>
                  <p className="text-sm text-bw-muted">Les élèves écrivent...</p>
                  <p className="text-xs text-bw-muted">Les carnets apparaîtront ici au fur et à mesure</p>
                </div>
              ) : null}
              {/* Quick phrases for notebook */}
              <QuickPhrases questionGuide={questionGuide} />
            </>
          )}

          {/* M9 séance 2: Budget overview + individual budgets */}
          {isBudgetQuiz && (
            <>
              {/* Activity description */}
              <div className="glass-card p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <span className="text-sm font-semibold text-bw-heading">Budget de production</span>
                </div>
                <p className="text-xs text-bw-muted leading-relaxed">
                  Chaque élève dispose de crédits pour composer son budget de film.
                  Il choisit un niveau (basique, standard ou premium) pour chaque poste de production :
                  acteurs, décors, effets, musique, lumière, caméra.
                </p>
              </div>
              {/* Submission counter */}
              <div className="bg-bw-teal/10 rounded-xl p-4 border border-bw-teal/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-bw-teal font-medium">Budgets soumis</span>
                  <span className="text-xl font-bold text-bw-teal tabular-nums">{budgetSubmitted}/{activeStudents.length}</span>
                </div>
                <div className="mt-2 h-2 bg-bw-bg rounded-full overflow-hidden">
                  <div className="h-full bg-bw-teal rounded-full transition-all"
                    style={{ width: `${activeStudents.length > 0 ? Math.round((budgetSubmitted / activeStudents.length) * 100) : 0}%` }} />
                </div>
              </div>

              {/* Class averages */}
              {budgetSubmitted > 0 && (
                <div className="bg-bw-surface rounded-xl p-4 border border-white/[0.06] space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Moyenne de la classe</span>
                  {PRODUCTION_CATEGORIES.map((cat) => {
                    const avg = budgetAverages[cat.key] || 0;
                    const maxCost = Math.max(...cat.options.map((o) => o.cost));
                    const pct = maxCost > 0 ? Math.round((avg / maxCost) * 100) : 0;
                    const closestOpt = cat.options.reduce((prev, curr) =>
                      Math.abs(curr.cost - avg) < Math.abs(prev.cost - avg) ? curr : prev
                    );
                    return (
                      <div key={cat.key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium" style={{ color: cat.color }}>{cat.label}</span>
                          <span className="text-xs text-bw-text">{closestOpt.label} ({avg} cr.)</span>
                        </div>
                        <div className="h-2 bg-bw-bg rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
                            className="h-full rounded-full" style={{ backgroundColor: cat.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Individual budgets */}
              {budgetData && budgetData.budgets.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Budgets individuels</span>
                  {budgetData.budgets.map((b) => (
                    <div key={b.id} className="bg-bw-surface rounded-xl p-3 border border-white/[0.06] space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{b.students?.avatar}</span>
                        <span className="text-sm font-medium text-bw-heading">{b.students?.display_name}</span>
                        <span className="ml-auto text-xs text-bw-teal font-medium tabular-nums">
                          {b.credits_remaining} cr.
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {PRODUCTION_CATEGORIES.map((cat) => {
                          const cost = b.choices?.[cat.key] || 0;
                          const opt = cat.options.find((o) => o.cost === cost) || cat.options[0];
                          return (
                            <div key={cat.key} className="flex-1 text-center">
                              <div className="h-1.5 rounded-full mb-1"
                                style={{ backgroundColor: cost > 0 ? cat.color : "rgba(255,255,255,0.05)", opacity: cost > 0 ? 0.7 : 1 }} />
                              <span className="text-[9px] block" style={{ color: cat.color }}>{cat.label}</span>
                              <span className="text-[10px] text-bw-muted block">{opt.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {budgetSubmitted === 0 && (
                <div className="bg-bw-surface rounded-xl border border-white/[0.06] p-8 text-center space-y-2">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="text-3xl">💰</motion.div>
                  <p className="text-sm text-bw-muted">En attente des choix budgetaires...</p>
                </div>
              )}
            </>
          )}

          {/* ── MODULE 10: Et si... + Pitch overview ── */}
          {showM10Special && (
            <>
              <div className="glass-card p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{isM10Etsi ? "✨" : "🎤"}</span>
                  <span className="text-sm font-semibold text-bw-heading">
                    {isM10Etsi ? "Et si..." : "Pitch"}
                  </span>
                  <span className="text-[10px] text-bw-muted ml-auto uppercase tracking-wider">
                    {module10Data?.type === "etsi" ? "Image + écriture"
                      : module10Data?.type === "qcm" ? "QCM narratif"
                      : module10Data?.type === "idea-bank" ? "Banque d'idées"
                      : module10Data?.type === "avatar" ? "Création personnage"
                      : module10Data?.type === "objectif" ? "Objectif + Obstacle"
                      : module10Data?.type === "pitch" ? "Assemblage pitch"
                      : module10Data?.type === "chrono" ? "Test chrono 60s"
                      : module10Data?.type === "confrontation" ? "Confrontation"
                      : ""}
                  </span>
                </div>
                <p className="text-xs text-bw-muted leading-relaxed">
                  {isM10Etsi
                    ? "Les élèves observent une image et écrivent leur « Et si... ». Puis ils partagent leurs idées dans la banque collective."
                    : "Les élèves créent un personnage, définissent objectif + obstacle, assemblent leur pitch et le présentent en 60 secondes."}
                </p>
              </div>

              {/* Et si... Image — shown to students, visible in dashboard */}
              {module10Data?.type === "etsi" && module10Data.image && (
                <div className="rounded-xl overflow-hidden border border-cyan-500/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={module10Data.image.url}
                    alt={module10Data.image.title}
                    className="w-full h-auto max-h-48 object-cover"
                  />
                  <div className="bg-bw-elevated px-3 py-2 border-t border-white/[0.06]">
                    <p className="text-xs font-medium text-cyan-400">{module10Data.image.title}</p>
                    <p className="text-[10px] text-bw-muted mt-0.5 line-clamp-2">{module10Data.image.description}</p>
                  </div>
                </div>
              )}

              {/* Pitch — show personnage card if available */}
              {module10Data?.personnage && (module10Data.type === "objectif" || module10Data.type === "pitch" || module10Data.type === "chrono") && (
                <div className="bg-bw-elevated rounded-xl p-3 border border-white/[0.06] flex items-center gap-3">
                  <DiceBearAvatarMini options={module10Data.personnage.avatar || {}} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-bw-heading truncate">{module10Data.personnage.prenom}</p>
                    <p className="text-[10px] text-bw-muted">{module10Data.personnage.trait}</p>
                  </div>
                  {module10Data.objectif && (
                    <div className="text-right">
                      <p className="text-[10px] text-bw-muted">Objectif</p>
                      <p className="text-xs text-cyan-400 truncate max-w-[120px]">{module10Data.objectif}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Confrontation — show both pitchs */}
              {module10Data?.type === "confrontation" && module10Data.confrontation && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                    <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Pitch A — {module10Data.confrontation.pitchA.prenom}</p>
                    <p className="text-xs text-bw-text line-clamp-3">{module10Data.confrontation.pitchA.text}</p>
                  </div>
                  <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
                    <p className="text-[10px] text-red-400 font-bold uppercase mb-1">Pitch B — {module10Data.confrontation.pitchB.prenom}</p>
                    <p className="text-xs text-bw-text line-clamp-3">{module10Data.confrontation.pitchB.text}</p>
                  </div>
                </div>
              )}

              {/* Idea bank items */}
              {module10Data?.type === "idea-bank" && module10Data.ideaBankItems && module10Data.ideaBankItems.length > 0 && (
                <div className="bg-bw-surface rounded-xl p-3 border border-white/[0.06] space-y-1.5">
                  <p className="text-[10px] text-bw-muted uppercase font-semibold tracking-wider">💡 Banque d&apos;idées</p>
                  {module10Data.ideaBankItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      <span className="text-cyan-400 font-medium tabular-nums">{item.votes}♥</span>
                      <span className="text-bw-text truncate">{item.text}</span>
                    </div>
                  ))}
                  {module10Data.ideaBankItems.length > 5 && (
                    <p className="text-[10px] text-bw-muted">+{module10Data.ideaBankItems.length - 5} autres</p>
                  )}
                </div>
              )}

              {/* Submission counter */}
              {module10Data?.submittedCount != null && (
                <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-cyan-400 font-medium">
                      {module10Data.type === "etsi" ? "« Et si... » reçus" :
                       module10Data.type === "avatar" ? "Personnages créés" :
                       module10Data.type === "pitch" ? "Pitchs assemblés" :
                       module10Data.type === "chrono" ? "Chronos terminés" :
                       module10Data.type === "idea-bank" ? "Idées partagées" :
                       "Soumissions"}
                    </span>
                    <span className="text-xl font-bold text-cyan-400 tabular-nums">
                      {module10Data.submittedCount}/{activeStudents.length}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-bw-bg rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full transition-all"
                      style={{ width: `${activeStudents.length > 0 ? Math.round(((module10Data.submittedCount || 0) / activeStudents.length) * 100) : 0}%` }} />
                  </div>
                </div>
              )}
              {/* All submissions list (facilitator view for M10 special positions) */}
              {module10Data?.allSubmissions && module10Data.allSubmissions.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Réponses</span>
                  {module10Data.allSubmissions.map((sub, i) => (
                    <motion.div key={sub.studentId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-bw-surface rounded-xl p-3 border border-white/[0.06]">
                      <div className="flex items-start gap-2">
                        {sub.avatar && (
                          <DiceBearAvatarMini options={sub.avatar} size={28} />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-bw-text">{sub.studentName}</span>
                          <p className="text-sm text-bw-heading leading-snug mt-0.5 whitespace-pre-wrap">{sub.text}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Idea bank count */}
              {module10Data?.ideaBankCount != null && module10Data.ideaBankCount > 0 && (
                <div className="bg-bw-surface rounded-xl p-3 border border-white/[0.06]">
                  <span className="text-xs text-bw-muted">💡 {module10Data.ideaBankCount} idée(s) dans la banque</span>
                </div>
              )}
              {/* Quick phrases for Module 10 special positions */}
              <QuickPhrases questionGuide={questionGuide} />
            </>
          )}

          {/* ── MODULE 10: Nav pills for all positions ── */}
          {showM10Special && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {Array.from({ length: maxSituations }, (_, i) => {
                const isCurrent = i === currentQIndex;
                const isPreview = i === displayIndex;
                const isPast = i < currentQIndex;
                const specialLabel = isM10Etsi
                  ? (i === 0 ? "✨" : i === 1 ? `Q${i + 1}` : "💡")
                  : (i === 0 ? "🎭" : i === 1 ? "🎯" : i === 2 ? "📝" : i === 3 ? "⏱️" : "⚔️");
                return (
                  <button key={i} onClick={() => previewSituation(i)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 ${
                      isPreview ? "text-white scale-110 shadow-lg"
                        : isCurrent ? "ring-2 ring-offset-1 ring-offset-bw-bg text-white"
                        : isPast ? "bg-bw-teal/15 text-bw-teal"
                        : "bg-bw-elevated text-bw-muted hover:text-bw-text hover:bg-bw-surface"
                    }`}
                    style={isPreview
                      ? { backgroundColor: "#06B6D4", boxShadow: "0 0 12px rgba(6,182,212,0.4)" }
                      : isCurrent && !isPreview ? { backgroundColor: "#06B6D4" } : undefined
                    }>
                    {isPast && !isPreview ? (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="inline mr-1"><path d="M5 12l5 5L20 7"/></svg>
                    ) : null}
                    {specialLabel}
                  </button>
                );
              })}
              <div className="flex-1" />
              <button onClick={previewPrev} disabled={displayIndex <= 0}
                className="px-3 py-2 rounded-xl text-sm text-bw-muted hover:text-white bg-bw-elevated border border-white/[0.06] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200">
                ←
              </button>
              <button onClick={previewNext} disabled={displayIndex >= maxSituations - 1}
                className="px-3 py-2 rounded-xl text-sm text-bw-muted hover:text-white bg-bw-elevated border border-white/[0.06] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200">
                →
              </button>
            </div>
          )}

          {/* ── MODULE 2 EC: Nav pills for special positions ── */}
          {(showM2ECSpecial || showM2ECComparison) && (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: maxSituations }, (_, i) => {
                const isCurrent = i === currentQIndex;
                const isPast = i < currentQIndex;
                const specialLabel = (seance === 1 && i === 0) ? "📋"
                  : (seance === 2 && i === 1) ? "🎬"
                  : (seance === 3 && i === 0) ? "⚔️"
                  : `Q${i + 1}`;
                return (
                  <button key={i} onClick={() => previewSituation(i)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 ${
                      isCurrent ? "bg-bw-pink text-white shadow-lg shadow-bw-pink/20"
                        : isPast ? "bg-bw-teal/15 text-bw-teal"
                        : "bg-bw-elevated text-bw-muted hover:text-bw-text hover:bg-bw-surface"
                    }`}>
                    {isPast ? (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="inline mr-1"><path d="M5 12l5 5L20 7"/></svg>
                    ) : null}
                    {specialLabel}
                  </button>
                );
              })}
              <div className="flex-1" />
              <button onClick={previewPrev} disabled={displayIndex <= 0}
                className="px-3 py-2 rounded-xl text-sm text-bw-muted hover:text-white bg-bw-elevated border border-white/[0.06] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200">
                ←
              </button>
              <button onClick={previewNext} disabled={displayIndex >= maxSituations - 1}
                className="px-3 py-2 rounded-xl text-sm text-bw-muted hover:text-white bg-bw-elevated border border-white/[0.06] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200">
                →
              </button>
            </div>
          )}

          {/* ── MODULE 2 EC: Checklist cockpit ── */}
          {showM2ECChecklist && (
            <>
              {/* What students are doing */}
              <div className="glass-card !border-bw-pink/20 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="led led-writing" style={{ background: "#EC4899", boxShadow: "0 0 8px rgba(236,72,153,0.5)" }} />
                  <span className="text-sm font-semibold text-bw-pink">Étape 1 — Checklist</span>
                </div>
                <p className="text-xs text-bw-muted leading-relaxed">
                  Les élèves choisissent <span className="text-bw-heading font-medium">3 contenus minimum</span> parmi ces 20 oeuvres,
                  puis sélectionnent <span className="text-bw-heading font-medium">celui qui les touche le plus</span>.
                </p>
              </div>

              {/* Full catalog grid */}
              <div className="bg-bw-surface rounded-xl p-4 border border-white/[0.06] space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Catalogue proposé aux élèves</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {CONTENT_CATALOG.map((c) => (
                    <div key={c.key} className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-bw-bg border border-white/[0.06]">
                      <span className="text-sm">{c.emoji}</span>
                      <span className="text-xs text-bw-text truncate">{c.label}</span>
                      <span className="ml-auto text-[9px] text-bw-muted">{c.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live stats — submissions */}
              {module5Data?.type === "checklist" && (
                <div className="bg-bw-pink/10 rounded-xl p-4 border border-bw-pink/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-bw-pink font-medium">Checklists soumises</span>
                    <span className="text-xl font-bold text-bw-pink tabular-nums">
                      {module5Data.submittedCount || 0}/{activeStudents.length}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-bw-bg rounded-full overflow-hidden">
                    <div className="h-full bg-bw-pink rounded-full transition-all"
                      style={{ width: `${activeStudents.length > 0 ? Math.round(((module5Data.submittedCount || 0) / activeStudents.length) * 100) : 0}%` }} />
                  </div>
                </div>
              )}

              {/* Top items when available */}
              {module5Data?.topItems && module5Data.topItems.length > 0 && (
                <div className="bg-bw-surface rounded-xl p-4 border border-white/[0.06] space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Top contenus choisis</span>
                  {module5Data.topItems.map((item, i) => {
                    const catalog = CONTENT_CATALOG.find(c => c.key === item.key);
                    const maxCount = module5Data.topItems![0].count;
                    const pct = maxCount > 0 ? Math.round((item.count / maxCount) * 100) : 0;
                    return (
                      <motion.div key={item.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base w-6 text-center">{catalog?.emoji || "🎬"}</span>
                          <span className="text-sm text-bw-heading flex-1 font-medium">{catalog?.label || item.key}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-bw-pink/10 text-bw-pink font-bold tabular-nums">{item.count} vote{item.count > 1 ? "s" : ""}</span>
                        </div>
                        <div className="h-1.5 bg-bw-bg rounded-full overflow-hidden ml-8">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            className="h-full bg-bw-pink/60 rounded-full" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Waiting state when no data yet */}
              {(!module5Data || module5Data.type !== "checklist") && session.status === "responding" && (
                <div className="bg-bw-surface rounded-xl border border-white/[0.06] p-6 text-center space-y-2">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="text-2xl">📋</motion.div>
                  <p className="text-sm text-bw-muted">En attente des checklists...</p>
                  <p className="text-xs text-bw-muted">{activeStudents.length} élève{activeStudents.length > 1 ? "s" : ""} connecté{activeStudents.length > 1 ? "s" : ""}</p>
                </div>
              )}
            </>
          )}

          {/* ── MODULE 2 EC: Scene Builder cockpit ── */}
          {showM2ECSceneBuilder && (
            <>
              {/* What students are doing */}
              <div className="glass-card !border-bw-pink/20 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="led led-writing" style={{ background: "#EC4899", boxShadow: "0 0 8px rgba(236,72,153,0.5)" }} />
                  <span className="text-sm font-semibold text-bw-pink">Étape 2 — Construction de scène</span>
                </div>
                <p className="text-xs text-bw-muted leading-relaxed">
                  Chaque élève construit une scène autour de <span className="text-bw-heading font-medium">l'émotion qu'il a choisie</span>.
                  Il rédige <span className="text-bw-heading font-medium">intention + obstacle + changement</span>,
                  puis choisit des éléments de mise en scène.
                </p>
                <div className="flex gap-3 text-xs">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-bw-bg border border-white/[0.06]">
                    <span>📦</span><span className="text-bw-text">{MAX_SLOTS} emplacements</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-bw-bg border border-white/[0.06]">
                    <span>🪙</span><span className="text-bw-text">{MAX_TOKENS} jetons max</span>
                  </div>
                </div>
              </div>

              {/* Emotions available */}
              <div className="bg-bw-surface rounded-xl p-4 border border-white/[0.06] space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">5 émotions proposées</span>
                <div className="flex flex-wrap gap-1.5">
                  {EMOTIONS.map((emo) => (
                    <span key={emo.key} className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ backgroundColor: `${emo.color}20`, color: emo.color }}>
                      {emo.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Elements catalog by tier */}
              <div className="bg-bw-surface rounded-xl p-4 border border-white/[0.06] space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Éléments de mise en scène</span>
                {[0, 1, 2, 3].map((tier) => {
                  const tierElements = SCENE_ELEMENTS.filter(e => e.tier === tier);
                  return (
                    <div key={tier} className="space-y-1">
                      <span className="text-[10px] font-medium" style={{ color: TIER_COLORS[tier] }}>
                        {TIER_LABELS[tier]}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {tierElements.map((el) => (
                          <span key={el.key} className="text-[10px] px-1.5 py-0.5 rounded border"
                            style={{ borderColor: `${TIER_COLORS[tier]}30`, color: TIER_COLORS[tier], backgroundColor: `${TIER_COLORS[tier]}08` }}>
                            {el.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live stats — submissions */}
              {module5Data?.type === "scene-builder" && (
                <div className="bg-bw-pink/10 rounded-xl p-4 border border-bw-pink/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-bw-pink font-medium">Scènes construites</span>
                    <span className="text-xl font-bold text-bw-pink tabular-nums">
                      {module5Data.submittedCount || 0}/{activeStudents.length}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-bw-bg rounded-full overflow-hidden">
                    <div className="h-full bg-bw-pink rounded-full transition-all"
                      style={{ width: `${activeStudents.length > 0 ? Math.round(((module5Data.submittedCount || 0) / activeStudents.length) * 100) : 0}%` }} />
                  </div>
                </div>
              )}

              {/* Emotion distribution when available */}
              {module5Data?.emotionDistribution && Object.keys(module5Data.emotionDistribution).length > 0 && (() => {
                const totalEmotions = Object.values(module5Data.emotionDistribution!).reduce((a, b) => a + b, 0);
                return (
                  <div className="bg-bw-surface rounded-xl p-4 border border-white/[0.06] space-y-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Distribution des émotions choisies</span>
                    {Object.entries(module5Data.emotionDistribution!).sort(([,a], [,b]) => b - a).map(([key, count], i) => {
                      const emo = EMOTIONS.find(e => e.key === key);
                      const pct = totalEmotions > 0 ? Math.round((count / totalEmotions) * 100) : 0;
                      return (
                        <motion.div key={key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium" style={{ color: emo?.color || "#EC4899" }}>{emo?.label || key}</span>
                            <span className="text-xs tabular-nums" style={{ color: emo?.color || "#EC4899" }}>{pct}% ({count})</span>
                          </div>
                          <div className="h-2 bg-bw-bg rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5, delay: i * 0.08 }}
                              className="h-full rounded-full" style={{ backgroundColor: emo?.color || "#EC4899" }} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Scene cards from scenesData */}
              {scenesData && scenesData.scenes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Scènes des élèves ({scenesData.count})</span>
                  {scenesData.scenes.map((sc, i) => {
                    const emo = EMOTIONS.find(e => e.key === sc.emotion);
                    return (
                      <motion.div key={sc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="bg-bw-surface rounded-xl p-3 border border-white/[0.06] space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{sc.students?.avatar || "👤"}</span>
                          <span className="text-sm font-medium text-bw-heading">{sc.students?.display_name || "Élève"}</span>
                          <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: `${emo?.color || "#EC4899"}20`, color: emo?.color || "#EC4899" }}>
                            {emo?.label || sc.emotion}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs text-bw-muted">
                          <div><span className="text-bw-muted">Intention:</span> {sc.intention}</div>
                          <div><span className="text-bw-muted">Obstacle:</span> {sc.obstacle}</div>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {sc.elements.map((el) => {
                            const def = getElement(el.key);
                            return (
                              <span key={el.key} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-bw-text">
                                {def?.label || el.key}
                              </span>
                            );
                          })}
                          <span className="ml-auto text-[10px] text-bw-muted tabular-nums">{sc.tokens_used}🪙 {sc.slots_used}/5📦</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Waiting state when no scenes yet */}
              {(!scenesData || scenesData.scenes.length === 0) && session.status === "responding" && (
                <div className="bg-bw-surface rounded-xl border border-white/[0.06] p-6 text-center space-y-2">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="text-2xl">🎬</motion.div>
                  <p className="text-sm text-bw-muted">En attente des scènes...</p>
                  <p className="text-xs text-bw-muted">{activeStudents.length} élève{activeStudents.length > 1 ? "s" : ""} connecté{activeStudents.length > 1 ? "s" : ""}</p>
                </div>
              )}
            </>
          )}

          {/* ── MODULE 2 EC: Comparison cockpit (séance 3) ── */}
          {showM2ECComparison && (
            <>
              {/* What students are doing */}
              <div className="glass-card !border-bw-pink/20 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="led led-writing" style={{ background: "#EC4899", boxShadow: "0 0 8px rgba(236,72,153,0.5)" }} />
                  <span className="text-sm font-semibold text-bw-pink">Étape 3 — Confrontation</span>
                </div>
                <p className="text-xs text-bw-muted leading-relaxed">
                  Sélectionnez <span className="text-bw-heading font-medium">2 scènes</span> à projeter côte-à-côte.
                  La classe compare les choix narratifs et les éléments de mise en scène.
                </p>
              </div>

              {/* Scene picker — teacher selects 2 scenes */}
              {scenesData && scenesData.scenes.length > 0 && (
                <div className="space-y-3">
                  <div className="bg-bw-pink/10 rounded-xl p-4 border border-bw-pink/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-bw-pink font-medium">{scenesData.count} scène{scenesData.count > 1 ? "s" : ""} disponible{scenesData.count > 1 ? "s" : ""}</span>
                      <span className="text-xs text-bw-muted">{selectedSceneIds.length}/2 sélectionnée{selectedSceneIds.length > 1 ? "s" : ""}</span>
                    </div>
                    {selectedSceneIds.length === 2 && (
                      <button
                        onClick={() => selectComparison.mutate({ sceneAId: selectedSceneIds[0], sceneBId: selectedSceneIds[1] })}
                        disabled={selectComparison.isPending}
                        className="btn-glow w-full py-2 bg-bw-pink text-white rounded-xl text-sm font-medium cursor-pointer hover:brightness-110 disabled:opacity-50 transition-all duration-200 shadow-md shadow-bw-pink/20">
                        {selectComparison.isPending ? "Envoi..." : "Projeter ces 2 scènes"}
                      </button>
                    )}
                    {selectedSceneIds.length > 0 && selectedSceneIds.length < 2 && (
                      <p className="text-xs text-bw-amber">Encore {2 - selectedSceneIds.length} scène à sélectionner</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    {scenesData.scenes.map((sc, i) => {
                      const emo = EMOTIONS.find(e => e.key === sc.emotion);
                      const isSelected = selectedSceneIds.includes(sc.id);
                      return (
                        <motion.div key={sc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => {
                            setSelectedSceneIds(prev => {
                              if (prev.includes(sc.id)) return prev.filter(id => id !== sc.id);
                              if (prev.length >= 2) return [prev[1], sc.id];
                              return [...prev, sc.id];
                            });
                          }}
                          className={`bg-bw-surface rounded-xl p-3 border-2 cursor-pointer transition-all space-y-2 ${
                            isSelected ? "border-bw-pink/60 bg-bw-pink/5" : "border-white/[0.06] hover:border-white/[0.12]"
                          }`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${
                              isSelected ? "border-bw-pink bg-bw-pink text-white" : "border-bw-muted"
                            }`}>
                              {isSelected && (selectedSceneIds.indexOf(sc.id) === 0 ? "A" : "B")}
                            </div>
                            <span className="text-base">{sc.students?.avatar || "👤"}</span>
                            <span className="text-sm font-medium text-bw-heading">{sc.students?.display_name || "Élève"}</span>
                            <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: `${emo?.color || "#EC4899"}20`, color: emo?.color || "#EC4899" }}>
                              {emo?.label || sc.emotion}
                            </span>
                          </div>
                          <div className="text-xs text-bw-muted pl-7 space-y-0.5">
                            <div><span className="text-bw-muted">Intention:</span> {sc.intention}</div>
                            <div><span className="text-bw-muted">Obstacle:</span> {sc.obstacle}</div>
                            <div><span className="text-bw-muted">Changement:</span> {sc.changement}</div>
                          </div>
                          <div className="flex items-center gap-1 flex-wrap pl-7">
                            {sc.elements.map((el) => {
                              const def = getElement(el.key);
                              return (
                                <span key={el.key} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-bw-text">
                                  {def?.label || el.key}
                                </span>
                              );
                            })}
                            <span className="ml-auto text-[10px] text-bw-muted tabular-nums">{sc.tokens_used}🪙 {sc.slots_used}/5📦</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Waiting state when no scenes yet */}
              {(!scenesData || scenesData.scenes.length === 0) && (
                <div className="bg-bw-surface rounded-xl border border-white/[0.06] p-8 text-center space-y-2">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="text-3xl">⚔️</motion.div>
                  <p className="text-sm text-bw-muted">En attente des scènes des élèves...</p>
                </div>
              )}
            </>
          )}

          {/* ── VOTE RESULTS (Standard Q&A) ── */}
          {isStandardQA && (session.status === "voting" || session.status === "reviewing") && voteData && voteData.results.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Resultats du vote</span>
                <span className="text-sm text-bw-muted">{voteData.totalVotes} vote{voteData.totalVotes > 1 ? "s" : ""}</span>
              </div>
              {voteData.results.map((vr, i) => {
                const pct = voteData.totalVotes > 0 ? Math.round((vr.count / voteData.totalVotes) * 100) : 0;
                return (
                  <motion.div key={vr.response.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-bw-surface rounded-xl p-4 border ${i === 0 ? "border-bw-primary/30" : "border-white/[0.06]"}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span>{vr.response.students?.avatar}</span>
                        <span className="text-sm font-medium text-bw-text">{vr.response.students?.display_name}</span>
                      </div>
                      <span className="text-lg font-bold tabular-nums" style={{ color: i === 0 ? "#FF6B35" : "#888" }}>{pct}%</span>
                    </div>
                    <p className="text-sm mb-2 text-bw-heading">{vr.response.text}</p>
                    <div className="w-full bg-bw-bg rounded-full h-2 overflow-hidden mb-2">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: i === 0 ? "#FF6B35" : "#4ECDC4" }} />
                    </div>
                    {vr.voters.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {vr.voters.map((v, j) => (
                          <span key={j} className="text-xs bg-bw-bg px-2 py-0.5 rounded-full text-bw-text">{v.avatar} {v.display_name}</span>
                        ))}
                      </div>
                    )}
                    {i === 0 && vr.count > 0 && session.status === "reviewing" && (
                      <button onClick={() => {
                        const fakeResponse: Response = { id: vr.response.id, student_id: "", situation_id: "", text: vr.response.text, submitted_at: "", is_hidden: false, is_vote_option: true, is_highlighted: false, teacher_comment: null, students: vr.response.students };
                        setReformulating(fakeResponse);
                        setReformulatedText(vr.response.text);
                      }}
                        className="btn-glow mt-3 px-4 py-2 bg-bw-primary text-white rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 hover:brightness-110 shadow-md shadow-bw-primary/20">
                        Valider comme choix collectif
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Voting empty state — no votes yet */}
          {isStandardQA && (session.status === "voting" || session.status === "reviewing") && (!voteData || voteData.totalVotes === 0) && (
            <div className="bg-bw-surface rounded-xl border border-white/[0.06] p-6 text-center space-y-2">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                className="text-2xl">🗳️</motion.div>
              <p className="text-sm text-bw-muted">Vote en cours...</p>
              <p className="text-xs text-bw-muted">Les résultats apparaîtront au fur et à mesure</p>
            </div>
          )}

          {/* ── INLINE REFORMULATION ── */}
          <AnimatePresence>
            {reformulating && (
              <InlineReformulation
                response={reformulating as ResponseCardResponse}
                onValidate={(text) => { validateChoice.mutate({ response: reformulating, text }); }}
                onCancel={() => setReformulating(null)}
                isPending={validateChoice.isPending}
              />
            )}
          </AnimatePresence>

          {/* ── RESPONSE STREAM (Standard Q&A — responding) ── */}
          {isStandardQA && session.status !== "done" && session.status !== "paused" && !(session.status === "voting" || session.status === "reviewing") && (
            <div className="space-y-2">
              {/* Header: title + animated counter */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Réponses</span>
                <motion.span
                  key={respondedCount}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-sm text-bw-teal font-medium tabular-nums"
                >
                  {respondedCount}/{activeStudents.length}
                </motion.span>
              </div>

              {/* Filter chips + sort toggle */}
              {responses.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {([
                    { key: "all" as const, label: `Toutes (${responses.length})` },
                    { key: "visible" as const, label: `Visibles (${visibleResponses.length})` },
                    { key: "highlighted" as const, label: `En avant (${highlightedCount})` },
                  ]).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setResponseFilter(f.key)}
                      className={`px-2 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-colors duration-200 ${
                        responseFilter === f.key
                          ? "bg-bw-teal/15 text-bw-teal border border-bw-teal/30"
                          : "bg-bw-elevated text-bw-muted border border-white/[0.06] hover:text-bw-text"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <button
                    onClick={() => {
                      const ids = visibleResponses.filter((r) => !r.ai_score).map((r) => r.id);
                      if (ids.length === 0) { toast("Toutes les réponses sont déjà évaluées"); return; }
                      aiEvaluate.mutate(ids.slice(0, 20));
                    }}
                    disabled={aiEvaluate.isPending}
                    className="px-2 py-1 rounded-lg text-[10px] text-bw-violet hover:bg-bw-violet/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06] disabled:opacity-40"
                    title="Évaluer les réponses par IA"
                  >
                    {aiEvaluate.isPending ? "IA..." : "🤖 Évaluer IA"}
                  </button>
                  {session.status === "responding" && situation && (
                    <button
                      onClick={() => {
                        if (confirm("Relancer la question pour toute la classe ? Les réponses précédentes seront conservées.")) {
                          resetAllResponses.mutate(situation!.id);
                        }
                      }}
                      disabled={resetAllResponses.isPending}
                      className="px-2 py-1 rounded-lg text-[10px] text-amber-400 hover:bg-amber-400/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06] disabled:opacity-40"
                      title="Relancer la question pour toute la classe"
                    >
                      {resetAllResponses.isPending ? "Relance..." : "🔄 Relancer tous"}
                    </button>
                  )}
                  <button
                    onClick={() => setResponseSortMode((prev) => prev === "time" ? "highlighted" : "time")}
                    className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-text cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]"
                    title={responseSortMode === "time" ? "Tri chronologique" : "Tri par mise en avant"}
                  >
                    {responseSortMode === "time" ? "⏱ Chrono" : "⭐ Priorité"}
                  </button>
                </div>
              )}

              {filteredResponses.length > 0 ? (
                <ResponseStream
                  responses={filteredResponses as ResponseCardResponse[]}
                  sessionStatus={session.status}
                  winnerResponseId={winnerResponseId}
                  onToggleSelect={(id, current) => toggleVoteOption.mutate({ responseId: id, is_vote_option: !current })}
                  onToggleHide={(id, current) => toggleHide.mutate({ responseId: id, is_hidden: !current })}
                  onValidate={session.status === "reviewing" ? (r) => {
                    setReformulating(r as unknown as Response);
                    setReformulatedText(r.text);
                  } : undefined}
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
                  studentWarnings={studentWarnings}
                />
              ) : responses.length > 0 && filteredResponses.length === 0 ? (
                <div className="bg-bw-surface rounded-xl border border-white/[0.06] p-4 text-center">
                  <p className="text-xs text-bw-muted">Aucune réponse dans ce filtre</p>
                </div>
              ) : session.status === "responding" ? (
                <div className="bg-bw-surface rounded-xl border border-white/[0.06] p-8 text-center space-y-2">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="text-3xl">✍️</motion.div>
                  <p className="text-sm text-bw-muted">En attente des réponses...</p>
                  <p className="text-sm text-bw-muted">{activeStudents.length} élève{activeStudents.length > 1 ? "s" : ""} connecté{activeStudents.length > 1 ? "s" : ""}</p>
                </div>
              ) : null}
            </div>
          )}

          {/* ── RESPONSES LIST (M1/Budget — simpler display) ── */}
          {!isStandardQA && session.status !== "done" && responses.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Reponses</span>
                <div className="flex items-center gap-2">
                  {hiddenCount > 0 && (
                    <span className="text-xs text-bw-muted">{hiddenCount} masquee{hiddenCount > 1 ? "s" : ""}</span>
                  )}
                  <span className="text-sm text-bw-teal font-medium tabular-nums">{responses.filter(r => !r.reset_at).length}/{activeStudents.length}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {responses.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`bg-bw-surface rounded-xl p-3 border transition-colors duration-200 ${
                      r.is_highlighted ? "border-bw-primary/30 shadow-[0_0_8px_rgba(255,107,53,0.1)]" : r.reset_at ? "border-amber-400/20" : "border-white/[0.06]"
                    } ${r.is_hidden ? "opacity-30" : ""} ${r.reset_at ? "opacity-50" : ""}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-sm">{r.students?.avatar}</span>
                          <span className={`text-sm font-medium text-bw-text ${r.is_hidden ? "line-through" : ""}`}>{r.students?.display_name}</span>
                          {r.reset_at && (
                            <span className="text-[9px] px-1.5 py-px rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/20">relancé</span>
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed text-bw-heading ${r.is_hidden ? "line-through text-bw-muted" : ""} ${r.reset_at ? "line-through text-bw-muted" : ""}`}>{r.text}</p>
                        {r.teacher_comment && <TeacherCommentBadge comment={r.teacher_comment} />}
                      </div>
                      {session.status === "responding" && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => toggleHide.mutate({ responseId: r.id, is_hidden: !r.is_hidden })}
                            disabled={toggleHide.isPending}
                            className="px-2 py-1 text-xs rounded-lg hover:bg-white/5 cursor-pointer transition-colors text-bw-muted hover:text-bw-text">
                            {r.is_hidden ? "Montrer" : "Masquer"}
                          </button>
                          {!r.is_hidden && !r.reset_at && (
                            <button onClick={() => resetResponse.mutate(r.id)}
                              disabled={resetResponse.isPending}
                              className="px-1.5 py-1 text-xs rounded-lg hover:bg-amber-400/10 cursor-pointer transition-colors text-amber-400/70 hover:text-amber-400"
                              title="Relancer la question pour cet élève">
                              🔄
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {!r.is_hidden && (
                      <InlineActions
                        responseId={r.id} studentId={r.student_id} studentName={r.students?.display_name || ""}
                        isHighlighted={r.is_highlighted || false} teacherComment={r.teacher_comment || null}
                        isCommenting={commentingResponse === r.id} commentText={commentText}
                        onComment={(id, comment) => { commentResponse.mutate({ responseId: id, comment }); setCommentingResponse(null); setCommentText(""); }}
                        onHighlight={(id, highlighted) => highlightResponse.mutate({ responseId: id, highlighted })}
                        onNudge={(id, text) => nudgeStudent.mutate({ responseId: id, nudgeText: text })}
                        onWarn={(sid) => warnStudent.mutate(sid)}
                        onScore={(id, score) => scoreResponse.mutate({ responseId: id, score })}
                        onStartComment={() => { setCommentingResponse(r.id); setCommentText(r.teacher_comment || ""); }}
                        onCancelComment={() => { setCommentingResponse(null); setCommentText(""); }}
                        onChangeComment={setCommentText}
                        isNudgePending={nudgeStudent.isPending} isCommentPending={commentResponse.isPending}
                        isWarnPending={warnStudent.isPending} isScorePending={scoreResponse.isPending}
                        warnings={studentWarnings[r.student_id] || 0}
                        teacherScore={r.teacher_score || 0}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* M1/Budget empty state */}
          {!isStandardQA && session.status === "responding" && responses.length === 0 && !isBudgetQuiz && !isM2ECChecklist && !isM2ECSceneBuilder && !isM2ECComparison && (
            <div className="bg-bw-surface rounded-xl border border-white/[0.06] p-8 text-center space-y-2">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                className="text-3xl">✍️</motion.div>
              <p className="text-sm text-bw-muted">En attente des reponses...</p>
            </div>
          )}

          {/* Choices history (Standard Q&A) */}
          {isStandardQA && collectiveChoices.length > 0 && (
            <ChoicesHistory choices={collectiveChoices} />
          )}
        </div>
      </main>

      {/* ── STICKY BOTTOM BAR — the ONE action ── */}
      {session.status !== "done" && session.status !== "paused" && (
        <div className="fixed bottom-0 z-30 glass border-t border-white/[0.08]"
          style={{ left: `${sidebarWidth}px`, right: `${rightPanelWidth}px` }}>
          <div className="max-w-2xl mx-auto px-4 py-3 space-y-2">
            {/* Main CTA */}
            {session.status === "waiting" ? (
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (isPreviewing) {
                    // First navigate to the previewed question, then open responses
                    setPreviewIndex(null);
                    updateSession.mutate({ current_situation_index: displayIndex, status: "responding", timer_ends_at: null });
                  } else {
                    updateSession.mutate({ status: "responding", timer_ends_at: null });
                  }
                }}
                disabled={updateSession.isPending}
                className={`w-full max-w-lg mx-auto py-3.5 px-8 rounded-xl font-semibold text-[15px] cursor-pointer transition-all duration-300 disabled:opacity-50 text-white ${
                  isPreviewing
                    ? "bg-bw-amber btn-glow-amber"
                    : "bg-bw-teal btn-glow-teal"
                }`}
                style={{ boxShadow: isPreviewing ? "0 0 24px rgba(245,158,11,0.3), 0 0 60px rgba(245,158,11,0.1)" : undefined }}>
                {isPreviewing ? `Lancer Q${displayIndex + 1}` : "Ouvrir les réponses"}
              </motion.button>
            ) : isStandardQA && session.status !== "waiting" ? (
              <SelectionBar
                status={session.status}
                responsesCount={responses.length}
                totalStudents={activeStudents.length}
                selectedCount={voteOptionCount}
                totalVotes={voteData?.totalVotes}
                onAction={handleSelectionBarAction}
                actionDisabled={
                  (session.status === "responding" && voteOptionCount < 2) ||
                  (session.status === "voting" && (!voteData || voteData.totalVotes === 0))
                }
                isPending={updateSession.isPending}
              />
            ) : nextAction ? (
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={handleNextAction}
                disabled={updateSession.isPending || !!(nextAction as { disabled?: boolean }).disabled}
                className="btn-glow w-full py-4 rounded-2xl font-bold text-base cursor-pointer transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                style={{ backgroundColor: nextAction.color, color: nextAction.color === "#F59E0B" || nextAction.color === "#888" ? "black" : "white" }}>
                {nextAction.label}
              </motion.button>
            ) : (
              <div className="w-full py-4 rounded-2xl text-base text-center bg-bw-elevated text-bw-muted border border-white/[0.06]">
                {session.status === "responding"
                  ? `En attente... (${respondedCount}/${activeStudents.length})`
                  : session.status === "voting"
                    ? `Vote en cours... (${voteData?.totalVotes || 0} votes)`
                    : "En attente..."}
              </div>
            )}

            {/* Timer row */}
            {(session.status === "responding" || session.status === "voting") && !session.timer_ends_at && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-bw-muted">Timer</span>
                {[30, 60, 90].map((sec) => (
                  <button key={sec}
                    onClick={() => updateSession.mutate({ timer_ends_at: new Date(Date.now() + sec * 1000).toISOString() })}
                    className="px-3 py-1.5 rounded-xl text-sm bg-bw-elevated border border-white/[0.06] hover:border-white/15 text-bw-text cursor-pointer transition-colors duration-200">
                    {sec}s
                  </button>
                ))}
              </div>
            )}

            {/* Sharing toggle — allow students to see class responses */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-bw-muted">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
                <span className="text-xs text-bw-muted">Partage des réponses</span>
              </div>
              <button
                onClick={() => updateSession.mutate({ sharing_enabled: !session.sharing_enabled })}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${
                  session.sharing_enabled ? "bg-bw-teal" : "bg-bw-elevated border border-white/[0.1]"
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                  session.sharing_enabled ? "translate-x-5" : "translate-x-0.5"
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STUDENTS DRAWER (slide from right) ── */}
      <AnimatePresence>
        {showStudents && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setShowStudents(false)} />
            <motion.div
              initial={{ x: 320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 320, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-[300px] glass overflow-y-auto">
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Joueurs</span>
                  <button onClick={() => setShowStudents(false)}
                    className="text-bw-muted hover:text-white text-sm cursor-pointer">Fermer</button>
                </div>
                <span className="text-xs text-bw-muted tabular-nums">{activeStudents.length}/{totalStudents} connectes</span>
                <div className="space-y-1">
                  {session.students?.map((s) => {
                    const st = studentStates.find((ss) => ss.id === s.id);
                    const ledClass = st?.state === "responded" ? "led led-done"
                      : st?.state === "stuck" ? "led led-writing"
                      : st?.state === "active" ? "led led-active" : "led led-idle";
                    return (
                      <div key={s.id}
                        onClick={() => onSelectStudent(s)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm group transition-all duration-200 cursor-pointer hover:bg-bw-elevated ${
                          s.is_active ? "bg-bw-bg" : "opacity-40"
                        }`}>
                        <div className={ledClass} />
                        <span className="text-base">{s.avatar}</span>
                        <span className="truncate flex-1 text-bw-text">{s.display_name}</span>
                        {st?.state === "responded" && <span className="text-bw-teal text-xs font-medium flex-shrink-0">OK</span>}
                        {st?.state === "stuck" && <span className="text-bw-amber text-xs flex-shrink-0">...</span>}
                        {s.warnings > 0 && <span className="text-[10px] text-bw-amber">⚠️ {s.warnings}</span>}
                        {s.is_active && (
                          <button onClick={(e) => { e.stopPropagation(); if (confirm(`Retirer ${s.display_name} ?`)) removeStudent.mutate(s.id); }}
                            className="opacity-0 group-hover:opacity-100 text-bw-muted hover:text-red-400 cursor-pointer transition-all duration-200">✕</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


    </div>
  );
}

// ——————————————————————————————————————————————————————
// MAIN PAGE — Unified layout with sidebar
// ——————————————————————————————————————————————————————

const SIDEBAR_WIDTH_EXPANDED = 240;
const SIDEBAR_WIDTH_COLLAPSED = 56;
const RIGHT_PANEL_WIDTH = 280;

export default function PilotPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Briefing / cockpit flow
  const [moduleView, setModuleView] = useState<"briefing" | "cockpit">("cockpit");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("pilot-right-panel") !== "false";
  });

  // Persist sidebar collapsed state — collapsed by default
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("pilot-sidebar-collapsed") !== "false";
  });

  function toggleSidebar() {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("pilot-sidebar-collapsed", String(next));
      return next;
    });
  }

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCheckingAuth(false);
    }
    check();
  }, [router]);

  // Session with polling
  const { data: session, isLoading: sessionLoading } = useQuery<Session>({
    queryKey: ["pilot-session", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) throw new Error("Session introuvable");
      return res.json();
    },
    refetchInterval: 3000,
    enabled: !checkingAuth,
  });

  // Determine active module
  const activeModule = session ? getModuleByDb(session.current_module, session.current_seance || 1) : undefined;
  const hasActiveModule = !!activeModule && !activeModule.disabled;

  // Current situation — fetch whenever a module is active
  const { data: situationData } = useQuery({
    queryKey: ["pilot-situation", sessionId, session?.current_module, session?.current_seance, session?.current_situation_index],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/situation`);
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 5000,
    enabled: !checkingAuth && !!session && hasActiveModule,
  });

  const situation = (situationData as { situation?: { id: string } })?.situation;

  // Extract Module 1 situation IDs for the current séance
  const isModule1 = session?.current_module === 1;
  const m1SituationIds = isModule1
    ? (() => {
        const m1 = (situationData as { module1?: { type: string; questions?: { situationId: string | null }[]; question?: { situationId: string } } })?.module1;
        if (!m1) return [];
        if (m1.type === "positioning" && m1.questions) {
          return m1.questions.map((q) => q.situationId).filter((id): id is string => !!id);
        }
        if ((m1.type === "image" || m1.type === "notebook") && m1.question?.situationId) {
          return [m1.question.situationId];
        }
        return [];
      })()
    : [];

  // Responses
  const { data: responses = [] } = useQuery<Response[]>({
    queryKey: ["pilot-responses", sessionId, isModule1 ? `m1-seance${session?.current_seance}` : situation?.id],
    queryFn: async () => {
      if (isModule1) {
        if (m1SituationIds.length === 0) return [];
        const params = new URLSearchParams();
        m1SituationIds.forEach((id) => params.append("situationIds", id));
        const res = await fetch(`/api/sessions/${sessionId}/responses?${params.toString()}`);
        if (!res.ok) return [];
        return res.json();
      }
      if (!situation?.id) return [];
      const res = await fetch(`/api/sessions/${sessionId}/responses?situationId=${situation.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 3000,
    enabled: !checkingAuth && (!!situation || (isModule1 && m1SituationIds.length > 0)) && hasActiveModule,
  });

  // Vote results
  const { data: voteData } = useQuery<{ totalVotes: number; results: VoteResult[] }>({
    queryKey: ["pilot-votes", sessionId, situation?.id],
    queryFn: async () => {
      if (!situation?.id) return { totalVotes: 0, results: [] };
      const res = await fetch(`/api/sessions/${sessionId}/votes?situationId=${situation.id}`);
      if (!res.ok) return { totalVotes: 0, results: [] };
      return res.json();
    },
    refetchInterval: 3000,
    enabled: !checkingAuth && !!situation && hasActiveModule && (session?.status === "voting" || session?.status === "reviewing"),
  });

  // Collective choices history (Module 3/4)
  const { data: collectiveChoices = [] } = useQuery<CollectiveChoice[]>({
    queryKey: ["pilot-choices", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/collective-choice`);
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 5000,
    enabled: !checkingAuth && !!session && hasActiveModule && (session?.current_module === 3 || session?.current_module === 4),
  });

  // Mutations
  const updateSession = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pilot-session", sessionId] }),
    onError: () => toast.error("Erreur de mise à jour"),
  });

  const removeStudent = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await fetch(`/api/sessions/${sessionId}/students/${studentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-session", sessionId] });
      toast.success("Joueur retiré");
    },
    onError: () => toast.error("Erreur"),
  });

  const validateChoice = useMutation({
    mutationFn: async ({ response, text }: { response: Response; text: string }) => {
      const sit = (situationData as { situation?: { id: string; category: string; restitutionLabel: string } })?.situation;
      const res = await fetch(`/api/sessions/${sessionId}/collective-choice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situationId: sit?.id,
          category: sit?.category,
          restitutionLabel: sit?.restitutionLabel,
          chosenText: text,
          sourceResponseId: response.id,
        }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Choix collectif validé !");
      updateSession.mutate({ status: "reviewing" });
    },
    onError: () => toast.error("Erreur de validation"),
  });

  const toggleHide = useMutation({
    mutationFn: async ({ responseId, is_hidden }: { responseId: string; is_hidden: boolean }) => {
      const res = await fetch(`/api/sessions/${sessionId}/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_hidden }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pilot-responses", sessionId] }),
    onError: () => toast.error("Erreur de modération"),
  });

  const toggleVoteOption = useMutation({
    mutationFn: async ({ responseId, is_vote_option }: { responseId: string; is_vote_option: boolean }) => {
      const res = await fetch(`/api/sessions/${sessionId}/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_vote_option }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pilot-responses", sessionId] }),
    onError: () => toast.error("Erreur de sélection"),
  });

  const commentResponse = useMutation({
    mutationFn: async ({ responseId, comment }: { responseId: string; comment: string | null }) => {
      const res = await fetch(`/api/sessions/${sessionId}/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_comment: comment }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-responses", sessionId] });
      toast.success("Commentaire envoyé");
    },
    onError: () => toast.error("Erreur"),
  });

  const highlightResponse = useMutation({
    mutationFn: async ({ responseId, highlighted }: { responseId: string; highlighted: boolean }) => {
      const res = await fetch(`/api/sessions/${sessionId}/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_highlighted: highlighted }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-responses", sessionId] });
    },
    onError: () => toast.error("Erreur"),
  });

  const nudgeStudent = useMutation({
    mutationFn: async ({ responseId, nudgeText }: { responseId: string; nudgeText: string }) => {
      const res = await fetch(`/api/sessions/${sessionId}/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_nudge: nudgeText }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => toast.success("Message envoyé à l'élève"),
    onError: () => toast.error("Erreur d'envoi"),
  });

  const warnStudent = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await fetch(`/api/sessions/${sessionId}/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "warn" }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: (data: { warnings: number; kicked: boolean }) => {
      queryClient.invalidateQueries({ queryKey: ["pilot-session", sessionId] });
      if (data.kicked) {
        toast.error("Élève exclu (3 avertissements)");
      } else {
        toast("Avertissement envoyé (" + data.warnings + "/3)", { icon: "⚠️" });
      }
    },
    onError: () => toast.error("Erreur"),
  });

  const scoreResponse = useMutation({
    mutationFn: async ({ responseId, score }: { responseId: string; score: number }) => {
      const res = await fetch(`/api/sessions/${sessionId}/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_score: score }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-responses", sessionId] });
      toast.success("Note enregistrée");
    },
    onError: () => toast.error("Erreur de notation"),
  });

  const aiEvaluate = useMutation({
    mutationFn: async (responseIds: string[]) => {
      const res = await fetch(`/api/sessions/${sessionId}/responses/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseIds }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-responses", sessionId] });
      toast.success("Évaluation IA terminée");
    },
    onError: () => toast.error("Erreur évaluation IA"),
  });

  const resetResponse = useMutation({
    mutationFn: async (responseId: string) => {
      const res = await fetch(`/api/sessions/${sessionId}/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-responses", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["pilot-session", sessionId] });
      toast.success("Question relancée pour cet élève");
    },
    onError: () => toast.error("Erreur de relance"),
  });

  const resetAllResponses = useMutation({
    mutationFn: async (situationId: string) => {
      const res = await fetch(`/api/sessions/${sessionId}/reset-responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situationId }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: (data: { resetCount: number }) => {
      queryClient.invalidateQueries({ queryKey: ["pilot-responses", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["pilot-session", sessionId] });
      toast.success(`Question relancée pour ${data.resetCount} élève${data.resetCount > 1 ? "s" : ""}`);
    },
    onError: () => toast.error("Erreur de relance"),
  });

  // State for comment popover
  const [commentingResponse, setCommentingResponse] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const copyCode = useCallback(() => {
    if (!session) return;
    navigator.clipboard.writeText(session.join_code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }, [session]);

  // Module selection — shows briefing (does NOT touch session)
  function handleSelectModule(moduleId: string) {
    const mod = MODULES.find((m) => m.id === moduleId);
    if (!mod || mod.disabled) return;
    setSelectedModuleId(moduleId);
    setModuleView("briefing");
    setMobileSidebarOpen(false);
  }

  // Launch module — actually switches the session
  function handleLaunchModule() {
    if (!selectedModuleId) return;
    const mod = MODULES.find((m) => m.id === selectedModuleId);
    if (!mod) return;

    const isAlreadyCurrent = session &&
      session.current_module === mod.dbModule &&
      (session.current_seance || 1) === mod.dbSeance;

    if (!isAlreadyCurrent) {
      markCurrentModuleCompleted();
      updateSession.mutate({
        current_module: mod.dbModule,
        current_seance: mod.dbSeance,
        current_situation_index: 0,
        status: "waiting",
      });
    }
    setModuleView("cockpit");
  }

  // Resume module — back to cockpit without reset
  function handleResumeModule() {
    setModuleView("cockpit");
  }

  // Marks the current module as completed when switching away
  function markCurrentModuleCompleted() {
    if (!session) return;
    let newCompleted = session.completed_modules || [];
    const currentMod = getModuleByDb(session.current_module, session.current_seance || 1);
    if (currentMod) {
      const s = session.current_seance || 1;
      const maxSit = (session.current_module === 1 && s === 1) ? 8
        : (session.current_module === 1 && s >= 2) ? 1
        : session.current_module === 4 ? 8
        : getSeanceMax(session.current_module, s);
      const isLastQ = (session.current_situation_index || 0) >= maxSit - 1;
      const isBudgetDone = session.current_module === 9 && s === 2 && session.status === "reviewing";

      if ((isLastQ || isBudgetDone) && !newCompleted.includes(currentMod.id)) {
        newCompleted = [...newCompleted, currentMod.id];
        updateSession.mutate({ completed_modules: newCompleted });
      }
    }
  }

  // Called when cockpit reaches the end of a module (last Q or done)
  function handleModuleComplete() {
    markCurrentModuleCompleted();
    // Reset status so the sidebar shows completion, but don't change view
    updateSession.mutate({ status: "waiting", current_situation_index: 0 });
  }

  // Question counter for top bar
  const questionCounter = useMemo(() => {
    if (!session || !activeModule) return null;
    const isM1Pos = session.current_module === 1 && (session.current_seance || 1) === 1;
    const isM1Image = session.current_module === 1 && (session.current_seance || 1) >= 2 && (session.current_seance || 1) <= 4;
    const isM1Notebook = session.current_module === 1 && (session.current_seance || 1) === 5;
    if (isM1Image || isM1Notebook) return null;
    const s = session.current_seance || 1;
    const maxSit = isM1Pos ? 8
      : session.current_module === 4 ? 8
      : getSeanceMax(session.current_module, s);
    return `Q${(session.current_situation_index || 0) + 1}/${maxSit}`;
  }, [session, activeModule]);

  // Compute student states at PilotPage level (needed by ContextPanel + CockpitContent)
  const pageStudentStates = useMemo(() => {
    if (!session?.students) return [];
    return session.students.map((s) => {
      const hasResponded = responses.some((r) => r.student_id === s.id);
      if (!s.is_active) return { id: s.id, state: "disconnected" as const };
      if (hasResponded) return { id: s.id, state: "responded" as const };
      return { id: s.id, state: "active" as const };
    });
  }, [session?.students, responses]);

  // Question index & total for top bar dots
  const currentQuestionIndex = (session?.current_situation_index) || 0;
  const totalQuestions = useMemo(() => {
    if (!session || !activeModule) return 0;
    const isM1Pos = session.current_module === 1 && (session.current_seance || 1) === 1;
    const isM1Image = session.current_module === 1 && (session.current_seance || 1) >= 2 && (session.current_seance || 1) <= 4;
    const isM1Notebook = session.current_module === 1 && (session.current_seance || 1) === 5;
    if (isM1Image || isM1Notebook) return 0;
    const s = session.current_seance || 1;
    return isM1Pos ? 8 : session.current_module === 4 ? 8 : getSeanceMax(session.current_module, s);
  }, [session, activeModule]);

  // Track when module started responding (for sidebar timer)
  const [moduleStartedAt, setModuleStartedAt] = useState<string | null>(null);
  useEffect(() => {
    if (session?.status === "responding" && !moduleStartedAt) {
      setModuleStartedAt(new Date().toISOString());
    } else if (!session || session.status === "waiting" || session.status === "done") {
      setModuleStartedAt(null);
    }
  }, [session?.status, moduleStartedAt]);

  // ——— Loading & Error states ———
  if (checkingAuth || sessionLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bw-bg">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-bw-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bw-bg">
        <div className="text-center space-y-3">
          <p className="text-bw-muted">Session introuvable</p>
          <button onClick={() => router.push("/dashboard")} className="text-bw-primary text-sm cursor-pointer">← Dashboard</button>
        </div>
      </div>
    );
  }

  const activeStudents = session.students?.filter((s) => s.is_active) || [];
  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/join?code=${session.join_code}` : "";

  // ——— Unified Layout ———
  return (
    <div className="h-dvh flex flex-col bg-bw-bg">
      {/* ── TOP BAR ── */}
      <PilotTopBar
        sessionTitle={(session.title || "Session").replace(/\s*[-—]\s*$/, "")}
        activeModuleLabel={hasActiveModule ? activeModule!.title : null}
        moduleColor={activeModule?.color || "#FF6B35"}
        questionCounter={hasActiveModule ? questionCounter : null}
        activeStudents={activeStudents}
        joinCode={session.join_code}
        codeCopied={codeCopied}
        timerEndsAt={session.timer_ends_at}
        isPaused={session.status === "paused"}
        isDone={session.status === "done"}
        rightPanelOpen={rightPanelOpen}
        moduleView={moduleView}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => {
          // On mobile: toggle drawer; on desktop: toggle collapse
          if (typeof window !== "undefined" && window.innerWidth < 1024) {
            setMobileSidebarOpen((prev) => !prev);
          } else {
            toggleSidebar();
          }
        }}
        onCopyCode={copyCode}
        onToggleQR={() => setShowQR(!showQR)}
        onOpenScreen={() => window.open(`/session/${sessionId}/screen`, "_blank")}
        onToggleRightPanel={() => {
          setRightPanelOpen((prev) => {
            const next = !prev;
            localStorage.setItem("pilot-right-panel", String(next));
            return next;
          });
        }}
        onTogglePause={() => updateSession.mutate({ status: session.status === "paused" ? "waiting" : "paused" })}
        onClearTimer={() => updateSession.mutate({ timer_ends_at: null })}
        onToggleStudents={() => setShowStudents(!showStudents)}
        showStudents={showStudents}
        currentQuestionIndex={hasActiveModule ? currentQuestionIndex : undefined}
        totalQuestions={hasActiveModule ? totalQuestions : undefined}
      />

      {/* ── QR Panel ── */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/5 overflow-hidden flex-shrink-0"
          >
            <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-center gap-8">
              <div className="bg-white p-3 rounded-xl">
                <QRCodeSVG value={joinUrl} size={140} />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-bw-text">Les élèves scannent ce QR</p>
                <p className="font-mono font-bold text-3xl tracking-[0.3em]">{session.join_code}</p>
                <p className="text-xs text-bw-muted">ou vont sur <span className="text-bw-primary">banlieuwood.app/join</span></p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BODY: Sidebar + Main ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <ModuleSidebar
            collapsed={sidebarCollapsed}
            modules={MODULES}
            phases={PHASES}
            activeModuleId={activeModule?.id || null}
            selectedModuleId={moduleView === "briefing" ? selectedModuleId : null}
            completedModules={session.completed_modules || []}
            onSelectModule={handleSelectModule}
            onToggleCollapse={toggleSidebar}
            responsesCount={responses?.length || 0}
            moduleStartedAt={moduleStartedAt}
            sessionStatus={session.status}
          />
        </div>

        {/* Mobile sidebar drawer */}
        <MobileSidebarDrawer open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)}>
          <ModuleSidebar
            collapsed={false}
            modules={MODULES}
            phases={PHASES}
            activeModuleId={activeModule?.id || null}
            selectedModuleId={moduleView === "briefing" ? selectedModuleId : null}
            completedModules={session.completed_modules || []}
            onSelectModule={handleSelectModule}
            onToggleCollapse={() => setMobileSidebarOpen(false)}
            responsesCount={responses?.length || 0}
            moduleStartedAt={moduleStartedAt}
            sessionStatus={session.status}
          />
        </MobileSidebarDrawer>

        {/* Centre — contenu principal */}
        {selectedModuleId && moduleView === "briefing" ? (
          <ModuleBriefing
            module={MODULES.find((m) => m.id === selectedModuleId)!}
            phase={getPhaseForModule(selectedModuleId)}
            moduleGuide={getModuleGuide(selectedModuleId)}
            isInProgress={
              !!session && !!activeModule &&
              activeModule.id === selectedModuleId
            }
            isCompleted={session.completed_modules?.includes(selectedModuleId) || false}
            onLaunch={handleLaunchModule}
            onResume={handleResumeModule}
          />
        ) : hasActiveModule ? (
          <CockpitContent
            session={session}
            situationData={situationData}
            responses={responses}
            voteData={voteData}
            activeStudents={activeStudents}
            collectiveChoices={collectiveChoices}
            onModuleComplete={handleModuleComplete}
            updateSession={updateSession}
            toggleHide={toggleHide}
            toggleVoteOption={toggleVoteOption}
            validateChoice={validateChoice}
            removeStudent={removeStudent}
            commentResponse={commentResponse}
            highlightResponse={highlightResponse}
            nudgeStudent={nudgeStudent}
            warnStudent={warnStudent}
            scoreResponse={scoreResponse}
            aiEvaluate={aiEvaluate}
            resetResponse={resetResponse}
            resetAllResponses={resetAllResponses}
            commentingResponse={commentingResponse}
            setCommentingResponse={setCommentingResponse}
            commentText={commentText}
            setCommentText={setCommentText}
            sessionId={sessionId}
            router={router}
            showStudents={showStudents}
            setShowStudents={setShowStudents}
            sidebarWidth={sidebarWidth}
            rightPanelWidth={rightPanelOpen ? RIGHT_PANEL_WIDTH : 0}
            onSelectStudent={(s) => { setSelectedStudentId(s.id); setShowStudents(false); }}
          />
        ) : (
          <div className="flex-1 overflow-y-auto">
            <WelcomePanel
              sessionTitle={session.title || "Session"}
              level={session.level || ""}
              joinCode={session.join_code}
              activeStudents={activeStudents}
              onOpenQR={() => setShowQR(!showQR)}
              onCopyCode={copyCode}
            />
          </div>
        )}

        {/* Panneau droit — seulement en cockpit sur desktop */}
        {moduleView === "cockpit" && hasActiveModule && rightPanelOpen && (
          <div className="hidden lg:block">
            <ContextPanel
              moduleGuide={activeModule ? getModuleGuide(activeModule.id) : undefined}
              questionGuide={
                session && activeModule && (session.current_module === 3 || session.current_module === 4 || session.current_module === 9 || session.current_module === 2 || session.current_module === 10)
                  ? getQuestionGuide(session.current_seance || 1, (session.current_situation_index || 0) + 1, session.current_module)
                  : undefined
              }
              responsesCount={responses?.length || 0}
              totalStudents={activeStudents.length}
              hiddenCount={responses?.filter((r) => r.is_hidden).length || 0}
              voteOptionCount={responses?.filter((r) => r.is_vote_option && !r.is_hidden).length || 0}
              sessionStatus={session.status}
              selectedStudent={
                selectedStudentId
                  ? (() => {
                      const s = session.students?.find((s) => s.id === selectedStudentId);
                      return s ? { ...s, warnings: s.warnings || 0 } : null;
                    })()
                  : null
              }
              studentResponses={
                selectedStudentId
                  ? (responses || []).filter((r) => r.student_id === selectedStudentId)
                  : []
              }
              onSelectStudent={(s) => setSelectedStudentId(s?.id || null)}
              onClose={() => {
                setRightPanelOpen(false);
                localStorage.setItem("pilot-right-panel", "false");
              }}
              students={session.students?.map((s) => ({ ...s, warnings: s.warnings || 0 })) || []}
              studentStates={pageStudentStates}
              onNudge={(studentId, text) => {
                // Find a response from this student to attach the nudge
                const studentResponse = responses?.find((r) => r.student_id === studentId);
                if (studentResponse) {
                  nudgeStudent.mutate({ responseId: studentResponse.id, nudgeText: text });
                }
              }}
              onWarn={(studentId) => warnStudent.mutate(studentId)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
