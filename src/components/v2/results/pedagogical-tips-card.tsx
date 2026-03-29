"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";

const MOMENT_COLORS: Record<string, string> = {
  tournant: "var(--color-bw-primary, #FF6B35)",
  créatif: "var(--color-bw-violet, #8B5CF6)",
  collectif: "var(--color-bw-teal, #4ECDC4)",
  tension: "var(--color-bw-danger, #EF4444)",
};

interface PedagogicalTipsCardProps {
  recommendations: string[];
  keyMoments: { category: string; description: string }[];
}

export function PedagogicalTipsCard({ recommendations, keyMoments }: PedagogicalTipsCardProps) {
  if (recommendations.length === 0 && keyMoments.length === 0) return null;

  const topRecs = recommendations.slice(0, 3);
  const topMoments = keyMoments.slice(0, 2);

  return (
    <GlassCardV2 className="p-5">
      <h3 className="text-xs font-semibold text-bw-heading uppercase tracking-wide mb-4">Pistes pédagogiques</h3>

      {topRecs.length > 0 && (
        <ol className="space-y-1.5 list-decimal list-inside mb-4">
          {topRecs.map((rec, i) => (
            <li key={i} className="text-sm text-bw-heading">
              {rec}
            </li>
          ))}
        </ol>
      )}

      {topMoments.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-bw-muted">Moments clés</p>
          {topMoments.map((m, i) => {
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
      )}
    </GlassCardV2>
  );
}
