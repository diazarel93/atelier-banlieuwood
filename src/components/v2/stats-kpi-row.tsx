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
          className="relative flex flex-col items-center gap-2 rounded-2xl bg-card overflow-hidden border border-[var(--color-bw-border)] p-5"
        >
          {/* Colored top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ backgroundColor: axis.color }}
          />
          <StatRing
            value={scores[axis.key]}
            label=""
            color={axis.color}
            size={72}
            strokeWidth={5}
          />
          <span
            className="text-body-xs font-semibold uppercase tracking-wider"
            style={{ color: axis.color }}
          >
            {axis.label}
          </span>
        </div>
      ))}
    </div>
  );
}
