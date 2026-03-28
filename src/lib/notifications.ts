/**
 * Notification computation — pure function.
 *
 * Types:
 *   - "prepare" : sessions in "waiting" status that need preparation
 *   - "results"  : sessions in "done" status with results available
 */

import { ROUTES } from "./routes";

export interface NotificationItem {
  id: string;
  type: "prepare" | "results";
  title: string;
  description: string;
  href: string;
  severity: "info" | "warning";
}

interface SessionSummary {
  id: string;
  title: string;
  status: string;
}

interface NotificationInput {
  todaySessions: SessionSummary[];
  tomorrowSessions: SessionSummary[];
}

export function computeNotifications(data: NotificationInput): NotificationItem[] {
  const notifications: NotificationItem[] = [];

  // Sessions waiting for preparation
  const waitingSessions = [
    ...data.todaySessions,
    ...data.tomorrowSessions,
  ].filter((s) => s.status === "waiting");

  for (const session of waitingSessions) {
    notifications.push({
      id: `prepare-${session.id}`,
      type: "prepare",
      title: "Séance à préparer",
      description: session.title,
      href: ROUTES.seancePrepare(session.id),
      severity: "warning",
    });
  }

  // Sessions with results available
  const doneSessions = [
    ...data.todaySessions,
    ...data.tomorrowSessions,
  ].filter((s) => s.status === "done");

  for (const session of doneSessions) {
    notifications.push({
      id: `results-${session.id}`,
      type: "results",
      title: "Résultats disponibles",
      description: session.title,
      href: ROUTES.seanceResults(session.id),
      severity: "info",
    });
  }

  // Sort: warnings first, then info
  const severityOrder = { warning: 0, info: 1 };
  notifications.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  return notifications;
}
