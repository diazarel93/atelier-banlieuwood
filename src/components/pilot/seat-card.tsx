"use client";

import { memo } from "react";
import { motion } from "motion/react";
import type { StudentState } from "./pulse-ring";

export interface SeatStudent {
  id: string;
  display_name: string;
  avatar: string;
  state: StudentState;
  hand_raised_at?: string | null;
}

const STATE_RING_COLOR: Record<StudentState, string> = {
  responded: "#4ECDC4",
  active: "#FF6B35",
  stuck: "#F59E0B",
  disconnected: "#444",
};

const STATE_BG: Record<StudentState, string> = {
  responded: "bg-bw-teal/10",
  active: "bg-bw-bg",
  stuck: "bg-bw-amber/10",
  disconnected: "bg-bw-bg opacity-40",
};

function SeatCardInner({
  student,
  lastResponse,
  onClick,
}: {
  student: SeatStudent;
  lastResponse: string | null;
  onClick: () => void;
}) {
  const ringColor = STATE_RING_COLOR[student.state];

  return (
    <motion.button
      layout
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 rounded-xl cursor-pointer transition-colors hover:bg-white/5 group relative ${STATE_BG[student.state]}`}
      title={lastResponse ? `${student.display_name}: ${lastResponse}` : student.display_name}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Avatar circle with state ring */}
      <div className="relative">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ boxShadow: `0 0 0 2px ${ringColor}` }}
        >
          {student.avatar}
        </div>

        {/* Pulse animation for active state */}
        {student.state === "active" && (
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ boxShadow: `0 0 0 2px ${ringColor}40` }}
          />
        )}

        {/* Hand raised badge */}
        {student.hand_raised_at && (
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="absolute -top-1 -right-1 text-sm"
          >
            ✋
          </motion.span>
        )}

        {/* Responded badge */}
        {student.state === "responded" && (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-bw-teal flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </span>
        )}
      </div>

      {/* Name */}
      <span className="text-[11px] leading-tight truncate max-w-[64px] text-bw-text">
        {student.display_name}
      </span>
    </motion.button>
  );
}

export const SeatCard = memo(SeatCardInner);
