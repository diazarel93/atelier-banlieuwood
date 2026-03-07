"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import type { StudentState } from "@/components/pilot/pulse-ring";

// ═══════════════════════════════════════════════════════════════
// CENTER STATE BANNER — Contextual top banner above responses
// Shows class-wide state: réflexion / divisée / majorité / blocage
// 48px height, pastel colors, rounded
// ═══════════════════════════════════════════════════════════════

type BannerState = {
  text: string;
  icon: string;
  severity: "calm" | "warn" | "alert" | "info";
} | null;

interface CenterStateBannerProps {
  sessionStatus: string;
  studentStates: { id: string; state: StudentState }[];
  responsesCount: number;
  totalStudents: number;
  optionDistribution?: Record<string, number>;
  optionLabels?: Record<string, string>;
}

const SEVERITY_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  calm: { bg: "rgba(76,175,80,0.08)", border: "rgba(76,175,80,0.18)", color: "#2E7D32" },
  warn: { bg: "rgba(245,164,91,0.08)", border: "rgba(245,164,91,0.18)", color: "#E65100" },
  alert: { bg: "rgba(198,40,40,0.08)", border: "rgba(198,40,40,0.18)", color: "#C62828" },
  info: { bg: "rgba(107,140,255,0.08)", border: "rgba(107,140,255,0.18)", color: "#3B5998" },
};

export function CenterStateBanner({
  sessionStatus,
  studentStates,
  responsesCount,
  totalStudents,
  optionDistribution,
  optionLabels,
}: CenterStateBannerProps) {
  const bannerState = useMemo((): BannerState => {
    if (sessionStatus !== "responding") return null;

    const stuckN = studentStates.filter((s) => s.state === "stuck").length;
    const thinkingN = studentStates.filter((s) => s.state === "active").length;

    // Blocage: 3+ stuck
    if (stuckN >= 3) {
      return { text: `Beaucoup d'eleves bloques (${stuckN})`, icon: "🚨", severity: "alert" };
    }

    // QCM analysis
    if (optionDistribution) {
      const counts = Object.entries(optionDistribution).sort((a, b) => b[1] - a[1]);
      const totalVotes = counts.reduce((sum, [, v]) => sum + v, 0);
      if (totalVotes >= 3 && counts.length >= 2) {
        const [topKey, topCount] = counts[0];
        const [secondKey, secondCount] = counts[1];
        const topPct = Math.round((topCount / totalVotes) * 100);
        const secondPct = Math.round((secondCount / totalVotes) * 100);

        // Divisée ~50/50
        if (topPct >= 30 && secondPct >= 30 && (topPct - secondPct) < 15) {
          const topLabel = optionLabels?.[topKey] || topKey.toUpperCase();
          const secondLabel = optionLabels?.[secondKey] || secondKey.toUpperCase();
          return { text: `Classe partagee entre ${topLabel} et ${secondLabel}`, icon: "⚖️", severity: "warn" };
        }

        // Clear majority >= 70%
        if (topPct >= 70) {
          const topLabel = optionLabels?.[topKey] || topKey.toUpperCase();
          return { text: `${topPct}% preferent ${topLabel}`, icon: "📊", severity: "calm" };
        }
      }
    }

    // All thinking, 0 responses
    if (responsesCount === 0 && thinkingN > 0) {
      return { text: `${totalStudents} eleves reflechissent`, icon: "💭", severity: "info" };
    }

    return null;
  }, [sessionStatus, studentStates, responsesCount, totalStudents, optionDistribution, optionLabels]);

  if (!bannerState) return null;

  const styles = SEVERITY_STYLES[bannerState.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex items-center gap-2.5 px-4 rounded-[12px]"
      style={{
        height: 48,
        background: styles.bg,
        border: `1px solid ${styles.border}`,
      }}
    >
      <span className="text-sm flex-shrink-0">{bannerState.icon}</span>
      <p className="text-[13px] font-semibold leading-snug" style={{ color: styles.color }}>
        {bannerState.text}
      </p>
      {bannerState.severity === "info" && (
        <div className="flex items-center gap-0.5 ml-auto">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1 h-1 rounded-full"
              style={{ background: styles.color }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
