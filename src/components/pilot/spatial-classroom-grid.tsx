"use client";

import { useMemo } from "react";
import type { StudentState } from "@/components/pilot/pulse-ring";

// ═══════════════════════════════════════════════════════════════
// SPATIAL CLASSROOM GRID — Realistic desk-pair layout
// Adaptive columns: 2 cols (<13), 3 cols (13-20), 4 cols (21+)
// Each desk = 2 students, aisles between column groups
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
  // Determine number of desk columns based on student count
  const { columns, circleSize } = useMemo(() => {
    const n = studentStates.length;
    if (n <= 12) return { columns: 2, circleSize: 28 };
    if (n <= 20) return { columns: 3, circleSize: 26 };
    return { columns: 4, circleSize: 24 };
  }, [studentStates.length]);

  // Group students into desk pairs (2 per desk)
  const pairs = useMemo(() => {
    const result: SpatialStudentState[][] = [];
    for (let i = 0; i < studentStates.length; i += 2) {
      result.push(studentStates.slice(i, Math.min(i + 2, studentStates.length)));
    }
    return result;
  }, [studentStates]);

  // Distribute pairs across columns (round-robin)
  const deskColumns = useMemo(() => {
    const cols: SpatialStudentState[][][] = Array.from({ length: columns }, () => []);
    pairs.forEach((pair, idx) => {
      cols[idx % columns].push(pair);
    });
    return cols;
  }, [pairs, columns]);

  if (studentStates.length === 0) return null;

  return (
    <div className="px-2 pb-2.5">
      {/* Tableau (whiteboard) */}
      <div className="flex justify-center mb-2">
        <div
          className="h-[3px] rounded-full"
          style={{ width: "55%", background: "#D9CFC0" }}
        />
      </div>
      <div className="text-center mb-2.5">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#C4BDB2]">
          Tableau
        </span>
      </div>

      {/* Desk layout: columns separated by aisles */}
      <div className="flex justify-center" style={{ gap: columns >= 4 ? 8 : 12 }}>
        {deskColumns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col" style={{ gap: columns >= 4 ? 4 : 6 }}>
            {col.map((pair, rowIdx) => (
              <div key={rowIdx} className="flex" style={{ gap: 2 }}>
                {pair.map((s) => (
                  <StudentCircle
                    key={s.id}
                    student={s}
                    size={circleSize}
                    onClick={() => onStudentClick(s.id)}
                  />
                ))}
                {/* Empty seat if desk has only 1 student */}
                {pair.length === 1 && (
                  <div
                    className="rounded-full"
                    style={{
                      width: circleSize,
                      height: circleSize,
                      border: "1.5px dashed #DDD5C8",
                      opacity: 0.4,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
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

function StudentCircle({
  student,
  size,
  onClick,
}: {
  student: SpatialStudentState;
  size: number;
  onClick: () => void;
}) {
  const fill = STATE_FILL[student.state];
  const isOff = student.state === "disconnected";
  const fontSize = size >= 28 ? 11 : size >= 26 ? 10 : 9;

  return (
    <button
      onClick={onClick}
      title={`${student.display_name} — ${LEGEND.find((l) => l.state === student.state)?.label || "Absent"}`}
      className="relative flex items-center justify-center rounded-full cursor-pointer transition-all hover:scale-110 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[#6B8CFF] outline-none"
      style={{
        width: size,
        height: size,
        background: fill.bg,
        border: `2px solid ${fill.border}`,
        opacity: isOff ? 0.35 : 1,
      }}
    >
      <span className="leading-none select-none" style={{ fontSize }}>{student.avatar || "👤"}</span>
      {student.hand_raised_at && (
        <span className="absolute -top-1.5 -right-1.5 text-[9px] animate-bounce drop-shadow-sm">
          ✋
        </span>
      )}
    </button>
  );
}
