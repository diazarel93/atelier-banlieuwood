"use client";

import { useQuery } from "@tanstack/react-query";
import { AXES, type AxesScores } from "@/lib/axes-mapping";
import { GlassCardV2 } from "../glass-card";

interface ProgressionPoint {
  sessionId: string;
  sessionTitle: string;
  date: string;
  axes: AxesScores;
}

interface ProgressionData {
  studentId: string;
  displayName: string;
  points: ProgressionPoint[];
}

interface ProgressionChartProps {
  studentId: string;
}

export function ProgressionChart({ studentId }: ProgressionChartProps) {
  const { data, isLoading } = useQuery<ProgressionData>({
    queryKey: ["student-progression", studentId],
    queryFn: () => fetch(`/api/v2/student-progression?studentId=${studentId}`).then((r) => r.json()),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <GlassCardV2 className="p-5">
        <div className="h-48 animate-pulse rounded-lg bg-bw-surface/50" />
      </GlassCardV2>
    );
  }

  if (!data || data.points.length === 0) return null;

  const { points } = data;
  const n = points.length;
  const width = 500;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 35 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const xStep = n > 1 ? chartW / (n - 1) : chartW / 2;

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <GlassCardV2 className="p-5">
      <h3 className="label-caps mb-3">Progression par séance</h3>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Progression des compétences par séance"
      >
        {/* Grid lines */}
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

        {/* Trend lines per axis */}
        {AXES.map((axis) => (
          <polyline
            key={axis.key}
            points={points
              .map((p, i) => {
                const x = padding.left + (n > 1 ? i * xStep : chartW / 2);
                const y = padding.top + chartH - (p.axes[axis.key] / 100) * chartH;
                return `${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke={axis.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Data points */}
        {AXES.map((axis) =>
          points.map((p, i) => {
            const x = padding.left + (n > 1 ? i * xStep : chartW / 2);
            const y = padding.top + chartH - (p.axes[axis.key] / 100) * chartH;
            return (
              <circle
                key={`${axis.key}-${i}`}
                cx={x}
                cy={y}
                r="3"
                fill="var(--card)"
                stroke={axis.color}
                strokeWidth="2"
              >
                <title>
                  {axis.label}: {p.axes[axis.key]}% — {p.sessionTitle}
                </title>
              </circle>
            );
          }),
        )}

        {/* X-axis labels */}
        {points.map((p, i) => {
          const x = padding.left + (n > 1 ? i * xStep : chartW / 2);
          const label = new Date(p.date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
          });
          return (
            <text key={i} x={x} y={height - 6} textAnchor="middle" className="fill-bw-muted" fontSize="10">
              {label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-2">
        {AXES.map((axis) => (
          <div key={axis.key} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: axis.color }} />
            <span className="text-body-xs text-bw-muted">{axis.label}</span>
          </div>
        ))}
      </div>
    </GlassCardV2>
  );
}
