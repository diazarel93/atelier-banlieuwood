"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ElapsedTimer } from "@/components/pilot/elapsed-timer";
import { CountdownTimer } from "@/components/countdown-timer";
import { useCockpitActions } from "@/components/pilot/cockpit-context";
import { PHASES, getModuleById } from "@/lib/modules-data";

// ═══════════════════════════════════════════════════════════════
// FOCUS HEADER V6 — 2-bar cinema cockpit header
// Bar 1: Logo + status + metrics + controls
// Bar 2: Module rail P1-P8 inline pills
// ═══════════════════════════════════════════════════════════════

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
  /** V6: active module ID for the module rail */
  activeModuleId?: string | null;
  /** V6: completed module IDs */
  completedModuleIds?: string[];
  /** V6: callback to switch module */
  onModuleSelect?: (moduleId: string) => void;
  /** V6: toggle sidebar visibility */
  onToggleSidebar?: () => void;
  /** V6: whether sidebar is open */
  sidebarOpen?: boolean;
  /** V6: whether session is paused */
  isPaused?: boolean;
  /** V6: toggle pause */
  onTogglePause?: () => void;
  /** V6: class label */
  classLabel?: string;
  /** V6: hand raised count */
  handRaisedCount?: number;
  /** V6: disconnected count (for signal quality) */
  disconnectedCount?: number;
  /** V6: global session timer (seconds remaining) */
  globalTimerSeconds?: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  responding: {
    label: "LIVE",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  voting: {
    label: "VOTE",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/30",
    dot: "bg-orange-500",
  },
  reviewing: {
    label: "RESULTATS",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    dot: "bg-amber-500",
  },
  waiting: {
    label: "ATTENTE",
    color: "text-bw-cockpit-muted",
    bg: "bg-bw-cockpit-surface border-[rgba(245,245,244,0.08)]",
    dot: "bg-bw-cockpit-muted",
  },
  paused: {
    label: "PAUSE",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    dot: "bg-amber-500",
  },
  done: {
    label: "TERMINE",
    color: "text-bw-cockpit-muted",
    bg: "bg-bw-cockpit-surface border-[rgba(245,245,244,0.08)]",
    dot: "bg-bw-cockpit-muted",
  },
};

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function FocusHeader({
  sessionId: _sessionId,
  sessionTitle,
  moduleLabel,
  moduleColor,
  currentQIndex: _currentQIndex,
  maxSituations: _maxSituations,
  respondingOpenedAt,
  activeStudentCount,
  respondedCount: _respondedCount,
  totalStudents,
  sessionStatus,
  timerEndsAt,
  onOpenStudents: _onOpenStudents,
  onOpenCommandPalette,
  activeModuleId,
  completedModuleIds = [],
  onModuleSelect,
  onToggleSidebar,
  sidebarOpen = true,
  isPaused,
  onTogglePause,
  classLabel,
  handRaisedCount = 0,
  disconnectedCount = 0,
  globalTimerSeconds,
}: FocusHeaderProps) {
  const _router = useRouter();
  const [_isFullscreen, setIsFullscreen] = useState(false);
  const { onOpenModules: _onOpenModules } = useCockpitActions();

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const _toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  }, []);

  const statusCfg = STATUS_CONFIG[sessionStatus] || STATUS_CONFIG.waiting;
  const timerActive = !!timerEndsAt;
  const sessionOn = sessionStatus === "responding" || sessionStatus === "voting";

  // Build module rail from PHASES (not individual modules)
  const moduleRail = useMemo(() => {
    return PHASES.filter((p) =>
      p.moduleIds.some((id) => {
        const mod = getModuleById(id);
        return mod && !mod.disabled && !mod.comingSoon;
      }),
    ).map((phase, idx) => {
      const enabledIds = phase.moduleIds.filter((id) => {
        const mod = getModuleById(id);
        return mod && !mod.disabled && !mod.comingSoon;
      });
      const allDone = enabledIds.length > 0 && enabledIds.every((id) => completedModuleIds.includes(id));
      const isActive = activeModuleId ? phase.moduleIds.includes(activeModuleId) : false;
      // No locking — intervenant can navigate freely between all phases
      const isLocked = false;
      return {
        id: phase.id,
        firstModuleId: enabledIds[0],
        label: phase.label,
        shortLabel: `P${idx + 1}`,
        emoji: phase.emoji,
        color: phase.color,
        isActive,
        isDone: allDone,
        isLocked,
      };
    });
  }, [activeModuleId, completedModuleIds]);

  return (
    <div className="shrink-0">
      {/* ══ BAR 1: Main header ══ */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(245,245,244,0.08)] bg-bw-cockpit-canvas/90 backdrop-blur-md">
        {/* Left: Logo + info */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl flex-shrink-0">🎬</span>
          <div className="min-w-0">
            <div className="text-[14px] font-extrabold leading-tight" style={{ color: "#FF6B35" }}>BANLIEUWOOD</div>
            <div className="text-body-xs text-bw-cockpit-muted truncate">
              {classLabel || sessionTitle} — P{moduleLabel}
            </div>
          </div>
        </div>

        {/* Center: Status indicators */}
        <div className="hidden sm:flex items-center gap-3 flex-1 justify-center">
          {/* LIVE/PAUSE pill */}
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-body-xs font-bold uppercase tracking-wider border ${statusCfg.bg} ${statusCfg.color}`}
          >
            <motion.span
              className={`w-2 h-2 rounded-full ${statusCfg.dot}`}
              animate={sessionOn ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
              transition={sessionOn ? { repeat: Infinity, duration: 1.5 } : {}}
            />
            {statusCfg.label}
          </span>

          {/* Elapsed timer */}
          {timerActive ? (
            <div className="shrink-0 px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <CountdownTimer endsAt={timerEndsAt!} size="sm" />
            </div>
          ) : sessionStatus === "responding" ? (
            <div className="shrink-0">
              <ElapsedTimer startedAt={respondingOpenedAt} variant="pill" />
            </div>
          ) : null}

          {/* Users count */}
          <span className="flex items-center gap-2 text-[12px]">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-bw-cockpit-muted"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <strong className="text-bw-cockpit-text">{activeStudentCount}</strong>
            <span className="text-bw-cockpit-muted">/{totalStudents}</span>
          </span>

          {/* Hands raised */}
          {handRaisedCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bw-amber/15 border border-bw-amber/30 label-caps text-bw-amber">
              ✋ {handRaisedCount}
            </span>
          )}

          {/* Signal quality */}
          <span title={disconnectedCount > 3 ? "Reseau degrade" : "Reseau stable"}>
            {disconnectedCount > 3 ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fb923c"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M2 20h.01M7 20v-4M12 20v-8" />
                <path d="M17 20v-12" opacity=".3" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#34d399"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M2 20h.01M7 20v-4M12 20v-8M17 20v-12" />
              </svg>
            )}
          </span>

          {/* Global countdown */}
          {typeof globalTimerSeconds === "number" && (
            <span
              className={`text-body-xs font-mono font-bold ${globalTimerSeconds < 180 ? "text-bw-danger" : "text-bw-teal-readable"}`}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="inline mr-1 align-middle"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {formatTimer(globalTimerSeconds)}
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Command palette */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              aria-label="Ouvrir la palette de commandes (⌘K)"
              className="flex items-center gap-1 px-3 py-1.5 min-h-[44px] rounded-lg bg-bw-cockpit-surface hover:bg-[var(--color-bw-cockpit-border)] border border-[var(--color-bw-cockpit-border)] transition-colors cursor-pointer label-caps text-bw-cockpit-muted font-medium"
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
              <kbd className="font-mono text-body-xs">⌘K</kbd>
            </button>
          )}

          {/* Current module badge (info only — navigation via rail below) */}
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg label-caps text-white"
            style={{ backgroundColor: moduleColor }}
          >
            {moduleLabel}
          </span>

          {/* Go/Pause button */}
          {onTogglePause && (
            <button
              onClick={onTogglePause}
              aria-label={isPaused ? "Reprendre la séance" : "Mettre en pause"}
              className={`flex items-center gap-2 px-3 min-h-[44px] rounded-lg text-body-xs font-bold text-white cursor-pointer transition-all ${
                isPaused
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                  : "bg-gradient-to-r from-orange-500 to-orange-600"
              }`}
            >
              {isPaused ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Go
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  Pause
                </>
              )}
            </button>
          )}

          {/* Sidebar toggle */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              aria-label={sidebarOpen ? "Masquer le panneau" : "Afficher le panneau"}
              aria-expanded={sidebarOpen}
              className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg bg-bw-cockpit-surface hover:bg-[var(--color-bw-cockpit-border)] border border-[var(--color-bw-cockpit-border)] transition-colors cursor-pointer"
            >
              {sidebarOpen ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M15 3v18" />
                  <path d="M19 9l-3 3 3 3" />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M15 3v18" />
                  <path d="M9 9l3 3-3 3" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ══ BAR 2: Module rail P1-P8 ══ */}
      <nav className="flex items-center gap-1 px-4 py-2 overflow-x-auto border-b border-[rgba(245,245,244,0.08)] bg-bw-cockpit-canvas/60 backdrop-blur-sm">
        {moduleRail.map((m, i) => (
          <div key={m.id} className="flex items-center">
            {/* Connecting line */}
            {i > 0 && (
              <div
                className="w-4 h-[2px] mx-0.5 rounded-sm flex-shrink-0"
                style={{
                  background: m.isDone || moduleRail[i - 1]?.isDone ? "#34d399" : "rgba(245,245,244,0.08)",
                }}
              />
            )}
            {/* Module pill */}
            <button
              onClick={() => !m.isLocked && m.firstModuleId && onModuleSelect?.(m.firstModuleId)}
              disabled={m.isLocked}
              aria-label={m.isLocked ? `${m.label} — verrouillé` : m.label}
              aria-current={m.isActive ? "step" : undefined}
              className="flex items-center gap-2 px-3 py-1.5 min-h-[44px] rounded-lg label-caps whitespace-nowrap transition-all flex-shrink-0 border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                borderColor: m.isActive
                  ? `${m.color}66`
                  : m.isDone
                    ? "rgba(52,211,153,0.3)"
                    : "var(--color-bw-cockpit-border)",
                background: m.isActive ? `${m.color}18` : m.isDone ? "rgba(52,211,153,0.05)" : "transparent",
                color: m.isActive ? m.color : m.isDone ? "#34d399" : "var(--color-bw-cockpit-muted)",
                boxShadow: m.isActive ? `0 0 12px ${m.color}28` : undefined,
              }}
            >
              <span>{m.isLocked ? "🔒" : m.isDone ? "✅" : m.emoji}</span>
              <span className="hidden sm:inline">{m.label}</span>
              <span className="sm:hidden">{m.shortLabel}</span>
            </button>
          </div>
        ))}
      </nav>
    </div>
  );
}
