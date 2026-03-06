"use client";

import { motion, AnimatePresence } from "motion/react";
import { CATEGORY_COLORS } from "@/lib/constants";

export interface StoryFilmstripProps {
  allChoices: { id: string; category: string; chosen_text: string; restitution_label?: string }[];
  moduleColor: string;
}

export function StoryFilmstrip({ allChoices, moduleColor }: StoryFilmstripProps) {
  return (
    <AnimatePresence>
      {allChoices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="relative z-10 px-4 py-1.5 flex-shrink-0"
        >
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5" style={{ scrollBehavior: "smooth" }}>
            {allChoices.map((choice, i) => {
              const color = CATEGORY_COLORS[choice.category] || moduleColor;
              return (
                <motion.div
                  key={choice.id}
                  initial={{ opacity: 0, scale: 0.8, x: 30 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: i * 0.05 }}
                  className="flex-shrink-0 rounded-lg px-3 py-2 backdrop-blur-md max-w-[260px]"
                  style={{ background: "rgba(34,37,43,0.7)", borderLeft: `3px solid ${color}`, border: `1px solid rgba(255,255,255,0.05)` }}
                >
                  <span className="text-xs uppercase tracking-wider font-medium block" style={{ color }}>
                    {choice.restitution_label || choice.category}
                  </span>
                  <p className="text-sm text-bw-text mt-0.5 line-clamp-1">{choice.chosen_text}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
