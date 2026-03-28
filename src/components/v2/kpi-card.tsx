"use client";

import { cn } from "@/lib/utils";
import { GlassCardV2 } from "./glass-card";
import { useCountUp } from "@/hooks/use-count-up";

interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; label?: string };
  icon?: React.ReactNode;
  color?: string;
  className?: string;
}

export function KpiCard({ label, value, trend, icon, color, className }: KpiCardProps) {
  const numericValue = typeof value === "number" ? value : 0;
  const animated = useCountUp(numericValue, 700);
  const displayValue = typeof value === "number" ? animated : value;

  return (
    <GlassCardV2 className={cn("relative overflow-hidden p-5", className)}>
      {/* Top accent bar — 3px, full width */}
      {color && <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: color }} />}

      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="text-body-xs font-semibold text-bw-muted uppercase tracking-wider">{label}</span>
          <span
            className="text-2xl font-bold tabular-nums text-bw-heading"
            style={color ? { color } : undefined}
            aria-hidden="true"
          >
            {displayValue}
          </span>
          <span className="sr-only">{value}</span>
        </div>
        {icon && (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              backgroundColor: color ? `${color}30` : "var(--color-bw-surface-dim)",
              color: color || "var(--color-bw-muted)",
            }}
          >
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
              trend.value >= 0 ? "bg-bw-green-100 text-bw-green" : "bg-bw-danger-100 text-bw-danger",
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          {trend.label && <span className="text-bw-muted">{trend.label}</span>}
        </div>
      )}
    </GlassCardV2>
  );
}
