"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { SeatStudent } from "./seat-card";

/**
 * Palette pensée "prof" :
 *  - Teal   = répondu, c'est bon ✓
 *  - Neutre = en train de bosser (normal, pas besoin d'attirer l'attention)
 *  - Corail  = besoin d'aide / bloqué
 *  - Gris   = pas connecté
 */
const STATE_COLOR: Record<string, string> = {
  responded: "#4ECDC4",
  active: "#8894A0",      // gris-bleu neutre — c'est le state NORMAL
  stuck: "#EF6461",       // corail doux au lieu de jaune criard
  disconnected: "#555",
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
  const allResponded = left.state === "responded" && (!right || right.state === "responded");
  const anyNeedsHelp = left.state === "stuck" || right?.state === "stuck";
  const anyHand = !!left.hand_raised_at || !!right?.hand_raised_at;

  return (
    <motion.div
      layout
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div
        className="relative flex items-stretch rounded-xl border overflow-hidden transition-all duration-300"
        style={{
          borderColor: anyHand
            ? "rgba(239,100,97,0.50)"
            : allResponded
              ? "rgba(78,205,196,0.30)"
              : teamColor
                ? `${teamColor}25`
                : "rgba(255,255,255,0.10)",
          background: allResponded
            ? "rgba(78,205,196,0.06)"
            : anyNeedsHelp
              ? "rgba(239,100,97,0.05)"
              : "rgba(255,255,255,0.03)",
          boxShadow: anyHand
            ? "0 0 16px rgba(239,100,97,0.15), 0 2px 4px rgba(0,0,0,0.2)"
            : allResponded
              ? "0 0 12px rgba(78,205,196,0.10), 0 2px 4px rgba(0,0,0,0.15)"
              : "0 1px 3px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <DeskSeat student={left} response={responseMap.get(left.id) || null} onClick={() => onStudentClick(left.id)} />
        <div className="w-px my-2" style={{ background: "rgba(255,255,255,0.10)" }} />
        {right ? (
          <DeskSeat student={right} response={responseMap.get(right.id) || null} onClick={() => onStudentClick(right.id)} />
        ) : (
          <div className="w-[80px] flex items-center justify-center opacity-20">
            <div className="w-6 h-6 rounded-full border border-dashed border-white/20" />
          </div>
        )}
      </div>
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
  const color = STATE_COLOR[student.state] || "#555";

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative flex flex-col items-center gap-0.5 px-2.5 py-2 cursor-pointer transition-colors w-[80px] ${
        student.state === "disconnected" ? "opacity-30" : ""
      }`}
      whileTap={{ scale: 0.95 }}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.06)", scale: 1.03 }}
    >
      {/* Avatar + badges */}
      <div className="relative">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-base"
          style={{ boxShadow: `0 0 0 2px ${color}, 0 0 8px ${color}40` }}
        >
          {student.avatar}
        </div>

        {/* Hand raised */}
        {student.hand_raised_at && (
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="absolute -top-1.5 -right-1.5 text-xs"
          >
            ✋
          </motion.span>
        )}

        {/* Responded check */}
        {student.state === "responded" && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#4ECDC4] flex items-center justify-center shadow-sm"
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </motion.span>
        )}

        {/* Stuck indicator */}
        {student.state === "stuck" && (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#EF6461] flex items-center justify-center text-xs font-black text-white shadow-sm">
            !
          </span>
        )}

        {/* Warning badge */}
        {(student.warnings ?? 0) > 0 && (
          <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-black shadow-sm">
            {student.warnings}
          </span>
        )}
      </div>

      {/* Name */}
      <span className="text-xs leading-tight truncate max-w-[68px] text-bw-text font-medium">
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
            className="absolute z-30 bottom-full mb-1.5 left-1/2 -translate-x-1/2 w-[200px] bg-bw-surface border border-white/10 rounded-lg p-2.5 shadow-xl pointer-events-none"
          >
            <p className="text-xs text-bw-teal font-semibold mb-0.5">{student.display_name}</p>
            <p className="text-sm text-bw-text leading-snug line-clamp-4">{response}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-bw-surface border-r border-b border-white/10 rotate-45 -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export const DeskPair = memo(DeskPairInner);
