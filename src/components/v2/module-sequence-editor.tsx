"use client";

import { cn } from "@/lib/utils";
import { GlassCardV2 } from "./glass-card";
import type { ModuleDef } from "@/lib/modules-data";

interface ModuleSequenceEditorProps {
  modules: ModuleDef[];
  completedModuleIds?: string[];
  currentModuleId?: string;
  className?: string;
}

export function ModuleSequenceEditor({
  modules,
  completedModuleIds = [],
  currentModuleId,
  className,
}: ModuleSequenceEditorProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {modules.map((mod, i) => {
        const isDone = completedModuleIds.includes(mod.id);
        const isCurrent = mod.id === currentModuleId;

        return (
          <GlassCardV2
            key={mod.id}
            className={cn(
              "p-4 flex items-start gap-4",
              isCurrent && "ring-2 ring-bw-primary/20"
            )}
          >
            {/* Number/check */}
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                isDone && "text-white",
                isCurrent && "text-white ring-2 ring-offset-2 ring-offset-white",
                !isDone && !isCurrent && "bg-[var(--color-bw-surface-dim)] text-bw-muted"
              )}
              style={
                isDone || isCurrent
                  ? { backgroundColor: mod.color }
                  : undefined
              }
            >
              {isDone ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-sm font-semibold text-bw-heading">
                  {mod.title}
                </h3>
                <span
                  className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ backgroundColor: mod.color }}
                >
                  {mod.duration}
                </span>
              </div>
              <p className="text-xs text-bw-muted line-clamp-2">
                {mod.description}
              </p>
              {mod.teacherNote && (
                <p className="mt-1 text-[11px] text-bw-violet italic">
                  {mod.teacherNote}
                </p>
              )}
            </div>

            {/* Questions count */}
            <span className="shrink-0 text-xs text-bw-muted tabular-nums">
              {mod.questions} Q
            </span>
          </GlassCardV2>
        );
      })}
    </div>
  );
}
