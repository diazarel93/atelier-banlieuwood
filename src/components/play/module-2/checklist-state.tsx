"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Module5Data } from "@/hooks/use-session-polling";

export interface ChecklistStateProps {
  sessionId: string;
  studentId: string;
  module5: Module5Data;
  onDone: () => void;
}

export function ChecklistState({
  sessionId,
  studentId,
  module5,
  onDone,
}: ChecklistStateProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(module5.checklist?.selected_items || [])
  );
  const [step, setStep] = useState<1 | 2>(module5.checklist?.chosen_item ? 2 : 1);
  const [chosenItem, setChosenItem] = useState<string | null>(module5.checklist?.chosen_item || null);
  const [submitting, setSubmitting] = useState(false);

  // Lazy import content catalog
  const [catalog, setCatalog] = useState<{ key: string; label: string; emoji: string }[]>([]);
  useEffect(() => {
    import("@/lib/module5-data").then((m) => setCatalog(m.CONTENT_CATALOG));
  }, []);

  function toggleItem(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleSubmit() {
    if (submitting) return;
    const items = Array.from(selected);
    if (step === 1 && items.length >= 3) {
      setStep(2);
      return;
    }
    if (step === 2 && chosenItem) {
      setSubmitting(true);
      try {
        const res = await fetch(`/api/sessions/${sessionId}/checklist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, selectedItems: items, chosenItem }),
        });
        if (res.ok) {
          toast.success("Sélection envoyée !");
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
  }

  if (!catalog.length) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col gap-5 w-full">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-bw-pink to-bw-pink/60 mx-auto flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold font-cinema tracking-wider">
          {step === 1 ? "Tes contenus préférés" : "Choisis LE contenu"}
        </h2>
        <p className="text-sm text-bw-muted">
          {step === 1
            ? `Sélectionne les films, séries, anime que tu adores (${selected.size}/3 minimum)`
            : "Parmi ta sélection, choisis celui qui t'a le plus marqué"}
        </p>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-4 gap-2">
          {catalog.map((item) => {
            const isSelected = selected.has(item.key);
            return (
              <motion.button
                key={item.key}
                whileTap={{ scale: 0.93 }}
                onClick={() => toggleItem(item.key)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-bw-pink bg-bw-pink/10"
                    : "border-white/[0.06] bg-bw-elevated"
                }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className={`text-xs leading-tight text-center ${isSelected ? "text-bw-pink" : "text-bw-muted"}`}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          {Array.from(selected).map((key) => {
            const item = catalog.find((c) => c.key === key);
            if (!item) return null;
            const isChosen = chosenItem === key;
            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setChosenItem(key)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                  isChosen
                    ? "border-bw-pink bg-bw-pink/10"
                    : "border-white/[0.06] bg-bw-elevated"
                }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className={`text-sm font-medium ${isChosen ? "text-bw-pink" : "text-bw-text"}`}>
                  {item.label}
                </span>
                {isChosen && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="ml-auto w-6 h-6 rounded-full bg-bw-pink flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
          <button
            onClick={() => { setStep(1); setChosenItem(null); }}
            className="text-xs text-bw-muted hover:text-white cursor-pointer transition-colors"
          >
            ← Modifier ma sélection
          </button>
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleSubmit}
        disabled={(step === 1 && selected.size < 3) || (step === 2 && !chosenItem) || submitting}
        className={`btn-glow w-full py-4 rounded-xl font-semibold transition-all ${
          (step === 1 && selected.size >= 3) || (step === 2 && chosenItem)
            ? "bg-bw-pink text-white cursor-pointer"
            : "bg-bw-elevated text-bw-muted cursor-not-allowed"
        }`}
      >
        {submitting ? "Envoi..." : step === 1 ? `Continuer (${selected.size} sélectionnés)` : "Valider mon choix"}
      </motion.button>
    </motion.div>
  );
}
