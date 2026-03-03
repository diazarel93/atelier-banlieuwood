"use client";

import { memo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CHAPTER_META,
  BADGE_STYLES,
  type ChapterId,
} from "@/lib/models/atelier";
import { Lock } from "lucide-react";

export const StageMap = memo(function StageMap({
  chapters,
  activeChapter,
  onSelect,
}: {
  chapters: { chapterId: string; status: string; badge: string | null }[];
  activeChapter: string;
  onSelect: (id: string) => void;
}) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex items-center gap-0">
        {chapters.map((ch, idx) => {
          const meta = CHAPTER_META[ch.chapterId as ChapterId];
          const isActive = ch.chapterId === activeChapter;
          const isLocked = ch.status === "locked";
          const isCompleted = ch.status === "completed";
          const stageNum = idx + 1;

          return (
            <div key={ch.chapterId} className="flex items-center">
              {idx > 0 && (
                <div className="flex items-center">
                  <div
                    className={`w-3 sm:w-5 h-[2px] ${
                      isCompleted ||
                      ch.status === "in-progress" ||
                      ch.status === "unlocked"
                        ? "bg-primary/40"
                        : "bg-muted-foreground/10"
                    }`}
                  />
                </div>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => !isLocked && onSelect(ch.chapterId)}
                    disabled={isLocked}
                    className={`relative flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/30 scale-110 z-10"
                        : isCompleted
                          ? "w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 hover:from-emerald-500/30 cursor-pointer border border-emerald-500/20"
                          : isLocked
                            ? "w-11 h-11 rounded-2xl bg-muted/30 cursor-not-allowed border border-transparent"
                            : "w-11 h-11 rounded-2xl bg-muted/60 hover:bg-primary/10 cursor-pointer border border-border/50 hover:border-primary/30"
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="h-4 w-4 text-muted-foreground/30" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <span
                          className={isActive ? "text-base" : "text-sm"}
                        >
                          {meta.icon}
                        </span>
                      </div>
                    )}

                    {/* Stage number */}
                    {!isLocked && (
                      <span
                        className={`absolute -bottom-1 text-[9px] font-black ${
                          isActive
                            ? "text-primary"
                            : isCompleted
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {stageNum}
                      </span>
                    )}

                    {/* Badge medal */}
                    {ch.badge && (
                      <span className="absolute -top-2 -right-2 text-sm drop-shadow-md">
                        {ch.badge === "gold"
                          ? "🥇"
                          : ch.badge === "silver"
                            ? "🥈"
                            : "🥉"}
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-card border shadow-xl"
                >
                  <div className="text-center">
                    <p className="font-bold text-sm">
                      Etape {stageNum}: {meta.label}
                    </p>
                    {isLocked && (
                      <p className="text-xs text-muted-foreground">
                        Verrouille
                      </p>
                    )}
                    {isCompleted && ch.badge && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        {BADGE_STYLES[ch.badge]?.label}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
});
