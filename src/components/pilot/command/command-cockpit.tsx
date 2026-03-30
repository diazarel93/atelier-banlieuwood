"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useCockpitData, useCockpitActions } from "@/components/pilot/cockpit-context";
import { useStuckDetection } from "@/hooks/use-stuck-detection";
import { STUCK_DETECTION_DELAY_MS } from "@/components/pilot/pilot-settings";
import { FocusCockpit } from "@/components/pilot/focus/focus-cockpit";
import { V6Sidebar } from "@/components/pilot/v6-sidebar";
import { createTimelineEvent, type TimelineEvent } from "@/components/pilot/session-timeline";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════
// COMMAND COCKPIT V6 — 2-column layout
//
// Desktop ≥1280px: main (scrollable) + right sidebar 360px
// Tablet <1280px: main only, sidebar as overlay
// Mobile <768px: main only, sidebar fullscreen
//
// Left sidebar (ClasseSidebar) is REMOVED — merged into V6Sidebar.
// ═══════════════════════════════════════════════════════════════

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
    [session.students],
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

  // Session started at
  const [sessionStartedAt] = useState<number>(() => Date.now());

  // Timeline events
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const trackedRef = useRef<Set<string>>(new Set());
  const prevStatusRef = useRef(session.status);
  const prevResponseCountRef = useRef(responses.length);

  const addEvent = useCallback(
    (
      type: Parameters<typeof createTimelineEvent>[0],
      label: string,
      detail?: string,
      severity?: TimelineEvent["severity"],
    ) => {
      const key = `${type}-${label}`;
      if (trackedRef.current.has(key)) return;
      trackedRef.current.add(key);
      setTimelineEvents((prev) => [...prev, createTimelineEvent(type, label, detail, severity)]);
    },
    [],
  );

  // Track status changes
  useEffect(() => {
    const prev = prevStatusRef.current;
    const curr = session.status;
    if (prev === curr) return;
    prevStatusRef.current = curr;

    if (curr === "responding" && prev !== "responding") {
      addEvent("question_launched", "Question lancee", undefined, "info");
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

export function CommandCockpit() {
  const sidebarData = useCommandSidebarData();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Dispatch student selection to FocusCockpit via custom event
  const handleSidebarSelectStudent = useCallback((student: { id: string }) => {
    window.dispatchEvent(new CustomEvent("pilot-select-student", { detail: { studentId: student.id } }));
  }, []);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* ── Main content (always visible, scrollable) ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <FocusCockpit />
      </div>

      {/* ── Right sidebar V6 (desktop: inline 360px, tablet: overlay) ── */}
      {sidebarOpen && (
        <aside className="hidden lg:flex w-[360px] flex-col border-l border-[#2a2a50] overflow-y-auto flex-shrink-0">
          <V6Sidebar
            activeStudents={sidebarData.activeStudents}
            allStudents={sidebarData.session.students || []}
            respondedStudentIds={sidebarData.respondedStudentIds}
            stuckLevels={sidebarData.stuckLevels}
            sessionStatus={sidebarData.session.status}
            onSelectStudent={handleSidebarSelectStudent}
            responses={sidebarData.responses}
            timelineEvents={sidebarData.timelineEvents}
            sessionStartedAt={sidebarData.sessionStartedAt}
          />
        </aside>
      )}

      {/* ── Tablet/mobile sidebar overlay ── */}
      {sidebarOpen && (
        <aside className="lg:hidden fixed top-0 right-0 bottom-0 z-50 w-[340px] max-w-[90vw] bg-[#0c0c18] shadow-[-4px_0_24px_rgba(0,0,0,0.4)] flex flex-col overflow-y-auto">
          {/* Close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a1a35] border border-[#2a2a50] text-[#94a3b8] hover:text-[#f0f0f8] z-10 cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <V6Sidebar
            activeStudents={sidebarData.activeStudents}
            allStudents={sidebarData.session.students || []}
            respondedStudentIds={sidebarData.respondedStudentIds}
            stuckLevels={sidebarData.stuckLevels}
            sessionStatus={sidebarData.session.status}
            onSelectStudent={handleSidebarSelectStudent}
            responses={sidebarData.responses}
            timelineEvents={sidebarData.timelineEvents}
            sessionStartedAt={sidebarData.sessionStartedAt}
          />
        </aside>
      )}

      {/* ── FAB: reopen sidebar on tablet (visible only when sidebar closed) ── */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-20 right-4 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-[#8b5cf6] text-white shadow-lg hover:bg-[#7c3aed] active:scale-95 transition-all cursor-pointer"
          aria-label="Ouvrir le panneau élèves"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </button>
      )}
    </div>
  );
}
