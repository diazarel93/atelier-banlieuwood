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
  responded: { dot: "#4CAF50", bg: "#F0FAF4", border: "#C6E9D0", text: "#2C2C2C" },
  active:    { dot: "#F2C94C", bg: "#FFFCF5", border: "#F0E4C0", text: "#2C2C2C" },
  stuck:     { dot: "#EB5757", bg: "#FFF5F5", border: "#F5C4C4", text: "#2C2C2C" },
  disconnected: { dot: "#C4BDB2", bg: "#F7F5F2", border: "#E8E2D8", text: "#B0A99E" },
};

export const DEFAULT_STYLE: StateStyle = {
  dot: "#C4BDB2",
  bg: "#F7F5F2",
  border: "#E8E2D8",
  text: "#B0A99E",
};
