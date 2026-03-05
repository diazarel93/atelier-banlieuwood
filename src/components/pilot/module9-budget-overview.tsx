"use client";

import { motion } from "motion/react";
import { PRODUCTION_CATEGORIES } from "@/lib/constants";

interface Module9BudgetOverviewProps {
  budgetSubmitted: number;
  activeStudentCount: number;
  budgetAverages: Record<string, number>;
}

export function Module9BudgetOverview({
  budgetSubmitted,
  activeStudentCount,
  budgetAverages,
}: Module9BudgetOverviewProps) {
  return (
    <>
      {/* Activity description */}
      <div className="glass-card p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">💰</span>
          <span className="text-sm font-semibold text-bw-heading">Budget de production</span>
        </div>
        <p className="text-xs text-bw-muted leading-relaxed">
          Chaque élève dispose de crédits pour composer son budget de film.
          Il choisit un niveau (basique, standard ou premium) pour chaque poste de production :
          acteurs, décors, effets, musique, lumière, caméra.
        </p>
      </div>
      {/* Submission counter */}
      <div className="bg-bw-teal/10 rounded-xl p-4 border border-bw-teal/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-bw-teal font-medium">Budgets soumis</span>
          <span className="text-xl font-bold text-bw-teal tabular-nums">{budgetSubmitted}/{activeStudentCount}</span>
        </div>
        <div className="mt-2 h-2 bg-bw-bg rounded-full overflow-hidden">
          <div className="h-full bg-bw-teal rounded-full transition-all"
            style={{ width: `${activeStudentCount > 0 ? Math.round((budgetSubmitted / activeStudentCount) * 100) : 0}%` }} />
        </div>
      </div>

      {/* Class averages */}
      {budgetSubmitted > 0 && (
        <div className="bg-bw-surface rounded-xl p-4 border border-white/[0.06] space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Moyenne de la classe</span>
          {PRODUCTION_CATEGORIES.map((cat) => {
            const avg = budgetAverages[cat.key] || 0;
            const maxCost = Math.max(...cat.options.map((o) => o.cost));
            const pct = maxCost > 0 ? Math.round((avg / maxCost) * 100) : 0;
            const closestOpt = cat.options.reduce((prev, curr) =>
              Math.abs(curr.cost - avg) < Math.abs(prev.cost - avg) ? curr : prev
            );
            return (
              <div key={cat.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: cat.color }}>{cat.label}</span>
                  <span className="text-xs text-bw-text">{closestOpt.label} ({avg} cr.)</span>
                </div>
                <div className="h-2 bg-bw-bg rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
                    className="h-full rounded-full" style={{ backgroundColor: cat.color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
