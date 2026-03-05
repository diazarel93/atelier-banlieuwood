"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Module1Data } from "@/hooks/use-session-polling";

export interface PositioningStateProps {
  module1: Module1Data;
  sessionId: string;
  studentId: string;
  currentSituationIndex: number;
  onAnswered: () => void;
}

export function PositioningState({
  module1,
  sessionId,
  studentId,
  currentSituationIndex,
  onAnswered,
}: PositioningStateProps) {
  const [submitting, setSubmitting] = useState(false);
  const questions = module1.questions || [];
  const currentQ = questions[currentSituationIndex];
  const totalQ = questions.length;
  const answeredCount = Object.values(module1.answeredQuestions || {}).filter(Boolean).length;
  const allAnswered = answeredCount >= totalQ;

  async function handleSelectOption(optionKey: string) {
    if (!currentQ?.situationId || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          situationId: currentQ.situationId,
          text: optionKey,
        }),
      });
      if (res.ok) {
        onAnswered();
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

  if (allAnswered) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-4 text-center w-full">
        <div className="w-16 h-16 rounded-full bg-bw-teal/20 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm text-bw-teal font-medium">Positionnement terminé !</p>
        <p className="text-xs text-bw-muted">En attente du facilitateur...</p>
      </motion.div>
    );
  }

  if (!currentQ) return null;

  const isAnswered = module1.answeredQuestions?.[currentSituationIndex + 1];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col gap-5 w-full">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-bw-muted">
          <span>Question {currentSituationIndex + 1}/{totalQ}</span>
          <span className="text-bw-violet">{currentQ.measure}</span>
        </div>
        <div className="w-full h-1.5 bg-bw-elevated rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${((currentSituationIndex + 1) / totalQ) * 100}%` }}
            className="h-full rounded-full bg-bw-violet"
          />
        </div>
      </div>

      {/* Question */}
      <motion.p
        key={currentSituationIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-medium text-bw-heading leading-relaxed text-center px-2"
      >
        {currentQ.text}
      </motion.p>

      {/* Options */}
      {!isAnswered && (
        <motion.div
          key={`opts-${currentSituationIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {(currentQ.options || []).map((opt, i) => (
            <motion.button
              key={opt.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelectOption(opt.key)}
              disabled={submitting}
              className="w-full text-left p-4 rounded-xl border border-white/[0.06] bg-bw-elevated hover:border-bw-violet/50 hover:bg-bw-violet/5 transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-bw-violet/20 text-bw-violet flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {opt.key.toUpperCase()}
                </span>
                <span className="text-sm text-bw-heading leading-relaxed pt-1">{opt.label}</span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {isAnswered && (
        <div className="text-center py-4">
          <p className="text-sm text-bw-teal">Répondu ! En attente de la question suivante...</p>
        </div>
      )}
    </motion.div>
  );
}
