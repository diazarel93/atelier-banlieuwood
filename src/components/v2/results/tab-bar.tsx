"use client";

import { cn } from "@/lib/utils";

export type ResultsTab = "synthese" | "competences" | "outils-ia" | "le-film";

interface TabBarProps {
  active: ResultsTab;
  onChange: (tab: ResultsTab) => void;
}

const TABS: { key: ResultsTab; label: string; icon: string }[] = [
  {
    key: "synthese",
    label: "Synthèse",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  {
    key: "competences",
    label: "Compétences",
    icon: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01 9 11.01",
  },
  {
    key: "outils-ia",
    label: "Outils IA",
    icon: "M12 2a10 10 0 110 20 10 10 0 010-20zM12 6v6l4 2",
  },
  {
    key: "le-film",
    label: "Le Film",
    icon: "M7 4v16M17 4v16M3 8h4M17 8h4M3 12h18M3 16h4M17 16h4",
  },
];

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <div className="sticky top-14 z-30 bg-card/85 backdrop-blur-xl flex items-center gap-1 border-b border-[var(--color-bw-border)]">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
              isActive
                ? "text-bw-heading"
                : "text-bw-muted hover:text-bw-heading"
            )}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={tab.icon} />
            </svg>
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-bw-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
