"use client";

import { BaseRadar, type RadarAxis } from "./base-radar";

// ═══════════════════════════════════════════════════════════════
// CLASS DYNAMICS RADAR — Live 6-axis spider chart
// Participation / Compréhension / Imagination / Débat / Blocage / Attention
// Fed by real-time session data, updates every render.
// Now delegates SVG rendering to BaseRadar.
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

const AXES: RadarAxis[] = [
  { key: "participation", label: "Participation", color: "#4CAF50", angle: -90 },
  { key: "comprehension", label: "Comprehension", color: "#3B5998", angle: -30 },
  { key: "imagination", label: "Imagination", color: "#06B6D4", angle: 30 },
  { key: "debate", label: "Debat", color: "#8B5CF6", angle: 90 },
  { key: "blocage", label: "Blocage", color: "#EB5757", angle: 150 },
  { key: "attention", label: "Attention", color: "#F59E0B", angle: 210 },
];

/**
 * Compute class dynamics from live session data.
 */
export function computeClassDynamics(params: {
  responsePct: number;
  avgResponseTimeSec: number;
  stuckPct: number;
  handsRaisedPct: number;
  optionSpread: number;
  activeTimeSec: number;
  disconnectedPct: number;
  totalResponses: number;
  totalStudents: number;
}): ClassDynamicsScores {
  const {
    responsePct, avgResponseTimeSec, stuckPct, handsRaisedPct,
    optionSpread, activeTimeSec, disconnectedPct, totalResponses,
  } = params;

  const speedBonus = avgResponseTimeSec > 0 ? Math.max(0, 30 - avgResponseTimeSec) : 0;
  const participation = Math.min(100, Math.max(5, Math.round(responsePct + speedBonus)));

  const comprehension = Math.min(100, Math.max(5, Math.round(
    responsePct * 0.5 + (100 - stuckPct) * 0.3 + (100 - handsRaisedPct) * 0.2
  )));

  const imagination = Math.min(100, Math.max(5, Math.round(
    (totalResponses > 0 ? 40 : 5) + optionSpread * 30 + Math.min(responsePct * 0.3, 30)
  )));

  const debate = Math.min(100, Math.max(5, Math.round(
    optionSpread * 60 + handsRaisedPct * 0.2 + (totalResponses >= 2 ? 15 : 0) + (responsePct > 50 ? 10 : 0)
  )));

  const blocage = Math.min(100, Math.max(0, Math.round(
    stuckPct * 0.7 + (avgResponseTimeSec > 60 ? 20 : avgResponseTimeSec > 30 ? 10 : 0) + disconnectedPct * 0.2
  )));

  const attention = Math.min(100, Math.max(5, Math.round(
    (100 - disconnectedPct) * 0.4 + (responsePct > 0 ? 20 : 0) +
    (activeTimeSec > 0 && activeTimeSec < 120 ? 20 : activeTimeSec < 300 ? 10 : 0) +
    (100 - stuckPct) * 0.2
  )));

  return { participation, comprehension, imagination, debate, blocage, attention };
}

export function ClassDynamicsRadar({ scores, size = 160 }: ClassDynamicsRadarProps) {
  const values: Record<string, number> = {
    participation: scores.participation,
    comprehension: scores.comprehension,
    imagination: scores.imagination,
    debate: scores.debate,
    blocage: scores.blocage,
    attention: scores.attention,
  };

  // Determine dominant trait for summary
  const sorted = [...AXES].sort((a, b) => scores[b.key as keyof ClassDynamicsScores] - scores[a.key as keyof ClassDynamicsScores]);
  const top = sorted[0];
  const low = sorted[sorted.length - 1];

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Header */}
      <div className="flex items-center gap-1.5 self-start">
        <span className="text-[10px]">📡</span>
        <span className="text-[11px] font-bold text-[#2C2C2C]">Dynamique de classe</span>
      </div>

      <BaseRadar
        axes={AXES}
        values={values}
        size={size}
        rings={[0.25, 0.5, 0.75, 1.0]}
        fillColor="rgba(59,89,152,0.08)"
        strokeColor="#3B5998"
        strokeWidth={1.5}
        labelFontSize={8}
        dotRadius={3}
      />

      {/* Smart summary */}
      <div
        className="w-full px-2.5 py-1.5 rounded-[8px] text-center"
        style={{ background: `${top.color}08`, border: `1px solid ${top.color}15` }}
      >
        <p className="text-[10px] leading-snug" style={{ color: "#5B5B5B" }}>
          <span className="font-bold" style={{ color: top.color }}>{top.label}</span>
          {" forte"}
          {scores[low.key as keyof ClassDynamicsScores] < 30 && (
            <>, <span className="font-bold" style={{ color: low.color }}>{low.label.toLowerCase()}</span>{" faible"}</>
          )}
        </p>
      </div>
    </div>
  );
}
