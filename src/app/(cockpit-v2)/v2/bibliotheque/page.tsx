"use client";

import { useState, useMemo } from "react";
import {
  buildExerciseCatalog,
  getCatalogPhases,
} from "@/lib/exercise-catalog";
import { ExerciseFilters } from "@/components/v2/exercise-filters";
import { ExerciseGrid } from "@/components/v2/exercise-grid";

function parseDurationMinutes(d: string): number {
  const match = d.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 15;
}

export default function BibliothequePage() {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const catalog = useMemo(() => buildExerciseCatalog(), []);
  const phases = useMemo(() => getCatalogPhases(), []);

  const filtered = useMemo(() => {
    let list = catalog;

    if (selectedPhase) {
      list = list.filter((ex) => ex.phase === selectedPhase);
    }

    if (selectedDuration) {
      list = list.filter((ex) => {
        const mins = parseDurationMinutes(ex.duration);
        switch (selectedDuration) {
          case "short":
            return mins < 15;
          case "medium":
            return mins >= 15 && mins <= 25;
          case "long":
            return mins > 25;
          default:
            return true;
        }
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (ex) =>
          ex.title.toLowerCase().includes(q) ||
          ex.description.toLowerCase().includes(q) ||
          ex.phaseLabel.toLowerCase().includes(q)
      );
    }

    return list;
  }, [catalog, selectedPhase, selectedDuration, search]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-bw-heading">Bibliothèque</h1>
          <p className="text-sm text-bw-muted mt-0.5">
            {catalog.length} exercices disponibles
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

      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setShowMobileFilters((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-bw-border)] px-3 py-1.5 text-sm font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1.5 3.5h11M3.5 7h7M5.5 10.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Filtres
          {(selectedPhase || selectedDuration) && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-bw-primary text-[10px] font-bold text-white">
              {(selectedPhase ? 1 : 0) + (selectedDuration ? 1 : 0)}
            </span>
          )}
        </button>
        {showMobileFilters && (
          <div className="mt-3">
            <ExerciseFilters
              phases={phases}
              selectedPhase={selectedPhase}
              onPhaseChange={setSelectedPhase}
              selectedDuration={selectedDuration}
              onDurationChange={setSelectedDuration}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar filters — desktop */}
        <div className="lg:col-span-3 hidden lg:block">
          <div className="sticky top-20">
            <ExerciseFilters
              phases={phases}
              selectedPhase={selectedPhase}
              onPhaseChange={setSelectedPhase}
              selectedDuration={selectedDuration}
              onDurationChange={setSelectedDuration}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="lg:col-span-9">
          <ExerciseGrid exercises={filtered} />
        </div>
      </div>
    </div>
  );
}
