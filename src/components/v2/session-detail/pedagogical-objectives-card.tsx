"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";
import type { ModuleGuide } from "@/lib/guide-data";

interface PedagogicalObjectivesCardProps {
  guide: ModuleGuide;
}

import { SOCLE_COLORS } from "@/lib/socle-colors";

export function PedagogicalObjectivesCard({ guide }: PedagogicalObjectivesCardProps) {
  return (
    <GlassCardV2 className="p-5">
      <p className="text-sm font-semibold text-bw-heading uppercase tracking-wide mb-4">Objectifs pédagogiques</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {guide.socleCommun.map((code) => {
          const colors = SOCLE_COLORS[code] || {
            bg: "#66666620",
            text: "#666",
          };
          return (
            <span
              key={code}
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {code}
            </span>
          );
        })}
      </div>

      <p className="text-sm text-bw-heading leading-relaxed mb-4">{guide.objectifPedagogique}</p>

      <ul className="space-y-2">
        {guide.competences.map((comp, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-bw-heading">
            <span className="text-emerald-500 mt-0.5 shrink-0">&#10003;</span>
            {comp}
          </li>
        ))}
      </ul>
    </GlassCardV2>
  );
}
