"use client";

import { useMemo } from "react";
import { motion } from "motion/react";

// ═══════════════════════════════════════════════════════
// BASE RADAR — Shared SVG spider/radar chart
// Configurable axes, colors, values. Used by:
// - OIERadar (3 axes), EmotionalRadar (4), NarrativeRadar (5), ClassDynamicsRadar (6)
// ═══════════════════════════════════════════════════════

export interface RadarAxis {
  key: string;
  label: string;
  color: string;
  /** Angle in degrees (0 = right, 90 = bottom, -90/270 = top) */
  angle: number;
}

export interface BaseRadarProps {
  /** Axis definitions (key, label, color, angle) */
  axes: RadarAxis[];
  /** Values per axis key (0-100) */
  values: Record<string, number>;
  /** SVG viewBox size (default 200) */
  size?: number;
  /** Fill color for the data polygon (default: first axis color at 15% opacity) */
  fillColor?: string;
  /** Stroke color for the data polygon (default: first axis color) */
  strokeColor?: string;
  /** Polygon stroke width (default 2) */
  strokeWidth?: number;
  /** Ring percentages (default: [0.33, 0.66, 1.0]) */
  rings?: number[];
  /** Animate polygon entrance (default true) */
  animated?: boolean;
  /** Show value text near dots (default false) */
  showValues?: boolean;
  /** Show axis labels (default true) */
  showLabels?: boolean;
  /** Grid/ring stroke color (default "rgba(61,43,16,0.15)") */
  gridColor?: string;
  /** Axis label font size (default 9) */
  labelFontSize?: number;
  /** Padding from edge for labels (default 24) */
  padding?: number;
  /** Dot radius (default 3.5) */
  dotRadius?: number;
}

export function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function BaseRadar({
  axes,
  values,
  size = 200,
  fillColor,
  strokeColor,
  strokeWidth = 2,
  rings = [0.33, 0.66, 1.0],
  animated = true,
  showValues = false,
  showLabels = true,
  gridColor = "rgba(61,43,16,0.15)",
  labelFontSize = 9,
  padding = 24,
  dotRadius = 3.5,
}: BaseRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - padding;

  // Compute polygon points from values
  const polygon = useMemo(() => {
    return axes.map((axis) => {
      const val = Math.max(0, Math.min(100, values[axis.key] || 0));
      const r = (val / 100) * maxR;
      return { ...polarToCartesian(cx, cy, r, axis.angle), value: val, axis };
    });
  }, [axes, values, cx, cy, maxR]);

  const polygonPath = polygon.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  const defaultStroke = strokeColor || axes[0]?.color || "#6B8CFF";
  const defaultFill = fillColor || `${defaultStroke}22`; // 13% opacity

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid rings */}
      {rings.map((pct) => (
        <polygon
          key={pct}
          points={axes
            .map((a) => {
              const p = polarToCartesian(cx, cy, maxR * pct, a.angle);
              return `${p.x},${p.y}`;
            })
            .join(" ")}
          fill="none"
          stroke={gridColor}
          strokeWidth={pct === rings[rings.length - 1] ? 1.2 : 0.6}
          opacity={0.5}
        />
      ))}

      {/* Axis lines */}
      {axes.map((axis) => {
        const end = polarToCartesian(cx, cy, maxR, axis.angle);
        return (
          <line
            key={axis.key}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            stroke={gridColor}
            strokeWidth={0.6}
            opacity={0.4}
          />
        );
      })}

      {/* Data polygon */}
      {animated ? (
        <motion.path
          d={polygonPath}
          fill={defaultFill}
          stroke={defaultStroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      ) : (
        <path
          d={polygonPath}
          fill={defaultFill}
          stroke={defaultStroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      )}

      {/* Data dots */}
      {polygon.map((p) => (
        <circle key={p.axis.key} cx={p.x} cy={p.y} r={dotRadius} fill={p.axis.color} stroke="white" strokeWidth={1.5} />
      ))}

      {/* Value text near dots */}
      {showValues &&
        polygon.map((p) => {
          const labelP = polarToCartesian(cx, cy, maxR + 8, p.axis.angle);
          const dx = labelP.x > cx + 5 ? 6 : labelP.x < cx - 5 ? -6 : 0;
          const dy = labelP.y > cy + 5 ? 8 : labelP.y < cy - 5 ? -4 : 0;
          return (
            <text
              key={`val-${p.axis.key}`}
              x={p.x + dx}
              y={p.y + dy}
              fill={p.axis.color}
              fontSize={8}
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {Math.round(p.value)}
            </text>
          );
        })}

      {/* Axis labels */}
      {showLabels &&
        axes.map((axis) => {
          const labelP = polarToCartesian(cx, cy, maxR + 16, axis.angle);
          const anchor = Math.abs(labelP.x - cx) < 5 ? "middle" : labelP.x > cx ? "start" : "end";
          const baseline = Math.abs(labelP.y - cy) < 5 ? "middle" : labelP.y > cy ? "hanging" : "auto";
          return (
            <text
              key={`lbl-${axis.key}`}
              x={labelP.x}
              y={labelP.y}
              fill={axis.color}
              fontSize={labelFontSize}
              fontWeight="600"
              textAnchor={anchor}
              dominantBaseline={baseline}
            >
              {axis.label}
            </text>
          );
        })}
    </svg>
  );
}
