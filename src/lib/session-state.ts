/**
 * Centralized session status logic.
 *
 * Every page that needs to know "what can the user do with this session?"
 * should call `getSessionState(status)` instead of computing booleans locally.
 */

export type SessionPhase = "waiting" | "live" | "paused" | "done";

export interface SessionState {
  /** Canonical phase of the session */
  phase: SessionPhase;
  /** CTA label for the primary action */
  ctaLabel: string;
  /** Short CTA label (for compact UI like dashboard rows) */
  ctaShort: string;
  /** Pilot link is relevant */
  canPilot: boolean;
  /** Results link is relevant */
  canViewResults: boolean;
  /** Prepare link is relevant */
  canPrepare: boolean;
}

const LIVE_STATUSES = ["responding", "reviewing", "voting"];

export function getSessionState(status: string): SessionState {
  if (status === "done") {
    return {
      phase: "done",
      ctaLabel: "Voir les résultats",
      ctaShort: "Résultats",
      canPilot: false,
      canViewResults: true,
      canPrepare: false,
    };
  }

  if (status === "paused") {
    return {
      phase: "paused",
      ctaLabel: "Reprendre la séance",
      ctaShort: "Reprendre",
      canPilot: true,
      canViewResults: false,
      canPrepare: true,
    };
  }

  if (LIVE_STATUSES.includes(status)) {
    return {
      phase: "live",
      ctaLabel: "Retourner au cockpit",
      ctaShort: "Cockpit",
      canPilot: true,
      canViewResults: false,
      canPrepare: false,
    };
  }

  // waiting (default)
  return {
    phase: "waiting",
    ctaLabel: "Lancer la séance",
    ctaShort: "Lancer",
    canPilot: true,
    canViewResults: false,
    canPrepare: true,
  };
}
