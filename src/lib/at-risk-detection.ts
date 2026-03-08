/**
 * At-Risk Student Detection
 *
 * Pure function that identifies students who may need attention.
 * Criteria:
 *   - Any axis score < 30 → warning
 *   - Score drop > 15 pts between two consecutive sessions → warning
 *   - Inactive > 14 days → warning
 * Severity: warning (1 reason), alert (2+ reasons)
 */

import type { AxesScores } from "./axes-mapping";

export interface StudentForRisk {
  profileId: string;
  displayName: string;
  avatar: string | null;
  scores: AxesScores;
  lastActiveAt: string;
  /** Scores from previous session, if available */
  previousScores?: AxesScores | null;
}

export interface AtRiskStudent {
  profileId: string;
  displayName: string;
  avatar: string | null;
  severity: "warning" | "alert";
  reasons: string[];
}

const AXIS_LABELS: Record<keyof AxesScores, string> = {
  comprehension: "Compréhension",
  creativite: "Créativité",
  expression: "Expression",
  engagement: "Engagement",
};

export function detectAtRiskStudents(
  students: StudentForRisk[]
): AtRiskStudent[] {
  const now = Date.now();
  const fourteenDays = 14 * 24 * 60 * 60 * 1000;

  const results: AtRiskStudent[] = [];

  for (const student of students) {
    const reasons: string[] = [];

    // Check low scores (< 30)
    for (const [key, label] of Object.entries(AXIS_LABELS)) {
      const score = student.scores[key as keyof AxesScores];
      if (score < 30) {
        reasons.push(`${label} faible (${score}%)`);
      }
    }

    // Check score drops (> 15 pts)
    if (student.previousScores) {
      for (const [key, label] of Object.entries(AXIS_LABELS)) {
        const k = key as keyof AxesScores;
        const drop = student.previousScores[k] - student.scores[k];
        if (drop > 15) {
          reasons.push(`${label} en baisse (-${drop} pts)`);
        }
      }
    }

    // Check inactivity (> 14 days)
    const lastActive = new Date(student.lastActiveAt).getTime();
    if (now - lastActive > fourteenDays) {
      const days = Math.floor((now - lastActive) / (24 * 60 * 60 * 1000));
      reasons.push(`Inactif depuis ${days} jours`);
    }

    if (reasons.length > 0) {
      results.push({
        profileId: student.profileId,
        displayName: student.displayName,
        avatar: student.avatar,
        severity: reasons.length >= 2 ? "alert" : "warning",
        reasons,
      });
    }
  }

  // Sort: alerts first, then warnings
  results.sort((a, b) => {
    if (a.severity === b.severity) return 0;
    return a.severity === "alert" ? -1 : 1;
  });

  return results;
}
