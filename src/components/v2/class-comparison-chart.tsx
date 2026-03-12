"use client";

import { useQuery } from "@tanstack/react-query";
import { GlassCardV2 } from "./glass-card";
import { AXES, type AxesScores } from "@/lib/axes-mapping";

interface ClassData {
  classLabel: string;
  averageScores: AxesScores;
  studentCount: number;
  scoredStudentCount: number;
  sessionCount: number;
}

interface ComparisonData {
  classes: ClassData[];
  globalAverage: AxesScores;
  totalStudents: number;
  totalSessions: number;
}

const CLASS_COLORS = [
  "#6366F1", "#EC4899", "#F59E0B", "#10B981", "#8B5CF6",
  "#EF4444", "#06B6D4", "#F97316",
];

export function ClassComparisonChart() {
  const { data, isLoading } = useQuery<ComparisonData>({
    queryKey: ["class-comparison"],
    queryFn: () => fetch("/api/v2/class-comparison").then((r) => r.json()),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <GlassCardV2 className="p-5">
        <div className="h-48 animate-pulse rounded-lg bg-bw-surface/50" />
      </GlassCardV2>
    );
  }

  if (!data || data.classes.length < 2) {
    return (
      <GlassCardV2 className="p-5 text-center">
        <p className="text-sm text-bw-muted">
          Comparaison disponible avec 2+ classes
        </p>
      </GlassCardV2>
    );
  }

  const maxScore = 100;
  const barWidth = 600;
  const barHeight = 28;
  const labelWidth = 120;
  const gap = 6;
  const classCount = data.classes.length;
  const axisBlockHeight = classCount * (barHeight + gap) + 40;
  const totalHeight = AXES.length * axisBlockHeight + 20;

  return (
    <GlassCardV2 className="p-5">
      <h3 className="label-caps mb-1">Comparaison des classes</h3>
      <p className="text-xs text-bw-muted mb-4">
        {data.totalStudents} élèves · {data.totalSessions} séances · {data.classes.length} classes
      </p>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${labelWidth + barWidth + 60} ${totalHeight}`}
          className="w-full"
          style={{ minWidth: 500 }}
        >
          {AXES.map((axis, ai) => {
            const yBase = ai * axisBlockHeight;
            return (
              <g key={axis.key}>
                {/* Axis label */}
                <text
                  x={0}
                  y={yBase + 16}
                  fontSize={13}
                  fontWeight={600}
                  fill="var(--color-bw-heading)"
                >
                  {axis.label}
                </text>

                {/* Bars per class */}
                {data.classes.map((cls, ci) => {
                  const score = cls.averageScores[axis.key];
                  const y = yBase + 28 + ci * (barHeight + gap);
                  const w = (score / maxScore) * barWidth;
                  const color = CLASS_COLORS[ci % CLASS_COLORS.length];

                  return (
                    <g key={cls.classLabel}>
                      {/* Background bar */}
                      <rect
                        x={labelWidth}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx={6}
                        fill="var(--color-bw-surface)"
                        opacity={0.5}
                      />
                      {/* Score bar */}
                      <rect
                        x={labelWidth}
                        y={y}
                        width={Math.max(4, w)}
                        height={barHeight}
                        rx={6}
                        fill={color}
                        opacity={0.85}
                      />
                      {/* Class label */}
                      <text
                        x={labelWidth - 8}
                        y={y + barHeight / 2 + 4}
                        fontSize={11}
                        fill="var(--color-bw-muted)"
                        textAnchor="end"
                      >
                        {cls.classLabel.length > 14
                          ? cls.classLabel.slice(0, 14) + "…"
                          : cls.classLabel}
                      </text>
                      {/* Score value */}
                      <text
                        x={labelWidth + Math.max(4, w) + 8}
                        y={y + barHeight / 2 + 4}
                        fontSize={12}
                        fontWeight={600}
                        fill={color}
                      >
                        {score}
                      </text>
                    </g>
                  );
                })}

                {/* Global average line */}
                {(() => {
                  const avgX =
                    labelWidth + (data.globalAverage[axis.key] / maxScore) * barWidth;
                  const yStart = yBase + 24;
                  const yEnd = yBase + 28 + classCount * (barHeight + gap);
                  return (
                    <line
                      x1={avgX}
                      y1={yStart}
                      x2={avgX}
                      y2={yEnd}
                      stroke="var(--color-bw-muted)"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      opacity={0.6}
                    />
                  );
                })()}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {data.classes.map((cls, ci) => (
          <div key={cls.classLabel} className="flex items-center gap-1.5 text-xs text-bw-muted">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: CLASS_COLORS[ci % CLASS_COLORS.length] }}
            />
            {cls.classLabel}
            <span className="opacity-60">({cls.studentCount} él.)</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-bw-muted">
          <div className="w-4 h-0 border-t-2 border-dashed border-bw-muted" />
          Moyenne globale
        </div>
      </div>
    </GlassCardV2>
  );
}
