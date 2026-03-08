"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { SuccessCheck } from "@/components/play/success-check";
import type { Module10Data } from "@/hooks/use-session-polling";

export interface PitchAssemblyStateProps {
  module10: Module10Data;
  sessionId: string;
  studentId: string;
  onDone: (data: { pitchText: string }) => void;
}

const MIN_PITCH_LENGTH = 80;

export function PitchAssemblyState({
  module10, sessionId, studentId, onDone,
}: PitchAssemblyStateProps) {
  const perso = module10.personnage;
  // Pre-fill from any saved draft or final pitch (even partial)
  const existingPitch = module10.pitchText && module10.pitchText.length > 0 ? module10.pitchText : "";
  const [pitchText, setPitchText] = useState(existingPitch);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [helpHint, setHelpHint] = useState<string | null>(null);
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpCount, setHelpCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const lastSavedRef = useRef(existingPitch);

  // Auto-save draft every 3s when text changes (prevents loss on refresh)
  const saveDraft = useCallback(async (text: string) => {
    if (text.trim().length < 10 || text.trim() === lastSavedRef.current) return;
    try {
      await fetch(`/api/sessions/${sessionId}/pitch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, objectif: module10.objectif || "", obstacle: module10.obstacle || "", pitchText: text.trim() }),
      });
      lastSavedRef.current = text.trim();
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch { /* silent draft save */ }
  }, [sessionId, studentId, module10.objectif, module10.obstacle]);

  useEffect(() => {
    if (pitchText.trim().length < 10) return;
    const timer = setTimeout(() => saveDraft(pitchText), 3000);
    return () => clearTimeout(timer);
  }, [pitchText, saveDraft]);

  // Find human-readable labels for objectif and obstacle
  const OBJECTIF_LABELS: Record<string, string> = {
    sauver: "Sauver quelqu'un", prouver: "Prouver quelque chose", fuir: "S'échapper",
    trouver: "Trouver la vérité", gagner: "Relever un défi", proteger: "Protéger un secret",
    changer: "Changer sa vie", venger: "Réparer une injustice",
  };
  const OBSTACLE_LABELS: Record<string, string> = {
    rival: "Un rival puissant", mensonge: "Un mensonge", temps: "Le temps qui presse",
    trahison: "Une trahison", peur: "Sa propre peur", regles: "Les règles",
    solitude: "La solitude", secret: "Un secret du passé",
  };
  const objectifLabel = OBJECTIF_LABELS[module10.objectif || ""] || module10.objectif || "?";
  const obstacleLabel = OBSTACLE_LABELS[module10.obstacle || ""] || module10.obstacle || "?";

  async function handleSubmit() {
    if (pitchText.trim().length < MIN_PITCH_LENGTH) return;
    setSubmitting(true);
    try {
      await fetch(`/api/sessions/${sessionId}/pitch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, objectif: module10.objectif || "", obstacle: module10.obstacle || "", pitchText: pitchText.trim() }),
      });
      setSuccess(true);
      setTimeout(() => onDone({ pitchText: pitchText.trim() }), 600);
    } catch { toast.error("Erreur"); setSubmitting(false); }
  }

  if (success) return <SuccessCheck />;

  async function handleHelp(type: string) {
    setHelpLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/help-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, step: "pitch", helpType: type, context: perso?.prenom || pitchText }),
      });
      const data = await res.json();
      if (data.hint) { setHelpHint(data.hint); setHelpCount((c) => c + 1); }
    } catch { /* ignore */ }
    finally { setHelpLoading(false); }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4">
      <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-bw-amber/20 text-bw-amber">
        Raconte l&apos;histoire
      </span>
      {/* Context badges — show what the student chose at previous steps */}
      <div className="w-full space-y-2">
        {perso && (
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 18 }}
            className="flex items-center gap-2 text-sm text-bw-text">
            <span className="text-lg">{perso.avatar?.accessory === "lunettes" ? "🤓" : "😊"}</span>
            <strong>{perso.prenom}</strong>
            {perso.trait && <span className="text-bw-muted">· {perso.trait}</span>}
          </motion.div>
        )}
        <div className="flex flex-wrap gap-1.5">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
            className="px-2 py-1 text-xs rounded-lg bg-bw-amber/10 border border-bw-amber/20 text-bw-amber">
            Objectif : {objectifLabel}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 15 }}
            className="px-2 py-1 text-xs rounded-lg bg-bw-danger/10 border border-bw-danger/20 text-bw-danger">
            Obstacle : {obstacleLabel}
          </motion.span>
        </div>
      </div>
      {/* Adrian: structure à trous, pas de textarea libre */}
      <p className="text-xs text-bw-muted text-center leading-relaxed">
        Complète la structure pour raconter l&apos;histoire de <strong className="text-bw-text">{perso?.prenom || "ton personnage"}</strong>.
      </p>
      <div className="w-full space-y-3">
        <div className="p-3 rounded-xl bg-bw-elevated border border-white/[0.06]">
          <p className="text-xs text-bw-muted mb-1">C&apos;est l&apos;histoire de <strong className="text-bw-amber">{perso?.prenom || "..."}</strong>{perso?.trait ? `, ${perso.trait},` : ""} qui veut <strong className="text-bw-amber">{objectifLabel}</strong>.</p>
        </div>
        <div className="p-3 rounded-xl bg-bw-elevated border border-white/[0.06]">
          <p className="text-xs text-bw-muted mb-1">Mais <strong className="text-bw-danger">{obstacleLabel}</strong>.</p>
        </div>
        <div className="p-3 rounded-xl bg-bw-elevated border border-bw-amber/20">
          <p className="text-xs text-bw-muted mb-1.5">Raconte la suite : un jour, que se passe-t-il ?</p>
          <textarea value={pitchText} onChange={(e) => setPitchText(e.target.value)} rows={5} maxLength={600}
            placeholder={`Un jour, ${perso?.prenom || "mon personnage"} décide de... mais alors...`}
            className="w-full rounded-lg bg-transparent text-sm text-bw-text placeholder:text-bw-muted resize-none focus:outline-none" />
        </div>
      </div>
      <div className="flex items-center gap-2 w-full">
        {module10.helpEnabled && ["example", "starter", "reformulate"].map((type) => (
          <button key={type} onClick={() => handleHelp(type)} disabled={helpLoading || helpCount >= 3}
            className="px-2 py-1 text-xs rounded-lg bg-bw-elevated border border-white/[0.06] text-bw-muted hover:text-bw-amber hover:border-bw-amber/30 disabled:opacity-30 transition-colors cursor-pointer">
            {type === "example" ? "💡" : type === "starter" ? "✏️" : "🔄"}
          </button>
        ))}
        <AnimatePresence>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-bw-green ml-auto">Brouillon sauvé ✓</motion.span>
          )}
        </AnimatePresence>
        <span className={`text-xs ${saved ? "" : "ml-auto"} ${pitchText.trim().length < MIN_PITCH_LENGTH ? "text-bw-amber" : "text-bw-muted"}`}>
          {pitchText.trim().length}/{MIN_PITCH_LENGTH} min
        </span>
      </div>
      <AnimatePresence>
        {helpHint && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="w-full p-3 rounded-xl bg-bw-amber/10 border border-bw-amber/20 text-xs text-bw-amber">
            {helpHint}
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={handleSubmit} disabled={submitting || pitchText.trim().length < MIN_PITCH_LENGTH}
        className="w-full py-3 rounded-xl bg-bw-amber text-white font-medium text-sm disabled:opacity-40 transition-opacity cursor-pointer hover:brightness-110">
        {submitting ? "Envoi..." : pitchText.trim().length < MIN_PITCH_LENGTH ? `Encore ${MIN_PITCH_LENGTH - pitchText.trim().length} caractères...` : "Valider mon pitch"}
      </button>
    </motion.div>
  );
}
