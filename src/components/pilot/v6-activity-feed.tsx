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
    <section className="rounded-2xl border border-[var(--color-bw-cockpit-border)] bg-bw-cockpit-canvas p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-base">📻</span>
          <span className="text-body-sm font-bold text-white">Activite</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-bw-violet/10 text-bw-violet">
            {items.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundOn(!soundOn)}
            className={`text-body-xs font-semibold px-2 py-1 min-h-[44px] rounded-md cursor-pointer border flex items-center gap-1 transition-colors ${
              soundOn
                ? "bg-bw-cockpit-surface border-[var(--color-bw-cockpit-border)] text-emerald-400"
                : "bg-bw-cockpit-surface border-[var(--color-bw-cockpit-border)] text-bw-cockpit-muted"
            }`}
          >
            {soundOn ? "🔊" : "🔇"} {soundOn ? "Son" : "Muet"}
          </button>
          {onClear && (
            <button
              onClick={onClear}
              className="text-body-xs font-semibold px-2 py-1 min-h-[44px] rounded-md bg-bw-danger/8 border border-bw-danger/20 text-bw-danger cursor-pointer hover:bg-bw-danger/15 transition-colors"
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
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-bw-cockpit-surface/50 hover:bg-bw-cockpit-surface transition-colors"
          >
            <span className="text-sm flex-shrink-0">{item.icon}</span>
            <span className="text-body-xs text-bw-cockpit-muted flex-1 truncate">{item.text}</span>
            <span className="text-body-xs text-bw-cockpit-muted/70 flex-shrink-0 tabular-nums">{item.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
