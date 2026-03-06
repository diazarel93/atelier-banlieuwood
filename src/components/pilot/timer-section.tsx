"use client";

import { useState } from "react";

export interface TimerSectionProps {
  sessionStatus: string;
  timerEndsAt: string | null;
  currentSituationIndex: number;
  totalSituations?: number;
  isStandardQA: boolean;
  onSetTimer: (timerEndsAt: string) => void;
  onPrevQuestion: () => void;
  onCloseResponses: () => void;
}

/** Estimate remaining time based on ~90s per question */
function formatEstimate(remaining: number): string {
  const mins = Math.ceil((remaining * 1.5)); // ~90s per Q = 1.5 min
  if (mins <= 1) return "~1 min";
  if (mins < 60) return `~${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `~${h}h${m.toString().padStart(2, "0")}` : `~${h}h`;
}

export function TimerSection({
  sessionStatus,
  timerEndsAt,
  currentSituationIndex,
  totalSituations,
  isStandardQA,
  onSetTimer,
  onPrevQuestion,
  onCloseResponses,
}: TimerSectionProps) {
  const [customTimerOpen, setCustomTimerOpen] = useState(false);
  const [customTimerValue, setCustomTimerValue] = useState("");

  const remainingQuestions = totalSituations != null ? totalSituations - currentSituationIndex - 1 : null;

  return (
    <div className="flex items-center gap-1.5">
      {/* Progress + time estimate badge */}
      {totalSituations != null && totalSituations > 0 && (
        <div className="flex items-center gap-1.5 mr-1">
          <span className="text-xs text-bw-muted tabular-nums">
            Q{currentSituationIndex + 1}/{totalSituations}
          </span>
          {remainingQuestions != null && remainingQuestions > 0 && (
            <span className="text-xs text-bw-muted/60" title={`${remainingQuestions} questions restantes, estimation basée sur ~90s/question`}>
              ({formatEstimate(remainingQuestions)})
            </span>
          )}
          <div className="w-16 h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-bw-teal/50 transition-all duration-500"
              style={{ width: `${((currentSituationIndex + 1) / totalSituations) * 100}%` }}
            />
          </div>
        </div>
      )}

      {(sessionStatus === "responding" || sessionStatus === "voting") && !timerEndsAt ? (
        <>
          <span className="text-xs text-bw-muted">Timer</span>
          {[30, 60, 120, 180, 300].map((sec) => (
            <button key={sec}
              onClick={() => onSetTimer(new Date(Date.now() + sec * 1000).toISOString())}
              className="px-2 py-1 rounded-lg text-xs bg-bw-elevated border border-white/[0.06] hover:border-white/15 text-bw-text cursor-pointer transition-colors duration-200">
              {sec < 60 ? `${sec}s` : `${sec / 60}m`}
            </button>
          ))}
          {customTimerOpen ? (
            <div className="flex items-center gap-1">
              <input type="number" min="10" max="600" value={customTimerValue} onChange={(e) => setCustomTimerValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && customTimerValue) { onSetTimer(new Date(Date.now() + parseInt(customTimerValue) * 1000).toISOString()); setCustomTimerOpen(false); setCustomTimerValue(""); } }}
                placeholder="sec" autoFocus
                className="w-14 px-1.5 py-1 rounded-lg text-xs bg-bw-surface border border-white/[0.06] text-white outline-none focus:border-bw-primary/40" />
              <button onClick={() => setCustomTimerOpen(false)} className="text-xs text-bw-muted cursor-pointer">✕</button>
            </div>
          ) : (
            <button onClick={() => setCustomTimerOpen(true)} title="Timer personnalisé"
              className="px-2 py-1 rounded-lg text-xs bg-bw-elevated border border-white/[0.06] hover:border-white/15 text-bw-muted cursor-pointer transition-colors duration-200">
              ⏱️
            </button>
          )}
        </>
      ) : (
        <>
          {/* Retour question précédente */}
          {currentSituationIndex > 0 && sessionStatus === "waiting" && (
            <button onClick={onPrevQuestion} title="Question précédente"
              className="px-2.5 py-1 rounded-lg text-xs bg-bw-elevated border border-white/[0.06] hover:border-white/15 text-bw-muted hover:text-white cursor-pointer transition-colors duration-200">
              ← Précédente
            </button>
          )}
          {/* Fermer les réponses (non-QA modules during responding) */}
          {!isStandardQA && sessionStatus === "responding" && (
            <button onClick={onCloseResponses} title="Fermer les réponses"
              className="px-2.5 py-1 rounded-lg text-xs bg-bw-amber/10 border border-bw-amber/20 hover:border-bw-amber/40 text-bw-amber cursor-pointer transition-colors duration-200">
              Fermer les réponses
            </button>
          )}
        </>
      )}
    </div>
  );
}
