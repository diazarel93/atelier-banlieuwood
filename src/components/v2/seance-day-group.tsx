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
  className?: string;
}

export function SeanceDayGroup({
  label,
  sessions,
  onSessionClick,
  className,
}: SeanceDayGroupProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <h3 className="text-xs font-semibold text-bw-muted uppercase tracking-wide px-1">
        {label}
      </h3>
      <div className="flex flex-col gap-2">
        {sessions.map((s) => (
          <SessionCardV2
            key={s.id}
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
        ))}
      </div>
    </div>
  );
}
