"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useCockpitData, useCockpitActions } from "@/components/pilot/cockpit-context";
import { useStuckDetection } from "@/hooks/use-stuck-detection";
import { STUCK_DETECTION_DELAY_MS } from "@/components/pilot/pilot-settings";
import { FocusCockpit } from "@/components/pilot/focus/focus-cockpit";
import { ClasseSidebar } from "./classe-sidebar";
import { AssistantSidebar } from "./assistant-sidebar";
import { createTimelineEvent, type TimelineEvent } from "@/components/pilot/session-timeline";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════
// COMMAND COCKPIT — 3-column "Command Center" layout
//
// Desktop ≥1280px: left sidebar + center + right sidebar
// Tablet 1024-1279: left sidebar + center
// Mobile <1024px: center only (FocusCockpit)
//
// Wraps FocusCockpit at center — zero duplication.
// ═══════════════════════════════════════════════════════════════

// ── Lightweight hook for sidebar data (avoids duplicating FocusCockpit state) ──

function useCommandSidebarData() {
  const { session, sessionId, responses, activeStudents, situationData } = useCockpitData();
  const { onSelectStudent } = useCockpitActions();

  // Responded student IDs
  const module10Data = (situationData as { module10?: { allSubmissions?: { studentId: string }[] } })?.module10;
  const respondedStudentIds = useMemo(() => {
    const ids = new Set(responses.map((r) => r.student_id));
    if (module10Data?.allSubmissions) {
      for (const s of module10Data.allSubmissions) ids.add(s.studentId);
    }
    return ids;
  }, [responses, module10Data?.allSubmissions]);

  const activeStudentIds = useMemo(
    () => new Set((session.students || []).filter((s) => s.is_active).map((s) => s.id)),
    [session.students]
  );

  // Track when responding started
  const [respondingOpenedAt, setRespondingOpenedAt] = useState<number | null>(null);
  useEffect(() => {
    if (session.status === "responding") {
      setRespondingOpenedAt((prev) => prev ?? Date.now());
    } else {
      setRespondingOpenedAt(null);
    }
  }, [session.status]);

  // Stuck detection
  const stuckLevels = useStuckDetection({
    respondedStudentIds,
    activeStudentIds,
    respondingOpenedAt: session.status === "responding" ? respondingOpenedAt : null,
  });

  // Session started at (when this component mounts)
  const [sessionStartedAt] = useState<number>(() => Date.now());

  // Timeline events — track key moments
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const trackedRef = useRef<Set<string>>(new Set());
  const prevStatusRef = useRef(session.status);
  const prevResponseCountRef = useRef(responses.length);

  const addEvent = useCallback((type: Parameters<typeof createTimelineEvent>[0], label: string, detail?: string, severity?: TimelineEvent["severity"]) => {
    const key = `${type}-${label}`;
    if (trackedRef.current.has(key)) return;
    trackedRef.current.add(key);
    setTimelineEvents((prev) => [...prev, createTimelineEvent(type, label, detail, severity)]);
  }, []);

  // Track status changes
  useEffect(() => {
    const prev = prevStatusRef.current;
    const curr = session.status;
    if (prev === curr) return;
    prevStatusRef.current = curr;

    if (curr === "responding" && prev !== "responding") {
      addEvent("question_launched", "Question lancee", undefined, "info");
      // Reset tracking for new question
      trackedRef.current = new Set(["question_launched-Question lancee"]);
      prevResponseCountRef.current = 0;
    }
    if (curr === "voting") addEvent("vote_launched", "Vote lance", undefined, "highlight");
    if (curr === "reviewing") addEvent("phase_changed", "Phase discussion", undefined, "info");
  }, [session.status, addEvent]);

  // Track response milestones
  useEffect(() => {
    const count = responses.length;
    const total = activeStudents.length;
    const prev = prevResponseCountRef.current;

    if (session.status !== "responding" || total === 0) {
      prevResponseCountRef.current = count;
      return;
    }

    if (prev === 0 && count > 0) {
      addEvent("first_response", "1ere reponse", undefined, "positive");
    }
    if (prev < Math.floor(total / 2) && count >= Math.floor(total / 2) && total > 2) {
      addEvent("half_responded", "50% a repondu", `${count}/${total}`, "positive");
    }
    if (prev < total && count >= total) {
      addEvent("all_responded", "Tout le monde a repondu", `${total}/${total}`, "positive");
    }

    prevResponseCountRef.current = count;
  }, [responses.length, activeStudents.length, session.status, addEvent]);

  // Track broadcast messages
  const prevBroadcastRef = useRef<string | null>(null);
  const broadcastMsg = (session as unknown as Record<string, unknown>).broadcast_at as string | null | undefined;
  useEffect(() => {
    if (!broadcastMsg || broadcastMsg === prevBroadcastRef.current) return;
    prevBroadcastRef.current = broadcastMsg;
    const msg = (session as unknown as Record<string, unknown>).broadcast_message as string | null;
    if (msg && !msg.startsWith("__SCREEN_")) {
      addEvent("broadcast_sent", "Message envoye", msg.slice(0, 40), "info");
    }
  }, [broadcastMsg, session, addEvent]);

  // Track stuck detection
  const prevStuckCountRef = useRef(0);
  useEffect(() => {
    let stuckCount = 0;
    for (const level of stuckLevels.values()) {
      if (level === "stuck") stuckCount++;
    }
    if (stuckCount >= 3 && prevStuckCountRef.current < 3) {
      addEvent("stuck_detected", `${stuckCount} eleves bloques`, undefined, "warning");
    }
    prevStuckCountRef.current = stuckCount;
  }, [stuckLevels, addEvent]);

  return {
    session,
    responses,
    activeStudents,
    respondedStudentIds,
    stuckLevels,
    respondingOpenedAt,
    timelineEvents,
    sessionStartedAt,
    onSelectStudent,
  };
}

// ── Alert action handler ──
function useAlertActions() {
  const { updateSession, onSelectStudent } = useCockpitActions();
  const { activeStudents } = useCockpitData();

  return useCallback((actionId: string) => {
    switch (actionId) {
      case "broadcast":
        updateSession.mutate({
          broadcast_message: "N'oubliez pas de repondre a la question !",
          broadcast_at: new Date().toISOString(),
        });
        toast.success("Relance envoyee a la classe");
        break;
      case "hint":
        updateSession.mutate({
          broadcast_message: "Petit indice : relisez bien la question et prenez votre temps.",
          broadcast_at: new Date().toISOString(),
        });
        toast.success("Indice envoye a la classe");
        break;
      case "vote":
        updateSession.mutate({ status: "voting", timer_ends_at: null });
        toast.success("Vote lance");
        break;
      case "debate":
        toast("Lancez le debat a l'oral !", { icon: "🎭" });
        break;
      case "see-hand": {
        // Select the first student with hand raised
        const handStudent = activeStudents.find(s => s.hand_raised_at);
        if (handStudent) onSelectStudent(handStudent);
        break;
      }
      case "see-alerts":
        toast("Consultez la liste des eleves", { icon: "👀" });
        break;
    }
  }, [updateSession, activeStudents, onSelectStudent]);
}

export function CommandCockpit() {
  const sidebarData = useCommandSidebarData();
  const handleAlertAction = useAlertActions();

  // Dispatch student selection to FocusCockpit via custom event
  const handleSidebarSelectStudent = useCallback((student: { id: string }) => {
    window.dispatchEvent(new CustomEvent("pilot-select-student", { detail: { studentId: student.id } }));
  }, []);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* ── Left: Classe sidebar (visible ≥ lg / 1024px) ── */}
      <aside className="hidden lg:flex w-60 flex-col border-r border-gray-100 overflow-y-auto flex-shrink-0">
        <ClasseSidebar
          activeStudents={sidebarData.activeStudents}
          allStudents={sidebarData.session.students || []}
          respondedStudentIds={sidebarData.respondedStudentIds}
          stuckLevels={sidebarData.stuckLevels}
          sessionStatus={sidebarData.session.status}
          onSelectStudent={handleSidebarSelectStudent}
        />
      </aside>

      {/* ── Center: FocusCockpit (always visible) ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <FocusCockpit />
      </div>

      {/* ── Right: Assistant sidebar (visible ≥ xl / 1280px) ── */}
      <aside className="hidden xl:flex w-[260px] flex-col border-l border-gray-100 overflow-y-auto flex-shrink-0">
        <AssistantSidebar
          session={sidebarData.session}
          responses={sidebarData.responses}
          activeStudents={sidebarData.activeStudents}
          stuckLevels={sidebarData.stuckLevels}
          respondedStudentIds={sidebarData.respondedStudentIds}
          respondingOpenedAt={sidebarData.respondingOpenedAt}
          timelineEvents={sidebarData.timelineEvents}
          sessionStartedAt={sidebarData.sessionStartedAt}
          onAlertAction={handleAlertAction}
        />
      </aside>
    </div>
  );
}
