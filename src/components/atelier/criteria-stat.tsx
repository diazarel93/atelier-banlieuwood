"use client";

import type { LucideIcon } from "lucide-react";

export function CriteriaStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  const colors = [
    "",
    "text-orange-500 bg-orange-500/10 border-orange-500/20",
    "text-accent bg-accent/10 border-accent/20",
    "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  ];
  const labels = ["", "Faible", "Bien", "Excellent"];
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border ${colors[value]}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold uppercase tracking-wider">
          {label}
        </div>
        <div className="flex gap-1 mt-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= value ? "bg-current" : "bg-current/15"
              }`}
            />
          ))}
        </div>
      </div>
      <span className="text-xs font-bold">{labels[value]}</span>
    </div>
  );
}
