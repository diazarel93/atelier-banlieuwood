/**
 * Competency axes display framework.
 * Previously derived from OIE scores — OIE has been removed (R2 doctrine compliance).
 * Axes types and definitions are kept for V2 dashboard structure.
 * Data source will need to be replaced by a curriculum-based system.
 */

export type AxisKey = "comprehension" | "creativite" | "expression" | "engagement";

export interface AxesScores {
  comprehension: number;
  creativite: number;
  expression: number;
  engagement: number;
}

export interface AxisDef {
  key: AxisKey;
  label: string;
  shortLabel: string;
  color: string;
  description: string;
}

export const AXES: AxisDef[] = [
  {
    key: "comprehension",
    label: "Compréhension",
    shortLabel: "Comp.",
    color: "#4ECDC4",
    description: "Capacité d'observation et d'analyse",
  },
  {
    key: "creativite",
    label: "Créativité",
    shortLabel: "Créa.",
    color: "#8B5CF6",
    description: "Imagination et originalité",
  },
  {
    key: "expression",
    label: "Expression",
    shortLabel: "Expr.",
    color: "#FF6B35",
    description: "Formulation et communication",
  },
  {
    key: "engagement",
    label: "Engagement",
    shortLabel: "Eng.",
    color: "#10B981",
    description: "Participation et implication",
  },
];

export function aggregateAxes(studentAxes: AxesScores[]): AxesScores {
  if (studentAxes.length === 0) {
    return { comprehension: 0, creativite: 0, expression: 0, engagement: 0 };
  }
  const sum: AxesScores = { comprehension: 0, creativite: 0, expression: 0, engagement: 0 };
  for (const s of studentAxes) {
    sum.comprehension += s.comprehension;
    sum.creativite += s.creativite;
    sum.expression += s.expression;
    sum.engagement += s.engagement;
  }
  const n = studentAxes.length;
  return {
    comprehension: Math.round(sum.comprehension / n),
    creativite: Math.round(sum.creativite / n),
    expression: Math.round(sum.expression / n),
    engagement: Math.round(sum.engagement / n),
  };
}

export function getAxisDef(key: AxisKey): AxisDef | undefined {
  return AXES.find((a) => a.key === key);
}
