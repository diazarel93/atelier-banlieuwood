/**
 * Centralized session status logic.
 *
 * Every page that needs to know "what can the user do with this session?"
 * should call `getSessionState(status)` instead of computing booleans locally.
 */

import { ROUTES } from "./routes";

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

/**
 * Returns session state enriched with pre-computed URLs.
 * Avoids duplicating URL logic across pages.
 */
export interface SessionUrls extends SessionState {
  pilotUrl: string;
  screenUrl: string;
  prepareUrl: string;
  resultsUrl: string;
  detailUrl: string;
  /** URL of the primary CTA based on status */
  ctaUrl: string;
}

export function getSessionUrls(id: string, status: string): SessionUrls {
  const state = getSessionState(status);
  return {
    ...state,
    pilotUrl: ROUTES.pilot(id),
    screenUrl: ROUTES.screen(id),
    prepareUrl: ROUTES.seancePrepare(id),
    resultsUrl: ROUTES.seanceResults(id),
    detailUrl: ROUTES.seanceDetail(id),
    ctaUrl: state.canViewResults
      ? ROUTES.seanceResults(id)
      : state.canPilot
        ? ROUTES.pilot(id)
        : ROUTES.seancePrepare(id),
  };
}
