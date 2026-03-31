"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useCockpitData, useCockpitActions } from "@/components/pilot/cockpit-context";
import { getModuleByDb } from "@/lib/modules-data";

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

interface ProjectionHeaderProps {
  sessionStartedAt: number;
}

export function ProjectionHeader({ sessionStartedAt }: ProjectionHeaderProps) {
  const { session, activeStudents } = useCockpitData();
  const { onOpenScreen } = useCockpitActions();

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(Date.now() - sessionStartedAt);
    const interval = setInterval(() => {
      setElapsed(Date.now() - sessionStartedAt);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartedAt]);

  const moduleInfo = getModuleByDb(session.current_module, session.current_seance || 1);
  const moduleTitle = moduleInfo?.title ?? `Module ${session.current_module}`;

  return (
    <header className="flex items-center justify-between px-4 h-12 flex-shrink-0 border-b border-[#E8DFD2] bg-[#F7F3EA]">
      {/* Left: LIVE pill + module */}
      <div className="flex items-center gap-3">
        {/* LIVE pill */}
        <motion.span
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF6B35] text-white text-[11px] font-bold uppercase tracking-wider"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          LIVE
        </motion.span>

        {/* Module name */}
        <span className="text-sm font-semibold text-[#2C2C2C] truncate max-w-[200px]">{moduleTitle}</span>
      </div>

      {/* Center: students + timer */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-[#4A4A4A] tabular-nums">
          <span className="font-bold text-[#2C2C2C]">{activeStudents.length}</span> élèves
        </span>
        <span className="text-sm font-mono tabular-nums text-[#4A4A4A]">{formatElapsed(elapsed)}</span>
      </div>

      {/* Right: Projection button */}
      <button
        onClick={() => onOpenScreen?.()}
        className="flex items-center gap-1.5 px-3 min-h-11 rounded-lg bg-[#2C2C2C] text-white text-xs font-semibold hover:bg-[#4A4A4A] transition-colors cursor-pointer"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
        Projection
      </button>
    </header>
  );
}
