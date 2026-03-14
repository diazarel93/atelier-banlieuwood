"use client";

import { cn } from "@/lib/utils";

interface ModuleStep {
  id: string;
  label: string;
  color: string;
  status: "done" | "current" | "upcoming";
}

interface ModuleStepperV2Props {
  steps: ModuleStep[];
  className?: string;
}

export function ModuleStepperV2({ steps, className }: ModuleStepperV2Props) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {steps.map((step, i) => {
        const isDone = step.status === "done";
        const isCurrent = step.status === "current";

        return (
          <div key={step.id} className="flex items-center gap-1">
            {/* Step indicator */}
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all",
                  isDone &&
                    "text-white",
                  isCurrent &&
                    "text-white ring-2 ring-offset-2 ring-offset-[var(--card)]",
                  !isDone && !isCurrent &&
                    "bg-[var(--color-bw-surface-dim)] text-bw-muted"
                )}
                style={
                  isDone || isCurrent
                    ? {
                        backgroundColor: step.color,
                        ...(isCurrent ? { ringColor: step.color } : {}),
                      }
                    : undefined
                }
              >
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 7L6 10L11 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:inline whitespace-nowrap",
                  isCurrent ? "text-bw-heading" : "text-bw-muted"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-4 sm:w-6 rounded-full",
                  isDone
                    ? "bg-[var(--color-bw-border)]"
                    : "bg-[var(--color-bw-border-subtle)]"
                )}
                style={isDone ? { backgroundColor: step.color, opacity: 0.3 } : undefined}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
