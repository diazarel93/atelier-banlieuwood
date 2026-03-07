"use client";

import type { StudentState } from "@/components/pilot/pulse-ring";

// ═══════════════════════════════════════════════════════════════
// MINI CLASSROOM GRID — Compact circle grid for sidebar plan de classe
// Each student = colored ring circle with emoji avatar + state badge
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

const STATE_COLORS: Record<StudentState, string> = {
  responded: "#4CAF50",
  active: "#F2C94C",
  stuck: "#EB5757",
  disconnected: "#C4BDB2",
};

const LEGEND: { state: StudentState; label: string }[] = [
  { state: "responded", label: "Repondu" },
  { state: "active", label: "Reflexion" },
  { state: "stuck", label: "Bloque" },
  { state: "disconnected", label: "Absent" },
];

export function MiniClassroomGrid({ studentStates, onStudentClick }: MiniClassroomGridProps) {
  return (
    <div className="px-2 pb-2">
      {/* Grid of circles */}
      <div
        className="gap-1.5"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(38px, 1fr))",
        }}
      >
        {studentStates.map((s) => {
          const color = STATE_COLORS[s.state];
          const isOff = s.state === "disconnected";
          return (
            <button
              key={s.id}
              onClick={() => onStudentClick(s.id)}
              title={`${s.display_name} — ${LEGEND.find(l => l.state === s.state)?.label}`}
              className="relative flex items-center justify-center rounded-full cursor-pointer transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-[#6B8CFF] outline-none"
              style={{
                width: 36,
                height: 36,
                border: `2.5px solid ${color}`,
                background: "rgba(255,255,255,0.6)",
                opacity: isOff ? 0.4 : 1,
              }}
            >
              {/* Avatar emoji */}
              <span className="text-base leading-none select-none">{s.avatar || "👤"}</span>

              {/* State badge overlay */}
              {s.state === "responded" && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                  style={{ background: "#4CAF50" }}
                >
                  ✓
                </span>
              )}
              {s.state === "stuck" && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white animate-pulse"
                  style={{ background: "#EB5757" }}
                >
                  !
                </span>
              )}
              {s.hand_raised_at && (
                <span className="absolute -top-1 -right-1 text-[10px] animate-bounce">
                  ✋
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-2.5">
        {LEGEND.map((item) => (
          <div key={item.state} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: STATE_COLORS[item.state] }}
            />
            <span className="text-[9px] font-medium text-[#B0A99E]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
