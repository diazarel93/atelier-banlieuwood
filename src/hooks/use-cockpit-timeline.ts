"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { createTimelineEvent, type TimelineEvent, type TimelineEventType } from "@/components/pilot/session-timeline";
import { computeAttentionQueue } from "@/components/pilot/attention-priority";
import { useSound } from "@/hooks/use-sound";
import { toast } from "sonner";
import type { Response, Student } from "@/hooks/use-pilot-session";

interface StuckStudent {
  id: string;
  name: string;
  avatar: string;
}

/**
 * Session timeline events + notification logic.
 * Extracted from CockpitContent for clarity.
 */
export function useCockpitTimeline({
  sessionStatus,
  responses,
  activeStudents,
  stuckStudents,
  respondingOpenedAt,
  respondedCount,
  students,
}: {
  sessionStatus: string;
  responses: Response[];
  activeStudents: Student[];
  stuckStudents: StuckStudent[];
  respondingOpenedAt: number | null;
  respondedCount: number;
  students: Student[] | undefined;
}) {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const timelineTracked = useRef<Set<string>>(new Set());
  const allRespondedNotified = useRef(false);
  const prevResponseCountRef = useRef(0);
  const [allResponded, setAllResponded] = useState(false);
  const { play } = useSound();

  const addTimelineEvent = useCallback(
    (
      type: TimelineEventType,
      label: string,
      detail?: string,
      severity?: "info" | "positive" | "warning" | "highlight",
    ) => {
      const key = `${type}-${label}`;
      if (timelineTracked.current.has(key)) return;
      timelineTracked.current.add(key);
      setTimelineEvents((prev) => [...prev, createTimelineEvent(type, label, detail, severity)]);
    },
    [],
  );

  // ── Track when responses opened ──
  useEffect(() => {
    if (sessionStatus === "responding") {
      addTimelineEvent("question_launched", "Question lancee", undefined, "info");
    } else {
      allRespondedNotified.current = false;
      setAllResponded(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus]);

  // ── Notification: all students responded ──
  useEffect(() => {
    if (sessionStatus !== "responding" || activeStudents.length === 0) return;
    if (responses.length >= activeStudents.length && !allRespondedNotified.current) {
      allRespondedNotified.current = true;
      setAllResponded(true);
      play("success");
      toast.success("Tout le monde a répondu !", { icon: "🎉" });
      addTimelineEvent("all_responded", "Tout le monde a repondu", `${activeStudents.length} eleves`, "positive");
    }
  }, [responses.length, activeStudents.length, sessionStatus, play, addTimelineEvent]);

  // ── Soft notification: new response received ──
  useEffect(() => {
    if (sessionStatus !== "responding") {
      prevResponseCountRef.current = responses.length;
      return;
    }
    const prev = prevResponseCountRef.current;
    const curr = responses.length;
    if (curr > prev && prev > 0) {
      const newest = responses[responses.length - 1];
      const studentName = students?.find((s) => s.id === newest?.student_id)?.display_name;
      if (studentName) {
        toast(`${studentName} a repondu`, { icon: "✏️", duration: 2000, style: { fontSize: 13, padding: "8px 14px" } });
      }
    }
    // Timeline events: first response, half responded
    if (curr === 1 && prev === 0) {
      const name = students?.find((s) => s.id === responses[0]?.student_id)?.display_name;
      addTimelineEvent("first_response", "Premiere reponse", name || undefined, "positive");
    }
    if (
      activeStudents.length > 2 &&
      curr >= Math.ceil(activeStudents.length / 2) &&
      prev < Math.ceil(activeStudents.length / 2)
    ) {
      addTimelineEvent("half_responded", "50% ont repondu", `${curr}/${activeStudents.length}`, "info");
    }
    prevResponseCountRef.current = curr;
  }, [responses.length, responses, sessionStatus, students, activeStudents.length, addTimelineEvent]);

  // ── Timeline: stuck detected ──
  const prevStuckCountRef = useRef(0);
  useEffect(() => {
    const n = stuckStudents.length;
    if (n >= 3 && prevStuckCountRef.current < 3) {
      addTimelineEvent(
        "stuck_detected",
        `${n} eleves bloques`,
        stuckStudents
          .slice(0, 3)
          .map((s) => s.name?.split(" ")[0])
          .join(", "),
        "warning",
      );
    }
    prevStuckCountRef.current = n;
  }, [stuckStudents, addTimelineEvent]);

  // ── Timeline: vote launched ──
  const prevStatusRef = useRef(sessionStatus);
  useEffect(() => {
    if (sessionStatus === "voting" && prevStatusRef.current !== "voting") {
      addTimelineEvent("vote_launched", "Vote lance", undefined, "highlight");
    }
    prevStatusRef.current = sessionStatus;
  }, [sessionStatus, addTimelineEvent]);

  // ── Attention priority ──
  const hasPrimaryAttention = useMemo(() => {
    const handsStudents = (students || []).filter((s) => s.hand_raised_at && s.is_active && !s.kicked);
    const queue = computeAttentionQueue({
      stuckCount: stuckStudents.length,
      stuckNames: stuckStudents.slice(0, 3).map((s) => s.name),
      handsRaised: handsStudents.length,
      handsNames: handsStudents.map((s) => s.display_name?.split(" ")[0] || s.display_name),
      handsRaisedAt: handsStudents.map((s) => s.hand_raised_at ?? null),
      responsesCount: respondedCount,
      totalStudents: activeStudents.length,
      onlineStudents: activeStudents.filter((s) => s.is_active).length,
      elapsedSeconds: respondingOpenedAt ? Math.floor((Date.now() - respondingOpenedAt) / 1000) : 0,
      status: sessionStatus,
    });
    return queue.length > 0;
  }, [students, sessionStatus, stuckStudents, respondedCount, activeStudents, respondingOpenedAt]);

  return {
    timelineEvents,
    addTimelineEvent,
    allResponded,
    hasPrimaryAttention,
  };
}
