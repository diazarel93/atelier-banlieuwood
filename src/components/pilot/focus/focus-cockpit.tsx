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
import { FocusHeader } from "./focus-header";

const StudentFiche = dynamic(() => import("@/components/pilot/student-fiche").then(m => ({ default: m.StudentFiche })), { ssr: false });
import { FocusFooter } from "./focus-footer";
import { FocusQuestionCard } from "./focus-question-card";
import { FocusModuleContent } from "./focus-module-content";
import { PlusMenuContent } from "./plus-menu-content";
import { BottomSheet } from "./bottom-sheet";
import { CockpitModals } from "@/components/pilot/cockpit-modals";
import { BulkResponseToolbar } from "@/components/pilot/bulk-response-toolbar";
import { ResponseStreamSection } from "@/components/pilot/response-stream-section";
import { VotingResults } from "@/components/pilot/voting-results";
import { InlineReformulation } from "@/components/pilot/inline-reformulation";
import { MiniClassroomGrid } from "@/components/pilot/mini-classroom-grid";
import { useStuckDetection } from "@/hooks/use-stuck-detection";
import type { StudentState } from "@/components/pilot/pulse-ring";
import type { ResponseCardResponse } from "@/components/pilot/response-card";
import type { Response } from "@/hooks/use-pilot-session";

export function FocusCockpit() {
  const [remoteMode, setRemoteMode] = useState(false);
  const state = useFocusCockpitState();
  const {
    session, sessionId, responses, activeStudents, voteData,
    situation, visibleResponses, voteOptionCount, currentQIndex, respondedCount,
    nextAction, moduleFlags, moduleLabel, moduleColor, questionGuide,
    filteredResponses, isPreviewing, displayIndex,
    stuckStudents, notRespondedStudents,
    universalQuestionText, universalCategoryLabel, unifiedRespondedCount,
    isStandardQA, winnerResponseId, allResponded,
    respondingOpenedAt, broadcastHistory,
    previewIndex, setPreviewIndex,
    autoAdvance, setAutoAdvance, autoAdvanceCountdown,
    plusOpen, setPlusOpen,
    showStudentSheet, setShowStudentSheet,
    selectedResponseIds, setSelectedResponseIds,
    responseFilter, setResponseFilter,
    responseSortMode, setResponseSortMode,
    reformulating, setReformulating,
    isDarkMode, setIsDarkMode,
    modals, budgetSubmitted,
    goToSituation, handleNextAction, handleSelectionBarAction, handleQuickVote,
    handleBroadcast, handleNudgeAllStuck,
    handleHighlightAllVisible, handleClearAllHighlights, handleHighlightBoth,
  } = state;

  const {
    updateSession, validateChoice, toggleHide, aiEvaluate, onSelectStudent,
    toggleVoteOption, commentResponse, highlightResponse, scoreResponse,
    resetResponse, nudgeStudent, warnStudent, toggleStudentActive,
  } = useCockpitActions();

  const { studentWarnings, oieScores } = useCockpitData();

  // ── Plan de classe (student states for grid) ──
  const activeStudentIds = useMemo(() => new Set(activeStudents.map(s => s.id)), [activeStudents]);
  const stuckLevels = useStuckDetection({
    respondedStudentIds: state.respondedStudentIds,
    activeStudentIds,
    respondingOpenedAt: session.status === "responding" ? respondingOpenedAt : null,
  });

  const miniStudentStates = useMemo(() => {
    return activeStudents.map((s) => {
      const responded = state.respondedStudentIds.has(s.id);
      const level = stuckLevels.get(s.id) || "ok";
      let st: StudentState = "active";
      if (responded) st = "responded";
      else if (level === "stuck" || level === "slow") st = "stuck";
      return {
        id: s.id,
        state: st,
        display_name: s.display_name,
        avatar: s.avatar || "\u{1F464}",
        hand_raised_at: s.hand_raised_at,
      };
    });
  }, [activeStudents, state.respondedStudentIds, stuckLevels]);

  // ── Student fiche slide-over ──
  const [ficheStudentId, setFicheStudentId] = useState<string | null>(null);
  const handleSelectStudent = useCallback((s: { id: string }) => {
    setFicheStudentId(s.id);
    setShowStudentSheet(false);
  }, [setShowStudentSheet]);

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

  const handleSetTimerPreset = useCallback((n: number) => {
    const seconds = TIMER_PRESETS[n - 1];
    if (!seconds) return;
    const endsAt = new Date(Date.now() + seconds * 1000).toISOString();
    updateSession.mutate({ timer_ends_at: endsAt });
    toast.success(`Timer ${seconds >= 60 ? `${seconds / 60}min` : `${seconds}s`} lancé`);
    setTimerMode(false);
  }, [updateSession]);

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
      setTimerMode(v => {
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
  const currentScreenMode = typeof broadcastMsg === "string" && broadcastMsg.startsWith("__SCREEN_MODE:")
    ? broadcastMsg.replace("__SCREEN_MODE:", "")
    : "default";
  const screenFrozen = broadcastMsg === "__SCREEN_FROZEN";

  function handleSetScreenMode(mode: string) {
    updateSession.mutate({ broadcast_message: `__SCREEN_MODE:${mode}`, broadcast_at: new Date().toISOString() });
    const labels: Record<string, string> = { default: "Question", responses: "Réponses", wordcloud: "Nuage de mots", blank: "Écran noir" };
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
      <div className={`flex-1 flex flex-col overflow-hidden bg-gray-50/50 relative ${isDarkMode ? "cockpit-dark" : ""}`}>
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
    <div className={`flex-1 flex flex-col overflow-hidden bg-gray-50/50 ${isDarkMode ? "cockpit-dark" : ""}`}>
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
      />

      {/* ── SCROLLABLE CENTER ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {/* Question card — animate on change */}
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

          {/* Progress indicator */}
          {session.status === "responding" && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${activeStudents.length > 0 ? (unifiedRespondedCount / activeStudents.length) * 100 : 0}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-[13px] font-bold text-gray-500 tabular-nums shrink-0">
                {unifiedRespondedCount}/{activeStudents.length}
              </span>
            </div>
          )}

          {/* Empty state — waiting for responses */}
          {session.status === "responding" && unifiedRespondedCount === 0 && activeStudents.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 text-center space-y-3"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="text-4xl"
              >
                ✏️
              </motion.div>
              <p className="text-[14px] font-medium text-gray-700">Les élèves réfléchissent...</p>
              <p className="text-[12px] text-gray-400">Les réponses apparaîtront ici</p>
            </motion.div>
          )}

          {/* Empty state — no students connected */}
          {session.status === "responding" && activeStudents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-dashed border-gray-200 p-6 text-center space-y-3"
            >
              <div className="text-4xl">📡</div>
              <p className="text-[14px] font-medium text-gray-700">Aucun élève connecté</p>
              <p className="text-[12px] text-gray-400">Projetez le QR code pour qu&apos;ils rejoignent</p>
            </motion.div>
          )}

          {/* Auto-advance countdown */}
          {autoAdvanceCountdown > 0 && (
            <div className="text-center py-2">
              <span className="text-sm font-medium text-emerald-600">
                Auto-avance dans {autoAdvanceCountdown}s...
              </span>
            </div>
          )}

          {/* Module-specific content */}
          <FocusModuleContent
            isPreviewing={isPreviewing}
            currentQIndex={currentQIndex}
          />

          {/* Vote results (Standard QA) */}
          {isStandardQA && (session.status === "voting" || session.status === "reviewing") && voteData && voteData.results.length > 0 && (
            <VotingResults
              voteData={voteData}
              sessionStatus={session.status}
              onValidateWinner={(responseId, text, students) => {
                const fakeResponse = { id: responseId, student_id: "", situation_id: "", text, submitted_at: "", is_hidden: false, is_vote_option: true, is_highlighted: false, teacher_comment: null, students } as Response;
                setReformulating(fakeResponse);
              }}
            />
          )}

          {/* Vote progress — live counter */}
          {isStandardQA && session.status === "voting" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-gray-700 flex items-center gap-2">
                  <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>🗳️</motion.span>
                  Vote en cours
                </span>
                <span className="text-[13px] font-bold text-orange-600 tabular-nums">
                  {voteData?.totalVotes || 0}/{activeStudents.length}
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-orange-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${activeStudents.length > 0 ? ((voteData?.totalVotes || 0) / activeStudents.length) * 100 : 0}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {/* Vote empty state (reviewing with no votes) */}
          {isStandardQA && session.status === "reviewing" && (!voteData || voteData.totalVotes === 0) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center space-y-2">
              <p className="text-3xl">🗳️</p>
              <p className="text-sm text-gray-500">Aucun vote enregistré</p>
            </div>
          )}

          {/* Inline reformulation */}
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

          {/* Response stream (Standard QA + M1 Image/Notebook) */}
          {(isStandardQA || moduleFlags.isM1Image || moduleFlags.isM1Notebook) && session.status !== "done" && session.status !== "paused" && !(session.status === "voting" || session.status === "reviewing") && (
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
              onShowBroadcast={modals.openBroadcast}
              onShowCompare={() => modals.setShowCompare(true)}
              onShowExport={() => modals.setShowExport(true)}
              showRevealAnswer={modals.showRevealAnswer}
              onToggleRevealAnswer={() => modals.setShowRevealAnswer((v: boolean) => !v)}
              onClearAllHighlights={handleClearAllHighlights}
              onNudgeAllStuck={handleNudgeAllStuck}
              onReformulate={(r) => setReformulating(r as unknown as Response)}
              onSpotlight={(r) => modals.setSpotlightResponse({
                studentName: r.students?.display_name || "",
                studentAvatar: r.students?.avatar || "",
                text: r.text,
                score: r.teacher_score,
                highlighted: r.is_highlighted,
              })}
              onHighlightAllVisible={handleHighlightAllVisible}
              onHideAllVisible={handleHideAllVisible}
            />
          )}

          {/* Not responded students */}
          {session.status === "responding" && notRespondedStudents.length > 0 && notRespondedStudents.length <= 5 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="text-[11px] text-gray-400 font-medium self-center mr-1">En attente :</span>
              {notRespondedStudents.map((s) => (
                <span key={s.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium">
                  {s.display_name?.split(" ")[0]}
                </span>
              ))}
            </div>
          )}

          {/* Done state — session recap */}
          {session.status === "done" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
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
                <h3 className="text-xl font-bold text-gray-900">C&apos;est dans la boîte !</h3>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600 tabular-nums">{activeStudents.length}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Élèves</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <p className="text-2xl font-bold text-orange-500 tabular-nums">{responses.length}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Réponses</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <p className="text-2xl font-bold text-purple-500 tabular-nums">
                    {responses.filter(r => r.is_highlighted).length}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Mises en avant</p>
                </div>
              </div>

              {/* Back to dashboard */}
              <button
                onClick={() => window.location.href = ROUTES.seanceDetail(sessionId)}
                className="w-full py-3 rounded-xl bg-gray-900 text-white text-[14px] font-bold hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Retour au tableau de bord
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <FocusFooter
        sessionStatus={session.status}
        isStandardQA={isStandardQA}
        respondedCount={unifiedRespondedCount}
        totalStudents={activeStudents.length}
        voteOptionCount={voteOptionCount}
        totalVotes={voteData?.totalVotes}
        allResponded={allResponded}
        nextAction={nextAction}
        onNextAction={handleNextAction}
        isPending={updateSession.isPending}
        onSelectionBarAction={handleSelectionBarAction}
        onQuickVote={handleQuickVote}
        onOpenPlus={() => setPlusOpen(true)}
        onProjectResponses={handleHighlightAllVisible}
      />

      {/* ── BULK RESPONSE TOOLBAR ── */}
      <BulkResponseToolbar
        selectedCount={selectedResponseIds.size}
        totalCount={responses.length}
        onHideUnselected={() => {
          const toHide = responses.filter((r) => !selectedResponseIds.has(r.id) && !r.is_hidden);
          for (const r of toHide) toggleHide.mutate({ responseId: r.id, is_hidden: true });
          toast.success(`${toHide.length} masquée${toHide.length > 1 ? "s" : ""}`);
          setSelectedResponseIds(new Set());
        }}
        onAiEvaluate={() => {
          aiEvaluate.mutate(Array.from(selectedResponseIds));
          setSelectedResponseIds(new Set());
        }}
        onDeselectAll={() => setSelectedResponseIds(new Set())}
        isEvaluating={aiEvaluate.isPending}
      />

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

      {/* ── STUDENTS BOTTOM SHEET (with plan de classe) ── */}
      <BottomSheet open={showStudentSheet} onClose={() => setShowStudentSheet(false)} title={`Élèves (${activeStudents.length})`}>
        <div className="space-y-4">
          {/* Plan de classe grid */}
          {activeStudents.length > 0 && (
            <div>
              <MiniClassroomGrid
                studentStates={miniStudentStates}
                onStudentClick={(id) => {
                  const s = activeStudents.find(st => st.id === id);
                  if (s) {
                    setShowStudentSheet(false);
                    handleSelectStudent(s);
                  }
                }}
              />
            </div>
          )}

          {/* Student list */}
          <div className="space-y-1.5">
            {studentList.map((s) => {
              const hasResponded = state.respondedStudentIds.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectStudent(s)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-left"
                >
                  <span className="text-2xl">{s.avatar}</span>
                  <span className="flex-1 text-[14px] font-medium text-gray-900 truncate">{s.display_name}</span>
                  {s.hand_raised_at && <span className="text-sm" title="Main levée">✋</span>}
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    hasResponded ? "bg-emerald-500" : "bg-gray-300"
                  }`} />
                </button>
              );
            })}
            {studentList.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-4">Aucun élève connecté</p>
            )}
          </div>
        </div>
      </BottomSheet>

      {/* ── STUDENT FICHE SLIDE-OVER ── */}
      <AnimatePresence>
        {ficheStudentId && (() => {
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
                className="w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto"
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
                  oieScores={oieScores?.[ficheStudentId] ?? null}
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
