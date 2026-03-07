"use client";

import { StatsKpiRow } from "@/components/v2/stats-kpi-row";
import { oieToAxes, aggregateAxes } from "@/lib/axes-mapping";
import type { OIEScores } from "@/lib/oie-profile";
import type { FeedbackData } from "@/hooks/use-results-data";
import { CompetencyBarsCard } from "./competency-bars-card";
import { OieProfileSection } from "./oie-profile-section";
import { ParticipationTable } from "./participation-table";

interface TabCompetencesProps {
  feedback: FeedbackData | null;
  oieScores: Record<string, OIEScores>;
}

export function TabCompetences({ feedback, oieScores }: TabCompetencesProps) {
  // Compute 4-axes from OIE scores
  const entries = Object.values(oieScores);
  const studentAxes = entries.map((s) => oieToAxes(s));
  const classAxes = aggregateAxes(studentAxes);
  const hasAxes = entries.length > 0;

  return (
    <div className="space-y-8">
      {/* 4 axes KPI row */}
      {hasAxes && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-bw-heading uppercase tracking-wide">
            4 axes de compétences
          </h3>
          <StatsKpiRow scores={classAxes} />
        </div>
      )}

      {/* OIE Radar profiles */}
      <OieProfileSection scores={oieScores} feedback={feedback} />

      {/* Educational feedback */}
      {feedback && (
        <>
          <CompetencyBarsCard feedback={feedback} />
          <ParticipationTable students={feedback.students} />
        </>
      )}

      {/* Empty state */}
      {!feedback && entries.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-bw-muted">
            Pas encore de données de compétences pour cette séance.
          </p>
        </div>
      )}
    </div>
  );
}
