"use client";

import { cn } from "@/lib/utils";

export type SessionStatus = "draft" | "waiting" | "responding" | "paused" | "done";

interface StatusBadgeProps {
  status: SessionStatus;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<SessionStatus, { label: string; style: string; dot: string; pulse: boolean }> = {
  draft: {
    label: "Brouillon",
    style: "bg-[var(--color-bw-surface-dim)] text-bw-muted ring-1 ring-inset ring-[var(--color-bw-border)]",
    dot: "bg-[var(--color-bw-placeholder)]",
    pulse: false,
  },
  waiting: {
    label: "En attente",
    style: "bg-bw-amber-100 text-bw-amber-500 ring-1 ring-inset ring-bw-amber/20",
    dot: "bg-bw-amber",
    pulse: true,
  },
  responding: {
    label: "En cours",
    style: "bg-bw-teal-50 text-bw-teal-600 ring-1 ring-inset ring-bw-teal/20",
    dot: "bg-bw-teal",
    pulse: true,
  },
  paused: {
    label: "En pause",
    style: "bg-bw-amber-100 text-bw-amber-500 ring-1 ring-inset ring-bw-amber/20",
    dot: "bg-bw-amber-500",
    pulse: false,
  },
  done: {
    label: "Terminée",
    style: "bg-bw-green-100 text-bw-green ring-1 ring-inset ring-bw-green/20",
    dot: "bg-bw-green",
    pulse: false,
  },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        cfg.style,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]",
      )}
    >
      <span
        className={cn(
          "rounded-full shrink-0",
          cfg.dot,
          cfg.pulse && "animate-pulse",
          size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
        )}
      />
      {cfg.label}
    </span>
  );
}

/** Status bar color (hex) for left-border accents */
export const STATUS_BAR_COLORS: Record<SessionStatus, string> = {
  draft: "#9CA3AF",
  waiting: "#F59E0B",
  responding: "#4ECDC4",
  paused: "#F59E0B",
  done: "#10B981",
};

/** Status background tint class for cards */
export const STATUS_BG_TINT: Record<SessionStatus, string> = {
  draft: "",
  waiting: "bg-bw-amber-100/20",
  responding: "bg-bw-teal-50/30",
  paused: "",
  done: "",
};
