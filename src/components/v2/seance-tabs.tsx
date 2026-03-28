"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { useSwipe } from "@/hooks/use-swipe";

export type SeanceTab = "upcoming" | "active" | "draft" | "done" | "archived";

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
  { key: "done", label: "Terminees" },
  { key: "archived", label: "Archivees" },
];

export function SeanceTabs({ active, counts, onChange, className }: SeanceTabsProps) {
  const currentIndex = TABS.findIndex((t) => t.key === active);

  const onSwipe = useCallback(
    (direction: "left" | "right" | "up" | "down") => {
      if (direction === "left" && currentIndex < TABS.length - 1) {
        onChange(TABS[currentIndex + 1].key);
      } else if (direction === "right" && currentIndex > 0) {
        onChange(TABS[currentIndex - 1].key);
      }
    },
    [currentIndex, onChange],
  );

  const swipeHandlers = useSwipe({ onSwipe });

  return (
    <div
      role="tablist"
      aria-label="Filtrer les seances"
      className={cn(
        "flex items-center gap-1 rounded-xl bg-[var(--color-bw-surface-dim)] p-1 overflow-x-auto",
        className,
      )}
      {...swipeHandlers}
    >
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all whitespace-nowrap",
            active === tab.key ? "bg-card text-bw-heading shadow-sm" : "text-bw-muted hover:text-bw-heading",
          )}
        >
          {tab.label}
          {counts[tab.key] > 0 && (
            <span
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums",
                active === tab.key ? "bg-bw-primary text-white" : "bg-[var(--color-bw-border-subtle)] text-bw-muted",
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
