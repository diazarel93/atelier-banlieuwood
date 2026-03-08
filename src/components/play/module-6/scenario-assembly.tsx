"use client";

import { motion } from "motion/react";
import type { Module6Data } from "@/hooks/use-session-polling";

interface ScenarioAssemblyProps {
  module6: Module6Data;
}

const ACT_COLORS: Record<string, string> = {
  setup: "border-l-bw-violet",
  confrontation: "border-l-bw-amber",
  resolution: "border-l-bw-teal",
};

export function ScenarioAssembly({ module6 }: ScenarioAssemblyProps) {
  const scenes = module6.scenes || [];
  const missions = module6.missions || [];
  const scenario = module6.scenario;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Le Scénario</h2>
        <p className="text-sm text-white/50 mt-1">
          {scenario?.validated ? "Scénario validé !" : "Assemblage des contributions"}
        </p>
      </div>

      {scenario?.validated && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full p-4 rounded-xl bg-bw-teal/10 border border-bw-teal/20 text-center"
        >
          <span className="text-bw-teal font-semibold">Scénario validé par le facilitateur</span>
        </motion.div>
      )}

      <div className="w-full space-y-4">
        {scenes.map((scene, i) => {
          const sceneMissions = missions.filter((m) => m.sceneTitle === scene.title);
          const completedMissions = sceneMissions.filter((m) => m.status === "done");

          return (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 rounded-xl bg-white/5 border border-white/[0.06] border-l-4 ${
                ACT_COLORS[scene.act] || "border-l-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">
                  #{scene.sceneNumber} — {scene.title}
                </h3>
                <span className="text-xs text-white/40">
                  {completedMissions.length}/{sceneMissions.length} contributions
                </span>
              </div>

              <p className="text-xs text-white/50 mb-3">{scene.description}</p>

              {/* Scene content */}
              {scene.content && (
                <div className="p-2 rounded-lg bg-white/5 mb-2">
                  <p className="text-xs text-white/70 whitespace-pre-wrap">{scene.content}</p>
                </div>
              )}

              {/* Contributions */}
              {sceneMissions.length > 0 && (
                <div className="space-y-2 mt-2">
                  {sceneMissions.map((m) => (
                    <div
                      key={m.id}
                      className={`p-2 rounded-lg text-xs ${
                        m.status === "done"
                          ? "bg-bw-teal/10 border border-bw-teal/20 text-bw-teal"
                          : "bg-white/5 border border-white/5 text-white/30"
                      }`}
                    >
                      <span className="font-medium">{m.role}</span>
                      {m.content ? (
                        <p className="mt-1">{m.content}</p>
                      ) : (
                        <p className="mt-1 italic">En attente...</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
