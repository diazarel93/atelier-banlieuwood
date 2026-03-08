"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import type { Module7Data } from "@/hooks/use-session-polling";

const PLAN_COLORS: Record<string, string> = {
  "plan-large": "#7EA7F5",
  "plan-moyen": "#6EC6B0",
  "gros-plan": "#F3A765",
  "plan-reaction": "#E78BB4",
};

interface Module7CockpitProps {
  module7: Module7Data;
  connectedCount: number;
}

// ── Position 1: Plans fondamentaux ──
function PlansView({ module7 }: { module7: Module7Data }) {
  const plans = module7.plans || [];
  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-bw-heading">Les 4 plans fondamentaux</h3>
      <p className="text-xs text-bw-muted">
        Les eleves decouvrent les 4 cadrages essentiels du cinema.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {plans.map((plan) => {
          const color = PLAN_COLORS[plan.key] || "#CBD5E1";
          return (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-[18px] border border-black/[0.06] bg-bw-surface"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                style={{ background: `${color}20` }}
              >
                <div className="w-5 h-5 rounded-md" style={{ background: color }} />
              </div>
              <p className="text-sm font-semibold text-bw-heading">{plan.label}</p>
              <p className="text-[11px] text-bw-muted mt-1">{plan.question}</p>
              <p className="text-[10px] text-bw-muted/60 mt-1 line-clamp-2">{plan.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Position 2: Comparaison ──
function ComparaisonView({ module7 }: { module7: Module7Data }) {
  const results = module7.comparisonResults;
  const comparisons = module7.comparisons || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-bw-heading">Comparaisons visuelles</h3>
        <span className="text-sm text-bw-muted">{comparisons.length} paires</span>
      </div>
      <div className="space-y-3">
        {comparisons.map((comp) => {
          const counts = results?.[comp.key];
          const countA = counts?.[comp.planA.type] || 0;
          const countB = counts?.[comp.planB.type] || 0;
          const total = countA + countB;
          const pctA = total > 0 ? Math.round((countA / total) * 100) : 0;
          const pctB = total > 0 ? Math.round((countB / total) * 100) : 0;
          const colorA = PLAN_COLORS[comp.planA.type] || "#7EA7F5";
          const colorB = PLAN_COLORS[comp.planB.type] || "#F3A765";

          return (
            <motion.div
              key={comp.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-[18px] border border-black/[0.06] bg-bw-surface"
            >
              <p className="text-xs text-bw-muted mb-3">{comp.sceneDescription}</p>
              <div className="flex items-center gap-3">
                {/* Plan A */}
                <div className="flex-1 text-center">
                  <p className="text-xs font-semibold text-bw-heading">{comp.planA.type.replaceAll("-", " ")}</p>
                  <p className="text-[40px] font-extrabold tabular-nums" style={{ color: total > 0 ? colorA : "#CBD5E1" }}>
                    {total > 0 ? `${pctA}%` : "—"}
                  </p>
                  {total > 0 && <p className="text-[10px] text-bw-muted">{countA} vote{countA > 1 ? "s" : ""}</p>}
                </div>
                {/* VS divider */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-bw-muted/40">VS</span>
                </div>
                {/* Plan B */}
                <div className="flex-1 text-center">
                  <p className="text-xs font-semibold text-bw-heading">{comp.planB.type.replaceAll("-", " ")}</p>
                  <p className="text-[40px] font-extrabold tabular-nums" style={{ color: total > 0 ? colorB : "#CBD5E1" }}>
                    {total > 0 ? `${pctB}%` : "—"}
                  </p>
                  {total > 0 && <p className="text-[10px] text-bw-muted">{countB} vote{countB > 1 ? "s" : ""}</p>}
                </div>
              </div>
              {/* Combined bar */}
              {total > 0 && (
                <div className="h-3 rounded-full overflow-hidden flex mt-3">
                  <motion.div
                    className="h-full rounded-l-full"
                    style={{ background: colorA }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pctA}%` }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div
                    className="h-full rounded-r-full"
                    style={{ background: colorB }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pctB}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
              {total === 0 && (
                <p className="text-xs text-bw-muted/60 text-center mt-2">En attente des votes...</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Position 3: Decoupage ──
function DecoupageView({ module7, connectedCount }: { module7: Module7Data; connectedCount: number }) {
  const keyScenes = module7.keyScenes || [];
  const decoupages = module7.allDecoupages || module7.studentDecoupages || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-bw-heading">Decoupage technique</h3>
        <span className="text-sm font-medium tabular-nums text-bw-teal">{decoupages.length} soumis</span>
      </div>
      <div className="space-y-2">
        {keyScenes.map((scene) => {
          const submitted = decoupages.filter((d) => d.sceneId === scene.id).length;
          return (
            <div
              key={scene.id}
              className="p-3 rounded-[18px] border border-black/[0.06] bg-bw-surface"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-bw-heading">Scene {scene.sceneNumber}</p>
                  <p className="text-xs text-bw-muted">{scene.title}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold tabular-nums text-bw-teal">{submitted}</span>
                  <span className="text-xs text-bw-muted">/{connectedCount}</span>
                </div>
              </div>
              {/* Mini progress */}
              <div className="h-1.5 bg-black/[0.04] rounded-full overflow-hidden mt-2">
                <motion.div
                  className="h-full bg-bw-teal rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${connectedCount > 0 ? (submitted / connectedCount) * 100 : 0}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* Plan types legend */}
      {module7.planTypes && module7.planTypes.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {module7.planTypes.map((pt) => {
            const color = PLAN_COLORS[pt.key] || "#CBD5E1";
            return (
              <span
                key={pt.key}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ background: `${color}20`, color }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                {pt.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Position 4: Storyboard ──
function StoryboardView({ module7 }: { module7: Module7Data }) {
  const storyboard = module7.storyboard;
  const scenes = module7.scenes || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-bw-heading">Storyboard</h3>
        {storyboard?.validated && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
            Valide
          </span>
        )}
      </div>
      {scenes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {scenes.map((scene) => (
            <div
              key={scene.id}
              className="p-3 rounded-[18px] border border-black/[0.06] bg-bw-surface text-center"
            >
              <div className="w-full h-16 rounded-lg bg-black/[0.03] flex items-center justify-center mb-2">
                <span className="text-2xl text-bw-muted/30">🎬</span>
              </div>
              <p className="text-xs font-semibold text-bw-heading">Scene {scene.sceneNumber}</p>
              <p className="text-[10px] text-bw-muted truncate">{scene.title}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-bw-muted text-center py-4">
          Le storyboard sera assemble a partir des decoupages.
        </p>
      )}
    </div>
  );
}

export function Module7Cockpit({ module7, connectedCount }: Module7CockpitProps) {
  const content = useMemo(() => {
    switch (module7.type) {
      case "plans":
        return <PlansView module7={module7} />;
      case "comparaison":
        return <ComparaisonView module7={module7} />;
      case "decoupage":
        return <DecoupageView module7={module7} connectedCount={connectedCount} />;
      case "storyboard":
        return <StoryboardView module7={module7} />;
      default:
        return <p className="text-sm text-bw-muted">Type inconnu : {module7.type}</p>;
    }
  }, [module7, connectedCount]);

  return <div className="space-y-6">{content}</div>;
}
