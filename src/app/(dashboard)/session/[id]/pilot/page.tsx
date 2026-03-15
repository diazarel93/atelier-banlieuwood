"use client";

// REFACTOR PLAN: This file is 2629 lines. Consider extracting:
//
// 1. CockpitContent (lines 98-2120) — the in-game facilitator view
//    This is the largest inline component (~2020 lines). Split into:
//
//    a. CockpitQuestionCard → src/components/pilot/cockpit-question-card.tsx (~120 lines)
//       The hero question card section (lines 1134-1229): badge, nav pills, question text, guide.
//
//    b. CockpitCenterPanel → src/components/pilot/cockpit-center-panel.tsx (~550 lines)
//       Center column with toolbar, tabs, response stream, vote results (lines 1256-1860).
//       Includes: tab toggle, search bar, response filter/sort, empty state, "pas encore repondu" chips.
//
//    c. CockpitModuleContent → src/components/pilot/cockpit-module-content.tsx (~400 lines)
//       Module-specific content switch block (lines 1439-1565): M1, M9, M10, M12, M13, M6, M7, M8, M2EC.
//       Already uses dynamic imports — just needs the JSX wrapper extracted.
//
//    d. CockpitRightPanel → src/components/pilot/cockpit-right-panel.tsx (~100 lines)
//       Right sidebar: AI assistant panel, session timeline (lines 1866-1960).
//
//    e. CockpitFooterSection → src/components/pilot/cockpit-footer-section.tsx (~130 lines)
//       Footer bar, floating next action, onboarding hints, students drawer, modals (lines 1961-2120).
//
//    f. CockpitLogic (hook) → src/hooks/use-cockpit-content.ts (~450 lines)
//       All useState, useMemo, useCallback, useEffect logic inside CockpitContent (lines 173-650).
//       Returns computed values: filteredResponses, moduleFlags, handlers, etc.
//
// 2. PilotPage (lines 2128-2629) — the outer shell with auth, sidebar, layout
//    This is ~500 lines and could be left as-is, or split:
//
//    a. PilotMobileDrawers → src/components/pilot/pilot-mobile-drawers.tsx (~80 lines)
//       Mobile sidebar drawer + mobile context drawer (lines 2447-2629).
//
// Estimated total reduction: ~1800 lines extracted, leaving ~800 lines in this file.
// Priority: Extract CockpitLogic hook first (biggest win, cleanest separation).

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeInvalidation } from "@/hooks/use-realtime-invalidation";
import { usePilotKeyboardShortcuts } from "@/hooks/use-pilot-keyboard-shortcuts";
import { useCockpitModuleFlags } from "@/hooks/use-cockpit-module-flags";
import { usePilotSession } from "@/hooks/use-pilot-session";
import { useConfirmAction } from "@/hooks/use-confirm-action";
import { useUndoStack } from "@/hooks/use-undo-stack";
import { useStuckDetection, countStuckLevels } from "@/hooks/use-stuck-detection";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { logAudit } from "@/lib/audit-log";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CATEGORY_COLORS, getSeanceMax } from "@/lib/constants";
import dynamic from "next/dynamic";
import { getModuleGuide, getQuestionGuide, type QuestionGuide } from "@/lib/guide-data";

const QRCodeSVG = dynamic(
  () => import("qrcode.react").then(mod => ({ default: mod.QRCodeSVG })),
  { ssr: false, loading: () => <div className="w-full h-full bg-white/5 rounded animate-pulse" /> }
);
import { MODULES, PHASES, getModuleByDb, getPhaseForModule } from "@/lib/modules-data";

// Cockpit components
import { InlineActions, TeacherCommentBadge } from "@/components/pilot/response-actions";
import { type ResponseCardResponse } from "@/components/pilot/response-card";
import { InlineReformulation } from "@/components/pilot/inline-reformulation";
import { QuickPhrases } from "@/components/pilot/quick-phrases";
import { ChoicesHistory, type CollectiveChoice } from "@/components/pilot/choices-history";
import type { StudentState } from "@/components/pilot/pulse-ring";

import { useSound } from "@/hooks/use-sound";

// Extracted cockpit sections — lazy loaded per module
const Module9BudgetOverview = dynamic(() => import("@/components/pilot/module9-budget-overview").then(m => ({ default: m.Module9BudgetOverview })), { ssr: false });
const Module12Cockpit = dynamic(() => import("@/components/pilot/module12-cockpit").then(m => ({ default: m.Module12Cockpit })), { ssr: false });
const Module13Cockpit = dynamic(() => import("@/components/pilot/module13-cockpit").then(m => ({ default: m.Module13Cockpit })), { ssr: false });
const Module6Cockpit = dynamic(() => import("@/components/pilot/module6-cockpit").then(m => ({ default: m.Module6Cockpit })), { ssr: false });
const Module7Cockpit = dynamic(() => import("@/components/pilot/module7-cockpit").then(m => ({ default: m.Module7Cockpit })), { ssr: false });
const Module8Cockpit = dynamic(() => import("@/components/pilot/module8-cockpit").then(m => ({ default: m.Module8Cockpit })), { ssr: false });
const Module1Cockpit = dynamic(() => import("@/components/pilot/module1-cockpit").then(m => ({ default: m.Module1Cockpit })), { ssr: false });
const Module9BudgetCards = dynamic(() => import("@/components/pilot/module9-budget-cards").then(m => ({ default: m.Module9BudgetCards })), { ssr: false });
const Module10Cockpit = dynamic(() => import("@/components/pilot/module10-cockpit").then(m => ({ default: m.Module10Cockpit })), { ssr: false });
const Module2ECCockpit = dynamic(() => import("@/components/pilot/module2ec-cockpit").then(m => ({ default: m.Module2ECCockpit })), { ssr: false });
import { VotingResults } from "@/components/pilot/voting-results";
import { ResponseStreamSection } from "@/components/pilot/response-stream-section";
import { ElapsedTimer } from "@/components/pilot/elapsed-timer";

// New cockpit features
import { ClassDashboardPanel } from "@/components/pilot/class-dashboard-panel";
import { ErrorBoundary } from "@/components/error-boundary";
import { HelpButton } from "@/components/help-button";
import { ConfirmModal } from "@/components/confirm-modal";

// Extracted composite sections
import { BulkResponseToolbar } from "@/components/pilot/bulk-response-toolbar";
import { CockpitFooterBar } from "@/components/pilot/cockpit-footer-bar";
import { CockpitModals } from "@/components/pilot/cockpit-modals";

// Layout components
import { ModuleSidebar, SidebarDrawer } from "@/components/pilot/module-sidebar";
import { WelcomePanel } from "@/components/pilot/welcome-panel";
import { ModuleBriefing } from "@/components/pilot/module-briefing";
import { ContextPanel } from "@/components/pilot/teacher-docks";
import { getNextAction, type NextAction } from "@/lib/cockpit-next-action";
const TeamManager = dynamic(() => import("@/components/pilot/team-manager").then(m => ({ default: m.TeamManager })), { ssr: false });
const ClassroomMap = dynamic(() => import("@/components/pilot/classroom-map").then(m => ({ default: m.ClassroomMap })), { ssr: false });
const SpotlightModal = dynamic(() => import("@/components/pilot/spotlight-modal").then(m => ({ default: m.SpotlightModal })), { ssr: false });
const DebatePanel = dynamic(() => import("@/components/pilot/debate-panel").then(m => ({ default: m.DebatePanel })), { ssr: false });
const WordCloud = dynamic(() => import("@/components/pilot/word-cloud").then(m => ({ default: m.WordCloud })), { ssr: false });
import { TIMER_PRESETS, STUCK_THRESHOLD_MS, STUCK_DETECTION_DELAY_MS } from "@/components/pilot/pilot-settings";
const StudentFiche = dynamic(() => import("@/components/pilot/student-fiche").then(m => ({ default: m.StudentFiche })), { ssr: false });
const AIAssistantPanel = dynamic(() => import("@/components/pilot/ai-assistant-panel").then(m => ({ default: m.AIAssistantPanel })), { ssr: false });
const ComprehensionHeatmap = dynamic(() => import("@/components/pilot/comprehension-heatmap").then(m => ({ default: m.ComprehensionHeatmap })), { ssr: false });
import { SessionStateBanner } from "@/components/pilot/session-state-banner";
import { CenterStateBanner } from "@/components/pilot/center-state-banner";
import { ROUTES } from "@/lib/routes";
import { computeAttentionQueue } from "@/components/pilot/attention-priority";
import { CockpitHeader } from "@/components/pilot/cockpit-header";
import { SessionTimeline, createTimelineEvent, type TimelineEvent } from "@/components/pilot/session-timeline";
import { SessionProgressBar } from "@/components/pilot/session-progress-bar";
import { FloatingNextAction } from "@/components/pilot/floating-next-action";
import { OnboardingHints } from "@/components/pilot/onboarding-hints";
import { usePilotOnboarding } from "@/hooks/use-pilot-onboarding";
import { CockpitProvider, useCockpit } from "@/components/pilot/cockpit-context";
import { useCockpitModals } from "@/hooks/use-cockpit-modals";
import { useCockpitDarkMode } from "@/hooks/use-cockpit-dark-mode";

import type { Session, Student, Response, VoteResult } from "@/hooks/use-pilot-session";



// ——————————————————————————————————————————————————————
// COCKPIT — The in-game facilitator view
// ——————————————————————————————————————————————————————

function CockpitContent({
  commentingResponse,
  setCommentingResponse,
  commentText,
  setCommentText,
  router,
  showStudents,
  setShowStudents,
  sidebarWidth,
  totalQuestions,
}: {
  commentingResponse: string | null;
  setCommentingResponse: (id: string | null) => void;
  commentText: string;
  setCommentText: (text: string) => void;
  router: ReturnType<typeof useRouter>;
  showStudents: boolean;
  setShowStudents: (v: boolean) => void;
  sidebarWidth: number;
  totalQuestions?: number;
}) {
  // ── Context: all mutations + session data ──
  const {
    session, sessionId, responses, activeStudents, voteData, collectiveChoices,
    situationData, oieScores, teams,
    updateSession, toggleHide, toggleVoteOption, validateChoice, removeStudent,
    commentResponse, highlightResponse, nudgeStudent, warnStudent,
    toggleStudentActive, lowerHand, scoreResponse, aiEvaluate,
    resetResponse, resetAllResponses,
    onModuleComplete, onSelectStudent, onOpenModules, onOpenScreen,
    studentWarnings,
  } = useCockpit();
  const [ficheStudentId, setFicheStudentId] = useState<string | null>(null);
  const [centerTab, setCenterTab] = useState<"responses" | "classmap">("responses");
  const [classroomLayout, setClassroomLayout] = useState<"rows" | "u-shape" | "islands" | "free">("rows");
  const [guideExpanded, setGuideExpanded] = useState(false);
  const footerCtaRef = useRef<HTMLDivElement | null>(null);
  const [mapCollapsed, setMapCollapsed] = useState(true);
  const onboarding = usePilotOnboarding();
  const [reformulating, setReformulating] = useState<Response | null>(null);
  const [reformulatedText, setReformulatedText] = useState("");
  // respondingStartedAt removed — use respondingOpenedAt instead (set on status transition)
  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>([]);
  const [selectedPitchIds, setSelectedPitchIds] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [allSituations, setAllSituations] = useState<{ position: number; category: string; restitutionLabel: string; prompt: string; nudgeText: string | null }[]>([]);
  const [responseFilter, setResponseFilter] = useState<"all" | "visible" | "highlighted">("all");
  const [responseSortMode, setResponseSortMode] = useState<"time" | "highlighted">("time");
  const [selectedResponseIds, setSelectedResponseIds] = useState<Set<string>>(new Set());

  // ── Modals (extracted hook) ──
  const modals = useCockpitModals();
  const {
    showBroadcast, setShowBroadcast, broadcastPrefill, broadcastTitle, broadcastIcon,
    openBroadcast, openBroadcastWith,
    showExport, setShowExport, spotlightResponse, setSpotlightResponse,
    showDebate, setShowDebate, showWordCloud, setShowWordCloud,
    showCompare, setShowCompare, showRevealAnswer, setShowRevealAnswer,
    showShortcuts, setShowShortcuts, kickTarget, setKickTarget, closeAllModals,
  } = modals;
  const [focusMode, setFocusMode] = useState(false);
  const allRespondedNotified = useRef(false);
  const prevResponseCountRef = useRef(0);
  const [allResponded, setAllResponded] = useState(false);

  // ── Session timeline events ──
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const timelineTracked = useRef<Set<string>>(new Set());
  const addTimelineEvent = useCallback((type: Parameters<typeof createTimelineEvent>[0], label: string, detail?: string, severity?: "info" | "positive" | "warning" | "highlight") => {
    const key = `${type}-${label}`;
    if (timelineTracked.current.has(key)) return;
    timelineTracked.current.add(key);
    setTimelineEvents(prev => [...prev, createTimelineEvent(type, label, detail, severity)]);
  }, []);
  const { isDarkMode, setIsDarkMode } = useCockpitDarkMode();
  const [autoAdvance, setAutoAdvance] = useState(false);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(0);
  const [respondingOpenedAt, setRespondingOpenedAt] = useState<number | null>(null);
  const [sessionStartedAt] = useState<number>(() => Date.now()); // session timer starts when pilot opens
  const [cardSearch, setCardSearch] = useState("");
  const [broadcastHistory, setBroadcastHistory] = useState<{ text: string; sentAt: Date }[]>([]);
  const [timerMode, setTimerMode] = useState(false);
  const [interventionMode, setInterventionMode] = useState(false);
  // Screen mode (#15) and freeze (#22) state
  const [screenMode, setScreenMode] = useState<string>("default");
  const [screenFrozen, setScreenFrozen] = useState(false);
  const [mobileSidePanel, setMobileSidePanel] = useState<"left" | "right" | null>(null);
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
  const { data: situationsPreviewData } = useQuery<{ situations: typeof allSituations }>({
    queryKey: ["situations-preview", session?.id, session?.current_module, session?.current_seance],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${session.id}/situations-preview`);
      if (!res.ok) return { situations: [] };
      return res.json();
    },
    enabled: !!session?.id,
    staleTime: 60_000, // situations rarely change mid-session
  });
  useEffect(() => {
    if (situationsPreviewData?.situations) setAllSituations(situationsPreviewData.situations);
  }, [situationsPreviewData]);

  const situation = (situationData as { situation?: { id: string; position: number; category: string; restitutionLabel: string; prompt: string } })?.situation;
  const budgetStats = (situationData as { budgetStats?: { submittedCount: number; averages: Record<string, number> } })?.budgetStats;
  const budgetSubmitted = budgetStats?.submittedCount || 0;
  const budgetAverages = budgetStats?.averages || {};
  const totalStudents = session.students?.length || 0;
  const visibleResponses = responses.filter((r) => !r.is_hidden);
  const hiddenCount = responses.length - visibleResponses.length;
  const voteOptionCount = responses.filter((r) => r.is_vote_option && !r.is_hidden).length;

  // studentWarnings comes from CockpitContext

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
    isM13Any, isM13Postprod,
    isM6Any, isM7Any, isM8Any,
    isQAModule,
    maxSituations, canGoNext, canGoPrev, seance,
  } = useCockpitModuleFlags(session);

  const nextAction = getNextAction(session.status, visibleResponses.length, voteOptionCount, !!(voteData && voteData.totalVotes > 0), session.current_module, budgetSubmitted, canGoNext, session.current_seance || 1, session.current_situation_index || 0, session.reveal_phase);

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
    personnage?: { prenom: string; trait: string; avatar: Record<string, string> } | null;
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

  // Module 13 data (La Post-prod)
  const module13Data = (situationData as { module13?: import("@/hooks/use-session-polling").Module13Data })?.module13;

  // Module 6 data (Le Scénario)
  const module6Data = (situationData as { module6?: import("@/hooks/use-session-polling").Module6Data })?.module6;
  // Module 7 data (La Mise en scène)
  const module7Data = (situationData as { module7?: import("@/hooks/use-session-polling").Module7Data })?.module7;
  // Module 8 data (L'Équipe)
  const module8Data = (situationData as { module8?: import("@/hooks/use-session-polling").Module8Data })?.module8;

  // Module label & guide data
  const currentMod = MODULES.find(
    (m) => m.dbModule === session.current_module && m.dbSeance === (session.current_seance || 1)
  );
  const moduleLabel = currentMod?.title || "Module";
  const moduleColor = currentMod?.color || "#FF6B35";
  const currentModuleLessons = MODULES.filter((m) => m.dbModule === session.current_module);
  const moduleGuide = currentMod ? getModuleGuide(currentMod.id) : undefined;
  const questionGuide = (session.current_module === 1 || session.current_module === 3 || session.current_module === 4 || session.current_module === 9 || (session.current_module === 2 && !isM2ECSpecial && !isM2ECComparison) || isM10Any || isM12Any || isM13Any)
    ? getQuestionGuide(session.current_seance || 1, (session.current_situation_index || 0) + 1, session.current_module)
    : undefined;

  // Helper: M10 activity label
  const getM10ActivityLabel = (type?: string) => {
    switch (type) {
      case "etsi": return "Et si... — Image + ecriture + QCMs";
      case "idea-bank": return "Banque d'idees";
      case "avatar": return "Creation personnage";
      case "objectif": return "Objectif + Obstacle";
      case "pitch": return "Assemblage pitch";
      case "chrono": return "Test chrono 30s";
      case "confrontation": return "Confrontation";
      default: return null;
    }
  };

  const getM6Label = (type: string) => {
    switch (type) {
      case "frise": return "Frise narrative";
      case "scenes-v0": return "Scenes du scenario";
      case "mission": return "Missions assignees";
      case "ecriture": return "Ecriture";
      case "assemblage": return "Assemblage";
      default: return "Scenario";
    }
  };

  const getM7Label = (type: string) => {
    switch (type) {
      case "plans": return "Plans fondamentaux";
      case "comparaison": return "Comparaison visuelle";
      case "decoupage": return "Decoupage technique";
      case "storyboard": return "Storyboard";
      default: return "Mise en scene";
    }
  };

  const getM8Label = (type: string) => {
    switch (type) {
      case "quiz": return "Quiz des metiers";
      case "debrief": return "Debrief — Resultats";
      case "role-choice": return "Choix des roles";
      case "team-recap": return "Equipe de tournage";
      case "talent-card": return "Cartes Talent";
      default: return "Equipe";
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

  // Progressive stuck detection (#9)
  const respondedStudentIds = useMemo(() => {
    const ids = new Set(responses.map((r) => r.student_id));
    for (const id of moduleSubmittedIds) ids.add(id);
    return ids;
  }, [responses, moduleSubmittedIds]);

  const activeStudentIds = useMemo(
    () => new Set((session.students || []).filter((s) => s.is_active).map((s) => s.id)),
    [session.students]
  );

  const stuckLevels = useStuckDetection({
    respondedStudentIds,
    activeStudentIds,
    respondingOpenedAt: session.status === "responding" ? respondingOpenedAt : null,
  });

  // Compute student states for pulse ring / grid
  const studentStates = useMemo((): { id: string; state: StudentState; display_name: string; avatar: string }[] => {
    if (!session.students) return [];
    return session.students.map((s) => {
      const hasResponded = respondedStudentIds.has(s.id);
      if (!s.is_active) return { id: s.id, state: "disconnected" as StudentState, display_name: s.display_name, avatar: s.avatar };
      if (hasResponded) return { id: s.id, state: "responded" as StudentState, display_name: s.display_name, avatar: s.avatar };
      // Progressive stuck levels: slow/stuck → show as "stuck" state
      const level = stuckLevels.get(s.id);
      if (level === "slow" || level === "stuck") {
        return { id: s.id, state: "stuck" as StudentState, display_name: s.display_name, avatar: s.avatar };
      }
      return { id: s.id, state: "active" as StudentState, display_name: s.display_name, avatar: s.avatar };
    });
  }, [session.students, respondedStudentIds, stuckLevels]);

  // Actually change the session (launches the question for students)
  function goToSituation(index: number) {
    setPreviewIndex(null);
    setCardSearch("");
    updateSession.mutate({ current_situation_index: index, status: "responding", timer_ends_at: null, reveal_phase: null });
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
    if (nextAction.action === "reveal-next") {
      const currentPhase = session.reveal_phase ?? 0;
      updateSession.mutate({ reveal_phase: currentPhase + 1 });
      return;
    }
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
      addTimelineEvent("question_launched", "Question lancee", `Q${(session.current_situation_index || 0) + 1}`, "info");
    } else {
      setRespondingOpenedAt(null);
      allRespondedNotified.current = false;
      setAllResponded(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status]);

  // ── Notification: all students responded ──
  useEffect(() => {
    if (session.status !== "responding" || activeStudents.length === 0) return;
    if (responses.length >= activeStudents.length && !allRespondedNotified.current) {
      allRespondedNotified.current = true;
      setAllResponded(true);
      play("success");
      toast.success("Tout le monde a répondu !", { icon: "🎉" });
      addTimelineEvent("all_responded", "Tout le monde a repondu", `${activeStudents.length} eleves`, "positive");
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
    // Timeline events: first response, half responded
    if (curr === 1 && prev === 0) {
      const name = session.students?.find(s => s.id === responses[0]?.student_id)?.display_name;
      addTimelineEvent("first_response", "Premiere reponse", name || undefined, "positive");
    }
    if (activeStudents.length > 2 && curr >= Math.ceil(activeStudents.length / 2) && prev < Math.ceil(activeStudents.length / 2)) {
      addTimelineEvent("half_responded", "50% ont repondu", `${curr}/${activeStudents.length}`, "info");
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
    if (elapsed < STUCK_DETECTION_DELAY_MS) return [];
    // Reuse respondedStudentIds (already includes module submissions)
    return activeStudents
      .filter((s) => !respondedStudentIds.has(s.id))
      .map((s) => ({ id: s.id, name: s.display_name, avatar: s.avatar }));
  }, [session.status, respondingOpenedAt, respondedStudentIds, activeStudents]);

  // ── Attention priority active? (for CenterStateBanner deduplication) ──
  const hasPrimaryAttention = useMemo(() => {
    const handsStudents = (session.students || []).filter(s => s.hand_raised_at && s.is_active && !s.kicked);
    const queue = computeAttentionQueue({
      stuckCount: stuckStudents.length,
      stuckNames: stuckStudents.slice(0, 3).map(s => s.name),
      handsRaised: handsStudents.length,
      handsNames: handsStudents.map(s => s.display_name?.split(" ")[0] || s.display_name),
      handsRaisedAt: handsStudents.map(s => s.hand_raised_at ?? null),
      responsesCount: respondedCount,
      totalStudents: activeStudents.length,
      onlineStudents: activeStudents.filter(s => s.is_active).length,
      elapsedSeconds: respondingOpenedAt ? Math.floor((Date.now() - respondingOpenedAt) / 1000) : 0,
      status: session.status,
    });
    return queue.length > 0;
  }, [session.students, session.status, stuckStudents, respondedCount, activeStudents, respondingOpenedAt]);

  // ── Timeline: stuck detected ──
  const prevStuckCountRef = useRef(0);
  useEffect(() => {
    const n = stuckStudents.length;
    if (n >= 3 && prevStuckCountRef.current < 3) {
      addTimelineEvent("stuck_detected", `${n} eleves bloques`, stuckStudents.slice(0, 3).map(s => s.name?.split(" ")[0]).join(", "), "warning");
    }
    prevStuckCountRef.current = n;
  }, [stuckStudents, addTimelineEvent]);

  // ── Timeline: vote launched ──
  const prevStatusRef = useRef(session.status);
  useEffect(() => {
    if (session.status === "voting" && prevStatusRef.current !== "voting") {
      addTimelineEvent("vote_launched", "Vote lance", undefined, "highlight");
    }
    prevStatusRef.current = session.status;
  }, [session.status, addTimelineEvent]);

  // ── Keyboard shortcuts (extracted hook) ──
  const handlePauseToggle = useCallback(() => {
    if (session.status === "paused") updateSession.mutate({ status: "waiting" });
    else if (session.status !== "done") updateSession.mutate({ status: "paused" });
  }, [session.status, updateSession]);

  const handleCloseAllModals = useCallback(() => {
    closeAllModals();
    setTimerMode(false);
  }, [closeAllModals]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleNextActionCb = useCallback(() => handleNextAction(), [nextAction, canGoNext, updateSession]);

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
   
  }, [updateSession]);

  usePilotKeyboardShortcuts({
    sessionStatus: session.status,
    responsesCount: responses.length,
    onPauseToggle: handlePauseToggle,
    onShowBroadcast: openBroadcast,
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
    addTimelineEvent("broadcast_sent", "Message envoye", message.slice(0, 50), "info");
  }

  // ── Screen mode handler (#15) ──
  function handleSetScreenMode(mode: string) {
    setScreenMode(mode);
    if (mode === "default") {
      // Clear any screen mode broadcast — don't set broadcast_message at all so it doesn't flash
      updateSession.mutate({ broadcast_message: null });
    } else {
      updateSession.mutate({ broadcast_message: `__SCREEN_MODE:${mode}`, broadcast_at: new Date().toISOString() });
    }
    if (screenFrozen) setScreenFrozen(false);
    toast.success(`Écran : ${mode === "default" ? "Question" : mode === "responses" ? "Réponses" : mode === "wordcloud" ? "Nuage de mots" : "Écran noir"}`);
  }

  // ── Freeze screen handler (#22) ──
  function handleToggleFreeze() {
    const newFrozen = !screenFrozen;
    setScreenFrozen(newFrozen);
    if (newFrozen) {
      updateSession.mutate({ broadcast_message: "__SCREEN_FROZEN", broadcast_at: new Date().toISOString() });
      toast.success("Écran gelé — les élèves voient un écran figé");
    } else {
      updateSession.mutate({ broadcast_message: null });
      toast.success("Écran dégelé");
    }
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
  // Séance 1: pos 0 (etsi + QCMs intégrés), pos 1 (idea-bank) — all special
  // Séance 2: all positions are special
  const showM10Special = isM10Any;
  const showM13Standard = isM13Any && (session.current_situation_index || 0) >= 5;
  const showStandardQA = (isStandardQA || (isM2ECAny && !showM2ECSpecial && !showM2ECComparison) || (isM10Any && !showM10Special) || showM13Standard) && !isM12Any && !(isM13Any && !showM13Standard) && !isM6Any && !isM7Any && !isM8Any;

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
      if (isM13Any && module13Data) return `${module13Data.stepEmoji} ${module13Data.stepLabel}`;
      if (isM6Any && module6Data) return getM6Label(module6Data.type);
      if (isM7Any && module7Data) return getM7Label(module7Data.type);
      if (isM8Any && module8Data) return getM8Label(module8Data.type);
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
    if (isM13Any && module13Data) return `${module13Data.stepEmoji} ${module13Data.stepLabel}`;
    if (isM6Any && module6Data) return getM6Label(module6Data.type);
    if (isM7Any && module7Data) return getM7Label(module7Data.type);
    if (isM8Any && module8Data) return getM8Label(module8Data.type);
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
    if (isM13Any) return "Post-prod";
    if (isM6Any) return "Scenario";
    if (isM7Any) return "Mise en scene";
    if (isM8Any) return "Equipe";
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
    if (isM13Any) return "Post-prod";
    if (isM6Any) return "Scenario";
    if (isM7Any) return "Mise en scene";
    if (isM8Any) return "Equipe";
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
    // M6: count done missions
    if (isM6Any && module6Data?.missions) return module6Data.missions.filter((m: { status: string; content?: string }) => m.status === "done" || m.content).length;
    // M7: count submitted decoupages or comparisons
    if (isM7Any && module7Data?.type === "comparaison" && module7Data?.comparisonResults) {
      const counts = Object.values(module7Data.comparisonResults);
      if (counts.length > 0) {
        const first = counts[0] as Record<string, number>;
        return Object.values(first).reduce((sum, v) => sum + v, 0);
      }
    }
    if (isM7Any && module7Data?.allDecoupages) return module7Data.allDecoupages.length;
    // M8: count based on type
    if (isM8Any && module8Data?.type === "quiz" && module8Data?.hasAnswered !== undefined) return module8Data.hasAnswered ? 1 : 0;
    if (isM8Any && module8Data?.type === "role-choice") return module8Data?.takenRoles?.length || 0;
    return responses.length;
  })();

  // Students who haven't responded yet (for all modules)
  const notRespondedStudents = useMemo(() => {
    if (session.status !== "responding") return [];
    const respondedIds = new Set(responses.map(r => r.student_id));
    moduleSubmittedIds.forEach(id => respondedIds.add(id));
    return activeStudents.filter(s => !respondedIds.has(s.id));
  }, [session.status, responses, activeStudents, moduleSubmittedIds]);

  // ── Batch nudge students who haven't responded ──
  function handleNudgeAllStuck() {
    const count = notRespondedStudents.length || stuckStudents.length;
    updateSession.mutate({ broadcast_message: "N'oubliez pas de répondre à la question !", broadcast_at: new Date().toISOString() });
    play("send");
    toast.success(`Relance envoyée à la classe (${count} en attente)`);
    addTimelineEvent("nudge_sent", "Relance envoyee", `${count} eleves`, "info");
  }

  return (
    <div className={`flex-1 flex flex-col overflow-hidden film-grain ${isDarkMode ? 'cockpit-dark' : ''}`}>
      {/* ── COCKPIT HEADER — Phase stepper + status bar + controls ── */}
      <CockpitHeader
        sessionTitle={session.title || "Session"}
        phases={PHASES}
        modules={MODULES}
        activeModuleId={currentMod?.id || null}
        completedModules={session.completed_modules || []}
        moduleLabel={moduleLabel}
        moduleColor={moduleColor}
        questionCounter={(totalQuestions ?? 0) > 0 ? `Q${currentQIndex + 1}/${totalQuestions}` : null}
        respondingOpenedAt={respondingOpenedAt}
        sessionStartedAt={sessionStartedAt}
        activeStudentCount={activeStudents.length}
        autoAdvance={autoAdvance}
        onToggleAuto={() => {
          setAutoAdvance((v) => !v);
          if (autoAdvanceTimerRef.current) {
            clearTimeout(autoAdvanceTimerRef.current);
            autoAdvanceTimerRef.current = null;
            setAutoAdvanceCountdown(0);
          }
        }}
        autoAdvanceCountdown={autoAdvanceCountdown}
        onPause={handlePauseToggle}
        onBroadcast={openBroadcast}
        onScreen={onOpenScreen || (() => {})}
        onOpenModules={onOpenModules || (() => {})}
        onPhaseClick={(phaseId) => {
          // Open sidebar on first module of that phase
          const phase = PHASES.find((p) => p.id === phaseId);
          if (phase && phase.moduleIds[0]) {
            onOpenModules?.();
          }
        }}
        sessionStatus={session.status}
        respondedCount={unifiedRespondedCount}
        totalStudents={activeStudents.length}
        voteCount={voteData?.totalVotes || 0}
        onTogglePauseFromBanner={handlePauseToggle}
        onViewResults={() => router.push(ROUTES.sessionResults(sessionId))}
        stuckCount={stuckStudents.length}
        isDarkMode={isDarkMode}
        onToggleDark={() => setIsDarkMode(v => !v)}
        sessionId={sessionId}
        screenMode={screenMode}
        onSetScreenMode={handleSetScreenMode}
        screenFrozen={screenFrozen}
        onToggleFreeze={handleToggleFreeze}
      />

      {/* ── ZERO-SCROLL LAYOUT — split panel, content scrolls internally ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* ── QUESTION CARD — compact, leaves room for cockpit panels ── */}
        {universalQuestionText && (
          <div className="flex-shrink-0 px-3 sm:px-5 py-2 sm:py-2.5">
            <div className="rounded-[14px] sm:rounded-[16px]" style={{
              padding: "12px 16px 10px",
              background: "#FFFFFF",
              boxShadow: "0 4px 16px rgba(61,43,16,0.06), 0 2px 4px rgba(61,43,16,0.02)",
              border: "1px solid #E8DFD2",
            }}>
              {/* Top row: badge + question text + nav + guide — all on one line */}
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: `${CATEGORY_COLORS[universalCategoryLabel] || moduleColor}15`, color: CATEGORY_COLORS[universalCategoryLabel] || moduleColor }}>
                      {universalCategoryLabel}
                    </span>
                    {isPreviewing && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#F5A45B]/15 text-[#D4842A] font-bold uppercase flex-shrink-0">Apercu</span>}
                  </div>
                  {/* Question text — readable but compact */}
                  <p className={`text-[18px] sm:text-[20px] md:text-[22px] font-bold leading-[1.3] ${isPreviewing ? "text-[#D4842A]" : "text-[#2C2C2C]"}`}>
                    {universalQuestionText}
                  </p>
                </div>
                {/* Right side controls */}
                <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                  {maxSituations > 1 && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={previewPrev} disabled={displayIndex <= 0} aria-label="Question precedente"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#7A7A7A] hover:text-[#2C2C2C] bg-white border border-[#E8DFD2] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                      </button>
                      <span className="text-[12px] text-[#7A7A7A] tabular-nums font-medium px-0.5">Q{displayIndex + 1}/{maxSituations}</span>
                      <button onClick={previewNext} disabled={displayIndex >= maxSituations - 1} aria-label="Question suivante"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#7A7A7A] hover:text-[#2C2C2C] bg-white border border-[#E8DFD2] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                      </button>
                    </div>
                  )}
                  {questionGuide && (
                    <button
                      onClick={() => setGuideExpanded(!guideExpanded)}
                      className={`h-7 px-2.5 rounded-lg text-[12px] font-medium cursor-pointer transition-all flex-shrink-0 border ${
                        guideExpanded ? "bg-[#E8F5F2] text-[#1B5E50] border-[#C8E6DD]" : "text-[#7A7A7A] hover:text-[#1B5E50] bg-white border-[#E8DFD2]"
                      }`}
                    >
                      {guideExpanded ? "▴ Guide" : "▾ Guide"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            {/* Collapsible guide section — compact */}
            <AnimatePresence>
              {guideExpanded && (isPreviewing ? previewGuide : questionGuide) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 space-y-2" style={{ borderTop: "1px solid #EFE4D8" }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="rounded-xl px-3 py-2.5 space-y-0.5" style={{ background: "#F0FAF8", border: "1px solid #D5EDE8" }}>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-[#1B5E50]">Ce qu&apos;on attend</p>
                        <p className="text-[12px] text-[#4A4A4A] leading-snug">{(isPreviewing ? previewGuide : questionGuide)?.whatToExpect}</p>
                      </div>
                      <div className="rounded-xl px-3 py-2.5 space-y-0.5" style={{ background: "#FFF8F0", border: "1px solid #F0DFC8" }}>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-[#8B6914]">Pieges frequents</p>
                        <p className="text-[12px] text-[#8B6914] leading-snug">{(isPreviewing ? previewGuide : questionGuide)?.commonPitfalls}</p>
                      </div>
                    </div>
                    <QuickPhrases questionGuide={(isPreviewing ? previewGuide : questionGuide) ?? undefined} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Preview banner when looking ahead */}
            {isPreviewing && (
              <div className="mt-2">
                <div className="rounded-xl px-3 py-2 flex items-center gap-2" style={{ background: "#FFF8F0", border: "1px solid #F0DFC8" }}>
                  <span className="text-[12px] text-[#D4842A] font-medium">Apercu Q{displayIndex + 1}</span>
                  <div className="flex-1" />
                  <button onClick={() => setPreviewIndex(null)}
                    className="text-[12px] text-[#7A7A7A] hover:text-[#2C2C2C] cursor-pointer transition-colors">Retour Q{currentQIndex + 1}</button>
                  <button onClick={() => goToSituation(displayIndex)}
                    className="text-[12px] px-3 py-1 bg-[#F5A45B] text-white rounded-lg font-semibold cursor-pointer hover:brightness-105 transition-all"
                    style={{ boxShadow: "0 2px 8px rgba(245,164,91,0.3)" }}>
                    Lancer Q{displayIndex + 1}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SPLIT-PANEL LAYOUT ── */}
        <div className="flex-1 flex overflow-hidden min-h-0" style={{ background: "#F6F2EA", backgroundImage: "radial-gradient(ellipse at 50% 20%, rgba(255,107,53,0.03), transparent 60%)" }}>
          {/* LEFT: Classe en direct — hidden below lg, overlay drawer on mobile */}
          <div data-onboarding="classmap" className="hidden lg:flex w-[260px] xl:w-[300px] flex-shrink-0 flex-col m-2 mr-0 rounded-2xl shadow-sm overflow-hidden glass-cockpit">
            <ClassDashboardPanel
              session={session}
              studentStates={studentStates}
              stuckStudents={stuckStudents}
              setFicheStudentId={setFicheStudentId}
              lowerHand={lowerHand}
              handleNudgeAllStuck={handleNudgeAllStuck}
              cognitiveOptions={isM1Positioning && module1Data?.optionDistribution && module1Data.questions?.[currentQIndex]?.options
                ? module1Data.questions[currentQIndex].options!.map((o: { key: string; label: string }) => ({
                    key: o.key,
                    label: o.label,
                    count: (module1Data.optionDistribution as Record<string, number>)[o.key] || 0,
                  }))
                : undefined
              }
              cognitiveTotal={isM1Positioning && module1Data?.optionDistribution
                ? Object.values(module1Data.optionDistribution as Record<string, number>).reduce((sum, v) => sum + v, 0)
                : undefined
              }
              notRespondedStudents={notRespondedStudents}
            />
          </div>
          {/* CENTER: Question + Responses — glassmorphism */}
          <div className="flex-1 overflow-y-auto min-h-0 m-1.5 lg:m-2 rounded-2xl shadow-sm glass-cockpit">
          {/* Mobile panel toggle buttons — visible below lg only */}
          <div className="flex lg:hidden items-center justify-between px-3 py-2 border-b border-[#E8DFD2]/50">
            <button
              onClick={() => setMobileSidePanel(mobileSidePanel === "left" ? null : "left")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer"
              style={{
                background: mobileSidePanel === "left" ? "rgba(255,107,53,0.1)" : "rgba(255,255,255,0.5)",
                color: mobileSidePanel === "left" ? "#FF6B35" : "#7A7A7A",
                border: `1px solid ${mobileSidePanel === "left" ? "rgba(255,107,53,0.2)" : "#E8DFD2"}`,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="18" rx="2"/><rect x="14" y="3" width="7" height="18" rx="2" opacity=".3"/></svg>
              Classe
              {stuckStudents.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#EB5757]" />}
            </button>
            <button
              onClick={() => setMobileSidePanel(mobileSidePanel === "right" ? null : "right")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer"
              style={{
                background: mobileSidePanel === "right" ? "rgba(107,140,255,0.1)" : "rgba(255,255,255,0.5)",
                color: mobileSidePanel === "right" ? "#3B5998" : "#7A7A7A",
                border: `1px solid ${mobileSidePanel === "right" ? "rgba(107,140,255,0.2)" : "#E8DFD2"}`,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              Assistant IA
            </button>
          </div>
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
                    onBroadcast={openBroadcast}
                    respondingOpenedAt={respondingOpenedAt}
                    toggleHide={toggleHide}
                    toggleVoteOption={toggleVoteOption}
                    commentResponse={commentResponse}
                    highlightResponse={highlightResponse}
                    scoreResponse={scoreResponse}
                    resetResponse={resetResponse}
                    nudgeStudent={nudgeStudent}
                    warnStudent={warnStudent}
                    studentWarnings={studentWarnings}
                    oieScores={oieScores?.[ficheStudentId] ?? null}
                    onToggleActive={(studentId, isActive) => toggleStudentActive.mutate({ studentId, isActive })}
                    isToggleActivePending={toggleStudentActive.isPending}
                  />
                );
              })()}
            </div>
          ) : (
          <div className="px-3 sm:px-6 py-4 space-y-4">

          {/* ── CENTER STATE BANNER — contextual class status ── */}
          {centerTab === "responses" && (
            <CenterStateBanner
              sessionStatus={session.status}
              studentStates={studentStates}
              responsesCount={respondedCount}
              totalStudents={activeStudents.length}
              optionDistribution={isM1Positioning && module1Data?.optionDistribution
                ? module1Data.optionDistribution as Record<string, number>
                : undefined}
              optionLabels={isM1Positioning && module1Data?.questions?.[currentQIndex]?.options
                ? Object.fromEntries(module1Data.questions[currentQIndex].options!.map((o: { key: string; label: string }) => [o.key, o.label]))
                : undefined}
              primaryAttentionActive={hasPrimaryAttention}
            />
          )}

          {/* ── TOOLBAR — response section header ── */}
          {session.status !== "done" && !focusMode && (
            <div data-onboarding="responses" className="flex items-center gap-2 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
              {/* Toggle pill: Responses / Plan de classe — Issue 12: hidden on desktop (left panel has classmap) */}
              <div className="flex rounded-xl p-0.5 flex-shrink-0" style={{ background: "rgba(255,255,255,0.4)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }} role="tablist" aria-label="Vue centrale">
                <button
                  onClick={() => setCenterTab("responses")}
                  role="tab"
                  aria-selected={centerTab === "responses"}
                  aria-controls="center-responses"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-[13px] font-semibold transition-all cursor-pointer"
                  style={{
                    background: centerTab === "responses" ? "rgba(255,255,255,0.8)" : "transparent",
                    color: centerTab === "responses" ? "#2C2C2C" : "#7A7A7A",
                    boxShadow: centerTab === "responses" ? "0 2px 6px rgba(61,43,16,0.06)" : "none",
                  }}
                >
                  {unifiedLabel}
                  {centerTab === "responses" && unifiedRespondedCount > 0 && (
                    <span className="text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded-full" style={{ background: "#4CAF50", color: "#fff" }}>{unifiedRespondedCount}</span>
                  )}
                </button>
                <button
                  onClick={() => setCenterTab("classmap")}
                  role="tab"
                  aria-selected={centerTab === "classmap"}
                  aria-controls="center-classmap"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-[13px] font-semibold transition-all cursor-pointer"
                  style={{
                    background: centerTab === "classmap" ? "rgba(255,255,255,0.8)" : "transparent",
                    color: centerTab === "classmap" ? "#2C2C2C" : "#7A7A7A",
                    boxShadow: centerTab === "classmap" ? "0 2px 6px rgba(61,43,16,0.06)" : "none",
                  }}
                >
                  Plan de classe
                </button>
              </div>

              <div className="flex-1" />

              {/* Layout selector pills — visible only when classmap tab active */}
              {centerTab === "classmap" && (
                <div className="flex rounded-[8px] p-0.5 flex-shrink-0" style={{ background: "#EFE4D8" }} role="radiogroup" aria-label="Disposition des tables">
                  {([
                    { value: "rows", label: "Rangs", icon: "≡" },
                    { value: "u-shape", label: "En U", icon: "⊔" },
                    { value: "islands", label: "Ilots", icon: "⊞" },
                    { value: "free", label: "Libre", icon: "⊡" },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setClassroomLayout(opt.value)}
                      role="radio"
                      aria-checked={classroomLayout === opt.value}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-semibold transition-all cursor-pointer"
                      style={{
                        background: classroomLayout === opt.value ? "#FFFFFF" : "transparent",
                        color: classroomLayout === opt.value ? "#2C2C2C" : "#7A7A7A",
                        boxShadow: classroomLayout === opt.value ? "0 1px 3px rgba(61,43,16,0.08)" : "none",
                      }}
                    >
                      <span className="text-[12px]">{opt.icon}</span>
                      <span className="hidden sm:inline">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Search — only for certain modules when in responses tab */}
              {centerTab === "responses" && (isBudgetQuiz || showM10Special || showM2ECSceneBuilder || showM2ECComparison) && (
                <input
                  type="text" placeholder="Rechercher..." value={cardSearch}
                  onChange={(e) => setCardSearch(e.target.value)}
                  className="w-36 h-8 px-3 rounded-[10px] text-[13px] bg-white border border-[#E8DFD2] text-[#2C2C2C] placeholder:text-[#B0A99E] focus:outline-none focus:border-[#6B8CFF]/40 transition-colors"
                />
              )}
              <button onClick={openBroadcast} title="Message classe (B)"
                className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm text-[#7A7A7A] hover:text-[#2C2C2C] bg-white border border-[#E8DFD2] cursor-pointer transition-colors hover:shadow-sm">
                📢
              </button>
              <button onClick={() => setShowExport(true)} title="Export (E)"
                className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm text-[#7A7A7A] hover:text-[#2C2C2C] bg-white border border-[#E8DFD2] cursor-pointer transition-colors hover:shadow-sm">
                📋
              </button>
            </div>
          )}

          {/* ── TAB CONTENT with animated transitions ── */}
          <AnimatePresence mode="wait">
          {centerTab === "classmap" ? (
            <motion.div key="classmap" id="center-classmap" role="tabpanel"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}>
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
              onBroadcast={openBroadcast}
              onNudgeAllStuck={() => handleNudgeAllStuck()}
              onStudentClick={(sid) => setFicheStudentId(sid)}
              layout={classroomLayout}
              desksPerRow={classroomLayout === "rows" ? (activeStudents.length > 20 ? 4 : 3) : 3}
              deskSize={activeStudents.length > 20 ? "xs" : activeStudents.length > 12 ? "sm" : "md"}
              sessionId={session.id}
            />
            </motion.div>
          ) : (
            <motion.div key="responses" id="center-responses" role="tabpanel"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}>

          {/* ── MODULE-SPECIFIC CONTENT ── */}
          <>

          {/* M1 Positioning + Image (extracted) */}
          <Module1Cockpit
            isPositioning={isM1Positioning}
            isImage={isM1Image}
            module1Data={module1Data}
            currentQIndex={currentQIndex}
            activeStudentCount={activeStudents.length}
            isPreviewing={isPreviewing}
          />

          {/* M1 Notebook: responses rendered by ResponseStreamSection below */}

          {/* M9 séance 2: Budget overview + individual budgets */}
          {isBudgetQuiz && (
            <>
              <Module9BudgetOverview
                budgetSubmitted={budgetSubmitted}
                activeStudentCount={activeStudents.length}
                budgetAverages={budgetAverages}
              />

              {/* Individual budgets + empty state (extracted) */}
              <Module9BudgetCards
                budgets={budgetData?.budgets || []}
                cardSearch={cardSearch}
                activeStudentCount={activeStudents.length}
                budgetSubmitted={budgetSubmitted}
                sessionStatus={session.status}
                studentWarnings={studentWarnings}
                onBroadcast={(msg) => { updateSession.mutate({ broadcast_message: msg, broadcast_at: new Date().toISOString() }); toast.success("Envoyé"); }}
                onWarn={(sid) => warnStudent.mutate(sid)}
                isWarnPending={warnStudent.isPending}
                onOpenBroadcast={openBroadcast}
              />
            </>
          )}

          {/* ── MODULE 10: Et si... + Pitch (extracted) ── */}
          {showM10Special && (
            <Module10Cockpit
              isEtsi={isM10Etsi}
              isPitch={isM10Pitch}
              module10Data={module10Data}
              isPreviewing={isPreviewing}
              cardSearch={cardSearch}
              selectedPitchIds={selectedPitchIds}
              setSelectedPitchIds={setSelectedPitchIds}
              sessionId={sessionId}
              currentModule={session.current_module}
              currentSeance={session.current_seance || 1}
              currentSituationIndex={session.current_situation_index || 0}
              studentWarnings={studentWarnings}
              onBroadcast={(msg) => { updateSession.mutate({ broadcast_message: msg, broadcast_at: new Date().toISOString() }); toast.success("Envoyé"); }}
              onWarn={(sid) => warnStudent.mutate(sid)}
              isWarnPending={warnStudent.isPending}
            />
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

          {/* ── MODULE 13: La Post-prod cockpit ── */}
          {isM13Any && module13Data && (
            <Module13Cockpit
              sessionId={session.id}
              module13={module13Data}
              connectedCount={activeStudents.length}
            />
          )}

          {/* ── MODULE 6: Le Scénario cockpit ── */}
          {isM6Any && module6Data && (
            <Module6Cockpit
              module6={module6Data}
              connectedCount={activeStudents.length}
            />
          )}

          {/* ── MODULE 7: La Mise en scène cockpit ── */}
          {isM7Any && module7Data && (
            <Module7Cockpit
              module7={module7Data}
              connectedCount={activeStudents.length}
              sessionId={sessionId}
            />
          )}

          {/* ── MODULE 8: L'Équipe cockpit ── */}
          {isM8Any && module8Data && (
            <Module8Cockpit
              sessionId={session.id}
              module8={module8Data}
              connectedCount={activeStudents.length}
            />
          )}

          {/* ── MODULE 2 EC: Checklist + Scene Builder + Comparison (extracted) ── */}
          <Module2ECCockpit
            showChecklist={showM2ECChecklist}
            showSceneBuilder={showM2ECSceneBuilder}
            showComparison={showM2ECComparison}
            module5Data={module5Data}
            scenesData={scenesData}
            isPreviewing={isPreviewing}
            cardSearch={cardSearch}
            selectedSceneIds={selectedSceneIds}
            setSelectedSceneIds={setSelectedSceneIds}
            selectComparison={selectComparison}
            activeStudentCount={activeStudents.length}
            sessionStatus={session.status}
            studentWarnings={studentWarnings}
            onBroadcast={(msg) => { updateSession.mutate({ broadcast_message: msg, broadcast_at: new Date().toISOString() }); toast.success("Envoyé"); }}
            onWarn={(sid) => warnStudent.mutate(sid)}
            isWarnPending={warnStudent.isPending}
            onOpenBroadcast={openBroadcast}
          />

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
              respondedCount={respondedCount}
              highlightedCount={highlightedCount}
              respondingOpenedAt={respondingOpenedAt}
              winnerResponseId={winnerResponseId}
              stuckStudents={stuckStudents}
              questionGuide={questionGuide}
              situation={situation}
              responseFilter={responseFilter}
              setResponseFilter={setResponseFilter}
              responseSortMode={responseSortMode}
              setResponseSortMode={setResponseSortMode}
              onShowBroadcast={openBroadcast}
              onShowCompare={() => setShowCompare(true)}
              onShowExport={() => setShowExport(true)}
              showRevealAnswer={showRevealAnswer}
              onToggleRevealAnswer={() => setShowRevealAnswer((v) => !v)}
              onClearAllHighlights={handleClearAllHighlights}
              onNudgeAllStuck={handleNudgeAllStuck}
              onReformulate={(r) => {
                setReformulating(r as unknown as Response);
                setReformulatedText(r.text);
              }}
              onSpotlight={(r) => setSpotlightResponse({ studentName: r.students?.display_name || "", studentAvatar: r.students?.avatar || "", text: r.text, score: r.teacher_score, highlighted: r.is_highlighted })}
              onHighlightAllVisible={handleHighlightAllVisible}
              onHideAllVisible={handleHideAllVisible}
            />
          )}

          {/* ── RESPONSES LIST (Budget/other — simpler display with inline actions) ── */}
          {/* M1 Positioning: responses moved to right panel to avoid center scroll */}
          {!isStandardQA && !isM1Image && !isM1Notebook && !isM12Any && !(isM13Any && !showM13Standard) && !isM6Any && !isM7Any && !isM8Any && !isM1Positioning && session.status !== "done" && responses.length > 0 && (
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
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {session.status === "responding" && (
                          <>
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
                          </>
                        )}
                        {!r.is_hidden && (
                          <button onClick={() => setSpotlightResponse({ studentName: r.students?.display_name || "", studentAvatar: r.students?.avatar || "", text: r.text, score: r.teacher_score, highlighted: r.is_highlighted })}
                            className="px-1.5 py-1 text-xs rounded-lg hover:bg-[#FFF0E0] cursor-pointer transition-colors text-bw-muted hover:text-[#F5A45B]"
                            title="Projeter en grand">
                            🔦
                          </button>
                        )}
                      </div>
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

          {/* ── EMPTY STATE — clean, minimal waiting indicator ── */}
          {session.status === "responding" && unifiedRespondedCount === 0 && responses.length === 0 && !isStandardQA && !isM1Image && !isM1Notebook && !isM12Any && !(isM13Any && !showM13Standard) && !isM6Any && !isM7Any && !isM8Any && !isBudgetQuiz && !isM1Positioning && (
            <div
              className="rounded-[16px] p-6 text-center space-y-3"
              style={{
                background: "#FFFFFF",
                border: "1px solid #EFE4D8",
                boxShadow: "0 4px 16px rgba(61,43,16,0.04)",
              }}
            >
              {/* Thinking dots */}
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
              <p className="text-[16px] font-bold text-[#F2C94C]">{activeStudents.length} eleves reflechissent...</p>
              <button onClick={openBroadcast}
                className="flex items-center gap-2 h-8 px-3.5 mx-auto rounded-lg text-[12px] font-medium bg-white border border-[#E8DFD2] text-[#7A7A7A] hover:text-[#2C2C2C] hover:shadow-sm cursor-pointer transition-all">
                📢 Message classe
              </button>
            </div>
          )}

          {/* "Pas encore répondu" removed — info already in left panel "En attente" */}

          {/* Choices history (Standard Q&A) */}
          {!focusMode && isStandardQA && collectiveChoices.length > 0 && (
            <ChoicesHistory choices={collectiveChoices} />
          )}

          </>
          </motion.div>
          )}
          </AnimatePresence>


        </div>
        )}
        </div>
          {/* RIGHT: Assistant pedagogique — hidden below lg, overlay drawer on mobile */}
          <div className="hidden lg:flex w-[260px] xl:w-[320px] flex-shrink-0 flex-col m-2 ml-0 rounded-2xl shadow-sm overflow-hidden"
            style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.4)" }}>
            {/* Title */}
            <div className="px-3 lg:px-5 pt-3 lg:pt-5 pb-2 lg:pb-3 flex-shrink-0">
              <h3 className="text-[14px] lg:text-[18px] font-semibold text-[#2C2C2C]">Assistant pedagogique</h3>
              <p className="text-[11px] lg:text-[13px] text-[#7A7A7A] mt-0.5 hidden sm:block">Aide a la lecture de la classe</p>
            </div>
            {/* AI suggestions + insights */}
            <div className="flex-1 overflow-y-auto px-3 lg:px-5 pb-3 lg:pb-5 space-y-3 lg:space-y-4">
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
                    handsRaisedAt: session.students?.filter(s => s.hand_raised_at).map(s => s.hand_raised_at ?? null) || [],
                    elapsedSeconds: respondingOpenedAt
                      ? Math.round((Date.now() - respondingOpenedAt) / 1000)
                      : 0,
                    currentModule: session.current_module,
                    currentSeance: session.current_seance || 1,
                    currentSituation: session.current_situation_index || 0,
                    optionDistribution: (isM1Positioning && module1Data?.optionDistribution)
                      ? module1Data.optionDistribution as Record<string, number>
                      : undefined,
                    completedModules: session.completed_modules || [],
                    currentPhaseId: currentMod ? getPhaseForModule(currentMod.id)?.id || null : null,
                    totalModuleCount: MODULES.filter(m => !m.disabled && !m.comingSoon).length,
                    disconnectedCount: (session.students || []).filter(s => !s.is_active || s.kicked).length,
                  }}
                  onSendHint={() => openBroadcastWith("Petit indice : ", "Envoyer un indice", "💡")}
                  onReformulate={() => openBroadcastWith("Reformulation : ", "Reformuler la consigne", "🔄")}
                  onLaunchVote={() => updateSession.mutate({ status: "voting", timer_ends_at: null })}
                  onBroadcast={openBroadcast}
                  onDebate={() => { setShowDebate(true); addTimelineEvent("debate_launched", "Debat lance", undefined, "highlight"); }}
                  onStudentClick={(id) => setFicheStudentId(id)}
                  qcmVoteData={isM1Positioning && module1Data?.questions?.[currentQIndex]?.options ? (() => {
                    const opts = module1Data.questions![currentQIndex].options!;
                    const votesByOption: Record<string, { avatar: string; name: string; id: string }[]> = {};
                    for (const opt of opts) votesByOption[opt.key] = [];
                    for (const r of responses.filter(r => !r.is_hidden)) {
                      const key = r.text?.trim().toLowerCase();
                      if (key && votesByOption[key]) {
                        votesByOption[key].push({ avatar: r.students?.avatar || "", name: r.students?.display_name || "", id: r.student_id });
                      }
                    }
                    return {
                      options: opts,
                      votesByOption,
                      totalVotes: responses.filter(r => !r.is_hidden).length,
                      totalStudents: activeStudents.length,
                    };
                  })() : undefined}
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

              {/* Vote columns + Carte cognitive now rendered inside AIAssistantPanel */}

              {/* Session Timeline — replay of key moments */}
              <SessionTimeline
                events={timelineEvents}
                sessionStartedAt={sessionStartedAt}
              />
            </div>
          </div>
        </div>
      </main>

      {/* ── MOBILE SIDE PANEL OVERLAYS (below lg only) ── */}
      <AnimatePresence>
        {mobileSidePanel && (
          <>
            <motion.div
              key="panel-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileSidePanel(null)}
            />
            <motion.div
              key="panel-drawer"
              initial={{ x: mobileSidePanel === "left" ? -320 : 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: mobileSidePanel === "left" ? -320 : 320, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className={`lg:hidden fixed inset-y-0 z-50 w-[300px] sm:w-[340px] flex flex-col overflow-hidden rounded-none ${
                mobileSidePanel === "left" ? "left-0" : "right-0"
              }`}
              style={{
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                boxShadow: mobileSidePanel === "left"
                  ? "4px 0 24px rgba(0,0,0,0.12)"
                  : "-4px 0 24px rgba(0,0,0,0.12)",
              }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8DFD2]">
                <span className="text-[14px] font-bold text-[#2C2C2C]">
                  {mobileSidePanel === "left" ? "Cockpit de classe" : "Assistant pedagogique"}
                </span>
                <button
                  onClick={() => setMobileSidePanel(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7A7A7A] hover:text-[#2C2C2C] hover:bg-black/5 cursor-pointer transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              {/* Drawer content */}
              <div className="flex-1 overflow-y-auto">
                {mobileSidePanel === "left" ? (
                  <ClassDashboardPanel
                    session={session}
                    studentStates={studentStates}
                    stuckStudents={stuckStudents}
                    setFicheStudentId={(id) => { setFicheStudentId(id); setMobileSidePanel(null); }}
                    lowerHand={lowerHand}
                    handleNudgeAllStuck={handleNudgeAllStuck}
                    cognitiveOptions={isM1Positioning && module1Data?.optionDistribution && module1Data.questions?.[currentQIndex]?.options
                      ? module1Data.questions[currentQIndex].options!.map((o: { key: string; label: string }) => ({
                          key: o.key,
                          label: o.label,
                          count: (module1Data.optionDistribution as Record<string, number>)[o.key] || 0,
                        }))
                      : undefined
                    }
                    cognitiveTotal={isM1Positioning && module1Data?.optionDistribution
                      ? Object.values(module1Data.optionDistribution as Record<string, number>).reduce((sum, v) => sum + v, 0)
                      : undefined
                    }
                    notRespondedStudents={notRespondedStudents}
                  />
                ) : (
                  <div className="px-4 pb-4 pt-2 space-y-3">
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
                          handsRaisedAt: session.students?.filter(s => s.hand_raised_at).map(s => s.hand_raised_at ?? null) || [],
                          elapsedSeconds: respondingOpenedAt ? Math.round((Date.now() - respondingOpenedAt) / 1000) : 0,
                          currentModule: session.current_module,
                          currentSeance: session.current_seance || 1,
                          currentSituation: session.current_situation_index || 0,
                          optionDistribution: (isM1Positioning && module1Data?.optionDistribution)
                            ? module1Data.optionDistribution as Record<string, number>
                            : undefined,
                          completedModules: session.completed_modules || [],
                          currentPhaseId: currentMod ? getPhaseForModule(currentMod.id)?.id || null : null,
                          totalModuleCount: MODULES.filter(m => !m.disabled && !m.comingSoon).length,
                          disconnectedCount: (session.students || []).filter(s => !s.is_active || s.kicked).length,
                        }}
                        onSendHint={() => { openBroadcastWith("Petit indice : ", "Envoyer un indice", "💡"); setMobileSidePanel(null); }}
                        onReformulate={() => { openBroadcastWith("Reformulation : ", "Reformuler la consigne", "🔄"); setMobileSidePanel(null); }}
                        onLaunchVote={() => { updateSession.mutate({ status: "voting", timer_ends_at: null }); setMobileSidePanel(null); }}
                        onBroadcast={() => { openBroadcast(); setMobileSidePanel(null); }}
                        onDebate={() => { setShowDebate(true); addTimelineEvent("debate_launched", "Debat lance", undefined, "highlight"); setMobileSidePanel(null); }}
                        onStudentClick={(id) => { setFicheStudentId(id); setMobileSidePanel(null); }}
                      />
                    ) : (
                      <div className="text-center py-8 space-y-2">
                        <span className="text-2xl">🎬</span>
                        <p className="text-xs text-bw-muted">Session terminee.</p>
                      </div>
                    )}
                    <SessionTimeline events={timelineEvents} sessionStartedAt={sessionStartedAt} />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── FOOTER + FLOATING ACTION + ONBOARDING ── */}
      <CockpitFooterBar
        sessionStatus={session.status}
        isStandardQA={isStandardQA}
        openBroadcastWith={openBroadcastWith}
        openBroadcast={openBroadcast}
        handleNudgeAllStuck={handleNudgeAllStuck}
        notRespondedStudents={notRespondedStudents}
        visibleResponses={visibleResponses}
        setShowDebate={setShowDebate}
        setShowCompare={setShowCompare}
        setShowWordCloud={setShowWordCloud}
        setShowExport={setShowExport}
        addTimelineEvent={addTimelineEvent}
        responsesCount={responses.length}
        activeStudentCount={activeStudents.length}
        voteOptionCount={voteOptionCount}
        totalVotes={voteData?.totalVotes}
        handleSelectionBarAction={handleSelectionBarAction}
        handleQuickVote={handleQuickVote}
        allResponded={allResponded}
        canGoNext={canGoNext}
        currentSituationIndex={session.current_situation_index || 0}
        isPreviewing={isPreviewing}
        displayIndex={displayIndex}
        prevSituation={prevSituation}
        skipSituation={skipSituation}
        handleNextAction={handleNextAction}
        nextAction={nextAction}
        goToSituation={goToSituation}
        setPreviewIndex={setPreviewIndex}
        focusMode={focusMode}
        setFocusMode={setFocusMode}
        sharingEnabled={session.sharing_enabled}
        helpEnabled={session.help_enabled ?? false}
        muteSounds={session.mute_sounds}
        setShowShortcuts={setShowShortcuts}
        respondedCount={respondedCount}
        voteData={voteData}
        footerCtaRef={footerCtaRef}
        onboarding={onboarding}
        revealPhase={session.reveal_phase}
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

      {/* ── BULK RESPONSE TOOLBAR ── */}
      <BulkResponseToolbar
        selectedCount={selectedResponseIds.size}
        totalCount={responses.length}
        onHideUnselected={() => {
          const toHide = responses.filter((r) => !selectedResponseIds.has(r.id) && !r.is_hidden);
          for (const r of toHide) toggleHide.mutate({ responseId: r.id, is_hidden: true });
          setSelectedResponseIds(new Set());
        }}
        onAiEvaluate={() => {
          aiEvaluate.mutate([...selectedResponseIds]);
          setSelectedResponseIds(new Set());
        }}
        onDeselectAll={() => setSelectedResponseIds(new Set())}
        isEvaluating={aiEvaluate.isPending}
      />

      {/* ── MODALS ── */}
      <CockpitModals
        spotlightResponse={spotlightResponse}
        setSpotlightResponse={setSpotlightResponse}
        showWordCloud={showWordCloud}
        setShowWordCloud={setShowWordCloud}
        showDebate={showDebate}
        setShowDebate={setShowDebate}
        showBroadcast={showBroadcast}
        setShowBroadcast={setShowBroadcast}
        handleBroadcast={handleBroadcast}
        broadcastHistory={broadcastHistory}
        broadcastPrefill={broadcastPrefill}
        broadcastTitle={broadcastTitle}
        broadcastIcon={broadcastIcon}
        updateSessionPending={updateSession.isPending}
        showCompare={showCompare}
        setShowCompare={setShowCompare}
        handleHighlightBoth={handleHighlightBoth}
        handleClearAllHighlights={handleClearAllHighlights}
        showExport={showExport}
        setShowExport={setShowExport}
        sessionTitle={session.title || "Session"}
        level={session.level || ""}
        moduleLabel={moduleLabel}
        questionPrompt={situation?.prompt || ""}
        activeStudentCount={activeStudents.length}
        sessionId={sessionId}
        showShortcuts={showShortcuts}
        setShowShortcuts={setShowShortcuts}
        kickTarget={kickTarget}
        setKickTarget={setKickTarget}
        responses={responses}
        visibleResponses={visibleResponses}
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
  const { status: connectionStatus } = useRealtimeInvalidation(sessionId);
  const isOnline = useOnlineStatus();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [actorId, setActorId] = useState<string>("system");
  const [codeCopied, setCodeCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileContextOpen, setMobileContextOpen] = useState(false);
  const [pendingModuleSwitch, setPendingModuleSwitch] = useState<{ moduleId: string; isQuickLaunch: boolean } | null>(null);
  const { play: playSound } = useSound();

  // Confirmation dialog for destructive actions (#1)
  const confirmAction = useConfirmAction();

  // Undo/redo stack (#13)
  const undoStack = useUndoStack();

  // Briefing / cockpit flow
  const [moduleView, setModuleView] = useState<"briefing" | "cockpit">("cockpit");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  // Right panel removed — floating docks handle their own state

  const sidebarWidth = 0; // Sidebar is now overlay, no offset needed

  // Effective connection status: combine navigator.onLine + channel status (#2)
  const effectiveConnectionStatus = !isOnline ? "disconnected" as const : connectionStatus;

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push(ROUTES.login); return; }
      setActorId(user.id);
      setCheckingAuth(false);
    }
    check();
  }, [router]);

  // ── All queries + mutations extracted to usePilotSession ──
  const {
    session, sessionLoading,
    teams, situationData, situation,
    responses, voteData, collectiveChoices, oieScores,
    activeModule, hasActiveModule,
    updateSession, removeStudent, validateChoice,
    toggleHide, toggleVoteOption, commentResponse,
    highlightResponse, nudgeStudent, warnStudent,
    toggleStudentActive, lowerHand, scoreResponse, aiEvaluate,
    resetResponse, resetAllResponses,
  } = usePilotSession(sessionId, checkingAuth, actorId, effectiveConnectionStatus);

  // Undo-aware wrappers for reversible mutations (#13)
  const undoableToggleHide = useMemo(() => ({
    ...toggleHide,
    mutate: (args: { responseId: string; is_hidden: boolean }) => {
      undoStack.push({
        label: args.is_hidden ? "Réponse masquée" : "Réponse affichée",
        undo: () => toggleHide.mutate({ responseId: args.responseId, is_hidden: !args.is_hidden }),
        redo: () => toggleHide.mutate(args),
      });
      toggleHide.mutate(args);
    },
  }), [toggleHide, undoStack]);

  const undoableHighlight = useMemo(() => ({
    ...highlightResponse,
    mutate: (args: { responseId: string; highlighted: boolean }) => {
      undoStack.push({
        label: args.highlighted ? "Réponse projetée" : "Projection retirée",
        undo: () => highlightResponse.mutate({ responseId: args.responseId, highlighted: !args.highlighted }),
        redo: () => highlightResponse.mutate(args),
      });
      highlightResponse.mutate(args);
    },
  }), [highlightResponse, undoStack]);

  const undoableToggleVote = useMemo(() => ({
    ...toggleVoteOption,
    mutate: (args: { responseId: string; is_vote_option: boolean }) => {
      undoStack.push({
        label: args.is_vote_option ? "Option de vote ajoutée" : "Option de vote retirée",
        undo: () => toggleVoteOption.mutate({ responseId: args.responseId, is_vote_option: !args.is_vote_option }),
        redo: () => toggleVoteOption.mutate(args),
      });
      toggleVoteOption.mutate(args);
    },
  }), [toggleVoteOption, undoStack]);

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
    setSidebarOpen(false);
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
      logAudit({ action: "module_switch", actor: actorId, sessionId, details: { moduleId, dbModule: mod.dbModule, dbSeance: mod.dbSeance } });
    }
    if (isQuickLaunch) {
      setSelectedModuleId(moduleId);
      setSidebarOpen(false);
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
    setSidebarOpen(false);
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
    // Auto-generate collective pools when M10 S2 (Pitch) completes
    if (session?.current_module === 10 && (session.current_seance || 1) === 2) {
      fetch(`/api/sessions/${sessionId}/collective-pools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }).then((res) => {
        if (res.ok) toast.success("Cartes collect\u00E9es pour la Construction Collective");
      }).catch(() => { /* pools can be generated manually from M12 */ });
    }
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
          <button onClick={() => router.push(ROUTES.legacyDashboard)} className="text-bw-primary text-sm cursor-pointer">← Dashboard</button>
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
        {/* Module sidebar — overlay drawer, hidden by default */}
        <SidebarDrawer open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <ModuleSidebar
            modules={MODULES}
            phases={PHASES}
            activeModuleId={activeModule?.id || null}
            selectedModuleId={moduleView === "briefing" ? selectedModuleId : null}
            completedModules={session.completed_modules || []}
            onSelectModule={(id) => { handleSelectModule(id); setSidebarOpen(false); }}
            onQuickLaunch={(id) => { handleQuickLaunchModule(id); setSidebarOpen(false); }}
            responsesCount={responses?.length || 0}
            moduleStartedAt={moduleStartedAt}
            sessionStatus={session.status}
            currentQuestionIndex={hasActiveModule ? currentQuestionIndex : undefined}
            totalModuleQuestions={hasActiveModule ? totalQuestions : undefined}
          />
        </SidebarDrawer>

        {/* Centre — contenu principal (full width) */}
        <div className="flex-1 overflow-hidden flex flex-col">
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
          <CockpitProvider value={{
            session,
            sessionId,
            responses,
            activeStudents,
            voteData,
            collectiveChoices,
            situationData,
            oieScores,
            teams: teams || [],
            updateSession,
            toggleHide: undoableToggleHide,
            toggleVoteOption: undoableToggleVote,
            validateChoice,
            removeStudent,
            commentResponse,
            highlightResponse: undoableHighlight,
            nudgeStudent,
            warnStudent,
            toggleStudentActive,
            lowerHand,
            scoreResponse,
            aiEvaluate,
            resetResponse,
            resetAllResponses,
            onModuleComplete: handleModuleComplete,
            onSelectStudent: (s) => { setSelectedStudentId(s.id); setShowStudents(false); },
            onOpenModules: () => setSidebarOpen(!sidebarOpen),
            onOpenScreen: () => window.open(ROUTES.screen(sessionId), "_blank"),
            studentWarnings: Object.fromEntries((session.students || []).map(s => [s.id, s.warnings || 0])),
          }}>
          <CockpitContent
            commentingResponse={commentingResponse}
            setCommentingResponse={setCommentingResponse}
            commentText={commentText}
            setCommentText={setCommentText}
            router={router}
            showStudents={showStudents}
            setShowStudents={setShowStudents}
            sidebarWidth={sidebarWidth}
            totalQuestions={totalQuestions}
          />
          </CockpitProvider>
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

      {/* Generic confirmation dialog for destructive actions (#1) */}
      <ConfirmModal
        open={confirmAction.open}
        onClose={confirmAction.onClose}
        onConfirm={confirmAction.onConfirm}
        title={confirmAction.title}
        description={confirmAction.description}
        confirmLabel={confirmAction.confirmLabel}
        confirmVariant={confirmAction.confirmVariant}
        isPending={confirmAction.isPending}
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
