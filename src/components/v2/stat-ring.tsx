"use client";

import { cn } from "@/lib/utils";

interface StatRingProps {
  value: number; // 0-100
  label: string;
  color?: string; // CSS color or var()
  size?: number; // px, default 80
  strokeWidth?: number; // px, default 6
  className?: string;
}

export function StatRing({
  value,
  label,
  color = "var(--color-axis-comprehension)",
  size = 80,
  strokeWidth = 6,
  className,
}: StatRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  const isComplete = value >= 100;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          role="img"
          aria-label={`${label}: ${Math.round(value)}%`}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-bw-border-subtle)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(
              "transition-[stroke-dashoffset] duration-700 ease-out",
              isComplete && "animate-[ring-pulse_1s_ease-out]",
            )}
            style={isComplete ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined}
          />
        </svg>
        {/* Center label */}
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums text-bw-heading">
          {Math.round(value)}%
        </span>
      </div>
      {label && <span className="text-xs font-medium text-bw-muted truncate max-w-full">{label}</span>}
    </div>
  );
}
