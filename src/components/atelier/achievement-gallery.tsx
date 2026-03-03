"use client";

import { ACHIEVEMENTS } from "@/lib/models/achievements";
import type { AchievementsData } from "@/lib/models/achievements";
import { Lock } from "lucide-react";

export function AchievementGallery({
  data,
}: {
  data: AchievementsData;
}) {
  const unlockedSet = new Set(data.achievements.map((a) => a.id));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {ACHIEVEMENTS.map((def) => {
        const isUnlocked = unlockedSet.has(def.id);
        const isSecret = def.secret && !isUnlocked;

        return (
          <div
            key={def.id}
            className={`rounded-2xl border p-4 text-center space-y-2 transition-all ${
              isUnlocked
                ? "bg-card border-yellow-500/20 shadow-lg shadow-yellow-500/5"
                : "bg-muted/30 border-border/50 opacity-50"
            }`}
          >
            <div className="text-3xl">
              {isSecret ? (
                <Lock className="h-8 w-8 mx-auto text-muted-foreground/30" />
              ) : (
                def.emoji
              )}
            </div>
            <div>
              <p className="text-sm font-bold">
                {isSecret ? "???" : def.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {isSecret ? "Succes secret" : def.description}
              </p>
            </div>
            {isUnlocked && (
              <p className="text-[10px] text-yellow-600 dark:text-yellow-400 font-bold">
                Debloque
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
