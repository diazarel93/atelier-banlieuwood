"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";
import type { ModuleGuide } from "@/lib/guide-data";

interface FacilitatorTipsCardProps {
  guide: ModuleGuide;
}

export function FacilitatorTipsCard({ guide }: FacilitatorTipsCardProps) {
  return (
    <GlassCardV2 className="p-5">
      <p className="text-sm font-semibold text-bw-heading uppercase tracking-wide mb-4">
        Conseils de l&apos;intervenant
      </p>

      {/* Intro à dire */}
      <div className="rounded-xl bg-[var(--color-bw-surface-dim)] p-4 mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-bw-primary">Intro à dire</span>
        <p className="text-sm text-bw-heading mt-2 italic leading-relaxed">&ldquo;{guide.introADire}&rdquo;</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Relancer */}
        <div className="rounded-xl border border-bw-teal-200 bg-bw-teal-50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-bw-teal-600">Relancer</span>
          <ul className="mt-2 space-y-1.5">
            {guide.commentRelancer.map((r, i) => (
              <li key={i} className="text-xs text-bw-heading leading-relaxed">
                &bull; {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Challenger */}
        <div className="rounded-xl border border-bw-violet-200 bg-bw-violet-50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-bw-violet">Challenger</span>
          <ul className="mt-2 space-y-1.5">
            {guide.commentChallenger.map((c, i) => (
              <li key={i} className="text-xs text-bw-heading leading-relaxed">
                &bull; {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GlassCardV2>
  );
}
