"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";
import { StatRing } from "@/components/v2/stat-ring";

interface LiveParticipationCardProps {
  respondedCount: number;
  totalStudents: number;
}

export function LiveParticipationCard({
  respondedCount,
  totalStudents,
}: LiveParticipationCardProps) {
  const rate = totalStudents > 0
    ? Math.round((respondedCount / totalStudents) * 100)
    : 0;

  return (
    <GlassCardV2 className="p-5">
      <h3 className="label-caps mb-3">Participation en direct</h3>
      <div className="flex items-center gap-5">
        <StatRing
          value={rate}
          label="Répondu"
          color="var(--color-bw-teal)"
          size={72}
          strokeWidth={6}
        />
        <div className="space-y-1">
          <p className="text-2xl font-bold tabular-nums text-bw-heading">
            {respondedCount}
            <span className="text-sm font-normal text-bw-muted">
              /{totalStudents}
            </span>
          </p>
          <p className="text-xs text-bw-muted">
            {totalStudents - respondedCount > 0
              ? `${totalStudents - respondedCount} en attente`
              : "Tout le monde a répondu"}
          </p>
        </div>
      </div>
    </GlassCardV2>
  );
}
