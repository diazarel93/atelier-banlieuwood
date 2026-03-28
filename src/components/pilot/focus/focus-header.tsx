"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { ElapsedTimer } from "@/components/pilot/elapsed-timer";
import { CountdownTimer } from "@/components/countdown-timer";
import { ROUTES } from "@/lib/routes";
import { useScreenConnection } from "@/hooks/use-screen-connection";
import { useCockpitActions } from "@/components/pilot/cockpit-context";

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
  currentScreenMode?: string;
  onOpenStudents: () => void;
  onOpenPlan?: () => void;
  onOpenCommandPalette?: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  responding: {
    label: "LIVE",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-500",
  },
  voting: { label: "VOTE", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", dot: "bg-orange-500" },
  reviewing: {
    label: "RESULTATS",
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
    dot: "bg-purple-500",
  },
  waiting: { label: "ATTENTE", color: "text-gray-600", bg: "bg-gray-50 border-gray-200", dot: "bg-gray-400" },
  paused: { label: "PAUSE", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  done: { label: "TERMINE", color: "text-gray-600", bg: "bg-gray-50 border-gray-200", dot: "bg-gray-400" },
};

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
  currentScreenMode,
  onOpenStudents,
  onOpenPlan,
  onOpenCommandPalette,
}: FocusHeaderProps) {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isScreenConnected = useScreenConnection();
  const { onOpenModules } = useCockpitActions();

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  }, []);

  const qLabel = maxSituations > 1 ? `Q${currentQIndex + 1}/${maxSituations}` : null;
  const timerActive = !!timerEndsAt;
  const statusCfg = STATUS_CONFIG[sessionStatus] || STATUS_CONFIG.waiting;
  const pct = totalStudents > 0 ? Math.round((respondedCount / totalStudents) * 100) : 0;

  return (
    <div className="shrink-0">
      {/* ── Main header bar ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100">
        {/* Left: Logo + module */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Menu modules */}
          {onOpenModules && (
            <button
              onClick={() => onOpenModules()}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
              title="Menu des modules"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}

          {/* Module badge */}
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold text-white truncate shadow-sm"
              style={{ backgroundColor: moduleColor }}
            >
              {moduleLabel}
            </span>
            {qLabel && <span className="text-[12px] font-bold text-gray-400 tabular-nums">{qLabel}</span>}
          </div>

          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${statusCfg.bg} ${statusCfg.color}`}
          >
            <motion.span
              className={`w-2 h-2 rounded-full ${statusCfg.dot}`}
              animate={sessionStatus === "responding" ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
              transition={sessionStatus === "responding" ? { repeat: Infinity, duration: 1.5 } : {}}
            />
            {statusCfg.label}
          </span>
        </div>

        {/* Center: Response progress */}
        {sessionStatus === "responding" && totalStudents > 0 && (
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: pct >= 100 ? "#22C55E" : moduleColor }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-[11px] font-semibold text-gray-500 tabular-nums">
              {respondedCount}/{totalStudents}
            </span>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Timer */}
          {timerActive ? (
            <div className="shrink-0 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200">
              <CountdownTimer endsAt={timerEndsAt!} size="sm" />
            </div>
          ) : sessionStatus === "responding" ? (
            <div className="shrink-0">
              <ElapsedTimer startedAt={respondingOpenedAt} variant="pill" />
            </div>
          ) : null}

          {/* Students */}
          <button
            onClick={onOpenStudents}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors text-[12px] font-semibold cursor-pointer"
            title="Voir les eleves"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="tabular-nums">{activeStudentCount}</span>
          </button>

          {/* Screen */}
          <button
            onClick={() => window.open(ROUTES.screen(sessionId), "bw-screen")}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
            title={isScreenConnected ? "Ecran connecte" : "Ouvrir l'ecran"}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            {isScreenConnected && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            )}
          </button>

          {/* Command palette shortcut */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer text-[11px] text-gray-500 font-medium"
              title="Commandes (⌘K)"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <kbd className="font-mono text-[10px]">⌘K</kbd>
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
            title={isFullscreen ? "Quitter le plein ecran" : "Plein ecran"}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {isFullscreen ? (
                <>
                  <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                  <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                  <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                  <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                </>
              ) : (
                <>
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
