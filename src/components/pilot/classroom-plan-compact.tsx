"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import type { StudentState } from "./pulse-ring";

// ═══════════════════════════════════════════════════════════════
// CLASSROOM PLAN COMPACT — Vue aérienne d'une salle de classe
// Rangées de pupitres 2 places, allée centrale, bureau prof
// ═══════════════════════════════════════════════════════════════

interface PlanStudent {
  id: string;
  state: StudentState;
  display_name: string;
  avatar: string;
  hand_raised_at?: string | null;
}

interface ClassroomPlanCompactProps {
  students: PlanStudent[];
  onStudentClick: (id: string) => void;
}

const STATE_COLORS: Record<StudentState, { bg: string; border: string; dot: string }> = {
  responded: { bg: "#E8F5E9", border: "#81C784", dot: "#4CAF50" },
  active: { bg: "#FFF8E1", border: "#FFD54F", dot: "#FFC107" },
  stuck: { bg: "#FFEBEE", border: "#E57373", dot: "#F44336" },
  disconnected: { bg: "#F5F5F5", border: "#E0E0E0", dot: "#BDBDBD" },
};

function SeatChip({ student, onClick }: { student: PlanStudent; onClick: () => void }) {
  const c = STATE_COLORS[student.state];
  return (
    <button
      onClick={onClick}
      title={student.display_name}
      className="relative flex items-center gap-1.5 rounded-lg cursor-pointer transition-all hover:scale-105 outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      style={{
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        padding: "4px 8px",
        minWidth: 0,
        opacity: student.state === "disconnected" ? 0.4 : 1,
      }}
    >
      <span className="text-sm leading-none shrink-0">{student.avatar}</span>
      <span className="text-[10px] font-semibold text-gray-700 truncate max-w-[44px] leading-tight">
        {student.display_name.split(" ")[0]}
      </span>
      {student.state === "responded" && (
        <span
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
          style={{ background: c.dot }}
        >
          <svg
            width="7"
            height="7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
        </span>
      )}
      {student.state === "stuck" && (
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-black text-white"
          style={{ background: c.dot }}
        >
          !
        </motion.span>
      )}
      {student.hand_raised_at && (
        <motion.span
          animate={{ y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="absolute -top-2 -right-2 text-body-xs"
        >
          ✋
        </motion.span>
      )}
    </button>
  );
}

function EmptySeat() {
  return (
    <div
      className="rounded-lg"
      style={{
        background: "#FAFAF9",
        border: "1px dashed #E0E0E0",
        padding: "4px 8px",
        minWidth: 0,
        minHeight: 28,
        width: "100%",
      }}
    />
  );
}

export function ClassroomPlanCompact({ students, onStudentClick }: ClassroomPlanCompactProps) {
  // Group students into desk pairs (2 per desk)
  const desks = useMemo(() => {
    const pairs: [PlanStudent, PlanStudent | null][] = [];
    for (let i = 0; i < students.length; i += 2) {
      pairs.push([students[i], students[i + 1] || null]);
    }
    return pairs;
  }, [students]);

  // Group desks into rows (3 desks per row = 6 students)
  const desksPerRow = 3;
  const rows = useMemo(() => {
    const r: [PlanStudent, PlanStudent | null][][] = [];
    for (let i = 0; i < desks.length; i += desksPerRow) {
      r.push(desks.slice(i, i + desksPerRow));
    }
    return r;
  }, [desks]);

  // Stats
  const stats = useMemo(() => {
    let responded = 0,
      stuck = 0;
    for (const s of students) {
      if (s.state === "responded") responded++;
      else if (s.state === "stuck") stuck++;
    }
    return { responded, stuck };
  }, [students]);

  return (
    <div className="space-y-3">
      {/* Rows of desks — front row (closest to board) at bottom */}
      <div className="space-y-2">
        {[...rows].reverse().map((row, revIdx) => {
          const rowIdx = rows.length - 1 - revIdx;
          return (
            <div key={rowIdx} className="flex items-center gap-1">
              {/* Row label */}
              <span className="w-4 text-[9px] font-bold text-gray-300 text-right shrink-0 tabular-nums select-none">
                {rowIdx + 1}
              </span>
              {/* Desks */}
              <div className="flex-1 flex justify-center gap-2">
                {row.map(([left, right], deskIdx) => (
                  <div
                    key={`${rowIdx}-${deskIdx}`}
                    className="flex gap-0.5 rounded-xl bg-gray-50 border border-gray-200 p-1"
                  >
                    <SeatChip student={left} onClick={() => onStudentClick(left.id)} />
                    {right ? <SeatChip student={right} onClick={() => onStudentClick(right.id)} /> : <EmptySeat />}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Teacher desk — at bottom (prof's point of view) */}
      <div className="flex justify-center">
        <div className="px-6 py-1 rounded-lg bg-gray-100 border border-dashed border-gray-300">
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Tableau</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-1">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ background: STATE_COLORS.responded.dot }} />
          <span className="text-[9px] text-gray-400 font-medium">Repondu ({stats.responded})</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ background: STATE_COLORS.active.dot }} />
          <span className="text-[9px] text-gray-400 font-medium">Reflexion</span>
        </div>
        {stats.stuck > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: STATE_COLORS.stuck.dot }} />
            <span className="text-[9px] text-gray-400 font-medium">Bloque ({stats.stuck})</span>
          </div>
        )}
      </div>
    </div>
  );
}
