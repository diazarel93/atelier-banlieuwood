"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Module8Data } from "@/hooks/use-session-polling";

interface MetierQuizProps {
  module8: Module8Data;
  sessionId: string;
  studentId: string;
}

/**
 * Adrian's quiz format: students click on the roles they think they know.
 * Then the debrief reveals the reality and corrects misconceptions.
 */
export function MetierQuiz({ module8, sessionId, studentId }: MetierQuizProps) {
  const quiz = module8.quiz || [];
  const alreadyAnswered = new Set((module8.studentAnswers || []).map((a) => a.metierKey));
  const [selected, setSelected] = useState<Set<string>>(alreadyAnswered);
  const [submitted, setSubmitted] = useState(alreadyAnswered.size > 0);
  const [submitting, setSubmitting] = useState(false);
  const [revealedIndex, setRevealedIndex] = useState(submitted ? quiz.length : -1);

  function toggleSelect(key: string) {
    if (submitted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleSubmit() {
    if (submitting || selected.size === 0) return;
    setSubmitting(true);

    try {
      // Submit all selected roles at once
      for (const metierKey of selected) {
        await fetch(`/api/sessions/${sessionId}/scenario`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "quiz-metier",
            studentId,
            metierKey,
            answer: true, // They claimed to know this role
          }),
        });
      }
      setSubmitted(true);
      // Start sequential reveal animation
      setRevealedIndex(0);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }

  // Auto-advance reveal
  function handleRevealNext() {
    if (revealedIndex < quiz.length - 1) {
      setRevealedIndex((i) => i + 1);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white">Les Métiers du Cinéma</h2>
        <p className="text-sm text-white/50 mt-1">
          {submitted
            ? "Découvre la réalité de chaque métier"
            : "Clique sur les métiers que tu penses connaître"}
        </p>
      </div>

      {/* Role cards grid */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {quiz.map((q, i) => {
          const isSelected = selected.has(q.metierKey);
          const isRevealed = submitted && i <= revealedIndex;

          return (
            <motion.button
              key={q.metierKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => !submitted ? toggleSelect(q.metierKey) : (i === revealedIndex ? handleRevealNext() : undefined)}
              disabled={submitted && i > revealedIndex}
              className={`relative p-4 rounded-xl text-center transition-all cursor-pointer border ${
                isRevealed
                  ? isSelected
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-white/5 border-white/10"
                  : isSelected
                  ? "bg-teal-500/20 border-teal-400 ring-1 ring-teal-400/30"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              } ${submitted && i > revealedIndex ? "opacity-40" : ""}`}
            >
              <span className="text-2xl block mb-1">{q.metierEmoji}</span>
              <p className="text-sm font-semibold text-white">{q.metierLabel}</p>

              {/* Before submit: show common belief as teaser */}
              {!submitted && (
                <p className="text-xs text-white/40 mt-1 italic">{q.commonBelief}</p>
              )}

              {/* After submit: reveal reality */}
              <AnimatePresence>
                {isRevealed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="mt-2"
                  >
                    {isSelected && (
                      <p className="text-xs text-white/40 line-through mb-1">{q.commonBelief}</p>
                    )}
                    <p className="text-xs text-emerald-300 leading-relaxed">{q.reality}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selection indicator */}
              {isSelected && !submitted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-teal-400 flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Submit or status */}
      {!submitted ? (
        <div className="text-center space-y-3 w-full">
          <p className="text-xs text-white/40">
            {selected.size === 0
              ? "Sélectionne au moins 1 métier"
              : `${selected.size} métier${selected.size > 1 ? "s" : ""} sélectionné${selected.size > 1 ? "s" : ""}`}
          </p>
          <button
            onClick={handleSubmit}
            disabled={submitting || selected.size === 0}
            className="w-full py-3 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 font-bold text-sm hover:bg-teal-500/30 disabled:opacity-40 transition-colors cursor-pointer"
          >
            {submitting ? "Envoi..." : "Valider mes choix"}
          </button>
        </div>
      ) : revealedIndex < quiz.length - 1 ? (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleRevealNext}
          className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 cursor-pointer transition-colors"
        >
          Suivant ({revealedIndex + 1}/{quiz.length})
        </motion.button>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-emerald-400 font-medium text-center"
        >
          Maintenant tu connais les métiers du cinéma !
        </motion.p>
      )}
    </div>
  );
}
