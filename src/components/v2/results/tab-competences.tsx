"use client";

import { StatsKpiRow } from "@/components/v2/stats-kpi-row";
import type { FeedbackData } from "@/hooks/use-results-data";
import { CompetencyBarsCard } from "./competency-bars-card";
import { ParticipationTable } from "./participation-table";

interface TabCompetencesProps {
  feedback: FeedbackData | null;
}

export function TabCompetences({ feedback }: TabCompetencesProps) {
  return (
    <div className="space-y-8">
      {/* Educational feedback */}
      {feedback && (
        <>
          <CompetencyBarsCard feedback={feedback} />
          <ParticipationTable students={feedback.students} />
        </>
      )}

      {/* Empty state */}
      {!feedback && (
        <div className="py-12 text-center">
          <p className="text-sm text-bw-muted">
            Pas encore de données de compétences pour cette séance.
          </p>
        </div>
      )}
    </div>
  );
}
