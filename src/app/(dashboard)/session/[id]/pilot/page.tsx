"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeInvalidation } from "@/hooks/use-realtime-invalidation";
import { usePilotSession } from "@/hooks/use-pilot-session";
import { useConfirmAction } from "@/hooks/use-confirm-action";
import { useUndoStack } from "@/hooks/use-undo-stack";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { logAudit } from "@/lib/audit-log";
import { useQueryClient } from "@tanstack/react-query";
import { getSeanceMax } from "@/lib/constants";
import dynamic from "next/dynamic";
import { getModuleGuide, getQuestionGuide, type QuestionGuide } from "@/lib/guide-data";

const QRCodeSVG = dynamic(() => import("qrcode.react").then((mod) => ({ default: mod.QRCodeSVG })), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-white/5 rounded animate-pulse" />,
});
import { MODULES, PHASES, getModuleByDb, getPhaseForModule } from "@/lib/modules-data";
import type { StudentState } from "@/components/pilot/pulse-ring";
import { useSound } from "@/hooks/use-sound";
import { ErrorBoundary } from "@/components/error-boundary";
import { ConfirmModal } from "@/components/confirm-modal";
import { ModuleSidebar, SidebarDrawer } from "@/components/pilot/module-sidebar";
import { WelcomePanel } from "@/components/pilot/welcome-panel";
import { ModuleBriefing } from "@/components/pilot/module-briefing";
import { ContextPanel } from "@/components/pilot/teacher-docks";
import { getNextAction, type NextAction } from "@/lib/cockpit-next-action";
const TeamManager = dynamic(() => import("@/components/pilot/team-manager").then((m) => ({ default: m.TeamManager })), {
  ssr: false,
});
import { ROUTES } from "@/lib/routes";
import { CockpitProvider, useCockpit } from "@/components/pilot/cockpit-context";
import { CommandPalette } from "@/components/pilot/command-palette";
const CommandCockpit = dynamic(
  () => import("@/components/pilot/command/command-cockpit").then((m) => ({ default: m.CommandCockpit })),
  { ssr: false },
);

import type { Session, Student, Response } from "@/hooks/use-pilot-session";

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
  const [cmdOpen, setCmdOpen] = useState(false);
  const [pendingModuleSwitch, setPendingModuleSwitch] = useState<{ moduleId: string; isQuickLaunch: boolean } | null>(
    null,
  );
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
  const effectiveConnectionStatus = !isOnline ? ("disconnected" as const) : connectionStatus;

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push(ROUTES.login);
        return;
      }
      setActorId(user.id);
      setCheckingAuth(false);
    }
    check();
  }, [router]);

  // ⌘K shortcut for command palette
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // ── All queries + mutations extracted to usePilotSession ──
  const {
    session,
    sessionLoading,
    teams,
    situationData,
    situation,
    responses,
    voteData,
    collectiveChoices,
    activeModule,
    hasActiveModule,
    updateSession,
    removeStudent,
    validateChoice,
    toggleHide,
    toggleVoteOption,
    commentResponse,
    highlightResponse,
    nudgeStudent,
    warnStudent,
    toggleStudentActive,
    lowerHand,
    scoreResponse,
    aiEvaluate,
    resetResponse,
    resetAllResponses,
  } = usePilotSession(sessionId, checkingAuth, actorId, effectiveConnectionStatus);

  // Undo-aware wrappers for reversible mutations (#13)
  const undoableToggleHide = useMemo(
    () => ({
      ...toggleHide,
      mutate: (args: { responseId: string; is_hidden: boolean }) => {
        undoStack.push({
          label: args.is_hidden ? "Réponse masquée" : "Réponse affichée",
          undo: () => toggleHide.mutate({ responseId: args.responseId, is_hidden: !args.is_hidden }),
          redo: () => toggleHide.mutate(args),
        });
        toggleHide.mutate(args);
      },
    }),
    [toggleHide, undoStack],
  );

  const undoableHighlight = useMemo(
    () => ({
      ...highlightResponse,
      mutate: (args: { responseId: string; highlighted: boolean }) => {
        undoStack.push({
          label: args.highlighted ? "Réponse projetée" : "Projection retirée",
          undo: () => highlightResponse.mutate({ responseId: args.responseId, highlighted: !args.highlighted }),
          redo: () => highlightResponse.mutate(args),
        });
        highlightResponse.mutate(args);
      },
    }),
    [highlightResponse, undoStack],
  );

  const undoableToggleVote = useMemo(
    () => ({
      ...toggleVoteOption,
      mutate: (args: { responseId: string; is_vote_option: boolean }) => {
        undoStack.push({
          label: args.is_vote_option ? "Option de vote ajoutée" : "Option de vote retirée",
          undo: () => toggleVoteOption.mutate({ responseId: args.responseId, is_vote_option: !args.is_vote_option }),
          redo: () => toggleVoteOption.mutate(args),
        });
        toggleVoteOption.mutate(args);
      },
    }),
    [toggleVoteOption, undoStack],
  );

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

    const isAlreadyCurrent =
      session && session.current_module === mod.dbModule && (session.current_seance || 1) === mod.dbSeance;

    if (!isAlreadyCurrent) {
      markCurrentModuleCompleted();
      updateSession.mutate({
        current_module: mod.dbModule,
        current_seance: mod.dbSeance,
        current_situation_index: 0,
        status: "responding",
      });
      logAudit({
        action: "module_switch",
        actor: actorId,
        sessionId,
        details: { moduleId, dbModule: mod.dbModule, dbSeance: mod.dbSeance },
      });
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
      const maxSit =
        session.current_module === 1 && s === 1
          ? 8
          : session.current_module === 1 && s >= 2
            ? 1
            : session.current_module === 4
              ? 8
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
      })
        .then((res) => {
          if (res.ok) toast.success("Cartes collect\u00E9es pour la Construction Collective");
        })
        .catch(() => {
          /* pools can be generated manually from M12 */
        });
    }
    // Reset status so the sidebar shows completion, but don't change view
    updateSession.mutate({ status: "waiting", current_situation_index: 0 });
  }

  // Question counter for top bar
  const questionCounter = useMemo(() => {
    if (!session || !activeModule) return null;
    const isM1Pos = session.current_module === 1 && (session.current_seance || 1) === 1;
    const isM1Image =
      session.current_module === 1 && (session.current_seance || 1) >= 2 && (session.current_seance || 1) <= 4;
    const isM1Notebook = session.current_module === 1 && (session.current_seance || 1) === 5;
    if (isM1Image || isM1Notebook) return null;
    const s = session.current_seance || 1;
    const maxSit = isM1Pos ? 8 : session.current_module === 4 ? 8 : getSeanceMax(session.current_module, s);
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
  const currentQuestionIndex = session?.current_situation_index || 0;
  const totalQuestions = useMemo(() => {
    if (!session || !activeModule) return 0;
    const isM1Pos = session.current_module === 1 && (session.current_seance || 1) === 1;
    const isM1Image =
      session.current_module === 1 && (session.current_seance || 1) >= 2 && (session.current_seance || 1) <= 4;
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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-bw-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bw-bg">
        <div className="text-center space-y-3">
          <p className="text-bw-muted">Session introuvable</p>
          <button
            onClick={() => router.push(ROUTES.legacyDashboard)}
            className="text-bw-primary text-sm cursor-pointer"
          >
            ← Dashboard
          </button>
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
                <p className="text-xs text-bw-muted">
                  ou vont sur <span className="text-bw-primary">banlieuwood.app/join</span>
                </p>
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
            onSelectModule={(id) => {
              handleSelectModule(id);
              setSidebarOpen(false);
            }}
            onQuickLaunch={(id) => {
              handleQuickLaunchModule(id);
              setSidebarOpen(false);
            }}
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
              isInProgress={!!session && !!activeModule && activeModule.id === selectedModuleId}
              isCompleted={session.completed_modules?.includes(selectedModuleId) || false}
              sessionId={sessionId}
              onLaunch={handleLaunchModule}
              onResume={handleResumeModule}
            />
          ) : hasActiveModule ? (
            <ErrorBoundary>
              <CockpitProvider
                value={{
                  session,
                  sessionId,
                  responses,
                  activeStudents,
                  voteData,
                  collectiveChoices,
                  situationData,
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
                  onSelectStudent: (s) => {
                    setSelectedStudentId(s.id);
                    setShowStudents(false);
                  },
                  onOpenModules: () => setSidebarOpen(!sidebarOpen),
                  onOpenScreen: () => window.open(ROUTES.screen(sessionId), "_blank"),
                  studentWarnings: Object.fromEntries((session.students || []).map((s) => [s.id, s.warnings || 0])),
                }}
              >
                <CommandCockpit />
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
                <TeamManager sessionId={sessionId} teams={teams || []} students={activeStudents} />
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
                <button
                  onClick={() => setMobileContextOpen(false)}
                  className="text-bw-muted hover:text-bw-heading cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>
              <ContextPanel
                moduleGuide={activeModule ? getModuleGuide(activeModule.id) : undefined}
                questionGuide={
                  session &&
                  activeModule &&
                  (session.current_module === 3 ||
                    session.current_module === 4 ||
                    session.current_module === 9 ||
                    session.current_module === 2 ||
                    session.current_module === 10)
                    ? getQuestionGuide(
                        session.current_seance || 1,
                        (session.current_situation_index || 0) + 1,
                        session.current_module,
                      )
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

      {/* Command Palette ⌘K */}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        sessionOn={session?.status === "responding" || session?.status === "voting"}
        onToggleSession={() => {
          if (session?.status === "responding") updateSession.mutate({ status: "paused" });
          else updateSession.mutate({ status: "responding" });
        }}
        onEndSession={() => updateSession.mutate({ status: "done" })}
        onToggleDarkMode={() => {}}
        isDarkMode={false}
        onOpenStudents={() => setShowStudents(true)}
        onOpenModules={() => setSidebarOpen(true)}
      />
    </div>
  );
}
