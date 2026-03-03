"use client";

import { CATEGORY_COLORS } from "@/lib/constants";

export interface CollectiveChoice {
  id: string;
  situation_id: string;
  category: string;
  restitution_label: string;
  chosen_text: string;
  validated_at: string;
}

interface ChoicesHistoryProps {
  choices: CollectiveChoice[];
}

export function ChoicesHistory({ choices }: ChoicesHistoryProps) {
  if (choices.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-[10px] uppercase tracking-wider text-bw-muted font-semibold">
        Choix collectifs ({choices.length})
      </h4>
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
        {choices.map((c, i) => {
          const color = CATEGORY_COLORS[c.category] || "#7D828A";
          return (
            <div
              key={c.id}
              className="bg-bw-bg rounded-xl px-3 py-2 border-l-2 cursor-default group relative"
              style={{ borderLeftColor: color }}
              title={c.chosen_text}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold" style={{ color }}>
                  Q{i + 1}
                </span>
                <span className="text-xs text-bw-text truncate flex-1">
                  {c.chosen_text}
                </span>
              </div>
              {/* Tooltip on hover */}
              <div className="hidden group-hover:block absolute z-20 left-0 top-full mt-1 bg-bw-elevated border border-white/[0.06] rounded-xl p-3 text-xs text-bw-text leading-relaxed max-w-[240px] shadow-xl">
                <span className="text-[10px] uppercase tracking-wider block mb-1" style={{ color }}>
                  {c.restitution_label || c.category}
                </span>
                {c.chosen_text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
