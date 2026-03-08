"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  const existingStep = module5.checklist?.chosen_item
    ? module5.checklist?.scene_marquante ? (module5.checklist?.deeper_reflection ? 4 : 4) : 3
    : 1;
  const [step, setStep] = useState<1 | 2 | 3 | 4>(existingStep as 1 | 2 | 3 | 4);
  const [chosenItem, setChosenItem] = useState<string | null>(module5.checklist?.chosen_item || null);
  const [sceneMarquante, setSceneMarquante] = useState(module5.checklist?.scene_marquante || "");
  const [deeperReflection, setDeeperReflection] = useState(module5.checklist?.deeper_reflection || "");
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

  const chosenLabel = chosenItem ? catalog.find((c) => c.key === chosenItem)?.label || chosenItem : "";

  async function handleNext() {
    if (submitting) return;
    const items = Array.from(selected);
    if (step === 1 && items.length >= 3) {
      setStep(2);
      return;
    }
    if (step === 2 && chosenItem) {
      setStep(3);
      return;
    }
    if (step === 3 && sceneMarquante.trim().length >= 20) {
      setStep(4);
      return;
    }
    if (step === 4 && deeperReflection.trim().length >= 10) {
      setSubmitting(true);
      try {
        const res = await fetch(`/api/sessions/${sessionId}/checklist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            selectedItems: items,
            chosenItem,
            sceneMarquante: sceneMarquante.trim(),
            deeperReflection: deeperReflection.trim(),
          }),
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

  const stepTitles: Record<number, string> = {
    1: "Tes contenus préférés",
    2: "Choisis LE contenu",
    3: "La scène marquante",
    4: "Entre les lignes",
  };
  const stepDescriptions: Record<number, string> = {
    1: `Sélectionne les films, séries, anime que tu adores (${selected.size}/3 minimum)`,
    2: "Parmi ta sélection, choisis celui qui t'a le plus marqué",
    3: `Raconte une scène de ${chosenLabel} qui t'a vraiment marqué`,
    4: "Dans cette scène, qu'est-ce qui se passe vraiment ?",
  };

  const canContinue =
    (step === 1 && selected.size >= 3) ||
    (step === 2 && !!chosenItem) ||
    (step === 3 && sceneMarquante.trim().length >= 20) ||
    (step === 4 && deeperReflection.trim().length >= 10);

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
          {stepTitles[step]}
        </h2>
        <p className="text-sm text-bw-muted">
          {stepDescriptions[step]}
        </p>
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`w-2 h-2 rounded-full transition-colors ${s === step ? "bg-bw-pink" : s < step ? "bg-bw-pink/40" : "bg-white/10"}`} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-4 gap-2">
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
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="space-y-2">
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
              &larr; Modifier ma sélection
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="space-y-3">
            <div className="p-3 rounded-xl bg-bw-elevated border border-bw-pink/20 flex items-center gap-2">
              <span className="text-lg">{catalog.find((c) => c.key === chosenItem)?.emoji || "🎬"}</span>
              <span className="text-sm text-bw-pink font-medium">{chosenLabel}</span>
            </div>
            <textarea
              value={sceneMarquante}
              onChange={(e) => setSceneMarquante(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Décris la scène : que se passe-t-il ? Pourquoi elle t'a marqué ?"
              className="w-full rounded-xl bg-bw-elevated border border-white/[0.06] px-3 py-2.5 text-sm text-bw-text placeholder-bw-muted resize-none focus:border-bw-pink focus:outline-none transition-colors"
            />
            <div className="flex justify-between items-center">
              <button onClick={() => setStep(2)}
                className="text-xs text-bw-muted hover:text-white cursor-pointer transition-colors">
                &larr; Retour
              </button>
              <span className={`text-xs ${sceneMarquante.trim().length < 20 ? "text-bw-pink" : "text-bw-muted"}`}>
                {sceneMarquante.trim().length}/20 min
              </span>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="space-y-3">
            <div className="p-3 rounded-xl bg-bw-elevated border border-white/[0.06] text-xs text-bw-muted italic">
              &laquo; {sceneMarquante.trim().slice(0, 100)}{sceneMarquante.trim().length > 100 ? "..." : ""} &raquo;
            </div>
            <p className="text-xs text-bw-pink font-medium text-center">
              Dans cette scène, qu&apos;est-ce que le personnage veut vraiment ? Qu&apos;est-ce qui change pour lui ?
            </p>
            <textarea
              value={deeperReflection}
              onChange={(e) => setDeeperReflection(e.target.value)}
              rows={3}
              maxLength={400}
              placeholder="Ce que le personnage ressent ou ce qui change..."
              className="w-full rounded-xl bg-bw-elevated border border-white/[0.06] px-3 py-2.5 text-sm text-bw-text placeholder-bw-muted resize-none focus:border-bw-pink focus:outline-none transition-colors"
            />
            <div className="flex justify-between items-center">
              <button onClick={() => setStep(3)}
                className="text-xs text-bw-muted hover:text-white cursor-pointer transition-colors">
                &larr; Retour
              </button>
              <span className={`text-xs ${deeperReflection.trim().length < 10 ? "text-bw-pink" : "text-bw-muted"}`}>
                {deeperReflection.trim().length}/10 min
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleNext}
        disabled={!canContinue || submitting}
        className={`btn-glow w-full py-4 rounded-xl font-semibold transition-all ${
          canContinue
            ? "bg-bw-pink text-white cursor-pointer"
            : "bg-bw-elevated text-bw-muted cursor-not-allowed"
        }`}
      >
        {submitting ? "Envoi..." : step < 4 ? "Continuer" : "Valider"}
      </motion.button>
    </motion.div>
  );
}
