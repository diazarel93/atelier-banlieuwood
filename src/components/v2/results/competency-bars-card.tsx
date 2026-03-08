"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";
import { StatRing } from "@/components/v2/stat-ring";
import type { FeedbackData } from "@/hooks/use-results-data";

interface CompetencyBarsCardProps {
  feedback: FeedbackData;
}

export function CompetencyBarsCard({ feedback }: CompetencyBarsCardProps) {
  return (
    <div className="space-y-4">
      {/* Overall score + summary */}
      <GlassCardV2 className="p-5">
        <div className="flex items-center gap-5">
          <StatRing
            value={feedback.overallScore}
            label="Score"
            color={
              feedback.overallScore >= 60
                ? "#4ECDC4"
                : feedback.overallScore >= 30
                ? "#F59E0B"
                : "#EF4444"
            }
            size={72}
            strokeWidth={5}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-bw-heading">
              {feedback.groupProfile}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-bw-muted mt-1">
              <span>{feedback.stats.totalResponses} réponses</span>
              <span>{feedback.stats.participationRate}% participation</span>
              <span>~{feedback.stats.avgResponseLength} car./réponse</span>
            </div>
          </div>
        </div>

        {/* Strengths & Weakness */}
        {(feedback.strengths || feedback.weakness) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {feedback.strengths && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                  Point fort
                </span>
                <p className="text-xs text-bw-heading mt-1">
                  {feedback.strengths.detail}
                </p>
              </div>
            )}
            {feedback.weakness && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                  Progression
                </span>
                <p className="text-xs text-bw-heading mt-1">
                  {feedback.weakness.detail}
                </p>
              </div>
            )}
          </div>
        )}
      </GlassCardV2>

      {/* Competency bars */}
      <GlassCardV2 className="p-5 space-y-3">
        <p className="text-xs font-semibold text-bw-heading uppercase tracking-wide">
          Compétences narratives
        </p>
        {feedback.competencies.map((comp) => (
          <div key={comp.key} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-bw-heading">{comp.label}</span>
              <span className="text-xs text-bw-muted">{comp.detail}</span>
            </div>
            <div className="w-full bg-[var(--color-bw-border-subtle)] rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${comp.score}%`,
                  backgroundColor:
                    comp.score >= 60
                      ? "#4ECDC4"
                      : comp.score >= 30
                      ? "#F59E0B"
                      : "#999",
                }}
              />
            </div>
          </div>
        ))}
      </GlassCardV2>
    </div>
  );
}
