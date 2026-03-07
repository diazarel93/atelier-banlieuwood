"use client";

import { cn } from "@/lib/utils";

export type SeanceTab = "upcoming" | "active" | "draft" | "archived";

interface SeanceTabsProps {
  active: SeanceTab;
  counts: Record<SeanceTab, number>;
  onChange: (tab: SeanceTab) => void;
  className?: string;
}

const TABS: { key: SeanceTab; label: string }[] = [
  { key: "upcoming", label: "A venir" },
  { key: "active", label: "En cours" },
  { key: "draft", label: "Brouillons" },
  { key: "archived", label: "Archives" },
];

export function SeanceTabs({ active, counts, onChange, className }: SeanceTabsProps) {
  return (
    <div className={cn("flex items-center gap-1 rounded-xl bg-[var(--color-bw-surface-dim)] p-1", className)}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
            active === tab.key
              ? "bg-white text-bw-heading shadow-sm"
              : "text-bw-muted hover:text-bw-heading"
          )}
        >
          {tab.label}
          {counts[tab.key] > 0 && (
            <span
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums",
                active === tab.key
                  ? "bg-bw-primary text-white"
                  : "bg-[var(--color-bw-border-subtle)] text-bw-muted"
              )}
            >
              {counts[tab.key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
