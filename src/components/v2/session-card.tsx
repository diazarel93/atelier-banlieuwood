"use client";

import { cn } from "@/lib/utils";
import { GlassCardV2 } from "./glass-card";
import { IconClock } from "./icons";
import { StatusBadge, STATUS_BAR_COLORS, STATUS_BG_TINT, type SessionStatus } from "./status-badge";

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
  const bgTint = STATUS_BG_TINT[status] || "";

  return (
    <GlassCardV2
      hover={!!onClick}
      className={cn("relative overflow-hidden cursor-default", onClick && "cursor-pointer", bgTint, className)}
      onClick={onClick}
    >
      {/* Left status bar — 4px with glow */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-shadow duration-200"
        style={{
          backgroundColor: STATUS_BAR_COLORS[status] || STATUS_BAR_COLORS.draft,
          boxShadow: `2px 0 8px ${STATUS_BAR_COLORS[status] || STATUS_BAR_COLORS.draft}40`,
        }}
      />

      <div className="p-3.5 pl-4.5">
        {/* Top row: module badge + status */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            {moduleLabel && (
              <span
                className="inline-flex items-center rounded-md px-2 py-0.5 text-body-xs font-semibold text-white"
                style={{ backgroundColor: moduleColor || "#FF6B35" }}
              >
                {moduleLabel}
              </span>
            )}
            {classLabel && <span className="text-body-xs text-bw-text font-medium">{classLabel}</span>}
          </div>
          <StatusBadge status={status} size="sm" />
        </div>

        {/* Title */}
        <h3 className="text-heading-xs text-bw-heading font-semibold leading-snug mb-1 line-clamp-1">{title}</h3>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-body-xs text-bw-text">
          {scheduledAt && (
            <span className="flex items-center gap-1 tabular-nums">
              <IconClock size={12} />
              {formatTime(scheduledAt)}
            </span>
          )}
          {typeof studentCount === "number" && (
            <span>
              {studentCount} élève{studentCount !== 1 ? "s" : ""}
            </span>
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
        {actions && <div className="mt-3 flex items-center gap-2">{actions}</div>}
      </div>
    </GlassCardV2>
  );
}
