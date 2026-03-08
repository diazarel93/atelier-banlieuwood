"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { KpiCard } from "./kpi-card";
import type { DashboardStats } from "@/hooks/use-dashboard-v2";

interface QuickStatsProps {
  stats: DashboardStats;
  className?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.08 },
  }),
};

export function QuickStats({ stats, className }: QuickStatsProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
        <KpiCard
          label="Séances animées"
          value={stats.doneSessions}
          color="var(--color-axis-comprehension)"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 7l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      </motion.div>
      <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
        <KpiCard
          label="En cours"
          value={stats.activeSessions}
          color="var(--color-axis-engagement)"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 6v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        />
      </motion.div>
      <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
        <KpiCard
          label="Total séances"
          value={stats.totalSessions}
          color="var(--color-axis-creativite)"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 4h14M2 9h14M2 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        />
      </motion.div>
      <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
        <KpiCard
          label="Élèves touchés"
          value={stats.totalStudents}
          color="var(--color-axis-expression)"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M1 16c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M12 5.5a3 3 0 110 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        />
      </motion.div>
    </div>
  );
}
