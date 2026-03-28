"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import type { Module10Data } from "@/hooks/use-session-polling";

export interface PitchConfrontationStateProps {
  module10: Module10Data;
  sessionId: string;
  studentId: string;
}

export function PitchConfrontationState({ module10, sessionId, studentId }: PitchConfrontationStateProps) {
  const confrontation = module10.confrontation;
  const [answers, setAnswers] = useState({ who: "", wants: "", obstacle: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Auto-audit: after comprehension questions, student reviews their own pitch
  const [auditDone, setAuditDone] = useState(false);
  const [audit, setAudit] = useState({ clear: false, engaging: false, concise: false });

  if (!confrontation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-4xl"
        >
          ⚔️
        </motion.div>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-sm text-bw-muted"
        >
          En attente de la sélection du facilitateur...
        </motion.div>
      </motion.div>
    );
  }

  const pitches = [confrontation.pitchA, confrontation.pitchB];
  const colors = ["from-bw-teal/20 to-bw-teal/5", "from-bw-amber/20 to-bw-amber/5"];
  const borderColors = ["border-bw-teal/20", "border-bw-amber/20"];
  const nameColors = ["text-bw-teal", "text-bw-amber"];

  async function handleSubmitQuestions() {
    if (!answers.who.trim() || !answers.wants.trim() || !answers.obstacle.trim()) return;
    setSubmitting(true);
    try {
      // Save the 3 answers as a single response
      const text = `Personnage: ${answers.who.trim()} | Veut: ${answers.wants.trim()} | Obstacle: ${answers.obstacle.trim()}`;
      await fetch(`/api/sessions/${sessionId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          situationId: (confrontation as Record<string, unknown>)?.situationId || "confrontation",
          text,
        }),
      });
      setSubmitted(true);
    } catch {
      toast.error("Erreur d'envoi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4"
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-bw-amber/20 text-bw-amber"
      >
        Confrontation
      </motion.span>
      <div className="grid grid-cols-2 gap-3 w-full items-start">
        {pitches.map((pitch, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i === 0 ? -30 : 30, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.3 + i * 0.25 }}
            className={`p-3 rounded-xl bg-gradient-to-b ${colors[i]} border ${borderColors[i]} space-y-2`}
          >
            <p className={`text-xs font-medium ${nameColors[i]}`}>{pitch.prenom}</p>
            <p className="text-xs text-bw-text leading-relaxed">{pitch.text}</p>
          </motion.div>
        ))}
      </div>
      {/* VS badge between cards */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.8 }}
        className="-mt-3 w-8 h-8 rounded-full bg-bw-elevated border border-white/10 flex items-center justify-center text-xs font-bold text-bw-muted"
      >
        VS
      </motion.div>

      {/* 3 comprehension questions */}
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-3 mt-2"
          >
            <p className="text-xs text-bw-muted text-center">
              Réponds à ces 3 questions après avoir écouté les pitchs :
            </p>
            <div>
              <label className="text-xs text-bw-muted uppercase tracking-wider">1. Qui est ton personnage ?</label>
              <input
                value={answers.who}
                onChange={(e) => setAnswers((a) => ({ ...a, who: e.target.value }))}
                maxLength={100}
                placeholder="Décris le personnage principal..."
                className="w-full mt-1 rounded-xl bg-bw-elevated border border-white/[0.06] px-3 py-2 text-sm text-bw-text placeholder-bw-muted focus:border-bw-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-bw-amber/40 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-bw-muted uppercase tracking-wider">
                2. Qu&apos;est-ce qu&apos;il veut ?
              </label>
              <input
                value={answers.wants}
                onChange={(e) => setAnswers((a) => ({ ...a, wants: e.target.value }))}
                maxLength={100}
                placeholder="Son objectif..."
                className="w-full mt-1 rounded-xl bg-bw-elevated border border-white/[0.06] px-3 py-2 text-sm text-bw-text placeholder-bw-muted focus:border-bw-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-bw-amber/40 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-bw-muted uppercase tracking-wider">
                3. Qu&apos;est-ce qui l&apos;empêche ?
              </label>
              <input
                value={answers.obstacle}
                onChange={(e) => setAnswers((a) => ({ ...a, obstacle: e.target.value }))}
                maxLength={100}
                placeholder="L'obstacle principal..."
                className="w-full mt-1 rounded-xl bg-bw-elevated border border-white/[0.06] px-3 py-2 text-sm text-bw-text placeholder-bw-muted focus:border-bw-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-bw-amber/40 transition-colors"
              />
            </div>
            <button
              onClick={handleSubmitQuestions}
              disabled={submitting || !answers.who.trim() || !answers.wants.trim() || !answers.obstacle.trim()}
              className="w-full py-3 rounded-xl bg-bw-amber text-white font-medium text-sm disabled:opacity-40 transition-opacity cursor-pointer hover:brightness-110"
            >
              {submitting ? "Envoi..." : "Envoyer mes réponses"}
            </button>
          </motion.div>
        ) : !auditDone ? (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-3 mt-2"
          >
            <p className="text-xs text-bw-amber font-medium text-center">Auto-audit — Repense à ton propre pitch :</p>
            {module10.pitchText && (
              <div className="p-3 rounded-xl bg-bw-elevated border border-white/[0.06] text-xs text-bw-muted italic max-h-24 overflow-y-auto">
                {module10.pitchText}
              </div>
            )}
            {[
              { key: "clear" as const, q: "Mon personnage, son objectif et son obstacle sont clairs ?" },
              { key: "engaging" as const, q: "Mon pitch donne envie d'en savoir plus ?" },
              { key: "concise" as const, q: "Mon pitch tient en 30 secondes à l'oral ?" },
            ].map((item) => (
              <motion.button
                key={item.key}
                whileTap={{ scale: 0.97 }}
                onClick={() => setAudit((a) => ({ ...a, [item.key]: !a[item.key] }))}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer text-left ${
                  audit[item.key]
                    ? "bg-bw-green/10 border-bw-green/30 text-bw-green"
                    : "bg-bw-elevated border-white/[0.06] text-bw-muted hover:border-bw-amber/20"
                }`}
              >
                <span className="text-lg">{audit[item.key] ? "✅" : "⬜"}</span>
                <span className="text-xs">{item.q}</span>
              </motion.button>
            ))}
            <button
              onClick={() => setAuditDone(true)}
              className="w-full py-3 rounded-xl bg-bw-amber text-white font-medium text-sm cursor-pointer hover:brightness-110 transition-opacity"
            >
              Terminer l&apos;auto-audit
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-2"
          >
            <p className="text-sm text-bw-teal font-medium">Réponses envoyées !</p>
            <p className="text-xs text-bw-muted">Écoute les deux pitchs et prépare-toi à voter !</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
