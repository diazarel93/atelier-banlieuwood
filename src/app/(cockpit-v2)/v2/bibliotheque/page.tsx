"use client";

import { useState, useMemo, useCallback } from "react";
import {
  buildExerciseCatalog,
  getCatalogPhases,
  type ExerciseEntry,
} from "@/lib/exercise-catalog";
import { getModuleGuide } from "@/lib/guide-data";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { ModuleGuideModal } from "@/components/v2/module-guide-modal";
import type { ModuleGuide } from "@/lib/guide-data";

import { SOCLE_COLORS } from "@/lib/socle-colors";

function ModuleRow({
  exercise,
  guide,
  onClick,
}: {
  exercise: ExerciseEntry;
  guide: ModuleGuide | null;
  onClick: () => void;
}) {
  return (
    <GlassCardV2
      hover
      className="p-5 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Color bar */}
        <div
          className="w-1.5 self-stretch rounded-full shrink-0"
          style={{ backgroundColor: exercise.color }}
        />

        <div className="flex-1 min-w-0">
          {/* Title + meta */}
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h3 className="text-sm font-bold text-bw-heading">
              {exercise.title}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-bw-muted">
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
                {exercise.duration}
              </span>
              <span>{exercise.questions} questions</span>
              {guide && guide.phases.length > 0 && (
                <span>{guide.phases.length} étapes</span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-bw-muted mb-3">
            {exercise.description}
          </p>

          {/* Quick info row: socle commun badges + étapes preview */}
          <div className="flex items-center gap-4 flex-wrap">
            {guide && (
              <div className="flex items-center gap-1.5">
                {guide.socleCommun.map((code) => {
                  const c = SOCLE_COLORS[code] || { bg: "#66666620", text: "#666" };
                  return (
                    <span
                      key={code}
                      className="text-body-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: c.bg, color: c.text }}
                    >
                      {code}
                    </span>
                  );
                })}
              </div>
            )}

            {guide && guide.phases.length > 0 && (
              <div className="flex items-center gap-1">
                {guide.phases.map((phase, i) => (
                  <span
                    key={i}
                    className="text-body-xs text-bw-muted bg-[var(--color-bw-surface-dim)] rounded-md px-1.5 py-0.5"
                  >
                    {phase.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Compétences preview */}
          {guide && guide.competences.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {guide.competences.slice(0, 3).map((comp, i) => (
                <span key={i} className="text-body-xs text-[var(--color-bw-green)] flex items-center gap-1">
                  <span>&#10003;</span> {comp}
                </span>
              ))}
              {guide.competences.length > 3 && (
                <span className="text-body-xs text-bw-muted">
                  +{guide.competences.length - 3} compétences
                </span>
              )}
            </div>
          )}
        </div>

        {/* Arrow */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-bw-muted mt-1" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </GlassCardV2>
  );
}

export default function BibliothequePage() {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseEntry | null>(null);

  const handleExerciseClick = useCallback((ex: ExerciseEntry) => {
    setSelectedExercise(ex);
  }, []);

  const catalog = useMemo(() => buildExerciseCatalog(), []);
  const phases = useMemo(() => getCatalogPhases(), []);

  // Group exercises by phase
  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    return phases
      .map((phase) => {
        let exercises = catalog.filter((ex) => ex.phase === phase.id);
        if (q) {
          exercises = exercises.filter(
            (ex) =>
              ex.title.toLowerCase().includes(q) ||
              ex.description.toLowerCase().includes(q) ||
              phase.label.toLowerCase().includes(q)
          );
        }
        return { phase, exercises };
      })
      .filter((g) => g.exercises.length > 0);
  }, [catalog, phases, search]);

  const totalCount = grouped.reduce((s, g) => s + g.exercises.length, 0);

  // Compute total unique socle commun codes + total competences across all guides
  const globalStats = useMemo(() => {
    const socle = new Set<string>();
    let competences = 0;
    let etapes = 0;
    for (const ex of catalog) {
      const g = getModuleGuide(ex.id);
      if (g) {
        g.socleCommun.forEach((c) => socle.add(c));
        competences += g.competences.length;
        etapes += g.phases.length;
      }
    }
    return { socle: Array.from(socle).sort(), competences, etapes };
  }, [catalog]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-bw-heading">
          Bibliothèque pédagogique
        </h1>
        <p className="text-sm text-bw-muted mt-1 max-w-2xl">
          Découvrez le parcours Banlieuwood : chaque phase et chaque module sont
          conçus pour développer la créativité, l&apos;expression et l&apos;esprit
          critique des élèves, en lien avec le Socle Commun de l&apos;Éducation
          Nationale.
        </p>

        {/* Global stats */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-bw-heading">{totalCount}</span>
            <span className="text-bw-muted">modules</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-bw-heading">{globalStats.etapes}</span>
            <span className="text-bw-muted">étapes pédagogiques</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-bw-heading">{globalStats.competences}</span>
            <span className="text-bw-muted">compétences travaillées</span>
          </div>
          <div className="flex items-center gap-1.5">
            {globalStats.socle.map((code) => {
              const c = SOCLE_COLORS[code] || { bg: "#66666620", text: "#666" };
              return (
                <span
                  key={code}
                  className="text-body-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: c.bg, color: c.text }}
                >
                  {code}
                </span>
              );
            })}
            <span className="text-xs text-bw-muted ml-1">Socle Commun</span>
          </div>
        </div>
      </div>

      {/* Methodology section */}
      <section aria-label="Méthodologie pédagogique" className="mb-8">
        <GlassCardV2 variant="flat" className="p-6">
          <h2 className="text-sm font-bold text-bw-heading uppercase tracking-wide mb-4">
            Notre méthodologie
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-10 h-10 rounded-xl bg-[var(--color-bw-violet-100)] text-[var(--color-bw-violet)] flex items-center justify-center text-sm font-bold" aria-hidden="true">1</span>
                <h3 className="text-sm font-semibold text-bw-heading">Approche par le cinéma</h3>
              </div>
              <p className="text-xs text-bw-muted leading-relaxed">
                Le cinéma comme vecteur d&apos;apprentissage : chaque module utilise la narration,
                l&apos;image et la création pour ancrer les compétences dans une pratique concrète et motivante.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-10 h-10 rounded-xl bg-[var(--color-bw-teal-100)] text-[var(--color-bw-teal-600)] flex items-center justify-center text-sm font-bold" aria-hidden="true">2</span>
                <h3 className="text-sm font-semibold text-bw-heading">Progression structurée</h3>
              </div>
              <p className="text-xs text-bw-muted leading-relaxed">
                Un parcours en phases progressives : de l&apos;écriture créative au débat critique,
                chaque phase s&apos;appuie sur les acquis précédents pour développer des compétences transversales.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-10 h-10 rounded-xl bg-bw-primary/10 text-bw-primary flex items-center justify-center text-sm font-bold" aria-hidden="true">3</span>
                <h3 className="text-sm font-semibold text-bw-heading">Alignement institutionnel</h3>
              </div>
              <p className="text-xs text-bw-muted leading-relaxed">
                Chaque module est adossé au Socle Commun (D1 Langages, D3 Citoyenneté, D5 Culture) :
                compétences visées, objectifs pédagogiques et étapes de déroulé sont documentés et traçables.
              </p>
            </div>
          </div>
        </GlassCardV2>
      </section>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-bw-muted"
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            aria-hidden="true"
          >
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un module..."
            aria-label="Rechercher un module"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-[var(--color-bw-border)] bg-card pl-9 pr-8 text-sm text-bw-heading placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors"
          />
          {search && (
            <button
              type="button"
              aria-label="Effacer la recherche"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-bw-muted hover:text-bw-heading transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {grouped.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-bw-muted">
              Aucun module ne correspond à la recherche
            </p>
          </div>
        )}

        {grouped.map(({ phase, exercises }) => {
          const isExpanded = expandedPhase === phase.id;
          // Compute phase-level stats
          const phaseGuides = exercises.map((ex) => ({
            ex,
            guide: getModuleGuide(ex.id) ?? null,
          }));
          const phaseSocle = new Set<string>();
          let phaseCompetences = 0;
          phaseGuides.forEach(({ guide: g }) => {
            if (g) {
              g.socleCommun.forEach((c) => phaseSocle.add(c));
              phaseCompetences += g.competences.length;
            }
          });

          return (
            <div key={phase.id}>
              {/* Phase header */}
              <GlassCardV2
                variant={isExpanded ? "elevated" : "default"}
                hover={!isExpanded}
              >
                <button
                  type="button"
                  onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                  aria-expanded={isExpanded}
                  aria-label={`Phase ${phase.label} — ${exercises.length} module${exercises.length > 1 ? "s" : ""}`}
                  className="w-full text-left p-5 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Phase icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${phase.color}20, ${phase.color}08)`,
                        border: `1px solid ${phase.color}25`,
                      }}
                    >
                      {phase.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-base font-bold text-bw-heading">
                          {phase.label}
                        </h2>
                        <span className="text-xs text-bw-muted">
                          {exercises.length} module{exercises.length > 1 ? "s" : ""}
                        </span>
                        {/* Socle commun badges */}
                        <div className="flex gap-1">
                          {Array.from(phaseSocle).sort().map((code) => {
                            const c = SOCLE_COLORS[code] || { bg: "#66666620", text: "#666" };
                            return (
                              <span
                                key={code}
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: c.bg, color: c.text }}
                              >
                                {code}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Stats + chevron */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="hidden sm:flex items-center gap-3 text-[11px] text-bw-muted">
                        <span>{phaseCompetences} compétences</span>
                      </div>
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                        className={`text-bw-muted transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  {/* Phase description — always visible */}
                  <p className="text-xs text-bw-muted mt-2 ml-16 max-w-2xl leading-relaxed">
                    {phase.description}
                  </p>
                </button>
              </GlassCardV2>

              {/* Expanded: module details */}
              {isExpanded && (
                <div className="mt-2 ml-4 sm:ml-8 space-y-3 pb-2">
                  {phaseGuides.map(({ ex, guide }) => (
                    <ModuleRow
                      key={ex.id}
                      exercise={ex}
                      guide={guide}
                      onClick={() => handleExerciseClick(ex)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Module guide modal */}
      {selectedExercise && (
        <ModuleGuideModal
          exercise={selectedExercise}
          guide={getModuleGuide(selectedExercise.id) ?? null}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}
