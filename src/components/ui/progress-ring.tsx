"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════
   PROGRESS RING — animated circular progress indicator
   ═══════════════════════════════════════════════════════════════ */

interface ProgressRingProps {
  /** Progress value from 0 to 100 */
  value: number;
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Stroke color (hex) */
  color?: string;
  /** Track (background circle) color */
  trackColor?: string;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Show percentage value in center */
  showValue?: boolean;
  /** Small label below the value */
  label?: string;
  /** Use a gradient stroke (e.g. orange to gold) */
  gradient?: boolean;
  className?: string;
}

const sizeConfig: Record<string, { px: number; fontSize: number; labelSize: number }> = {
  sm: { px: 40, fontSize: 10, labelSize: 0 },
  md: { px: 56, fontSize: 13, labelSize: 0 },
  lg: { px: 72, fontSize: 16, labelSize: 9 },
  xl: { px: 96, fontSize: 22, labelSize: 11 },
};

export function ProgressRing({
  value,
  size = "md",
  color = "#FF6B35",
  trackColor = "rgba(255,255,255,0.06)",
  strokeWidth = 3,
  showValue = false,
  label,
  gradient = false,
  className,
}: ProgressRingProps) {
  const config = sizeConfig[size];
  const radius = (config.px - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.max(0, Math.min(100, value));
  const targetOffset = circumference - (clampedValue / 100) * circumference;

  const [offset, setOffset] = useState(circumference);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const hasAnimated = useRef(false);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Animate on mount and on value change
  useEffect(() => {
    if (prefersReduced) {
      setOffset(targetOffset);
      return;
    }

    // Small delay for mount animation
    const timer = setTimeout(() => setOffset(targetOffset), hasAnimated.current ? 0 : 100);
    hasAnimated.current = true;
    return () => clearTimeout(timer);
  }, [targetOffset, prefersReduced]);

  const gradientId = useId();
  const canShowLabel = (size === "lg" || size === "xl") && label;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: config.px, height: config.px }}
    >
      <svg width={config.px} height={config.px} viewBox={`0 0 ${config.px} ${config.px}`} className="block -rotate-90">
        {gradient && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6B35" />
              <stop offset="100%" stopColor="#D4A843" />
            </linearGradient>
          </defs>
        )}

        {/* Track circle */}
        <circle
          cx={config.px / 2}
          cy={config.px / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={config.px / 2}
          cy={config.px / 2}
          r={radius}
          fill="none"
          stroke={gradient ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: prefersReduced ? "none" : "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>

      {/* Center content */}
      {(showValue || canShowLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && (
            <span className="font-bold text-bw-heading leading-none tabular-nums" style={{ fontSize: config.fontSize }}>
              {Math.round(clampedValue)}
              <span className="text-bw-muted" style={{ fontSize: config.fontSize * 0.6 }}>
                %
              </span>
            </span>
          )}
          {canShowLabel && (
            <span className="text-bw-muted mt-0.5 leading-none" style={{ fontSize: config.labelSize }}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
