"use client";

import { cn } from "@/lib/utils";

export type SessionStatus = "draft" | "waiting" | "responding" | "paused" | "done";

interface StatusBadgeProps {
  status: SessionStatus;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; bg: string; text: string; dot: string; pulse: boolean }
> = {
  draft: {
    label: "Brouillon",
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
    pulse: false,
  },
  waiting: {
    label: "En attente",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
    pulse: true,
  },
  responding: {
    label: "En cours",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    pulse: true,
  },
  paused: {
    label: "En pause",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    pulse: false,
  },
  done: {
    label: "Terminée",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    pulse: false,
  },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        cfg.bg,
        cfg.text,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]"
      )}
    >
      <span
        className={cn(
          "rounded-full shrink-0",
          cfg.dot,
          cfg.pulse && "animate-pulse",
          size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2"
        )}
      />
      {cfg.label}
    </span>
  );
}

/** Status bar color (hex) for left-border accents */
export const STATUS_BAR_COLORS: Record<SessionStatus, string> = {
  draft: "#9CA3AF",
  waiting: "#FBBF24",
  responding: "linear-gradient(to bottom, #10B981, #4ECDC4)",
  paused: "#F59E0B",
  done: "#10B981",
};

/** Status background tint class for cards */
export const STATUS_BG_TINT: Record<SessionStatus, string> = {
  draft: "",
  waiting: "bg-amber-50/30",
  responding: "bg-emerald-50/30",
  paused: "",
  done: "",
};
