"use client";

import { memo } from "react";
import { motion } from "motion/react";
import type { SeatStudent } from "./seat-card";

const STATE_RING_COLOR: Record<string, string> = {
  responded: "#4ECDC4",
  active: "#FF6B35",
  stuck: "#F59E0B",
  disconnected: "#444",
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
  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* The desk — two seats on a shared surface */}
      <div
        className="flex items-stretch rounded-xl border overflow-hidden"
        style={{
          borderColor: teamColor ? `${teamColor}40` : "rgba(255,255,255,0.08)",
          background: teamColor ? `${teamColor}08` : "rgba(255,255,255,0.02)",
        }}
      >
        <DeskSeat student={left} response={responseMap.get(left.id) || null} onClick={() => onStudentClick(left.id)} />
        {/* Divider */}
        <div className="w-px my-2" style={{ background: teamColor ? `${teamColor}20` : "rgba(255,255,255,0.06)" }} />
        {right ? (
          <DeskSeat student={right} response={responseMap.get(right.id) || null} onClick={() => onStudentClick(right.id)} />
        ) : (
          <div className="w-[72px] flex items-center justify-center">
            <div className="w-7 h-7 rounded-full border border-dashed border-white/10" />
          </div>
        )}
      </div>
    </div>
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
  const ringColor = STATE_RING_COLOR[student.state] || "#444";

  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 px-2.5 py-2 cursor-pointer hover:bg-white/5 transition-colors relative w-[72px]"
      title={response ? `${student.display_name}: ${response}` : student.display_name}
      whileTap={{ scale: 0.95 }}
    >
      {/* Avatar */}
      <div className="relative">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-base"
          style={{ boxShadow: `0 0 0 2px ${ringColor}` }}
        >
          {student.avatar}
        </div>

        {/* Pulse for active */}
        {student.state === "active" && (
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ boxShadow: `0 0 0 2px ${ringColor}40` }}
          />
        )}

        {/* Hand raised */}
        {student.hand_raised_at && (
          <motion.span
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="absolute -top-1.5 -right-1.5 text-xs"
          >
            ✋
          </motion.span>
        )}

        {/* Responded check */}
        {student.state === "responded" && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-bw-teal flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </span>
        )}

        {/* Stuck indicator */}
        {student.state === "stuck" && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-bw-amber flex items-center justify-center text-[8px] font-bold text-black">
            ?
          </span>
        )}
      </div>

      {/* Name */}
      <span className={`text-[10px] leading-tight truncate max-w-[60px] ${student.state === "disconnected" ? "text-bw-muted/40" : "text-bw-text"}`}>
        {student.display_name}
      </span>
    </motion.button>
  );
}

export const DeskPair = memo(DeskPairInner);
