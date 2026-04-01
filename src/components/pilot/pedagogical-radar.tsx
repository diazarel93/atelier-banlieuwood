"use client";

import { useMemo } from "react";
import { AXES, type AxisKey } from "@/lib/axes-mapping";

// ═══════════════════════════════════════════════════════
// EMOTIONAL RADAR — 4-axis class emotional/pedagogical state
// Compréhension (top) / Expression (right) / Engagement (bottom) / Créativité (left)
// Pure SVG + CSS transitions — no motion library for perf
// ═══════════════════════════════════════════════════════

interface EmotionalRadarProps {
  axes: {
    comprehension: number; // 0-100
    creativite: number; // 0-100
    expression: number; // 0-100
    engagement: number; // 0-100
  };
  size?: number; // default 160
  animated?: boolean; // default true
}

// Axis order for the radar: top → right → bottom → left
// Angles: 270° (top), 0° (right), 90° (bottom), 180° (left)
const RADAR_AXES: { key: AxisKey; angle: number }[] = [
  { key: "comprehension", angle: 270 },
  { key: "expression", angle: 0 },
  { key: "engagement", angle: 90 },
  { key: "creativite", angle: 180 },
];

const CX = 100;
const CY = 100;
const MAX_R = 80;
const RINGS = [0.33, 0.66, 1.0];

function polarToXY(angleDeg: number, radius: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  };
}

function getAxisDef(key: AxisKey) {
  return AXES.find((a) => a.key === key)!;
}

/** Label anchor + baseline helpers for each quadrant position */
function getLabelPosition(angle: number): {
  textAnchor: "start" | "middle" | "end";
  dominantBaseline: "auto" | "middle" | "hanging";
  dx: number;
  dy: number;
} {
  if (angle === 270) return { textAnchor: "middle", dominantBaseline: "auto", dx: 0, dy: -6 };
  if (angle === 0) return { textAnchor: "start", dominantBaseline: "middle", dx: 6, dy: 0 };
  if (angle === 90) return { textAnchor: "middle", dominantBaseline: "hanging", dx: 0, dy: 6 };
  /* 180 */ return { textAnchor: "end", dominantBaseline: "middle", dx: -6, dy: 0 };
}

/** Value text positioned near each dot */
function getValueOffset(angle: number): { dx: number; dy: number } {
  if (angle === 270) return { dx: 10, dy: -2 };
  if (angle === 0) return { dx: 8, dy: -6 };
  if (angle === 90) return { dx: 10, dy: 4 };
  /* 180 */ return { dx: -8, dy: -6 };
}

export function EmotionalRadar({ axes, size = 160, animated = true }: EmotionalRadarProps) {
  // ── Compute data points ──
  const points = useMemo(() => {
    return RADAR_AXES.map(({ key, angle }) => {
      const value = Math.max(0, Math.min(100, axes[key]));
      const r = (value / 100) * MAX_R;
      const { x, y } = polarToXY(angle, r);
      const def = getAxisDef(key);
      return { key, angle, value, x, y, color: def.color, label: def.label };
    });
  }, [axes]);

  // ── Polygon points string ──
  const polygonPoints = useMemo(() => points.map((p) => `${p.x},${p.y}`).join(" "), [points]);

  // ── Vertex positions at max radius (for axis lines + labels) ──
  const vertices = useMemo(() => RADAR_AXES.map(({ angle }) => polarToXY(angle, MAX_R)), []);

  // ── Label positions (slightly outside max radius) ──
  const labelVertices = useMemo(() => RADAR_AXES.map(({ angle }) => polarToXY(angle, MAX_R + 4)), []);

  const transitionStyle = animated ? { transition: "all 500ms ease-out" } : undefined;

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className="overflow-visible">
      <defs>
        {/* Glow filter for vertex dots */}
        <filter id="emotional-radar-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Radial gradient fill mixing all 4 axis colors */}
        <radialGradient id="emotional-radar-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.12} />
          <stop offset="40%" stopColor="#6366F1" stopOpacity={0.08} />
          <stop offset="70%" stopColor="#EC4899" stopOpacity={0.06} />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.04} />
        </radialGradient>

        {/* Linear gradient stroke cycling through all 4 axis colors */}
        <linearGradient id="emotional-radar-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="33%" stopColor="#EC4899" />
          <stop offset="66%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>

      {/* ── Reference circles (33%, 66%, 100%) ── */}
      {RINGS.map((pct) => (
        <circle
          key={pct}
          cx={CX}
          cy={CY}
          r={MAX_R * pct}
          fill="none"
          stroke="rgba(61,43,16,0.15)"
          strokeWidth={0.5}
          opacity={0.5}
        />
      ))}

      {/* ── Axis lines from center to vertices ── */}
      {vertices.map((v, i) => (
        <line
          key={RADAR_AXES[i].key}
          x1={CX}
          y1={CY}
          x2={v.x}
          y2={v.y}
          stroke="rgba(61,43,16,0.15)"
          strokeWidth={0.5}
          opacity={0.3}
        />
      ))}

      {/* ── Data polygon ── */}
      <polygon
        points={polygonPoints}
        fill="url(#emotional-radar-fill)"
        stroke="url(#emotional-radar-stroke)"
        strokeWidth={2}
        strokeLinejoin="round"
        style={transitionStyle}
      />

      {/* ── Vertex dots with glow ── */}
      {points.map((p) => (
        <circle
          key={`dot-${p.key}`}
          cx={p.x}
          cy={p.y}
          r={4}
          fill={p.color}
          filter="url(#emotional-radar-glow)"
          style={transitionStyle}
        />
      ))}

      {/* ── Axis labels ── */}
      {labelVertices.map((lv, i) => {
        const axis = RADAR_AXES[i];
        const def = getAxisDef(axis.key);
        const pos = getLabelPosition(axis.angle);
        return (
          <text
            key={`label-${axis.key}`}
            x={lv.x + pos.dx}
            y={lv.y + pos.dy}
            textAnchor={pos.textAnchor}
            dominantBaseline={pos.dominantBaseline}
            fontSize={9}
            fontWeight={600}
            fill={def.color}
          >
            {def.label}
          </text>
        );
      })}

      {/* ── Value text near each dot ── */}
      {points.map((p) => {
        const offset = getValueOffset(p.angle);
        return (
          <text
            key={`val-${p.key}`}
            x={p.x + offset.dx}
            y={p.y + offset.dy}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8}
            fontWeight={700}
            fill={p.color}
            opacity={0.85}
            style={transitionStyle}
          >
            {p.value}
          </text>
        );
      })}
    </svg>
  );
}
