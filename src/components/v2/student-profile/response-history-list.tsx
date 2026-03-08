"use client";

import { GlassCardV2 } from "../glass-card";

interface RecentResponse {
  id: string;
  situationLabel: string;
  textResponse: string | null;
  aiScore: number | null;
  createdAt: string;
}

interface ResponseHistoryListProps {
  responses: RecentResponse[];
}

function scoreColor(score: number | null): string {
  if (score === null) return "text-bw-muted";
  if (score < 2) return "text-red-500";
  if (score < 3) return "text-amber-500";
  return "text-emerald-500";
}

export function ResponseHistoryList({ responses }: ResponseHistoryListProps) {
  if (responses.length === 0) {
    return (
      <GlassCardV2 className="p-4">
        <h3 className="text-xs font-semibold text-bw-heading uppercase tracking-wide mb-3">
          Réponses récentes
        </h3>
        <p className="text-sm text-bw-muted text-center py-6">
          Aucune réponse enregistrée
        </p>
      </GlassCardV2>
    );
  }

  return (
    <GlassCardV2 className="p-4">
      <h3 className="text-xs font-semibold text-bw-heading uppercase tracking-wide mb-3">
        Réponses récentes
      </h3>
      <div className="flex flex-col divide-y divide-[var(--color-bw-border-subtle)]">
        {responses.map((r) => (
          <div key={r.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-bw-muted mb-1">
                  {r.situationLabel}
                </p>
                {r.textResponse && (
                  <p className="text-sm text-bw-heading line-clamp-2">
                    {r.textResponse}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {r.aiScore !== null && (
                  <span
                    className={`text-sm font-bold tabular-nums ${scoreColor(r.aiScore)}`}
                  >
                    {r.aiScore.toFixed(1)}
                  </span>
                )}
                <span className="text-xs text-bw-muted">
                  {new Date(r.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCardV2>
  );
}
