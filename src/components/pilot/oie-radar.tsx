"use client";

import type { OIEScores } from "@/lib/oie-profile";
import { BaseRadar, type RadarAxis } from "./base-radar";

// ═══════════════════════════════════════════════════════
// O-I-E RADAR — Triangular 3-axis creative profile
// Observation (violet) / Imagination (cyan) / Expression (amber)
// Now delegates SVG rendering to BaseRadar.
// ═══════════════════════════════════════════════════════

const AXES: RadarAxis[] = [
  { key: "O", label: "Observation", color: "#8B5CF6", angle: -90 },
  { key: "I", label: "Imagination", color: "#06B6D4", angle: 150 },
  { key: "E", label: "Expression", color: "#F59E0B", angle: 30 },
];

const DOMINANT_LABELS: Record<string, string> = {
  O: "Profil observateur",
  I: "Profil imaginatif",
  E: "Profil expressif",
};

interface OIERadarProps {
  scores: OIEScores;
  size?: number;
  showLabel?: boolean;
}

export function OIERadar({ scores, size = 140, showLabel = true }: OIERadarProps) {
  const dominantAxis = AXES.find((a) => a.key === scores.dominant) || AXES[0];
  const values = { O: scores.O, I: scores.I, E: scores.E };

  return (
    <div className="flex flex-col items-center gap-1.5">
      {showLabel && (
        <div className="flex items-center gap-1.5 self-start">
          <span className="text-[10px]">🎨</span>
          <span className="text-[11px] font-bold text-[#2C2C2C]">Profil créatif observé</span>
        </div>
      )}

      <BaseRadar
        axes={AXES}
        values={values}
        size={size}
        rings={[0.25, 0.5, 0.75, 1.0]}
        fillColor={`${dominantAxis.color}12`}
        strokeColor={dominantAxis.color}
        strokeWidth={1.5}
        labelFontSize={8}
        padding={22}
        dotRadius={3}
      />

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
  const dominantAxis = AXES.find((a) => a.key === scores.dominant) || AXES[0];
  const values = { O: scores.O, I: scores.I, E: scores.E };

  return (
    <BaseRadar
      axes={AXES}
      values={values}
      size={size}
      rings={[1.0]}
      fillColor={`${dominantAxis.color}18`}
      strokeColor={dominantAxis.color}
      strokeWidth={1.2}
      animated={false}
      showLabels={false}
      padding={4}
      dotRadius={2}
    />
  );
}
