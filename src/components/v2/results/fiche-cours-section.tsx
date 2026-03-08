"use client";

import { useState } from "react";
import { GlassCardV2 } from "@/components/v2/glass-card";
import type { FicheData } from "@/hooks/use-results-data";

import { SOCLE_COLORS } from "@/lib/socle-colors";

interface FicheCoursSectionProps {
  fiche: FicheData | null;
  loading: boolean;
  provider: string | null;
  onGenerate: () => void;
  onDownload: () => void;
}

export function FicheCoursSection({
  fiche,
  loading,
  provider,
  onGenerate,
  onDownload,
}: FicheCoursSectionProps) {
  const [ficheTab, setFicheTab] = useState<"primaire" | "college" | "lycee">("college");
  const [openDomaine, setOpenDomaine] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-bw-heading uppercase tracking-wide">
          Fiche de cours
        </h3>
        {fiche && (
          <button
            onClick={onDownload}
            className="text-xs text-bw-muted hover:text-bw-heading transition-colors"
          >
            Télécharger .md
          </button>
        )}
      </div>

      {!fiche && !loading && (
        <button
          onClick={onGenerate}
          className="w-full rounded-xl border-2 border-dashed border-purple-400/30 py-4 text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
        >
          Générer la fiche pédagogique
        </button>
      )}

      {loading && (
        <GlassCardV2 className="py-8 text-center">
          <div className="inline-block w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-bw-muted">Génération de la fiche pédagogique...</p>
        </GlassCardV2>
      )}

      {fiche && (
        <div className="space-y-4">
          {provider && (
            <span className="text-xs text-bw-muted border border-[var(--color-bw-border)] rounded-md px-1.5 py-0.5">
              {provider === "fallback" ? "Template" : provider}
            </span>
          )}

          {/* Title + Duration */}
          <GlassCardV2 className="p-5 border-l-4 border-l-purple-500">
            <h4 className="text-base font-semibold text-bw-heading">
              {fiche.title}
            </h4>
            <p className="text-sm text-bw-muted mt-1">{fiche.duration}</p>
          </GlassCardV2>

          {/* Objectives */}
          <GlassCardV2 className="p-5 space-y-2">
            <p className="text-xs font-semibold text-bw-muted uppercase tracking-wide">
              Objectifs
            </p>
            {fiche.objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                  style={{
                    backgroundColor: (SOCLE_COLORS[obj.socleCommun] || { bg: "#66666620", text: "#666" }).bg,
                    color: (SOCLE_COLORS[obj.socleCommun] || { bg: "#66666620", text: "#666" }).text,
                  }}
                >
                  {obj.socleCommun}
                </span>
                <span className="text-sm text-bw-heading">{obj.objective}</span>
              </div>
            ))}
          </GlassCardV2>

          {/* Competencies accordion */}
          <GlassCardV2 className="overflow-hidden">
            <div className="px-5 pt-5 pb-2">
              <p className="text-xs font-semibold text-bw-muted uppercase tracking-wide">
                Compétences du socle commun
              </p>
            </div>
            {(["domaine1", "domaine3", "domaine5"] as const).map((key) => {
              const domaine = fiche.competencies[key];
              if (!domaine) return null;
              const isOpen = openDomaine === key;
              const color =
                key === "domaine1"
                  ? "#3B82F6"
                  : key === "domaine3"
                  ? "#10B981"
                  : "#8B5CF6";
              return (
                <div
                  key={key}
                  className="border-t border-[var(--color-bw-border)]"
                >
                  <button
                    onClick={() => setOpenDomaine(isOpen ? null : key)}
                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-[var(--color-bw-surface-dim)] transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-medium" style={{ color }}>
                      {domaine.title}
                    </span>
                    <span className="text-xs text-bw-muted">
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 space-y-1">
                      {domaine.skills.map((skill, i) => (
                        <p
                          key={i}
                          className="text-sm text-bw-heading pl-3 border-l-2"
                          style={{ borderLeftColor: color }}
                        >
                          {skill}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </GlassCardV2>

          {/* Animation tips */}
          <GlassCardV2 className="p-5 space-y-3">
            <p className="text-xs font-semibold text-bw-muted uppercase tracking-wide">
              Conseils d&apos;animation
            </p>
            {fiche.animationTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xs font-mono text-purple-600 border border-purple-200 rounded-md px-1.5 py-0.5 shrink-0 mt-0.5">
                  {tip.timing}
                </span>
                <div>
                  <span className="text-sm font-medium text-bw-heading">
                    {tip.phase}
                  </span>
                  <p className="text-sm text-bw-muted mt-0.5">{tip.tip}</p>
                </div>
              </div>
            ))}
          </GlassCardV2>

          {/* Relaunch tips */}
          <GlassCardV2 className="p-5">
            <p className="text-xs font-semibold text-bw-muted uppercase tracking-wide mb-3">
              Relancer les élèves
            </p>
            <ul className="space-y-2">
              {fiche.relaunchTips.map((tip, i) => (
                <li
                  key={i}
                  className="text-sm text-bw-heading pl-3 border-l-2 border-amber-400"
                >
                  {tip}
                </li>
              ))}
            </ul>
          </GlassCardV2>

          {/* Level adaptation tabs */}
          <GlassCardV2 className="p-5">
            <p className="text-xs font-semibold text-bw-muted uppercase tracking-wide mb-3">
              Adaptation par niveau
            </p>
            <div className="flex gap-1 mb-3">
              {(["primaire", "college", "lycee"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFicheTab(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    ficheTab === lvl
                      ? "bg-purple-100 text-purple-700"
                      : "text-bw-muted hover:bg-[var(--color-bw-surface-dim)]"
                  }`}
                >
                  {lvl === "primaire"
                    ? "Primaire"
                    : lvl === "college"
                    ? "Collège"
                    : "Lycée"}
                </button>
              ))}
            </div>
            <p className="text-sm text-bw-heading">
              {fiche.adaptationByLevel[ficheTab]}
            </p>
          </GlassCardV2>

          {/* Evaluation criteria */}
          <GlassCardV2 className="p-5">
            <p className="text-xs font-semibold text-bw-muted uppercase tracking-wide mb-3">
              Critères d&apos;évaluation
            </p>
            <ul className="space-y-2">
              {fiche.evaluation.map((crit, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-bw-heading"
                >
                  <span className="text-emerald-500 shrink-0 mt-0.5">
                    &#10003;
                  </span>
                  {typeof crit === "string"
                    ? crit
                    : Object.values(crit as Record<string, string>).join(
                        " — "
                      )}
                </li>
              ))}
            </ul>
          </GlassCardV2>

          {/* Session recap */}
          {fiche.sessionRecap && (
            <GlassCardV2 className="p-5 border-l-4 border-l-emerald-400">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                Résumé de session
              </span>
              <p className="text-sm text-bw-heading mt-2">
                {fiche.sessionRecap}
              </p>
            </GlassCardV2>
          )}
        </div>
      )}
    </div>
  );
}
