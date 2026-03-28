"use client";

import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════
   LIVE INDICATOR — real-time connection status
   ═══════════════════════════════════════════════════════════════ */

type ConnectionStatus = "connected" | "connecting" | "disconnected";

interface LiveIndicatorProps {
  status: ConnectionStatus;
  /** Show text label next to the dot (default: true) */
  showLabel?: boolean;
  className?: string;
}

const statusConfig: Record<ConnectionStatus, { label: string; dotClass: string }> = {
  connected: {
    label: "En direct",
    dotClass: "led led-active",
  },
  connecting: {
    label: "Connexion\u2026",
    dotClass: "led led-writing",
  },
  disconnected: {
    label: "Hors ligne",
    dotClass: "led bg-bw-danger",
  },
};

export function LiveIndicator({ status, showLabel = true, className }: LiveIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className={cn("inline-flex items-center gap-2", className)} role="status" aria-label={config.label}>
      <span className={config.dotClass} aria-hidden="true" />
      {showLabel && (
        <span
          className={cn(
            "text-xs font-medium leading-none",
            status === "connected" && "text-bw-teal",
            status === "connecting" && "text-bw-primary",
            status === "disconnected" && "text-bw-danger",
          )}
        >
          {config.label}
        </span>
      )}
    </div>
  );
}
