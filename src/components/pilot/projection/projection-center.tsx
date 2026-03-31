"use client";

import { useCockpitData, useCockpitActions } from "@/components/pilot/cockpit-context";
import { getModuleByDb } from "@/lib/modules-data";
import { CATEGORY_COLORS, getSeanceMax } from "@/lib/constants";
import { ProjectionQuestionCard } from "./projection-question-card";

// Modules with a vote phase
const VOTE_MODULES = new Set([2, 3, 4, 9]);

export function ProjectionCenter() {
  const { session, responses, activeStudents, voteData } = useCockpitData();
  const { updateSession, onModuleComplete } = useCockpitActions();

  const moduleInfo = getModuleByDb(session.current_module, session.current_seance || 1);
  const seance = session.current_seance || 1;
  const maxSituations =
    session.current_module === 1 && seance === 1
      ? 8
      : session.current_module === 4
        ? 8
        : getSeanceMax(session.current_module, seance);
  const currentIndex = session.current_situation_index || 0;

  const situationData = session as unknown as Record<string, unknown>;
  const questionText = (situationData?.current_question_text as string | undefined) ?? moduleInfo?.title ?? null;

  const categoryKey = (session as unknown as Record<string, unknown>)?.current_category as string | undefined;
  const categoryLabel = categoryKey
    ? CATEGORY_COLORS[categoryKey]
      ? categoryKey
      : (moduleInfo?.subtitle ?? "Module")
    : (moduleInfo?.subtitle ?? "Module");

  const respondedCount = responses.length;
  const totalActive = activeStudents.length;
  const progressPct = totalActive > 0 ? Math.round((respondedCount / totalActive) * 100) : 0;
  const enAttente = Math.max(0, totalActive - respondedCount);

  const isResponding = session.status === "responding";
  const isVoting = session.status === "voting";
  const isReviewing = session.status === "reviewing";
  const isLastQuestion = currentIndex >= maxSituations - 1;
  const isVoteModule = VOTE_MODULES.has(session.current_module);
  const hasVoteResults = voteData !== undefined && voteData.totalVotes > 0;
  const canGoBack = currentIndex > 0;

  function handleReveal() {
    updateSession.mutate({ status: "reviewing" });
  }

  function handleOpenVote() {
    updateSession.mutate({ status: "voting", timer_ends_at: null });
  }

  function handleRevealVoteResults() {
    updateSession.mutate({ status: "reviewing" });
  }

  function handleNext() {
    if (isLastQuestion) {
      onModuleComplete();
    } else {
      updateSession.mutate({
        current_situation_index: currentIndex + 1,
        status: "responding",
      });
    }
  }

  function handlePrev() {
    if (canGoBack) {
      updateSession.mutate({
        current_situation_index: currentIndex - 1,
        status: "responding",
      });
    }
  }

  // CTA principal selon l'état
  type CTAState = {
    label: string;
    action: () => void;
    color: string;
  };

  let cta: CTAState | null = null;

  if (isResponding) {
    cta = { label: "Révéler les réponses", action: handleReveal, color: "#FF6B35" };
  } else if (isVoting) {
    cta = {
      label: `Voir les résultats (${voteData?.totalVotes ?? 0} votes)`,
      action: handleRevealVoteResults,
      color: "#4ECDC4",
    };
  } else if (isReviewing && isVoteModule && !hasVoteResults) {
    cta = { label: "Lancer le vote", action: handleOpenVote, color: "#D4A843" };
  } else if (isReviewing) {
    cta = {
      label: isLastQuestion ? "Terminer le module" : "Suivant →",
      action: handleNext,
      color: "#2C2C2C",
    };
  }

  const canNext = isReviewing;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5">
      {/* Question card */}
      <ProjectionQuestionCard
        questionText={questionText}
        categoryLabel={categoryLabel}
        currentIndex={currentIndex}
        maxSituations={maxSituations}
      />

      {/* Progress bar + counter */}
      <div className="space-y-2">
        <div className="h-2 rounded-full bg-[#E8DFD2] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#4ECDC4] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-center text-sm text-[#4A4A4A]">
          <span className="font-bold text-[#2C2C2C]">{respondedCount}</span>
          {" / "}
          <span className="font-bold text-[#2C2C2C]">{totalActive}</span>
          {" élèves ont répondu"}
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { v: String(respondedCount), l: "Répondu", c: "#FF6B35" },
          { v: String(enAttente), l: "Attente", c: "#D4A843" },
          { v: `${progressPct}%`, l: "Taux", c: "#4ECDC4" },
        ].map((k) => (
          <div key={k.l} className="flex flex-col items-center py-3 rounded-xl" style={{ background: `${k.c}18` }}>
            <span className="text-2xl font-black tabular-nums" style={{ color: k.c }}>
              {k.v}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#4A4A4A]">{k.l}</span>
          </div>
        ))}
      </div>

      {/* Navigation + CTA */}
      <div className="flex items-center gap-3">
        {/* ← Précédent */}
        <button
          onClick={handlePrev}
          disabled={!canGoBack}
          className="shrink-0 px-4 min-h-11 rounded-xl text-sm font-semibold text-[#4A4A4A] bg-[#E8DFD2] hover:bg-[#DDD4C4] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          ← Préc
        </button>

        {/* CTA central */}
        {cta && (
          <button
            onClick={cta.action}
            className="flex-1 min-h-11 rounded-xl text-white font-bold text-base transition-colors cursor-pointer"
            style={{ backgroundColor: cta.color }}
          >
            {cta.label}
          </button>
        )}

        {/* Suivant → */}
        <button
          onClick={handleNext}
          disabled={!canNext}
          className="shrink-0 px-4 min-h-11 rounded-xl text-sm font-semibold text-[#4A4A4A] bg-[#E8DFD2] hover:bg-[#DDD4C4] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
