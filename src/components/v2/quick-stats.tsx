"use client";

import { motion, useReducedMotion } from "motion/react";
import { KpiCard } from "./kpi-card";
import { IconCheck, IconClock } from "./icons";
import type { DashboardStats } from "@/hooks/use-dashboard-v2";

interface QuickStatsProps {
  stats: DashboardStats;
  trends?: Record<string, { value: number; label?: string }>;
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

export function QuickStats({ stats, trends, className }: QuickStatsProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion
    ? { hidden: {}, visible: () => ({}) }
    : cardVariants;

  return (
    <div className={className ? `grid grid-cols-2 gap-4 ${className}` : "grid grid-cols-2 gap-4"}>
      <motion.div custom={0} variants={variants} initial="hidden" animate="visible">
        <KpiCard
          label="Séances animées"
          value={stats.doneSessions}
          trend={trends?.doneSessions}
          color="var(--color-axis-comprehension)"
          icon={<IconCheck size={18} />}
        />
      </motion.div>
      <motion.div custom={1} variants={variants} initial="hidden" animate="visible">
        <KpiCard
          label="En cours"
          value={stats.activeSessions}
          trend={trends?.activeSessions}
          color="var(--color-axis-engagement)"
          icon={<IconClock size={18} />}
        />
      </motion.div>
      <motion.div custom={2} variants={variants} initial="hidden" animate="visible">
        <KpiCard
          label="Total séances"
          value={stats.totalSessions}
          trend={trends?.totalSessions}
          color="var(--color-axis-creativite)"
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 4h14M2 9h14M2 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        />
      </motion.div>
      <motion.div custom={3} variants={variants} initial="hidden" animate="visible">
        <KpiCard
          label="Élèves touchés"
          value={stats.totalStudents}
          trend={trends?.totalStudents}
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
