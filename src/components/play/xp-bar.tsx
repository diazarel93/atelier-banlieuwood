"use client";

import { motion } from "motion/react";
import { getLevel } from "@/lib/xp";

interface XpBarProps {
  xp: number;
}

export function XpBar({ xp }: XpBarProps) {
  const { level, name, progress } = getLevel(xp);

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-bw-gold/15 text-bw-gold whitespace-nowrap">
        Nv.{level} {name}
      </span>
      <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #D4A843, #FF6B35)" }}
          animate={{ width: `${Math.max(progress * 100, 2)}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />
      </div>
      <span className="text-[9px] text-bw-muted tabular-nums">{xp}</span>
    </div>
  );
}
