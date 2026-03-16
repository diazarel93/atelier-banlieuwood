"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useFocusCockpitState } from "@/hooks/use-focus-cockpit-state";
import { useCockpitActions } from "@/components/pilot/cockpit-context";
import { RemoteControlView } from "./remote-control-view";
import { usePilotKeyboardShortcuts } from "@/hooks/use-pilot-keyboard-shortcuts";
import { TIMER_PRESETS } from "@/components/pilot/pilot-settings";
import { FocusHeader } from "./focus-header";
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

  const { updateSession, validateChoice, toggleHide, aiEvaluate, onSelectStudent } = useCockpitActions();

  // ── Keyboard shortcuts ──
  const handlePauseToggle = useCallback(() => {
    if (session.status === "paused") updateSession.mutate({ status: "waiting" });
    else if (session.status !== "done") updateSession.mutate({ status: "paused" });
  }, [session.status, updateSession]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleNextActionCb = useCallback(() => handleNextAction(), [nextAction, moduleFlags.canGoNext, updateSession]);

  const [timerMode, setTimerMode] = [false, () => {}]; // simplified — timer via Plus menu

  const handleSetTimerPreset = useCallback((n: number) => {
    const seconds = TIMER_PRESETS[n - 1];
    if (!seconds) return;
    const endsAt = new Date(Date.now() + seconds * 1000).toISOString();
    updateSession.mutate({ timer_ends_at: endsAt });
    toast.success(`Timer ${seconds >= 60 ? `${seconds / 60}min` : `${seconds}s`} lancé`);
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
    onToggleIntervention: useCallback(() => {}, []),
    onTimerShortcut: useCallback(() => {}, []),
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
        onOpenStudents={() => setShowStudentSheet(true)}
      />

      {/* ── SCROLLABLE CENTER ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {/* Question card */}
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
          />

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

          {/* Vote empty state */}
          {isStandardQA && (session.status === "voting" || session.status === "reviewing") && (!voteData || voteData.totalVotes === 0) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center space-y-2">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="text-3xl">🗳️</motion.div>
              <p className="text-sm text-gray-500">Vote en cours...</p>
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

          {/* Done state */}
          {session.status === "done" && (
            <div className="text-center py-12 space-y-3">
              <div className="text-4xl">🎬</div>
              <p className="text-lg font-bold text-gray-900">Module terminé</p>
              <p className="text-sm text-gray-500">Retournez au tableau de bord pour continuer</p>
            </div>
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

      {/* ── STUDENTS BOTTOM SHEET ── */}
      <BottomSheet open={showStudentSheet} onClose={() => setShowStudentSheet(false)} title={`Élèves (${activeStudents.length})`}>
        <div className="space-y-1.5">
          {studentList.map((s) => {
            const hasResponded = state.respondedStudentIds.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => { onSelectStudent(s as Parameters<typeof onSelectStudent>[0]); setShowStudentSheet(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-left"
              >
                <span className="text-2xl">{s.avatar}</span>
                <span className="flex-1 text-[14px] font-medium text-gray-900 truncate">{s.display_name}</span>
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
      </BottomSheet>

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
