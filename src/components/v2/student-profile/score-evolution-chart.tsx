"use client";

import { AXES, type AxesScores } from "@/lib/axes-mapping";
import { GlassCardV2 } from "../glass-card";

interface SessionScore {
  date: string;
  sessionTitle: string;
  scores: AxesScores;
}

interface ScoreEvolutionChartProps {
  sessions: SessionScore[];
}

export function ScoreEvolutionChart({ sessions }: ScoreEvolutionChartProps) {
  if (sessions.length === 0) {
    return (
      <GlassCardV2 className="p-5">
        <h3 className="label-caps mb-3">Évolution des scores</h3>
        <div className="flex flex-col items-center py-6 text-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-bw-muted mb-2"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <p className="text-body-xs text-bw-muted">L&apos;évolution sera visible après plusieurs séances</p>
        </div>
      </GlassCardV2>
    );
  }

  const width = 500;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 35 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const n = sessions.length;
  const xStep = n > 1 ? chartW / (n - 1) : chartW / 2;

  // Y-axis gridlines
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <GlassCardV2 className="p-5">
      <h3 className="label-caps mb-3">Évolution des scores</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
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

        {/* Data lines */}
        {AXES.map((axis) => (
          <polyline
            key={axis.key}
            points={sessions
              .map((s, i) => {
                const x = padding.left + (n > 1 ? i * xStep : chartW / 2);
                const y = padding.top + chartH - (s.scores[axis.key] / 100) * chartH;
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
          sessions.map((s, i) => {
            const x = padding.left + (n > 1 ? i * xStep : chartW / 2);
            const y = padding.top + chartH - (s.scores[axis.key] / 100) * chartH;
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
                  {axis.label}: {s.scores[axis.key]}% — {s.sessionTitle}
                </title>
              </circle>
            );
          }),
        )}

        {/* X-axis labels (session dates) */}
        {sessions.map((s, i) => {
          const x = padding.left + (n > 1 ? i * xStep : chartW / 2);
          const label = new Date(s.date).toLocaleDateString("fr-FR", {
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
