"use client";

import { cn } from "@/lib/utils";
import { MiniCalendar } from "./mini-calendar";
import { GlassCardV2 } from "./glass-card";
import { PHASES, MAIN_PHASE_IDS } from "@/lib/modules-data";

interface SeanceCalendarSidebarProps {
  sessionDates?: Date[];
  completedModuleIds?: string[];
  className?: string;
}

export function SeanceCalendarSidebar({
  sessionDates = [],
  completedModuleIds = [],
  className,
}: SeanceCalendarSidebarProps) {
  // Main parcours phases for progression display (M1–M8)
  const mainPhases = PHASES.filter((p) => (MAIN_PHASE_IDS as readonly string[]).includes(p.id));

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Module progression */}
      <GlassCardV2 className="p-4">
        <h3 className="text-xs font-semibold text-bw-heading uppercase tracking-wide mb-3">Progression modules</h3>
        <div className="flex flex-col gap-2.5">
          {mainPhases.map((phase) => {
            const done = phase.moduleIds.filter((id) => completedModuleIds.includes(id)).length;
            const total = phase.moduleIds.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={phase.id} className="flex items-center gap-2">
                <span className="text-sm">{phase.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-bw-heading truncate">{phase.label}</p>
                  <div className="mt-0.5 h-1 w-full rounded-full bg-[var(--color-bw-surface)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: phase.color,
                      }}
                    />
                  </div>
                </div>
                <span className="text-body-xs text-bw-muted tabular-nums">
                  {done}/{total}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCardV2>

      {/* Mini calendar */}
      <MiniCalendar sessionDates={sessionDates} />
    </div>
  );
}
