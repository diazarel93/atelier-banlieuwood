"use client";

import { motion } from "motion/react";
import { PRODUCTION_CATEGORIES } from "@/lib/constants";
import { GenericInlineActions } from "@/components/pilot/response-actions";

interface BudgetEntry {
  id: string;
  student_id: string;
  choices: Record<string, number>;
  credits_remaining: number;
  summary: string;
  students: { display_name: string; avatar: string };
}

interface Module9BudgetCardsProps {
  budgets: BudgetEntry[];
  cardSearch: string;
  activeStudentCount: number;
  budgetSubmitted: number;
  sessionStatus: string;
  studentWarnings: Record<string, number>;
  onBroadcast: (msg: string) => void;
  onWarn: (studentId: string) => void;
  isWarnPending: boolean;
  onOpenBroadcast: () => void;
}

export function Module9BudgetCards({
  budgets,
  cardSearch,
  activeStudentCount,
  budgetSubmitted,
  sessionStatus,
  studentWarnings,
  onBroadcast,
  onWarn,
  isWarnPending,
  onOpenBroadcast,
}: Module9BudgetCardsProps) {
  return (
    <>
      {/* Individual budgets */}
      {budgets.length > 0 && (
        <div className="space-y-2">
          {budgets.filter((b) => !cardSearch || (b.students?.display_name || "").toLowerCase().includes(cardSearch.toLowerCase())).map((b) => (
            <div key={b.id} className="bg-bw-surface rounded-xl p-3 border border-black/[0.06] space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{b.students?.avatar}</span>
                <span className="text-sm font-medium text-bw-heading">{b.students?.display_name}</span>
                <span className="ml-auto text-xs text-bw-teal font-medium tabular-nums">
                  {b.credits_remaining} cr.
                </span>
              </div>
              <div className="flex gap-1">
                {PRODUCTION_CATEGORIES.map((cat) => {
                  const cost = b.choices?.[cat.key] || 0;
                  const opt = cat.options.find((o) => o.cost === cost) || cat.options[0];
                  return (
                    <div key={cat.key} className="flex-1 text-center">
                      <div className="h-1.5 rounded-full mb-1"
                        style={{ backgroundColor: cost > 0 ? cat.color : "rgba(0,0,0,0.05)", opacity: cost > 0 ? 0.7 : 1 }} />
                      <span className="text-xs block" style={{ color: cat.color }}>{cat.label}</span>
                      <span className="text-xs text-bw-muted block">{opt.label}</span>
                    </div>
                  );
                })}
              </div>
              <GenericInlineActions
                entityId={b.id}
                studentId={b.student_id}
                studentName={b.students?.display_name || "Élève"}
                onBroadcast={onBroadcast}
                onWarn={onWarn}
                isWarnPending={isWarnPending}
                warnings={studentWarnings[b.student_id] || 0}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {budgetSubmitted === 0 && sessionStatus === "responding" && (
        <div className="bg-bw-surface rounded-xl border border-black/[0.06] p-6 text-center space-y-3">
          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
            className="text-3xl">💰</motion.div>
          <div>
            <p className="text-lg font-bold tabular-nums text-bw-teal">{budgetSubmitted}/{activeStudentCount}</p>
            <p className="text-xs text-bw-muted mt-0.5">budgets soumis</p>
          </div>
          <p className="text-xs text-bw-muted/70">Les choix budgetaires apparaitront ici.</p>
          <div className="flex items-center justify-center gap-2">
            <button onClick={onOpenBroadcast}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-bw-elevated border border-black/[0.06] text-bw-muted hover:text-bw-primary hover:border-bw-primary/30 cursor-pointer transition-colors">
              📢 Message classe
            </button>
          </div>
        </div>
      )}
    </>
  );
}
