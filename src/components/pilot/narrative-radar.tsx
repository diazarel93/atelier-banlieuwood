"use client";

import { BaseRadar, type RadarAxis } from "./base-radar";

// ═══════════════════════════════════════════════════════════════
// NARRATIVE RADAR — Spider chart of 5 class competencies
// Imagination / Émotion / Observation / Construction / Expression
// Computed from completed modules + current responses.
// Now delegates SVG rendering to BaseRadar.
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

const AXES: RadarAxis[] = [
  { key: "imagination", label: "Imagination", color: "#06B6D4", angle: -90 },
  { key: "emotion", label: "Émotion", color: "#EC4899", angle: -18 },
  { key: "expression", label: "Expression", color: "#F59E0B", angle: 54 },
  { key: "construction", label: "Construction", color: "#14B8A6", angle: 126 },
  { key: "observation", label: "Observation", color: "#8B5CF6", angle: 198 },
];

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
  // Phase → competency mapping (M1–M8 + bonus)
  const phaseCompetencies: Record<string, (keyof NarrativeScores)[]> = {
    regard: ["observation", "imagination"],
    scene: ["emotion", "expression"],
    etsi: ["imagination", "expression"],
    pitch: ["imagination", "expression"],
    collectif: ["construction", "expression"],
    scenario: ["construction", "expression"],
    "mise-en-scene": ["construction", "observation"],
    equipe: ["expression", "construction"],
    postprod: ["construction", "observation"],
    cinema: ["observation", "construction"],
    story: ["imagination", "emotion"],
    cinedebat: ["observation", "expression"],
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
      ? (competencyHits[key] / competencyTotal[key]) * 70
      : 0;
    const engagementBoost = responsePct > 0 ? Math.min(responsePct * 0.3, 30) : 0;
    const stuckPenalty = stuckPct > 20 ? (stuckPct - 20) * 0.3 : 0;
    const currentBoost = currentPhaseId && phaseCompetencies[currentPhaseId]?.includes(key) ? 10 : 0;
    scores[key] = Math.min(100, Math.max(5, Math.round(base + engagementBoost + currentBoost - stuckPenalty)));
  }

  return scores;
}

// Helper to get module IDs for a phase
function getPhaseModuleIds(phaseId: string): string[] {
  const map: Record<string, string[]> = {
    regard: ["m1a", "m1b", "m1c", "m1d", "m1e"],
    scene: ["u2a", "u2b", "u2c", "u2d"],
    etsi: ["m10a"],
    pitch: ["m10b"],
    collectif: ["m12a"],
    scenario: ["m6"],
    "mise-en-scene": ["m7"],
    equipe: ["m8"],
    postprod: ["m9"],
    cinema: ["m2a", "m2b", "m2c", "m2d"],
    story: ["m2-perso", "m3", "m4", "m5"],
    cinedebat: ["m11a", "m11b", "m11c", "m11d"],
  };
  return map[phaseId] || [];
}

export function NarrativeRadar({ scores, size = 180 }: NarrativeRadarProps) {
  const values: Record<string, number> = {
    imagination: scores.imagination,
    emotion: scores.emotion,
    expression: scores.expression,
    construction: scores.construction,
    observation: scores.observation,
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <BaseRadar
        axes={AXES}
        values={values}
        size={size}
        rings={[0.25, 0.5, 0.75, 1.0]}
        fillColor="rgba(107,140,255,0.12)"
        strokeColor="#6B8CFF"
        padding={28}
      />

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
              {scores[axis.key as keyof NarrativeScores]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
