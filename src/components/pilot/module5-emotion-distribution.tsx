"use client";

import { motion } from "motion/react";
import { EMOTIONS } from "@/lib/module5-data";

interface Module5EmotionDistributionProps {
  emotionDistribution: Record<string, number>;
}

export function Module5EmotionDistribution({
  emotionDistribution,
}: Module5EmotionDistributionProps) {
  const totalEmotions = Object.values(emotionDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-bw-surface rounded-xl p-4 border border-white/[0.06] space-y-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Distribution des émotions choisies</span>
      {Object.entries(emotionDistribution).sort(([,a], [,b]) => b - a).map(([key, count], i) => {
        const emo = EMOTIONS.find(e => e.key === key);
        const pct = totalEmotions > 0 ? Math.round((count / totalEmotions) * 100) : 0;
        return (
          <motion.div key={key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: emo?.color || "#EC4899" }}>{emo?.label || key}</span>
              <span className="text-xs tabular-nums" style={{ color: emo?.color || "#EC4899" }}>{pct}% ({count})</span>
            </div>
            <div className="h-2 bg-bw-bg rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="h-full rounded-full" style={{ backgroundColor: emo?.color || "#EC4899" }} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
