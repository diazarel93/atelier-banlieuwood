"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { ElapsedTimer } from "@/components/pilot/elapsed-timer";
import { ROUTES } from "@/lib/routes";

interface FocusHeaderProps {
  sessionId: string;
  sessionTitle: string;
  moduleLabel: string;
  moduleColor: string;
  currentQIndex: number;
  maxSituations: number;
  respondingOpenedAt: number | null;
  activeStudentCount: number;
  respondedCount: number;
  totalStudents: number;
  sessionStatus: string;
  timerEndsAt?: string | null;
  onOpenStudents: () => void;
}

export function FocusHeader({
  sessionId,
  sessionTitle,
  moduleLabel,
  moduleColor,
  currentQIndex,
  maxSituations,
  respondingOpenedAt,
  activeStudentCount,
  respondedCount,
  totalStudents,
  sessionStatus,
  timerEndsAt,
  onOpenStudents,
}: FocusHeaderProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const qLabel = maxSituations > 1 ? `Q${currentQIndex + 1}/${maxSituations}` : null;

  // Timer countdown
  const timerActive = !!timerEndsAt;

  return (
    <div className="shrink-0">
      {/* Main header bar */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Back button */}
        <button
          onClick={(e) => { e.stopPropagation(); router.push(ROUTES.seanceDetail(sessionId)); }}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          title="Retour"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Phase pill + Q counter */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold text-white truncate max-w-[180px]"
            style={{ backgroundColor: moduleColor }}
          >
            {moduleLabel}
          </span>
          {qLabel && (
            <span className="text-[13px] font-bold text-gray-500 tabular-nums">{qLabel}</span>
          )}
        </div>

        {/* Timer */}
        {sessionStatus === "responding" && (
          <div className="shrink-0">
            <ElapsedTimer startedAt={respondingOpenedAt} variant="pill" />
          </div>
        )}

        {/* Student chip */}
        <button
          onClick={(e) => { e.stopPropagation(); onOpenStudents(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-[13px] font-medium cursor-pointer"
          title="Voir les élèves"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="tabular-nums">{activeStudentCount}</span>
        </button>

        {/* Expand chevron */}
        <motion.svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </div>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between text-[13px] text-gray-600">
                <span className="truncate max-w-[200px]">{sessionTitle}</span>
                <span className="tabular-nums">
                  {respondedCount}/{totalStudents} réponse{respondedCount !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Status pill */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  sessionStatus === "responding" ? "bg-emerald-100 text-emerald-700" :
                  sessionStatus === "voting" ? "bg-orange-100 text-orange-700" :
                  sessionStatus === "reviewing" ? "bg-purple-100 text-purple-700" :
                  sessionStatus === "waiting" ? "bg-gray-100 text-gray-600" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    sessionStatus === "responding" ? "bg-emerald-500" :
                    sessionStatus === "voting" ? "bg-orange-500" :
                    sessionStatus === "reviewing" ? "bg-purple-500" :
                    "bg-gray-400"
                  }`} />
                  {sessionStatus === "responding" ? "Réponses ouvertes" :
                   sessionStatus === "voting" ? "Vote en cours" :
                   sessionStatus === "reviewing" ? "Résultats" :
                   sessionStatus === "waiting" ? "En attente" :
                   sessionStatus}
                </span>
                {timerActive && (
                  <span className="text-[11px] text-gray-500 tabular-nums">Timer actif</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom border */}
      <div className="h-px bg-gray-100" />
    </div>
  );
}
