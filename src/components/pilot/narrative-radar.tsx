"use client";

import { useMemo } from "react";
import { motion } from "motion/react";

// ═══════════════════════════════════════════════════════════════
// NARRATIVE RADAR — Spider chart of 5 class competencies
// Imagination / Émotion / Observation / Construction / Expression
// Computed from completed modules + current responses
// ═══════════════════════════════════════════════════════════════

export interface NarrativeScores {
  imagination: number; // 0-100
  emotion: number;
  observation: number;
  construction: number;
  expression: number;
}

interface NarrativeRadarProps {
  scores: NarrativeScores;
  size?: number;
}

const AXES = [
  { key: "imagination" as const, label: "Imagination", color: "#06B6D4", angle: -90 },
  { key: "emotion" as const, label: "Émotion", color: "#EC4899", angle: -18 },
  { key: "expression" as const, label: "Expression", color: "#F59E0B", angle: 54 },
  { key: "construction" as const, label: "Construction", color: "#14B8A6", angle: 126 },
  { key: "observation" as const, label: "Observation", color: "#8B5CF6", angle: 198 },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/**
 * Compute narrative scores from completed phases and current session data.
 * Each phase maps to 1-2 competencies.
 */
export function computeNarrativeScores(
  completedModules: string[],
  totalModules: number,
  currentPhaseId: string | null,
  responsePct: number, // 0-100, current question response rate
  stuckPct: number,    // 0-100, percentage stuck
): NarrativeScores {
  // Base scores from completed modules
  const completionRate = totalModules > 0 ? completedModules.length / totalModules : 0;

  // Phase → competency mapping
  const phaseCompetencies: Record<string, (keyof NarrativeScores)[]> = {
    idea: ["observation", "imagination"],
    emotion: ["emotion", "expression"],
    imagination: ["imagination", "expression"],
    collectif: ["construction", "expression"],
    scenario: ["construction", "expression"],
    "mise-en-scene": ["construction", "observation"],
    cinema: ["observation", "construction"],
    story: ["imagination", "emotion"],
    empathy: ["emotion", "expression"],
    cinedebat: ["observation", "expression"],
    equipe: ["expression", "construction"],
    postprod: ["construction", "observation"],
  };

  // Count how many completed modules contribute to each competency
  const competencyHits: Record<keyof NarrativeScores, number> = {
    imagination: 0, emotion: 0, observation: 0, construction: 0, expression: 0,
  };
  const competencyTotal: Record<keyof NarrativeScores, number> = {
    imagination: 0, emotion: 0, observation: 0, construction: 0, expression: 0,
  };

  for (const [phaseId, comps] of Object.entries(phaseCompetencies)) {
    for (const comp of comps) {
      competencyTotal[comp]++;
      // Check if any module from this phase is completed
      // Simplified: use phase presence in completed modules
      const phaseModuleIds = getPhaseModuleIds(phaseId);
      const completedFromPhase = phaseModuleIds.filter(id => completedModules.includes(id));
      if (completedFromPhase.length > 0) {
        competencyHits[comp] += completedFromPhase.length / phaseModuleIds.length;
      }
    }
  }

  // Compute base scores (0-100) from completion
  const scores: NarrativeScores = {
    imagination: 0, emotion: 0, observation: 0, construction: 0, expression: 0,
  };

  for (const key of Object.keys(scores) as (keyof NarrativeScores)[]) {
    const base = competencyTotal[key] > 0
      ? (competencyHits[key] / competencyTotal[key]) * 70 // max 70 from completion
      : 0;

    // Boost from current session engagement
    const engagementBoost = responsePct > 0 ? Math.min(responsePct * 0.3, 30) : 0;

    // Penalty from stuck students
    const stuckPenalty = stuckPct > 20 ? (stuckPct - 20) * 0.3 : 0;

    // Current phase boost
    const currentBoost = currentPhaseId && phaseCompetencies[currentPhaseId]?.includes(key) ? 10 : 0;

    scores[key] = Math.min(100, Math.max(5, Math.round(base + engagementBoost + currentBoost - stuckPenalty)));
  }

  return scores;
}

// Helper to get module IDs for a phase (simplified mapping)
function getPhaseModuleIds(phaseId: string): string[] {
  const map: Record<string, string[]> = {
    idea: ["m1a", "m1b", "m1c", "m1d", "m1e"],
    emotion: ["u2a", "u2b", "u2c", "u2d"],
    imagination: ["m10a", "m10b"],
    collectif: ["m12a"],
    scenario: ["m6"],
    "mise-en-scene": ["m7"],
    cinema: ["m2a", "m2b", "m2c", "m2d"],
    story: ["m2-perso", "m3", "m4", "m5"],
    empathy: ["m2-perso"],
    cinedebat: ["m11a", "m11b", "m11c", "m11d"],
    equipe: ["m8"],
    postprod: ["m9"],
  };
  return map[phaseId] || [];
}

export function NarrativeRadar({ scores, size = 180 }: NarrativeRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 28; // leave room for labels

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Compute polygon points
  const polygon = useMemo(() => {
    return AXES.map((axis) => {
      const value = scores[axis.key] / 100;
      const r = value * maxR;
      return polarToCartesian(cx, cy, r, axis.angle);
    });
  }, [scores, cx, cy, maxR]);

  const polygonPath = polygon.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  return (
    <div className="flex flex-col items-center gap-2">
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
            strokeWidth={pct === 1 ? 1.5 : 0.8}
            opacity={0.6}
          />
        ))}

        {/* Axis lines */}
        {AXES.map((axis) => {
          const p = polarToCartesian(cx, cy, maxR, axis.angle);
          return (
            <line
              key={axis.key}
              x1={cx} y1={cy} x2={p.x} y2={p.y}
              stroke="#E8DFD2" strokeWidth={0.8} opacity={0.5}
            />
          );
        })}

        {/* Filled polygon */}
        <motion.path
          d={polygonPath}
          fill="rgba(107,140,255,0.12)"
          stroke="#6B8CFF"
          strokeWidth={2}
          strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
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
              cx={p.x} cy={p.y} r={3.5}
              fill={axis.color}
              stroke="white" strokeWidth={2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 + i * 0.08, type: "spring" }}
            />
          );
        })}

        {/* Labels */}
        {AXES.map((axis) => {
          const labelR = maxR + 18;
          const p = polarToCartesian(cx, cy, labelR, axis.angle);
          return (
            <text
              key={`label-${axis.key}`}
              x={p.x} y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fontWeight={600}
              fill={axis.color}
            >
              {axis.label}
            </text>
          );
        })}
      </svg>

      {/* Score chips */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {AXES.map((axis) => (
          <div
            key={axis.key}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: `${axis.color}12`, border: `1px solid ${axis.color}25` }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: axis.color }} />
            <span className="text-[9px] font-bold tabular-nums" style={{ color: axis.color }}>
              {scores[axis.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
