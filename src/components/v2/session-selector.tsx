"use client";

import { cn } from "@/lib/utils";

interface SessionOption {
  id: string;
  title: string;
  classLabel: string | null;
}

interface SessionSelectorProps {
  sessions: SessionOption[];
  classLabels: string[];
  selectedClassLabel: string | null;
  selectedSessionId: string | null;
  onClassChange: (label: string | null) => void;
  onSessionChange: (id: string | null) => void;
  className?: string;
}

export function SessionSelector({
  sessions,
  classLabels,
  selectedClassLabel,
  selectedSessionId,
  onClassChange,
  onSessionChange,
  className,
}: SessionSelectorProps) {
  const filteredSessions = selectedClassLabel
    ? sessions.filter((s) => s.classLabel === selectedClassLabel)
    : sessions;

  return (
    <div className={cn("flex items-center gap-3 flex-wrap", className)}>
      {/* Class selector */}
      <select
        value={selectedClassLabel || ""}
        onChange={(e) => {
          onClassChange(e.target.value || null);
          onSessionChange(null);
        }}
        className="h-9 rounded-lg border border-[var(--color-bw-border)] bg-card px-3 text-sm text-bw-heading focus:outline-none focus:ring-2 focus:ring-bw-primary/30"
      >
        <option value="">Toutes les classes</option>
        {classLabels.map((label) => (
          <option key={label} value={label}>
            {label}
          </option>
        ))}
      </select>

      {/* Session selector */}
      <select
        value={selectedSessionId || ""}
        onChange={(e) => onSessionChange(e.target.value || null)}
        className="h-9 rounded-lg border border-[var(--color-bw-border)] bg-card px-3 text-sm text-bw-heading focus:outline-none focus:ring-2 focus:ring-bw-primary/30"
      >
        <option value="">Toutes les séances</option>
        {filteredSessions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </select>
    </div>
  );
}
