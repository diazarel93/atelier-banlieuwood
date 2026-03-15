"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { Module7Data } from "@/hooks/use-session-polling";

const PLAN_COLORS: Record<string, string> = {
  "plan-large": "#7EA7F5",
  "plan-moyen": "#6EC6B0",
  "gros-plan": "#F3A765",
  "plan-reaction": "#E78BB4",
};

interface StoryboardViewProps {
  module7: Module7Data;
}

export function StoryboardView({ module7 }: StoryboardViewProps) {
  const storyboard = module7.storyboard;
  const storyboardScenes = storyboard?.scenes as
    | { sceneId: string; title: string; plans: { position: number; planType: string; description: string; imageUrl?: string }[] }[]
    | undefined;
  const scenes = module7.scenes || [];

  if (storyboard?.validated && storyboardScenes) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Storyboard validé !</h2>
          <p className="text-sm text-bw-teal mt-1">
            Le facilitateur a validé le storyboard de votre film.
          </p>
        </div>

        <div className="w-full space-y-6">
          {storyboardScenes.map((scene, i) => (
            <motion.div
              key={scene.sceneId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl bg-bw-teal/10 border border-bw-teal/20"
            >
              <p className="text-xs text-bw-teal font-mono mb-3">
                {scene.title}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {scene.plans.map((plan) => {
                  const color = PLAN_COLORS[plan.planType] || "#CBD5E1";
                  return (
                    <motion.div
                      key={plan.position}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 + plan.position * 0.05 }}
                      className="text-center"
                    >
                      {plan.imageUrl ? (
                        <div className="relative w-full aspect-video mb-1.5">
                          <Image
                            src={plan.imageUrl}
                            alt={`${plan.planType} — ${plan.description}`}
                            fill
                            className="rounded-lg object-cover"
                            sizes="(max-width: 640px) 50vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-video rounded-lg bg-white/5 flex items-center justify-center mb-1.5">
                          <span className="text-white/20 text-lg">🎬</span>
                        </div>
                      )}
                      <span
                        className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
                        style={{ background: `${color}30`, color }}
                      >
                        {plan.planType.replace(/-/g, " ")}
                      </span>
                      <p className="text-[10px] text-white/50 mt-0.5 line-clamp-2">{plan.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4"
    >
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
            className="p-3 rounded-xl bg-white/5 border border-white/[0.06]"
          >
            <p className="text-xs text-white/40 font-mono">Scène {scene.sceneNumber}</p>
            <p className="text-sm text-white mt-1">{scene.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="w-10 h-10 border-2 border-white/20 border-t-bw-teal rounded-full animate-spin" />
    </motion.div>
  );
}
