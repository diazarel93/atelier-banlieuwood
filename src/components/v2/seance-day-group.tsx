"use client";

import { cn } from "@/lib/utils";
import { SessionCardV2 } from "./session-card";

interface SessionItem {
  id: string;
  title: string;
  classLabel?: string | null;
  moduleLabel?: string;
  moduleColor?: string;
  status: "draft" | "waiting" | "responding" | "paused" | "done";
  studentCount?: number;
  scheduledAt?: string | null;
  progress?: number;
}

interface SeanceDayGroupProps {
  label: string; // "Aujourd'hui", "Demain", "Lun. 12 mars"
  sessions: SessionItem[];
  onSessionClick?: (id: string) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  className?: string;
}

export function SeanceDayGroup({
  label,
  sessions,
  onSessionClick,
  selectedIds,
  onToggleSelect,
  className,
}: SeanceDayGroupProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <h3 className="text-xs font-semibold text-bw-heading uppercase tracking-wide px-1">{label}</h3>
      <div className="flex flex-col gap-2">
        {sessions.map((s, i) => (
          <div
            key={s.id}
            className="flex items-stretch gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {onToggleSelect && (
              <div className="flex items-center pl-1">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={selectedIds?.has(s.id) ?? false}
                  aria-label={`Selectionner ${s.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(s.id);
                  }}
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                    selectedIds?.has(s.id)
                      ? "border-bw-primary bg-bw-primary text-white"
                      : "border-[var(--color-bw-border)] bg-card hover:border-bw-primary/50",
                  )}
                >
                  {selectedIds?.has(s.id) && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path
                        d="M2.5 6l2.5 2.5 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <SessionCardV2
                title={s.title}
                classLabel={s.classLabel}
                moduleLabel={s.moduleLabel}
                moduleColor={s.moduleColor}
                status={s.status}
                studentCount={s.studentCount}
                scheduledAt={s.scheduledAt}
                progress={s.progress}
                onClick={onSessionClick ? () => onSessionClick(s.id) : undefined}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
