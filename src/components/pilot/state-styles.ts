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
  responded: { dot: "#4CAF50", bg: "#E8F5E9", border: "#A5D6A7", text: "#2C2C2C" },
  active: { dot: "#F2C94C", bg: "#FFF8E1", border: "#FFE082", text: "#2C2C2C" },
  stuck: { dot: "#EB5757", bg: "#FFEBEE", border: "#EF9A9A", text: "#2C2C2C" },
  disconnected: { dot: "#C4BDB2", bg: "#F0EDE8", border: "#D5CFC6", text: "#B0A99E" },
};

export const DEFAULT_STYLE: StateStyle = {
  dot: "#C4BDB2",
  bg: "#F7F5F2",
  border: "#E8E2D8",
  text: "#B0A99E",
};
