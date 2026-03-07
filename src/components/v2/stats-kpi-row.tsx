"use client";

import { cn } from "@/lib/utils";
import { StatRing } from "./stat-ring";
import { AXES, type AxesScores } from "@/lib/axes-mapping";

interface StatsKpiRowProps {
  scores: AxesScores;
  className?: string;
}

export function StatsKpiRow({ scores, className }: StatsKpiRowProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-4", className)}>
      {AXES.map((axis) => (
        <div
          key={axis.key}
          className="flex flex-col items-center gap-2 rounded-2xl bg-white border border-[var(--color-bw-border)] p-4"
        >
          <StatRing
            value={scores[axis.key]}
            label={axis.label}
            color={axis.color}
            size={72}
            strokeWidth={5}
          />
        </div>
      ))}
    </div>
  );
}
