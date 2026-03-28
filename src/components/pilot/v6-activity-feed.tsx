"use client";

import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
// V6 ACTIVITY FEED — Notification stream at bottom of cockpit
// ═══════════════════════════════════════════════════════════════

export interface ActivityItem {
  id: string | number;
  text: string;
  time: string;
  icon: string;
  cat: "response" | "vote" | "achievement" | "system";
}

interface V6ActivityFeedProps {
  items: ActivityItem[];
  onClear?: () => void;
}

export function V6ActivityFeed({ items, onClear }: V6ActivityFeedProps) {
  const [soundOn, setSoundOn] = useState(true);

  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[#2a2a50] bg-[#161633] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-base">📻</span>
          <span className="text-[13px] font-bold text-[#f0f0f8]">Activite</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6]">
            {items.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundOn(!soundOn)}
            className={`text-[10px] font-semibold px-2 py-1 rounded-md cursor-pointer border flex items-center gap-1 transition-colors ${
              soundOn
                ? "bg-[#1a1a35] border-[#2a2a50] text-emerald-400"
                : "bg-[#1a1a35] border-[#2a2a50] text-[#64748b]"
            }`}
          >
            {soundOn ? "🔊" : "🔇"} {soundOn ? "Son" : "Muet"}
          </button>
          {onClear && (
            <button
              onClick={onClear}
              className="text-[10px] font-semibold px-2 py-1 rounded-md bg-red-500/8 border border-red-500/20 text-red-400 cursor-pointer hover:bg-red-500/15 transition-colors"
            >
              Effacer tout
            </button>
          )}
        </div>
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto">
        {items.slice(0, 10).map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#1a1a35]/50 hover:bg-[#1a1a35] transition-colors"
          >
            <span className="text-sm flex-shrink-0">{item.icon}</span>
            <span className="text-[11px] text-[#94a3b8] flex-1 truncate">{item.text}</span>
            <span className="text-[9px] text-[#64748b] flex-shrink-0 tabular-nums">{item.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
