"use client";

import { Button } from "@/components/ui/button";
import {
  CHAPTER_IDS,
  CHAPTER_META,
  type ChapterId,
} from "@/lib/models/atelier";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export function StageIntroView({
  chapterId,
  stageNumber,
  isPending,
  onStart,
}: {
  chapterId: ChapterId;
  stageNumber: number;
  isPending: boolean;
  onStart: () => void;
}) {
  const meta = CHAPTER_META[chapterId];
  return (
    <motion.div
      key="stage-intro"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex-1 flex items-center justify-center"
    >
      <div className="text-center space-y-10 max-w-lg px-6">
        {/* Stage badge */}
        <div className="relative mx-auto w-fit">
          <div className="w-36 h-36 rounded-[2rem] bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border-2 border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/10">
            <span className="text-7xl drop-shadow-lg">{meta.icon}</span>
          </div>
          <div className="absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-lg shadow-lg shadow-primary/30">
            {stageNumber}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-primary">
            Etape {stageNumber} sur {CHAPTER_IDS.length}
          </p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            {meta.label}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
            {meta.description}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-card border p-4 space-y-1">
            <div className="text-3xl font-black text-primary">
              {meta.questionCount}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Questions
            </div>
          </div>
          <div className="rounded-2xl bg-card border p-4 space-y-1">
            <div className="text-3xl font-black text-yellow-500">
              {meta.questionCount * 3}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              XP max
            </div>
          </div>
          <div className="rounded-2xl bg-card border p-4 space-y-1">
            <div className="text-3xl font-black text-emerald-500">3</div>
            <div className="text-xs text-muted-foreground font-medium">
              Criteres
            </div>
          </div>
        </div>

        {/* Start button */}
        <Button
          onClick={onStart}
          disabled={isPending}
          size="lg"
          className="rounded-2xl px-12 h-16 text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-105 active:scale-100"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin mr-3" />
          ) : (
            <Sparkles className="h-5 w-5 mr-3" />
          )}
          Commencer l&apos;etape
        </Button>
      </div>
    </motion.div>
  );
}
