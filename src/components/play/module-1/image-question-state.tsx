"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import type { Module1Data } from "@/hooks/use-session-polling";

export interface ImageQuestionStateProps {
  module1: Module1Data;
  sessionId: string;
  studentId: string;
  onAnswered: () => void;
}

export function ImageQuestionState({
  module1,
  sessionId,
  studentId,
  onAnswered,
}: ImageQuestionStateProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageFullscreen, setImageFullscreen] = useState(false);
  const [showRelance, setShowRelance] = useState(false);

  async function handleSubmit() {
    if (!text.trim() || submitting || !module1.question?.situationId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          situationId: module1.question.situationId,
          text: text.trim(),
        }),
      });
      if (res.ok) {
        setText("");
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

  // If confrontation is active, show it
  if (module1.confrontation) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col gap-5 w-full">
        <p className="text-sm text-bw-violet text-center font-semibold uppercase tracking-wider">Confrontation</p>
        <div className="grid grid-cols-2 gap-4">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="bg-bw-primary/10 rounded-xl p-4 border border-bw-primary/30">
            <p className="text-xs text-bw-primary mb-2 font-semibold uppercase">Réponse A</p>
            <p className="text-sm text-bw-heading leading-relaxed">{module1.confrontation.responseA}</p>
          </motion.div>
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="bg-bw-danger/10 rounded-xl p-4 border border-bw-danger/30">
            <p className="text-xs text-bw-danger mb-2 font-semibold uppercase">Réponse B</p>
            <p className="text-sm text-bw-heading leading-relaxed">{module1.confrontation.responseB}</p>
          </motion.div>
        </div>
        <p className="text-xs text-bw-muted text-center">Le facilitateur a projeté deux réponses pour le débat.</p>
      </motion.div>
    );
  }

  // If already responded, show waiting
  if (module1.hasResponded) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-bw-teal/20 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm text-bw-teal font-medium">Réponse envoyée !</p>
        <p className="text-xs text-bw-muted">En attente du facilitateur...</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col gap-5 w-full">
      {/* Image */}
      {module1.image && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-bw-violet/20 text-bw-violet">
              {module1.image.title || `Image ${module1.image.position}`}
            </span>
            <button onClick={() => setImageFullscreen(true)}
              className="text-xs text-bw-muted hover:text-white cursor-pointer flex items-center gap-1 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
              Agrandir
            </button>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-white/[0.06] bg-bw-elevated cursor-pointer"
            onClick={() => setImageFullscreen(true)}>
            <div className="aspect-[4/3] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={module1.image.url} alt={module1.image.title}
                className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </div>
      )}

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {imageFullscreen && module1.image && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setImageFullscreen(false)}>
            <button onClick={() => setImageFullscreen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-colors z-10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={module1.image.url} alt={module1.image.title}
              className="max-w-full max-h-full object-contain" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question + answer */}
      {module1.question && (
        <div className="space-y-3">
          <p className="text-base text-bw-heading leading-relaxed">{module1.question.text}</p>

          {module1.question.relance && (
            <div>
              <button onClick={() => setShowRelance(!showRelance)}
                className="text-xs text-bw-teal cursor-pointer flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                </svg>
                {showRelance ? "Masquer l'aide" : "Un coup de pouce ?"}
              </button>
              <AnimatePresence>
                {showRelance && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-bw-teal italic mt-2 pl-4 border-l-2 border-bw-teal/30">
                    {module1.question.relance}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écris ta réponse ici..."
            rows={3}
            maxLength={500}
            className="w-full bw-script bg-bw-elevated border border-white/[0.06] rounded-xl p-3 text-bw-heading placeholder:text-bw-muted focus:border-bw-primary focus:outline-none transition-colors resize-none"
            autoFocus
          />

          <div className="flex justify-between items-center">
            <span className="text-[10px] text-bw-muted">{text.length}/500</span>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              className={`btn-glow px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                text.trim() && !submitting
                  ? "bg-bw-primary text-white cursor-pointer"
                  : "bg-bw-elevated text-bw-muted cursor-not-allowed"
              }`}>
              {submitting ? "..." : "Envoyer"}
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
