"use client";

import { useMemo } from "react";
import { motion } from "motion/react";

// ═══════════════════════════════════════════════════════════════
// CLASS DYNAMICS RADAR — Live 6-axis spider chart
// Participation / Compréhension / Imagination / Débat / Blocage / Attention
// Fed by real-time session data, updates every render
// ═══════════════════════════════════════════════════════════════

export interface ClassDynamicsScores {
  participation: number; // 0-100
  comprehension: number;
  imagination: number;
  debate: number;
  blocage: number;
  attention: number;
}

interface ClassDynamicsRadarProps {
  scores: ClassDynamicsScores;
  size?: number;
}

const AXES = [
  { key: "participation" as const, label: "Participation", color: "#4CAF50", angle: -90 },
  { key: "comprehension" as const, label: "Comprehension", color: "#3B5998", angle: -30 },
  { key: "imagination" as const, label: "Imagination", color: "#06B6D4", angle: 30 },
  { key: "debate" as const, label: "Debat", color: "#8B5CF6", angle: 90 },
  { key: "blocage" as const, label: "Blocage", color: "#EB5757", angle: 150 },
  { key: "attention" as const, label: "Attention", color: "#F59E0B", angle: 210 },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/**
 * Compute class dynamics from live session data.
 */
export function computeClassDynamics(params: {
  responsePct: number;        // 0-100, % who responded
  avgResponseTimeSec: number; // average response time in seconds
  stuckPct: number;           // 0-100, % stuck
  handsRaisedPct: number;     // 0-100, % hands raised
  optionSpread: number;       // 0-1, how divided the vote is (0=unanimous, 1=perfectly split)
  activeTimeSec: number;      // seconds since question opened
  disconnectedPct: number;    // 0-100, % disconnected
  totalResponses: number;     // absolute count
  totalStudents: number;      // absolute count
}): ClassDynamicsScores {
  const {
    responsePct, avgResponseTimeSec, stuckPct, handsRaisedPct,
    optionSpread, activeTimeSec, disconnectedPct, totalResponses, totalStudents,
  } = params;

  // Participation: high response rate + fast responses
  const participationBase = responsePct;
  const speedBonus = avgResponseTimeSec > 0 ? Math.max(0, 30 - avgResponseTimeSec) : 0; // bonus if < 30s
  const participation = Math.min(100, Math.max(5, Math.round(participationBase + speedBonus)));

  // Compréhension: high response rate + low stuck + low hands raised
  const comprehension = Math.min(100, Math.max(5, Math.round(
    responsePct * 0.5 +
    (100 - stuckPct) * 0.3 +
    (100 - handsRaisedPct) * 0.2
  )));

  // Imagination: based on response diversity (longer answers = more imagination assumed)
  // Approximated by: having responses + not all identical + engagement
  const imagination = Math.min(100, Math.max(5, Math.round(
    (totalResponses > 0 ? 40 : 5) +
    optionSpread * 30 + // diversity
    Math.min(responsePct * 0.3, 30)
  )));

  // Débat: high option spread + multiple responses + hands raised (engagement)
  const debate = Math.min(100, Math.max(5, Math.round(
    optionSpread * 60 +
    handsRaisedPct * 0.2 +
    (totalResponses >= 2 ? 15 : 0) +
    (responsePct > 50 ? 10 : 0)
  )));

  // Blocage: inverse — high stuck % = high blocage score
  const blocage = Math.min(100, Math.max(0, Math.round(
    stuckPct * 0.7 +
    (avgResponseTimeSec > 60 ? 20 : avgResponseTimeSec > 30 ? 10 : 0) +
    disconnectedPct * 0.2
  )));

  // Attention: low disconnected + responses arriving + not too slow
  const attention = Math.min(100, Math.max(5, Math.round(
    (100 - disconnectedPct) * 0.4 +
    (responsePct > 0 ? 20 : 0) +
    (activeTimeSec > 0 && activeTimeSec < 120 ? 20 : activeTimeSec < 300 ? 10 : 0) +
    (100 - stuckPct) * 0.2
  )));

  return { participation, comprehension, imagination, debate, blocage, attention };
}

export function ClassDynamicsRadar({ scores, size = 160 }: ClassDynamicsRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 24;

  const rings = [0.25, 0.5, 0.75, 1.0];

  const polygon = useMemo(() => {
    return AXES.map((axis) => {
      const value = scores[axis.key] / 100;
      const r = value * maxR;
      return polarToCartesian(cx, cy, r, axis.angle);
    });
  }, [scores, cx, cy, maxR]);

  const polygonPath = polygon.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  // Determine dominant trait for summary
  const sorted = [...AXES].sort((a, b) => scores[b.key] - scores[a.key]);
  const top = sorted[0];
  const low = sorted[sorted.length - 1];

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Header */}
      <div className="flex items-center gap-1.5 self-start">
        <span className="text-[10px]">📡</span>
        <span className="text-[11px] font-bold text-[#2C2C2C]">Dynamique de classe</span>
      </div>

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
          fill="rgba(59,89,152,0.08)"
          stroke="#3B5998"
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
              transition={{ delay: 0.05 + i * 0.06, type: "spring" }}
            />
          );
        })}

        {/* Labels */}
        {AXES.map((axis) => {
          const labelR = maxR + 16;
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

      {/* Smart summary */}
      <div
        className="w-full px-2.5 py-1.5 rounded-[8px] text-center"
        style={{ background: `${top.color}08`, border: `1px solid ${top.color}15` }}
      >
        <p className="text-[10px] leading-snug" style={{ color: "#5B5B5B" }}>
          <span className="font-bold" style={{ color: top.color }}>{top.label}</span>
          {" forte"}
          {scores[low.key] < 30 && (
            <>, <span className="font-bold" style={{ color: low.color }}>{low.label.toLowerCase()}</span>{" faible"}</>
          )}
        </p>
      </div>
    </div>
  );
}
