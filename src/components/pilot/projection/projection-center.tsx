"use client";

import { useCockpitData, useCockpitActions } from "@/components/pilot/cockpit-context";
import { getModuleByDb } from "@/lib/modules-data";
import { CATEGORY_COLORS, getSeanceMax } from "@/lib/constants";
import { ProjectionQuestionCard } from "./projection-question-card";

export function ProjectionCenter() {
  const { session, responses, activeStudents } = useCockpitData();
  const { updateSession, onModuleComplete } = useCockpitActions();

  const moduleInfo = getModuleByDb(session.current_module, session.current_seance || 1);
  const seance = session.current_seance || 1;
  const maxSituations = session.current_module === 1 && seance === 1
    ? 8
    : session.current_module === 4
      ? 8
      : getSeanceMax(session.current_module, seance);
  const currentIndex = session.current_situation_index || 0;

  // Question text — from situationData or fallback
  const situationData = session as unknown as Record<string, unknown>;
  const questionText =
    (situationData?.current_question_text as string | undefined) ??
    moduleInfo?.title ??
    null;

  // Category label
  const categoryKey = (session as unknown as Record<string, unknown>)?.current_category as string | undefined;
  const categoryLabel = categoryKey
    ? (CATEGORY_COLORS[categoryKey] ? categoryKey : moduleInfo?.subtitle ?? "Module")
    : (moduleInfo?.subtitle ?? "Module");

  // Response count
  const respondedCount = responses.length;
  const totalActive = activeStudents.length;
  const progressPct = totalActive > 0 ? Math.round((respondedCount / totalActive) * 100) : 0;

  const isResponding = session.status === "responding";
  const isReviewing = session.status === "reviewing";
  const isLastQuestion = currentIndex >= maxSituations - 1;

  function handleReveal() {
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

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* Question card — Direction C, 24px min (Phase 0 compliance) */}
      <ProjectionQuestionCard
        questionText={questionText}
        categoryLabel={categoryLabel}
        currentIndex={currentIndex}
        maxSituations={maxSituations}
      />

      {/* Progress section */}
      <div className="space-y-2">
        {/* Bar */}
        <div className="h-2 rounded-full bg-[#E8DFD2] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#4ECDC4] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Counter */}
        <p className="text-center text-sm text-[#4A4A4A]">
          <span className="font-bold text-[#2C2C2C]">{respondedCount}</span>
          {" / "}
          <span className="font-bold text-[#2C2C2C]">{totalActive}</span>
          {" élèves ont répondu"}
        </p>
      </div>

      {/* CTA */}
      {isResponding && (
        <button
          onClick={handleReveal}
          className="w-full min-h-11 rounded-xl bg-[#FF6B35] hover:bg-[#e55a24] text-white font-bold text-base transition-colors cursor-pointer"
        >
          Révéler les réponses
        </button>
      )}

      {isReviewing && (
        <button
          onClick={handleNext}
          className="w-full min-h-11 rounded-xl bg-[#2C2C2C] hover:bg-[#4A4A4A] text-white font-bold text-base transition-colors cursor-pointer"
        >
          {isLastQuestion ? "Terminer le module" : "Question suivante →"}
        </button>
      )}
    </div>
  );
}
