"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { Module6Data } from "@/hooks/use-session-polling";

interface MissionStateProps {
  module6: Module6Data;
  sessionId: string;
  studentId: string;
  isWriting?: boolean; // position 4 = writing mode
}

export function MissionState({ module6, sessionId, studentId, isWriting = false }: MissionStateProps) {
  const mission = module6.mission;
  const [content, setContent] = useState(mission?.content || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(mission?.status === "done");

  const handleSubmit = async () => {
    if (!mission || submitting || !content.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/scenario`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId: mission.id,
          studentId,
          content: content.trim(),
        }),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  if (!mission) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-12">
        <p className="text-sm text-white/50">Aucune mission assignée pour le moment.</p>
        <p className="text-xs text-white/30">Le facilitateur doit d'abord générer les scènes.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">
          {isWriting ? "Écris ta contribution" : "Ta Mission"}
        </h2>
      </div>

      {/* Role badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 w-full"
      >
        <span className="text-3xl">{mission.roleEmoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-white">{mission.roleLabel}</p>
            {mission.isScribe && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-medium">
                Scribe
              </span>
            )}
          </div>
          <p className="text-xs text-white/50">{mission.task}</p>
        </div>
      </motion.div>

      {/* Scribe instruction */}
      {mission.isScribe && (
        <div className="w-full p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-300 text-center">
            Tu es le scribe de cette scène — c&apos;est toi qui saisiras le texte final du groupe.
          </p>
        </div>
      )}

      {/* Scene context */}
      <div className="w-full p-3 rounded-lg bg-white/5 border border-white/10">
        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Scène</p>
        <p className="text-sm font-semibold text-white">{mission.sceneTitle}</p>
        {mission.sceneDescription && (
          <p className="text-xs text-white/50 mt-1">{mission.sceneDescription}</p>
        )}
      </div>

      {/* Writing area (position 3: show task only, position 4: show textarea) */}
      {isWriting && (
        <div className="w-full">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitted}
            placeholder="Écris ici ta contribution..."
            className="w-full h-40 p-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 resize-none focus:outline-none focus:border-teal-400/50"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-white/30">{content.length} caractères</span>
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || !content.trim()}
                className="px-4 py-2 rounded-lg bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Envoi..." : "Envoyer"}
              </button>
            ) : (
              <span className="text-sm text-emerald-400">Envoyé !</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
