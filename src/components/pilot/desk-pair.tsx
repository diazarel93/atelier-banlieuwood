"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { SeatStudent } from "./seat-card";

/**
 * Warm EdTech state palette:
 *  - Green  = repondu, OK
 *  - Amber  = en cours (neutre-chaud)
 *  - Red    = bloque / besoin d'aide
 *  - Muted  = deconnecte
 */
const STATE_STYLE: Record<string, { dot: string; bg: string; border: string; text: string }> = {
  responded: { dot: "#4CAF50", bg: "#F0FAF4", border: "#C6E9D0", text: "#2C2C2C" },
  active:    { dot: "#F2C94C", bg: "#FFFCF5", border: "#F0E4C0", text: "#2C2C2C" },
  stuck:     { dot: "#EB5757", bg: "#FFF5F5", border: "#F5C4C4", text: "#2C2C2C" },
  disconnected: { dot: "#C4BDB2", bg: "#F7F5F2", border: "#E8E2D8", text: "#B0A99E" },
};

const DEFAULT_STYLE = { dot: "#C4BDB2", bg: "#F7F5F2", border: "#E8E2D8", text: "#B0A99E" };

/** A single desk with 1-2 students sitting side by side */
function DeskPairInner({
  left,
  right,
  responseMap,
  onStudentClick,
  teamColor,
}: {
  left: SeatStudent;
  right?: SeatStudent;
  responseMap: Map<string, string>;
  onStudentClick: (studentId: string) => void;
  teamColor?: string;
}) {
  const allResponded = left.state === "responded" && (!right || right.state === "responded");
  const anyNeedsHelp = left.state === "stuck" || right?.state === "stuck";
  const anyHand = !!left.hand_raised_at || !!right?.hand_raised_at;

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div
        className="relative flex items-stretch overflow-hidden transition-all duration-300"
        style={{
          borderRadius: 14,
          border: `1px solid ${
            anyHand ? "#F5C4C4"
            : allResponded ? "#C6E9D0"
            : teamColor ? `${teamColor}30`
            : "#E8DFD2"
          }`,
          background: allResponded
            ? "#F7FDF9"
            : anyNeedsHelp
              ? "#FFFAFA"
              : "#FFFFFF",
          boxShadow: anyHand
            ? "0 2px 12px rgba(235,87,87,0.12), 0 1px 3px rgba(61,43,16,0.06)"
            : allResponded
              ? "0 2px 12px rgba(76,175,80,0.08), 0 1px 3px rgba(61,43,16,0.04)"
              : "0 2px 8px rgba(61,43,16,0.05), 0 1px 2px rgba(61,43,16,0.03)",
        }}
      >
        <DeskSeat student={left} response={responseMap.get(left.id) || null} onClick={() => onStudentClick(left.id)} />
        <div className="w-px my-2.5" style={{ background: "#EFE4D8" }} />
        {right ? (
          <DeskSeat student={right} response={responseMap.get(right.id) || null} onClick={() => onStudentClick(right.id)} />
        ) : (
          <div className="w-[90px] flex items-center justify-center" style={{ opacity: 0.3 }}>
            <div className="w-5 h-5 rounded-full" style={{ border: "1.5px dashed #D3CAB8" }} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

/** A single seat — NAME FIRST design (teacher knows 30 students by name) */
function DeskSeat({
  student,
  response,
  onClick,
}: {
  student: SeatStudent;
  response: string | null;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const s = STATE_STYLE[student.state] || DEFAULT_STYLE;

  const stateLabel = student.state === "responded" ? "a repondu" : student.state === "stuck" ? "bloque" : student.state === "active" ? "en reflexion" : "absent";

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`${student.display_name} — ${stateLabel}${student.hand_raised_at ? ", main levee" : ""}`}
      className="relative flex items-center gap-2 px-2.5 py-2 cursor-pointer transition-colors w-[90px] outline-none focus-visible:ring-2 focus-visible:ring-[#6B8CFF] focus-visible:rounded-[8px]"
      style={{ opacity: student.state === "disconnected" ? 0.4 : 1 }}
      whileTap={{ scale: 0.96 }}
      whileHover={{ backgroundColor: "#FAF6EE" }}
    >
      {/* State dot + avatar */}
      <div className="relative flex-shrink-0">
        {/* Small avatar with state ring */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
          style={{
            background: s.bg,
            border: `2px solid ${s.dot}`,
            boxShadow: student.state === "stuck" ? `0 0 8px ${s.dot}30` : undefined,
          }}
        >
          {student.avatar}
        </div>

        {/* Hand raised */}
        {student.hand_raised_at && (
          <motion.span
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="absolute -top-1 -right-1 text-[10px]"
          >
            ✋
          </motion.span>
        )}

        {/* Responded check */}
        {student.state === "responded" && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
            style={{ background: "#4CAF50", boxShadow: "0 1px 3px rgba(76,175,80,0.4)" }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </motion.span>
        )}

        {/* Stuck indicator */}
        {student.state === "stuck" && (
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black text-white"
            style={{ background: "#EB5757", boxShadow: "0 1px 3px rgba(235,87,87,0.4)" }}
          >
            !
          </motion.span>
        )}

        {/* Warning badge */}
        {(student.warnings ?? 0) > 0 && (
          <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: "#F5A45B", boxShadow: "0 1px 2px rgba(245,164,91,0.4)" }}>
            {student.warnings}
          </span>
        )}
      </div>

      {/* Name — PRIMARY element */}
      <span
        className="text-[12px] leading-tight truncate max-w-[48px] font-semibold"
        style={{ color: s.text }}
      >
        {student.display_name}
      </span>

      {/* Hover tooltip — full response */}
      <AnimatePresence>
        {hovered && response && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-30 bottom-full mb-2 left-1/2 -translate-x-1/2 w-[220px] rounded-[12px] p-3 pointer-events-none"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E8DFD2",
              boxShadow: "0 8px 24px rgba(61,43,16,0.12), 0 2px 6px rgba(61,43,16,0.06)",
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm">{student.avatar}</span>
              <span className="text-[13px] font-semibold text-[#2C2C2C]">{student.display_name}</span>
            </div>
            <p className="text-[13px] text-[#5B5B5B] leading-snug line-clamp-4">{response}</p>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 -mt-1.5" style={{ background: "#FFFFFF", borderRight: "1px solid #E8DFD2", borderBottom: "1px solid #E8DFD2" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export const DeskPair = memo(DeskPairInner);
