"use client";

import { useMemo } from "react";
import type { StudentState } from "@/components/pilot/pulse-ring";

// ═══════════════════════════════════════════════════════════════
// CLASS COGNITIVE STATE — Real-time human-readable class status
// Interprets student states + QCM distribution into one phrase
// ═══════════════════════════════════════════════════════════════

export type CognitiveStateSeverity = "calm" | "warn" | "alert";

export interface CognitiveStateResult {
  text: string;
  severity: CognitiveStateSeverity;
  icon: string;
}

interface ClassCognitiveStateProps {
  studentStates: { id: string; state: StudentState }[];
  optionDistribution?: Record<string, number>;
  optionLabels?: Record<string, string>; // key → human label
}

const SEVERITY_STYLES: Record<CognitiveStateSeverity, { bg: string; border: string; color: string }> = {
  calm: { bg: "rgba(76,175,80,0.08)", border: "rgba(76,175,80,0.2)", color: "#2E7D32" },
  warn: { bg: "rgba(245,164,91,0.08)", border: "rgba(245,164,91,0.2)", color: "#E65100" },
  alert: { bg: "rgba(198,40,40,0.08)", border: "rgba(198,40,40,0.2)", color: "#C62828" },
};

export function computeCognitiveState(
  studentStates: { id: string; state: StudentState }[],
  optionDistribution?: Record<string, number>,
  optionLabels?: Record<string, string>,
): CognitiveStateResult | null {
  const respondedN = studentStates.filter((s) => s.state === "responded").length;
  const thinkingN = studentStates.filter((s) => s.state === "active").length;
  const stuckN = studentStates.filter((s) => s.state === "stuck").length;
  const online = respondedN + thinkingN + stuckN;

  if (online === 0) return null;

  // Priority 1: Multiple stuck
  if (stuckN >= 3) {
    return { text: `Classe en difficulte (${stuckN} bloques)`, severity: "alert", icon: "🚨" };
  }

  // Priority 2: All responded
  if (respondedN > 0 && respondedN === online) {
    return { text: "Tout le monde a repondu !", severity: "calm", icon: "🎉" };
  }

  // Priority 3: QCM split ~50/50
  if (optionDistribution) {
    const counts = Object.entries(optionDistribution).sort((a, b) => b[1] - a[1]);
    const totalVotes = counts.reduce((sum, [, v]) => sum + v, 0);
    if (totalVotes >= 3 && counts.length >= 2) {
      const [topKey, topCount] = counts[0];
      const [secondKey, secondCount] = counts[1];
      const topPct = Math.round((topCount / totalVotes) * 100);
      const secondPct = Math.round((secondCount / totalVotes) * 100);

      // ~50/50 split
      if (topPct >= 30 && secondPct >= 30 && topPct - secondPct < 15) {
        const topLabel = optionLabels?.[topKey] || topKey.toUpperCase();
        const secondLabel = optionLabels?.[secondKey] || secondKey.toUpperCase();
        return {
          text: `Classe hesitante entre ${topLabel} et ${secondLabel}`,
          severity: "warn",
          icon: "⚖️",
        };
      }

      // Clear majority >= 70%
      if (topPct >= 70) {
        const topLabel = optionLabels?.[topKey] || topKey.toUpperCase();
        return {
          text: `${topPct}% preferent ${topLabel}`,
          severity: "calm",
          icon: "📊",
        };
      }
    }
  }

  // Priority 4: Some stuck
  if (stuckN > 0) {
    return {
      text: `${stuckN} eleve${stuckN > 1 ? "s" : ""} bloque${stuckN > 1 ? "s" : ""}`,
      severity: "warn",
      icon: "⚠️",
    };
  }

  // Priority 5: All thinking (0 responses)
  if (respondedN === 0 && thinkingN > 0) {
    return { text: "Classe en reflexion active", severity: "calm", icon: "💭" };
  }

  return null;
}

export function ClassCognitiveState({ studentStates, optionDistribution, optionLabels }: ClassCognitiveStateProps) {
  const state = useMemo(
    () => computeCognitiveState(studentStates, optionDistribution, optionLabels),
    [studentStates, optionDistribution, optionLabels],
  );

  if (!state) return null;

  const styles = SEVERITY_STYLES[state.severity];

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-[10px] transition-all"
      style={{ background: styles.bg, border: `1px solid ${styles.border}` }}
    >
      <span className="text-sm flex-shrink-0">{state.icon}</span>
      <p className="text-body-xs font-semibold leading-snug" style={{ color: styles.color }}>
        {state.text}
      </p>
    </div>
  );
}
