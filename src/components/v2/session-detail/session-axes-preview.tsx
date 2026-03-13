"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { StatRing } from "@/components/v2/stat-ring";
import { AXES, type AxesScores } from "@/lib/axes-mapping";
import { ROUTES } from "@/lib/routes";

interface SessionAxesPreviewProps {
  sessionId: string;
}

export function SessionAxesPreview({ sessionId }: SessionAxesPreviewProps) {
  const { data, isLoading } = useQuery<{
    classAverage: AxesScores;
    students: unknown[];
  }>({
    queryKey: ["v2-stats-session", sessionId],
    queryFn: () =>
      fetch(`/api/v2/stats?sessionId=${sessionId}`).then((r) => r.json()),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <GlassCardV2 className="p-5">
        <div className="h-24 animate-pulse rounded-lg bg-bw-surface/50" />
      </GlassCardV2>
    );
  }

  if (!data || data.students.length === 0) return null;

  const avg = data.classAverage;

  return (
    <GlassCardV2 className="p-5">
      <h3 className="label-caps mb-3">Axes de la classe</h3>
      <div className="grid grid-cols-4 gap-2">
        {AXES.map((axis) => (
          <StatRing
            key={axis.key}
            value={avg[axis.key]}
            label={axis.shortLabel}
            color={axis.color}
            size={56}
            strokeWidth={5}
          />
        ))}
      </div>
      <Link
        href={ROUTES.statistiques}
        className="mt-3 block text-xs text-center text-bw-muted hover:text-bw-heading transition-colors"
      >
        Voir les stats complètes &rarr;
      </Link>
    </GlassCardV2>
  );
}
