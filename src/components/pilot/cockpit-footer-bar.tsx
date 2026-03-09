"use client";

import { type RefObject } from "react";
import { motion } from "motion/react";
import { SelectionBar } from "@/components/pilot/selection-bar";
import { FloatingNextAction } from "@/components/pilot/floating-next-action";
import { OnboardingHints } from "@/components/pilot/onboarding-hints";
import type { OnboardingStep } from "@/hooks/use-pilot-onboarding";
import type { NextAction } from "@/components/pilot/get-next-action";
import type { TimelineEventType } from "@/components/pilot/session-timeline";
import type { UseMutationResult } from "@tanstack/react-query";

interface NotRespondedStudent {
  id: string;
  display_name: string;
  avatar: string;
}

export interface CockpitFooterBarProps {
  sessionStatus: string;
  isStandardQA: boolean;
  // Footer action buttons
  openBroadcastWith: (prefill: string, title?: string, icon?: string) => void;
  openBroadcast: () => void;
  handleNudgeAllStuck: () => void;
  notRespondedStudents: NotRespondedStudent[];
  visibleResponses: { id: string; text: string }[];
  setShowDebate: (v: boolean) => void;
  setShowCompare: (v: boolean) => void;
  setShowWordCloud: (v: boolean) => void;
  setShowExport: (v: boolean) => void;
  addTimelineEvent: (type: TimelineEventType, label: string, detail?: string, severity?: "info" | "positive" | "warning" | "highlight") => void;
  // SelectionBar
  responsesCount: number;
  activeStudentCount: number;
  voteOptionCount: number;
  totalVotes: number | undefined;
  handleSelectionBarAction: () => void;
  handleQuickVote: () => void;
  allResponded: boolean;
  // Navigation
  canGoNext: boolean;
  currentSituationIndex: number;
  isPreviewing: boolean;
  displayIndex: number;
  prevSituation: () => void;
  skipSituation: () => void;
  handleNextAction: () => void;
  nextAction: NextAction | null;
  updateSession: UseMutationResult<unknown, Error, Record<string, unknown>>;
  goToSituation: (index: number) => void;
  setPreviewIndex: (v: number | null) => void;
  // Toggles
  focusMode: boolean;
  setFocusMode: (fn: (prev: boolean) => boolean) => void;
  sharingEnabled: boolean;
  helpEnabled: boolean;
  muteSounds: boolean;
  setShowShortcuts: (v: boolean) => void;
  respondedCount: number;
  voteData: { totalVotes: number } | undefined;
  // Floating action
  footerCtaRef: RefObject<HTMLDivElement | null>;
  // Onboarding
  onboarding: {
    showOnboarding: boolean;
    currentStep: OnboardingStep | null;
    stepIndex: number;
    totalSteps: number;
    nextStep: () => void;
    dismiss: () => void;
  };
  // Reveal
  revealPhase: number | null;
}

export function CockpitFooterBar({
  sessionStatus,
  isStandardQA,
  openBroadcastWith,
  openBroadcast,
  handleNudgeAllStuck,
  notRespondedStudents,
  visibleResponses,
  setShowDebate,
  setShowCompare,
  setShowWordCloud,
  setShowExport,
  addTimelineEvent,
  responsesCount,
  activeStudentCount,
  voteOptionCount,
  totalVotes,
  handleSelectionBarAction,
  handleQuickVote,
  allResponded,
  canGoNext,
  currentSituationIndex,
  isPreviewing,
  displayIndex,
  prevSituation,
  skipSituation,
  handleNextAction,
  nextAction,
  updateSession,
  goToSituation,
  setPreviewIndex,
  focusMode,
  setFocusMode,
  sharingEnabled,
  helpEnabled,
  muteSounds,
  setShowShortcuts,
  respondedCount,
  voteData,
  footerCtaRef,
  onboarding,
  revealPhase,
}: CockpitFooterBarProps) {
  if (sessionStatus === "done" || sessionStatus === "paused") return null;

  return (
    <>
      <div className="flex-shrink-0" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.4)" }}>
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6" style={{ height: 68, minHeight: 68 }}>
          {/* LEFT: Action buttons */}
          {sessionStatus !== "waiting" && sessionStatus !== "done" && (
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 overflow-x-auto">
              {/* Stimulation */}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[8px] font-bold uppercase tracking-wider text-bw-muted hidden sm:flex items-center gap-1">💡 Stimulation</span>
                <div className="flex items-center gap-1 px-1.5 py-1 rounded-xl" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.3)" }}>
                  <button onClick={() => openBroadcastWith("Indice : ", "Envoyer un indice", "💡")}
                    className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl text-[12px] sm:text-[13px] font-semibold cursor-pointer transition-all whitespace-nowrap hover:shadow-sm"
                    style={{ background: "rgba(255,240,230,0.8)", border: "1px solid rgba(230,219,207,0.6)", color: "#8B4513" }}>
                    💡 <span className="hidden sm:inline">Indice</span>
                  </button>
                  <button onClick={handleNudgeAllStuck} disabled={notRespondedStudents.length === 0}
                    className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl text-[12px] sm:text-[13px] font-semibold cursor-pointer transition-all whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-sm"
                    style={{ background: "rgba(235,242,255,0.8)", border: "1px solid rgba(230,219,207,0.6)", color: "#3B5998" }}>
                    🚀 <span className="hidden sm:inline">Relancer{notRespondedStudents.length > 0 ? ` (${notRespondedStudents.length})` : ""}</span>
                    <span className="sm:hidden">{notRespondedStudents.length > 0 ? notRespondedStudents.length : ""}</span>
                  </button>
                  <button onClick={() => openBroadcastWith("Exemple : ", "Proposer un exemple", "📝")}
                    className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl text-[12px] sm:text-[13px] font-semibold cursor-pointer transition-all whitespace-nowrap hover:shadow-sm"
                    style={{ background: "rgba(255,252,245,0.8)", border: "1px solid rgba(230,219,207,0.6)", color: "#8B6914" }}>
                    📝 <span className="hidden sm:inline">Exemple</span>
                  </button>
                </div>
              </div>
              <div className="w-px h-6 hidden sm:block" style={{ background: "rgba(255,255,255,0.4)" }} />
              {/* Interaction */}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[8px] font-bold uppercase tracking-wider text-bw-muted hidden sm:flex items-center gap-1">💬 Interaction</span>
                <div className="flex items-center gap-1 px-1.5 py-1 rounded-xl" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.3)" }}>
                  <button onClick={() => openBroadcastWith("Question pour la classe : ", "Lancer une discussion", "💬")}
                    className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl text-[12px] sm:text-[13px] font-semibold cursor-pointer transition-all whitespace-nowrap hover:shadow-sm"
                    style={{ background: "rgba(232,245,242,0.8)", border: "1px solid rgba(230,219,207,0.6)", color: "#1B5E50" }}>
                    💬 <span className="hidden sm:inline">Discussion</span>
                  </button>
                  <button onClick={() => { setShowDebate(true); addTimelineEvent("debate_launched", "Debat lance", undefined, "highlight"); }} disabled={visibleResponses.length < 1}
                    className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl text-[12px] sm:text-[13px] font-semibold cursor-pointer transition-all whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-sm"
                    style={{ background: "rgba(240,236,248,0.8)", border: "1px solid rgba(230,219,207,0.6)", color: "#5B3A8E" }}>
                    🎭 <span className="hidden sm:inline">Debat</span>
                  </button>
                  <button onClick={() => openBroadcastWith("Sondage rapide : ", "Lancer un sondage", "🗳️")}
                    className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl text-[12px] sm:text-[13px] font-semibold cursor-pointer transition-all whitespace-nowrap hover:shadow-sm"
                    style={{ background: "rgba(245,240,255,0.8)", border: "1px solid rgba(230,219,207,0.6)", color: "#6B3FA0" }}>
                    🗳️ <span className="hidden sm:inline">Sondage</span>
                  </button>
                </div>
              </div>
              <div className="w-px h-6 hidden sm:block" style={{ background: "rgba(255,255,255,0.4)" }} />
              {/* Analyse */}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[8px] font-bold uppercase tracking-wider text-bw-muted hidden sm:flex items-center gap-1">📊 Analyse</span>
                <div className="flex items-center gap-1 px-1.5 py-1 rounded-xl" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.3)" }}>
                  <button onClick={() => { if (visibleResponses.length >= 2) setShowCompare(true); }} disabled={visibleResponses.length < 2}
                    className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl text-[12px] sm:text-[13px] font-semibold cursor-pointer transition-all whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-sm"
                    style={{ background: "rgba(255,248,230,0.8)", border: "1px solid rgba(230,219,207,0.6)", color: "#8B6914" }}>
                    ⚖️ <span className="hidden sm:inline">Comparer</span>
                  </button>
                  <button onClick={() => setShowWordCloud(true)} disabled={visibleResponses.length < 3}
                    className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl text-[12px] sm:text-[13px] font-semibold cursor-pointer transition-all whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-sm"
                    style={{ background: "rgba(240,248,255,0.8)", border: "1px solid rgba(230,219,207,0.6)", color: "#2563EB" }}>
                    💡 <span className="hidden sm:inline">Idees</span>
                  </button>
                  <button onClick={() => openBroadcastWith("Synthese : ", "Synthese collective", "📋")} disabled={visibleResponses.length < 2}
                    className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl text-[12px] sm:text-[13px] font-semibold cursor-pointer transition-all whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-sm"
                    style={{ background: "rgba(245,255,250,0.8)", border: "1px solid rgba(230,219,207,0.6)", color: "#1B5E50" }}>
                    📋 <span className="hidden sm:inline">Synthese</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="flex-1" />

          {/* RIGHT: Navigation + CTA */}
          <div ref={footerCtaRef} className="flex items-center gap-3 flex-shrink-0">
            {/* Back button for non-QA modules */}
            {!isStandardQA && currentSituationIndex > 0 && (
              <button
                onClick={prevSituation}
                disabled={updateSession.isPending}
                title="Question précédente"
                className="h-11 px-3.5 rounded-[12px] flex items-center justify-center text-bw-text bg-white border border-[#E6DBCF] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0 text-[13px] font-medium gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Precedente
              </button>
            )}

            {/* Main CTA */}
            <div className="min-w-[180px]">
              {sessionStatus === "waiting" ? (
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
              ) : isStandardQA && sessionStatus !== "waiting" ? (
                <div className="space-y-2">
                  <SelectionBar
                    status={sessionStatus}
                    responsesCount={responsesCount}
                    totalStudents={activeStudentCount}
                    selectedCount={voteOptionCount}
                    totalVotes={totalVotes}
                    onAction={handleSelectionBarAction}
                    onQuickVote={handleQuickVote}
                    actionDisabled={
                      (sessionStatus === "responding" && voteOptionCount < 2) ||
                      (sessionStatus === "voting" && (!voteData || voteData.totalVotes === 0))
                    }
                    isPending={updateSession.isPending}
                    pulse={allResponded}
                  />
                  {sessionStatus === "responding" && responsesCount > 0 && (
                    <motion.button
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => updateSession.mutate({ status: "reviewing", reveal_phase: 0, timer_ends_at: null })}
                      disabled={updateSession.isPending}
                      className="w-full h-9 rounded-lg text-[13px] font-medium cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed border"
                      style={{ color: "#8B5CF6", borderColor: "#8B5CF620", background: "#8B5CF608" }}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/></svg>
                        Révéler les réponses
                      </span>
                    </motion.button>
                  )}
                </div>
              ) : nextAction ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={handleNextAction}
                  disabled={updateSession.isPending || !!(nextAction as { disabled?: boolean }).disabled}
                  className="w-full h-11 rounded-xl font-bold text-[14px] cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #E53935 0%, #D81B60 100%)",
                    color: "white",
                    boxShadow: "0 4px 14px rgba(229,57,53,0.3)",
                  }}>
                  {nextAction.label} {nextAction.shortcut && <kbd className="inline-flex items-center justify-center w-5 h-5 ml-1.5 rounded bg-black/[0.08] text-[10px] font-mono">{nextAction.shortcut}</kbd>}
                </motion.button>
              ) : (
                <div className="w-full py-2.5 rounded-lg text-sm text-center bg-bw-elevated text-bw-muted border border-black/[0.06]" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                  {sessionStatus === "responding"
                    ? <span className="flex items-center justify-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-bw-teal animate-pulse" />En attente... <span className="text-bw-text font-semibold tabular-nums">{respondedCount}/{activeStudentCount}</span></span>
                    : sessionStatus === "voting"
                      ? <span className="flex items-center justify-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-bw-violet animate-pulse" />Vote en cours... <span className="text-bw-text font-semibold tabular-nums">{voteData?.totalVotes || 0} votes</span></span>
                      : <span className="flex items-center justify-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-bw-muted animate-pulse" />En attente...</span>}
                </div>
              )}
            </div>

            {/* Skip button for non-QA */}
            {!isStandardQA && canGoNext && sessionStatus === "responding" && (
              <button
                onClick={skipSituation}
                disabled={updateSession.isPending}
                title="Passer cette question"
                className="h-11 px-3.5 rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0 text-[13px] font-medium gap-1.5 hover:shadow-sm"
                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.5)", color: "#7A7A7A" }}
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
                  focusMode ? "bg-bw-violet/15 text-bw-violet border-bw-violet/30" : "text-bw-text hover:text-bw-heading bg-white border-bw-border"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="10" /></svg>
              </button>
              <button
                onClick={() => updateSession.mutate({ sharing_enabled: !sharingEnabled })}
                title={sharingEnabled ? "Partage activé" : "Partage désactivé"}
                className={`w-8 h-8 rounded-[10px] flex items-center justify-center transition-all cursor-pointer border ${
                  sharingEnabled ? "bg-bw-teal/15 text-bw-teal border-bw-teal/30" : "text-bw-text hover:text-bw-heading bg-white border-bw-border"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              </button>
              <button
                onClick={() => updateSession.mutate({ help_enabled: !helpEnabled })}
                title={helpEnabled ? "Aide élève activée" : "Aide élève désactivée"}
                className={`w-8 h-8 rounded-[10px] flex items-center justify-center transition-all cursor-pointer border ${
                  helpEnabled ? "bg-purple-500/15 text-purple-500 border-purple-500/30" : "text-bw-text hover:text-bw-heading bg-white border-bw-border"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </button>
              <button
                onClick={() => updateSession.mutate({ mute_sounds: !muteSounds })}
                title={muteSounds ? "Sons désactivés" : "Sons activés"}
                className={`w-8 h-8 rounded-[10px] flex items-center justify-center transition-all cursor-pointer border ${
                  muteSounds ? "text-bw-text hover:text-bw-heading bg-white border-bw-border" : "bg-bw-amber/15 text-bw-amber border-bw-amber/30"
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{muteSounds ? <><path d="M11 5L6 9H2v6h4l5 4z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></> : <><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></>}</svg>
              </button>
              <button
                onClick={() => setShowShortcuts(true)}
                title="Raccourcis clavier (?)"
                className="w-8 h-8 rounded-[10px] flex items-center justify-center text-bw-text hover:text-bw-heading bg-white border border-bw-border transition-all cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating next action */}
      <FloatingNextAction
        nextAction={nextAction}
        onExecute={handleNextAction}
        isPending={updateSession.isPending}
        allResponded={allResponded}
        footerRef={footerCtaRef}
      />

      {/* Onboarding hints */}
      <OnboardingHints
        show={onboarding.showOnboarding}
        step={onboarding.currentStep}
        stepIndex={onboarding.stepIndex}
        totalSteps={onboarding.totalSteps}
        onNext={onboarding.nextStep}
        onDismiss={onboarding.dismiss}
      />
    </>
  );
}
