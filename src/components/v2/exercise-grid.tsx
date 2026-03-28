"use client";

import { cn } from "@/lib/utils";
import { ExerciseCard } from "./exercise-card";
import type { ExerciseEntry } from "@/lib/exercise-catalog";

interface ExerciseGridProps {
  exercises: ExerciseEntry[];
  className?: string;
  onExerciseClick?: (exercise: ExerciseEntry) => void;
}

export function ExerciseGrid({ exercises, className, onExerciseClick }: ExerciseGridProps) {
  if (exercises.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-center">
        <p className="text-sm text-bw-muted">Aucun exercice ne correspond aux filtres</p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4", className)}>
      {exercises.map((ex) => (
        <ExerciseCard key={ex.id} exercise={ex} onClick={onExerciseClick ? () => onExerciseClick(ex) : undefined} />
      ))}
    </div>
  );
}
