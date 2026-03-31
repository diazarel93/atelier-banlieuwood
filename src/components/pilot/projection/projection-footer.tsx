"use client";

import { useCockpitData, useCockpitActions } from "@/components/pilot/cockpit-context";
import { getSeanceMax } from "@/lib/constants";

interface ProjectionFooterProps {
  onOpenClasse: () => void;
  onOpenReponses: () => void;
  classeCount: number;
  reponseCount: number;
}

export function ProjectionFooter({ onOpenClasse, onOpenReponses, classeCount, reponseCount }: ProjectionFooterProps) {
  const { session, activeStudents } = useCockpitData();
  const { updateSession, onModuleComplete } = useCockpitActions();

  const seance = session.current_seance || 1;
  const currentIndex = session.current_situation_index || 0;
  const maxSituations =
    session.current_module === 1 && seance === 1
      ? 8
      : session.current_module === 4
        ? 8
        : getSeanceMax(session.current_module, seance);
  const isLastQuestion = currentIndex >= maxSituations - 1;
  const isResponding = session.status === "responding";
  const isReviewing = session.status === "reviewing";

  function handleCTA() {
    if (isResponding) {
      updateSession.mutate({ status: "reviewing" });
    } else if (isReviewing) {
      if (isLastQuestion) {
        onModuleComplete();
      } else {
        updateSession.mutate({
          current_situation_index: currentIndex + 1,
          status: "responding",
        });
      }
    }
  }

  const ctaLabel = isResponding ? "Révéler" : isLastQuestion ? "Terminer" : "Suivant →";

  const totalActive = activeStudents.length;

  return (
    <footer className="lg:hidden flex items-center justify-between px-4 py-2 border-t border-[#E8DFD2] bg-[#F7F3EA] flex-shrink-0">
      {/* Classe button */}
      <button
        onClick={onOpenClasse}
        className="relative flex items-center gap-1.5 min-h-11 px-4 rounded-xl bg-[#E8DFD2] text-[#2C2C2C] text-sm font-semibold hover:bg-[#DDD4C4] transition-colors cursor-pointer"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        Classe
        {classeCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF6B35] text-white text-[10px] font-bold">
            {classeCount > totalActive ? totalActive : classeCount}
          </span>
        )}
      </button>

      {/* CTA central */}
      {(isResponding || isReviewing) && (
        <button
          onClick={handleCTA}
          className="min-h-11 px-6 rounded-xl bg-[#FF6B35] hover:bg-[#e55a24] text-white font-bold text-sm transition-colors cursor-pointer"
        >
          {ctaLabel}
        </button>
      )}

      {/* Réponses button */}
      <button
        onClick={onOpenReponses}
        className="relative flex items-center gap-1.5 min-h-11 px-4 rounded-xl bg-[#E8DFD2] text-[#2C2C2C] text-sm font-semibold hover:bg-[#DDD4C4] transition-colors cursor-pointer"
      >
        Réponses
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {reponseCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#4ECDC4] text-white text-[10px] font-bold">
            {reponseCount}
          </span>
        )}
      </button>
    </footer>
  );
}
