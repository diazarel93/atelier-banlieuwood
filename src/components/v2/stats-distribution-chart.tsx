"use client";

import { cn } from "@/lib/utils";
import { AXES, type AxesScores } from "@/lib/axes-mapping";
import { GlassCardV2 } from "./glass-card";

interface StatsDistributionChartProps {
  scores: AxesScores;
  sessionCount: number;
  studentCount: number;
  className?: string;
}

/**
 * Donut SVG chart showing the relative distribution of the 4 axes.
 */
export function StatsDistributionChart({
  scores,
  sessionCount,
  studentCount,
  className,
}: StatsDistributionChartProps) {
  const total = scores.comprehension + scores.creativite + scores.expression + scores.engagement;
  const segments = AXES.map((axis) => ({
    ...axis,
    value: scores[axis.key],
    pct: total > 0 ? (scores[axis.key] / total) * 100 : 25,
  }));

  // Build SVG donut
  const size = 140;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <GlassCardV2 className={cn("p-5", className)}>
      <h3 className="text-xs font-semibold text-bw-muted uppercase tracking-wide mb-4">
        Distribution des compétences
      </h3>

      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            {segments.map((seg) => {
              const dashLength = (seg.pct / 100) * circumference;
              const offset = circumference - dashLength;
              const rotation = (accumulated / 100) * 360;
              accumulated += seg.pct;

              return (
                <circle
                  key={seg.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={0}
                  transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-bw-heading tabular-nums">
              {studentCount}
            </span>
            <span className="text-[10px] text-bw-muted">élèves</span>
          </div>
        </div>

        {/* Legend + stats */}
        <div className="flex flex-col gap-3 flex-1">
          {segments.map((seg) => (
            <div key={seg.key} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-xs text-bw-heading font-medium flex-1">
                {seg.label}
              </span>
              <span className="text-xs text-bw-muted tabular-nums">
                {Math.round(seg.pct)}%
              </span>
            </div>
          ))}
          <div className="mt-1 pt-2 border-t border-[var(--color-bw-border-subtle)] text-xs text-bw-muted">
            {sessionCount} séance{sessionCount !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </GlassCardV2>
  );
}
