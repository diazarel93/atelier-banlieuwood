"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { SeatStudent } from "./seat-card";

const STATE_RING_COLOR: Record<string, string> = {
  responded: "#4ECDC4",
  active: "#FF6B35",
  stuck: "#F59E0B",
  disconnected: "#444",
};

const STATE_GLOW: Record<string, string> = {
  responded: "0 0 8px rgba(78,205,196,0.3)",
  active: "",
  stuck: "0 0 8px rgba(245,158,11,0.3)",
  disconnected: "",
};

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
  // Desk-level state: both responded?
  const allResponded = left.state === "responded" && (!right || right.state === "responded");
  const anyStuck = left.state === "stuck" || right?.state === "stuck";
  const anyHand = !!left.hand_raised_at || !!right?.hand_raised_at;

  return (
    <motion.div
      layout
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* The desk surface */}
      <div
        className="relative flex items-stretch rounded-xl border overflow-hidden transition-all duration-300"
        style={{
          borderColor: anyHand
            ? "rgba(245,158,11,0.5)"
            : allResponded
              ? "rgba(78,205,196,0.3)"
              : teamColor
                ? `${teamColor}30`
                : "rgba(255,255,255,0.08)",
          background: allResponded
            ? "rgba(78,205,196,0.04)"
            : anyStuck
              ? "rgba(245,158,11,0.04)"
              : teamColor
                ? `${teamColor}06`
                : "rgba(255,255,255,0.02)",
          boxShadow: anyHand
            ? "0 0 12px rgba(245,158,11,0.2)"
            : allResponded
              ? "0 0 8px rgba(78,205,196,0.15)"
              : "none",
        }}
      >
        {/* All-responded glow overlay */}
        {allResponded && (
          <div className="absolute inset-0 pointer-events-none rounded-xl" style={{ background: "linear-gradient(135deg, rgba(78,205,196,0.05), transparent)" }} />
        )}

        <DeskSeat student={left} response={responseMap.get(left.id) || null} onClick={() => onStudentClick(left.id)} />
        {/* Divider */}
        <div className="w-px my-1.5" style={{ background: teamColor ? `${teamColor}15` : "rgba(255,255,255,0.06)" }} />
        {right ? (
          <DeskSeat student={right} response={responseMap.get(right.id) || null} onClick={() => onStudentClick(right.id)} />
        ) : (
          /* Empty seat placeholder */
          <div className="w-[76px] flex items-center justify-center opacity-30">
            <div className="w-7 h-7 rounded-full border border-dashed border-white/15" />
          </div>
        )}
      </div>

      {/* Desk shadow — the "table" surface */}
      <div
        className="h-1 w-[80%] rounded-b-full opacity-40"
        style={{ background: teamColor ? `linear-gradient(to bottom, ${teamColor}20, transparent)` : "linear-gradient(to bottom, rgba(255,255,255,0.04), transparent)" }}
      />
    </motion.div>
  );
}

/** A single seat within a desk */
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
  const ringColor = STATE_RING_COLOR[student.state] || "#444";
  const glow = STATE_GLOW[student.state] || "";

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative flex flex-col items-center gap-0.5 px-3 py-2 cursor-pointer transition-colors w-[76px] ${
        student.state === "disconnected" ? "opacity-35" : ""
      }`}
      whileTap={{ scale: 0.93 }}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
    >
      {/* Avatar */}
      <div className="relative">
        <motion.div
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
          style={{ boxShadow: `0 0 0 2.5px ${ringColor}${hovered ? "" : "cc"}${glow ? `, ${glow}` : ""}` }}
          animate={student.state === "active" ? { boxShadow: [`0 0 0 2.5px ${ringColor}cc`, `0 0 0 2.5px ${ringColor}60, 0 0 12px ${ringColor}30`, `0 0 0 2.5px ${ringColor}cc`] } : undefined}
          transition={student.state === "active" ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : undefined}
        >
          {student.avatar}
        </motion.div>

        {/* Hand raised — urgent bounce */}
        {student.hand_raised_at && (
          <motion.span
            animate={{ y: [0, -4, 0], rotate: [0, 12, -12, 0] }}
            transition={{ repeat: Infinity, duration: 0.7 }}
            className="absolute -top-2 -right-2 text-sm drop-shadow-md"
          >
            ✋
          </motion.span>
        )}

        {/* State badge */}
        {student.state === "responded" && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-bw-teal flex items-center justify-center shadow-sm"
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </motion.span>
        )}
        {student.state === "stuck" && (
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-bw-amber flex items-center justify-center text-[9px] font-black text-black shadow-sm"
          >
            !
          </motion.span>
        )}
      </div>

      {/* Name */}
      <span className="text-[10px] leading-tight truncate max-w-[64px] text-bw-text font-medium">
        {student.display_name}
      </span>

      {/* Hover tooltip — response preview */}
      <AnimatePresence>
        {hovered && response && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 bottom-full mb-2 left-1/2 -translate-x-1/2 w-[180px] bg-bw-surface border border-white/10 rounded-lg p-2 shadow-xl pointer-events-none"
          >
            <p className="text-[10px] text-bw-teal font-semibold mb-0.5 truncate">{student.display_name}</p>
            <p className="text-[11px] text-bw-text leading-snug line-clamp-3">{response}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-bw-surface border-r border-b border-white/10 rotate-45 -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export const DeskPair = memo(DeskPairInner);
