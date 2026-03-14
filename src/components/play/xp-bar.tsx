"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { getLevel } from "@/lib/xp";

interface XpBarProps {
  xp: number;
  showDetails?: boolean;
}

export function XpBar({ xp, showDetails = false }: XpBarProps) {
  const { level, name, progress, nextThreshold, currentXp } = getLevel(xp);
  const prevXp = useRef(xp);
  const justGained = xp > prevXp.current;

  useEffect(() => {
    prevXp.current = xp;
  }, [xp]);

  const xpToNext = nextThreshold - currentXp;

  if (!showDetails) {
    // Compact mode — used in headers
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-bw-gold/15 text-bw-gold whitespace-nowrap">
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
        <span className="text-xs text-bw-muted tabular-nums">{xp}</span>
      </div>
    );
  }

  // Detailed mode — used in game view
  return (
    <motion.div
      className="w-full max-w-[220px] space-y-1"
      animate={justGained ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-bw-gold font-cinema tracking-wider">
          Nv.{level} {name}
        </span>
        <span className="text-xs text-bw-muted tabular-nums">{xp} XP</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden relative">
        <motion.div
          className="h-full rounded-full relative"
          style={{ background: "linear-gradient(90deg, #D4A843, #FF6B35)" }}
          animate={{ width: `${Math.max(progress * 100, 2)}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />
        {justGained && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(212,168,67,0.4), transparent)" }}
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
        )}
      </div>
      <p className="text-[10px] text-bw-muted text-right">
        {xpToNext > 0 ? `${xpToNext} XP → prochain niveau` : "Niveau max !"}
      </p>
    </motion.div>
  );
}
