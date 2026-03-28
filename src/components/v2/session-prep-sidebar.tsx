"use client";

import { cn } from "@/lib/utils";
import { GlassCardV2 } from "./glass-card";
import { StatusBadge, type SessionStatus } from "./status-badge";

interface SessionPrepSidebarProps {
  title: string;
  classLabel?: string | null;
  level: string;
  joinCode: string;
  scheduledAt?: string | null;
  status: string;
  className?: string;
}

export function SessionPrepSidebar({
  title,
  classLabel,
  level,
  joinCode,
  scheduledAt,
  status,
  className,
}: SessionPrepSidebarProps) {
  const levelLabel = level === "primaire" ? "Primaire" : level === "college" ? "Collège" : "Lycée";

  return (
    <GlassCardV2 className={cn("p-4 flex flex-col gap-4", className)}>
      <h2 className="text-base font-bold text-bw-heading">{title}</h2>

      <div className="flex flex-col gap-2 text-sm">
        {classLabel && (
          <div className="flex items-center justify-between">
            <span className="text-bw-muted">Classe</span>
            <span className="font-medium text-bw-heading">{classLabel}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-bw-muted">Niveau</span>
          <span className="font-medium text-bw-heading">{levelLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-bw-muted">Code</span>
          <span className="font-mono font-bold text-bw-primary tracking-wider text-base">{joinCode}</span>
        </div>
        {scheduledAt && (
          <div className="flex items-center justify-between">
            <span className="text-bw-muted">Date</span>
            <span className="font-medium text-bw-heading">
              {new Date(scheduledAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-bw-muted">Statut</span>
          <StatusBadge status={status as SessionStatus} size="sm" />
        </div>
      </div>
    </GlassCardV2>
  );
}
