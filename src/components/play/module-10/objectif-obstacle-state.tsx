"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { SuccessCheck } from "@/components/play/success-check";
import type { Module10Data } from "@/hooks/use-session-polling";

export interface ObjectifObstacleStateProps {
  module10: Module10Data;
  sessionId: string;
  studentId: string;
  onDone: (data: { objectif: string; obstacle: string }) => void;
}

export function ObjectifObstacleState({
  module10, sessionId, studentId, onDone,
}: ObjectifObstacleStateProps) {
  const [objectif, setObjectif] = useState(module10.objectif || "");
  const [obstacle, setObstacle] = useState(module10.obstacle || "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const OBJECTIFS = [
    { key: "sauver", label: "Sauver quelqu'un" }, { key: "prouver", label: "Prouver quelque chose" },
    { key: "fuir", label: "S'échapper" }, { key: "trouver", label: "Trouver la vérité" },
    { key: "gagner", label: "Gagner un défi" }, { key: "proteger", label: "Protéger un secret" },
    { key: "changer", label: "Changer sa vie" }, { key: "venger", label: "Réparer une injustice" },
  ];
  const OBSTACLES = [
    { key: "rival", label: "Un rival puissant" }, { key: "mensonge", label: "Un mensonge" },
    { key: "temps", label: "Le temps qui presse" }, { key: "trahison", label: "Une trahison" },
    { key: "peur", label: "Sa propre peur" }, { key: "regles", label: "Les règles" },
    { key: "solitude", label: "La solitude" }, { key: "secret", label: "Un secret du passé" },
  ];

  async function handleSubmit() {
    if (!objectif || !obstacle) return;
    setSubmitting(true);
    try {
      await fetch(`/api/sessions/${sessionId}/pitch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, objectif, obstacle }),
      });
      setSuccess(true);
      setTimeout(() => onDone({ objectif, obstacle }), 600);
    } catch { toast.error("Erreur"); setSubmitting(false); }
  }

  if (success) return <SuccessCheck />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4">
      <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-bw-amber/20 text-bw-amber">
        Le moteur de l&apos;histoire
      </span>
      <p className="text-xs text-bw-muted text-center">Choisis un objectif et un obstacle pour <strong className="text-bw-text">{module10.personnage?.prenom || "ton personnage"}</strong>. Tu écriras le pitch à l&apos;étape suivante.</p>
      <div className="w-full">
        <p className="text-[10px] text-bw-muted uppercase tracking-wider mb-1.5">Objectif</p>
        <div className="flex flex-wrap gap-1.5">
          {OBJECTIFS.map((o) => (
            <motion.button key={o.key} whileTap={{ scale: 0.95 }} onClick={() => setObjectif(o.key)}
              className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                objectif === o.key ? "bg-bw-amber/20 border-bw-amber/40 text-bw-amber" : "bg-bw-elevated border-white/[0.06] text-bw-muted hover:border-bw-amber/20"
              }`}>{o.label}</motion.button>
          ))}
        </div>
      </div>
      <div className="w-full">
        <p className="text-[10px] text-bw-muted uppercase tracking-wider mb-1.5">Obstacle</p>
        <div className="flex flex-wrap gap-1.5">
          {OBSTACLES.map((o) => (
            <motion.button key={o.key} whileTap={{ scale: 0.95 }} onClick={() => setObstacle(o.key)}
              className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                obstacle === o.key ? "bg-bw-danger/20 border-bw-danger/40 text-bw-danger" : "bg-bw-elevated border-white/[0.06] text-bw-muted hover:border-bw-danger/20"
              }`}>{o.label}</motion.button>
          ))}
        </div>
      </div>
      <button onClick={handleSubmit} disabled={submitting || !objectif || !obstacle}
        className="w-full py-3 rounded-xl bg-bw-amber text-white font-medium text-sm disabled:opacity-40 transition-opacity cursor-pointer hover:brightness-110">
        {submitting ? "Envoi..." : "Valider"}
      </button>
    </motion.div>
  );
}
