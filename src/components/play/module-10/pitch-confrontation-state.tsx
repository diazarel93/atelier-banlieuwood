"use client";

import { motion } from "motion/react";
import type { Module10Data } from "@/hooks/use-session-polling";

export interface PitchConfrontationStateProps {
  module10: Module10Data;
}

export function PitchConfrontationState({
  module10,
}: PitchConfrontationStateProps) {
  const confrontation = module10.confrontation;

  if (!confrontation) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 text-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-4xl">⚔️</motion.div>
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}
          className="text-sm text-bw-muted">En attente de la sélection du facilitateur...</motion.div>
      </motion.div>
    );
  }

  const pitches = [confrontation.pitchA, confrontation.pitchB];
  const colors = ["from-bw-teal/20 to-bw-teal/5", "from-bw-amber/20 to-bw-amber/5"];
  const borderColors = ["border-bw-teal/20", "border-bw-amber/20"];
  const nameColors = ["text-bw-teal", "text-bw-amber"];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4">
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-bw-amber/20 text-bw-amber">
        Confrontation
      </motion.span>
      <div className="grid grid-cols-2 gap-3 w-full items-start">
        {pitches.map((pitch, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: i === 0 ? -30 : 30, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.3 + i * 0.25 }}
            className={`p-3 rounded-xl bg-gradient-to-b ${colors[i]} border ${borderColors[i]} space-y-2`}>
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
        className="-mt-3 w-8 h-8 rounded-full bg-bw-elevated border border-white/10 flex items-center justify-center text-[10px] font-bold text-bw-muted">
        VS
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="text-xs text-bw-muted text-center -mt-2">Écoute les deux pitchs et prépare-toi à voter !</motion.p>
    </motion.div>
  );
}
