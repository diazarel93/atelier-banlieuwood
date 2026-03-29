"use client";

import { cn } from "@/lib/utils";
import { GlassCardV2 } from "./glass-card";

interface FilterOption {
  id: string;
  label: string;
  color?: string;
  emoji?: string;
}

interface ExerciseFiltersProps {
  phases: FilterOption[];
  selectedPhase: string | null;
  onPhaseChange: (phase: string | null) => void;
  selectedDuration: string | null;
  onDurationChange: (duration: string | null) => void;
  className?: string;
}

const DURATIONS = [
  { id: "short", label: "< 15 min" },
  { id: "medium", label: "15-25 min" },
  { id: "long", label: "> 25 min" },
];

export function ExerciseFilters({
  phases,
  selectedPhase,
  onPhaseChange,
  selectedDuration,
  onDurationChange,
  className,
}: ExerciseFiltersProps) {
  return (
    <GlassCardV2 className={cn("p-4 flex flex-col gap-5", className)}>
      {/* Phase filter */}
      <div>
        <h3 className="text-xs font-semibold text-bw-muted uppercase tracking-wide mb-2">Phase</h3>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onPhaseChange(null)}
            className={cn(
              "text-left rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-bw-primary/50 focus-visible:outline-none",
              !selectedPhase
                ? "bg-[var(--color-bw-surface-dim)] text-bw-heading"
                : "text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)]",
            )}
          >
            Toutes
          </button>
          {phases.map((phase) => (
            <button
              key={phase.id}
              type="button"
              onClick={() => onPhaseChange(phase.id === selectedPhase ? null : phase.id)}
              className={cn(
                "flex items-center gap-2 text-left rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                selectedPhase === phase.id
                  ? "bg-[var(--color-bw-surface-dim)] text-bw-heading"
                  : "text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)]",
              )}
            >
              {phase.emoji && <span className="text-sm">{phase.emoji}</span>}
              <span className="truncate">{phase.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration filter */}
      <div>
        <h3 className="text-xs font-semibold text-bw-muted uppercase tracking-wide mb-2">Durée</h3>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onDurationChange(null)}
            className={cn(
              "text-left rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-bw-primary/50 focus-visible:outline-none",
              !selectedDuration
                ? "bg-[var(--color-bw-surface-dim)] text-bw-heading"
                : "text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)]",
            )}
          >
            Toutes
          </button>
          {DURATIONS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onDurationChange(d.id === selectedDuration ? null : d.id)}
              className={cn(
                "text-left rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-bw-primary/50 focus-visible:outline-none",
                selectedDuration === d.id
                  ? "bg-[var(--color-bw-surface-dim)] text-bw-heading"
                  : "text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)]",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </GlassCardV2>
  );
}
