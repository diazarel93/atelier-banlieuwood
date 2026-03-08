"use client";

import { useState, useMemo, useCallback } from "react";
import {
  buildExerciseCatalog,
  getCatalogPhases,
  type ExerciseEntry,
} from "@/lib/exercise-catalog";
import { getModuleGuide } from "@/lib/guide-data";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { ExerciseCard } from "@/components/v2/exercise-card";
import { ModuleGuideModal } from "@/components/v2/module-guide-modal";

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

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-bw-heading">Bibliothèque</h1>
          <p className="text-sm text-bw-muted mt-0.5">
            {totalCount} exercices disponibles
          </p>
        </div>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-bw-muted"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un exercice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-60 rounded-lg border border-[var(--color-bw-border)] bg-white pl-9 pr-3 text-sm text-bw-heading placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors"
          />
        </div>
      </div>

      {/* Phases grouped */}
      <div className="space-y-4">
        {grouped.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-bw-muted">
              Aucun exercice ne correspond à la recherche
            </p>
          </div>
        )}

        {grouped.map(({ phase, exercises }) => {
          const isExpanded = expandedPhase === phase.id;

          return (
            <div key={phase.id}>
              {/* Phase header — clickable */}
              <GlassCardV2
                hover
                className="cursor-pointer"
                onClick={() =>
                  setExpandedPhase(isExpanded ? null : phase.id)
                }
              >
                <div className="flex items-center gap-4 p-5">
                  {/* Color accent */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${phase.color}20, ${phase.color}08)`,
                      border: `1px solid ${phase.color}25`,
                    }}
                  >
                    {phase.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-bw-heading">
                      {phase.label}
                    </h2>
                    <p className="text-xs text-bw-muted mt-0.5">
                      {exercises.length} exercice{exercises.length > 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Mini previews of exercises */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    {exercises.slice(0, 4).map((ex) => (
                      <span
                        key={ex.id}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: ex.color }}
                      />
                    ))}
                    {exercises.length > 4 && (
                      <span className="text-[10px] text-bw-muted font-medium">
                        +{exercises.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Chevron */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className={`shrink-0 text-bw-muted transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </GlassCardV2>

              {/* Expanded exercises grid */}
              {isExpanded && (
                <div className="mt-3 ml-4 sm:ml-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pb-2">
                  {exercises.map((ex) => (
                    <ExerciseCard
                      key={ex.id}
                      exercise={ex}
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
