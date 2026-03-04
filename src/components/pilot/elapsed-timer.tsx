"use client";

import { useState, useEffect } from "react";

interface ElapsedTimerProps {
  /** Timestamp (Date.now()) when the current question was opened */
  startedAt: number | null;
}

export function ElapsedTimer({ startedAt }: ElapsedTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) { setElapsed(0); return; }
    setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  if (!startedAt) return null;

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const color = elapsed > 300 ? "#EF4444" : elapsed > 120 ? "#F59E0B" : "#7D828A";

  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs tabular-nums"
      style={{ color, background: `${color}10` }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      {mins}:{secs.toString().padStart(2, "0")}
    </div>
  );
}
