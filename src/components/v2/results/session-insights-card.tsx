"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";
import type { BilanData } from "@/hooks/use-results-data";

const COLLAB_COLORS: Record<string, string> = {
  faible: "var(--color-bw-danger, #EF4444)",
  moyen: "var(--color-bw-amber, #F59E0B)",
  bon: "var(--color-bw-teal, #4ECDC4)",
  excellent: "var(--color-bw-green, #10B981)",
};

const TREND_ICONS: Record<string, string> = {
  croissant: "↗",
  stable: "→",
  décroissant: "↘",
};

const DEPTH_COLORS: Record<string, string> = {
  superficiel: "var(--color-bw-amber, #F59E0B)",
  correct: "var(--color-bw-teal, #4ECDC4)",
  approfondi: "var(--color-bw-green, #10B981)",
};

interface SessionInsightsCardProps {
  bilan: BilanData | null;
  onViewFull: () => void;
}

export function SessionInsightsCard({ bilan, onViewFull }: SessionInsightsCardProps) {
  if (!bilan) return null;

  const collabColor = COLLAB_COLORS[bilan.groupDynamics.collaborationLevel] || "#888";
  const trendIcon = TREND_ICONS[bilan.engagement.participationTrend] || "→";
  const depthColor = DEPTH_COLORS[bilan.engagement.depth] || "#888";

  return (
    <GlassCardV2 className="p-5 border-l-4 border-l-bw-primary">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-bw-primary">Synthèse IA</span>
          <p className="text-sm leading-relaxed mt-2 italic text-bw-heading">&ldquo;{bilan.narrativeSummary}&rdquo;</p>

          {/* Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span
              className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${collabColor}20`,
                color: collabColor,
              }}
            >
              Collaboration : {bilan.groupDynamics.collaborationLevel}
            </span>
            <span className="text-xs rounded-md bg-[var(--color-bw-surface-dim)] px-1.5 py-0.5 text-bw-muted">
              {trendIcon} {bilan.engagement.participationTrend}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${depthColor}20`,
                color: depthColor,
              }}
            >
              {bilan.engagement.depth}
            </span>
          </div>
        </div>

        <button
          onClick={onViewFull}
          className="shrink-0 text-xs font-medium text-bw-primary hover:underline cursor-pointer whitespace-nowrap"
        >
          Voir le bilan complet →
        </button>
      </div>
    </GlassCardV2>
  );
}
