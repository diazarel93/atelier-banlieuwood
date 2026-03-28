"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useFocusCockpitState } from "@/hooks/use-focus-cockpit-state";
import { useCockpitActions, useCockpitData } from "@/components/pilot/cockpit-context";
import { RemoteControlView } from "./remote-control-view";
import { usePilotKeyboardShortcuts } from "@/hooks/use-pilot-keyboard-shortcuts";
import { TIMER_PRESETS } from "@/components/pilot/pilot-settings";
import dynamic from "next/dynamic";
import { ROUTES } from "@/lib/routes";
import { FacilitatorFeedbackForm } from "@/components/pilot/facilitator-feedback-form";
import { FocusHeader } from "./focus-header";

const StudentFiche = dynamic(
  () => import("@/components/pilot/student-fiche").then((m) => ({ default: m.StudentFiche })),
  { ssr: false },
);
import { FocusQuestionCard } from "./focus-question-card";
import { FocusModuleContent } from "./focus-module-content";
import { PlusMenuContent } from "./plus-menu-content";
import { BottomSheet } from "./bottom-sheet";
import { CockpitModals } from "@/components/pilot/cockpit-modals";
import { VotingResults } from "@/components/pilot/voting-results";
import { InlineReformulation } from "@/components/pilot/inline-reformulation";
import { getModuleByDb } from "@/lib/modules-data";
import { V6ControlPanels } from "@/components/pilot/v6-control-panels";
import { V6VoteControls } from "@/components/pilot/v6-vote-controls";
import { V6ActivityFeed, type ActivityItem } from "@/components/pilot/v6-activity-feed";
import { useStuckDetection } from "@/hooks/use-stuck-detection";
import type { ResponseCardResponse } from "@/components/pilot/response-card";
import type { Response } from "@/hooks/use-pilot-session";

export function FocusCockpit() {
  const [remoteMode, setRemoteMode] = useState(false);
  const state = useFocusCockpitState();
  const {
    session,
    sessionId,
    responses,
    activeStudents,
    voteData,
    situation,
    visibleResponses,
    voteOptionCount,
    currentQIndex,
    respondedCount,
    nextAction,
    moduleFlags,
    moduleLabel,
    moduleColor,
    questionGuide,
    filteredResponses,
    isPreviewing,
    displayIndex,
    stuckStudents,
    notRespondedStudents,
    universalQuestionText,
    universalCategoryLabel,
    unifiedRespondedCount,
    isStandardQA,
    winnerResponseId,
    allResponded,
    respondingOpenedAt,
    broadcastHistory,
    previewIndex,
    setPreviewIndex,
    autoAdvance,
    setAutoAdvance,
    autoAdvanceCountdown,
    plusOpen,
    setPlusOpen,
    showStudentSheet,
    setShowStudentSheet,
    selectedResponseIds,
    setSelectedResponseIds,
    responseFilter,
    setResponseFilter,
    responseSortMode,
    setResponseSortMode,
    reformulating,
    setReformulating,
    isDarkMode,
    setIsDarkMode,
    modals,
    budgetSubmitted,
    goToSituation,
    handleNextAction,
    handleSelectionBarAction,
    handleQuickVote,
    handleBroadcast,
    handleNudgeAllStuck,
    handleHighlightAllVisible,
    handleClearAllHighlights,
    handleHighlightBoth,
  } = state;

  const {
    updateSession,
    validateChoice,
    toggleHide,
    aiEvaluate,
    onSelectStudent,
    toggleVoteOption,
    commentResponse,
    highlightResponse,
    scoreResponse,
    resetResponse,
    nudgeStudent,
    warnStudent,
    toggleStudentActive,
    onModuleSelect,
  } = useCockpitActions();

  const { studentWarnings } = useCockpitData();

  // ── Plan de classe (collapsible in center) ──
  const [showPlan, setShowPlan] = useState(false);
  const activeStudentIds = useMemo(() => new Set(activeStudents.map((s) => s.id)), [activeStudents]);
  const stuckLevels = useStuckDetection({
    respondedStudentIds: state.respondedStudentIds,
    activeStudentIds,
    respondingOpenedAt: session.status === "responding" ? respondingOpenedAt : null,
  });

  // V6: miniStudentStates removed — classroom plan is in V6Sidebar

  // ── Student fiche slide-over ──
  const [ficheStudentId, setFicheStudentId] = useState<string | null>(null);
  const handleSelectStudent = useCallback(
    (s: { id: string }) => {
      setFicheStudentId(s.id);
      setShowStudentSheet(false);
    },
    [setShowStudentSheet],
  );

  // Listen for student selection from sidebar (CommandCockpit dispatches this)
  useEffect(() => {
    function onSelect(e: Event) {
      const detail = (e as CustomEvent<{ studentId: string }>).detail;
      if (detail?.studentId) setFicheStudentId(detail.studentId);
    }
    window.addEventListener("pilot-select-student", onSelect);
    return () => window.removeEventListener("pilot-select-student", onSelect);
  }, []);

  // ── Keyboard shortcuts ──
  const handlePauseToggle = useCallback(() => {
    if (session.status === "paused") updateSession.mutate({ status: "waiting" });
    else if (session.status !== "done") updateSession.mutate({ status: "paused" });
  }, [session.status, updateSession]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleNextActionCb = useCallback(() => handleNextAction(), [nextAction, moduleFlags.canGoNext, updateSession]);

  const [timerMode, setTimerMode] = useState(false);

  const handleSetTimerPreset = useCallback(
    (n: number) => {
      const seconds = TIMER_PRESETS[n - 1];
      if (!seconds) return;
      const endsAt = new Date(Date.now() + seconds * 1000).toISOString();
      updateSession.mutate({ timer_ends_at: endsAt });
      toast.success(`Timer ${seconds >= 60 ? `${seconds / 60}min` : `${seconds}s`} lancé`);
      setTimerMode(false);
    },
    [updateSession],
  );

  usePilotKeyboardShortcuts({
    sessionStatus: session.status,
    responsesCount: responses.length,
    onPauseToggle: handlePauseToggle,
    onShowBroadcast: modals.openBroadcast,
    onShowExport: useCallback(() => modals.setShowExport(true), [modals]),
    onShowCompare: useCallback(() => modals.setShowCompare(true), [modals]),
    onToggleShortcuts: useCallback(() => modals.setShowShortcuts((v: boolean) => !v), [modals]),
    onCloseAll: modals.closeAllModals,
    onNextAction: handleNextActionCb,
    onToggleFocus: useCallback(() => {}, []), // already in focus mode
    onToggleIntervention: useCallback(() => {
      toast("Mode intervention (bientôt)", { icon: "🖐️" });
    }, []),
    onTimerShortcut: useCallback(() => {
      setTimerMode((v) => {
        if (!v) toast("Timer : appuyez 1-5 pour choisir", { icon: "⏱️", duration: 2000 });
        return !v;
      });
    }, []),
    onSetTimerPreset: handleSetTimerPreset,
    timerModeActive: timerMode,
  });

  // Highlight all visible handler for response stream
  function handleHideAllVisible() {
    const toHide = responses.filter((r) => !r.is_hidden);
    for (const r of toHide) toggleHide.mutate({ responseId: r.id, is_hidden: true });
    toast.success(`${toHide.length} réponse${toHide.length > 1 ? "s" : ""} masquée${toHide.length > 1 ? "s" : ""}`);
  }

  // Student list for bottom sheet
  const studentList = (session.students || []).filter((s) => s.is_active && !s.kicked);

  const highlightedCount = responses.filter((r) => r.is_highlighted).length;

  // Timer handlers for plus menu
  function handleSetTimer(seconds: number) {
    const endsAt = new Date(Date.now() + seconds * 1000).toISOString();
    updateSession.mutate({ timer_ends_at: endsAt });
    toast.success(`Timer ${seconds}s lancé`);
  }

  function handleClearTimer() {
    updateSession.mutate({ timer_ends_at: null });
    toast.success("Timer arrêté");
  }

  // Screen control handlers
  const broadcastMsg = (session as unknown as Record<string, unknown>).broadcast_message as string | null | undefined;
  const currentScreenMode =
    typeof broadcastMsg === "string" && broadcastMsg.startsWith("__SCREEN_MODE:")
      ? broadcastMsg.replace("__SCREEN_MODE:", "")
      : "vote";
  const screenFrozen = broadcastMsg === "__SCREEN_FROZEN";

  function handleSetScreenMode(mode: string) {
    updateSession.mutate({ broadcast_message: `__SCREEN_MODE:${mode}`, broadcast_at: new Date().toISOString() });
    const labels: Record<string, string> = {
      default: "Question",
      responses: "Réponses",
      wordcloud: "Nuage de mots",
      blank: "Écran noir",
    };
    toast.success(`Écran : ${labels[mode] || mode}`);
  }

  function handleToggleFreeze() {
    if (screenFrozen) {
      updateSession.mutate({ broadcast_message: null, broadcast_at: null });
      toast.success("Écran dégelé");
    } else {
      updateSession.mutate({ broadcast_message: "__SCREEN_FROZEN", broadcast_at: new Date().toISOString() });
      toast.success("Écran gelé");
    }
  }

  // ── Remote Control Mode ──
  if (remoteMode) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0c0c18] relative">
        <RemoteControlView
          questionText={universalQuestionText}
          respondedCount={unifiedRespondedCount}
          onOpenBroadcast={modals.openBroadcast}
          onNextAction={handleNextAction}
          onQuickVote={handleQuickVote}
          onExit={() => setRemoteMode(false)}
        />
        <CockpitModals
          spotlightResponse={modals.spotlightResponse}
          setSpotlightResponse={modals.setSpotlightResponse}
          showWordCloud={modals.showWordCloud}
          setShowWordCloud={modals.setShowWordCloud}
          showDebate={modals.showDebate}
          setShowDebate={modals.setShowDebate}
          showBroadcast={modals.showBroadcast}
          setShowBroadcast={modals.setShowBroadcast}
          handleBroadcast={handleBroadcast}
          broadcastHistory={broadcastHistory}
          broadcastPrefill={modals.broadcastPrefill}
          broadcastTitle={modals.broadcastTitle}
          broadcastIcon={modals.broadcastIcon}
          updateSessionPending={updateSession.isPending}
          showCompare={modals.showCompare}
          setShowCompare={modals.setShowCompare}
          handleHighlightBoth={handleHighlightBoth}
          handleClearAllHighlights={handleClearAllHighlights}
          showExport={modals.showExport}
          setShowExport={modals.setShowExport}
          sessionTitle={session.title || "Session"}
          level={session.level || ""}
          moduleLabel={moduleLabel}
          questionPrompt={situation?.prompt || ""}
          activeStudentCount={activeStudents.length}
          sessionId={sessionId}
          showShortcuts={modals.showShortcuts}
          setShowShortcuts={modals.setShowShortcuts}
          kickTarget={modals.kickTarget}
          setKickTarget={modals.setKickTarget}
          responses={responses}
          visibleResponses={visibleResponses}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0c0c18] text-[#f0f0f8]">
      {/* ── HEADER ── */}
      <FocusHeader
        sessionId={sessionId}
        sessionTitle={session.title || "Session"}
        moduleLabel={moduleLabel}
        moduleColor={moduleColor}
        currentQIndex={currentQIndex}
        maxSituations={moduleFlags.maxSituations}
        respondingOpenedAt={respondingOpenedAt}
        activeStudentCount={activeStudents.length}
        respondedCount={respondedCount}
        totalStudents={session.students?.length || 0}
        sessionStatus={session.status}
        timerEndsAt={session.timer_ends_at}
        currentScreenMode={currentScreenMode}
        onOpenStudents={() => setShowStudentSheet(true)}
        activeModuleId={
          session.current_module ? getModuleByDb(session.current_module, session.current_seance || 1)?.id || null : null
        }
        completedModuleIds={session.completed_modules || []}
        onModuleSelect={(moduleId) => onModuleSelect?.(moduleId)}
      />

      {/* ── V6 SCROLLABLE CENTER ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5 space-y-4">
          {/* ═══ MODULE SECTION CARD ═══ */}
          <section className="rounded-2xl border border-[#2a2a50] bg-[#161633] overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1" style={{ background: `linear-gradient(90deg, ${moduleColor}, ${moduleColor}66)` }} />

            {/* Module header */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: moduleColor }}>
                  Phase — Q{currentQIndex + 1}/{moduleFlags.maxSituations}
                </div>
              </div>
              <h1 className="text-lg font-extrabold text-[#f0f0f8] mb-1">{moduleLabel}</h1>

              {/* Progress bar */}
              {session.status === "responding" && activeStudents.length > 0 && (
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[11px] font-semibold text-[#64748b]">
                    {unifiedRespondedCount}/{activeStudents.length} ont repondu
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-[#1a1a35] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: moduleColor }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(unifiedRespondedCount / activeStudents.length) * 100}%`,
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Question card inside module section */}
            <div className="px-5 pb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`q-${currentQIndex}-${isPreviewing ? "preview" : "live"}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <FocusQuestionCard
                    questionText={universalQuestionText}
                    categoryLabel={universalCategoryLabel}
                    currentIndex={displayIndex}
                    maxSituations={moduleFlags.maxSituations}
                    isPreviewing={isPreviewing}
                    onPrev={() => {
                      const idx = displayIndex;
                      if (idx > 0) setPreviewIndex(idx - 1);
                    }}
                    onNext={() => {
                      const idx = displayIndex;
                      if (idx < moduleFlags.maxSituations - 1) setPreviewIndex(idx + 1);
                    }}
                    allSituations={state.allSituations}
                    liveIndex={currentQIndex}
                    onGoToSituation={(i) => {
                      if (i === currentQIndex) {
                        setPreviewIndex(null);
                      } else {
                        setPreviewIndex(i);
                      }
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Module-specific content inside card */}
            <div className="px-5 pb-5">
              <FocusModuleContent isPreviewing={isPreviewing} currentQIndex={currentQIndex} />
            </div>
          </section>

          {/* Empty states */}
          <div className="space-y-4">
            {/* Plan de classe removed — V6 uses sidebar for student overview */}

            {/* V6: Vote results (kept — shows vote bars) */}
            {isStandardQA &&
              (session.status === "voting" || session.status === "reviewing") &&
              voteData &&
              voteData.results.length > 0 && (
                <VotingResults
                  voteData={voteData}
                  sessionStatus={session.status}
                  onValidateWinner={(responseId, text, students) => {
                    const fakeResponse = {
                      id: responseId,
                      student_id: "",
                      situation_id: "",
                      text,
                      submitted_at: "",
                      is_hidden: false,
                      is_vote_option: true,
                      is_highlighted: false,
                      teacher_comment: null,
                      students,
                    } as Response;
                    setReformulating(fakeResponse);
                  }}
                />
              )}

            {/* V6: Inline reformulation */}
            <AnimatePresence>
              {reformulating && (
                <InlineReformulation
                  response={reformulating as ResponseCardResponse}
                  onValidate={(text) => {
                    validateChoice.mutate({ response: reformulating, text });
                  }}
                  onCancel={() => setReformulating(null)}
                  isPending={validateChoice.isPending}
                />
              )}
            </AnimatePresence>

            {/* Not responded — now shown in V6 sidebar Eleves tab */}

            {/* Done state — session recap */}
            {session.status === "done" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Hero */}
                <div className="text-center py-6 space-y-2">
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="text-5xl"
                  >
                    🎬
                  </motion.div>
                  <h3 className="text-xl font-bold text-[#f0f0f8]">C&apos;est dans la boîte !</h3>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#161633] rounded-xl border border-[#2a2a50] p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600 tabular-nums">{activeStudents.length}</p>
                    <p className="text-[10px] text-[#64748b] uppercase tracking-wider mt-0.5">Élèves</p>
                  </div>
                  <div className="bg-[#161633] rounded-xl border border-[#2a2a50] p-3 text-center">
                    <p className="text-2xl font-bold text-orange-500 tabular-nums">{responses.length}</p>
                    <p className="text-[10px] text-[#64748b] uppercase tracking-wider mt-0.5">Réponses</p>
                  </div>
                  <div className="bg-[#161633] rounded-xl border border-[#2a2a50] p-3 text-center">
                    <p className="text-2xl font-bold text-purple-500 tabular-nums">
                      {responses.filter((r) => r.is_highlighted).length}
                    </p>
                    <p className="text-[10px] text-[#64748b] uppercase tracking-wider mt-0.5">Mises en avant</p>
                  </div>
                </div>

                {/* Post-session facilitator feedback */}
                <FacilitatorFeedbackForm
                  sessionId={sessionId}
                  onComplete={() => (window.location.href = ROUTES.seanceDetail(sessionId))}
                  onSkip={() => (window.location.href = ROUTES.seanceDetail(sessionId))}
                />
              </motion.div>
            )}
          </div>
          {/* ── V6 PANELS ── */}
          {session.status !== "done" && (
            <>
              {/* Projection + Notes side by side */}
              <V6ControlPanels
                sessionId={sessionId}
                currentScreenMode={currentScreenMode}
                onScreenModeChange={(mode) => {
                  updateSession.mutate({
                    broadcast_message: `__SCREEN_MODE:${mode}`,
                    broadcast_at: new Date().toISOString(),
                  });
                }}
                onLockScreen={() => {
                  updateSession.mutate({
                    broadcast_message: "__SCREEN_MODE:black",
                    broadcast_at: new Date().toISOString(),
                  });
                }}
                onEndSession={() => {
                  updateSession.mutate({ status: "done", timer_ends_at: null });
                }}
              />

              {/* Vote controls (only for standard QA modules) */}
              {isStandardQA && (
                <V6VoteControls
                  voteState={
                    session.status === "voting" ? "open" : session.status === "reviewing" ? "revealed" : "closed"
                  }
                  totalVotes={voteData?.totalVotes || 0}
                  onOpenVote={() => updateSession.mutate({ status: "voting", timer_ends_at: null })}
                  onCloseVote={() => updateSession.mutate({ status: "responding", timer_ends_at: null })}
                  onReveal={() => updateSession.mutate({ status: "reviewing", timer_ends_at: null })}
                  onNext={handleNextAction}
                />
              )}

              {/* Activity feed — doctrine: anonymized, no student names */}
              <V6ActivityFeed
                items={(() => {
                  const items: ActivityItem[] = [];
                  const total = activeStudents.length;
                  const responded = state.respondedStudentIds.size;
                  if (session.status === "responding" && responded > 0) {
                    items.push({
                      id: "resp",
                      text: `${responded}/${total} eleves ont repondu`,
                      time: "maintenant",
                      icon: "✏️",
                      cat: "response",
                    });
                  }
                  if (session.status === "voting" && voteData) {
                    items.push({
                      id: "vote",
                      text: `${voteData.totalVotes} votes enregistres`,
                      time: "maintenant",
                      icon: "🗳️",
                      cat: "vote",
                    });
                  }
                  if (session.status === "reviewing") {
                    items.push({
                      id: "review",
                      text: "Phase de discussion en cours",
                      time: "maintenant",
                      icon: "💬",
                      cat: "system",
                    });
                  }
                  const handsUp = activeStudents.filter((s) => s.hand_raised_at).length;
                  if (handsUp > 0) {
                    items.push({
                      id: "hands",
                      text: `${handsUp} main${handsUp > 1 ? "s" : ""} levee${handsUp > 1 ? "s" : ""}`,
                      time: "maintenant",
                      icon: "✋",
                      cat: "system",
                    });
                  }
                  return items;
                })()}
              />
            </>
          )}

          {/* close max-w-2xl */}
        </div>
      </div>

      {/* V6: Footer removed — vote controls are now inline above */}
      {/* V6: Bulk toolbar removed — responses are in sidebar tab */}

      {/* ── PLUS MENU BOTTOM SHEET ── */}
      <BottomSheet open={plusOpen} onClose={() => setPlusOpen(false)} title="Actions">
        <PlusMenuContent
          onNudge={handleNudgeAllStuck}
          onBroadcast={modals.openBroadcast}
          onHint={() => modals.openBroadcastWith("💡 Indice : ", "Indice", "💡")}
          onExample={() => modals.openBroadcastWith("📝 Exemple : ", "Exemple", "📝")}
          onDebate={() => modals.setShowDebate(true)}
          onFreeQuestion={() => modals.openBroadcastWith("", "Question libre", "❓")}
          onWordCloud={() => modals.setShowWordCloud(true)}
          onCompare={() => modals.setShowCompare(true)}
          onExport={() => modals.setShowExport(true)}
          onShortcuts={() => modals.setShowShortcuts(true)}
          autoAdvance={autoAdvance}
          onToggleAutoAdvance={() => setAutoAdvance(!autoAdvance)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onSetTimer={handleSetTimer}
          onClearTimer={handleClearTimer}
          timerActive={!!session.timer_ends_at}
          onSetScreenMode={handleSetScreenMode}
          onToggleFreeze={handleToggleFreeze}
          currentScreenMode={currentScreenMode}
          screenFrozen={screenFrozen}
          onToggleRemote={() => setRemoteMode(true)}
          onClose={() => setPlusOpen(false)}
        />
      </BottomSheet>

      {/* ── STUDENTS BOTTOM SHEET ── */}
      <BottomSheet
        open={showStudentSheet}
        onClose={() => setShowStudentSheet(false)}
        title={`Élèves (${activeStudents.length})`}
      >
        <div className="space-y-1.5">
          {studentList.map((s) => {
            const hasResponded = state.respondedStudentIds.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => handleSelectStudent(s)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1a1a35] transition-colors cursor-pointer text-left"
              >
                <span className="text-2xl">{s.avatar}</span>
                <span className="flex-1 text-[14px] font-medium text-[#f0f0f8] truncate">{s.display_name}</span>
                {s.hand_raised_at && (
                  <span className="text-sm" title="Main levée">
                    ✋
                  </span>
                )}
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${hasResponded ? "bg-emerald-500" : "bg-[#64748b]"}`}
                />
              </button>
            );
          })}
          {studentList.length === 0 && <p className="text-center text-sm text-[#64748b] py-4">Aucun élève connecté</p>}
        </div>
      </BottomSheet>

      {/* ── STUDENT FICHE SLIDE-OVER ── */}
      <AnimatePresence>
        {ficheStudentId &&
          (() => {
            const raw = (session.students || []).find((s) => s.id === ficheStudentId);
            if (!raw) return null;
            const studentResponses = responses.filter((r) => r.student_id === ficheStudentId) as ResponseCardResponse[];
            const hasResponded = state.respondedStudentIds.has(ficheStudentId);
            const studentState = hasResponded ? "responded" : "active";
            return (
              <motion.div
                key="student-fiche-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex justify-end"
                onClick={() => setFicheStudentId(null)}
              >
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full max-w-md h-full bg-[#161633] border-l border-[#2a2a50] shadow-2xl overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <StudentFiche
                    studentId={ficheStudentId}
                    student={raw}
                    state={studentState}
                    responses={studentResponses}
                    sessionStatus={session.status}
                    respondingOpenedAt={respondingOpenedAt}
                    onBack={() => setFicheStudentId(null)}
                    onNudge={(sid, text) => {
                      const r = responses.find((r) => r.student_id === sid);
                      if (r) nudgeStudent.mutate({ responseId: r.id, nudgeText: text });
                    }}
                    onWarn={(sid) => warnStudent.mutate(sid)}
                    onBroadcast={modals.openBroadcast}
                    toggleHide={toggleHide}
                    toggleVoteOption={toggleVoteOption}
                    commentResponse={commentResponse}
                    highlightResponse={highlightResponse}
                    scoreResponse={scoreResponse}
                    resetResponse={resetResponse}
                    nudgeStudent={nudgeStudent}
                    warnStudent={warnStudent}
                    studentWarnings={studentWarnings}
                    onToggleActive={(studentId, isActive) => toggleStudentActive.mutate({ studentId, isActive })}
                    isToggleActivePending={toggleStudentActive.isPending}
                  />
                </motion.div>
              </motion.div>
            );
          })()}
      </AnimatePresence>

      {/* ── MODALS (reused unchanged) ── */}
      <CockpitModals
        spotlightResponse={modals.spotlightResponse}
        setSpotlightResponse={modals.setSpotlightResponse}
        showWordCloud={modals.showWordCloud}
        setShowWordCloud={modals.setShowWordCloud}
        showDebate={modals.showDebate}
        setShowDebate={modals.setShowDebate}
        showBroadcast={modals.showBroadcast}
        setShowBroadcast={modals.setShowBroadcast}
        handleBroadcast={handleBroadcast}
        broadcastHistory={broadcastHistory}
        broadcastPrefill={modals.broadcastPrefill}
        broadcastTitle={modals.broadcastTitle}
        broadcastIcon={modals.broadcastIcon}
        updateSessionPending={updateSession.isPending}
        showCompare={modals.showCompare}
        setShowCompare={modals.setShowCompare}
        handleHighlightBoth={handleHighlightBoth}
        handleClearAllHighlights={handleClearAllHighlights}
        showExport={modals.showExport}
        setShowExport={modals.setShowExport}
        sessionTitle={session.title || "Session"}
        level={session.level || ""}
        moduleLabel={moduleLabel}
        questionPrompt={situation?.prompt || ""}
        activeStudentCount={activeStudents.length}
        sessionId={sessionId}
        showShortcuts={modals.showShortcuts}
        setShowShortcuts={modals.setShowShortcuts}
        kickTarget={modals.kickTarget}
        setKickTarget={modals.setKickTarget}
        responses={responses}
        visibleResponses={visibleResponses}
      />
    </div>
  );
}
