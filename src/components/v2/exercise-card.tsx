"use client";

import { cn } from "@/lib/utils";
import { GlassCardV2 } from "./glass-card";
import type { ExerciseEntry } from "@/lib/exercise-catalog";

interface ExerciseCardProps {
  exercise: ExerciseEntry;
  className?: string;
}

export function ExerciseCard({ exercise, className }: ExerciseCardProps) {
  return (
    <GlassCardV2 hover className={cn("p-4 flex flex-col", className)}>
      {/* Color accent bar */}
      <div
        className="h-1.5 w-12 rounded-full mb-3"
        style={{ backgroundColor: exercise.color }}
      />

      {/* Phase badge */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm">{exercise.phaseEmoji}</span>
        <span
          className="text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: exercise.phaseColor }}
        >
          {exercise.phaseLabel}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-bw-heading leading-snug mb-1">
        {exercise.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-bw-muted line-clamp-2 mb-3 flex-1">
        {exercise.description}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-[11px] text-bw-muted">
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" />
            <path d="M6 3.5v3l1.5 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
          {exercise.duration}
        </span>
        <span>{exercise.questions} questions</span>
      </div>

      {/* Tags */}
      {exercise.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {exercise.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--color-bw-surface-dim)] px-2 py-0.5 text-[10px] font-medium text-bw-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </GlassCardV2>
  );
}
