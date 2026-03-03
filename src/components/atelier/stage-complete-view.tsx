"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CHAPTER_META,
  BADGE_STYLES,
  type ChapterId,
} from "@/lib/models/atelier";
import { Trophy, Eye, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";

export function StageCompleteView({
  chapter,
  chapterId,
  stageNumber,
  hasNextChapter,
  onReview,
  onNext,
}: {
  chapter: { totalScore: number; maxScore: number; badge: string | null };
  chapterId: ChapterId;
  stageNumber: number;
  hasNextChapter: boolean;
  onReview: () => void;
  onNext: () => void;
}) {
  const meta = CHAPTER_META[chapterId];
  const pct =
    chapter.maxScore > 0
      ? Math.round((chapter.totalScore / chapter.maxScore) * 100)
      : 0;

  const badgeEmoji =
    chapter.badge === "gold"
      ? "🥇"
      : chapter.badge === "silver"
        ? "🥈"
        : chapter.badge === "bronze"
          ? "🥉"
          : null;

  // Confetti on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (chapter.badge === "gold") {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#fbbf24", "#f59e0b", "#d97706", "#ffffff"],
        });
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.5, x: 0.6 },
            colors: ["#fbbf24", "#f59e0b", "#d97706"],
          });
        }, 400);
      } else if (chapter.badge === "silver" || chapter.badge === "bronze") {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
          colors:
            chapter.badge === "silver"
              ? ["#9ca3af", "#d1d5db", "#e5e7eb"]
              : ["#c2410c", "#ea580c", "#f97316"],
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [chapter.badge]);

  return (
    <motion.div
      key="stage-complete"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex-1 flex items-center justify-center"
    >
      <div className="text-center space-y-8 max-w-md px-6">
        {/* Victory visual */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
          className="relative mx-auto w-fit"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400/30 via-yellow-500/20 to-amber-600/10 border-2 border-yellow-500/30 flex items-center justify-center shadow-2xl shadow-yellow-500/10">
            <Trophy className="h-16 w-16 text-yellow-500 drop-shadow-lg" />
          </div>
          {badgeEmoji && (
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.5 }}
              className="absolute -top-3 -right-3 text-5xl drop-shadow-lg"
            >
              {badgeEmoji}
            </motion.span>
          )}
        </motion.div>

        {/* Stage cleared message */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] font-black text-yellow-600 dark:text-yellow-400">
            Etape {stageNumber} terminee
          </p>
          <h1 className="text-4xl font-black tracking-tight">
            {meta.label}
          </h1>
          {chapter.badge && (
            <p className="text-lg font-bold text-muted-foreground">
              Badge {BADGE_STYLES[chapter.badge]?.label} obtenu
            </p>
          )}
        </div>

        {/* Score stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-card border p-5 space-y-1"
          >
            <div className="text-4xl font-black text-primary">{pct}%</div>
            <div className="text-xs text-muted-foreground font-medium">
              Score
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-card border p-5 space-y-1"
          >
            <div className="text-4xl font-black text-yellow-500">
              {chapter.totalScore}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              / {chapter.maxScore} XP
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onReview}
            className="rounded-xl"
          >
            <Eye className="h-4 w-4 mr-2" />
            Revoir
          </Button>
          {hasNextChapter && (
            <Button
              onClick={onNext}
              size="lg"
              className="rounded-xl px-8 shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-105 transition-all"
            >
              Etape suivante
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
