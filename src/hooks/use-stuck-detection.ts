"use client";

import { useMemo } from "react";
import { STUCK_THRESHOLD_MS } from "@/components/pilot/pilot-settings";

export type StuckLevel = "ok" | "nudge" | "slow" | "stuck";

const NUDGE_MS = 30_000;
const SLOW_MS = 45_000;

interface StuckDetectionInput {
  /** Student IDs that have already responded */
  respondedStudentIds: Set<string>;
  /** All active student IDs */
  activeStudentIds: Set<string> | string[];
  /** Timestamp (ms) when responding status was opened, or null if not responding */
  respondingOpenedAt: number | null;
}

/**
 * Progressive stuck detection for students during a responding phase.
 *
 * Returns a Map of studentId → StuckLevel:
 * - "ok": student responded or responding started less than NUDGE_MS ago
 * - "nudge" (30s): yellow — student hasn't responded yet
 * - "slow" (45s): orange — student is taking a while
 * - "stuck" (60s): red — student is stuck, notification to pilot
 */
export function useStuckDetection({
  respondedStudentIds,
  activeStudentIds,
  respondingOpenedAt,
}: StuckDetectionInput): Map<string, StuckLevel> {
  return useMemo(() => {
    const map = new Map<string, StuckLevel>();

    if (!respondingOpenedAt) {
      // Not in responding phase — everyone is "ok"
      for (const id of activeStudentIds) {
        map.set(id, "ok");
      }
      return map;
    }

    const elapsed = Date.now() - respondingOpenedAt;

    // Don't start detection until delay has passed
    if (elapsed < NUDGE_MS) {
      for (const id of activeStudentIds) {
        map.set(id, "ok");
      }
      return map;
    }

    for (const id of activeStudentIds) {
      if (respondedStudentIds.has(id)) {
        map.set(id, "ok");
        continue;
      }

      // Student hasn't responded — check elapsed time
      if (elapsed >= STUCK_THRESHOLD_MS) {
        map.set(id, "stuck");
      } else if (elapsed >= SLOW_MS) {
        map.set(id, "slow");
      } else if (elapsed >= NUDGE_MS) {
        map.set(id, "nudge");
      } else {
        map.set(id, "ok");
      }
    }

    return map;
  }, [respondedStudentIds, activeStudentIds, respondingOpenedAt]);
}

/**
 * Count students at each stuck level.
 */
export function countStuckLevels(stuckMap: Map<string, StuckLevel>) {
  let nudge = 0, slow = 0, stuck = 0;
  for (const level of stuckMap.values()) {
    if (level === "nudge") nudge++;
    else if (level === "slow") slow++;
    else if (level === "stuck") stuck++;
  }
  return { nudge, slow, stuck, total: nudge + slow + stuck };
}
