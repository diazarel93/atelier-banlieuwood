"use client";

import { motion } from "motion/react";
import type { Module8Data } from "@/hooks/use-session-polling";

interface DebriefViewProps {
  module8: Module8Data;
}

export function DebriefView({ module8 }: DebriefViewProps) {
  const corrections = module8.corrections || [];
  const classResults = module8.classResults || {};
  const fiches = module8.fiches || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4"
    >
      <div className="text-center">
        <h2 className="text-xl font-bold text-white">Corrections</h2>
        <p className="text-sm text-white/50 mt-1">Les vraies réponses sur les métiers du cinéma</p>
      </div>

      {/* Corrections list */}
      <div className="w-full space-y-3">
        {corrections.map((c, i) => {
          const results = classResults[c.metierKey];
          const totalAnswers = results ? results.correct + results.wrong : 0;
          const correctPct = totalAnswers > 0 ? Math.round((results!.correct / totalAnswers) * 100) : 0;

          return (
            <motion.div
              key={c.metierKey}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl bg-white/5 border border-white/[0.06]"
            >
              {/* Métier header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{c.metierEmoji}</span>
                <span className="text-sm font-bold text-white">{c.metierLabel}</span>
              </div>

              {/* Common belief */}
              <p className="text-sm text-white/40 italic mb-2 line-through">{c.commonBelief}</p>

              {/* Reality */}
              <p className="text-sm text-bw-teal">{c.reality}</p>

              {/* Class results bar */}
              {totalAnswers > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-bw-teal rounded-full transition-all"
                      style={{ width: `${correctPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/40">{correctPct}% correct</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Fiches métier résumé */}
      {fiches.length > 0 && (
        <div className="w-full mt-4">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Les métiers du tournage</p>
          <div className="grid grid-cols-2 gap-2">
            {fiches.map((f) => (
              <div
                key={f.key}
                className="p-3 rounded-xl border border-white/[0.06] bg-white/5 border-l-4"
                style={{ borderLeftColor: f.color }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{f.emoji}</span>
                  <span className="text-xs font-bold text-white">{f.label}</span>
                </div>
                <p className="text-xs text-white/50 leading-snug line-clamp-2">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
