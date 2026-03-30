"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { StatRing } from "@/components/v2/stat-ring";
import type { Student } from "@/hooks/use-pilot-session";
import type { StuckLevel } from "@/hooks/use-stuck-detection";

// ═══════════════════════════════════════════════════════════════
// CLASSE SIDEBAR — Left panel: quick class scan
// Donut progress + student list sorted by status
// ═══════════════════════════════════════════════════════════════

const STUCK_DOT_COLORS: Record<StuckLevel, string> = {
  ok: "#D1D5DB", // gray-300
  nudge: "#FBBF24", // amber-400
  slow: "#F97316", // orange-500
  stuck: "#EF4444", // red-500
};

type StudentFilter = "all" | "responded" | "waiting" | "blocked" | "hands";

interface ClasseSidebarProps {
  activeStudents: Student[];
  allStudents: Student[];
  respondedStudentIds: Set<string>;
  stuckLevels: Map<string, StuckLevel>;
  sessionStatus: string;
  onSelectStudent: (student: Student) => void;
  onNudgeStudent?: (studentId: string) => void;
  onEncourageStudent?: (studentId: string) => void;
}

export function ClasseSidebar({
  activeStudents,
  allStudents,
  respondedStudentIds,
  stuckLevels,
  sessionStatus,
  onSelectStudent,
  onNudgeStudent,
  onEncourageStudent,
}: ClasseSidebarProps) {
  const [filter, setFilter] = useState<StudentFilter>("all");
  const [search, setSearch] = useState("");
  const respondedCount = useMemo(() => {
    return activeStudents.filter((s) => respondedStudentIds.has(s.id)).length;
  }, [activeStudents, respondedStudentIds]);

  const pct = activeStudents.length > 0 ? Math.round((respondedCount / activeStudents.length) * 100) : 0;

  // Sort: stuck first, then not responded, then responded
  const sortedStudents = useMemo(() => {
    return [...activeStudents].sort((a, b) => {
      const aResponded = respondedStudentIds.has(a.id);
      const bResponded = respondedStudentIds.has(b.id);
      const aLevel = stuckLevels.get(a.id) || "ok";
      const bLevel = stuckLevels.get(b.id) || "ok";

      // Stuck/slow/nudge at top (priority order)
      const priority: Record<StuckLevel, number> = { stuck: 0, slow: 1, nudge: 2, ok: 3 };
      if (!aResponded && !bResponded) return priority[aLevel] - priority[bLevel];
      if (aResponded && !bResponded) return 1;
      if (!aResponded && bResponded) return -1;
      return 0;
    });
  }, [activeStudents, respondedStudentIds, stuckLevels]);

  // Legend counts
  const counts = useMemo(() => {
    let responded = 0,
      thinking = 0,
      blocked = 0,
      absent = 0;
    const _allIds = new Set(allStudents.map((s) => s.id));
    const activeIds = new Set(activeStudents.map((s) => s.id));

    for (const s of activeStudents) {
      if (respondedStudentIds.has(s.id)) responded++;
      else {
        const level = stuckLevels.get(s.id) || "ok";
        if (level === "stuck" || level === "slow") blocked++;
        else thinking++;
      }
    }
    absent = allStudents.filter((s) => s.is_active && !activeIds.has(s.id)).length;

    return { responded, thinking, blocked, absent };
  }, [activeStudents, allStudents, respondedStudentIds, stuckLevels]);

  const _isResponding = sessionStatus === "responding";

  return (
    <div className="flex flex-col h-full bg-[#0c0c18]">
      {/* ── Header ── */}
      <div className="px-3 py-3 border-b border-[#2a2a50] flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Classe</h3>
        {counts.blocked > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-900/20 text-[10px] font-bold text-red-400 border border-red-500/30"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-900/200 animate-pulse" />
            {counts.blocked}
          </motion.span>
        )}
      </div>

      {/* ── Donut ── */}
      <div className="px-3 py-4 flex flex-col items-center border-b border-[#2a2a50]">
        <StatRing
          value={pct}
          label={`${respondedCount}/${activeStudents.length} reponses`}
          color={pct >= 100 ? "#22C55E" : pct >= 50 ? "#F59E0B" : "#6B8CFF"}
          size={72}
          strokeWidth={5}
        />

        {/* Legend dots */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 w-full">
          <LegendDot color="#22C55E" label="Repondu" count={counts.responded} />
          <LegendDot color="#D1D5DB" label="Reflexion" count={counts.thinking} />
          <LegendDot color="#EF4444" label="Bloque" count={counts.blocked} />
          <LegendDot color="#9CA3AF" label="Absent" count={counts.absent} dashed />
        </div>
      </div>

      {/* ── Filter + Search ── */}
      <div className="px-3 py-2 border-b border-[#2a2a50] space-y-2">
        <div className="relative">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="absolute left-2 top-[7px] text-[#64748b]"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Chercher..."
            className="w-full pl-7 pr-2 py-1.5 text-[11px] rounded-lg border border-[#2a2a50] bg-[#1a1a35] text-[#c4b5fd] outline-none focus:border-blue-300"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: "all" as const, label: `Tous (${activeStudents.length})` },
            { id: "responded" as const, label: `Repondu (${counts.responded})` },
            { id: "waiting" as const, label: `Attente (${counts.thinking})` },
            { id: "blocked" as const, label: `Bloques (${counts.blocked})` },
            { id: "hands" as const, label: `Mains` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-[9px] font-semibold px-2 py-1 rounded-md whitespace-nowrap cursor-pointer transition-colors border ${
                filter === f.id
                  ? "bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/30"
                  : "bg-transparent text-[#64748b] border-transparent hover:text-[#94a3b8]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Student list ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-1">
          {sortedStudents
            .filter((s) => {
              if (search) {
                const q = search.toLowerCase();
                if (!s.display_name.toLowerCase().includes(q)) return false;
              }
              if (filter === "responded") return respondedStudentIds.has(s.id);
              if (filter === "waiting")
                return !respondedStudentIds.has(s.id) && (stuckLevels.get(s.id) || "ok") === "ok";
              if (filter === "blocked") {
                const level = stuckLevels.get(s.id) || "ok";
                return !respondedStudentIds.has(s.id) && (level === "stuck" || level === "slow");
              }
              if (filter === "hands") return !!s.hand_raised_at;
              return true;
            })
            .map((student) => {
              const responded = respondedStudentIds.has(student.id);
              const level = stuckLevels.get(student.id) || "ok";
              const dotColor = responded ? "#22C55E" : STUCK_DOT_COLORS[level];

              return (
                <button
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#1a1a35] transition-colors cursor-pointer text-left"
                >
                  {/* Avatar */}
                  <span className="text-base flex-shrink-0">{student.avatar || "👤"}</span>

                  {/* Name */}
                  <span className="text-[12px] font-medium text-[#c4b5fd] truncate flex-1">{student.display_name}</span>

                  {/* Hand raised indicator */}
                  {student.hand_raised_at && (
                    <motion.span
                      className="text-sm flex-shrink-0"
                      animate={{ y: [0, -2, 0], rotate: [0, 15, -15, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                      title="Main levée"
                    >
                      ✋
                    </motion.span>
                  )}

                  {/* Status dot — animated */}
                  <motion.span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: dotColor }}
                    animate={
                      !responded && (level === "stuck" || level === "slow")
                        ? { scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }
                        : responded
                          ? { scale: [0, 1.2, 1] }
                          : {}
                    }
                    transition={
                      !responded && (level === "stuck" || level === "slow")
                        ? { repeat: Infinity, duration: 2, ease: "easeInOut" }
                        : { duration: 0.3, type: "spring" }
                    }
                  />

                  {/* Checkmark if responded */}
                  {responded && (
                    <motion.svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="3"
                      className="flex-shrink-0"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    >
                      <path d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}

                  {/* Quick actions */}
                  {!responded && onNudgeStudent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNudgeStudent(student.id);
                      }}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-orange-900/20 text-orange-400 border border-orange-500/30 hover:bg-orange-100 cursor-pointer flex-shrink-0 transition-colors"
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
                      className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/20 text-emerald-400 border border-emerald-500/30 hover:bg-green-100 cursor-pointer flex-shrink-0 transition-colors"
                      title="Encourager"
                    >
                      👏
                    </button>
                  )}
                </button>
              );
            })}

          {activeStudents.length === 0 && (
            <div className="text-center py-6 px-3 space-y-2">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="text-2xl"
              >
                📡
              </motion.div>
              <p className="text-[11px] text-[#64748b]">En attente des eleves...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Legend dot component ──
function LegendDot({ color, label, count, dashed }: { color: string; label: string; count: number; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{
          background: dashed ? "transparent" : color,
          border: dashed ? `1.5px dashed ${color}` : "none",
        }}
      />
      <span className="text-[10px] text-[#94a3b8] truncate">{label}</span>
      <span className="text-[10px] font-bold text-[#94a3b8] tabular-nums ml-auto">{count}</span>
    </div>
  );
}
