"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlassCardV2 } from "./glass-card";
import { AXES, type AxisKey, type AxesScores } from "@/lib/axes-mapping";

interface StudentEvolution {
  id: string;
  displayName: string;
  avatar: string | null;
  points: {
    sessionId: string;
    sessionTitle: string;
    date: string;
    axes: AxesScores;
  }[];
}

interface EvolutionData {
  sessions: { id: string; title: string; date: string }[];
  students: StudentEvolution[];
}

const STUDENT_COLORS = [
  "#6366F1",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#F97316",
  "#84CC16",
  "#14B8A6",
];

interface ClassEvolutionChartProps {
  classLabel?: string | null;
}

export function ClassEvolutionChart({ classLabel }: ClassEvolutionChartProps) {
  const [selectedAxis, setSelectedAxis] = useState<AxisKey>("comprehension");

  const { data, isLoading } = useQuery<EvolutionData>({
    queryKey: ["class-evolution", classLabel],
    queryFn: () => {
      const params = new URLSearchParams();
      if (classLabel) params.set("classLabel", classLabel);
      return fetch(`/api/v2/class-students-evolution?${params}`).then((r) => r.json());
    },
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <GlassCardV2 className="p-5">
        <div className="h-48 animate-pulse rounded-lg bg-bw-surface/50" />
      </GlassCardV2>
    );
  }

  // Need at least 2 sessions and 2 students with 2+ points
  const eligible = (data?.students || []).filter((s) => s.points.length >= 2);
  if (!data || data.sessions.length < 2 || eligible.length < 2) {
    return (
      <GlassCardV2 className="p-5 text-center">
        <h3 className="label-caps mb-2">Évolution par élève</h3>
        <p className="text-sm text-bw-muted">Disponible avec 2+ séances et 2+ élèves</p>
      </GlassCardV2>
    );
  }

  const axis = AXES.find((a) => a.key === selectedAxis)!;
  const students = eligible.slice(0, 10); // cap at 10 for readability
  const sessions = data.sessions;

  const width = 500;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 35 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const n = sessions.length;
  const xStep = n > 1 ? chartW / (n - 1) : chartW / 2;
  const sessionIndexMap = new Map(sessions.map((s, i) => [s.id, i]));
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <GlassCardV2 className="p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="label-caps">Évolution par élève</h3>
        <div className="flex gap-1">
          {AXES.map((a) => (
            <button
              key={a.key}
              onClick={() => setSelectedAxis(a.key)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                selectedAxis === a.key ? "text-white" : "text-bw-muted hover:bg-bw-surface"
              }`}
              style={selectedAxis === a.key ? { backgroundColor: a.color } : undefined}
            >
              {a.shortLabel}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Évolution des élèves — axe ${axis.shortLabel}`}
      >
        {/* Grid */}
        {yTicks.map((tick) => {
          const y = padding.top + chartH - (tick / 100) * chartH;
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="var(--color-bw-border-subtle)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-bw-muted" fontSize="10">
                {tick}
              </text>
            </g>
          );
        })}

        {/* Student lines */}
        {students.map((student, si) => {
          const color = STUDENT_COLORS[si % STUDENT_COLORS.length];
          const validPoints = student.points
            .map((p) => {
              const idx = sessionIndexMap.get(p.sessionId);
              if (idx === undefined) return null;
              return { idx, score: p.axes[selectedAxis] };
            })
            .filter(Boolean) as { idx: number; score: number }[];

          if (validPoints.length < 2) return null;

          const pathPoints = validPoints
            .map((vp) => {
              const x = padding.left + vp.idx * xStep;
              const y = padding.top + chartH - (vp.score / 100) * chartH;
              return `${x},${y}`;
            })
            .join(" ");

          return (
            <g key={student.id}>
              <polyline
                points={pathPoints}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.8}
              />
              {validPoints.map((vp, pi) => {
                const x = padding.left + vp.idx * xStep;
                const y = padding.top + chartH - (vp.score / 100) * chartH;
                return (
                  <circle key={pi} cx={x} cy={y} r="2.5" fill="var(--card)" stroke={color} strokeWidth="1.5">
                    <title>
                      {student.displayName}: {vp.score}%
                    </title>
                  </circle>
                );
              })}
            </g>
          );
        })}

        {/* X-axis labels */}
        {sessions.map((s, i) => {
          const x = padding.left + (n > 1 ? i * xStep : chartW / 2);
          const label = new Date(s.date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
          });
          return (
            <text key={i} x={x} y={height - 6} textAnchor="middle" className="fill-bw-muted" fontSize="9">
              {label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
        {students.map((s, si) => (
          <div key={s.id} className="flex items-center gap-1 text-xs text-bw-muted">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                backgroundColor: STUDENT_COLORS[si % STUDENT_COLORS.length],
              }}
            />
            <span className="truncate max-w-[100px]">{s.displayName}</span>
          </div>
        ))}
      </div>
    </GlassCardV2>
  );
}
