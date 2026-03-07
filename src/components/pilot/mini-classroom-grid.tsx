"use client";

import type { StudentState } from "@/components/pilot/pulse-ring";

// ═══════════════════════════════════════════════════════════════
// MINI CLASSROOM GRID — Compact circle grid for sidebar plan de classe
// Filled colored circles with emoji avatar + state legend + name callouts
// ═══════════════════════════════════════════════════════════════

interface MiniStudentState {
  id: string;
  state: StudentState;
  display_name: string;
  avatar: string;
  hand_raised_at?: string | null;
}

interface MiniClassroomGridProps {
  studentStates: MiniStudentState[];
  onStudentClick: (id: string) => void;
}

const STATE_FILL: Record<StudentState, { bg: string; border: string }> = {
  responded: { bg: "rgba(76,175,80,0.25)", border: "rgba(76,175,80,0.5)" },
  active: { bg: "rgba(242,201,76,0.25)", border: "rgba(242,201,76,0.5)" },
  stuck: { bg: "rgba(235,87,87,0.25)", border: "rgba(235,87,87,0.5)" },
  disconnected: { bg: "rgba(196,189,178,0.2)", border: "rgba(196,189,178,0.35)" },
};

const STATE_DOT: Record<StudentState, string> = {
  responded: "#4CAF50",
  active: "#F2C94C",
  stuck: "#EB5757",
  disconnected: "#C4BDB2",
};

const LEGEND: { state: StudentState; label: string }[] = [
  { state: "responded", label: "Relance" },
  { state: "active", label: "Reflexion" },
  { state: "stuck", label: "Bloque" },
];

export function MiniClassroomGrid({ studentStates, onStudentClick }: MiniClassroomGridProps) {
  // Students needing attention (stuck or hand raised)
  const attentionStudents = studentStates.filter(
    (s) => s.state === "stuck" || s.hand_raised_at
  );

  return (
    <div className="px-2 pb-2.5">
      {/* Grid of filled circles */}
      <div
        className="gap-1.5"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))",
        }}
      >
        {studentStates.map((s) => {
          const fill = STATE_FILL[s.state];
          const isOff = s.state === "disconnected";
          return (
            <button
              key={s.id}
              onClick={() => onStudentClick(s.id)}
              title={`${s.display_name} — ${LEGEND.find(l => l.state === s.state)?.label || "Absent"}`}
              className="relative flex items-center justify-center rounded-full cursor-pointer transition-all hover:scale-110 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[#6B8CFF] outline-none"
              style={{
                width: 34,
                height: 34,
                background: fill.bg,
                border: `2px solid ${fill.border}`,
                opacity: isOff ? 0.4 : 1,
              }}
            >
              {/* Avatar emoji */}
              <span className="text-sm leading-none select-none">{s.avatar || "👤"}</span>

              {/* Hand raised badge */}
              {s.hand_raised_at && (
                <span className="absolute -top-1 -right-1 text-[10px] animate-bounce drop-shadow-sm">
                  ✋
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend: 3 state dots */}
      <div className="flex items-center justify-center gap-3 mt-2.5">
        {LEGEND.map((item) => (
          <div key={item.state} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: STATE_DOT[item.state] }}
            />
            <span className="text-[9px] font-semibold text-[#B0A99E]">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Attention callouts: stuck / hand raised student names */}
      {attentionStudents.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5 px-0.5">
          {attentionStudents.map((s) => (
            <button
              key={s.id}
              onClick={() => onStudentClick(s.id)}
              className="flex items-center gap-1 text-[10px] font-semibold cursor-pointer hover:underline"
              style={{ color: s.state === "stuck" ? "#EB5757" : "#E88D2A" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: s.state === "stuck" ? "#EB5757" : "#E88D2A" }}
              />
              {s.display_name}
              {s.hand_raised_at && " ✋"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
