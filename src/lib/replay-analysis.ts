// ═══════════════════════════════════════════════════════
// Replay Analysis — Pure logic for session replay
// Extracted from session-replay.tsx for reusability + testability
// ═══════════════════════════════════════════════════════

export interface ReplayEvent {
  id: string;
  event_type: string;
  student_id: string | null;
  situation_id: string | null;
  payload: Record<string, unknown>;
  occurred_at: string;
  offsetMs: number;
  seq: number;
}

export interface ReplayStudent {
  id: string;
  display_name: string;
  avatar: string;
}

export interface KeyMoment {
  offsetMs: number;
  type: "blocage" | "rebond" | "forte_participation" | "action_prof" | "emergence";
  label: string;
  detail: string;
  color: string;
  icon: string;
  severity: number;
}

const MAX_KEY_MOMENTS = 7;
const DEDUP_WINDOW_MS = 30_000;

const SEVERITY: Record<KeyMoment["type"], number> = {
  blocage: 90,
  rebond: 85,
  forte_participation: 70,
  emergence: 80,
  action_prof: 50,
};

/**
 * Detect pedagogically significant moments from session event timeline.
 * Returns up to MAX_KEY_MOMENTS sorted by time.
 */
export function detectKeyMoments(events: ReplayEvent[], _studentMap: Record<string, ReplayStudent>): KeyMoment[] {
  const raw: KeyMoment[] = [];

  const uniqueVoters = new Set(events.filter((e) => e.event_type === "vote_cast").map((e) => e.student_id)).size;

  // Group events by question (between question_launched events)
  const questionGroups: { launchEvent: ReplayEvent; responses: ReplayEvent[] }[] = [];
  let currentGroup: { launchEvent: ReplayEvent; responses: ReplayEvent[] } | null = null;

  for (const e of events) {
    if (e.event_type === "question_launched") {
      if (currentGroup) questionGroups.push(currentGroup);
      currentGroup = { launchEvent: e, responses: [] };
    } else if (e.event_type === "response_received" && currentGroup) {
      currentGroup.responses.push(e);
    }
  }
  if (currentGroup) questionGroups.push(currentGroup);

  for (const group of questionGroups) {
    const { launchEvent, responses } = group;
    if (responses.length === 0) continue;

    // Blocage: first response very slow
    const firstResponseDelay = responses[0].offsetMs - launchEvent.offsetMs;
    if (firstResponseDelay > 90_000) {
      raw.push({
        offsetMs: launchEvent.offsetMs + 60_000,
        type: "blocage",
        label: "Blocage détecté",
        detail: `Première réponse après ${Math.round(firstResponseDelay / 1000)}s`,
        color: "#EF4444",
        icon: "🚧",
        severity: SEVERITY.blocage + Math.min(firstResponseDelay / 10_000, 10),
      });
    }

    // Forte participation: 3+ responses arrive quickly
    if (responses.length >= 3) {
      const thirdResponseDelay = responses[2].offsetMs - launchEvent.offsetMs;
      if (thirdResponseDelay < 30_000) {
        raw.push({
          offsetMs: responses[2].offsetMs,
          type: "forte_participation",
          label: "Forte participation",
          detail: `${responses.length} réponses, 3 en moins de ${Math.round(thirdResponseDelay / 1000)}s`,
          color: "#4CAF50",
          icon: "🔥",
          severity: SEVERITY.forte_participation + Math.min(responses.length, 10),
        });
      }
    }

    // Rebond: gap > 60s then burst of responses
    for (let i = 1; i < responses.length; i++) {
      const gap = responses[i].offsetMs - responses[i - 1].offsetMs;
      if (gap > 60_000) {
        const afterGap = responses.slice(i);
        if (afterGap.length >= 2) {
          const burstDuration = afterGap[Math.min(1, afterGap.length - 1)].offsetMs - afterGap[0].offsetMs;
          if (burstDuration < 20_000) {
            raw.push({
              offsetMs: responses[i].offsetMs,
              type: "rebond",
              label: "Rebond",
              detail: `Reprise après ${Math.round(gap / 1000)}s de silence`,
              color: "#06B6D4",
              icon: "🔄",
              severity: SEVERITY.rebond + Math.min(gap / 10_000, 10),
            });
            break;
          }
        }
      }
    }
  }

  // Action prof: only highlights
  const highlights = events.filter((e) => e.event_type === "highlight");
  if (highlights.length > 0) {
    raw.push({
      offsetMs: highlights[0].offsetMs,
      type: "action_prof",
      label: "Mise en avant",
      detail:
        highlights.length > 1 ? `${highlights.length} réponses mises en avant` : "Le prof met en avant une réponse",
      color: "#EC4899",
      icon: "⭐",
      severity: SEVERITY.action_prof + highlights.length * 5,
    });
  }

  // Consensus: relative threshold (≥40% of voters, min 3)
  const voteEvents = events.filter((e) => e.event_type === "vote_cast");
  const voteCounts: Record<string, number> = {};
  for (const v of voteEvents) {
    const rid = String(v.payload.chosenResponseId || "");
    if (rid) voteCounts[rid] = (voteCounts[rid] || 0) + 1;
  }
  const consensusThreshold = Math.max(3, Math.ceil(uniqueVoters * 0.4));
  let topConsensus: { rid: string; count: number } | null = null;
  for (const [rid, count] of Object.entries(voteCounts)) {
    if (count >= consensusThreshold && (!topConsensus || count > topConsensus.count)) {
      topConsensus = { rid, count };
    }
  }
  if (topConsensus) {
    const lastVote = voteEvents[voteEvents.length - 1];
    const pct = uniqueVoters > 0 ? Math.round((topConsensus.count / uniqueVoters) * 100) : 0;
    raw.push({
      offsetMs: lastVote?.offsetMs || 0,
      type: "emergence",
      label: "Consensus fort",
      detail: `${topConsensus.count} votes (${pct}% des votants) sur une même réponse`,
      color: "#8B5CF6",
      icon: "🌟",
      severity: SEVERITY.emergence + pct / 5,
    });
  }

  // Deduplicate: merge same-type moments within 30s
  raw.sort((a, b) => a.offsetMs - b.offsetMs);
  const deduped: KeyMoment[] = [];
  for (const m of raw) {
    const existing = deduped.find((d) => d.type === m.type && Math.abs(d.offsetMs - m.offsetMs) < DEDUP_WINDOW_MS);
    if (existing) {
      if (m.severity > existing.severity) {
        const idx = deduped.indexOf(existing);
        deduped[idx] = m;
      }
    } else {
      deduped.push(m);
    }
  }

  // Cap at MAX_KEY_MOMENTS, keeping highest severity
  if (deduped.length > MAX_KEY_MOMENTS) {
    deduped.sort((a, b) => b.severity - a.severity);
    deduped.length = MAX_KEY_MOMENTS;
    deduped.sort((a, b) => a.offsetMs - b.offsetMs);
  }

  return deduped;
}

/**
 * Generate a human-readable narrative summary of key moments.
 */
export function generateReplaySummary(moments: KeyMoment[], totalMs: number, eventCount: number): string {
  if (moments.length === 0) {
    return eventCount > 0
      ? "Séance sans événement marquant détecté."
      : "Pas assez de données pour analyser cette séance.";
  }

  const parts: string[] = [];
  const types = moments.map((m) => m.type);

  const hasBlocage = types.includes("blocage");
  const hasRebond = types.includes("rebond");
  const hasForte = types.includes("forte_participation");
  const hasAction = types.includes("action_prof");
  const hasConsensus = types.includes("emergence");

  if (hasBlocage && hasRebond) {
    parts.push("La classe a d'abord hésité, puis a rebondi");
    if (hasAction) parts[0] += " après une intervention du prof";
    parts[0] += ".";
  } else if (hasBlocage && !hasRebond) {
    parts.push("La classe a rencontré des moments de blocage.");
  } else if (hasForte) {
    parts.push("La classe a montré une participation forte et rapide.");
  } else {
    parts.push("Séance au rythme régulier.");
  }

  if (hasConsensus) {
    parts.push("Un consensus fort s'est dégagé lors du vote.");
  }

  const durationMin = Math.round(totalMs / 60_000);
  if (durationMin > 0) {
    parts.push(`Durée totale : ${durationMin} min.`);
  }

  return parts.join(" ");
}

/**
 * Format milliseconds as "M:SS"
 */
export function formatReplayTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
