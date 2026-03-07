/**
 * Axes Mapping — O-I-E → 4 axes pédagogiques UI
 *
 * Backend keeps O-I-E as its scoring engine.
 * UI displays 4 learner-friendly axes:
 *   Compréhension = O (Observation)
 *   Créativité    = I (Imagination)
 *   Expression    = E (Expression)
 *   Engagement    = participation rate (responseCount / maxPossible)
 */

import type { OIEScores } from "./oie-profile";

// ── Types ──

export interface AxesScores {
  comprehension: number; // 0-100
  creativite: number;    // 0-100
  expression: number;    // 0-100
  engagement: number;    // 0-100
}

export type AxisKey = keyof AxesScores;

export interface AxisDef {
  key: AxisKey;
  label: string;
  shortLabel: string;
  color: string;
  cssVar: string;
}

// ── Axis definitions ──

export const AXES: AxisDef[] = [
  {
    key: "comprehension",
    label: "Compréhension",
    shortLabel: "Compréhension",
    color: "#6366F1",
    cssVar: "var(--color-axis-comprehension)",
  },
  {
    key: "creativite",
    label: "Créativité",
    shortLabel: "Créativité",
    color: "#8B5CF6",
    cssVar: "var(--color-axis-creativite)",
  },
  {
    key: "expression",
    label: "Expression",
    shortLabel: "Expression",
    color: "#EC4899",
    cssVar: "var(--color-axis-expression)",
  },
  {
    key: "engagement",
    label: "Engagement",
    shortLabel: "Engagement",
    color: "#F59E0B",
    cssVar: "var(--color-axis-engagement)",
  },
];

// ── Mapping functions ──

/**
 * Convert O-I-E scores to 4-axes scores.
 * @param oie        — O-I-E scores from computeOIE()
 * @param maxResponses — max possible responses for engagement calc (default 20)
 */
export function oieToAxes(oie: OIEScores, maxResponses = 20): AxesScores {
  return {
    comprehension: Math.round(oie.O),
    creativite: Math.round(oie.I),
    expression: Math.round(oie.E),
    engagement: Math.round(
      Math.min(100, (oie.responseCount / maxResponses) * 100)
    ),
  };
}

/**
 * Aggregate multiple students' axes scores into class averages.
 */
export function aggregateAxes(students: AxesScores[]): AxesScores {
  if (students.length === 0) {
    return { comprehension: 0, creativite: 0, expression: 0, engagement: 0 };
  }
  const sum = students.reduce(
    (acc, s) => ({
      comprehension: acc.comprehension + s.comprehension,
      creativite: acc.creativite + s.creativite,
      expression: acc.expression + s.expression,
      engagement: acc.engagement + s.engagement,
    }),
    { comprehension: 0, creativite: 0, expression: 0, engagement: 0 }
  );
  const n = students.length;
  return {
    comprehension: Math.round(sum.comprehension / n),
    creativite: Math.round(sum.creativite / n),
    expression: Math.round(sum.expression / n),
    engagement: Math.round(sum.engagement / n),
  };
}

/**
 * Get axis definition by key.
 */
export function getAxisDef(key: AxisKey): AxisDef {
  return AXES.find((a) => a.key === key)!;
}
