"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { SuccessCheck } from "@/components/play/success-check";
import type { Module10Data } from "@/hooks/use-session-polling";

export interface ObjectifObstacleStateProps {
  module10: Module10Data;
  sessionId: string;
  studentId: string;
  onDone: (data: { objectif: string; obstacle: string }) => void;
}

export function ObjectifObstacleState({ module10, sessionId, studentId, onDone }: ObjectifObstacleStateProps) {
  const [objectif, setObjectif] = useState(module10.objectif || "");
  const [obstacle, setObstacle] = useState(module10.obstacle || "");
  const [objectifReason, setObjectifReason] = useState(module10.objectifReason || "");
  const [customObjectif, setCustomObjectif] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const OBJECTIFS = [
    { key: "sauver", label: "Sauver quelqu'un", icon: "\u{1F6DF}" },
    { key: "prouver", label: "Prouver quelque chose", icon: "\u{1F4AA}" },
    { key: "fuir", label: "S'\u00E9chapper", icon: "\u{1F3C3}" },
    { key: "trouver", label: "Trouver la v\u00E9rit\u00E9", icon: "\u{1F50D}" },
    { key: "gagner", label: "Relever un d\u00E9fi", icon: "\u{1F3C6}" },
    { key: "proteger", label: "Prot\u00E9ger un secret", icon: "\u{1F92B}" },
    { key: "changer", label: "Changer sa vie", icon: "\u{1F504}" },
    { key: "venger", label: "R\u00E9parer une injustice", icon: "\u2696\uFE0F" },
  ];
  const OBSTACLES = [
    { key: "rival", label: "Un rival puissant", icon: "\u{1F44A}" },
    { key: "mensonge", label: "Un mensonge", icon: "\u{1F3AD}" },
    { key: "temps", label: "Le temps qui presse", icon: "\u23F0" },
    { key: "trahison", label: "Une trahison", icon: "\u{1F5E1}\uFE0F" },
    { key: "peur", label: "Sa propre peur", icon: "\u{1F628}" },
    { key: "regles", label: "Les r\u00E8gles", icon: "\u{1F4CF}" },
    { key: "solitude", label: "La solitude", icon: "\u{1F6B6}" },
    { key: "secret", label: "Un secret du pass\u00E9", icon: "\u{1F512}" },
  ];

  function selectObjectif(key: string) {
    setObjectif(key);
    setShowCustom(false);
    setCustomObjectif("");
  }

  function enableCustom() {
    setShowCustom(true);
    setObjectif("");
  }

  const effectiveObjectif = showCustom && customObjectif.trim() ? `custom:${customObjectif.trim()}` : objectif;

  const canSubmit = !!effectiveObjectif && !!obstacle && objectifReason.trim().length >= 5;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await fetch(`/api/sessions/${sessionId}/pitch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          objectif: effectiveObjectif,
          obstacle,
          objectifReason: objectifReason.trim(),
        }),
      });
      setSuccess(true);
      setTimeout(() => onDone({ objectif: effectiveObjectif, obstacle }), 600);
    } catch {
      toast.error("Erreur");
      setSubmitting(false);
    }
  }

  if (success) return <SuccessCheck />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4"
    >
      <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-bw-amber/20 text-bw-amber">
        Le moteur de l&apos;histoire
      </span>
      <p className="text-xs text-bw-muted text-center">
        Choisis un objectif et un obstacle pour{" "}
        <strong className="text-bw-text">{module10.personnage?.prenom || "ton personnage"}</strong>. Tu écriras le pitch
        à l&apos;étape suivante.
      </p>
      <div className="w-full">
        <p className="text-xs text-bw-muted uppercase tracking-wider mb-1.5">Objectif</p>
        <div className="flex flex-wrap gap-1.5">
          {OBJECTIFS.map((o) => (
            <motion.button
              key={o.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectObjectif(o.key)}
              className={`px-2.5 py-2 rounded-lg border transition-colors cursor-pointer flex flex-col items-center gap-0.5 min-w-[80px] ${
                objectif === o.key && !showCustom
                  ? "bg-bw-amber/20 border-bw-amber/40 text-bw-amber"
                  : "bg-bw-elevated border-white/[0.06] text-bw-muted hover:border-bw-amber/20"
              }`}
            >
              <span className="text-xl">{o.icon}</span>
              <span className="text-xs">{o.label}</span>
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={enableCustom}
            className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
              showCustom
                ? "bg-bw-amber/20 border-bw-amber/40 text-bw-amber"
                : "bg-bw-elevated border-white/[0.06] text-bw-muted hover:border-bw-amber/20"
            }`}
          >
            Autre...
          </motion.button>
        </div>
        <AnimatePresence>
          {showCustom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <input
                value={customObjectif}
                onChange={(e) => setCustomObjectif(e.target.value)}
                placeholder="Mon personnage veut..."
                maxLength={200}
                className="w-full mt-2 rounded-xl bg-bw-elevated border border-bw-amber/30 px-3 py-2 text-sm text-bw-text placeholder-bw-muted focus:border-bw-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-bw-amber/40 transition-colors"
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {effectiveObjectif && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <p className="text-xs text-bw-amber mb-1">Parce que...</p>
              <input
                value={objectifReason}
                onChange={(e) => setObjectifReason(e.target.value)}
                placeholder={`Pourquoi ${module10.personnage?.prenom || "ton personnage"} veut ça ?`}
                maxLength={200}
                className="w-full rounded-xl bg-bw-elevated border border-bw-amber/20 px-3 py-2 text-sm text-bw-text placeholder-bw-muted focus:border-bw-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-bw-amber/40 transition-colors"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="w-full">
        <p className="text-xs text-bw-muted uppercase tracking-wider mb-1.5">Obstacle</p>
        <div className="flex flex-wrap gap-1.5">
          {OBSTACLES.map((o) => (
            <motion.button
              key={o.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setObstacle(o.key)}
              className={`px-2.5 py-2 rounded-lg border transition-colors cursor-pointer flex flex-col items-center gap-0.5 min-w-[80px] ${
                obstacle === o.key
                  ? "bg-bw-danger/20 border-bw-danger/40 text-bw-danger"
                  : "bg-bw-elevated border-white/[0.06] text-bw-muted hover:border-bw-danger/20"
              }`}
            >
              <span className="text-xl">{o.icon}</span>
              <span className="text-xs">{o.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={submitting || !canSubmit}
        className="w-full py-3 rounded-xl bg-bw-amber text-white font-medium text-sm disabled:opacity-40 transition-opacity cursor-pointer hover:brightness-110"
      >
        {submitting
          ? "Envoi..."
          : !effectiveObjectif
            ? "Choisis un objectif"
            : !obstacle
              ? "Choisis un obstacle"
              : objectifReason.trim().length < 5
                ? 'Complète le "parce que..."'
                : "Valider"}
      </button>
    </motion.div>
  );
}
