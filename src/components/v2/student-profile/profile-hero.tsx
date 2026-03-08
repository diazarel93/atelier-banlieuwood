"use client";

import { GlassCardV2 } from "../glass-card";

interface ProfileHeroProps {
  displayName: string;
  avatar: string | null;
  sessionCount: number;
  totalResponses: number;
}

export function ProfileHero({
  displayName,
  avatar,
  sessionCount,
  totalResponses,
}: ProfileHeroProps) {
  return (
    <GlassCardV2 className="p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-bw-surface-dim)] text-3xl">
          {avatar || "🎬"}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-bw-heading truncate">
            {displayName}
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-bw-muted">
              <span className="font-semibold text-bw-heading tabular-nums">
                {sessionCount}
              </span>{" "}
              séance{sessionCount !== 1 ? "s" : ""}
            </span>
            <span className="text-sm text-bw-muted">
              <span className="font-semibold text-bw-heading tabular-nums">
                {totalResponses}
              </span>{" "}
              réponse{totalResponses !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </GlassCardV2>
  );
}
