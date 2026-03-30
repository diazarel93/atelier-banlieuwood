"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { SessionTimeline, type TimelineEvent } from "@/components/pilot/session-timeline";
import type { Student, Response } from "@/hooks/use-pilot-session";
import type { StuckLevel } from "@/hooks/use-stuck-detection";

// ═══════════════════════════════════════════════════════════════
// V6 SIDEBAR — Right panel with 4 tabs
// Merges ClasseSidebar + AssistantSidebar into one tabbed panel
// ═══════════════════════════════════════════════════════════════

type SidebarTab = "students" | "responses" | "timeline" | "notes";

interface V6SidebarProps {
  // Students
  activeStudents: Student[];
  allStudents: Student[];
  respondedStudentIds: Set<string>;
  stuckLevels: Map<string, StuckLevel>;
  sessionStatus: string;
  onSelectStudent: (student: Student) => void;
  onNudgeStudent?: (studentId: string) => void;
  onEncourageStudent?: (studentId: string) => void;
  // Responses
  responses: Response[];
  // Timeline
  timelineEvents: TimelineEvent[];
  sessionStartedAt: number;
  // Notes
  sessionNotes?: string;
  onNotesChange?: (notes: string) => void;
}

const STUCK_DOT_COLORS: Record<StuckLevel, string> = {
  ok: "#64748b",
  nudge: "#FBBF24",
  slow: "#F97316",
  stuck: "#EF4444",
};

type StudentFilter = "all" | "active" | "idle" | "off" | "responding";

const NOTE_TAGS = [
  { id: "obs", label: "Observation", color: "#8b5cf6" },
  { id: "rev", label: "A revoir", color: "#f87171" },
  { id: "idee", label: "Idee", color: "#34d399" },
];

export function V6Sidebar({
  activeStudents,
  allStudents,
  respondedStudentIds,
  stuckLevels,
  sessionStatus,
  onSelectStudent,
  onNudgeStudent,
  onEncourageStudent,
  responses,
  timelineEvents,
  sessionStartedAt,
  sessionNotes = "",
  onNotesChange,
}: V6SidebarProps) {
  const [tab, setTab] = useState<SidebarTab>("students");
  const [studentFilter, setStudentFilter] = useState<StudentFilter>("all");
  const [studentSearch, setStudentSearch] = useState("");
  const [responseFilter, setResponseFilter] = useState<"all" | "pending" | "validated" | "flagged">("all");
  const [notes, setNotes] = useState(sessionNotes);

  // ── Student counts ──
  const counts = useMemo(() => {
    const activeIds = new Set(activeStudents.map((s) => s.id));
    let active = 0;
    let idle = 0;
    let off = 0;
    let responding = 0;

    for (const s of allStudents) {
      if (!activeIds.has(s.id)) {
        off++;
      } else if (respondedStudentIds.has(s.id)) {
        responding++;
        active++;
      } else {
        const level = stuckLevels.get(s.id) || "ok";
        if (level === "stuck" || level === "slow") idle++;
        else active++;
      }
    }
    return { all: allStudents.length, active, idle, off, responding };
  }, [allStudents, activeStudents, respondedStudentIds, stuckLevels]);

  // ── Filtered students ──
  const filteredStudents = useMemo(() => {
    const activeIds = new Set(activeStudents.map((s) => s.id));
    let base = [...allStudents];

    if (studentFilter === "active") base = base.filter((s) => activeIds.has(s.id));
    if (studentFilter === "idle")
      base = base.filter((s) => {
        const level = stuckLevels.get(s.id) || "ok";
        return activeIds.has(s.id) && !respondedStudentIds.has(s.id) && (level === "stuck" || level === "slow");
      });
    if (studentFilter === "off") base = base.filter((s) => !activeIds.has(s.id));
    if (studentFilter === "responding") base = base.filter((s) => respondedStudentIds.has(s.id));

    if (studentSearch) {
      const q = studentSearch.toLowerCase();
      base = base.filter((s) => s.display_name.toLowerCase().includes(q));
    }

    // Sort: stuck first, then waiting, then responded
    return base.sort((a, b) => {
      const aResp = respondedStudentIds.has(a.id);
      const bResp = respondedStudentIds.has(b.id);
      if (aResp && !bResp) return 1;
      if (!aResp && bResp) return -1;
      const priority: Record<StuckLevel, number> = { stuck: 0, slow: 1, nudge: 2, ok: 3 };
      return (priority[stuckLevels.get(a.id) || "ok"] || 3) - (priority[stuckLevels.get(b.id) || "ok"] || 3);
    });
  }, [allStudents, activeStudents, studentFilter, studentSearch, respondedStudentIds, stuckLevels]);

  // ── Filtered responses ──
  const filteredResponses = useMemo(() => {
    if (responseFilter === "pending") return responses.filter((r) => !r.is_hidden && !r.is_vote_option);
    if (responseFilter === "validated") return responses.filter((r) => r.is_vote_option);
    if (responseFilter === "flagged") return responses.filter((r) => r.is_hidden);
    return responses;
  }, [responses, responseFilter]);

  const tabs: { id: SidebarTab; label: string; count?: number; alertCount?: number }[] = [
    { id: "students", label: "Eleves", count: counts.all, alertCount: counts.off > 0 ? counts.off : undefined },
    { id: "responses", label: "Reponses", count: responses.length },
    { id: "timeline", label: "Timeline" },
    { id: "notes", label: "Notes" },
  ];

  return (
    <div className="flex flex-col h-full bg-bw-cockpit-canvas">
      {/* ── Tab bar ── */}
      <div className="flex items-center border-b border-bw-cockpit-border px-1 pt-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 py-3 min-h-[44px] text-[11px] font-semibold transition-colors cursor-pointer border-b-2 focus-visible:ring-2 focus-visible:ring-bw-violet-main focus-visible:ring-offset-2 ${
              tab === t.id
                ? "text-bw-violet-main border-bw-violet-main"
                : "text-[#94a3b8] border-transparent hover:text-[#94a3b8]"
            }`}
          >
            {t.label}
            {typeof t.count === "number" && (
              <span
                className={`text-[11px] font-bold px-2 py-1 rounded-full ${
                  tab === t.id ? "bg-bw-violet-main/15 text-bw-violet-main" : "bg-bw-cockpit-surface text-[#94a3b8]"
                }`}
              >
                {t.count}
              </span>
            )}
            {typeof t.alertCount === "number" && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                {t.alertCount} off
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-y-auto">
        {/* ═══ STUDENTS TAB ═══ */}
        {tab === "students" && (
          <div className="flex flex-col h-full">
            {/* Search */}
            <div className="px-3 pt-3 pb-2">
              <div className="relative">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="absolute left-3 top-[8px] text-[#94a3b8]"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Chercher un eleve..."
                  className="w-full pl-8 pr-3 py-2 text-[11px] rounded-lg border border-bw-cockpit-border bg-bw-cockpit-surface text-[#c4b5fd] outline-none focus:border-bw-violet-main/40 placeholder:text-[#94a3b8]"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-1 px-3 pb-2 overflow-x-auto">
              {(
                [
                  { id: "all" as const, label: `Tous (${counts.all})` },
                  { id: "active" as const, label: `Actifs (${counts.active})` },
                  { id: "idle" as const, label: `Idle (${counts.idle})` },
                  { id: "off" as const, label: `Off (${counts.off})` },
                  { id: "responding" as const, label: `Repondu (${counts.responding})` },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStudentFilter(f.id)}
                  className={`text-[11px] font-semibold px-3 py-2 min-h-[44px] rounded-md whitespace-nowrap cursor-pointer transition-colors border focus-visible:ring-2 focus-visible:ring-bw-violet-main focus-visible:ring-offset-2 ${
                    studentFilter === f.id
                      ? "bg-bw-violet-main/10 text-bw-violet-main border-bw-violet-main/30"
                      : "bg-transparent text-[#94a3b8] border-transparent hover:text-[#94a3b8]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Student list */}
            <div className="flex-1 overflow-y-auto">
              {filteredStudents.map((student) => {
                const activeIds = new Set(activeStudents.map((s) => s.id));
                const isOnline = activeIds.has(student.id);
                const responded = respondedStudentIds.has(student.id);
                const level = stuckLevels.get(student.id) || "ok";
                const dotColor = !isOnline ? "#475569" : responded ? "#22C55E" : STUCK_DOT_COLORS[level];

                return (
                  <button
                    key={student.id}
                    onClick={() => onSelectStudent(student)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-bw-cockpit-surface transition-colors cursor-pointer text-left border-b border-bw-cockpit-border/50 focus-visible:ring-2 focus-visible:ring-bw-violet-main focus-visible:ring-offset-2"
                  >
                    {/* Avatar */}
                    <span className="text-lg flex-shrink-0">{student.avatar || "👤"}</span>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-bw-cockpit-text truncate">
                          {student.display_name}
                        </span>
                        {student.hand_raised_at && (
                          <motion.span
                            className="text-xs flex-shrink-0"
                            animate={{ y: [0, -2, 0] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                          >
                            ✋
                          </motion.span>
                        )}
                      </div>
                      {/* Status label — doctrine: no XP/scores/levels */}
                      <span
                        className={`text-[11px] mt-0.5 ${
                          !isOnline ? "text-red-400 font-semibold uppercase" : "text-[#94a3b8]"
                        }`}
                      >
                        {isOnline ? (responded ? "a repondu" : "en ligne") : "HORS LIGNE"}
                      </span>
                    </div>

                    {/* Status dot */}
                    <motion.span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: dotColor }}
                      animate={
                        !responded && (level === "stuck" || level === "slow")
                          ? { scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }
                          : {}
                      }
                      transition={
                        !responded && (level === "stuck" || level === "slow") ? { repeat: Infinity, duration: 2 } : {}
                      }
                    />

                    {/* Quick actions */}
                    {isOnline && !responded && onNudgeStudent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNudgeStudent(student.id);
                        }}
                        className="text-[11px] px-3 py-2 min-h-[44px] rounded bg-orange-900/20 text-orange-400 border border-orange-500/30 hover:bg-orange-900/40 cursor-pointer flex-shrink-0 focus-visible:ring-2 focus-visible:ring-bw-violet-main focus-visible:ring-offset-2"
                        title="Relancer"
                      >
                        🔔
                      </button>
                    )}
                    {responded && onEncourageStudent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEncourageStudent(student.id);
                        }}
                        className="text-[11px] px-3 py-2 min-h-[44px] rounded bg-emerald-900/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/40 cursor-pointer flex-shrink-0 focus-visible:ring-2 focus-visible:ring-bw-violet-main focus-visible:ring-offset-2"
                        title="Encourager"
                      >
                        👏
                      </button>
                    )}
                  </button>
                );
              })}

              {filteredStudents.length === 0 && (
                <div className="text-center py-8 px-3">
                  <span className="text-2xl">📡</span>
                  <p className="text-[11px] text-[#94a3b8] mt-2">Aucun eleve dans ce filtre</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ RESPONSES TAB ═══ */}
        {tab === "responses" && (
          <div className="flex flex-col h-full">
            {/* Filters */}
            <div className="flex gap-1 px-3 py-2 border-b border-bw-cockpit-border">
              {(
                [
                  { id: "all" as const, label: "Toutes" },
                  { id: "pending" as const, label: "En attente" },
                  { id: "validated" as const, label: "Validees" },
                  { id: "flagged" as const, label: "Signalees" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setResponseFilter(f.id)}
                  className={`text-[11px] font-semibold px-3 py-2 min-h-[44px] rounded-md whitespace-nowrap cursor-pointer transition-colors border focus-visible:ring-2 focus-visible:ring-bw-violet-main focus-visible:ring-offset-2 ${
                    responseFilter === f.id
                      ? "bg-bw-violet-main/10 text-bw-violet-main border-bw-violet-main/30"
                      : "bg-transparent text-[#94a3b8] border-transparent hover:text-[#94a3b8]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Response list */}
            <div className="flex-1 overflow-y-auto">
              {filteredResponses.map((r) => (
                <div
                  key={r.id}
                  className="px-3 py-3 border-b border-bw-cockpit-border/50 hover:bg-bw-cockpit-surface transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{r.students?.avatar || "👤"}</span>
                    <span className="text-[11px] font-bold text-bw-cockpit-text">
                      {r.students?.display_name || "Eleve"}
                    </span>
                    <span className="text-[11px] text-[#94a3b8] ml-auto">
                      {new Date(r.submitted_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94a3b8] leading-relaxed line-clamp-2">{r.text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {r.is_vote_option && (
                      <span className="text-[11px] font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        VALIDE
                      </span>
                    )}
                    {r.is_highlighted && (
                      <span className="text-[11px] font-bold px-2 py-1 rounded bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20">
                        ⭐
                      </span>
                    )}
                    {r.is_hidden && (
                      <span className="text-[11px] font-bold px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                        MASQUE
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {filteredResponses.length === 0 && (
                <div className="text-center py-8 px-3">
                  <span className="text-2xl">📝</span>
                  <p className="text-[11px] text-[#94a3b8] mt-2">Aucune reponse</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ TIMELINE TAB ═══ */}
        {tab === "timeline" && (
          <div className="px-3 py-3">
            <SessionTimeline events={timelineEvents} sessionStartedAt={sessionStartedAt} />
          </div>
        )}

        {/* ═══ NOTES TAB ═══ */}
        {tab === "notes" && (
          <div className="px-3 py-3 flex flex-col gap-3">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {NOTE_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    const tagText = `[${tag.label}] `;
                    const updated = notes + (notes ? "\n" : "") + tagText;
                    setNotes(updated);
                    onNotesChange?.(updated);
                  }}
                  className="text-[11px] font-semibold px-3 py-1 min-h-[44px] rounded-lg cursor-pointer transition-colors border focus-visible:ring-2 focus-visible:ring-bw-violet-main focus-visible:ring-offset-2"
                  style={{
                    background: `${tag.color}15`,
                    borderColor: `${tag.color}30`,
                    color: tag.color,
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* Notes textarea */}
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                onNotesChange?.(e.target.value);
              }}
              placeholder="Notes de session..."
              className="w-full min-h-[200px] p-3 rounded-xl border border-bw-cockpit-border bg-bw-cockpit-surface text-[12px] text-[#94a3b8] font-sans resize-y outline-none focus:border-bw-violet-main/40 placeholder:text-[#94a3b8]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
