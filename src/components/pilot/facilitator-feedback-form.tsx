"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface FacilitatorFeedbackFormProps {
  sessionId: string;
  onComplete?: () => void;
  onSkip?: () => void;
}

const QUESTIONS = [
  { key: "energyLevel", label: "Niveau d'energie du groupe", low: "Tres calme", high: "Tres dynamique" },
  { key: "participationQuality", label: "Qualite de participation", low: "Faible", high: "Excellente" },
  { key: "toolEase", label: "Facilite d'utilisation de l'outil", low: "Difficile", high: "Tres facile" },
  { key: "wouldRedo", label: "Je referais cette seance", low: "Pas du tout", high: "Absolument" },
] as const;

export function FacilitatorFeedbackForm({ sessionId, onComplete, onSkip }: FacilitatorFeedbackFormProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const allAnswered = QUESTIONS.every((q) => answers[q.key] != null);

  async function handleSubmit() {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/facilitator-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...answers, notes: notes.trim() || undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { error?: string }).error || "Erreur");
        return;
      }
      toast.success("Merci pour ton retour !");
      onComplete?.();
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-5"
    >
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold text-bw-heading">Retour de seance</h2>
        <p className="text-xs text-bw-muted">2 minutes — optionnel et confidentiel</p>
      </div>

      {QUESTIONS.map((q, i) => (
        <motion.div
          key={q.key}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="space-y-2"
        >
          <p className="text-sm font-medium text-bw-heading">{q.label}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-bw-muted w-14 text-right shrink-0">{q.low}</span>
            <div className="flex gap-1.5 flex-1 justify-center">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.key]: val }))}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    answers[q.key] === val
                      ? "bg-bw-primary text-white scale-110 shadow-md"
                      : "bg-[var(--color-bw-surface-dim)] text-bw-muted hover:bg-bw-primary/10 hover:text-bw-primary"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-bw-muted w-14 shrink-0">{q.high}</span>
          </div>
        </motion.div>
      ))}

      {/* Free text */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-bw-heading">Notes libres <span className="text-bw-muted font-normal">(optionnel)</span></p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ce qui s'est passe en salle, signaux faibles, dynamiques de groupe..."
          maxLength={1000}
          rows={3}
          className="w-full rounded-xl border border-[var(--color-bw-border)] bg-card px-3 py-2 text-sm text-bw-heading placeholder:text-bw-muted/50 resize-none focus:outline-none focus:ring-2 focus:ring-bw-primary/30"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onSkip}
          className="flex-1 py-2.5 rounded-xl border border-[var(--color-bw-border)] text-sm font-medium text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors cursor-pointer"
        >
          Passer
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="flex-1 py-2.5 rounded-xl bg-bw-primary text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-bw-primary/90 transition-colors"
        >
          {submitting ? "Envoi..." : "Envoyer"}
        </button>
      </div>
    </motion.div>
  );
}
