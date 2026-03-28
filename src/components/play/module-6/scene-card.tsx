"use client";

import { motion } from "motion/react";
import type { Module6Data } from "@/hooks/use-session-polling";

interface SceneCardListProps {
  module6: Module6Data;
}

const ACT_LABELS: Record<string, { label: string; color: string }> = {
  setup: { label: "Situation initiale", color: "text-bw-violet bg-bw-violet/10 border-bw-violet/20" },
  confrontation: { label: "Confrontation", color: "text-bw-amber bg-bw-amber/10 border-bw-amber/20" },
  resolution: { label: "Résolution", color: "text-bw-teal bg-bw-teal/10 border-bw-teal/20" },
};

export function SceneCardList({ module6 }: SceneCardListProps) {
  const scenes = module6.scenes || [];

  if (!module6.scenesReady) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-12">
        <div className="w-10 h-10 border-2 border-white/20 border-t-bw-teal rounded-full animate-spin" />
        <p className="text-sm text-white/50">Les scènes sont en cours de génération...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Les Scènes</h2>
        <p className="text-sm text-white/50 mt-1">{scenes.length} scènes générées à partir de vos choix collectifs</p>
      </div>

      {/* Adrian: l'intervenant lit les scènes à voix haute avant les missions */}
      {module6.lectureCollective && (
        <div className="w-full p-3 rounded-xl bg-bw-violet/10 border border-bw-violet/20 text-center">
          <p className="text-sm text-bw-violet font-medium">L&apos;intervenant va lire chaque scène à voix haute.</p>
          <p className="text-xs text-white/40 mt-1">Écoute bien, tu recevras ta mission juste après.</p>
        </div>
      )}

      <div className="w-full space-y-3">
        {scenes.map((scene, i) => {
          const act = ACT_LABELS[scene.act] || ACT_LABELS.setup;
          return (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl bg-white/5 border border-white/[0.06]"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-white/40">#{scene.sceneNumber}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${act.color}`}>{act.label}</span>
                {scene.status === "complete" && <span className="text-xs text-bw-teal ml-auto">Complète</span>}
              </div>
              <h3 className="text-sm font-semibold text-white">{scene.title}</h3>
              <p className="text-xs text-white/60 mt-1">{scene.description}</p>
              {scene.content && <p className="text-xs text-white/40 mt-2 italic line-clamp-2">{scene.content}</p>}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
