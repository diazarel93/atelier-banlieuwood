/**
 * Centralized design tokens for inline styles that need hex values.
 * For Tailwind/CSS usage, prefer CSS vars defined in globals.css (--color-bw-*).
 * These are only needed when JS needs the raw hex (e.g. for opacity tricks like `${color}20`).
 */

// ── Core palette (mirrors globals.css --color-bw-*) ──

export const COLORS = {
  primary: "#FF6B35",
  gold: "#D4A843",
  teal: "#4ECDC4",
  violet: "#8B5CF6",
  green: "#10B981",
  amber: "#F59E0B",
  danger: "#EF4444",
  gray: "#9CA3AF",
} as const;

// ── Semantic mappings ──

/** Session status → color */
export const STATUS_COLORS: Record<string, string> = {
  draft: COLORS.gray,
  waiting: COLORS.primary,
  responding: COLORS.green,
  paused: COLORS.amber,
  done: COLORS.green,
};

/** AI bilan: collaboration level → color */
export const COLLAB_COLORS: Record<string, string> = {
  faible: COLORS.danger,
  moyen: COLORS.amber,
  bon: COLORS.teal,
  excellent: COLORS.green,
};

/** AI bilan: engagement depth → color */
export const DEPTH_COLORS: Record<string, string> = {
  superficiel: COLORS.amber,
  correct: COLORS.teal,
  approfondi: COLORS.green,
};

/** AI bilan: key moment category → color */
export const MOMENT_COLORS: Record<string, string> = {
  tournant: COLORS.primary,
  "créatif": COLORS.violet,
  collectif: COLORS.teal,
  tension: COLORS.danger,
};

/** AI bilan: engagement trend → label + icon */
export const TREND_LABELS: Record<string, { label: string; icon: string }> = {
  croissant: { label: "Croissant", icon: "↗" },
  stable: { label: "Stable", icon: "→" },
  "décroissant": { label: "Décroissant", icon: "↘" },
};

/** Score thresholds for competency bars */
export function scoreColor(score: number): string {
  if (score >= 70) return COLORS.teal;
  if (score >= 40) return COLORS.amber;
  return COLORS.danger;
}
