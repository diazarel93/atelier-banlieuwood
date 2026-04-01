"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import type { StudentState } from "@/components/pilot/pulse-ring";

// ═══════════════════════════════════════════════════════════════
// CENTER STATE BANNER — Primary focal point of the cockpit center
// Shows class-wide state: réflexion / divisée / majorité / blocage
// v2: taller (56px), stronger contrast, bigger text — true decision hub
// ═══════════════════════════════════════════════════════════════

type BannerState = {
  text: string;
  icon: string;
  severity: "calm" | "warn" | "alert" | "info";
  /** Optional secondary line for extra context */
  sub?: string;
} | null;

interface CenterStateBannerProps {
  sessionStatus: string;
  studentStates: { id: string; state: StudentState }[];
  responsesCount: number;
  totalStudents: number;
  optionDistribution?: Record<string, number>;
  optionLabels?: Record<string, string>;
  /** When true, blocage/division alerts are handled by AttentionPriority — banner shows softer version */
  primaryAttentionActive?: boolean;
}

// Stronger contrast than before — these are the center focal point
const SEVERITY_STYLES: Record<string, { bg: string; border: string; color: string; glow: string }> = {
  calm: {
    bg: "rgba(76,175,80,0.10)",
    border: "rgba(76,175,80,0.25)",
    color: "#1B5E20",
    glow: "0 2px 8px rgba(76,175,80,0.08)",
  },
  warn: {
    bg: "rgba(245,164,91,0.12)",
    border: "rgba(245,164,91,0.30)",
    color: "#BF360C",
    glow: "0 2px 8px rgba(245,164,91,0.10)",
  },
  alert: {
    bg: "rgba(198,40,40,0.10)",
    border: "rgba(198,40,40,0.25)",
    color: "#B71C1C",
    glow: "0 2px 8px rgba(198,40,40,0.10)",
  },
  info: {
    bg: "rgba(107,140,255,0.10)",
    border: "rgba(107,140,255,0.22)",
    color: "#283593",
    glow: "0 2px 8px rgba(107,140,255,0.08)",
  },
};

export function CenterStateBanner({
  sessionStatus,
  studentStates,
  responsesCount,
  totalStudents,
  optionDistribution,
  optionLabels,
  primaryAttentionActive = false,
}: CenterStateBannerProps) {
  const onlineStudents = studentStates.filter((s) => s.state !== "disconnected").length;

  const bannerState = useMemo((): BannerState => {
    if (sessionStatus !== "responding") return null;

    const stuckN = studentStates.filter((s) => s.state === "stuck").length;
    const thinkingN = studentStates.filter((s) => s.state === "active").length;
    const pct = onlineStudents > 0 ? Math.round((responsesCount / onlineStudents) * 100) : 0;

    // Blocage: 3+ stuck — downgrade when AttentionPriority handles it
    if (stuckN >= 3) {
      if (primaryAttentionActive) {
        return { text: `${stuckN} eleves en difficulte`, icon: "💭", severity: "info", sub: `${pct}% ont repondu` };
      }
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

        // Divisée ~50/50 — downgrade when AttentionPriority handles it
        if (topPct >= 30 && secondPct >= 30 && topPct - secondPct < 15) {
          const topLabel = optionLabels?.[topKey] || topKey.toUpperCase();
          const secondLabel = optionLabels?.[secondKey] || secondKey.toUpperCase();
          if (primaryAttentionActive) {
            return { text: `${topLabel} ${topPct}% · ${secondLabel} ${secondPct}%`, icon: "📊", severity: "info" };
          }
          return {
            text: `Classe partagee entre ${topLabel} et ${secondLabel}`,
            icon: "⚖️",
            severity: "warn",
            sub: `${totalVotes} votes`,
          };
        }

        // Clear majority >= 70%
        if (topPct >= 70) {
          const topLabel = optionLabels?.[topKey] || topKey.toUpperCase();
          return { text: `${topPct}% preferent ${topLabel}`, icon: "📊", severity: "calm", sub: `${totalVotes} votes` };
        }
      }
    }

    // All responded
    if (responsesCount >= onlineStudents && onlineStudents > 0) {
      return { text: `Tout le monde a repondu !`, icon: "✅", severity: "calm" };
    }

    // Progress update (> 50%)
    if (pct >= 50 && responsesCount > 0) {
      return { text: `${responsesCount}/${onlineStudents} ont repondu (${pct}%)`, icon: "📝", severity: "info" };
    }

    // All thinking, 0 responses
    if (responsesCount === 0 && thinkingN > 0) {
      return { text: `${totalStudents} eleves reflechissent`, icon: "💭", severity: "info" };
    }

    return null;
  }, [
    sessionStatus,
    studentStates,
    responsesCount,
    totalStudents,
    onlineStudents,
    optionDistribution,
    optionLabels,
    primaryAttentionActive,
  ]);

  if (!bannerState) return null;

  const styles = SEVERITY_STYLES[bannerState.severity];

  const isWarn = bannerState.severity === "warn";
  const isAlert = bannerState.severity === "alert";

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{
        opacity: 1,
        y: 0,
        x: isWarn ? [0, -2, 2, -1, 1, 0] : 0,
      }}
      exit={{ opacity: 0, y: -6 }}
      transition={isWarn ? { x: { duration: 0.4, ease: "easeInOut" } } : undefined}
      className="flex items-center gap-3 px-5 rounded-[14px]"
      style={{
        minHeight: 56,
        background: styles.bg,
        border: `1.5px solid ${styles.border}`,
        boxShadow: styles.glow,
      }}
    >
      {/* Icon — bigger, with pulse on alert */}
      <motion.span
        className="text-base flex-shrink-0"
        animate={isAlert ? { scale: [1, 1.15, 1] } : {}}
        transition={isAlert ? { repeat: Infinity, duration: 1.5 } : undefined}
      >
        {bannerState.icon}
      </motion.span>

      {/* Text content */}
      <div className="flex-1 min-w-0 py-2">
        <p className="text-[14px] font-bold leading-snug" style={{ color: styles.color }}>
          {bannerState.text}
        </p>
        {bannerState.sub && (
          <p className="text-body-xs font-medium mt-0.5" style={{ color: styles.color, opacity: 0.6 }}>
            {bannerState.sub}
          </p>
        )}
      </div>

      {/* Animated dots for "thinking/info" state */}
      {bannerState.severity === "info" && !bannerState.sub && (
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: styles.color }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
            />
          ))}
        </div>
      )}

      {/* Flash indicator for divided/alert */}
      {(isWarn || isAlert) && (
        <motion.span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: styles.color }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}
    </motion.div>
  );
}
