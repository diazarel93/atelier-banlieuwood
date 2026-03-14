"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";
import type { M10Pitch } from "@/hooks/use-results-data";

interface PitchListCardProps {
  pitchs: M10Pitch[];
  count: number;
}

export function PitchListCard({ pitchs, count }: PitchListCardProps) {
  const visible = pitchs.filter((p) => p.pitch_text && p.pitch_text.length > 0);
  if (visible.length === 0) return null;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-bw-heading uppercase tracking-wide">
          Pitchs des élèves
        </h3>
        <p className="text-xs text-bw-muted mt-0.5">
          {count} pitch{count > 1 ? "s" : ""} créé{count > 1 ? "s" : ""}
        </p>
      </div>
      <div className="grid gap-3">
        {visible.map((p) => (
          <GlassCardV2 key={p.id} className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base">
                {p.students?.avatar || "👤"}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-bw-heading">
                  {p.module10_personnages?.prenom ||
                    p.students?.display_name ||
                    "Élève"}
                </span>
                {p.module10_personnages?.prenom &&
                  p.students?.display_name && (
                    <span className="text-xs text-bw-muted ml-1.5">
                      ({p.students.display_name})
                    </span>
                  )}
              </div>
              {p.chrono_seconds != null && (
                <span className="text-xs text-bw-muted tabular-nums border border-[var(--color-bw-border)] rounded-md px-1.5 py-0.5">
                  {p.chrono_seconds}s
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <span className="text-xs rounded-md bg-[var(--color-bw-surface-dim)] px-1.5 py-0.5 text-bw-muted">
                Objectif : {p.objectif}
              </span>
              <span className="text-xs rounded-md bg-[var(--color-bw-danger-100)] px-1.5 py-0.5 text-red-600 dark:text-red-400">
                Obstacle : {p.obstacle}
              </span>
            </div>
            <p className="text-sm text-bw-heading leading-relaxed whitespace-pre-wrap">
              {p.pitch_text}
            </p>
          </GlassCardV2>
        ))}
      </div>
    </div>
  );
}
