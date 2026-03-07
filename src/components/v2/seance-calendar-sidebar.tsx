"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { MiniCalendar } from "./mini-calendar";
import { GlassCardV2 } from "./glass-card";
import { PHASES } from "@/lib/modules-data";

interface SeanceCalendarSidebarProps {
  sessionDates?: Date[];
  className?: string;
}

export function SeanceCalendarSidebar({
  sessionDates = [],
  className,
}: SeanceCalendarSidebarProps) {
  // Main parcours phases for progression display
  const mainPhases = PHASES.filter((p) =>
    ["idea", "emotion", "imagination", "collectif", "scenario"].includes(p.id)
  );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Module progression */}
      <GlassCardV2 className="p-4">
        <h3 className="text-xs font-semibold text-bw-muted uppercase tracking-wide mb-3">
          Progression modules
        </h3>
        <div className="flex flex-col gap-2.5">
          {mainPhases.map((phase) => (
            <div key={phase.id} className="flex items-center gap-2">
              <span className="text-sm">{phase.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-bw-heading truncate">
                  {phase.label}
                </p>
                <div className="mt-0.5 h-1 w-full rounded-full bg-[var(--color-bw-surface-dim)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "0%",
                      backgroundColor: phase.color,
                    }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-bw-muted tabular-nums">
                0/{phase.moduleIds.length}
              </span>
            </div>
          ))}
        </div>
      </GlassCardV2>

      {/* Mini calendar */}
      <MiniCalendar sessionDates={sessionDates} />

      {/* New session CTA */}
      <Link
        href="/v2/seances/new"
        className="flex items-center justify-center gap-2 rounded-xl bg-bw-primary py-2.5 text-sm font-semibold text-white hover:bg-bw-primary-500 transition-colors btn-glow"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Nouvelle séance
      </Link>
    </div>
  );
}
