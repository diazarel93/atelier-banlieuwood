"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";
import { BUDGET_CATEGORIES } from "@/lib/constants";

interface BudgetBarsCardProps {
  averages: Record<string, number>;
}

export function BudgetBarsCard({ averages }: BudgetBarsCardProps) {
  if (!averages || Object.keys(averages).length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-bw-heading uppercase tracking-wide">
        Choix de production
      </h3>
      <GlassCardV2 className="p-5 space-y-3">
        {BUDGET_CATEGORIES.map((cat) => {
          const avg = averages[cat.key] || 0;
          const closestOption = cat.options.reduce((prev, curr) =>
            Math.abs(curr.cost - avg) < Math.abs(prev.cost - avg) ? curr : prev
          );
          return (
            <div key={cat.key} className="flex items-center gap-3">
              <span
                className="text-xs w-20 font-medium shrink-0"
                style={{ color: cat.color }}
              >
                {cat.label}
              </span>
              <div className="flex-1 bg-[var(--color-bw-border-subtle)] rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    backgroundColor: cat.color,
                    width: `${(avg / 40) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs text-bw-muted w-28 text-right truncate">
                {closestOption.label}
              </span>
            </div>
          );
        })}
      </GlassCardV2>
    </div>
  );
}
