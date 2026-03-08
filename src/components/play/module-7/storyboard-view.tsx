"use client";

import { motion } from "motion/react";
import type { Module7Data } from "@/hooks/use-session-polling";

interface StoryboardViewProps {
  module7: Module7Data;
}

export function StoryboardView({ module7 }: StoryboardViewProps) {
  const storyboard = module7.storyboard;
  const scenes = module7.scenes || [];

  if (storyboard?.validated) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Storyboard validé !</h2>
          <p className="text-sm text-emerald-400 mt-1">
            Le facilitateur a validé le storyboard de votre film.
          </p>
        </div>

        <div className="w-full space-y-4">
          {scenes.map((scene, i) => (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
            >
              <p className="text-xs text-emerald-400 font-mono">Scène {scene.sceneNumber}</p>
              <p className="text-sm font-semibold text-white mt-1">{scene.title}</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Storyboard</h2>
        <p className="text-sm text-white/50 mt-1">
          En attente de la validation du facilitateur...
        </p>
      </div>

      <div className="w-full space-y-3">
        {scenes.map((scene, i) => (
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <p className="text-xs text-white/40 font-mono">Scène {scene.sceneNumber}</p>
            <p className="text-sm text-white mt-1">{scene.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="w-10 h-10 border-2 border-white/20 border-t-teal-400 rounded-full animate-spin" />
    </div>
  );
}
