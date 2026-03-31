"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";
import type { BilanData } from "@/hooks/use-results-data";

const COLLAB_COLORS: Record<string, string> = {
  faible: "var(--color-bw-danger, #EF4444)",
  moyen: "var(--color-bw-amber, #F59E0B)",
  bon: "var(--color-bw-teal, #4ECDC4)",
  excellent: "var(--color-bw-green, #10B981)",
};

const TREND_LABELS: Record<string, { label: string; icon: string }> = {
  croissant: { label: "Croissant", icon: "↗" },
  stable: { label: "Stable", icon: "→" },
  décroissant: { label: "Décroissant", icon: "↘" },
};

const DEPTH_COLORS: Record<string, string> = {
  superficiel: "var(--color-bw-amber, #F59E0B)",
  correct: "var(--color-bw-teal, #4ECDC4)",
  approfondi: "var(--color-bw-green, #10B981)",
};

const MOMENT_COLORS: Record<string, string> = {
  tournant: "var(--color-bw-primary, #FF6B35)",
  créatif: "var(--color-bw-violet, #8B5CF6)",
  collectif: "var(--color-bw-teal, #4ECDC4)",
  tension: "var(--color-bw-danger, #EF4444)",
};

interface BilanIaSectionProps {
  bilan: BilanData | null;
  loading: boolean;
  provider: string | null;
  onGenerate: () => void;
  onDownload: () => void;
}

export function BilanIaSection({ bilan, loading, provider, onGenerate, onDownload }: BilanIaSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-bw-heading uppercase tracking-wide">Bilan IA</h3>
        {bilan && (
          <button onClick={onDownload} className="text-xs text-bw-muted hover:text-bw-heading transition-colors">
            Télécharger .md
          </button>
        )}
      </div>

      {!bilan && !loading && (
        <button
          onClick={onGenerate}
          className="w-full rounded-xl border-2 border-dashed border-bw-primary/30 py-4 text-sm font-medium text-bw-primary hover:bg-bw-primary/5 transition-colors cursor-pointer"
        >
          Générer le bilan IA
        </button>
      )}

      {loading && (
        <GlassCardV2 className="py-8 text-center">
          <div className="inline-block w-5 h-5 border-2 border-bw-primary border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-bw-muted">L&apos;IA analyse la session...</p>
        </GlassCardV2>
      )}

      {bilan && (
        <div className="space-y-4">
          {provider && (
            <span className="text-xs text-bw-muted border border-[var(--color-bw-border)] rounded-md px-1.5 py-0.5">
              {provider === "fallback" ? "Algorithmique" : provider}
            </span>
          )}

          {/* Narrative summary */}
          <GlassCardV2 className="p-5 border-l-4 border-l-bw-primary">
            <span className="label-caps">Résumé narratif</span>
            <p className="text-sm leading-relaxed mt-2 italic text-bw-heading">
              &ldquo;{bilan.narrativeSummary}&rdquo;
            </p>
          </GlassCardV2>

          {/* Group dynamics */}
          <GlassCardV2 className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="label-caps text-bw-muted">Dynamique de groupe</span>
              <span
                className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${COLLAB_COLORS[bilan.groupDynamics.collaborationLevel] || "var(--color-bw-muted, #666)"}20`,
                  color: COLLAB_COLORS[bilan.groupDynamics.collaborationLevel] || "var(--color-bw-muted, #666)",
                }}
              >
                {bilan.groupDynamics.collaborationLevel}
              </span>
            </div>
            <p className="text-sm text-bw-heading mb-3">{bilan.groupDynamics.summary}</p>
            {bilan.groupDynamics.influencers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {bilan.groupDynamics.influencers.map((inf, i) => (
                  <span
                    key={i}
                    className="text-xs rounded-md bg-[var(--color-bw-surface-dim)] px-1.5 py-0.5 text-bw-muted"
                  >
                    {inf}
                  </span>
                ))}
              </div>
            )}
          </GlassCardV2>

          {/* Key moments */}
          {bilan.keyMoments.length > 0 && (
            <GlassCardV2 className="p-5">
              <p className="label-caps text-bw-muted mb-3">Moments clés</p>
              <div className="space-y-2">
                {bilan.keyMoments.map((m, i) => {
                  const color = MOMENT_COLORS[m.category] || "var(--color-bw-muted, #888)";
                  return (
                    <div key={i} className="pl-4 border-l-2 py-1" style={{ borderLeftColor: color }}>
                      <span className="text-xs font-semibold uppercase" style={{ color }}>
                        {m.category}
                      </span>
                      <p className="text-sm text-bw-heading">{m.description}</p>
                    </div>
                  );
                })}
              </div>
            </GlassCardV2>
          )}

          {/* Engagement */}
          <GlassCardV2 className="p-5">
            <p className="label-caps text-bw-muted mb-2">Engagement</p>
            <p className="text-sm text-bw-heading mb-3">{bilan.engagement.summary}</p>
            <div className="flex items-center gap-3">
              <span className="text-xs rounded-md bg-[var(--color-bw-surface-dim)] px-1.5 py-0.5 text-bw-muted">
                {TREND_LABELS[bilan.engagement.participationTrend]?.icon || ""}{" "}
                {TREND_LABELS[bilan.engagement.participationTrend]?.label || bilan.engagement.participationTrend}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${DEPTH_COLORS[bilan.engagement.depth] || "var(--color-bw-muted, #666)"}20`,
                  color: DEPTH_COLORS[bilan.engagement.depth] || "var(--color-bw-muted, #666)",
                }}
              >
                {bilan.engagement.depth}
              </span>
            </div>
          </GlassCardV2>

          {/* Recommendations */}
          <GlassCardV2 className="p-5">
            <p className="label-caps text-bw-muted mb-3">Recommandations pédagogiques</p>
            <ol className="space-y-2 list-decimal list-inside">
              {bilan.pedagogicalRecommendations.map((rec, i) => (
                <li key={i} className="text-sm text-bw-heading">
                  {rec}
                </li>
              ))}
            </ol>
          </GlassCardV2>
        </div>
      )}
    </div>
  );
}
