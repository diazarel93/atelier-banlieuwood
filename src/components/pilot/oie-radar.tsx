"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import type { OIEScores } from "@/lib/oie-profile";

// ═══════════════════════════════════════════════════════
// O-I-E RADAR — Triangular 3-axis creative profile
// Observation (violet) / Imagination (cyan) / Expression (amber)
// ═══════════════════════════════════════════════════════

const AXES = [
  { key: "O" as const, label: "Observation", color: "#8B5CF6", angle: -90 },
  { key: "I" as const, label: "Imagination", color: "#06B6D4", angle: 150 },
  { key: "E" as const, label: "Expression", color: "#F59E0B", angle: 30 },
];

const DOMINANT_LABELS: Record<string, string> = {
  O: "Profil observateur",
  I: "Profil imaginatif",
  E: "Profil expressif",
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

interface OIERadarProps {
  scores: OIEScores;
  size?: number;
  showLabel?: boolean;
}

export function OIERadar({ scores, size = 140, showLabel = true }: OIERadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 22;
  const rings = [0.25, 0.5, 0.75, 1.0];

  const polygon = useMemo(() => {
    return AXES.map((axis) => {
      const value = scores[axis.key] / 100;
      const r = value * maxR;
      return polarToCartesian(cx, cy, r, axis.angle);
    });
  }, [scores, cx, cy, maxR]);

  const polygonPath = polygon.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  // Dominant axis color
  const dominantAxis = AXES.find((a) => a.key === scores.dominant) || AXES[0];

  return (
    <div className="flex flex-col items-center gap-1.5">
      {showLabel && (
        <div className="flex items-center gap-1.5 self-start">
          <span className="text-[10px]">🎨</span>
          <span className="text-[11px] font-bold text-[#2C2C2C]">Profil créatif observé</span>
        </div>
      )}

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {rings.map((pct) => (
          <polygon
            key={pct}
            points={AXES.map((a) => {
              const p = polarToCartesian(cx, cy, maxR * pct, a.angle);
              return `${p.x},${p.y}`;
            }).join(" ")}
            fill="none"
            stroke="#E8DFD2"
            strokeWidth={pct === 1 ? 1.2 : 0.6}
            opacity={0.5}
          />
        ))}

        {/* Axis lines */}
        {AXES.map((axis) => {
          const p = polarToCartesian(cx, cy, maxR, axis.angle);
          return (
            <line
              key={axis.key}
              x1={cx} y1={cy} x2={p.x} y2={p.y}
              stroke="#E8DFD2" strokeWidth={0.6} opacity={0.4}
            />
          );
        })}

        {/* Filled polygon */}
        <motion.path
          d={polygonPath}
          fill={`${dominantAxis.color}12`}
          stroke={dominantAxis.color}
          strokeWidth={1.5}
          strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Data points */}
        {AXES.map((axis, i) => {
          const value = scores[axis.key] / 100;
          const r = value * maxR;
          const p = polarToCartesian(cx, cy, r, axis.angle);
          return (
            <motion.circle
              key={axis.key}
              cx={p.x} cy={p.y} r={3}
              fill={axis.color}
              stroke="white" strokeWidth={1.5}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.05 + i * 0.08, type: "spring" }}
            />
          );
        })}

        {/* Labels */}
        {AXES.map((axis) => {
          const labelR = maxR + 15;
          const p = polarToCartesian(cx, cy, labelR, axis.angle);
          return (
            <text
              key={`label-${axis.key}`}
              x={p.x} y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={8}
              fontWeight={600}
              fill={axis.color}
            >
              {axis.label}
            </text>
          );
        })}
      </svg>

      {/* Summary */}
      {!scores.isReliable ? (
        <div className="w-full px-2.5 py-1.5 rounded-[8px] text-center bg-black/[0.03] border border-black/[0.06]">
          <p className="text-[10px] text-[#B0A99E] leading-snug">
            Profil en construction ({scores.responseCount}/15 réponses)
          </p>
        </div>
      ) : (
        <div
          className="w-full px-2.5 py-1.5 rounded-[8px] text-center"
          style={{ background: `${dominantAxis.color}08`, border: `1px solid ${dominantAxis.color}15` }}
        >
          <p className="text-[10px] leading-snug" style={{ color: "#5B5B5B" }}>
            <span className="font-bold" style={{ color: dominantAxis.color }}>
              {DOMINANT_LABELS[scores.dominant]}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Mini radar for grid views (no labels, smaller)
// ═══════════════════════════════════════════════════════

export function OIERadarMini({ scores, size = 60 }: { scores: OIEScores; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 4;

  const polygon = useMemo(() => {
    return AXES.map((axis) => {
      const value = scores[axis.key] / 100;
      const r = value * maxR;
      return polarToCartesian(cx, cy, r, axis.angle);
    });
  }, [scores, cx, cy, maxR]);

  const polygonPath = polygon.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
  const dominantAxis = AXES.find((a) => a.key === scores.dominant) || AXES[0];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Outer ring only */}
      <polygon
        points={AXES.map((a) => {
          const p = polarToCartesian(cx, cy, maxR, a.angle);
          return `${p.x},${p.y}`;
        }).join(" ")}
        fill="none"
        stroke="#E8DFD2"
        strokeWidth={0.8}
        opacity={0.5}
      />
      <motion.path
        d={polygonPath}
        fill={`${dominantAxis.color}18`}
        stroke={dominantAxis.color}
        strokeWidth={1.2}
        strokeLinejoin="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      {AXES.map((axis) => {
        const value = scores[axis.key] / 100;
        const r = value * maxR;
        const p = polarToCartesian(cx, cy, r, axis.angle);
        return (
          <circle
            key={axis.key}
            cx={p.x} cy={p.y} r={2}
            fill={axis.color}
            stroke="white" strokeWidth={1}
          />
        );
      })}
    </svg>
  );
}
