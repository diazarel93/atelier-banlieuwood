"use client";

import { cn } from "@/lib/utils";
import { GlassCardV2 } from "./glass-card";

type SessionStatus = "draft" | "waiting" | "responding" | "paused" | "done";

interface SessionCardV2Props {
  title: string;
  classLabel?: string | null;
  moduleLabel?: string;
  moduleColor?: string;
  status: SessionStatus;
  studentCount?: number;
  scheduledAt?: string | null;
  progress?: number; // 0-100
  onClick?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

const STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; dotClass: string }
> = {
  draft: { label: "Brouillon", dotClass: "bg-gray-400" },
  waiting: { label: "En attente", dotClass: "bg-amber-400 animate-pulse" },
  responding: { label: "En cours", dotClass: "bg-emerald-500 animate-pulse" },
  paused: { label: "En pause", dotClass: "bg-amber-500" },
  done: { label: "Terminée", dotClass: "bg-gray-400" },
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function SessionCardV2({
  title,
  classLabel,
  moduleLabel,
  moduleColor,
  status,
  studentCount,
  scheduledAt,
  progress,
  onClick,
  actions,
  className,
}: SessionCardV2Props) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <GlassCardV2
      hover={!!onClick}
      className={cn(
        "p-4 cursor-default",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Top row: module badge + status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {moduleLabel && (
            <span
              className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold text-white"
              style={{ backgroundColor: moduleColor || "#8B5CF6" }}
            >
              {moduleLabel}
            </span>
          )}
          {classLabel && (
            <span className="text-xs text-bw-muted font-medium">
              {classLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", cfg.dotClass)} />
          <span className="text-[11px] text-bw-muted font-medium">
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-bw-heading leading-snug mb-1 line-clamp-1">
        {title}
      </h3>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-bw-muted">
        {scheduledAt && <span>{formatTime(scheduledAt)}</span>}
        {typeof studentCount === "number" && (
          <span>{studentCount} élève{studentCount !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Progress bar */}
      {typeof progress === "number" && progress > 0 && (
        <div className="mt-3 h-1 w-full rounded-full bg-[var(--color-bw-surface-dim)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, progress)}%`,
              backgroundColor: moduleColor || "var(--color-bw-primary)",
            }}
          />
        </div>
      )}

      {/* Actions slot */}
      {actions && (
        <div className="mt-3 flex items-center gap-2">{actions}</div>
      )}
    </GlassCardV2>
  );
}
