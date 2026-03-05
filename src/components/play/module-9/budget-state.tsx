"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { PRODUCTION_CATEGORIES, BUDGET_TOTAL, BUDGET_RESERVE_MIN, generateBudgetSummary } from "@/lib/constants";

export interface BudgetStateProps {
  sessionId: string;
  studentId: string;
  storyContext?: Record<string, string>;
  onDone: () => void;
}

export function BudgetState({
  sessionId,
  studentId,
  storyContext,
  onDone,
}: BudgetStateProps) {
  // choices = { acteurs: 15, decors: 0, effets: 40, ... } (cost values, not indices)
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const total = Object.values(choices).reduce((a, b) => a + b, 0);
  const remaining = BUDGET_TOTAL - total;
  const reserveOk = remaining >= BUDGET_RESERVE_MIN;
  const allChosen = PRODUCTION_CATEGORIES.every((cat) => choices[cat.key] != null);
  const canSubmit = allChosen && reserveOk && !submitting;

  function selectOption(catKey: string, cost: number) {
    setChoices((prev) => {
      const prevCost = prev[catKey] || 0;
      const newTotal = total - prevCost + cost;
      if (BUDGET_TOTAL - newTotal < BUDGET_RESERVE_MIN) {
        if (cost >= prevCost && prevCost !== cost) {
          toast.error(`Réserve minimum : ${BUDGET_RESERVE_MIN} crédits`);
          return prev;
        }
      }
      return { ...prev, [catKey]: cost };
    });
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, choices }),
      });
      if (res.ok) {
        toast.success("Choix envoyés !");
        onDone();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col gap-5 w-full">
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.3), rgba(255,107,53,0.2))" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v12M8 10h8M8 14h8" />
          </svg>
        </motion.div>
        <h2 className="text-xl font-bold font-cinema tracking-wide">Ton film, tes choix</h2>
        <p className="text-sm text-bw-muted">
          Tu as <strong className="text-white">{BUDGET_TOTAL} crédits</strong> d&apos;énergie créative. Chaque choix coûte — impossible de tout avoir.
        </p>
      </div>

      {/* Credits remaining */}
      <div className="bg-bw-elevated rounded-xl px-5 py-3 flex items-center justify-between border border-white/[0.06]">
        <span className="text-sm text-bw-muted">Crédits restants</span>
        <span className={`text-2xl font-bold ${!reserveOk ? "text-bw-danger" : remaining <= BUDGET_RESERVE_MIN ? "text-bw-amber" : "text-white"}`}>
          {remaining}
        </span>
      </div>
      {!reserveOk && (
        <p className="text-xs text-bw-danger text-center -mt-3">Réserve minimum : {BUDGET_RESERVE_MIN} crédits</p>
      )}

      {/* Category options */}
      <div className="space-y-4">
        {PRODUCTION_CATEGORIES.map((cat, catIdx) => {
          const selected = choices[cat.key];
          // Show story context if available for this category
          const contextText = cat.storyCategory && storyContext?.[cat.storyCategory];
          return (
            <motion.div key={cat.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.06 }}
              className="bg-bw-elevated rounded-xl p-4 border border-white/[0.06]"
            >
              <p className="text-sm font-semibold mb-1" style={{ color: cat.color }}>{cat.label}</p>
              {/* Narrative context from Module 3 */}
              {contextText && (
                <p className="text-xs text-bw-muted italic mb-3 line-clamp-2">
                  &laquo; {contextText} &raquo;
                </p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {cat.options.map((opt) => {
                  const isSelected = selected === opt.cost;
                  return (
                    <motion.button
                      key={opt.cost}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectOption(cat.key, opt.cost)}
                      className={`py-2.5 px-2 rounded-xl text-center transition-all cursor-pointer border ${
                        isSelected
                          ? "border-current bg-current/10"
                          : "border-white/[0.06] bg-bw-bg hover:border-white/20"
                      }`}
                      style={isSelected ? { color: cat.color, borderColor: cat.color, backgroundColor: `${cat.color}15` } : {}}
                    >
                      <span className={`text-xs font-medium block ${isSelected ? "" : "text-bw-text"}`}>{opt.label}</span>
                      <span className={`text-[10px] block mt-0.5 ${isSelected ? "" : "text-bw-muted"}`}>
                        {opt.cost === 0 ? "Gratuit" : `${opt.cost} cr.`}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary preview */}
      {allChosen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border-bw-teal/20 p-4"
        >
          <p className="text-xs text-bw-teal font-medium mb-1">Résumé de ton film</p>
          <p className="text-sm text-bw-text leading-relaxed">{generateBudgetSummary(choices)}</p>
        </motion.div>
      )}

      <motion.button whileTap={{ scale: 0.95 }} whileHover={canSubmit ? { scale: 1.02 } : undefined} onClick={handleSubmit}
        disabled={!canSubmit}
        className={`btn-glow w-full py-4 rounded-xl font-bold transition-all ${
          canSubmit ? "text-white cursor-pointer shadow-lg" : "bg-bw-elevated text-bw-muted cursor-not-allowed"
        }`}
        style={canSubmit ? { background: "linear-gradient(135deg, #FF6B35, #D4A843)", boxShadow: "0 4px 15px rgba(255,107,53,0.3)" } : undefined}>
        {submitting ? "Envoi..." : "Valider mes choix"}
      </motion.button>
    </motion.div>
  );
}
