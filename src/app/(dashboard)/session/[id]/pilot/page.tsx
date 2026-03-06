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
// QuestionCard removed — question now in header bar
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
import { QuestionNavigation } from "@/components/pilot/question-navigation";
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
import { PilotTopBar } from "@/components/pilot/pilot-top-bar";
import { ModuleSidebar, MobileSidebarDrawer } from "@/components/pilot/module-sidebar";
import { WelcomePanel } from "@/components/pilot/welcome-panel";
import { ModuleBriefing } from "@/components/pilot/module-briefing";
import { ContextPanel } from "@/components/pilot/context-panel";
import { getNextAction, type NextAction } from "@/components/pilot/get-next-action";
import { TeamManager } from "@/components/pilot/team-manager";
import { ClassroomMap } from "@/components/pilot/classroom-map";
import { StudentFiche } from "@/components/pilot/student-fiche";

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
// Preview guide card — shows question preview + guide info when teacher previews a step
// ——————————————————————————————————————————————————————

function PreviewGuideCard({ label, description, guide, position, children }: {
  label: string;
  description?: string;
  guide?: QuestionGuide;
  position: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="glass-card overflow-hidden" style={{ borderColor: "rgba(245,158,11,0.2)", background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(26,29,34,0.6) 60%)" }}>
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #F59E0B, rgba(139,92,246,0.5))" }} />
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.10))", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.30)" }}>
            {guide?.label || label}
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-bw-amber/15 text-bw-amber">Pos. {position + 1}</span>
          <span className="text-[10px] text-bw-amber uppercase tracking-wider font-semibold ml-auto">Apercu</span>
        </div>
        {description && <p className="text-base leading-relaxed text-bw-text">{description}</p>}
        {children}
      </div>
      {guide && (
        <div className="border-t px-4 py-3 space-y-2.5" style={{ borderColor: "rgba(245,158,11,0.15)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-bw-bg rounded-lg p-3 space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-bw-green">Ce qu&apos;on attend</p>
              <p className="text-xs text-bw-text leading-relaxed">{guide.whatToExpect}</p>
            </div>
            <div className="bg-bw-bg rounded-lg p-3 space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-bw-amber">Pieges frequents</p>
              <p className="text-xs text-bw-amber leading-relaxed">{guide.commonPitfalls}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {guide.relancePhrase && (
              <button
                onClick={() => { navigator.clipboard.writeText(guide.relancePhrase); }}
                className="flex-1 bg-bw-teal/8 border border-bw-teal/20 rounded-lg px-3 py-2.5 text-left cursor-pointer hover:bg-bw-teal/15 transition-colors"
              >
                <p className="text-[9px] uppercase tracking-wider font-semibold text-bw-teal mb-0.5">Relancer</p>
                <p className="text-xs text-bw-text leading-relaxed italic">&ldquo;{guide.relancePhrase}&rdquo;</p>
              </button>
            )}
            {guide.challengePhrase && (
              <button
                onClick={() => { navigator.clipboard.writeText(guide.challengePhrase); }}
                className="flex-1 bg-bw-violet/8 border border-bw-violet/20 rounded-lg px-3 py-2.5 text-left cursor-pointer hover:bg-bw-violet/15 transition-colors"
              >
                <p className="text-[9px] uppercase tracking-wider font-semibold text-bw-violet mb-0.5">Challenger</p>
                <p className="text-xs text-bw-text leading-relaxed italic">&ldquo;{guide.challengePhrase}&rdquo;</p>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
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
}) {
  const [ficheStudentId, setFicheStudentId] = useState<string | null>(null);
  const [guideExpanded, setGuideExpanded] = useState(false);
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
  const [allResponded, setAllResponded] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(0);
  const [respondingOpenedAt, setRespondingOpenedAt] = useState<number | null>(null);
  const [cardSearch, setCardSearch] = useState("");
  const [broadcastHistory, setBroadcastHistory] = useState<{ text: string; sentAt: Date }[]>([]);
  const [timerMode, setTimerMode] = useState(false);
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

      {/* ── ZERO-SCROLL LAYOUT — split panel, content scrolls internally ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ── COMPACT HEADER BAR ── */}
        <div className="flex items-center gap-3 px-4 py-1.5 flex-shrink-0 border-b border-white/[0.06]">
          {/* Module badge */}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0" style={{ backgroundColor: `${moduleColor}20`, color: moduleColor, border: `1px solid ${moduleColor}30` }}>
            M{session.current_module} {moduleLabel}
          </span>
          {/* Chapter / Question counter */}
          {(totalQuestions ?? 0) > 0 && (
            <span className="text-[11px] text-bw-muted tabular-nums flex-shrink-0">
              Ch.{session.current_seance || 1} Q.{currentQIndex + 1}/{totalQuestions}
            </span>
          )}
          {/* Timer compact */}
          {session.timer_ends_at && (
            <span className="text-[11px] text-bw-amber tabular-nums flex-shrink-0">
              <ElapsedTimer startedAt={respondingOpenedAt} />
            </span>
          )}
          {!session.timer_ends_at && respondingOpenedAt && (
            <span className="flex-shrink-0">
              <ElapsedTimer startedAt={respondingOpenedAt} />
            </span>
          )}
          <div className="flex-1" />
          {/* Student count */}
          <span className="text-[11px] text-bw-muted tabular-nums flex-shrink-0">
            {activeStudents.length}/{totalStudents} élève{activeStudents.length > 1 ? "s" : ""}
          </span>
          {/* Auto-advance compact toggle */}
          <button
            onClick={() => {
              setAutoAdvance((v) => !v);
              if (autoAdvanceTimerRef.current) {
                clearTimeout(autoAdvanceTimerRef.current);
                autoAdvanceTimerRef.current = null;
                setAutoAdvanceCountdown(0);
              }
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium cursor-pointer transition-all flex-shrink-0 ${
              autoAdvance ? "bg-bw-teal/15 text-bw-teal border border-bw-teal/30" : "bg-bw-elevated text-bw-muted border border-white/[0.06]"
            }`}
          >
            <div className={`w-5 h-3 rounded-full transition-all relative ${autoAdvance ? "bg-bw-teal" : "bg-white/10"}`}>
              <div className={`absolute top-px w-2.5 h-2.5 rounded-full bg-white transition-all ${autoAdvance ? "left-2" : "left-px"}`} />
            </div>
            Auto
          </button>
          {autoAdvance && autoAdvanceCountdown > 0 && (
            <span className="text-[10px] text-bw-teal tabular-nums font-mono flex-shrink-0">{autoAdvanceCountdown}s</span>
          )}
        </div>

        {/* ── QUESTION BAR — always visible with collapsible guide ── */}
        {(showStandardQA || isM1Positioning) && situation && (
          <div className="flex-shrink-0 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 px-4 py-2">
              {/* Category badge */}
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: `${CATEGORY_COLORS[situation.category] || moduleColor}20`, color: CATEGORY_COLORS[situation.category] || moduleColor }}>
                {(() => {
                if (isPreviewing) {
                  const ps = allSituations.find(s => s.position === displayIndex + 1);
                  return ps?.restitutionLabel || ps?.category || situation.restitutionLabel || situation.category;
                }
                return situation.restitutionLabel || situation.category;
              })()}
              </span>
              {isPreviewing && <span className="text-[9px] px-1.5 py-0.5 rounded bg-bw-amber/15 text-bw-amber font-bold uppercase flex-shrink-0">Apercu</span>}
              {/* Question text */}
              <p className={`text-sm leading-snug flex-1 min-w-0 truncate ${isPreviewing ? "text-bw-amber" : "text-bw-text"}`}>{
                isPreviewing
                  ? (isM1Positioning
                    ? (module1Data?.questions?.[displayIndex]?.text ?? situation.prompt)
                    : (allSituations.find(s => s.position === displayIndex + 1)?.prompt ?? situation.prompt))
                  : situation.prompt
              }</p>
              {/* Question navigation compact */}
              {(totalQuestions ?? 0) > 1 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={previewPrev} disabled={displayIndex <= 0}
                    className="px-1.5 py-1 rounded-lg text-xs text-bw-muted hover:text-white bg-bw-elevated border border-white/[0.06] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    ◀
                  </button>
                  <span className="text-[10px] text-bw-muted tabular-nums">Q{displayIndex + 1}/{totalQuestions}</span>
                  <button onClick={previewNext} disabled={displayIndex >= maxSituations - 1}
                    className="px-1.5 py-1 rounded-lg text-xs text-bw-muted hover:text-white bg-bw-elevated border border-white/[0.06] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    ▶
                  </button>
                </div>
              )}
              {/* Guide toggle */}
              {questionGuide && (
                <button
                  onClick={() => setGuideExpanded(!guideExpanded)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium cursor-pointer transition-all flex-shrink-0 ${
                    guideExpanded ? "bg-bw-green/15 text-bw-green border border-bw-green/30" : "text-bw-muted hover:text-bw-green bg-bw-elevated border border-white/[0.06]"
                  }`}
                >
                  {guideExpanded ? "▴ Guide" : "▾ Guide"}
                </button>
              )}
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
                  <div className="px-4 pb-3 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="bg-bw-bg rounded-lg p-2.5 space-y-0.5">
                        <p className="text-[9px] uppercase tracking-wider font-semibold text-bw-green">Ce qu&apos;on attend</p>
                        <p className="text-[11px] text-bw-text leading-relaxed">{(isPreviewing ? previewGuide : questionGuide)?.whatToExpect}</p>
                      </div>
                      <div className="bg-bw-bg rounded-lg p-2.5 space-y-0.5">
                        <p className="text-[9px] uppercase tracking-wider font-semibold text-bw-amber">Pièges fréquents</p>
                        <p className="text-[11px] text-bw-amber leading-relaxed">{(isPreviewing ? previewGuide : questionGuide)?.commonPitfalls}</p>
                      </div>
                    </div>
                    <QuickPhrases questionGuide={(isPreviewing ? previewGuide : questionGuide) ?? undefined} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Preview banner when looking ahead */}
            {isPreviewing && (
              <div className="px-4 pb-2">
                <div className="bg-bw-amber/10 border border-bw-amber/30 rounded-lg px-3 py-2 flex items-center gap-3">
                  <span className="text-[11px] text-bw-amber">Aperçu Q{displayIndex + 1}</span>
                  <div className="flex-1" />
                  <button onClick={() => setPreviewIndex(null)}
                    className="text-[10px] text-bw-muted hover:text-white cursor-pointer">Retour Q{currentQIndex + 1}</button>
                  <button onClick={() => goToSituation(displayIndex)}
                    className="text-[10px] px-2.5 py-1 bg-bw-amber text-black rounded-lg font-medium cursor-pointer hover:brightness-110">
                    Lancer Q{displayIndex + 1}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Preview banner for non-standard views */}
        {isPreviewing && !(showStandardQA || isM1Positioning) && (
          <div className="flex-shrink-0 border-b border-white/[0.06] px-4 py-2">
            <div className="bg-bw-amber/10 border border-bw-amber/30 rounded-lg px-3 py-2 flex items-center gap-3">
              <span className="text-[11px] text-bw-amber">Aperçu Q{displayIndex + 1}</span>
              <div className="flex-1" />
              <button onClick={() => setPreviewIndex(null)}
                className="text-[10px] text-bw-muted hover:text-white cursor-pointer">Retour Q{currentQIndex + 1}</button>
              <button onClick={() => goToSituation(displayIndex)}
                className="text-[10px] px-2.5 py-1 bg-bw-amber text-black rounded-lg font-medium cursor-pointer hover:brightness-110">
                Lancer Q{displayIndex + 1}
              </button>
            </div>
          </div>
        )}

        {/* ── SPLIT-PANEL LAYOUT ── */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* LEFT: Plan de classe + séances (40%, desktop only) */}
          <div className="hidden lg:flex lg:w-[40%] flex-shrink-0 flex-col overflow-y-auto border-r border-white/[0.06]">
            {/* Module séances list */}
            {currentModuleLessons.length > 1 && (
              <div className="flex-shrink-0 px-3 pt-3 pb-2 border-b border-white/[0.06]">
                <p className="text-[9px] uppercase tracking-wider font-semibold text-bw-muted mb-1.5">Séances</p>
                <div className="flex flex-wrap gap-1">
                  {currentModuleLessons.map((lesson) => {
                    const isCurrent = lesson.dbSeance === (session.current_seance || 1);
                    const isPast = lesson.dbSeance < (session.current_seance || 1);
                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] transition-all ${
                          isCurrent
                            ? "font-medium border"
                            : isPast
                              ? "text-bw-muted"
                              : "text-bw-muted/60"
                        }`}
                        style={isCurrent ? { backgroundColor: `${moduleColor}15`, color: moduleColor, borderColor: `${moduleColor}30` } : undefined}
                      >
                        {isPast && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-bw-teal"><path d="M5 12l5 5L20 7"/></svg>}
                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: moduleColor }} />}
                        <span className="truncate">{lesson.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Classroom map */}
            <div className="flex-1 p-3 overflow-y-auto">
            <ClassroomMap
              students={studentStates.map((s) => {
                const raw = session.students?.find((st) => st.id === s.id);
                return { ...s, hand_raised_at: raw?.hand_raised_at, warnings: raw?.warnings || 0 };
              })}
              teams={teams}
              responses={responses}
              moduleResponseTexts={moduleResponseTexts}
              sessionStatus={session.status}
              onNudge={(responseId, text) => nudgeStudent.mutate({ responseId, nudgeText: text })}
              onWarn={(studentId) => warnStudent.mutate(studentId)}
              onBroadcast={() => setShowBroadcast(true)}
              onNudgeAllStuck={() => handleNudgeAllStuck()}
              onStudentClick={setFicheStudentId}
            />
            </div>
          </div>
          {/* RIGHT: Flux ou Fiche (60%) */}
          <div className="flex-1 overflow-y-auto min-h-0">
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
          <div className="px-4 pb-4 space-y-4">

          {/* ── CONTEXT ZONE — what the teacher needs to see ── */}
          <>

          {/* Standard Q&A: preview + nav now in header question bar */}

          {/* M1 Positioning: toolbar + option distribution (nav + guide now in header bar) */}
          {isM1Positioning && module1Data?.type === "positioning" && module1Data.questions && (
            <>
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Positionnement</span>
                  <span className={`text-sm font-bold tabular-nums px-2 py-0.5 rounded-lg ${
                    responses.length >= activeStudents.length ? "bg-green-500/15 text-green-400" : "bg-bw-teal/10 text-bw-teal"
                  }`}>{responses.length}/{activeStudents.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowBroadcast(true)} title="Message classe"
                    className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-primary hover:bg-bw-primary/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
                    📢
                  </button>
                  <button onClick={() => setShowExport(true)} title="Export"
                    className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-teal hover:bg-bw-teal/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
                    📋
                  </button>
                </div>
              </div>

              {/* Option distribution bars (current question only) */}
              {!isPreviewing && module1Data.questions[currentQIndex]?.options && (
                <div className="bg-bw-elevated rounded-xl border border-white/[0.08] p-4 space-y-3">
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
            </>
          )}

          {/* M1 Image: image display + single question + responses with highlight/confrontation */}
          {isM1Image && module1Data?.type === "image" && (
            <>
              {/* Toolbar — same style as other sections */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Image</span>
                  <span className={`text-sm font-bold tabular-nums px-2 py-0.5 rounded-lg ${
                    (module1Data.responsesCount || 0) >= activeStudents.length ? "bg-green-500/15 text-green-400" : "bg-bw-teal/10 text-bw-teal"
                  }`}>{module1Data.responsesCount || 0}/{activeStudents.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowBroadcast(true)} title="Message classe"
                    className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-primary hover:bg-bw-primary/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
                    📢
                  </button>
                  <button onClick={() => setShowExport(true)} title="Export"
                    className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-teal hover:bg-bw-teal/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
                    📋
                  </button>
                </div>
              </div>
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
                </div>
              )}
              {/* Responses are rendered by the unified ResponseStreamSection below */}
              {/* Quick phrases for image */}
              <QuickPhrases questionGuide={questionGuide} />
            </>
          )}

          {/* M1 Notebook: toolbar + consigne + responses */}
          {isM1Notebook && module1Data?.type === "notebook" && (
            <>
              {/* Toolbar — same style as other sections */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Carnet</span>
                  <span className={`text-sm font-bold tabular-nums px-2 py-0.5 rounded-lg ${
                    (module1Data.responsesCount || 0) >= activeStudents.length ? "bg-green-500/15 text-green-400" : "bg-bw-teal/10 text-bw-teal"
                  }`}>{module1Data.responsesCount || 0}/{activeStudents.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowBroadcast(true)} title="Message classe"
                    className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-primary hover:bg-bw-primary/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
                    📢
                  </button>
                  <button onClick={() => setShowExport(true)} title="Export"
                    className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-teal hover:bg-bw-teal/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
                    📋
                  </button>
                </div>
              </div>
              {/* Consigne */}
              {module1Data.question && (
                <div className="bg-bw-elevated rounded-xl border border-white/[0.08] p-4">
                  <p className="text-sm text-bw-heading leading-snug">{module1Data.question.text}</p>
                </div>
              )}
              {/* Notebooks are rendered by the unified ResponseStreamSection below */}
              {/* Quick phrases for notebook */}
              <QuickPhrases questionGuide={questionGuide} />
            </>
          )}

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
                  {/* Toolbar — same style as ResponseStreamSection */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Budgets</span>
                      <span className={`text-sm font-bold tabular-nums px-2 py-0.5 rounded-lg ${
                        budgetData.budgets.length >= activeStudents.length ? "bg-green-500/15 text-green-400" : "bg-bw-teal/10 text-bw-teal"
                      }`}>{budgetData.budgets.length}/{activeStudents.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="text" placeholder="Rechercher..." value={cardSearch}
                        onChange={(e) => setCardSearch(e.target.value)}
                        className="w-28 px-2 py-1 rounded-lg text-[10px] bg-bw-elevated border border-white/[0.06] text-bw-text placeholder:text-bw-muted/50 focus:outline-none focus:border-bw-teal/40"
                      />
                      <button onClick={() => setShowBroadcast(true)} title="Message classe"
                        className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-primary hover:bg-bw-primary/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
                        📢
                      </button>
                      <button onClick={() => setShowExport(true)} title="Export"
                        className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-teal hover:bg-bw-teal/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
                        📋
                      </button>
                    </div>
                  </div>
                  {budgetData.budgets.filter((b) => !cardSearch || (b.students?.display_name || "").toLowerCase().includes(cardSearch.toLowerCase())).map((b) => (
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

              {budgetSubmitted === 0 && (
                <div className="bg-bw-surface rounded-xl border border-white/[0.06] p-8 text-center space-y-2">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="text-3xl">💰</motion.div>
                  <p className="text-sm text-bw-muted">En attente des choix budgetaires...</p>
                </div>
              )}
              <QuickPhrases questionGuide={questionGuide} />
            </>
          )}

          {/* ── MODULE 10: Et si... + Pitch overview ── */}
          {showM10Special && (
            <>
              {/* Preview guide card */}
              {isPreviewing && (() => {
                const m10Label = isM10Etsi
                  ? (displayIndex === 0 ? "Et si..." : displayIndex === 1 ? "QCM narratif" : "Banque d'idées")
                  : (displayIndex === 0 ? "Création personnage" : displayIndex === 1 ? "Objectif + Obstacle" : displayIndex === 2 ? "Écriture pitch" : displayIndex === 3 ? "Test chrono" : "Confrontation");
                const m10Desc = isM10Etsi
                  ? (displayIndex === 0 ? "Les élèves imaginent un « Et si... » à partir d'une image et rédigent leur scénario alternatif." : displayIndex === 1 ? "QCM de direction narrative — les élèves choisissent parmi plusieurs orientations." : "Les élèves partagent leurs idées dans la banque collective et votent.")
                  : (displayIndex === 0 ? "Chaque élève crée son personnage avec avatar, traits et objectif." : displayIndex === 1 ? "Définir l'objectif principal et l'obstacle majeur du personnage." : displayIndex === 2 ? "Assembler les éléments en un pitch structuré." : displayIndex === 3 ? "60 secondes pour pitcher oralement." : "Les pitchs s'affrontent, la classe vote.");
                return <PreviewGuideCard label={m10Label} description={m10Desc} guide={previewGuide} position={displayIndex} />;
              })()}

              {/* Activity context — hidden when preview guide card is showing same info */}
              {!isPreviewing && (
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
                  <div className="bg-bw-elevated px-3 py-2 border-t border-white/[0.06]">
                    <p className="text-xs font-medium text-bw-teal">{module10Data.image.title}</p>
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
                        <p className="text-[10px] text-bw-teal font-bold uppercase mb-1">Pitch A — {module10Data.confrontation.pitchA.prenom}</p>
                        <p className="text-xs text-bw-text line-clamp-3">{module10Data.confrontation.pitchA.text}</p>
                      </div>
                      <div className="bg-bw-danger/10 rounded-xl p-3 border border-bw-danger/20">
                        <p className="text-[10px] text-bw-danger font-bold uppercase mb-1">Pitch B — {module10Data.confrontation.pitchB.prenom}</p>
                        <p className="text-xs text-bw-text line-clamp-3">{module10Data.confrontation.pitchB.text}</p>
                      </div>
                    </div>
                  )}
                  {/* Pitch picker for teacher */}
                  {module10Data.pitchList && module10Data.pitchList.length >= 2 && (
                    <div className="bg-bw-surface rounded-xl p-3 border border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-bw-muted uppercase font-semibold tracking-wider">Choisir les pitchs à confronter</span>
                        <span className="text-[10px] text-bw-muted">{selectedPitchIds.length}/2</span>
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
                                : "bg-bw-bg border-white/[0.06] text-bw-muted hover:border-bw-teal/20"
                            }`}>
                            <span className="font-medium">{isSelected ? (idx === 0 ? "A" : "B") + " — " : ""}{p.prenom}</span>
                            <span className="block text-[10px] text-bw-muted mt-0.5 line-clamp-1">{p.text}</span>
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
                <div className="bg-bw-surface rounded-xl p-3 border border-white/[0.06] space-y-1.5">
                  <p className="text-[10px] text-bw-muted uppercase font-semibold tracking-wider">💡 Banque d&apos;idées</p>
                  {module10Data.ideaBankItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      <span className="text-bw-teal font-medium tabular-nums">{item.votes}♥</span>
                      <span className="text-bw-text truncate">{item.text}</span>
                    </div>
                  ))}
                  {module10Data.ideaBankItems.length > 5 && (
                    <p className="text-[10px] text-bw-muted">+{module10Data.ideaBankItems.length - 5} autres</p>
                  )}
                </div>
              )}

              {/* All submissions list (facilitator view for M10 special positions) */}
              {module10Data?.allSubmissions && module10Data.allSubmissions.length > 0 && (
                <div className="space-y-1.5">
                  {/* Toolbar — same style as ResponseStreamSection */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Réponses</span>
                      <span className={`text-sm font-bold tabular-nums px-2 py-0.5 rounded-lg ${
                        module10Data.allSubmissions.length >= activeStudents.length ? "bg-green-500/15 text-green-400" : "bg-bw-teal/10 text-bw-teal"
                      }`}>{module10Data.allSubmissions.length}/{activeStudents.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="text" placeholder="Rechercher..." value={cardSearch}
                        onChange={(e) => setCardSearch(e.target.value)}
                        className="w-28 px-2 py-1 rounded-lg text-[10px] bg-bw-elevated border border-white/[0.06] text-bw-text placeholder:text-bw-muted/50 focus:outline-none focus:border-bw-teal/40"
                      />
                      <button onClick={() => setShowBroadcast(true)} title="Message classe"
                        className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-primary hover:bg-bw-primary/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
                        📢
                      </button>
                      <button onClick={() => setShowExport(true)} title="Export"
                        className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-teal hover:bg-bw-teal/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
                        📋
                      </button>
                    </div>
                  </div>
                  {module10Data.allSubmissions.filter((sub) => !cardSearch || (sub.studentName || "").toLowerCase().includes(cardSearch.toLowerCase()) || (sub.text || "").toLowerCase().includes(cardSearch.toLowerCase())).map((sub, i) => (
                    <motion.div key={sub.studentId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-bw-surface rounded-xl p-3 border border-white/[0.06] space-y-2">
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

              {/* Quick phrases for Module 10 special positions */}
              <QuickPhrases questionGuide={questionGuide} />
            </>
          )}

          {/* ── MODULE 10: Preview banner + Nav pills for all positions ── */}
          {showM10Special && (
            <>
              {isPreviewing && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-bw-amber/10 border border-bw-amber/30 rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xs text-bw-amber">Prévisualisation — les élèves ne voient pas ce changement</span>
                  <div className="flex-1" />
                  <button onClick={() => setPreviewIndex(null)}
                    className="text-xs text-bw-muted hover:text-white cursor-pointer transition-colors duration-200">Retour</button>
                  <button onClick={() => { goToSituation(displayIndex); }}
                    className="btn-glow text-xs px-3 py-1 bg-bw-amber text-black rounded-xl font-medium cursor-pointer transition-all duration-200 hover:brightness-110">
                    Lancer
                  </button>
                </motion.div>
              )}
              <div className="flex items-center gap-1.5 flex-wrap">
                {Array.from({ length: maxSituations }, (_, i) => {
                  const isCurrent = i === currentQIndex;
                  const isPreview = i === displayIndex;
                  const isPast = i < currentQIndex;
                  const specialLabel = isM10Etsi
                    ? (i === 0 ? "✨ Et si" : i === 1 ? "Q2" : "💡 Banque")
                    : (i === 0 ? "🎭 Perso" : i === 1 ? "🎯 Conflit" : i === 2 ? "📝 Pitch" : i === 3 ? "⏱️ Chrono" : "⚔️ Vote");
                  const specialTitle = isM10Etsi
                    ? (i === 0 ? "Image + écriture « Et si... »" : i === 1 ? "QCM direction narrative" : "Banque d'idées collective")
                    : (i === 0 ? "Création du personnage" : i === 1 ? "Objectif + Obstacle" : i === 2 ? "Écriture du pitch" : i === 3 ? "Test chrono 60s" : "Confrontation + Vote");
                  return (
                    <button key={i} onClick={() => previewSituation(i)} title={specialTitle}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 ${
                        isPreview && isPreviewing ? "bg-bw-amber text-black shadow-lg shadow-bw-amber/20 scale-110"
                          : isCurrent ? "bg-bw-pink text-white shadow-lg shadow-bw-pink/20"
                          : isPast ? "bg-bw-teal/15 text-bw-teal"
                          : "bg-bw-elevated text-bw-muted hover:text-bw-text hover:bg-bw-surface"
                      }`}>
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

          {/* ── MODULE 2 EC: Preview banner + Nav pills for special positions ── */}
          {(showM2ECSpecial || showM2ECComparison) && (
            <>
              {isPreviewing && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-bw-amber/10 border border-bw-amber/30 rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xs text-bw-amber">Prévisualisation — les élèves ne voient pas ce changement</span>
                  <div className="flex-1" />
                  <button onClick={() => setPreviewIndex(null)}
                    className="text-xs text-bw-muted hover:text-white cursor-pointer transition-colors duration-200">Retour</button>
                  <button onClick={() => { goToSituation(displayIndex); }}
                    className="btn-glow text-xs px-3 py-1 bg-bw-amber text-black rounded-xl font-medium cursor-pointer transition-all duration-200 hover:brightness-110">
                    Lancer
                  </button>
                </motion.div>
              )}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: maxSituations }, (_, i) => {
                  const isCurrent = i === currentQIndex;
                  const isPreview = i === displayIndex;
                  const isPast = i < currentQIndex;
                  const specialLabel = (seance === 1 && i === 0) ? "📋 Checklist"
                    : (seance === 2 && i === 1) ? "🎬 Scène"
                    : (seance === 3 && i === 0) ? "⚔️ Duel"
                    : `Q${i + 1}`;
                  const specialTitle = (seance === 1 && i === 0) ? "Checklist de contenus (3 min)"
                    : (seance === 2 && i === 1) ? "Construction de scène"
                    : (seance === 3 && i === 0) ? "Confrontation de scènes"
                    : `Question ${i + 1}`;
                  return (
                    <button key={i} onClick={() => previewSituation(i)} title={specialTitle}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 ${
                        isPreview && isPreviewing ? "bg-bw-amber text-black shadow-lg shadow-bw-amber/20 scale-110"
                          : isCurrent ? "bg-bw-pink text-white shadow-lg shadow-bw-pink/20"
                          : isPast ? "bg-bw-teal/15 text-bw-teal"
                          : "bg-bw-elevated text-bw-muted hover:text-bw-text hover:bg-bw-surface"
                      }`}>
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
            </>
          )}

          {/* ── MODULE 2 EC: Checklist cockpit ── */}
          {showM2ECChecklist && (
            <>
              {/* Preview guide card */}
              {isPreviewing && <PreviewGuideCard label="Checklist" description="Les élèves choisissent 3 contenus minimum parmi 20 oeuvres, puis sélectionnent celui qui les touche le plus." guide={previewGuide} position={displayIndex} />}

              {/* Toolbar — same style as ResponseStreamSection */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Checklists</span>
                  <span className={`text-sm font-bold tabular-nums px-2 py-0.5 rounded-lg ${
                    (module5Data?.submittedCount || 0) >= activeStudents.length ? "bg-green-500/15 text-green-400" : "bg-bw-teal/10 text-bw-teal"
                  }`}>{module5Data?.submittedCount || 0}/{activeStudents.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowBroadcast(true)} title="Message classe"
                    className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-primary hover:bg-bw-primary/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
                    📢
                  </button>
                  <button onClick={() => setShowExport(true)} title="Export"
                    className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-teal hover:bg-bw-teal/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
                    📋
                  </button>
                </div>
              </div>

              {/* What students are doing — hidden when preview guide shows same info */}
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
              <QuickPhrases questionGuide={questionGuide} />
            </>
          )}

          {/* ── MODULE 2 EC: Scene Builder cockpit ── */}
          {showM2ECSceneBuilder && (
            <>
              {/* Preview guide card */}
              {isPreviewing && <PreviewGuideCard label="Construction de scène" description="Chaque élève construit une scène autour de l'émotion choisie : intention, obstacle, changement + éléments de mise en scène." guide={previewGuide} position={displayIndex} />}

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
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-bw-bg border border-white/[0.06]">
                      <span>📦</span><span className="text-bw-text">{MAX_SLOTS} emplacements</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-bw-bg border border-white/[0.06]">
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
                  {/* Toolbar — same style as ResponseStreamSection */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Scènes</span>
                      <span className={`text-sm font-bold tabular-nums px-2 py-0.5 rounded-lg ${
                        scenesData.count >= activeStudents.length ? "bg-green-500/15 text-green-400" : "bg-bw-teal/10 text-bw-teal"
                      }`}>{scenesData.count}/{activeStudents.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="text" placeholder="Rechercher..." value={cardSearch}
                        onChange={(e) => setCardSearch(e.target.value)}
                        className="w-28 px-2 py-1 rounded-lg text-[10px] bg-bw-elevated border border-white/[0.06] text-bw-text placeholder:text-bw-muted/50 focus:outline-none focus:border-bw-teal/40"
                      />
                      <button onClick={() => setShowBroadcast(true)} title="Message classe"
                        className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-primary hover:bg-bw-primary/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
                        📢
                      </button>
                      <button onClick={() => setShowExport(true)} title="Export"
                        className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-teal hover:bg-bw-teal/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
                        📋
                      </button>
                    </div>
                  </div>
                  {scenesData.scenes.filter((sc) => !cardSearch || (sc.students?.display_name || "").toLowerCase().includes(cardSearch.toLowerCase()) || sc.intention?.toLowerCase().includes(cardSearch.toLowerCase()) || sc.obstacle?.toLowerCase().includes(cardSearch.toLowerCase())).map((sc, i) => {
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
                <div className="bg-bw-surface rounded-xl border border-white/[0.06] p-6 text-center space-y-2">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="text-2xl">🎬</motion.div>
                  <p className="text-sm text-bw-muted">En attente des scènes...</p>
                  <p className="text-xs text-bw-muted">{activeStudents.length} élève{activeStudents.length > 1 ? "s" : ""} connecté{activeStudents.length > 1 ? "s" : ""}</p>
                </div>
              )}
              <QuickPhrases questionGuide={questionGuide} />
            </>
          )}

          {/* ── MODULE 2 EC: Comparison cockpit (séance 3) ── */}
          {showM2ECComparison && (
            <>
              {/* Preview guide card */}
              {isPreviewing && <PreviewGuideCard label="Confrontation" description="Sélectionnez 2 scènes à projeter côte-à-côte. La classe compare les choix narratifs et les éléments de mise en scène." guide={previewGuide} position={displayIndex} />}

              {/* Toolbar — same style as ResponseStreamSection */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Confrontation</span>
                  <span className={`text-sm font-bold tabular-nums px-2 py-0.5 rounded-lg ${
                    (scenesData?.count || 0) >= activeStudents.length ? "bg-green-500/15 text-green-400" : "bg-bw-teal/10 text-bw-teal"
                  }`}>{scenesData?.count || 0}/{activeStudents.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="text" placeholder="Rechercher..." value={cardSearch}
                    onChange={(e) => setCardSearch(e.target.value)}
                    className="w-28 px-2 py-1 rounded-lg text-[10px] bg-bw-elevated border border-white/[0.06] text-bw-text placeholder:text-bw-muted/50 focus:outline-none focus:border-bw-teal/40"
                  />
                  <button onClick={() => setShowBroadcast(true)} title="Message classe"
                    className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-primary hover:bg-bw-primary/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
                    📢
                  </button>
                  <button onClick={() => setShowExport(true)} title="Export"
                    className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-teal hover:bg-bw-teal/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
                    📋
                  </button>
                </div>
              </div>

              {/* What students are doing — hidden when preview guide shows same info */}
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
                <div className="bg-bw-surface rounded-xl border border-white/[0.06] p-8 text-center space-y-2">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="text-3xl">⚔️</motion.div>
                  <p className="text-sm text-bw-muted">En attente des scènes des élèves...</p>
                </div>
              )}
              <QuickPhrases questionGuide={questionGuide} />
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
            <div className="bg-bw-surface rounded-xl border border-white/[0.06] p-4 text-center space-y-2">
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
          {!isStandardQA && !isM1Image && !isM1Notebook && !isM12Any && session.status !== "done" && responses.length > 0 && (
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
                      r.is_highlighted ? "border-bw-primary/30 shadow-[0_0_8px_rgba(255,107,53,0.1)]" : r.reset_at ? "border-bw-amber/20" : "border-white/[0.06]"
                    } ${r.is_hidden ? "opacity-30" : ""} ${r.reset_at ? "opacity-50" : ""}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-sm">{r.students?.avatar}</span>
                          <span className={`text-sm font-medium text-bw-text ${r.is_hidden ? "line-through" : ""}`}>{r.students?.display_name}</span>
                          {r.reset_at && (
                            <span className="text-[9px] px-1.5 py-px rounded-full bg-bw-amber/15 text-bw-amber border border-bw-amber/20">relancé</span>
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

          {/* M1/Budget empty state */}
          {!isStandardQA && !isM1Image && !isM1Notebook && !isM12Any && session.status === "responding" && responses.length === 0 && !isBudgetQuiz && !isM2ECChecklist && !isM2ECSceneBuilder && !isM2ECComparison && (
            <div className="bg-bw-surface rounded-xl border border-white/[0.06] p-5 text-center space-y-2">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                className="text-2xl">✍️</motion.div>
              <p className="text-sm text-bw-muted">En attente des reponses...</p>
            </div>
          )}

          {/* Choices history (Standard Q&A) */}
          {!focusMode && isStandardQA && collectiveChoices.length > 0 && (
            <ChoicesHistory choices={collectiveChoices} />
          )}

          </>
        </div>
        )}
        </div>
        </div>
      </main>

      {/* ── COMPACT FOOTER — progress bar + CTA + toggles ── */}
      {session.status !== "done" && session.status !== "paused" && (
        <div className="flex-shrink-0 glass border-t border-white/[0.08]">
          {/* Progress bar with label */}
          {session.status === "responding" && activeStudents.length > 0 && (() => {
            const pct = Math.round((respondedCount / activeStudents.length) * 100);
            const allDone = respondedCount >= activeStudents.length;
            return (
              <div className="relative h-1.5 w-full bg-white/[0.04]">
                <motion.div
                  className={`h-full ${allDone ? "bg-gradient-to-r from-bw-teal to-bw-green" : "bg-bw-teal"}`}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={allDone ? { boxShadow: "0 0 8px rgba(78,205,196,0.4)" } : undefined}
                />
                <span className="absolute right-2 -top-4 text-[9px] tabular-nums font-mono text-bw-muted">
                  {respondedCount}/{activeStudents.length} ({pct}%)
                </span>
              </div>
            );
          })()}
          <div className="px-4 py-2 flex items-center gap-2">
            {/* Back button for non-QA modules */}
            {!isStandardQA && (session.current_situation_index || 0) > 0 && (
              <button
                onClick={prevSituation}
                disabled={updateSession.isPending}
                title="Question précédente"
                className="px-2.5 py-2 rounded-lg text-sm text-bw-muted hover:text-white bg-bw-elevated border border-white/[0.06] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
            )}

            {/* Main CTA */}
            <div className="flex-1 min-w-0">
              {session.status === "waiting" ? (
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (isPreviewing) {
                      setPreviewIndex(null);
                      updateSession.mutate({ current_situation_index: displayIndex, status: "responding", timer_ends_at: null });
                    } else {
                      updateSession.mutate({ status: "responding", timer_ends_at: null });
                    }
                  }}
                  disabled={updateSession.isPending}
                  className={`w-full py-2 px-6 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-300 disabled:opacity-50 text-white ${
                    isPreviewing ? "bg-bw-amber btn-glow-amber" : "bg-bw-teal btn-glow-teal"
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
                  onQuickVote={handleQuickVote}
                  actionDisabled={
                    (session.status === "responding" && voteOptionCount < 2) ||
                    (session.status === "voting" && (!voteData || voteData.totalVotes === 0))
                  }
                  isPending={updateSession.isPending}
                  pulse={allResponded}
                />
              ) : nextAction ? (
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={handleNextAction}
                  disabled={updateSession.isPending || !!(nextAction as { disabled?: boolean }).disabled}
                  className="btn-glow w-full py-2 rounded-lg font-bold text-sm cursor-pointer transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  style={{ backgroundColor: nextAction.color, color: nextAction.color === "#F59E0B" || nextAction.color === "#888" ? "black" : "white" }}>
                  {nextAction.label} {nextAction.shortcut && <span className="opacity-60 ml-1 text-[10px]">[{nextAction.shortcut}]</span>}
                </motion.button>
              ) : (
                <div className="w-full py-2 rounded-lg text-sm text-center bg-bw-elevated text-bw-muted border border-white/[0.06]">
                  {session.status === "responding"
                    ? `En attente... (${respondedCount}/${activeStudents.length})`
                    : session.status === "voting"
                      ? `Vote en cours... (${voteData?.totalVotes || 0} votes)`
                      : "En attente..."}
                </div>
              )}
            </div>

            {/* Skip button for non-QA */}
            {!isStandardQA && canGoNext && session.status === "responding" && (
              <button
                onClick={skipSituation}
                disabled={updateSession.isPending}
                title="Passer cette question"
                className="px-2.5 py-2 rounded-lg text-sm text-bw-muted hover:text-white bg-bw-elevated border border-white/[0.06] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            )}

            {/* Compact toggles */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setFocusMode(f => !f)}
                title={focusMode ? "Quitter le mode focus" : "Mode focus (F)"}
                className={`p-1.5 rounded-lg text-[10px] transition-all cursor-pointer ${
                  focusMode ? "bg-bw-violet/20 text-bw-violet" : "text-bw-muted hover:text-white hover:bg-white/5"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="10" /></svg>
              </button>
              <button
                onClick={() => updateSession.mutate({ sharing_enabled: !session.sharing_enabled })}
                title={session.sharing_enabled ? "Partage activé" : "Partage désactivé"}
                className={`p-1.5 rounded-lg text-[10px] transition-all cursor-pointer ${
                  session.sharing_enabled ? "bg-bw-teal/20 text-bw-teal" : "text-bw-muted hover:text-white hover:bg-white/5"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              </button>
              <button
                onClick={() => updateSession.mutate({ mute_sounds: !session.mute_sounds })}
                title={session.mute_sounds ? "Sons désactivés" : "Sons activés"}
                className={`p-1.5 rounded-lg text-[10px] transition-all cursor-pointer ${
                  session.mute_sounds ? "text-bw-muted hover:text-white hover:bg-white/5" : "bg-bw-amber/15 text-bw-amber"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{session.mute_sounds ? <><path d="M11 5L6 9H2v6h4l5 4z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></> : <><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></>}</svg>
              </button>
              <button
                onClick={() => setShowShortcuts(true)}
                title="Raccourcis clavier (?)"
                className="p-1.5 rounded-lg text-[10px] text-bw-muted hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/></svg>
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
                <div className="flex items-center gap-3 flex-wrap text-[10px] text-bw-muted">
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
                          {s.warnings > 0 && <span className="text-[10px] text-bw-amber">⚠️ {s.warnings}</span>}
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
        moduleView={moduleView}
        onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        onCopyCode={copyCode}
        onToggleQR={() => setShowQR(!showQR)}
        onOpenScreen={() => window.open(`/session/${sessionId}/screen`, "_blank")}
        onTogglePause={() => updateSession.mutate({ status: session.status === "paused" ? "waiting" : "paused" })}
        onClearTimer={() => updateSession.mutate({ timer_ends_at: null })}
        onToggleStudents={() => setShowStudents(!showStudents)}
        showStudents={showStudents}
        currentQuestionIndex={hasActiveModule ? currentQuestionIndex : undefined}
        totalQuestions={hasActiveModule ? totalQuestions : undefined}
        onBroadcast={() => {
          // Broadcast is handled in CockpitContent, but we still expose a top-bar shortcut
          // It dispatches a custom event that CockpitContent listens to
          window.dispatchEvent(new CustomEvent("pilot-broadcast"));
        }}
        onShortcuts={() => window.dispatchEvent(new CustomEvent("pilot-shortcuts"))}
        muteSounds={session.mute_sounds ?? false}
        onToggleMute={() => updateSession.mutate({ mute_sounds: !session.mute_sounds })}
        onTimerExpired={() => {
          playSound("drumroll");
          toast("Temps ecoulé !", { icon: "⏰" });
        }}
        onOpenMobileContext={() => setMobileContextOpen(true)}
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
        {/* Floating module dock (fixed, not in flex layout) */}
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
              className="fixed right-0 top-0 bottom-0 z-50 w-[320px] max-w-[85vw] bg-bw-bg border-l border-white/[0.06] overflow-y-auto lg:hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <span className="text-sm font-semibold">Contexte</span>
                <button onClick={() => setMobileContextOpen(false)} className="text-bw-muted hover:text-white cursor-pointer text-sm">✕</button>
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

      <HelpButton pageKey="pilot" tips={[
        { title: "Pilotez la session", description: "Utilisez le bouton central pour avancer les questions. Les eleves recoivent la question en temps reel." },
        { title: "Retour et Passer", description: "Les fleches a cote du bouton principal permettent de revenir en arriere ou de passer une question." },
        { title: "Panneau lateral", description: "Le panneau droit affiche le guide pedagogique et les reponses des eleves. Cliquez sur une reponse pour la mettre en avant." },
        { title: "Diffusion et Timer", description: "Envoyez un message a toute la classe ou lancez un compte a rebours depuis la barre du haut." },
      ]} />
    </div>
  );
}
