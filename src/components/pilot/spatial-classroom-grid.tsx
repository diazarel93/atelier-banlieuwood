"use client";

import type { StudentState } from "@/components/pilot/pulse-ring";

// ═══════════════════════════════════════════════════════════════
// SPATIAL CLASSROOM GRID — Realistic desk-pair layout
// 2 columns of desk pairs + central aisle, 28px circles
// ═══════════════════════════════════════════════════════════════

interface SpatialStudentState {
  id: string;
  state: StudentState;
  display_name: string;
  avatar: string;
  hand_raised_at?: string | null;
}

interface SpatialClassroomGridProps {
  studentStates: SpatialStudentState[];
  onStudentClick: (id: string) => void;
}

const STATE_FILL: Record<StudentState, { bg: string; border: string }> = {
  responded: { bg: "#4CAF50", border: "#388E3C" },
  active: { bg: "#F2C94C", border: "#E0B73B" },
  stuck: { bg: "#EB5757", border: "#D32F2F" },
  disconnected: { bg: "#C4BDB2", border: "#ADA69B" },
};

const LEGEND: { state: StudentState; label: string; color: string }[] = [
  { state: "responded", label: "Repondu", color: "#4CAF50" },
  { state: "active", label: "Reflexion", color: "#F2C94C" },
  { state: "stuck", label: "Bloque", color: "#EB5757" },
  { state: "disconnected", label: "Absent", color: "#C4BDB2" },
];

export function SpatialClassroomGrid({ studentStates, onStudentClick }: SpatialClassroomGridProps) {
  // Group students into desk pairs (2 per desk)
  const pairs: SpatialStudentState[][] = [];
  for (let i = 0; i < studentStates.length; i += 2) {
    pairs.push(studentStates.slice(i, Math.min(i + 2, studentStates.length)));
  }

  // Split pairs into left column and right column
  const leftPairs: SpatialStudentState[][] = [];
  const rightPairs: SpatialStudentState[][] = [];
  pairs.forEach((pair, idx) => {
    if (idx % 2 === 0) leftPairs.push(pair);
    else rightPairs.push(pair);
  });

  return (
    <div className="px-2.5 pb-2.5">
      {/* Tableau (whiteboard) */}
      <div className="flex justify-center mb-2.5">
        <div
          className="h-[3px] rounded-full"
          style={{ width: "60%", background: "#D9CFC0" }}
        />
      </div>
      <div className="text-center mb-3">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#C4BDB2]">
          Tableau
        </span>
      </div>

      {/* Desk layout: left column | aisle | right column */}
      <div className="flex gap-4 justify-center">
        {/* Left column */}
        <div className="space-y-2">
          {leftPairs.map((pair, rowIdx) => (
            <div key={`l-${rowIdx}`} className="flex gap-1">
              {pair.map((s) => (
                <StudentCircle key={s.id} student={s} onClick={() => onStudentClick(s.id)} />
              ))}
              {/* If pair has only 1, add empty seat */}
              {pair.length === 1 && <div className="w-7 h-7" />}
            </div>
          ))}
        </div>

        {/* Central aisle */}
        <div className="w-3 flex-shrink-0" />

        {/* Right column */}
        <div className="space-y-2">
          {rightPairs.map((pair, rowIdx) => (
            <div key={`r-${rowIdx}`} className="flex gap-1">
              {pair.map((s) => (
                <StudentCircle key={s.id} student={s} onClick={() => onStudentClick(s.id)} />
              ))}
              {pair.length === 1 && <div className="w-7 h-7" />}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3">
        {LEGEND.map((item) => (
          <div key={item.state} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: item.color }}
            />
            <span className="text-[9px] font-semibold text-[#B0A99E]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentCircle({ student, onClick }: { student: SpatialStudentState; onClick: () => void }) {
  const fill = STATE_FILL[student.state];
  const isOff = student.state === "disconnected";

  return (
    <button
      onClick={onClick}
      title={`${student.display_name} — ${LEGEND.find((l) => l.state === student.state)?.label || "Absent"}`}
      className="relative flex items-center justify-center rounded-full cursor-pointer transition-all hover:scale-110 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[#6B8CFF] outline-none"
      style={{
        width: 28,
        height: 28,
        background: fill.bg,
        border: `2px solid ${fill.border}`,
        opacity: isOff ? 0.35 : 1,
      }}
    >
      <span className="text-[11px] leading-none select-none">{student.avatar || "👤"}</span>
      {student.hand_raised_at && (
        <span className="absolute -top-1.5 -right-1.5 text-[9px] animate-bounce drop-shadow-sm">
          ✋
        </span>
      )}
    </button>
  );
}
