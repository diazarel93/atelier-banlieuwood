"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";
import type { FeedbackData } from "@/hooks/use-results-data";

interface ParticipationTableProps {
  students: FeedbackData["students"];
}

export function ParticipationTable({ students }: ParticipationTableProps) {
  if (students.length === 0) return null;

  return (
    <GlassCardV2 className="p-5">
      <p className="label-caps text-bw-muted mb-3">Participation des élèves</p>
      <div className="space-y-2">
        {students.slice(0, 15).map((s) => (
          <div key={s.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[var(--color-bw-surface-dim)]">
            <span className="text-lg">{s.avatar}</span>
            <span className="text-sm text-bw-heading flex-1 truncate">{s.name}</span>
            <span className="text-xs text-bw-muted tabular-nums border border-[var(--color-bw-border)] rounded-md px-1.5 py-0.5">
              {s.responses} rép.
            </span>
            {s.chosenCount > 0 && (
              <span className="text-xs text-bw-primary tabular-nums border border-bw-primary/20 rounded-md px-1.5 py-0.5">
                {s.chosenCount} choisi{s.chosenCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        ))}
      </div>
    </GlassCardV2>
  );
}
