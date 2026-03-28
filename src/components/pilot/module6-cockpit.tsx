"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import type { Module6Data } from "@/hooks/use-session-polling";

const ACT_COLORS: Record<string, string> = {
  setup: "#7EA7F5",
  confrontation: "#F3A765",
  resolution: "#6EC6B0",
};

const ACT_LABELS: Record<string, string> = {
  setup: "Situation initiale",
  confrontation: "Confrontation",
  resolution: "Résolution",
};

interface Module6CockpitProps {
  module6: Module6Data;
  connectedCount: number;
}

// ── Position 1: Frise narrative ──
function FriseView({ module6 }: { module6: Module6Data }) {
  const steps = module6.friseSteps || [];
  const filledCount = steps.filter((s) => s.winnerText).length;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-bw-heading">Frise narrative</h3>
        <span className="text-sm text-bw-muted tabular-nums">
          {filledCount}/{steps.length} etapes
        </span>
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`flex items-start gap-3 p-3 rounded-[18px] border transition-colors ${
              step.winnerText ? "bg-emerald-50 border-emerald-200" : "bg-bw-surface border-black/[0.06]"
            }`}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: step.winnerText ? "#6EC6B0" : "#CBD5E1" }}
            >
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-bw-heading">{step.label}</p>
              <p className="text-xs text-bw-muted">{step.description}</p>
              {step.winnerText && (
                <p className="mt-1 text-sm text-emerald-700 font-medium truncate">{step.winnerText}</p>
              )}
            </div>
            {step.winnerText && <span className="text-emerald-500 text-lg flex-shrink-0">✓</span>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Position 2: Scenes V0 ──
function ScenesView({ module6 }: { module6: Module6Data }) {
  const scenes = module6.scenes || [];
  const readyCount = scenes.filter((s) => s.status === "done" || s.content).length;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-bw-heading">Scenes du scenario</h3>
        <span className="text-sm text-bw-muted tabular-nums">
          {readyCount}/{scenes.length} completes
        </span>
      </div>
      {!module6.scenesReady && scenes.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <p className="text-sm text-bw-muted">Les scenes n'ont pas encore ete generees.</p>
          <p className="text-xs text-bw-muted/60">
            Elles seront creees automatiquement a partir de la frise narrative.
          </p>
        </div>
      )}
      <div className="grid gap-3">
        {scenes.map((scene) => {
          const actColor = ACT_COLORS[scene.act] || "#CBD5E1";
          return (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-[18px] border border-black/[0.06] bg-bw-surface"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ background: actColor }}
                >
                  {ACT_LABELS[scene.act] || scene.act}
                </span>
                <span className="text-xs text-bw-muted">Scene {scene.sceneNumber}</span>
                {(scene.status === "done" || scene.content) && (
                  <span className="ml-auto text-emerald-500 text-xs font-semibold">Complete</span>
                )}
              </div>
              <p className="text-sm font-semibold text-bw-heading">{scene.title}</p>
              <p className="text-xs text-bw-muted mt-1 line-clamp-2">{scene.description}</p>
            </motion.div>
          );
        })}
      </div>
      {/* Progress bar */}
      {scenes.length > 0 && (
        <div className="h-2 bg-black/[0.04] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#7EA7F5] via-[#F3A765] to-[#6EC6B0] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(readyCount / scenes.length) * 100}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      )}
    </div>
  );
}

// ── Position 3: Mission assignment ──
function MissionView({ module6, connectedCount }: { module6: Module6Data; connectedCount: number }) {
  const missions = module6.missions || [];
  const missionTypes = module6.missionTypes || [];
  const assignedCount = missions.length;

  // Count per role
  const roleCounts: Record<string, number> = {};
  for (const m of missions) {
    roleCounts[m.role] = (roleCounts[m.role] || 0) + 1;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-bw-heading">Missions assignees</h3>
        <span className="text-sm font-medium tabular-nums text-bw-teal">
          {assignedCount}/{connectedCount}
        </span>
      </div>

      {/* Role distribution */}
      <div className="flex flex-wrap gap-1.5">
        {missionTypes.map((mt) => (
          <span
            key={mt.key}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-black/[0.06] bg-bw-surface"
          >
            {mt.emoji} {mt.label}
            <span className="text-[10px] font-bold tabular-nums text-bw-muted">{roleCounts[mt.key] || 0}</span>
          </span>
        ))}
      </div>

      {/* Mission list */}
      {missions.length > 0 ? (
        <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
          {missions.map((m) => (
            <div
              key={m.id}
              className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${
                m.status === "done" || m.content
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-bw-surface border-black/[0.06]"
              }`}
            >
              <span className="text-sm flex-1 truncate text-bw-heading">{m.sceneTitle}</span>
              <span className="text-xs text-bw-muted">{m.role}</span>
              <span
                className={`text-xs font-medium ${m.status === "done" || m.content ? "text-emerald-600" : "text-amber-500"}`}
              >
                {m.status === "done" || m.content ? "Soumis" : "En cours"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-bw-muted text-center py-4">En attente de l'assignation des missions.</p>
      )}
    </div>
  );
}

// ── Position 4: Ecriture ──
function EcritureView({ module6, connectedCount }: { module6: Module6Data; connectedCount: number }) {
  const missions = module6.missions || [];
  const doneCount = missions.filter((m) => m.status === "done" || m.content).length;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-bw-heading">Ecriture en cours</h3>
        <span className="text-sm font-medium tabular-nums text-bw-teal">
          {doneCount}/{missions.length || connectedCount}
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-2 bg-black/[0.04] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-bw-teal rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${missions.length > 0 ? (doneCount / missions.length) * 100 : 0}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
      {missions.length > 0 ? (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {missions.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-[18px] border transition-colors ${
                m.status === "done" || m.content
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-bw-surface border-black/[0.06]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-bw-heading">{m.sceneTitle}</span>
                <span
                  className={`text-xs font-medium ${m.status === "done" || m.content ? "text-emerald-600" : "text-amber-500"}`}
                >
                  {m.status === "done" || m.content ? "Soumis" : "En cours..."}
                </span>
              </div>
              {m.content && <p className="mt-1 text-xs text-bw-muted line-clamp-3">{m.content}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-bw-muted text-center py-4">
          En attente des contributions ({connectedCount} eleve{connectedCount > 1 ? "s" : ""})
        </p>
      )}
    </div>
  );
}

// ── Position 5: Assemblage ──
function AssemblageView({ module6 }: { module6: Module6Data }) {
  const scenario = module6.scenario;
  const missions = module6.missions || [];
  const doneCount = missions.filter((m) => m.status === "done" || m.content).length;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-bw-heading">Assemblage du scenario</h3>
        {scenario?.validated && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">Valide</span>
        )}
      </div>
      {/* Mission completion summary */}
      <div className="p-3 rounded-[18px] bg-bw-surface border border-black/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-bw-heading">Contributions recues</span>
          <span className="text-sm font-bold tabular-nums text-bw-teal">
            {doneCount}/{missions.length}
          </span>
        </div>
        <div className="h-2 bg-black/[0.04] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-bw-teal rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${missions.length > 0 ? (doneCount / missions.length) * 100 : 0}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>
      {/* Scenario preview */}
      {scenario?.fullText && (
        <div className="p-4 rounded-[18px] bg-bw-surface border border-black/[0.06] max-h-[300px] overflow-y-auto">
          <p className="text-xs text-bw-muted whitespace-pre-wrap leading-relaxed">{scenario.fullText}</p>
        </div>
      )}
      {!scenario?.fullText && (
        <p className="text-sm text-bw-muted text-center py-4">Le scenario sera assemble a partir des contributions.</p>
      )}
    </div>
  );
}

export function Module6Cockpit({ module6, connectedCount }: Module6CockpitProps) {
  const content = useMemo(() => {
    switch (module6.type) {
      case "frise":
        return <FriseView module6={module6} />;
      case "scenes-v0":
        return <ScenesView module6={module6} />;
      case "mission":
        return <MissionView module6={module6} connectedCount={connectedCount} />;
      case "ecriture":
        return <EcritureView module6={module6} connectedCount={connectedCount} />;
      case "assemblage":
        return <AssemblageView module6={module6} />;
      default:
        return <p className="text-sm text-bw-muted">Type inconnu : {module6.type}</p>;
    }
  }, [module6, connectedCount]);

  return <div className="space-y-6">{content}</div>;
}
