"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useCockpitData, useCockpitActions } from "@/components/pilot/cockpit-context";
import { getModuleByDb } from "@/lib/modules-data";
import { CATEGORY_COLORS, getSeanceMax } from "@/lib/constants";
import { ProjectionQuestionCard } from "./projection-question-card";

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// Modules with a vote phase
const VOTE_MODULES = new Set([2, 3, 4, 9]);

interface ProjectionCenterProps {
  sessionStartedAt: number;
}

export function ProjectionCenter({ sessionStartedAt }: ProjectionCenterProps) {
  const { session, responses, activeStudents, voteData } = useCockpitData();
  const { updateSession, onModuleComplete } = useCockpitActions();

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - sessionStartedAt), 1000);
    return () => clearInterval(id);
  }, [sessionStartedAt]);

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
  const canNext = isReviewing;

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
      updateSession.mutate({ current_situation_index: currentIndex + 1, status: "responding" });
    }
  }
  function handlePrev() {
    if (canGoBack) {
      updateSession.mutate({ current_situation_index: currentIndex - 1, status: "responding" });
    }
  }

  // CTA contextuel selon l'état
  let cta: { label: string; action: () => void; color: string } | null = null;
  if (isResponding) {
    cta = { label: "Révéler les réponses", action: handleReveal, color: "var(--color-bw-primary)" };
  } else if (isVoting) {
    cta = {
      label: `Voir les résultats (${voteData?.totalVotes ?? 0} votes)`,
      action: handleRevealVoteResults,
      color: "var(--color-bw-teal)",
    };
  } else if (isReviewing && isVoteModule && !hasVoteResults) {
    cta = { label: "Lancer le vote", action: handleOpenVote, color: "var(--color-bw-gold)" };
  } else if (isReviewing) {
    cta = { label: isLastQuestion ? "Terminer le module" : "Suivant →", action: handleNext, color: "#2C2C2C" };
  }

  // Gradient + glow par couleur CTA
  function ctaStyle(color: string): React.CSSProperties {
    if (color === "var(--color-bw-primary)")
      return {
        background: "linear-gradient(135deg, var(--color-bw-primary), var(--color-bw-gold))",
        boxShadow: "0 4px 20px rgba(255,107,53,0.35)",
      };
    if (color === "var(--color-bw-teal)")
      return { background: "linear-gradient(135deg, var(--color-bw-teal), #2db8af)" };
    if (color === "var(--color-bw-gold)")
      return { background: "linear-gradient(135deg, var(--color-bw-gold), var(--color-bw-primary))" };
    return { backgroundColor: color };
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5">
      {/* Question card — entrée avec effet blur "projecteur" Direction C */}
      <ProjectionQuestionCard
        questionText={questionText}
        categoryLabel={categoryLabel}
        currentIndex={currentIndex}
        maxSituations={maxSituations}
      />

      {/* Progress bar orange → or */}
      <div className="space-y-2">
        <div className="h-2 rounded-full bg-[#E8DFD2] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, var(--color-bw-primary), var(--color-bw-gold))",
            }}
          />
        </div>
        <p className="text-center text-sm text-[#4A4A4A]">
          <span className="font-bold text-[#2C2C2C]">{respondedCount}</span>
          {" / "}
          <span className="font-bold text-[#2C2C2C]">{totalActive}</span>
          {" élèves ont répondu"}
        </p>
      </div>

      {/* KPI row — 4 colonnes: Répondu / Attente / Taux / Temps */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { v: String(respondedCount), l: "Répondu", c: "var(--color-bw-primary)" },
          { v: String(enAttente), l: "Attente", c: "var(--color-bw-gold)" },
          { v: `${progressPct}%`, l: "Taux", c: "var(--color-bw-teal)" },
          { v: formatElapsed(elapsed), l: "Temps", c: "#a89e8e" },
        ].map((k) => (
          <div key={k.l} className="flex flex-col items-center py-3 rounded-xl" style={{ background: `${k.c}14` }}>
            <span className="text-[20px] font-black tabular-nums" style={{ color: k.c }}>
              {k.v}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#4A4A4A]">{k.l}</span>
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

        {/* CTA central — gradient + glow pulse signature Direction C */}
        {cta && (
          <motion.button
            onClick={cta.action}
            className="flex-1 min-h-11 rounded-2xl text-white font-black uppercase tracking-wider text-sm cursor-pointer"
            style={ctaStyle(cta.color)}
            animate={
              cta.color === "var(--color-bw-primary)"
                ? {
                    boxShadow: [
                      "0 4px 20px rgba(255,107,53,0.35)",
                      "0 4px 32px rgba(255,107,53,0.55)",
                      "0 4px 20px rgba(255,107,53,0.35)",
                    ],
                  }
                : {}
            }
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {cta.label}
          </motion.button>
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
