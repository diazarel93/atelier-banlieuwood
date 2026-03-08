/**
 * Notification computation — pure function.
 *
 * Types:
 *   - "prepare" : sessions in "waiting" status that need preparation
 *   - "results"  : sessions in "done" status with results available
 *   - "at-risk"  : students flagged at risk
 */

export interface NotificationItem {
  id: string;
  type: "prepare" | "results" | "at-risk";
  title: string;
  description: string;
  href: string;
  severity: "info" | "warning" | "alert";
}

interface SessionSummary {
  id: string;
  title: string;
  status: string;
}

interface AtRiskStudent {
  profileId: string;
  displayName: string;
  severity: "warning" | "alert";
  reasons: string[];
}

interface NotificationInput {
  todaySessions: SessionSummary[];
  tomorrowSessions: SessionSummary[];
  atRiskStudents?: AtRiskStudent[];
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
      href: `/v2/seances/${session.id}/prepare`,
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
      href: `/v2/seances/${session.id}/results`,
      severity: "info",
    });
  }

  // At-risk students
  if (data.atRiskStudents) {
    for (const student of data.atRiskStudents) {
      notifications.push({
        id: `at-risk-${student.profileId}`,
        type: "at-risk",
        title: "Élève à surveiller",
        description: `${student.displayName} — ${student.reasons[0]}`,
        href: `/v2/eleves/${student.profileId}`,
        severity: student.severity === "alert" ? "alert" : "warning",
      });
    }
  }

  // Sort: alerts first, then warnings, then info
  const severityOrder = { alert: 0, warning: 1, info: 2 };
  notifications.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  return notifications;
}
