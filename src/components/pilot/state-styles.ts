/**
 * Shared state palette for classroom components.
 *  - Green  = repondu, OK
 *  - Amber  = en cours (neutre-chaud)
 *  - Red    = bloque / besoin d'aide
 *  - Muted  = deconnecte
 */

export interface StateStyle {
  dot: string;
  bg: string;
  border: string;
  text: string;
}

export const STATE_STYLE: Record<string, StateStyle> = {
  responded: {
    dot: "var(--color-bw-green-main, #22C55E)",
    bg: "var(--color-bw-green-bg, #E8F5E9)",
    border: "var(--color-bw-green-border, #A5D6A7)",
    text: "var(--color-bw-cockpit-text, #2C2C2C)",
  },
  active: {
    dot: "var(--color-bw-amber-main, #F59E0B)",
    bg: "var(--color-bw-amber-bg, #FFF8E1)",
    border: "var(--color-bw-amber-border, #FFE082)",
    text: "var(--color-bw-cockpit-text, #2C2C2C)",
  },
  stuck: {
    dot: "var(--color-bw-danger-main, #EF4444)",
    bg: "var(--color-bw-danger-bg, #FFEBEE)",
    border: "var(--color-bw-danger-border, #EF9A9A)",
    text: "var(--color-bw-cockpit-text, #2C2C2C)",
  },
  disconnected: {
    dot: "var(--color-bw-cockpit-muted, #C4BDB2)",
    bg: "var(--color-bw-cockpit-surface, #F0EDE8)",
    border: "var(--color-bw-cockpit-border, #D5CFC6)",
    text: "var(--color-bw-cockpit-muted, #B0A99E)",
  },
};

export const DEFAULT_STYLE: StateStyle = {
  dot: "var(--color-bw-cockpit-muted, #C4BDB2)",
  bg: "var(--color-bw-cockpit-canvas, #1a1a35)",
  border: "var(--color-bw-cockpit-border, #E8E2D8)",
  text: "var(--color-bw-cockpit-muted, #B0A99E)",
};
