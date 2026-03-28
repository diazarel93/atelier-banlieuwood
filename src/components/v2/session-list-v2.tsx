"use client";

import { cn } from "@/lib/utils";
import { SessionCardV2 } from "./session-card";
import type { SessionSummary } from "@/hooks/use-dashboard-v2";

interface SessionListV2Props {
  sessions: SessionSummary[];
  className?: string;
}

export function SessionListV2({ sessions, className }: SessionListV2Props) {
  if (sessions.length === 0) {
    return <p className="text-sm text-bw-muted py-8 text-center">Aucune séance récente</p>;
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {sessions.slice(0, 6).map((session) => (
        <SessionCardV2
          key={session.id}
          title={session.title}
          classLabel={session.classLabel}
          status={session.status as "draft" | "waiting" | "responding" | "paused" | "done"}
          studentCount={session.studentCount}
          scheduledAt={session.scheduledAt}
        />
      ))}
    </div>
  );
}
