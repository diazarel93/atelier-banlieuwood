"use client";

import { GlassCardV2 } from "../glass-card";

interface Achievement {
  id: string;
  name: string;
  tier: string;
}

interface AchievementGridProps {
  achievements: Achievement[];
}

const TIER_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
};

const TIER_EMOJI: Record<string, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
};

export function AchievementGrid({ achievements }: AchievementGridProps) {
  if (achievements.length === 0) {
    return (
      <GlassCardV2 className="p-4">
        <h3 className="text-xs font-semibold text-bw-heading uppercase tracking-wide mb-3">
          Badges
        </h3>
        <p className="text-sm text-bw-muted text-center py-4">
          Pas encore de badge
        </p>
      </GlassCardV2>
    );
  }

  return (
    <GlassCardV2 className="p-4">
      <h3 className="text-xs font-semibold text-bw-heading uppercase tracking-wide mb-3">
        Badges
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {achievements.map((a) => (
          <div
            key={a.id}
            className="flex flex-col items-center gap-1 rounded-xl p-2 bg-[var(--color-bw-surface-dim)]"
          >
            <span className="text-xl">
              {TIER_EMOJI[a.tier] || "🏅"}
            </span>
            <span
              className="text-[10px] font-medium text-center leading-tight truncate max-w-full"
              style={{ color: TIER_COLORS[a.tier] || "#888" }}
            >
              {a.name}
            </span>
          </div>
        ))}
      </div>
    </GlassCardV2>
  );
}
