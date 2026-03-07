"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";
import { CATEGORY_COLORS } from "@/lib/constants";

interface CollectiveStoryCardsProps {
  markdownLines: string[];
}

export function CollectiveStoryCards({ markdownLines }: CollectiveStoryCardsProps) {
  const choices = markdownLines
    .filter((l) => l.startsWith("- **"))
    .map((line) => {
      const match = line.match(/^- \*\*(.+?)\*\* : (.+)$/);
      if (!match) return null;
      const [, label, text] = match;
      const cat =
        Object.keys(CATEGORY_COLORS).find((c) =>
          label.toLowerCase().includes(c)
        ) || "personnage";
      const color = CATEGORY_COLORS[cat] || "#FF6B35";
      return { label, text, color };
    })
    .filter(Boolean) as { label: string; text: string; color: string }[];

  if (choices.length === 0) {
    return (
      <GlassCardV2 className="p-8 text-center">
        <p className="text-sm text-bw-muted">Aucun choix collectif enregistré.</p>
      </GlassCardV2>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-bw-heading uppercase tracking-wide">
        L&apos;histoire collective
      </h3>
      <div className="grid gap-3">
        {choices.map((c, i) => (
          <GlassCardV2
            key={i}
            className="p-4 border-l-4"
            style={{ borderLeftColor: c.color }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: c.color }}
            >
              {c.label}
            </span>
            <p className="text-sm text-bw-heading leading-relaxed mt-1">
              {c.text}
            </p>
          </GlassCardV2>
        ))}
      </div>
    </div>
  );
}
