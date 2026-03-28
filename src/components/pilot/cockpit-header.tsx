"use client";

import { useState, useRef, useEffect } from "react";
import type { PhaseDef, ModuleDef } from "@/lib/modules-data";
import { ElapsedTimer } from "@/components/pilot/elapsed-timer";
import { LiveIndicator } from "@/components/ui/live-indicator";
import type { ConnectionStatus } from "@/hooks/use-realtime-invalidation";

interface CockpitHeaderProps {
  sessionTitle: string;
  phases: PhaseDef[];
  modules: ModuleDef[];
  activeModuleId: string | null;
  completedModules: string[];
  // Status bar
  moduleLabel: string;
  moduleColor: string;
  questionCounter: string | null; // "Q3/8"
  respondingOpenedAt: number | null;
  sessionStartedAt: number | null; // total session elapsed
  activeStudentCount: number;
  // Controls
  autoAdvance: boolean;
  onToggleAuto: () => void;
  autoAdvanceCountdown: number;
  onPause: () => void;
  onBroadcast: () => void;
  onScreen: () => void;
  onOpenModules: () => void;
  onPhaseClick?: (phaseId: string) => void;
  phaseTimings?: Record<string, { elapsed: number; estimated: number }>;
  // Session state (for inline banner)
  sessionStatus: string;
  respondedCount: number;
  totalStudents: number;
  voteCount: number;
  onTogglePauseFromBanner?: () => void;
  onViewResults?: () => void;
  // Energy donut data (Issue 3)
  stuckCount?: number;
  // Dark mode toggle
  isDarkMode?: boolean;
  onToggleDark?: () => void;
  // Connection status (#2)
  connectionStatus?: ConnectionStatus;
  // Timer presets (#7-8)
  timerEndsAt?: string | null;
  onSetTimer?: (seconds: number) => void;
  onClearTimer?: () => void;
  // Student screen preview (#23)
  sessionId?: string;
  // Screen mode control (#15)
  screenMode?: string;
  onSetScreenMode?: (mode: string) => void;
  // Freeze screen (#22)
  screenFrozen?: boolean;
  onToggleFreeze?: () => void;
}

/* ── Mini energy donut SVG (20x20) — Issue 3 ── */
function EnergyDonut({
  responded,
  active,
  stuck,
  total,
}: {
  responded: number;
  active: number;
  stuck: number;
  total: number;
}) {
  if (total === 0) return null;
  const r = 7;
  const c = 2 * Math.PI * r;
  const respondedPct = responded / total;
  const activePct = active / total;
  const stuckPct = stuck / total;

  let offset = 0;
  const segments = [
    { pct: respondedPct, color: "#4CAF50" },
    { pct: activePct, color: "#F2C94C" },
    { pct: stuckPct, color: "#EB5757" },
    { pct: 1 - respondedPct - activePct - stuckPct, color: "#D5CFC6" },
  ];

  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="-rotate-90 flex-shrink-0">
      <circle cx="10" cy="10" r={r} fill="none" stroke="#2a2a50" strokeWidth="3" />
      {segments.map((seg, i) => {
        if (seg.pct <= 0) return null;
        const dash = seg.pct * c;
        const gap = c - dash;
        const el = (
          <circle
            key={i}
            cx="10"
            cy="10"
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="3"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

/* ── Timer countdown display ── */
function TimerCountdown({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    function update() {
      const ms = new Date(endsAt).getTime() - Date.now();
      setRemaining(Math.max(0, Math.ceil(ms / 1000)));
    }
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [endsAt]);

  if (remaining <= 0) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = minutes > 0 ? `${minutes}:${String(seconds).padStart(2, "0")}` : `${seconds}s`;

  // Color thresholds: green > 60s, orange > 30s, red < 30s, pulse < 10s
  const color = remaining > 60 ? "#4CAF50" : remaining > 30 ? "#F59E0B" : "#EB5757";
  const pulse = remaining <= 10;

  return (
    <span
      className={`text-[13px] font-bold tabular-nums px-2 py-0.5 rounded-full flex-shrink-0 ${
        pulse ? "animate-pulse" : ""
      }`}
      style={{ backgroundColor: `${color}18`, color }}
    >
      {display}
    </span>
  );
}

export function CockpitHeader({
  sessionTitle,
  phases,
  modules,
  activeModuleId,
  completedModules,
  moduleLabel,
  moduleColor,
  questionCounter,
  respondingOpenedAt,
  sessionStartedAt,
  activeStudentCount,
  autoAdvance,
  onToggleAuto,
  autoAdvanceCountdown,
  onPause,
  onBroadcast,
  onScreen,
  onOpenModules,
  onPhaseClick,
  phaseTimings,
  sessionStatus,
  respondedCount,
  totalStudents,
  voteCount,
  onTogglePauseFromBanner,
  onViewResults,
  stuckCount = 0,
  isDarkMode,
  onToggleDark,
  connectionStatus,
  timerEndsAt,
  onSetTimer,
  onClearTimer,
  sessionId,
  screenMode,
  onSetScreenMode,
  screenFrozen,
  onToggleFreeze,
}: CockpitHeaderProps) {
  // Controls popover (Issue 1 — merge auto-advance + pause)
  const [controlsOpen, setControlsOpen] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!controlsOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (controlsRef.current && !controlsRef.current.contains(e.target as Node)) {
        setControlsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [controlsOpen]);

  // Compute energy donut values from props
  const stuckN = stuckCount;
  const respondedN = respondedCount;
  const activeN = Math.max(0, totalStudents - respondedN - stuckN);
  const needsPulse = stuckN > 2;

  return (
    <header className="flex-shrink-0 bg-white/85 backdrop-blur-[8px] border-b border-bw-border shadow-[0_2px_12px_rgba(61,43,16,0.04)]">
      {/* ── Single row: Brand + Module + Status + Controls ── */}
      <div className="flex items-center h-12 px-3 xl:px-5 gap-2.5 xl:gap-3">
        {/* LEFT: Hamburger + Title + Timer */}
        <button
          onClick={onOpenModules}
          title="Parcours des modules"
          aria-label="Ouvrir le menu des modules"
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-bw-muted hover:text-bw-heading bg-white/80 border border-bw-border cursor-pointer transition-colors flex-shrink-0 hover:shadow-sm"
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
        <span
          className="text-[15px] font-bold tracking-wider text-bw-heading flex-shrink-0 uppercase"
          style={{ fontFamily: "var(--font-cinema, inherit)" }}
        >
          Cockpit
        </span>
        {sessionStartedAt && (
          <span className="text-[11px] font-medium text-bw-muted tabular-nums flex-shrink-0 hidden sm:block">
            <ElapsedTimer startedAt={sessionStartedAt} variant="plain" />
          </span>
        )}
        <div className="w-px h-5 bg-bw-border/50 flex-shrink-0 hidden sm:block" />

        {/* Module pill + Timers + Energy donut + Connection + Students */}
        <div className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
          {/* Module badge — pill shape */}
          <span
            className="px-3 py-1 rounded-full text-[13px] font-medium truncate max-w-[160px]"
            style={{
              background: `${moduleColor}12`,
              color: moduleColor,
              border: `1px solid ${moduleColor}25`,
            }}
          >
            {moduleLabel}
          </span>

          {/* Timer countdown — visible when set (#7) */}
          {timerEndsAt && <TimerCountdown endsAt={timerEndsAt} />}

          {/* Question elapsed timer — red pill */}
          {respondingOpenedAt && !timerEndsAt && (
            <span className="flex-shrink-0 hidden sm:block">
              <ElapsedTimer startedAt={respondingOpenedAt} variant="pill" />
            </span>
          )}

          {/* Issue 3 — Energy donut (20x20) with pulse when stuck > 2 */}
          {totalStudents > 0 && (
            <div className={needsPulse ? "animate-[pulse_2s_ease-in-out_infinite]" : ""}>
              <EnergyDonut responded={respondedN} active={activeN} stuck={stuckN} total={totalStudents} />
            </div>
          )}

          {/* Connection status indicator (#2) */}
          {connectionStatus && (
            <LiveIndicator status={connectionStatus} showLabel={false} className="flex-shrink-0 hidden sm:flex" />
          )}

          {/* Student count */}
          <span className="text-[13px] font-medium text-bw-muted tabular-nums flex-shrink-0 hidden xl:block">
            {activeStudentCount} élève{activeStudentCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* #23 — Student screen preview button */}
        {sessionId && (
          <button
            onClick={() => {
              window.open(
                `/session/${sessionId}/screen`,
                "bw-screen-preview",
                "width=375,height=812,menubar=no,toolbar=no,location=no,status=no",
              );
            }}
            title="Ouvrir l'écran élève dans une fenêtre"
            className="btn-cockpit-sm bg-white/80 border border-bw-border text-bw-muted hover:text-bw-heading hover:bg-bw-surface-dim gap-1.5 flex-shrink-0"
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
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <span className="hidden xl:inline text-[13px] font-medium">Vue élève</span>
          </button>
        )}

        {/* RIGHT: Controls popover (Issue 1 — merge auto-advance + pause) */}
        <div className="relative flex-shrink-0" ref={controlsRef}>
          <button
            onClick={() => setControlsOpen((v) => !v)}
            className="btn-cockpit-sm bg-white/80 border border-bw-border text-bw-text hover:bg-bw-surface-dim gap-1.5"
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
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span className="hidden xl:inline">Controls</span>
          </button>

          {/* Popover */}
          {controlsOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-xl bg-white border border-bw-border shadow-bw-lg p-2 space-y-1">
              {/* Auto-advance */}
              <button
                onClick={onToggleAuto}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-bw-surface-dim cursor-pointer transition-colors"
              >
                <div
                  className={`w-5 h-3 rounded-full transition-all relative flex-shrink-0 ${autoAdvance ? "bg-bw-teal" : "bg-black/10"}`}
                >
                  <div
                    className={`absolute top-px w-2.5 h-2.5 rounded-full bg-white transition-all shadow-sm ${autoAdvance ? "left-2" : "left-px"}`}
                  />
                </div>
                <span className="text-bw-text">
                  Auto{autoAdvance && autoAdvanceCountdown > 0 ? ` ${autoAdvanceCountdown}s` : ""}
                </span>
              </button>
              {/* Pause */}
              <button
                onClick={() => {
                  onPause();
                  setControlsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-bw-surface-dim cursor-pointer transition-colors text-bw-text"
              >
                <span className="text-[12px]">⏸</span>
                Pause
              </button>
              {/* Screen — open projector */}
              <button
                onClick={() => {
                  onScreen();
                  setControlsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-bw-surface-dim cursor-pointer transition-colors text-bw-text"
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
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                Écran
              </button>

              {/* Screen mode selector (#15) */}
              {onSetScreenMode && (
                <>
                  <div className="border-t border-bw-border/50 my-1" />
                  <div className="px-3 py-1">
                    <span className="text-[11px] font-semibold text-bw-muted uppercase tracking-wider">Mode écran</span>
                  </div>
                  <div className="space-y-0.5 px-1">
                    {(
                      [
                        { mode: "default", label: "Question", icon: "📋" },
                        { mode: "responses", label: "Réponses", icon: "💬" },
                        { mode: "wordcloud", label: "Nuage de mots", icon: "☁️" },
                        { mode: "blank", label: "Écran noir", icon: "⬛" },
                      ] as const
                    ).map(({ mode, label, icon }) => (
                      <button
                        key={mode}
                        onClick={() => {
                          onSetScreenMode(mode);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer transition-colors ${
                          (screenMode || "default") === mode
                            ? "bg-bw-primary/10 text-bw-primary"
                            : "text-bw-text hover:bg-bw-surface-dim"
                        }`}
                      >
                        <span className="text-[12px] w-4 text-center">{icon}</span>
                        {label}
                        {(screenMode || "default") === mode && (
                          <span className="ml-auto text-[10px] text-bw-primary">&#10003;</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Freeze screen toggle (#22) */}
              {onToggleFreeze && (
                <button
                  onClick={onToggleFreeze}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-bw-surface-dim cursor-pointer transition-colors"
                >
                  <div
                    className={`w-5 h-3 rounded-full transition-all relative flex-shrink-0 ${screenFrozen ? "bg-blue-500" : "bg-black/10"}`}
                  >
                    <div
                      className={`absolute top-px w-2.5 h-2.5 rounded-full bg-white transition-all shadow-sm ${screenFrozen ? "left-2" : "left-px"}`}
                    />
                  </div>
                  <span className={screenFrozen ? "text-blue-600" : "text-bw-text"}>
                    {screenFrozen ? "❄️ Ecran gelé" : "❄️ Geler l'écran"}
                  </span>
                </button>
              )}

              {/* Timer presets (#7-8) */}
              {onSetTimer && (
                <>
                  <div className="border-t border-bw-border/50 my-1" />
                  <div className="px-3 py-1">
                    <span className="text-[11px] font-semibold text-bw-muted uppercase tracking-wider">Timer</span>
                  </div>
                  <div className="flex flex-wrap gap-1 px-3 pb-1">
                    {[30, 60, 90].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          onSetTimer(s);
                          setControlsOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-bw-surface-dim hover:bg-bw-primary/10 hover:text-bw-primary cursor-pointer transition-colors"
                      >
                        {s}s
                      </button>
                    ))}
                    {timerEndsAt && (
                      <>
                        <button
                          onClick={() => {
                            onSetTimer(30);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-bw-teal/10 text-bw-teal hover:bg-bw-teal/20 cursor-pointer transition-colors"
                        >
                          +30s
                        </button>
                        <button
                          onClick={() => {
                            onClearTimer?.();
                            setControlsOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-bw-danger/10 text-bw-danger hover:bg-bw-danger/20 cursor-pointer transition-colors"
                        >
                          Stop
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* Dark mode toggle */}
              {onToggleDark && (
                <button
                  onClick={onToggleDark}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-bw-surface-dim cursor-pointer transition-colors"
                >
                  <div
                    className={`w-5 h-3 rounded-full transition-all relative flex-shrink-0 ${isDarkMode ? "bg-indigo-500" : "bg-black/10"}`}
                  >
                    <div
                      className={`absolute top-px w-2.5 h-2.5 rounded-full bg-white transition-all shadow-sm ${isDarkMode ? "left-2" : "left-px"}`}
                    />
                  </div>
                  <span className="text-bw-text">{isDarkMode ? "☀️" : "🌙"} Nuit de Tournage</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
