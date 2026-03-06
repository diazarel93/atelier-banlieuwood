"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeInvalidation } from "@/hooks/use-realtime-invalidation";
import { usePilotKeyboardShortcuts } from "@/hooks/use-pilot-keyboard-shortcuts";
import { useCockpitModuleFlags } from "@/hooks/use-cockpit-module-flags";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CATEGORY_COLORS, PRODUCTION_CATEGORIES, getSeanceMax } from "@/lib/constants";
import dynamic from "next/dynamic";
import { getModuleGuide, getQuestionGuide, type QuestionGuide } from "@/lib/guide-data";

const QRCodeSVG = dynamic(
  () => import("qrcode.react").then(mod => ({ default: mod.QRCodeSVG })),
  { ssr: false, loading: () => <div className="w-full h-full bg-white/5 rounded animate-pulse" /> }
);
import { MODULES, PHASES, getModuleByDb, getPhaseForModule } from "@/lib/modules-data";

// Cockpit components
import { InlineActions, GenericInlineActions, TeacherCommentBadge } from "@/components/pilot/response-actions";
import { type ResponseCardResponse } from "@/components/pilot/response-card";
import { InlineReformulation } from "@/components/pilot/inline-reformulation";
import { SelectionBar } from "@/components/pilot/selection-bar";
import { QuickPhrases } from "@/components/pilot/quick-phrases";
import { ChoicesHistory, type CollectiveChoice } from "@/components/pilot/choices-history";
import type { StudentState } from "@/components/pilot/pulse-ring";
import { CONTENT_CATALOG, EMOTIONS, SCENE_ELEMENTS, TIER_COLORS, TIER_LABELS, MAX_SLOTS, MAX_TOKENS, getElement } from "@/lib/module5-data";
import { DiceBearAvatarMini } from "@/components/avatar-dicebear";
import { useSound } from "@/hooks/use-sound";

// Extracted cockpit sections
import { Module9BudgetOverview } from "@/components/pilot/module9-budget-overview";
import { Module12Cockpit } from "@/components/pilot/module12-cockpit";
import { Module5EmotionDistribution } from "@/components/pilot/module5-emotion-distribution";
import { KeyboardShortcutsModal } from "@/components/pilot/keyboard-shortcuts-modal";
import { VotingResults } from "@/components/pilot/voting-results";
import { ResponseStreamSection } from "@/components/pilot/response-stream-section";
// TimerSection removed — timer info in header bar
import { ElapsedTimer } from "@/components/pilot/elapsed-timer";

// New cockpit features
import { BroadcastModal } from "@/components/pilot/broadcast-modal";
import { CompareResponsesModal } from "@/components/pilot/compare-responses-modal";
import { SessionExport } from "@/components/pilot/session-export";
import { ErrorBoundary } from "@/components/error-boundary";
import { HelpButton } from "@/components/help-button";
import { ConfirmModal } from "@/components/confirm-modal";

// Layout components
import { ModuleSidebar, MobileSidebarDrawer } from "@/components/pilot/module-sidebar";
import { WelcomePanel } from "@/components/pilot/welcome-panel";
import { ModuleBriefing } from "@/components/pilot/module-briefing";
import { ContextPanel } from "@/components/pilot/context-panel";
import { getNextAction, type NextAction } from "@/components/pilot/get-next-action";
import { TeamManager } from "@/components/pilot/team-manager";
import { ClassroomMap } from "@/components/pilot/classroom-map";
import { StudentFiche } from "@/components/pilot/student-fiche";
import { AIAssistantPanel } from "@/components/pilot/ai-assistant-panel";
import { CognitiveMap } from "@/components/pilot/cognitive-map";
import { ComprehensionHeatmap } from "@/components/pilot/comprehension-heatmap";
import { SessionStateBanner } from "@/components/pilot/session-state-banner";
import { SessionProgressBar } from "@/components/pilot/session-progress-bar";
import { FloatingNextAction } from "@/components/pilot/floating-next-action";
import { OnboardingHints } from "@/components/pilot/onboarding-hints";
import { usePilotOnboarding } from "@/hooks/use-pilot-onboarding";

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
  mute_sounds: boolean;
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
  hand_raised_at?: string | null;
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
  totalQuestions,
  onSelectStudent,
  teams,
  onOpenModules,
  onOpenScreen,
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
  totalQuestions?: number;
  onSelectStudent: (student: Student) => void;
  teams: { id: string; team_name: string; team_color: string; team_number: number; students: { id: string; display_name: string; avatar: string }[] }[];
  onOpenModules?: () => void;
  onOpenScreen?: () => void;
}) {
  const [ficheStudentId, setFicheStudentId] = useState<string | null>(null);
  const [centerTab, setCenterTab] = useState<"responses" | "classmap">("responses");
  const [classroomLayout, setClassroomLayout] = useState<"rows" | "u-shape" | "islands" | "free">("rows");
  const [guideExpanded, setGuideExpanded] = useState(false);
  const footerCtaRef = useRef<HTMLDivElement | null>(null);
  const [mapCollapsed, setMapCollapsed] = useState(true);
  const onboarding = usePilotOnboarding();
  const [reformulating, setReformulating] = useState<Response | null>(null);
  const [reformulatedText, setReformulatedText] = useState("");
  const [respondingStartedAt] = useState<number>(Date.now());
  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>([]);
  const [selectedPitchIds, setSelectedPitchIds] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [allSituations, setAllSituations] = useState<{ position: number; category: string; restitutionLabel: string; prompt: string; nudgeText: string | null }[]>([]);
  const [responseFilter, setResponseFilter] = useState<"all" | "visible" | "highlighted">("all");
  const [responseSortMode, setResponseSortMode] = useState<"time" | "highlighted">("time");

  // ── New feature state ──
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showRevealAnswer, setShowRevealAnswer] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [kickTarget, setKickTarget] = useState<{ id: string; name: string } | null>(null);
  const allRespondedNotified = useRef(false);
  const prevResponseCountRef = useRef(0);
  const [allResponded, setAllResponded] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(0);
  const [respondingOpenedAt, setRespondingOpenedAt] = useState<number | null>(null);
  const [cardSearch, setCardSearch] = useState("");
  const [broadcastHistory, setBroadcastHistory] = useState<{ text: string; sentAt: Date }[]>([]);
  const [timerMode, setTimerMode] = useState(false);
  const [interventionMode, setInterventionMode] = useState(false);
  const { play } = useSound();

  const queryClient = useQueryClient();

  // Keyboard shortcut: Escape = close student fiche
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "Escape" && ficheStudentId) {
        e.preventDefault();
        setFicheStudentId(null);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [ficheStudentId]);

  // Fetch all situations for the seance (for preview of upcoming questions)
  useEffect(() => {
    if (!session?.id) return;
    fetch(`/api/sessions/${session.id}/situations-preview`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.situations) setAllSituations(d.situations); })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, session?.current_module, session?.current_seance]);

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
    refetchInterval: session.current_module === 9 && (session.current_seance || 1) === 2 ? 10_000 : false,
  });

  // Fetch all scenes for Module 2 EC (séances 2-3)
  interface M2ECScene {
    id: string;
    student_id: string;
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
    refetchInterval: isM2ECWithScenes ? 10_000 : false,
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

  const {
    isBudgetQuiz, isM1Positioning, isM1Image, isM1Notebook,
    isM2ECChecklist, isM2ECSceneBuilder, isM2ECComparison,
    isM10Etsi, isM10Pitch, isM10Any, isM10SpecialPosition,
    isM2ECSpecial, isM2ECAny, isM12Any, isM12Manche,
    isQAModule,
    maxSituations, canGoNext, canGoPrev, seance,
  } = useCockpitModuleFlags(session);

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
    confrontation?: { pitchA: { text: string; prenom: string; studentId: string }; pitchB: { text: string; prenom: string; studentId: string } } | null;
    pitchList?: { studentId: string; prenom: string; text: string }[];
    allSubmissions?: { studentName: string; text: string; studentId: string; avatar?: Record<string, unknown> }[];
  } })?.module10;

  // Module 12 data from situationData
  const module12Data = (situationData as { module12?: {
    type: string;
    manche: number;
    mancheLabel: string;
    cards: { cardId: string; text: string; isBanlieuwood: boolean }[];
    studentVote: string | null;
    voteCounts: Record<string, number> | null;
    winner: { cardId: string; text: string } | null;
    allWinners: { manche: number; text: string }[];
    poolReady: boolean;
  } })?.module12;

  // Module label & guide data
  const currentMod = MODULES.find(
    (m) => m.dbModule === session.current_module && m.dbSeance === (session.current_seance || 1)
  );
  const moduleLabel = currentMod?.title || "Module";
  const moduleColor = currentMod?.color || "#FF6B35";
  const currentModuleLessons = MODULES.filter((m) => m.dbModule === session.current_module);
  const moduleGuide = currentMod ? getModuleGuide(currentMod.id) : undefined;
  const questionGuide = (session.current_module === 1 || session.current_module === 3 || session.current_module === 4 || session.current_module === 9 || (session.current_module === 2 && !isM2ECSpecial && !isM2ECComparison) || isM10Any || isM12Any)
    ? getQuestionGuide(session.current_seance || 1, (session.current_situation_index || 0) + 1, session.current_module)
    : undefined;

  // Helper: M10 activity label
  const getM10ActivityLabel = (type?: string) => {
    switch (type) {
      case "etsi": return "Et si... — Image + ecriture";
      case "qcm": return "QCM narratif";
      case "idea-bank": return "Banque d'idees";
      case "avatar": return "Creation personnage";
      case "objectif": return "Objectif + Obstacle";
      case "pitch": return "Assemblage pitch";
      case "chrono": return "Test chrono 60s";
      case "confrontation": return "Confrontation";
      default: return null;
    }
  };

  // Build set of students who submitted via module-specific endpoints (M10, M9, M2EC)
  const moduleSubmittedIds = useMemo(() => {
    const ids = new Set<string>();
    if (module10Data?.allSubmissions) {
      for (const s of module10Data.allSubmissions) ids.add(s.studentId);
    }
    if (budgetData?.budgets) {
      for (const b of budgetData.budgets) ids.add(b.student_id);
    }
    if (scenesData?.scenes) {
      for (const sc of scenesData.scenes) ids.add(sc.student_id);
    }
    return ids;
  }, [module10Data?.allSubmissions, budgetData?.budgets, scenesData?.scenes]);

  // Build module-specific response texts (for classroom map hover/popover)
  const moduleResponseTexts = useMemo(() => {
    const map = new Map<string, string>();
    if (module10Data?.allSubmissions) {
      for (const s of module10Data.allSubmissions) {
        if (!map.has(s.studentId)) map.set(s.studentId, s.text);
      }
    }
    if (budgetData?.budgets) {
      for (const b of budgetData.budgets) {
        if (!map.has(b.student_id)) map.set(b.student_id, b.summary || `Budget: ${b.credits_remaining} crédits restants`);
      }
    }
    return map;
  }, [module10Data?.allSubmissions, budgetData?.budgets]);

  // Compute student states for pulse ring / grid
  const studentStates = useMemo((): { id: string; state: StudentState; display_name: string; avatar: string }[] => {
    if (!session.students) return [];
    const now = Date.now();
    return session.students.map((s) => {
      const hasResponded = responses.some((r) => r.student_id === s.id) || moduleSubmittedIds.has(s.id);
      if (!s.is_active) return { id: s.id, state: "disconnected" as StudentState, display_name: s.display_name, avatar: s.avatar };
      if (hasResponded) return { id: s.id, state: "responded" as StudentState, display_name: s.display_name, avatar: s.avatar };
      // Stuck: active, no response, > 60s since responding started
      if (session.status === "responding" && (now - respondingStartedAt) > 60_000) {
        return { id: s.id, state: "stuck" as StudentState, display_name: s.display_name, avatar: s.avatar };
      }
      return { id: s.id, state: "active" as StudentState, display_name: s.display_name, avatar: s.avatar };
    });
  }, [session.students, session.status, responses, respondingStartedAt, moduleSubmittedIds]);

  // Actually change the session (launches the question for students)
  function goToSituation(index: number) {
    setPreviewIndex(null);
    setCardSearch("");
    updateSession.mutate({ current_situation_index: index, status: "responding", timer_ends_at: null });
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
    toast("Question passée");
  }

  function prevSituation() {
    const idx = session.current_situation_index || 0;
    if (idx <= 0) return;
    goToSituation(idx - 1);
    toast("Retour à la question précédente");
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

  // Quick vote: auto-select top 2 visible responses + launch vote
  function handleQuickVote() {
    const visible = responses.filter((r) => !r.is_hidden && !r.is_vote_option);
    // Pick the 2 longest visible responses (simple heuristic for quality)
    const sorted = [...visible].sort((a, b) => (b.text?.length || 0) - (a.text?.length || 0));
    const top2 = sorted.slice(0, 2);
    if (top2.length < 2) return;
    // Select both, then launch vote after a short delay
    for (const r of top2) {
      toggleVoteOption.mutate({ responseId: r.id, is_vote_option: true });
    }
    setTimeout(() => {
      updateSession.mutate({ status: "voting", timer_ends_at: null });
    }, 150);
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

  // ── Track when responses opened (for elapsed timer) ──
  useEffect(() => {
    if (session.status === "responding") {
      setRespondingOpenedAt((prev) => prev ?? Date.now());
    } else {
      setRespondingOpenedAt(null);
      allRespondedNotified.current = false;
      setAllResponded(false);
    }
  }, [session.status]);

  // ── Notification: all students responded ──
  useEffect(() => {
    if (session.status !== "responding" || activeStudents.length === 0) return;
    if (responses.length >= activeStudents.length && !allRespondedNotified.current) {
      allRespondedNotified.current = true;
      setAllResponded(true);
      play("success");
      toast.success("Tout le monde a répondu !", { icon: "🎉" });
    }
  }, [responses.length, activeStudents.length, session.status, play]);

  // ── Soft notification: new response received ──
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
        toast(`${studentName} a repondu`, { icon: "✏️", duration: 2000, style: { fontSize: 13, padding: "8px 14px" } });
      }
    }
    prevResponseCountRef.current = curr;
  }, [responses.length, responses, session.status, session.students]);

  // ── Auto-advance: when all responded + autoAdvance enabled, advance after 4s countdown ──
  useEffect(() => {
    // Clear any pending timer when conditions change
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setAutoAdvanceCountdown(0);

    if (!autoAdvance || !allResponded || session.status !== "responding") return;

    // Start countdown
    let remaining = 4;
    setAutoAdvanceCountdown(remaining);
    const countdownInterval = setInterval(() => {
      remaining -= 1;
      setAutoAdvanceCountdown(remaining);
      if (remaining <= 0) clearInterval(countdownInterval);
    }, 1000);

    autoAdvanceTimerRef.current = setTimeout(() => {
      const currentIdx = session.current_situation_index || 0;
      if (currentIdx < maxSituations - 1) {
        // Next question
        goToSituation(currentIdx + 1);
      }
      // If last question, don't auto-advance (let teacher decide)
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

  // ── Stuck students (>60s without responding during responding) ──
  const stuckStudents = useMemo(() => {
    if (session.status !== "responding" || !respondingOpenedAt) return [];
    const elapsed = Date.now() - respondingOpenedAt;
    if (elapsed < 60_000) return []; // wait at least 1min before flagging
    const respondedIds = new Set(responses.map((r) => r.student_id));
    return activeStudents
      .filter((s) => !respondedIds.has(s.id))
      .map((s) => ({ id: s.id, name: s.display_name, avatar: s.avatar }));
  }, [session.status, respondingOpenedAt, responses, activeStudents]);

  // ── Keyboard shortcuts (extracted hook) ──
  const handlePauseToggle = useCallback(() => {
    if (session.status === "paused") updateSession.mutate({ status: "waiting" });
    else if (session.status !== "done") updateSession.mutate({ status: "paused" });
  }, [session.status, updateSession]);

  const handleCloseAllModals = useCallback(() => {
    setShowBroadcast(false);
    setShowExport(false);
    setShowCompare(false);
    setShowShortcuts(false);
    setShowRevealAnswer(false);
    setTimerMode(false);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleNextActionCb = useCallback(() => handleNextAction(), [nextAction, canGoNext, updateSession]);

  const TIMER_PRESETS = [30, 60, 120, 180, 300];

  const handleTimerShortcut = useCallback(() => {
    setTimerMode((prev) => {
      if (!prev) toast("Timer: appuie 1-5", { icon: "⏱", duration: 3000 });
      return !prev;
    });
  }, []);

  const handleSetTimerPreset = useCallback((n: number) => {
    const seconds = TIMER_PRESETS[n - 1];
    if (!seconds) return;
    const endsAt = new Date(Date.now() + seconds * 1000).toISOString();
    updateSession.mutate({ timer_ends_at: endsAt });
    setTimerMode(false);
    toast.success(`Timer ${seconds >= 60 ? `${seconds / 60}min` : `${seconds}s`} lancé`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateSession]);

  usePilotKeyboardShortcuts({
    sessionStatus: session.status,
    responsesCount: responses.length,
    onPauseToggle: handlePauseToggle,
    onShowBroadcast: useCallback(() => setShowBroadcast(true), []),
    onShowExport: useCallback(() => setShowExport(true), []),
    onShowCompare: useCallback(() => setShowCompare(true), []),
    onToggleShortcuts: useCallback(() => setShowShortcuts((v) => !v), []),
    onCloseAll: handleCloseAllModals,
    onNextAction: handleNextActionCb,
    onToggleFocus: useCallback(() => setFocusMode(f => !f), []),
    onToggleIntervention: useCallback(() => setInterventionMode(v => !v), []),
    onTimerShortcut: handleTimerShortcut,
    onSetTimerPreset: handleSetTimerPreset,
    timerModeActive: timerMode,
  });

  // ── Broadcast handler ──
  function handleBroadcast(message: string) {
    updateSession.mutate({ broadcast_message: message, broadcast_at: new Date().toISOString() });
    setBroadcastHistory((prev) => [{ text: message, sentAt: new Date() }, ...prev].slice(0, 10));
    setShowBroadcast(false);
    play("send");
    toast.success("Message envoyé à toute la classe");
  }

  // ── Batch nudge stuck students ──
  function handleNudgeAllStuck() {
    // For students with responses, use nudge; broadcast covers all
    updateSession.mutate({ broadcast_message: "N'oubliez pas de répondre à la question !", broadcast_at: new Date().toISOString() });
    play("send");
    toast.success(`Relance envoyée à ${stuckStudents.length} élève${stuckStudents.length > 1 ? "s" : ""}`);
  }

  // ── Bulk: highlight all visible ──
  function handleHighlightAllVisible() {
    const toHighlight = responses.filter((r) => !r.is_hidden && !r.is_highlighted);
    for (const r of toHighlight) {
      highlightResponse.mutate({ responseId: r.id, highlighted: true });
    }
    toast.success(`${toHighlight.length} réponse${toHighlight.length > 1 ? "s" : ""} projetée${toHighlight.length > 1 ? "s" : ""}`);
  }

  // ── Bulk: hide all visible ──
  function handleHideAllVisible() {
    const toHide = responses.filter((r) => !r.is_hidden);
    for (const r of toHide) {
      toggleHide.mutate({ responseId: r.id, is_hidden: true });
    }
    toast.success(`${toHide.length} réponse${toHide.length > 1 ? "s" : ""} masquée${toHide.length > 1 ? "s" : ""}`);
  }

  // ── Clear all highlights ──
  function handleClearAllHighlights() {
    const highlighted = responses.filter((r) => r.is_highlighted);
    for (const r of highlighted) {
      highlightResponse.mutate({ responseId: r.id, highlighted: false });
    }
    toast.success(`${highlighted.length} réponse${highlighted.length > 1 ? "s" : ""} dé-projetée${highlighted.length > 1 ? "s" : ""}`);
  }

  // ── Compare: highlight both selected responses ──
  function handleHighlightBoth(idA: string, idB: string) {
    highlightResponse.mutate({ responseId: idA, highlighted: true });
    highlightResponse.mutate({ responseId: idB, highlighted: true });
    toast.success("2 réponses projetées pour comparaison");
  }

  // ── Go back to previous question ──
  function handlePrevQuestion() {
    const prevIndex = (session.current_situation_index || 0) - 1;
    if (prevIndex >= 0) {
      updateSession.mutate({ current_situation_index: prevIndex, status: "responding", timer_ends_at: null });
    }
  }

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
  const showStandardQA = (isStandardQA || (isM2ECAny && !showM2ECSpecial && !showM2ECComparison) || (isM10Any && !showM10Special)) && !isM12Any;

  // ── Universal question text — used by the header question bar for ALL modules ──
  const universalQuestionText: string | null = (() => {
    if (isPreviewing) {
      // For preview, compute text from allSituations or module-specific data
      if (isM1Positioning && module1Data?.questions?.[displayIndex]) {
        return module1Data.questions[displayIndex].text;
      }
      const ps = allSituations.find(s => s.position === displayIndex + 1);
      if (ps?.prompt) return ps.prompt;
      if (situation?.prompt) return situation.prompt;
      // M10 / M2EC preview labels
      if (showM10Special) {
        const m10Label = isM10Etsi
          ? (displayIndex === 0 ? "Et si... — Image + ecriture" : displayIndex === 1 ? "QCM narratif" : "Banque d'idees")
          : (displayIndex === 0 ? "Creation personnage" : displayIndex === 1 ? "Objectif + Obstacle" : displayIndex === 2 ? "Ecriture pitch" : displayIndex === 3 ? "Test chrono" : "Confrontation");
        return m10Label;
      }
      if (showM2ECChecklist) return "Checklist de contenus";
      if (showM2ECSceneBuilder) return "Construction de scene";
      if (showM2ECComparison) return "Confrontation de scenes";
      if (isM12Any) return module12Data?.mancheLabel || `Manche ${module12Data?.manche || 1}`;
      return null;
    }
    // Live mode — current question
    if (situation?.prompt) return situation.prompt;
    if (isM1Positioning && module1Data?.questions?.[currentQIndex]) return module1Data.questions[currentQIndex].text;
    if (module1Data?.question?.text) return module1Data.question.text;
    if (module10Data) return getM10ActivityLabel(module10Data.type);
    if (showM2ECChecklist) return "Checklist de contenus";
    if (showM2ECSceneBuilder) return "Construction de scene";
    if (showM2ECComparison) return "Confrontation de scenes";
    if (isM12Any) return module12Data?.mancheLabel || `Manche ${module12Data?.manche || 1}`;
    return null;
  })();

  // ── Universal category label — for the header question bar badge ──
  const universalCategoryLabel: string = (() => {
    if (isPreviewing) {
      const ps = allSituations.find(s => s.position === displayIndex + 1);
      if (ps?.restitutionLabel || ps?.category) return ps.restitutionLabel || ps.category;
    }
    if (situation?.restitutionLabel || situation?.category) return situation.restitutionLabel || situation.category;
    if (isM1Positioning) return "Positionnement";
    if (isM1Image) return "Image";
    if (isM1Notebook) return "Carnet";
    if (isBudgetQuiz) return "Budget";
    if (showM10Special && isM10Etsi) return "Et si...";
    if (showM10Special && isM10Pitch) return "Pitch";
    if (showM2ECChecklist) return "Checklist";
    if (showM2ECSceneBuilder) return "Scene";
    if (showM2ECComparison) return "Confrontation";
    if (isM12Any) return "Construction";
    return moduleLabel;
  })();

  // ── Unified toolbar values (used by all module types) ──
  const unifiedLabel = (() => {
    if (isM1Positioning) return "Positionnement";
    if (isM1Image) return "Image";
    if (isM1Notebook) return "Carnet";
    if (isBudgetQuiz) return "Budgets";
    if (showM10Special) return isM10Etsi ? "Et si..." : "Pitch";
    if (isM12Any) return "Construction";
    if (showM2ECChecklist) return "Checklists";
    if (showM2ECSceneBuilder) return "Scenes";
    if (showM2ECComparison) return "Confrontation";
    return "Reponses";
  })();

  const unifiedRespondedCount = (() => {
    if (isM1Positioning) {
      const dist = module1Data?.optionDistribution || {};
      return Object.values(dist).reduce((sum, v) => sum + (v as number), 0);
    }
    if (isBudgetQuiz) return budgetSubmitted;
    if (isM1Image || isM1Notebook) return module1Data?.responsesCount || 0;
    if (showM10Special && module10Data?.allSubmissions) return module10Data.allSubmissions.length;
    if (showM2ECChecklist) return module5Data?.submittedCount || 0;
    if (showM2ECSceneBuilder || showM2ECComparison) return scenesData?.count || 0;
    return responses.length;
  })();

  // Students who haven't responded yet (for all modules)
  const notRespondedStudents = useMemo(() => {
    if (session.status !== "responding") return [];
    const respondedIds = new Set(responses.map(r => r.student_id));
    moduleSubmittedIds.forEach(id => respondedIds.add(id));
    return activeStudents.filter(s => !respondedIds.has(s.id));
  }, [session.status, responses, activeStudents, moduleSubmittedIds]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── STATUS BANNER — always visible, color-coded by state ── */}
      <SessionStateBanner
        status={session.status}
        respondedCount={unifiedRespondedCount}
        totalStudents={activeStudents.length}
        voteCount={voteData?.totalVotes || 0}
        onTogglePause={handlePauseToggle}
        onViewResults={() => router.push(`/session/${sessionId}/results`)}
      />

      {/* ── ZERO-SCROLL LAYOUT — split panel, content scrolls internally ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ── HEADER BAR — 72px, warm EdTech ── */}
        <div className="flex items-center gap-2 xl:gap-4 px-3 xl:px-6 flex-shrink-0 border-b" style={{ height: 72, background: "#F5EFE6", borderColor: "#E8DFD2" }}>
          {/* LEFT: branding + modules */}
          <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
            {onOpenModules && (
              <button onClick={onOpenModules} title="Parcours des modules" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-bw-muted hover:text-bw-heading bg-white border border-[#E8DFD2] cursor-pointer transition-colors flex-shrink-0 hover:shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-semibold text-[#2C2C2C] truncate">Les Etoiles de Clichy</span>
              <span className="text-[11px] text-[#7A7A7A] hidden xl:block">Cockpit pedagogique</span>
            </div>
          </div>

          {/* CENTER: session context — items progressively revealed */}
          <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
            {/* Mission badge — always visible, truncates */}
            <span className="px-2 xl:px-3 py-1 rounded-full text-[12px] xl:text-[13px] font-medium text-[#5B5B5B] truncate min-w-0" style={{ background: "#EFE8DD" }}>
              {moduleLabel}
            </span>
            {/* Question counter — xl only */}
            {(totalQuestions ?? 0) > 0 && (
              <>
                <span className="text-[#D3CAB8] hidden xl:block">·</span>
                <span className="text-[13px] font-medium text-[#5B5B5B] tabular-nums flex-shrink-0 hidden xl:block">
                  Q{currentQIndex + 1}/{totalQuestions}
                </span>
              </>
            )}
            {/* Timer — xl only */}
            {respondingOpenedAt && (
              <>
                <span className="text-[#D3CAB8] hidden xl:block">·</span>
                <span className="flex-shrink-0 hidden xl:block">
                  <ElapsedTimer startedAt={respondingOpenedAt} />
                </span>
              </>
            )}
            {/* Student count — xl only */}
            <span className="text-[#D3CAB8] hidden xl:block">·</span>
            <span className="text-[13px] font-medium text-[#5B5B5B] tabular-nums flex-shrink-0 hidden xl:block">
              {activeStudents.length} eleve{activeStudents.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* RIGHT: header actions — compact by default */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Auto-advance toggle — icon only, label at xl */}
            <button
              onClick={() => {
                setAutoAdvance((v) => !v);
                if (autoAdvanceTimerRef.current) {
                  clearTimeout(autoAdvanceTimerRef.current);
                  autoAdvanceTimerRef.current = null;
                  setAutoAdvanceCountdown(0);
                }
              }}
              className={`flex items-center gap-1.5 h-9 px-2 xl:px-3 rounded-[10px] text-[13px] font-medium cursor-pointer transition-all ${
                autoAdvance ? "bg-bw-teal/15 text-bw-teal border border-bw-teal/30" : "bg-white text-[#4A4A4A] border border-[#E8DFD2]"
              }`}
            >
              <div className={`w-5 h-3 rounded-full transition-all relative ${autoAdvance ? "bg-bw-teal" : "bg-black/10"}`}>
                <div className={`absolute top-px w-2.5 h-2.5 rounded-full bg-white transition-all shadow-sm ${autoAdvance ? "left-2" : "left-px"}`} />
              </div>
              <span className="hidden xl:inline">Auto{autoAdvance && autoAdvanceCountdown > 0 ? ` ${autoAdvanceCountdown}s` : ""}</span>
            </button>
            {/* Pause — icon only, label at xl */}
            <button
              onClick={handlePauseToggle}
              className="h-9 w-9 xl:w-auto xl:px-3 rounded-[10px] bg-white border border-[#E8DFD2] text-[13px] font-medium text-[#4A4A4A] hover:bg-[#F8F2E8] cursor-pointer transition-colors flex items-center justify-center"
            >
              <span className="xl:hidden">⏸</span>
              <span className="hidden xl:inline">⏸ Pause</span>
            </button>
            {/* Broadcast */}
            <button onClick={() => setShowBroadcast(true)} title="Message classe (B)"
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-sm text-[#7A7A7A] hover:text-[#2C2C2C] bg-white border border-[#E8DFD2] cursor-pointer transition-colors hover:shadow-sm">
              📢
            </button>
            {/* Screen */}
            <button onClick={onOpenScreen} title="Ecran eleves"
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-sm text-[#7A7A7A] hover:text-[#2C2C2C] bg-white border border-[#E8DFD2] cursor-pointer transition-colors hover:shadow-sm">
              🖥
            </button>
          </div>
        </div>

        {/* ── QUESTION CARD — HERO: dominant, 40px padding, 36px text ── */}
        {universalQuestionText && (
          <div className="flex-shrink-0 px-3 sm:px-5 py-3 sm:py-4">
            <div className="rounded-[16px] sm:rounded-[20px]" style={{
              padding: "clamp(20px, 4vw, 40px) clamp(16px, 4vw, 40px) clamp(16px, 3.5vw, 36px)",
              background: "#FFFFFF",
              boxShadow: "0 12px 32px rgba(61,43,16,0.08), 0 4px 8px rgba(61,43,16,0.03)",
              border: "1px solid #E8DFD2",
            }}>
              {/* Top row: badge + nav + guide */}
              <div className="flex items-center gap-2.5 mb-5">
                <span className="text-[13px] font-semibold px-3 py-1 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `${CATEGORY_COLORS[universalCategoryLabel] || moduleColor}15`, color: CATEGORY_COLORS[universalCategoryLabel] || moduleColor }}>
                  {universalCategoryLabel}
                </span>
                {isPreviewing && <span className="text-[11px] px-2 py-1 rounded-full bg-[#F5A45B]/15 text-[#D4842A] font-bold uppercase flex-shrink-0">Apercu</span>}
                <div className="flex-1" />
                {maxSituations > 1 && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={previewPrev} disabled={displayIndex <= 0}
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center text-xs text-[#7A7A7A] hover:text-[#2C2C2C] bg-white border border-[#E8DFD2] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      ◀
                    </button>
                    <span className="text-[13px] text-[#7A7A7A] tabular-nums font-medium px-1">Q{displayIndex + 1}/{maxSituations}</span>
                    <button onClick={previewNext} disabled={displayIndex >= maxSituations - 1}
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center text-xs text-[#7A7A7A] hover:text-[#2C2C2C] bg-white border border-[#E8DFD2] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      ▶
                    </button>
                  </div>
                )}
                {questionGuide && (
                  <button
                    onClick={() => setGuideExpanded(!guideExpanded)}
                    className={`h-8 px-3 rounded-[10px] text-[13px] font-medium cursor-pointer transition-all flex-shrink-0 border ${
                      guideExpanded ? "bg-[#E8F5F2] text-[#1B5E50] border-[#C8E6DD]" : "text-[#7A7A7A] hover:text-[#1B5E50] bg-white border-[#E8DFD2]"
                    }`}
                  >
                    {guideExpanded ? "▴ Guide" : "▾ Guide"}
                  </button>
                )}
              </div>
              {/* Question text — HERO: 32-36px, strong, dominant */}
              <p className={`text-[28px] md:text-[36px] font-bold leading-[1.25] ${isPreviewing ? "text-[#D4842A]" : "text-[#2C2C2C]"}`}>
                {universalQuestionText}
              </p>
            </div>
            {/* Collapsible guide section */}
            <AnimatePresence>
              {guideExpanded && (isPreviewing ? previewGuide : questionGuide) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 pt-5 space-y-3" style={{ borderTop: "1px solid #EFE4D8" }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-[14px] p-4 space-y-1" style={{ background: "#F0FAF8", border: "1px solid #D5EDE8" }}>
                        <p className="text-[11px] uppercase tracking-wider font-bold text-[#1B5E50]">Ce qu&apos;on attend</p>
                        <p className="text-[13px] text-[#4A4A4A] leading-relaxed">{(isPreviewing ? previewGuide : questionGuide)?.whatToExpect}</p>
                      </div>
                      <div className="rounded-[14px] p-4 space-y-1" style={{ background: "#FFF8F0", border: "1px solid #F0DFC8" }}>
                        <p className="text-[11px] uppercase tracking-wider font-bold text-[#8B6914]">Pieges frequents</p>
                        <p className="text-[13px] text-[#8B6914] leading-relaxed">{(isPreviewing ? previewGuide : questionGuide)?.commonPitfalls}</p>
                      </div>
                    </div>
                    <QuickPhrases questionGuide={(isPreviewing ? previewGuide : questionGuide) ?? undefined} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Preview banner when looking ahead */}
            {isPreviewing && (
              <div className="mt-4">
                <div className="rounded-[14px] px-4 py-3 flex items-center gap-3" style={{ background: "#FFF8F0", border: "1px solid #F0DFC8" }}>
                  <span className="text-[13px] text-[#D4842A] font-medium">Apercu Q{displayIndex + 1}</span>
                  <div className="flex-1" />
                  <button onClick={() => setPreviewIndex(null)}
                    className="text-[13px] text-[#7A7A7A] hover:text-[#2C2C2C] cursor-pointer transition-colors">Retour Q{currentQIndex + 1}</button>
                  <button onClick={() => goToSituation(displayIndex)}
                    className="text-[13px] px-3.5 py-1.5 bg-[#F5A45B] text-white rounded-[10px] font-semibold cursor-pointer hover:brightness-105 transition-all"
                    style={{ boxShadow: "0 2px 8px rgba(245,164,91,0.3)" }}>
                    Lancer Q{displayIndex + 1}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SPLIT-PANEL LAYOUT ── */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* LEFT: Classe en direct — 300px panel, hidden below lg */}
          <div data-onboarding="classmap" className="hidden md:flex w-[240px] lg:w-[300px] flex-shrink-0 flex-col"
            style={{ background: "#FAF6EE", borderRight: "1px solid #EEE4D8" }}>
            {/* Compact pulse header */}
            <div className="px-4 pt-4 pb-2 flex-shrink-0">
              {(() => {
                const respondedN = studentStates.filter(s => s.state === "responded").length;
                const thinkingN = studentStates.filter(s => s.state === "active").length;
                const stuckN = studentStates.filter(s => s.state === "stuck").length;
                const offN = studentStates.filter(s => s.state === "disconnected").length;
                const total = respondedN + thinkingN + stuckN + offN;
                const engagementPct = total > 0 ? Math.round(((respondedN + thinkingN) / total) * 100) : 0;
                const rPct = total > 0 ? (respondedN / total) * 100 : 0;
                const tPct = total > 0 ? (thinkingN / total) * 100 : 0;
                const sPct = total > 0 ? (stuckN / total) * 100 : 0;
                const oPct = total > 0 ? (offN / total) * 100 : 0;
                const online = respondedN + thinkingN + stuckN;
                let suggestion: { icon: string; text: string; color: string; bg: string } | null = null;
                if (stuckN >= 3) suggestion = { icon: "💡", text: `${stuckN} bloques — Donnez un exemple`, color: "#C62828", bg: "#FFF5F5" };
                else if (stuckN > 0) suggestion = { icon: "👀", text: `${stuckN} bloque${stuckN > 1 ? "s" : ""} — Coup de pouce ?`, color: "#E65100", bg: "#FFF8E1" };
                else if (thinkingN > 0 && respondedN === 0) suggestion = { icon: "⏳", text: "Tous reflechissent — Laissez du temps", color: "#F57F17", bg: "#FFFCF5" };
                else if (respondedN > 0 && respondedN === online && online > 0) suggestion = { icon: "🚀", text: "Tous ont repondu !", color: "#2E7D32", bg: "#F0FAF4" };
                else if (respondedN > online * 0.7) suggestion = { icon: "📢", text: "Plus de 70% — Lancez la discussion ?", color: "#1565C0", bg: "#EEF2FF" };
                return (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#B0A99E]">Classe en direct</span>
                    </div>

                    {/* Donut radar + counters side by side */}
                    <div className="flex items-center gap-3">
                      {/* SVG Donut chart — 56px */}
                      <div className="relative flex-shrink-0" style={{ width: 56, height: 56 }}>
                        <svg width="56" height="56" viewBox="0 0 56 56" className="transform -rotate-90">
                          {/* Background ring */}
                          <circle cx="28" cy="28" r="22" fill="none" stroke="#EFE8DD" strokeWidth="6" />
                          {/* Segments: responded → thinking → stuck → disconnected */}
                          {(() => {
                            const circumference = 2 * Math.PI * 22;
                            const segments = [
                              { pct: rPct, color: "#4CAF50" },
                              { pct: tPct, color: "#F2C94C" },
                              { pct: sPct, color: "#EB5757" },
                              { pct: oPct, color: "#C4BDB2" },
                            ];
                            let offset = 0;
                            return segments.map((seg, i) => {
                              if (seg.pct <= 0) return null;
                              const dash = (seg.pct / 100) * circumference;
                              const gap = circumference - dash;
                              const el = (
                                <circle
                                  key={i}
                                  cx="28" cy="28" r="22"
                                  fill="none"
                                  stroke={seg.color}
                                  strokeWidth="6"
                                  strokeDasharray={`${dash} ${gap}`}
                                  strokeDashoffset={-offset}
                                  strokeLinecap="round"
                                  className="transition-all duration-700"
                                />
                              );
                              offset += dash;
                              return el;
                            });
                          })()}
                        </svg>
                        {/* Center engagement % */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[14px] font-extrabold tabular-nums" style={{ color: engagementPct >= 70 ? "#4CAF50" : engagementPct >= 40 ? "#F2C94C" : "#EB5757" }}>
                            {engagementPct}%
                          </span>
                        </div>
                      </div>

                      {/* Compact counters — 2x2 grid */}
                      <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#4CAF50" }} />
                          <motion.span key={`r-${respondedN}`} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-[15px] font-bold tabular-nums" style={{ color: "#4CAF50" }}>{respondedN}</motion.span>
                          <span className="text-[10px] text-[#B0A99E] truncate">rep.</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#F2C94C" }} />
                          <motion.span key={`t-${thinkingN}`} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-[15px] font-bold tabular-nums" style={{ color: "#F2C94C" }}>{thinkingN}</motion.span>
                          <span className="text-[10px] text-[#B0A99E] truncate">ref.</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#EB5757", boxShadow: stuckN > 0 ? "0 0 6px #EB575740" : undefined }} />
                          <motion.span key={`s-${stuckN}`} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className={`text-[15px] font-bold tabular-nums ${stuckN > 0 ? "animate-pulse" : ""}`} style={{ color: "#EB5757" }}>{stuckN}</motion.span>
                          <span className="text-[10px] text-[#B0A99E] truncate">bloq.</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#C4BDB2" }} />
                          <motion.span key={`o-${offN}`} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-[15px] font-bold tabular-nums" style={{ color: "#C4BDB2" }}>{offN}</motion.span>
                          <span className="text-[10px] text-[#B0A99E] truncate">abs.</span>
                        </div>
                      </div>
                    </div>
                    {/* Suggestion */}
                    {suggestion && (
                      <div className="flex items-center gap-2 px-2.5 py-2 rounded-[10px]" style={{ background: suggestion.bg, border: `1px solid ${suggestion.color}20` }}>
                        <span className="text-xs flex-shrink-0">{suggestion.icon}</span>
                        <p className="text-[11px] font-medium leading-snug" style={{ color: suggestion.color }}>{suggestion.text}</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Intervention mode toggle */}
            <div className="px-4 pb-1.5 flex-shrink-0">
              <button
                onClick={() => setInterventionMode(v => !v)}
                className="w-full flex items-center justify-center gap-2 py-1.5 rounded-[10px] text-[12px] font-semibold cursor-pointer transition-all"
                style={{
                  background: interventionMode ? "#FFEBEE" : "#F7F3EA",
                  border: `1.5px solid ${interventionMode ? "#EF5350" : "#EFE4D8"}`,
                  color: interventionMode ? "#C62828" : "#7A7A7A",
                }}
              >
                🎯 Mode aide {interventionMode ? "ON" : ""}
                <span className="text-[10px] font-normal opacity-60">(H)</span>
              </button>
              {interventionMode && stuckStudents.length > 0 && (
                <p className="text-[11px] font-bold text-[#C62828] text-center mt-1.5 animate-pulse">
                  {stuckStudents.length} eleve{stuckStudents.length > 1 ? "s" : ""} {stuckStudents.length > 1 ? "ont" : "a"} besoin d&apos;aide
                </p>
              )}
            </div>

            {/* Student list — always visible */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="px-3 pb-2">
                {studentStates.map(s => {
                  const raw = session.students?.find(st => st.id === s.id);
                  if (!raw || !raw.is_active) return null;
                  const hasHand = !!raw.hand_raised_at;
                  const warnings = raw.warnings || 0;
                  const stateColor = s.state === "responded" ? "#4CAF50" : s.state === "stuck" ? "#EB5757" : s.state === "active" ? "#F2C94C" : "#C4BDB2";
                  return (
                    <button key={s.id} onClick={() => setFicheStudentId(s.id)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-[10px] hover:bg-[#F3ECE3] transition-colors cursor-pointer mb-0.5"
                      style={{ minHeight: 36 }}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stateColor, boxShadow: s.state === "stuck" ? `0 0 6px ${stateColor}40` : undefined }} />
                      <span className="text-[13px] font-semibold text-[#2C2C2C] truncate flex-1">{raw.display_name}</span>
                      {hasHand && <span className="text-xs flex-shrink-0 animate-bounce">✋</span>}
                      {warnings > 0 && <span className="text-[10px] font-bold px-1 py-0.5 rounded-full flex-shrink-0" style={{ background: "#FFF5EB", color: "#F5A45B" }}>⚠{warnings}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stuck alert */}
            {stuckStudents.length > 0 && (
              <div className="px-3 py-2 border-t border-[#EFE4D8] flex-shrink-0">
                <button onClick={handleNudgeAllStuck}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[10px] bg-[#EB5757]/10 border border-[#EB5757]/20 text-[12px] font-semibold text-[#C62828] hover:bg-[#EB5757]/15 cursor-pointer transition-colors">
                  🚀 Relancer {stuckStudents.length} bloque{stuckStudents.length > 1 ? "s" : ""}
                </button>
              </div>
            )}
          </div>
          {/* CENTER: Question + Responses — per pseudo-Figma: warm background */}
          <div className="flex-1 overflow-y-auto min-h-0" style={{ background: "#F7F3EA" }}>
          {ficheStudentId ? (
            <div className="px-4 py-4">
              {(() => {
                const raw = session.students?.find((s) => s.id === ficheStudentId);
                const st = studentStates.find((s) => s.id === ficheStudentId);
                if (!raw) return <div className="text-sm text-bw-muted">Élève introuvable</div>;
                const studentResponses = responses.filter((r) => r.student_id === ficheStudentId) as ResponseCardResponse[];
                return (
                  <StudentFiche
                    studentId={ficheStudentId}
                    student={raw}
                    state={st?.state || "active"}
                    responses={studentResponses}
                    sessionStatus={session.status}
                    onBack={() => setFicheStudentId(null)}
                    onNudge={(sid, text) => {
                      const r = responses.find((r) => r.student_id === sid);
                      if (r) nudgeStudent.mutate({ responseId: r.id, nudgeText: text });
                    }}
                    onWarn={(sid) => warnStudent.mutate(sid)}
                    onBroadcast={() => setShowBroadcast(true)}
                    toggleHide={toggleHide}
                    toggleVoteOption={toggleVoteOption}
                    commentResponse={commentResponse}
                    highlightResponse={highlightResponse}
                    scoreResponse={scoreResponse}
                    resetResponse={resetResponse}
                    nudgeStudent={nudgeStudent}
                    warnStudent={warnStudent}
                    studentWarnings={studentWarnings}
                  />
                );
              })()}
            </div>
          ) : (
          <div className="px-3 sm:px-6 py-4 space-y-4">

          {/* ── TOOLBAR — response section header ── */}
          {session.status !== "done" && !focusMode && (
            <div data-onboarding="responses" className="flex items-center gap-2 pb-3" style={{ borderBottom: "1px solid #EFE4D8" }}>
              {/* Toggle pill: Responses / Plan de classe */}
              <div className="flex rounded-[10px] p-0.5 flex-shrink-0" style={{ background: "#EFE4D8" }}>
                <button
                  onClick={() => setCenterTab("responses")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all cursor-pointer"
                  style={{
                    background: centerTab === "responses" ? "#FFFFFF" : "transparent",
                    color: centerTab === "responses" ? "#2C2C2C" : "#7A7A7A",
                    boxShadow: centerTab === "responses" ? "0 1px 3px rgba(61,43,16,0.08)" : "none",
                  }}
                >
                  {unifiedLabel}
                  {centerTab === "responses" && unifiedRespondedCount > 0 && (
                    <span className="text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded-full" style={{ background: "#4CAF50", color: "#fff" }}>{unifiedRespondedCount}</span>
                  )}
                </button>
                <button
                  onClick={() => setCenterTab("classmap")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all cursor-pointer"
                  style={{
                    background: centerTab === "classmap" ? "#FFFFFF" : "transparent",
                    color: centerTab === "classmap" ? "#2C2C2C" : "#7A7A7A",
                    boxShadow: centerTab === "classmap" ? "0 1px 3px rgba(61,43,16,0.08)" : "none",
                  }}
                >
                  Plan de classe
                </button>
              </div>

              <div className="flex-1" />

              {/* Layout selector — visible only when classmap tab active */}
              {centerTab === "classmap" && (
                <select
                  value={classroomLayout}
                  onChange={(e) => setClassroomLayout(e.target.value as typeof classroomLayout)}
                  className="h-8 px-2.5 rounded-[10px] text-[12px] font-medium bg-white border border-[#E8DFD2] text-[#2C2C2C] cursor-pointer focus:outline-none focus:border-[#6B8CFF]/40 transition-colors"
                >
                  <option value="rows">Rangs</option>
                  <option value="u-shape">En U</option>
                  <option value="islands">Ilots</option>
                  <option value="free">Libre</option>
                </select>
              )}

              {/* Search — only for certain modules when in responses tab */}
              {centerTab === "responses" && (isBudgetQuiz || showM10Special || showM2ECSceneBuilder || showM2ECComparison) && (
                <input
                  type="text" placeholder="Rechercher..." value={cardSearch}
                  onChange={(e) => setCardSearch(e.target.value)}
                  className="w-36 h-8 px-3 rounded-[10px] text-[13px] bg-white border border-[#E8DFD2] text-[#2C2C2C] placeholder:text-[#B0A99E] focus:outline-none focus:border-[#6B8CFF]/40 transition-colors"
                />
              )}
              <button onClick={() => setShowBroadcast(true)} title="Message classe (B)"
                className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm text-[#7A7A7A] hover:text-[#2C2C2C] bg-white border border-[#E8DFD2] cursor-pointer transition-colors hover:shadow-sm">
                📢
              </button>
              <button onClick={() => setShowExport(true)} title="Export (E)"
                className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm text-[#7A7A7A] hover:text-[#2C2C2C] bg-white border border-[#E8DFD2] cursor-pointer transition-colors hover:shadow-sm">
                📋
              </button>
            </div>
          )}

          {/* ── CLASSMAP TAB ── */}
          {centerTab === "classmap" && (
            <ClassroomMap
              students={studentStates.map(s => {
                const raw = session.students?.find(st => st.id === s.id);
                return {
                  id: s.id,
                  display_name: raw?.display_name || "",
                  avatar: raw?.avatar || "",
                  state: s.state,
                  hand_raised_at: raw?.hand_raised_at || null,
                  warnings: raw?.warnings || 0,
                };
              })}
              teams={teams}
              responses={responses}
              moduleResponseTexts={moduleResponseTexts}
              sessionStatus={session.status}
              onNudge={(responseId, text) => nudgeStudent.mutate({ responseId, nudgeText: text })}
              onWarn={(sid) => warnStudent.mutate(sid)}
              onBroadcast={() => setShowBroadcast(true)}
              onNudgeAllStuck={() => handleNudgeAllStuck()}
              onStudentClick={(sid) => setFicheStudentId(sid)}
              layout={classroomLayout}
              desksPerRow={classroomLayout === "rows" ? 4 : 3}
            />
          )}

          {/* ── MODULE-SPECIFIC CONTENT ── */}
          {centerTab === "responses" && <>

          {/* M1 Positioning: option distribution bars only */}
          {isM1Positioning && module1Data?.type === "positioning" && !isPreviewing && module1Data.questions?.[currentQIndex]?.options && (() => {
            const OPTION_COLORS: Record<string, { bg: string; bgLight: string }> = {
              a: { bg: "#7EA7F5", bgLight: "#EEF3FF" },
              b: { bg: "#F3A765", bgLight: "#FFF3E8" },
              c: { bg: "#6EC6B0", bgLight: "#E9F8F4" },
              d: { bg: "#E78BB4", bgLight: "#FDECF4" },
            };
            const allCounts = module1Data.questions[currentQIndex].options?.map(o => module1Data.optionDistribution?.[o.key] || 0) || [];
            const maxCount = Math.max(...allCounts, 0);
            return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {module1Data.questions[currentQIndex].options?.map((opt) => {
                const count = module1Data.optionDistribution?.[opt.key] || 0;
                const total = activeStudents.length;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const colors = OPTION_COLORS[opt.key] || OPTION_COLORS.a;
                const hasVotes = count > 0;
                const isDominant = count > 0 && count === maxCount && allCounts.filter(c => c === maxCount).length === 1;
                return (
                  <motion.div
                    key={opt.key}
                    animate={isDominant ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                    transition={isDominant ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" } : undefined}
                    className="rounded-[18px] transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
                    style={{
                      padding: "20px 22px",
                      minHeight: 152,
                      background: hasVotes ? colors.bg : colors.bgLight,
                      border: hasVotes ? "none" : `1px solid ${colors.bg}20`,
                      boxShadow: isDominant
                        ? `0 8px 32px ${colors.bg}45, 0 4px 12px ${colors.bg}20`
                        : hasVotes
                          ? `0 6px 24px ${colors.bg}35, 0 2px 6px ${colors.bg}15`
                          : "0 2px 8px rgba(61,43,16,0.04)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Badge */}
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold flex-shrink-0"
                        style={{
                          backgroundColor: hasVotes ? "rgba(255,255,255,0.25)" : colors.bg,
                          color: "#fff",
                        }}
                      >
                        {opt.key.toUpperCase()}
                      </span>
                      <span className={`text-[16px] font-medium leading-snug flex-1 min-w-0 ${hasVotes ? "text-white" : "text-[#2C2C2C]"}`}>{opt.label}</span>
                    </div>
                    <div className="mt-auto pt-3 flex items-end gap-4">
                      {/* Percentage hero — 36px/800 */}
                      <span
                        className="text-[40px] font-extrabold tabular-nums leading-none flex-shrink-0"
                        style={{ color: hasVotes ? "#fff" : `${colors.bg}50` }}
                      >
                        {pct}%
                      </span>
                      <div className="flex-1 space-y-1.5">
                        <div className={`h-3 rounded-full overflow-hidden ${hasVotes ? "bg-white/20" : "bg-black/[0.04]"}`}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: hasVotes ? "#fff" : colors.bg }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        </div>
                        <span className={`text-[12px] tabular-nums font-medium ${hasVotes ? "text-white/80" : "text-[#7A7A7A]"}`}>{count} / {total} eleves</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            );
          })()}

          {/* M1 Image: image display only */}
          {isM1Image && module1Data?.type === "image" && (
            <>
              {module1Data.image ? (
                <div className="space-y-2">
                  <div className="rounded-xl overflow-hidden border border-black/[0.06] bg-bw-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={module1Data.image.url} alt={module1Data.image.title}
                      className="w-full aspect-[16/10] object-cover" />
                  </div>
                  <p className="text-xs text-bw-muted text-center">{module1Data.image.title}</p>
                </div>
              ) : (
                <div className="rounded-xl bg-bw-surface border border-black/[0.06] aspect-[16/10] flex items-center justify-center">
                  <p className="text-sm text-bw-muted">Image non disponible</p>
                </div>
              )}
            </>
          )}

          {/* M1 Notebook: responses rendered by ResponseStreamSection below */}

          {/* M9 séance 2: Budget overview + individual budgets */}
          {isBudgetQuiz && (
            <>
              <Module9BudgetOverview
                budgetSubmitted={budgetSubmitted}
                activeStudentCount={activeStudents.length}
                budgetAverages={budgetAverages}
              />

              {/* Individual budgets */}
              {budgetData && budgetData.budgets.length > 0 && (
                <div className="space-y-2">
                  {budgetData.budgets.filter((b) => !cardSearch || (b.students?.display_name || "").toLowerCase().includes(cardSearch.toLowerCase())).map((b) => (
                    <div key={b.id} className="bg-bw-surface rounded-xl p-3 border border-black/[0.06] space-y-2">
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
                                style={{ backgroundColor: cost > 0 ? cat.color : "rgba(0,0,0,0.05)", opacity: cost > 0 ? 0.7 : 1 }} />
                              <span className="text-xs block" style={{ color: cat.color }}>{cat.label}</span>
                              <span className="text-xs text-bw-muted block">{opt.label}</span>
                            </div>
                          );
                        })}
                      </div>
                      {/* Inline actions — uniform with all modules */}
                      <GenericInlineActions
                        entityId={b.id}
                        studentId={b.student_id}
                        studentName={b.students?.display_name || "Élève"}
                        onBroadcast={(msg) => { updateSession.mutate({ broadcast_message: msg, broadcast_at: new Date().toISOString() }); toast.success("Envoyé"); }}
                        onWarn={(sid) => warnStudent.mutate(sid)}
                        isWarnPending={warnStudent.isPending}
                        warnings={studentWarnings[b.student_id] || 0}
                      />
                    </div>
                  ))}
                </div>
              )}

              {budgetSubmitted === 0 && session.status === "responding" && (
                <div className="bg-bw-surface rounded-xl border border-black/[0.06] p-6 text-center space-y-3">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="text-3xl">💰</motion.div>
                  <div>
                    <p className="text-lg font-bold tabular-nums text-bw-teal">{budgetSubmitted}/{activeStudents.length}</p>
                    <p className="text-xs text-bw-muted mt-0.5">budgets soumis</p>
                  </div>
                  <p className="text-xs text-bw-muted/70">Les choix budgetaires apparaitront ici.</p>
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setShowBroadcast(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-bw-elevated border border-black/[0.06] text-bw-muted hover:text-bw-primary hover:border-bw-primary/30 cursor-pointer transition-colors">
                      📢 Message classe
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── MODULE 10: Et si... + Pitch overview ── */}
          {showM10Special && (
            <>
              {/* Activity context */}
              {!isPreviewing && (
                <div className="glass-card p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{isM10Etsi ? "✨" : "🎤"}</span>
                    <span className="text-sm font-semibold text-bw-heading">
                      {isM10Etsi ? "Et si..." : "Pitch"}
                    </span>
                    <span className="text-xs text-bw-muted ml-auto uppercase tracking-wider">
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
                    {module10Data?.type === "etsi"
                      ? "Les élèves observent une image et écrivent leur « Et si... »."
                      : module10Data?.type === "idea-bank"
                      ? "Les élèves partagent leur meilleure idée « Et si... » et votent pour la plus inspirante."
                      : module10Data?.type === "avatar"
                      ? "Les élèves construisent l'identité visuelle de leur personnage : look, prénom, trait de caractère."
                      : module10Data?.type === "objectif"
                      ? "Les élèves choisissent ce que leur personnage VEUT (objectif) et ce qui l'en EMPÊCHE (obstacle). C'est le moteur du conflit."
                      : module10Data?.type === "pitch"
                      ? "Les élèves écrivent un vrai récit (min 80 car.) à partir de leur personnage, objectif et obstacle. Pas de template — ils racontent l'histoire."
                      : module10Data?.type === "chrono"
                      ? "Les élèves lisent leur pitch à voix haute en 60 secondes. Exercice d'oral et de concision."
                      : module10Data?.type === "confrontation"
                      ? "Deux pitchs sont projetés. La classe écoute et vote pour celui qui donne le plus envie de voir le film."
                      : ""}
                  </p>
                </div>
              )}

              {/* Et si... Image — shown to students, visible in dashboard */}
              {module10Data?.type === "etsi" && module10Data.image && (
                <div className="rounded-xl overflow-hidden border border-bw-teal/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={module10Data.image.url}
                    alt={module10Data.image.title}
                    className="w-full h-auto max-h-48 object-cover"
                  />
                  <div className="bg-bw-elevated px-3 py-2 border-t border-black/[0.06]">
                    <p className="text-xs font-medium text-bw-teal">{module10Data.image.title}</p>
                    <p className="text-xs text-bw-muted mt-0.5 line-clamp-2">{module10Data.image.description}</p>
                  </div>
                </div>
              )}

              {/* Pitch — show personnage card if available */}
              {module10Data?.personnage && (module10Data.type === "objectif" || module10Data.type === "pitch" || module10Data.type === "chrono") && (
                <div className="bg-bw-elevated rounded-xl p-3 border border-black/[0.06] flex items-center gap-3">
                  <DiceBearAvatarMini options={module10Data.personnage.avatar || {}} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-bw-heading truncate">{module10Data.personnage.prenom}</p>
                    <p className="text-xs text-bw-muted">{module10Data.personnage.trait}</p>
                  </div>
                  {module10Data.objectif && (
                    <div className="text-right">
                      <p className="text-xs text-bw-muted">Objectif</p>
                      <p className="text-xs text-bw-teal truncate max-w-[120px]">{module10Data.objectif}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Confrontation — pitch picker + show selected pitchs */}
              {module10Data?.type === "confrontation" && (
                <>
                  {/* Selected pitchs display */}
                  {module10Data.confrontation && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-bw-teal/10 rounded-xl p-3 border border-bw-teal/20">
                        <p className="text-xs text-bw-teal font-bold uppercase mb-1">Pitch A — {module10Data.confrontation.pitchA.prenom}</p>
                        <p className="text-xs text-bw-text line-clamp-3">{module10Data.confrontation.pitchA.text}</p>
                      </div>
                      <div className="bg-bw-danger/10 rounded-xl p-3 border border-bw-danger/20">
                        <p className="text-xs text-bw-danger font-bold uppercase mb-1">Pitch B — {module10Data.confrontation.pitchB.prenom}</p>
                        <p className="text-xs text-bw-text line-clamp-3">{module10Data.confrontation.pitchB.text}</p>
                      </div>
                    </div>
                  )}
                  {/* Pitch picker for teacher */}
                  {module10Data.pitchList && module10Data.pitchList.length >= 2 && (
                    <div className="bg-bw-surface rounded-xl p-3 border border-black/[0.06] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-bw-muted uppercase font-semibold tracking-wider">Choisir les pitchs à confronter</span>
                        <span className="text-xs text-bw-muted">{selectedPitchIds.length}/2</span>
                      </div>
                      {module10Data.pitchList.map((p) => {
                        const isSelected = selectedPitchIds.includes(p.studentId);
                        const idx = selectedPitchIds.indexOf(p.studentId);
                        return (
                          <button key={p.studentId}
                            onClick={() => setSelectedPitchIds((prev) => {
                              if (isSelected) return prev.filter((id) => id !== p.studentId);
                              if (prev.length >= 2) return [prev[1], p.studentId];
                              return [...prev, p.studentId];
                            })}
                            className={`w-full text-left p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? idx === 0 ? "bg-bw-teal/10 border-bw-teal/30 text-bw-teal" : "bg-bw-danger/10 border-bw-danger/30 text-bw-danger"
                                : "bg-bw-bg border-black/[0.06] text-bw-muted hover:border-bw-teal/20"
                            }`}>
                            <span className="font-medium">{isSelected ? (idx === 0 ? "A" : "B") + " — " : ""}{p.prenom}</span>
                            <span className="block text-xs text-bw-muted mt-0.5 line-clamp-1">{p.text}</span>
                          </button>
                        );
                      })}
                      {selectedPitchIds.length === 2 && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/sessions/${sessionId}/situation?pitchA=${selectedPitchIds[0]}&pitchB=${selectedPitchIds[1]}`);
                              if (res.ok) {
                                const data = await res.json();
                                queryClient.setQueryData(
                                  ["pilot-situation", sessionId, session.current_module, session.current_seance, session.current_situation_index],
                                  data
                                );
                                toast.success("Duel mis à jour");
                              }
                            } catch { toast.error("Erreur"); }
                          }}
                          className="w-full py-2 rounded-lg bg-bw-teal text-white text-xs font-medium cursor-pointer hover:brightness-110 transition-all">
                          Lancer le duel
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Idea bank items */}
              {module10Data?.type === "idea-bank" && module10Data.ideaBankItems && module10Data.ideaBankItems.length > 0 && (
                <div className="bg-bw-surface rounded-xl p-3 border border-black/[0.06] space-y-1.5">
                  <p className="text-xs text-bw-muted uppercase font-semibold tracking-wider">💡 Banque d&apos;idées</p>
                  {module10Data.ideaBankItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      <span className="text-bw-teal font-medium tabular-nums">{item.votes}♥</span>
                      <span className="text-bw-text truncate">{item.text}</span>
                    </div>
                  ))}
                  {module10Data.ideaBankItems.length > 5 && (
                    <p className="text-xs text-bw-muted">+{module10Data.ideaBankItems.length - 5} autres</p>
                  )}
                </div>
              )}

              {/* All submissions list (facilitator view for M10 special positions) */}
              {module10Data?.allSubmissions && module10Data.allSubmissions.length > 0 && (
                <div className="space-y-1.5">
                  {module10Data.allSubmissions.filter((sub) => !cardSearch || (sub.studentName || "").toLowerCase().includes(cardSearch.toLowerCase()) || (sub.text || "").toLowerCase().includes(cardSearch.toLowerCase())).map((sub, i) => (
                    <motion.div key={sub.studentId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-bw-surface rounded-xl p-3 border border-black/[0.06] space-y-2">
                      <div className="flex items-start gap-2">
                        {sub.avatar && (
                          <DiceBearAvatarMini options={sub.avatar} size={28} />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-bw-text">{sub.studentName}</span>
                          <p className="text-sm text-bw-heading leading-snug mt-0.5 whitespace-pre-wrap">{sub.text}</p>
                        </div>
                      </div>
                      {/* Inline actions — uniform with all modules */}
                      <GenericInlineActions
                        entityId={sub.studentId}
                        studentId={sub.studentId}
                        studentName={sub.studentName}
                        onBroadcast={(msg) => { updateSession.mutate({ broadcast_message: msg, broadcast_at: new Date().toISOString() }); toast.success("Envoyé"); }}
                        onWarn={(sid) => warnStudent.mutate(sid)}
                        isWarnPending={warnStudent.isPending}
                        warnings={studentWarnings[sub.studentId] || 0}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

            </>
          )}

          {/* ── MODULE 12: Construction Collective cockpit ── */}
          {isM12Any && module12Data && (
            <Module12Cockpit
              sessionId={session.id}
              currentSituationIndex={currentQIndex}
              module12={module12Data}
              connectedCount={activeStudents.length}
            />
          )}

          {/* ── MODULE 2 EC: Checklist cockpit ── */}
          {showM2ECChecklist && (
            <>
              {/* What students are doing */}
              {!isPreviewing && (
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
              )}

              {/* Top items when available */}
              {module5Data?.topItems && module5Data.topItems.length > 0 && (
                <div className="bg-bw-surface rounded-xl p-4 border border-black/[0.06] space-y-2">
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
                <div className="bg-bw-surface rounded-xl border border-black/[0.06] p-6 text-center space-y-3">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="text-2xl">📋</motion.div>
                  <div>
                    <p className="text-lg font-bold tabular-nums text-bw-teal">{module5Data?.submittedCount || 0}/{activeStudents.length}</p>
                    <p className="text-xs text-bw-muted mt-0.5">checklists soumises</p>
                  </div>
                  <p className="text-xs text-bw-muted/70">Les choix des eleves apparaitront ici.</p>
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setShowBroadcast(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-bw-elevated border border-black/[0.06] text-bw-muted hover:text-bw-primary hover:border-bw-primary/30 cursor-pointer transition-colors">
                      📢 Message classe
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── MODULE 2 EC: Scene Builder cockpit ── */}
          {showM2ECSceneBuilder && (
            <>
              {/* What students are doing — hidden when preview guide shows same info */}
              {!isPreviewing && (
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
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-bw-bg border border-black/[0.06]">
                      <span>📦</span><span className="text-bw-text">{MAX_SLOTS} emplacements</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-bw-bg border border-black/[0.06]">
                      <span>🪙</span><span className="text-bw-text">{MAX_TOKENS} jetons max</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Emotions available */}
              {/* Emotion distribution when available */}
              {module5Data?.emotionDistribution && Object.keys(module5Data.emotionDistribution).length > 0 && (
                <Module5EmotionDistribution emotionDistribution={module5Data.emotionDistribution} />
              )}

              {/* Scene cards from scenesData */}
              {scenesData && scenesData.scenes.length > 0 && (
                <div className="space-y-2">
                  {scenesData.scenes.filter((sc) => !cardSearch || (sc.students?.display_name || "").toLowerCase().includes(cardSearch.toLowerCase()) || sc.intention?.toLowerCase().includes(cardSearch.toLowerCase()) || sc.obstacle?.toLowerCase().includes(cardSearch.toLowerCase())).map((sc, i) => {
                    const emo = EMOTIONS.find(e => e.key === sc.emotion);
                    return (
                      <motion.div key={sc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="bg-bw-surface rounded-xl p-3 border border-black/[0.06] space-y-2">
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
                              <span key={el.key} className="text-xs px-1.5 py-0.5 rounded bg-black/[0.04] text-bw-text">
                                {def?.label || el.key}
                              </span>
                            );
                          })}
                          <span className="ml-auto text-xs text-bw-muted tabular-nums">{sc.tokens_used}🪙 {sc.slots_used}/5📦</span>
                        </div>
                        {/* Inline actions — uniform with all modules */}
                        <GenericInlineActions
                          entityId={sc.id}
                          studentId={sc.student_id}
                          studentName={sc.students?.display_name || "Élève"}
                          onBroadcast={(msg) => { updateSession.mutate({ broadcast_message: msg, broadcast_at: new Date().toISOString() }); toast.success("Envoyé"); }}
                          onWarn={(sid) => warnStudent.mutate(sid)}
                          isWarnPending={warnStudent.isPending}
                          warnings={studentWarnings[sc.student_id] || 0}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Waiting state when no scenes yet */}
              {(!scenesData || scenesData.scenes.length === 0) && session.status === "responding" && (
                <div className="bg-bw-surface rounded-xl border border-black/[0.06] p-6 text-center space-y-3">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="text-2xl">🎬</motion.div>
                  <div>
                    <p className="text-lg font-bold tabular-nums text-bw-teal">{scenesData?.count || 0}/{activeStudents.length}</p>
                    <p className="text-xs text-bw-muted mt-0.5">scenes construites</p>
                  </div>
                  <p className="text-xs text-bw-muted/70">Les scenes apparaitront ici au fur et a mesure.</p>
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setShowBroadcast(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-bw-elevated border border-black/[0.06] text-bw-muted hover:text-bw-primary hover:border-bw-primary/30 cursor-pointer transition-colors">
                      📢 Message classe
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── MODULE 2 EC: Comparison cockpit (séance 3) ── */}
          {showM2ECComparison && (
            <>
              {/* What students are doing */}
              {!isPreviewing && (
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
              )}

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
                    {scenesData.scenes.filter((sc) => !cardSearch || (sc.students?.display_name || "").toLowerCase().includes(cardSearch.toLowerCase()) || sc.intention?.toLowerCase().includes(cardSearch.toLowerCase())).map((sc, i) => {
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
                            isSelected ? "border-bw-pink/60 bg-bw-pink/5" : "border-black/[0.06] hover:border-black/[0.10]"
                          }`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${
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
                                <span key={el.key} className="text-xs px-1.5 py-0.5 rounded bg-black/[0.04] text-bw-text">
                                  {def?.label || el.key}
                                </span>
                              );
                            })}
                            <span className="ml-auto text-xs text-bw-muted tabular-nums">{sc.tokens_used}🪙 {sc.slots_used}/5📦</span>
                          </div>
                          {/* Inline actions — uniform with all modules */}
                          <div className="pl-7">
                            <GenericInlineActions
                              entityId={sc.id}
                              studentId={sc.student_id}
                              studentName={sc.students?.display_name || "Élève"}
                              onBroadcast={(msg) => { updateSession.mutate({ broadcast_message: msg, broadcast_at: new Date().toISOString() }); toast.success("Envoyé"); }}
                              onWarn={(sid) => warnStudent.mutate(sid)}
                              isWarnPending={warnStudent.isPending}
                              warnings={studentWarnings[sc.student_id] || 0}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Waiting state when no scenes yet */}
              {(!scenesData || scenesData.scenes.length === 0) && (
                <div className="bg-bw-surface rounded-xl border border-black/[0.06] p-6 text-center space-y-3">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="text-3xl">⚔️</motion.div>
                  <div>
                    <p className="text-lg font-bold tabular-nums text-bw-teal">{scenesData?.count || 0}/{activeStudents.length}</p>
                    <p className="text-xs text-bw-muted mt-0.5">scenes disponibles</p>
                  </div>
                  <p className="text-xs text-bw-muted/70">Les scenes des eleves apparaitront ici pour la confrontation.</p>
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setShowBroadcast(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-bw-elevated border border-black/[0.06] text-bw-muted hover:text-bw-primary hover:border-bw-primary/30 cursor-pointer transition-colors">
                      📢 Message classe
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── VOTE RESULTS (Standard Q&A) ── */}
          {isStandardQA && (session.status === "voting" || session.status === "reviewing") && voteData && voteData.results.length > 0 && (
            <VotingResults
              voteData={voteData}
              sessionStatus={session.status}
              onValidateWinner={(responseId, text, students) => {
                const fakeResponse: Response = { id: responseId, student_id: "", situation_id: "", text, submitted_at: "", is_hidden: false, is_vote_option: true, is_highlighted: false, teacher_comment: null, students };
                setReformulating(fakeResponse);
                setReformulatedText(text);
              }}
            />
          )}

          {/* Voting empty state — no votes yet */}
          {isStandardQA && (session.status === "voting" || session.status === "reviewing") && (!voteData || voteData.totalVotes === 0) && (
            <div className="bg-bw-surface rounded-xl border border-black/[0.06] p-4 text-center space-y-2">
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

          {/* ── FOCUS MODE SUMMARY ── */}
          {focusMode && session.status !== "done" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 space-y-4"
            >
              <div className="text-6xl font-mono font-bold text-bw-teal tabular-nums">
                {respondedCount}/{activeStudents.length}
              </div>
              <p className="text-sm text-bw-muted">ont repondu</p>
              {session.status === "voting" && voteData && (
                <div className="text-2xl font-mono font-bold text-bw-violet">{voteData.totalVotes} votes</div>
              )}
            </motion.div>
          )}

          {/* ── RESPONSE STREAM (Standard Q&A + M1 Image/Notebook — responding) ── */}
          {!focusMode && (isStandardQA || isM1Image || isM1Notebook) && session.status !== "done" && session.status !== "paused" && !(session.status === "voting" || session.status === "reviewing") && (
            <ResponseStreamSection
              filteredResponses={filteredResponses as ResponseCardResponse[]}
              responses={responses}
              activeStudents={activeStudents}
              respondedCount={respondedCount}
              highlightedCount={highlightedCount}
              respondingOpenedAt={respondingOpenedAt}
              sessionStatus={session.status}
              winnerResponseId={winnerResponseId}
              stuckStudents={stuckStudents}
              questionGuide={questionGuide}
              situation={situation}
              studentWarnings={studentWarnings}
              responseFilter={responseFilter}
              setResponseFilter={setResponseFilter}
              responseSortMode={responseSortMode}
              setResponseSortMode={setResponseSortMode}
              onShowBroadcast={() => setShowBroadcast(true)}
              onShowCompare={() => setShowCompare(true)}
              onShowExport={() => setShowExport(true)}
              showRevealAnswer={showRevealAnswer}
              onToggleRevealAnswer={() => setShowRevealAnswer((v) => !v)}
              onClearAllHighlights={handleClearAllHighlights}
              onNudgeAllStuck={handleNudgeAllStuck}
              toggleVoteOption={toggleVoteOption}
              toggleHide={toggleHide}
              commentResponse={commentResponse}
              highlightResponse={highlightResponse}
              nudgeStudent={nudgeStudent}
              warnStudent={warnStudent}
              scoreResponse={scoreResponse}
              resetResponse={resetResponse}
              aiEvaluate={aiEvaluate}
              resetAllResponses={resetAllResponses}
              onReformulate={(r) => {
                setReformulating(r as unknown as Response);
                setReformulatedText(r.text);
              }}
              onHighlightAllVisible={handleHighlightAllVisible}
              onHideAllVisible={handleHideAllVisible}
            />
          )}

          {/* ── RESPONSES LIST (Budget/other — simpler display with inline actions) ── */}
          {/* M1 Positioning: responses moved to right panel to avoid center scroll */}
          {!isStandardQA && !isM1Image && !isM1Notebook && !isM12Any && !isM1Positioning && session.status !== "done" && responses.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[14px] font-semibold text-[#7A7A7A]">Reponses</span>
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
                      r.is_highlighted ? "border-bw-primary/30 shadow-[0_0_8px_rgba(255,107,53,0.1)]" : r.reset_at ? "border-bw-amber/20" : "border-black/[0.06]"
                    } ${r.is_hidden ? "opacity-30" : ""} ${r.reset_at ? "opacity-50" : ""}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-sm">{r.students?.avatar}</span>
                          <span className={`text-sm font-medium text-bw-text ${r.is_hidden ? "line-through" : ""}`}>{r.students?.display_name}</span>
                          {r.reset_at && (
                            <span className="text-xs px-1.5 py-px rounded-full bg-bw-amber/15 text-bw-amber border border-bw-amber/20">relancé</span>
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed text-bw-heading ${r.is_hidden ? "line-through text-bw-muted" : ""} ${r.reset_at ? "line-through text-bw-muted" : ""}`}>{r.text}</p>
                        {r.teacher_comment && <TeacherCommentBadge comment={r.teacher_comment} />}
                      </div>
                      {session.status === "responding" && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => toggleHide.mutate({ responseId: r.id, is_hidden: !r.is_hidden })}
                            disabled={toggleHide.isPending}
                            className="px-2 py-1 text-xs rounded-lg hover:bg-black/[0.05] cursor-pointer transition-colors text-bw-muted hover:text-bw-text">
                            {r.is_hidden ? "Montrer" : "Masquer"}
                          </button>
                          {!r.is_hidden && !r.reset_at && (
                            <button onClick={() => resetResponse.mutate(r.id)}
                              disabled={resetResponse.isPending}
                              className="px-1.5 py-1 text-xs rounded-lg hover:bg-bw-amber/10 cursor-pointer transition-colors text-bw-amber/70 hover:text-bw-amber"
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

          {/* ── EMPTY STATE — lively waiting state with animated avatars ── */}
          {session.status === "responding" && unifiedRespondedCount === 0 && responses.length === 0 && !isStandardQA && !isM1Image && !isM1Notebook && !isM12Any && !isBudgetQuiz && !isM1Positioning && (
            <div
              className="rounded-[16px] p-8 text-center space-y-5"
              style={{
                background: "#FFFFFF",
                border: "1px solid #EFE4D8",
                boxShadow: "0 4px 16px rgba(61,43,16,0.04)",
              }}
            >
              {/* Animated student avatars — thinking */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {activeStudents.slice(0, 12).map((s, i) => (
                  <motion.span
                    key={s.id}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                    style={{ background: "#FFF8E1", border: "2px solid #FFE082" }}
                    animate={{ y: [0, -4, 0], opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.15, ease: "easeInOut" }}
                    title={s.display_name}
                  >
                    {s.avatar}
                  </motion.span>
                ))}
                {activeStudents.length > 12 && (
                  <span className="text-[12px] text-[#B0A99E] font-semibold ml-1">+{activeStudents.length - 12}</span>
                )}
              </div>
              {/* Thinking dots animation */}
              <div className="flex items-center justify-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#F2C94C" }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
                  />
                ))}
              </div>
              <div>
                <p className="text-[20px] font-bold text-[#F2C94C]">{activeStudents.length} eleves reflechissent...</p>
                <p className="text-[13px] text-[#B0A99E] mt-1">Les reponses apparaitront ici au fur et a mesure.</p>
              </div>
              <div className="flex items-center justify-center gap-2.5">
                <button onClick={() => setShowBroadcast(true)}
                  className="flex items-center gap-2 h-9 px-4 rounded-[10px] text-[13px] font-medium bg-white border border-[#E8DFD2] text-[#7A7A7A] hover:text-[#2C2C2C] hover:shadow-sm cursor-pointer transition-all">
                  📢 Message classe
                </button>
              </div>
              <p className="text-[12px] text-[#C4BDB2] italic">Astuce : projetez la question sur l&apos;ecran ↗</p>
            </div>
          )}

          {/* ── PAS ENCORE RÉPONDU — student chips (hidden for M1 Positioning — info visible in left panel plan de classe) ── */}
          {!focusMode && !isM1Positioning && session.status === "responding" && notRespondedStudents.length > 0 && (
            <div
              className="rounded-[16px] p-4 space-y-3"
              style={{
                background: "#FFFFFF",
                border: "1px solid #EFE4D8",
                boxShadow: "0 2px 8px rgba(61,43,16,0.04)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#7A7A7A] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F2C94C]" />
                  Pas encore repondu ({notRespondedStudents.length})
                </span>
                {stuckStudents.length > 0 && (
                  <button onClick={handleNudgeAllStuck}
                    className="text-[12px] font-semibold cursor-pointer transition-colors px-2.5 py-1 rounded-[8px]"
                    style={{ background: "#FFF0E6", color: "#8B4513", border: "1px solid #E6DBCF" }}>
                    Relancer {stuckStudents.length} bloque{stuckStudents.length > 1 ? "s" : ""}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {notRespondedStudents.slice(0, 20).map((s) => {
                  const st = studentStates.find((ss) => ss.id === s.id);
                  const isStuck = st?.state === "stuck";
                  const hasHand = !!s.hand_raised_at;
                  return (
                    <button key={s.id}
                      onClick={() => setFicheStudentId(s.id)}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-[12px] font-medium cursor-pointer transition-all duration-200"
                      style={{
                        background: isStuck ? "#FFEBEE" : hasHand ? "#FFF8E1" : "#F7F3EA",
                        border: `1px solid ${isStuck ? "#FFCDD2" : hasHand ? "#FFE082" : "#E8DFD2"}`,
                        color: isStuck ? "#C62828" : hasHand ? "#F57F17" : "#4A4A4A",
                      }}
                    >
                      <span className="text-sm">{s.avatar}</span>
                      <span>{s.display_name}</span>
                      {isStuck && <span className="text-[10px] animate-pulse">●</span>}
                      {hasHand && <span className="text-xs">✋</span>}
                    </button>
                  );
                })}
                {notRespondedStudents.length > 20 && (
                  <span className="text-[12px] text-[#B0A99E] self-center px-1">+{notRespondedStudents.length - 20} autres</span>
                )}
              </div>
            </div>
          )}

          {/* Choices history (Standard Q&A) */}
          {!focusMode && isStandardQA && collectiveChoices.length > 0 && (
            <ChoicesHistory choices={collectiveChoices} />
          )}

          </>}
        </div>
        )}
        </div>
          {/* RIGHT: Assistant pedagogique — 320px panel, hidden below xl */}
          <div className="hidden lg:flex w-[260px] xl:w-[320px] flex-shrink-0 flex-col"
            style={{ background: "#FAF6EE", borderLeft: "1px solid #EEE4D8" }}>
            {/* Title */}
            <div className="px-5 pt-5 pb-3 flex-shrink-0">
              <h3 className="text-[18px] font-semibold text-[#2C2C2C]">Assistant pedagogique</h3>
              <p className="text-[13px] text-[#7A7A7A] mt-0.5">Aide a la lecture de la classe</p>
            </div>
            {/* AI suggestions + insights */}
            <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
              {session.status !== "done" ? (
                <AIAssistantPanel
                  context={{
                    status: session.status,
                    totalStudents: activeStudents.length,
                    responsesCount: respondedCount,
                    stuckCount: stuckStudents.length,
                    stuckNames: stuckStudents.map(s => s.name?.split(" ")[0] || s.name),
                    handsRaised: session.students?.filter(s => s.hand_raised_at).length || 0,
                    handsNames: session.students?.filter(s => s.hand_raised_at).map(s => s.display_name?.split(" ")[0] || s.display_name) || [],
                    elapsedSeconds: respondingOpenedAt
                      ? Math.round((Date.now() - respondingOpenedAt) / 1000)
                      : 0,
                    currentModule: session.current_module,
                    currentSeance: session.current_seance || 1,
                    currentSituation: session.current_situation_index || 0,
                    optionDistribution: (isM1Positioning && module1Data?.optionDistribution)
                      ? module1Data.optionDistribution as Record<string, number>
                      : undefined,
                  }}
                  onSendHint={() => setShowBroadcast(true)}
                  onReformulate={() => setShowBroadcast(true)}
                  onLaunchVote={() => updateSession.mutate({ status: "voting", timer_ends_at: null })}
                  onBroadcast={() => setShowBroadcast(true)}
                  onDebate={() => setShowBroadcast(true)}
                />
              ) : responses.length > 0 ? (
                <ComprehensionHeatmap
                  students={activeStudents.map(s => ({
                    id: s.id,
                    display_name: s.display_name,
                    avatar: s.avatar,
                  }))}
                  responses={responses.map((r, i) => ({
                    student_id: r.student_id,
                    situation_index: i,
                    score: r.teacher_score ?? r.ai_score ?? null,
                    has_response: true,
                    was_retained: r.is_vote_option || false,
                  }))}
                  totalSituations={totalQuestions || 1}
                  currentSituation={session.current_situation_index || 0}
                />
              ) : (
                <div className="text-center py-8 space-y-2">
                  <span className="text-2xl">🎬</span>
                  <p className="text-xs text-bw-muted">Les suggestions apparaitront pendant la session.</p>
                </div>
              )}

              {/* Vote columns for M1 Positioning (QCM sondage view) */}
              {isM1Positioning && session.status !== "done" && (() => {
                const opts = module1Data?.questions?.[currentQIndex]?.options || [];
                const VOTE_COLORS: Record<string, string> = { a: "#7EA7F5", b: "#F3A765", c: "#6EC6B0", d: "#E78BB4" };
                const VOTE_BG: Record<string, string> = { a: "#EEF3FF", b: "#FFF3E8", c: "#E9F8F4", d: "#FDECF4" };
                // Group responses by option key
                const votesByOption: Record<string, { avatar: string; name: string; id: string }[]> = {};
                for (const opt of opts) votesByOption[opt.key] = [];
                for (const r of responses.filter(r => !r.is_hidden)) {
                  const key = r.text?.trim().toLowerCase();
                  if (key && votesByOption[key]) {
                    votesByOption[key].push({ avatar: r.students?.avatar || "", name: r.students?.display_name || "", id: r.student_id });
                  }
                }
                const totalVotes = responses.filter(r => !r.is_hidden).length;
                return (
                  <div className="rounded-[14px] overflow-hidden" style={{ background: "#FFFDF9", border: "1px solid #EFE4D8" }}>
                    <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: "1px solid #EFE4D8" }}>
                      <span className="text-[13px] font-semibold text-[#2C2C2C]">Qui a vote quoi</span>
                      <span className="text-[13px] font-bold tabular-nums" style={{ color: totalVotes > 0 ? "#4CAF50" : "#B0A99E" }}>
                        {totalVotes}/{activeStudents.length}
                      </span>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto px-3 py-2.5 space-y-2.5">
                      {totalVotes === 0 ? (
                        <div className="py-3 text-center">
                          <div className="flex items-center justify-center gap-1 mb-2">
                            {[0, 1, 2].map(i => (
                              <motion.span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "#F2C94C" }}
                                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }} />
                            ))}
                          </div>
                          <p className="text-[12px] text-[#B0A99E]">En attente des votes...</p>
                        </div>
                      ) : (
                        opts.map(opt => {
                          const voters = votesByOption[opt.key] || [];
                          if (voters.length === 0) return null;
                          const color = VOTE_COLORS[opt.key] || "#7A7A7A";
                          const bg = VOTE_BG[opt.key] || "#F7F3EA";
                          return (
                            <div key={opt.key}>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                                  style={{ background: color }}>{opt.key.toUpperCase()}</span>
                                <span className="text-[12px] font-semibold text-[#4A4A4A] truncate">{opt.label}</span>
                                <span className="text-[11px] font-bold tabular-nums ml-auto flex-shrink-0" style={{ color }}>{voters.length}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 ml-7">
                                {voters.map(v => (
                                  <motion.button key={v.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                    onClick={() => setFicheStudentId(v.id)}
                                    className="flex items-center gap-1 h-6 px-2 rounded-full text-[11px] font-medium cursor-pointer transition-colors hover:brightness-95"
                                    style={{ background: bg, border: `1px solid ${color}30`, color: "#4A4A4A" }}>
                                    <span className="text-xs">{v.avatar}</span>
                                    <span>{v.name.split(" ")[0]}</span>
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Carte cognitive — QCM thinking style (M1 Positioning only) */}
              {isM1Positioning && module1Data?.optionDistribution && module1Data.questions?.[currentQIndex]?.options && (() => {
                const dist = module1Data.optionDistribution as Record<string, number>;
                const totalVotes = Object.values(dist).reduce((sum, v) => sum + v, 0);
                if (totalVotes < 3) return null;
                const cogOptions = module1Data.questions[currentQIndex].options!.map(o => ({
                  key: o.key,
                  label: o.label,
                  count: dist[o.key] || 0,
                }));
                return (
                  <>
                    <div style={{ borderTop: "1px solid #EFE4D8" }} />
                    <CognitiveMap options={cogOptions} total={totalVotes} />
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER — 76px sticky action bar per pseudo-Figma ── */}
      {session.status !== "done" && session.status !== "paused" && (
        <div className="flex-shrink-0" style={{ background: "#F5EFE6", borderTop: "1px solid #E8DFD2" }}>
          {/* Action buttons row + CTA */}
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6" style={{ height: 68, minHeight: 68 }}>
            {/* LEFT: Action buttons — responsive: hide labels on small screens */}
            {session.status !== "waiting" && session.status !== "done" && (
              <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 overflow-x-auto">
                {/* Groupe 1: Aider */}
                <div className="flex items-center gap-1 px-1 py-0.5 rounded-[10px]" style={{ background: "#FAF6EE" }}>
                  <button onClick={() => setShowBroadcast(true)}
                    className="h-9 sm:h-10 px-2 sm:px-3 rounded-[10px] text-[12px] sm:text-[13px] font-semibold cursor-pointer transition-colors whitespace-nowrap border"
                    style={{ background: "#FFF0E6", borderColor: "#E6DBCF", color: "#8B4513" }}>
                    💡 <span className="hidden sm:inline">Indice</span>
                  </button>
                  <button onClick={handleNudgeAllStuck} disabled={stuckStudents.length === 0}
                    className="h-9 sm:h-10 px-2 sm:px-3 rounded-[10px] text-[12px] sm:text-[13px] font-semibold cursor-pointer transition-colors whitespace-nowrap border disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: "#EBF2FF", borderColor: "#E6DBCF", color: "#3B5998" }}>
                    🚀 <span className="hidden sm:inline">Relancer{stuckStudents.length > 0 ? ` (${stuckStudents.length})` : ""}</span>
                    <span className="sm:hidden">{stuckStudents.length > 0 ? stuckStudents.length : ""}</span>
                  </button>
                </div>
                {/* Separateur */}
                <div className="w-px h-6 hidden sm:block" style={{ background: "#E8DFD2" }} />
                {/* Groupe 2: Discuter */}
                <div className="flex items-center gap-1 px-1 py-0.5 rounded-[10px]" style={{ background: "#FAF6EE" }}>
                  <button onClick={() => setShowBroadcast(true)}
                    className="h-9 sm:h-10 px-2 sm:px-3 rounded-[10px] text-[12px] sm:text-[13px] font-semibold cursor-pointer transition-colors whitespace-nowrap border"
                    style={{ background: "#E8F5F2", borderColor: "#E6DBCF", color: "#1B5E50" }}>
                    💬 <span className="hidden sm:inline">Discussion</span>
                  </button>
                  <button onClick={() => setShowBroadcast(true)}
                    className="h-9 sm:h-10 px-2 sm:px-3 rounded-[10px] text-[12px] sm:text-[13px] font-semibold cursor-pointer transition-colors whitespace-nowrap border"
                    style={{ background: "#F0ECF8", borderColor: "#E6DBCF", color: "#5B3A8E" }}>
                    🎭 <span className="hidden sm:inline">Debat</span>
                  </button>
                </div>
                {/* Separateur */}
                <div className="w-px h-6 hidden sm:block" style={{ background: "#E8DFD2" }} />
                {/* Groupe 3: Voter */}
                <button onClick={() => { if (responses.length >= 2) setShowCompare(true); }} disabled={responses.length < 2}
                  className="h-9 sm:h-10 px-2 sm:px-3 rounded-[10px] text-[12px] sm:text-[13px] font-semibold cursor-pointer transition-colors whitespace-nowrap border disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: "#FFF8E6", borderColor: "#E6DBCF", color: "#8B6914" }}>
                  🗳️ <span className="hidden sm:inline">Vote rapide</span>
                </button>
              </div>
            )}
            <div className="flex-1" />

          {/* RIGHT: Navigation + CTA */}
          <div ref={footerCtaRef} className="flex items-center gap-3 flex-shrink-0">
            {/* Back button for non-QA modules */}
            {!isStandardQA && (session.current_situation_index || 0) > 0 && (
              <button
                onClick={prevSituation}
                disabled={updateSession.isPending}
                title="Question précédente"
                className="h-11 px-3.5 rounded-[12px] flex items-center justify-center text-[#4A4A4A] bg-white border border-[#E6DBCF] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0 text-[13px] font-medium gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Precedente
              </button>
            )}

            {/* Main CTA — Suivant is dominant */}
            <div className="min-w-[180px]">
              {session.status === "waiting" ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => {
                    if (isPreviewing) {
                      setPreviewIndex(null);
                      updateSession.mutate({ current_situation_index: displayIndex, status: "responding", timer_ends_at: null });
                    } else {
                      updateSession.mutate({ status: "responding", timer_ends_at: null });
                    }
                  }}
                  disabled={updateSession.isPending}
                  className="w-full h-11 px-6 rounded-[12px] font-bold text-[14px] cursor-pointer transition-all duration-300 disabled:opacity-50 text-white"
                  style={{
                    backgroundColor: isPreviewing ? "#F5A45B" : "#2C2C2C",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}>
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
                  onQuickVote={handleQuickVote}
                  actionDisabled={
                    (session.status === "responding" && voteOptionCount < 2) ||
                    (session.status === "voting" && (!voteData || voteData.totalVotes === 0))
                  }
                  isPending={updateSession.isPending}
                  pulse={allResponded}
                />
              ) : nextAction ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={handleNextAction}
                  disabled={updateSession.isPending || !!(nextAction as { disabled?: boolean }).disabled}
                  className="w-full h-11 rounded-[12px] font-bold text-[14px] cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "#2C2C2C",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}>
                  {nextAction.label} {nextAction.shortcut && <kbd className="inline-flex items-center justify-center w-5 h-5 ml-1.5 rounded bg-black/[0.08] text-[10px] font-mono">{nextAction.shortcut}</kbd>}
                </motion.button>
              ) : (
                <div className="w-full py-2.5 rounded-lg text-sm text-center bg-bw-elevated text-bw-muted border border-black/[0.06]" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                  {session.status === "responding"
                    ? <span className="flex items-center justify-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-bw-teal animate-pulse" />En attente... <span className="text-bw-text font-semibold tabular-nums">{respondedCount}/{activeStudents.length}</span></span>
                    : session.status === "voting"
                      ? <span className="flex items-center justify-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-bw-violet animate-pulse" />Vote en cours... <span className="text-bw-text font-semibold tabular-nums">{voteData?.totalVotes || 0} votes</span></span>
                      : <span className="flex items-center justify-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-bw-muted animate-pulse" />En attente...</span>}
                </div>
              )}
            </div>

            {/* Skip button for non-QA */}
            {!isStandardQA && canGoNext && session.status === "responding" && (
              <button
                onClick={skipSituation}
                disabled={updateSession.isPending}
                title="Passer cette question"
                className="h-11 px-3.5 rounded-[12px] flex items-center justify-center text-[#7A7A7A] bg-white border border-[#E8DFD2] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0 text-[13px] font-medium gap-1.5 hover:text-[#2C2C2C] hover:shadow-sm"
              >
                Passer
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            )}

            {/* Compact toggles */}
            <div className="flex items-center gap-1 flex-shrink-0 ml-1">
              <button
                onClick={() => setFocusMode(f => !f)}
                title={focusMode ? "Quitter le mode focus" : "Mode focus (F)"}
                className={`w-8 h-8 rounded-[10px] flex items-center justify-center transition-all cursor-pointer border ${
                  focusMode ? "bg-bw-violet/15 text-bw-violet border-bw-violet/30" : "text-[#7A7A7A] hover:text-[#2C2C2C] bg-white border-[#E8DFD2]"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="10" /></svg>
              </button>
              <button
                onClick={() => updateSession.mutate({ sharing_enabled: !session.sharing_enabled })}
                title={session.sharing_enabled ? "Partage activé" : "Partage désactivé"}
                className={`w-8 h-8 rounded-[10px] flex items-center justify-center transition-all cursor-pointer border ${
                  session.sharing_enabled ? "bg-bw-teal/15 text-bw-teal border-bw-teal/30" : "text-[#7A7A7A] hover:text-[#2C2C2C] bg-white border-[#E8DFD2]"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              </button>
              <button
                onClick={() => updateSession.mutate({ mute_sounds: !session.mute_sounds })}
                title={session.mute_sounds ? "Sons désactivés" : "Sons activés"}
                className={`w-8 h-8 rounded-[10px] flex items-center justify-center transition-all cursor-pointer border ${
                  session.mute_sounds ? "text-[#7A7A7A] hover:text-[#2C2C2C] bg-white border-[#E8DFD2]" : "bg-bw-amber/15 text-bw-amber border-bw-amber/30"
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{session.mute_sounds ? <><path d="M11 5L6 9H2v6h4l5 4z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></> : <><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></>}</svg>
              </button>
              <button
                onClick={() => setShowShortcuts(true)}
                title="Raccourcis clavier (?)"
                className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[#7A7A7A] hover:text-[#2C2C2C] bg-white border border-[#E8DFD2] transition-all cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/></svg>
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* ── FLOATING NEXT ACTION — fixed bottom-right, hides when footer visible ── */}
      <FloatingNextAction
        nextAction={nextAction}
        onExecute={handleNextAction}
        isPending={updateSession.isPending}
        allResponded={allResponded}
        footerRef={footerCtaRef}
      />

      {/* ── ONBOARDING HINTS (first visit tooltips) ── */}
      <OnboardingHints
        show={onboarding.showOnboarding}
        step={onboarding.currentStep}
        stepIndex={onboarding.stepIndex}
        totalSteps={onboarding.totalSteps}
        onNext={onboarding.nextStep}
        onDismiss={onboarding.dismiss}
      />

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
                    className="text-bw-muted hover:text-bw-heading text-sm cursor-pointer">Fermer</button>
                </div>
                <span className="text-xs text-bw-muted tabular-nums">{activeStudents.length}/{totalStudents} connectes</span>
                <div className="flex items-center gap-3 flex-wrap text-xs text-bw-muted">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-bw-green" /> Repondu</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-bw-amber" /> En attente</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-bw-muted" /> Deconnecte</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-bw-danger" /> Bloque</span>
                </div>
                <div className="space-y-1">
                  {(() => {
                    const allStudents = session.students || [];
                    const renderStudent = (s: Student) => {
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
                          {s.warnings > 0 && <span className="text-xs text-bw-amber">⚠️ {s.warnings}</span>}
                          {s.is_active && (
                            <button onClick={(e) => { e.stopPropagation(); setKickTarget({ id: s.id, name: s.display_name }); }}
                              className="opacity-0 group-hover:opacity-100 text-bw-muted hover:text-bw-danger cursor-pointer transition-all duration-200">✕</button>
                          )}
                        </div>
                      );
                    };
                    return allStudents.map(renderStudent);
                  })()}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MODALS ── */}
      <BroadcastModal
        open={showBroadcast}
        onClose={() => setShowBroadcast(false)}
        onSend={handleBroadcast}
        isPending={updateSession.isPending}
        history={broadcastHistory}
      />

      <CompareResponsesModal
        open={showCompare}
        onClose={() => setShowCompare(false)}
        responses={visibleResponses.map((r) => ({
          id: r.id,
          text: r.text,
          studentName: r.students.display_name,
          studentAvatar: r.students.avatar,
          is_highlighted: r.is_highlighted,
        }))}
        onHighlightBoth={handleHighlightBoth}
        onClearHighlights={handleClearAllHighlights}
      />

      <SessionExport
        open={showExport}
        onClose={() => setShowExport(false)}
        sessionTitle={session.title || "Session"}
        level={session.level || ""}
        moduleLabel={moduleLabel}
        questionPrompt={situation?.prompt || ""}
        responses={responses.map((r) => ({
          id: r.id,
          text: r.text,
          studentName: r.students.display_name,
          teacher_comment: r.teacher_comment,
          teacher_score: r.teacher_score,
          ai_score: r.ai_score,
          is_highlighted: r.is_highlighted,
          submitted_at: r.submitted_at,
        }))}
        studentCount={activeStudents.length}
      />

      {/* Keyboard shortcuts overlay */}
      <KeyboardShortcutsModal showShortcuts={showShortcuts} setShowShortcuts={setShowShortcuts} />

      {/* Kick student confirm modal */}
      <ConfirmModal
        open={kickTarget !== null}
        onClose={() => setKickTarget(null)}
        onConfirm={() => { if (kickTarget) { removeStudent.mutate(kickTarget.id); setKickTarget(null); } }}
        title="Retirer cet eleve ?"
        description={`${kickTarget?.name || "L'eleve"} sera retire de la session.`}
        confirmLabel="Retirer"
        confirmVariant="danger"
      />

    </div>
  );
}

// ——————————————————————————————————————————————————————
// MAIN PAGE — Unified layout with sidebar
// ——————————————————————————————————————————————————————

// Right panel is now floating docks — no fixed width needed

export default function PilotPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  useRealtimeInvalidation(sessionId);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileContextOpen, setMobileContextOpen] = useState(false);
  const [pendingModuleSwitch, setPendingModuleSwitch] = useState<{ moduleId: string; isQuickLaunch: boolean } | null>(null);
  const { play: playSound } = useSound();

  // Briefing / cockpit flow
  const [moduleView, setModuleView] = useState<"briefing" | "cockpit">("cockpit");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  // Right panel removed — floating docks handle their own state

  const sidebarWidth = 0; // Dock is floating, no layout offset needed

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
    refetchInterval: 10_000,
    enabled: !checkingAuth,
  });

  // Teams query
  const { data: teams } = useQuery<{ id: string; team_name: string; team_color: string; team_number: number; students: { id: string; display_name: string; avatar: string }[] }[]>({
    queryKey: ["pilot-teams", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/teams`);
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 15_000,
    enabled: !checkingAuth && !!session,
  });

  // Determine active module
  const activeModule = session ? getModuleByDb(session.current_module, session.current_seance || 1) : undefined;
  const hasActiveModule = !!activeModule && !activeModule.disabled;

  // Current situation — fetch whenever a module is active (10s for live classroom updates)
  const { data: situationData } = useQuery({
    queryKey: ["pilot-situation", sessionId, session?.current_module, session?.current_seance, session?.current_situation_index],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/situation`);
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 10_000,
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
    refetchInterval: 10_000,
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
    refetchInterval: 10_000,
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
    refetchInterval: 10_000,
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

  // Actually perform the module switch
  function doLaunchModule(moduleId: string, isQuickLaunch: boolean) {
    const mod = MODULES.find((m) => m.id === moduleId);
    if (!mod || mod.disabled) return;

    const isAlreadyCurrent = session &&
      session.current_module === mod.dbModule &&
      (session.current_seance || 1) === mod.dbSeance;

    if (!isAlreadyCurrent) {
      markCurrentModuleCompleted();
      updateSession.mutate({
        current_module: mod.dbModule,
        current_seance: mod.dbSeance,
        current_situation_index: 0,
        status: "responding",
      });
    }
    if (isQuickLaunch) {
      setSelectedModuleId(moduleId);
      setMobileSidebarOpen(false);
    }
    setModuleView("cockpit");
  }

  // Launch module — actually switches the session
  function handleLaunchModule() {
    if (!selectedModuleId) return;
    if (session?.status === "responding") {
      setPendingModuleSwitch({ moduleId: selectedModuleId, isQuickLaunch: false });
      return;
    }
    doLaunchModule(selectedModuleId, false);
  }

  // Resume module — back to cockpit without reset
  function handleResumeModule() {
    setModuleView("cockpit");
  }

  // Quick-browse module — opens briefing view (NOT launch)
  function handleQuickLaunchModule(moduleId: string) {
    const mod = MODULES.find((m) => m.id === moduleId);
    if (!mod || mod.disabled) return;
    setSelectedModuleId(moduleId);
    setModuleView("briefing");
    setMobileSidebarOpen(false);
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
    <div className="h-dvh flex flex-col" style={{ background: "#F7F3EA" }}>

      {/* ── QR Panel ── */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-[#E8DFD2] overflow-hidden flex-shrink-0"
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
        {/* Floating module dock — hidden during cockpit to free space */}
        {!(hasActiveModule && moduleView === "cockpit") && (
          <ModuleSidebar
            modules={MODULES}
            phases={PHASES}
            activeModuleId={activeModule?.id || null}
            selectedModuleId={moduleView === "briefing" ? selectedModuleId : null}
            completedModules={session.completed_modules || []}
            onSelectModule={handleSelectModule}
            responsesCount={responses?.length || 0}
            moduleStartedAt={moduleStartedAt}
            sessionStatus={session.status}
            currentQuestionIndex={hasActiveModule ? currentQuestionIndex : undefined}
            totalModuleQuestions={hasActiveModule ? totalQuestions : undefined}
          />
        )}

        {/* Mobile sidebar drawer */}
        <MobileSidebarDrawer open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)}>
          <ModuleSidebar
            modules={MODULES}
            phases={PHASES}
            activeModuleId={activeModule?.id || null}
            selectedModuleId={moduleView === "briefing" ? selectedModuleId : null}
            completedModules={session.completed_modules || []}
            onSelectModule={(id) => { handleSelectModule(id); setMobileSidebarOpen(false); }}
            onQuickLaunch={(id) => { handleQuickLaunchModule(id); setMobileSidebarOpen(false); }}
            responsesCount={responses?.length || 0}
            moduleStartedAt={moduleStartedAt}
            sessionStatus={session.status}
            currentQuestionIndex={hasActiveModule ? currentQuestionIndex : undefined}
            totalModuleQuestions={hasActiveModule ? totalQuestions : undefined}
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
            sessionId={sessionId}
            onLaunch={handleLaunchModule}
            onResume={handleResumeModule}
          />
        ) : hasActiveModule ? (
          <ErrorBoundary>
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
            totalQuestions={totalQuestions}
            onSelectStudent={(s) => { setSelectedStudentId(s.id); setShowStudents(false); }}
            teams={teams || []}
            onOpenModules={() => setMobileSidebarOpen(true)}
            onOpenScreen={() => window.open(`/session/${sessionId}/screen`, "_blank")}
          />
          </ErrorBoundary>
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
            {/* Team Manager — visible in waiting state */}
            <div className="max-w-lg mx-auto px-4 pb-6">
              <TeamManager
                sessionId={sessionId}
                teams={teams || []}
                students={activeStudents}
              />
            </div>
          </div>
        )}

        {/* ContextDocks removed — info redistributed to split panel + header */}
      </div>

      {/* Module switch confirmation */}
      <ConfirmModal
        open={pendingModuleSwitch !== null}
        onClose={() => setPendingModuleSwitch(null)}
        onConfirm={() => {
          if (pendingModuleSwitch) {
            doLaunchModule(pendingModuleSwitch.moduleId, pendingModuleSwitch.isQuickLaunch);
            setPendingModuleSwitch(null);
          }
        }}
        title="Changer de module ?"
        description="Les eleves sont en train de repondre. Changer de module interrompra la question en cours."
        confirmLabel="Changer"
        confirmVariant="danger"
      />

      {/* Mobile context drawer */}
      <AnimatePresence>
        {mobileContextOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileContextOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[320px] max-w-[85vw] bg-bw-bg border-l border-black/[0.06] overflow-y-auto lg:hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06]">
                <span className="text-sm font-semibold">Contexte</span>
                <button onClick={() => setMobileContextOpen(false)} className="text-bw-muted hover:text-bw-heading cursor-pointer text-sm">✕</button>
              </div>
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
                selectedStudent={null}
                studentResponses={[]}
                onSelectStudent={() => {}}
                onClose={() => setMobileContextOpen(false)}
                students={session.students?.map((s) => ({ ...s, warnings: s.warnings || 0 })) || []}
                studentStates={pageStudentStates}
                onNudge={(studentId, text) => {
                  const studentResponse = responses?.find((r) => r.student_id === studentId);
                  if (studentResponse) {
                    nudgeStudent.mutate({ responseId: studentResponse.id, nudgeText: text });
                  }
                }}
                onWarn={(studentId) => warnStudent.mutate(studentId)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* HelpButton removed — was blocking footer toggles on pilot view */}
    </div>
  );
}
