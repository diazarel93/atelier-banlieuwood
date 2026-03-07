"use client";

import { cn } from "@/lib/utils";
import { GlassCardV2 } from "./glass-card";

interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; label?: string }; // positive = up, negative = down
  icon?: React.ReactNode;
  color?: string;
  className?: string;
}

export function KpiCard({
  label,
  value,
  trend,
  icon,
  color,
  className,
}: KpiCardProps) {
  return (
    <GlassCardV2 className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-bw-muted uppercase tracking-wide">
            {label}
          </span>
          <span
            className="text-2xl font-bold tabular-nums text-bw-heading"
            style={color ? { color } : undefined}
          >
            {value}
          </span>
        </div>
        {icon && (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              backgroundColor: color ? `${color}14` : "var(--color-bw-surface-dim)",
              color: color || "var(--color-bw-muted)",
            }}
          >
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <span
            className={cn(
              "font-medium",
              trend.value >= 0 ? "text-emerald-600" : "text-red-500"
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          {trend.label && (
            <span className="text-bw-muted">{trend.label}</span>
          )}
        </div>
      )}
    </GlassCardV2>
  );
}
