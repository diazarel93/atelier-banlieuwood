"use client";

import { useState, useEffect } from "react";

interface ElapsedTimerProps {
  /** Timestamp (Date.now()) when the timer started */
  startedAt: number | null;
  /** "plain" = neutral text, "pill" = colored pill (red when >2min), "badge" = old style with icon */
  variant?: "plain" | "pill" | "badge";
}

export function ElapsedTimer({ startedAt, variant = "badge" }: ElapsedTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return;
    }
    setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  if (!startedAt) return null;

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  // ── Plain variant: just text ──
  if (variant === "plain") {
    return <span className="text-[13px] font-medium text-[#7D828A] tabular-nums">{timeStr}</span>;
  }

  // ── Pill variant: colored rounded pill ──
  if (variant === "pill") {
    const isAlert = elapsed > 120; // > 2 min → red
    const isWarn = elapsed > 60 && !isAlert; // > 1 min → amber
    const color = isAlert ? "#EF4444" : isWarn ? "#F59E0B" : "#7D828A";
    const bg = isAlert ? "rgba(239,68,68,0.1)" : isWarn ? "rgba(245,158,11,0.08)" : "rgba(125,130,138,0.08)";
    const border = isAlert ? "rgba(239,68,68,0.25)" : isWarn ? "rgba(245,158,11,0.2)" : "rgba(125,130,138,0.15)";

    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-semibold tabular-nums"
        style={{ color, background: bg, border: `1px solid ${border}` }}
      >
        {timeStr}
      </span>
    );
  }

  // ── Badge variant (legacy): icon + text with tinted bg ──
  const color = elapsed > 300 ? "#EF4444" : elapsed > 120 ? "#F59E0B" : "#7D828A";

  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs tabular-nums"
      style={{ color, background: `${color}10` }}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      {mins}:{secs.toString().padStart(2, "0")}
    </div>
  );
}
