"use client";

import type { StepProgress } from "@/lib/models/atelier";

export function StepProgressBar({
  steps,
  total,
  activeIndex,
  onSelect,
}: {
  steps: StepProgress[];
  total: number;
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const step = steps[i];
        const isActive = i === activeIndex;
        const isValidated = step?.status === "validated";
        const hasFollowUp = !!step?.currentFollowUp;
        const isFuture = !step;

        return (
          <button
            key={i}
            onClick={() => !isFuture && onSelect(i)}
            disabled={isFuture}
            className={`relative h-2.5 rounded-full transition-all duration-300 ${
              isActive
                ? "w-8 bg-primary shadow-sm shadow-primary/40"
                : isValidated
                  ? step.score >= 3
                    ? "w-2.5 bg-emerald-500"
                    : step.score >= 2
                      ? "w-2.5 bg-accent"
                      : "w-2.5 bg-orange-500"
                  : hasFollowUp
                    ? "w-2.5 bg-amber-400 animate-pulse"
                    : isFuture
                      ? "w-2.5 bg-muted-foreground/10"
                      : "w-2.5 bg-primary/20"
            } ${!isFuture && !isActive ? "hover:scale-150 cursor-pointer" : ""}`}
          />
        );
      })}
    </div>
  );
}
