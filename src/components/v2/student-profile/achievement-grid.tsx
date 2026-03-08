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
  return (
    <GlassCardV2 className="p-5">
      <h3 className="label-caps mb-3">Badges</h3>
      {achievements.length === 0 ? (
        <div className="flex flex-col items-center py-4 text-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-bw-muted mb-2">
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
          </svg>
          <p className="text-body-xs text-bw-muted">
            Les badges apparaîtront après les premières séances
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {achievements.map((a) => (
            <div
              key={a.id}
              className="flex flex-col items-center gap-1 rounded-xl p-2.5 bg-[var(--color-bw-surface-dim)]"
            >
              <span className="text-xl">
                {TIER_EMOJI[a.tier] || "🏅"}
              </span>
              <span
                className="text-body-xs font-medium text-center leading-tight truncate max-w-full"
                style={{ color: TIER_COLORS[a.tier] || "#888" }}
              >
                {a.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCardV2>
  );
}
