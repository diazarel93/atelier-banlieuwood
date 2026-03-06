"use client";

import type { PhaseDef, ModuleDef } from "@/lib/modules-data";
import { PhaseStepper } from "@/components/pilot/phase-stepper";
import { ElapsedTimer } from "@/components/pilot/elapsed-timer";
import { SessionStateBanner } from "@/components/pilot/session-state-banner";

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
  // Session state (for inline banner)
  sessionStatus: string;
  respondedCount: number;
  totalStudents: number;
  voteCount: number;
  onTogglePauseFromBanner?: () => void;
  onViewResults?: () => void;
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
  activeStudentCount,
  autoAdvance,
  onToggleAuto,
  autoAdvanceCountdown,
  onPause,
  onBroadcast,
  onScreen,
  onOpenModules,
  onPhaseClick,
  sessionStatus,
  respondedCount,
  totalStudents,
  voteCount,
  onTogglePauseFromBanner,
  onViewResults,
}: CockpitHeaderProps) {
  return (
    <header
      className="flex-shrink-0 flex flex-col"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid #E8DFD2",
        boxShadow: "0 2px 12px rgba(61,43,16,0.04)",
      }}
    >
      {/* ── Row 1: Brand + Phase Stepper ── */}
      <div className="flex items-center h-14 px-3 xl:px-5 gap-3">
        {/* LEFT: Hamburger + Title */}
        <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
          <button
            onClick={onOpenModules}
            title="Parcours des modules"
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-bw-muted hover:text-bw-heading bg-white/80 border border-[#E8DFD2] cursor-pointer transition-colors flex-shrink-0 hover:shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-semibold text-[#2C2C2C] truncate">
              {sessionTitle}
            </span>
            <span className="text-[11px] text-[#7A7A7A] hidden xl:block">
              Cockpit pedagogique
            </span>
          </div>
        </div>

        {/* CENTER/RIGHT: Phase Stepper — takes remaining space */}
        <div className="flex-1 min-w-0 px-2">
          <PhaseStepper
            phases={phases}
            modules={modules}
            activeModuleId={activeModuleId}
            completedModules={completedModules}
            onPhaseClick={onPhaseClick}
          />
        </div>
      </div>

      {/* ── Row 2: Status bar ── */}
      <div
        className="flex items-center h-10 px-3 xl:px-5 gap-2 xl:gap-3"
        style={{
          background: "rgba(245,239,230,0.5)",
          borderTop: "1px solid rgba(232,223,210,0.6)",
        }}
      >
        {/* LEFT: Module badge + Q counter + Timer + Students */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
          {/* Module badge */}
          <span
            className="px-2.5 py-0.5 rounded-full text-[12px] font-medium truncate max-w-[140px]"
            style={{
              background: `${moduleColor}18`,
              color: moduleColor,
              border: `1px solid ${moduleColor}30`,
            }}
          >
            {moduleLabel}
          </span>

          {/* Question counter */}
          {questionCounter && (
            <>
              <span className="text-[#D3CAB8] hidden sm:block">·</span>
              <span className="text-[12px] font-medium text-[#5B5B5B] tabular-nums flex-shrink-0 hidden sm:block">
                {questionCounter}
              </span>
            </>
          )}

          {/* Timer */}
          {respondingOpenedAt && (
            <>
              <span className="text-[#D3CAB8] hidden xl:block">·</span>
              <span className="flex-shrink-0 hidden xl:block">
                <ElapsedTimer startedAt={respondingOpenedAt} />
              </span>
            </>
          )}

          {/* Student count */}
          <span className="text-[#D3CAB8] hidden xl:block">·</span>
          <span className="text-[12px] font-medium text-[#5B5B5B] tabular-nums flex-shrink-0 hidden xl:block">
            {activeStudentCount} eleve{activeStudentCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* CENTER: Session state banner (compact) */}
        <div className="flex-1 flex justify-center min-w-0">
          <SessionStateBanner
            status={sessionStatus}
            respondedCount={respondedCount}
            totalStudents={totalStudents}
            voteCount={voteCount}
            onTogglePause={onTogglePauseFromBanner}
            onViewResults={onViewResults}
            compact
          />
        </div>

        {/* RIGHT: Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Auto-advance toggle */}
          <button
            onClick={onToggleAuto}
            className={`flex items-center gap-1.5 h-8 px-2 xl:px-3 rounded-[10px] text-[12px] font-medium cursor-pointer transition-all ${
              autoAdvance
                ? "bg-bw-teal/15 text-bw-teal border border-bw-teal/30"
                : "bg-white text-[#4A4A4A] border border-[#E8DFD2]"
            }`}
          >
            <div className={`w-5 h-3 rounded-full transition-all relative ${autoAdvance ? "bg-bw-teal" : "bg-black/10"}`}>
              <div className={`absolute top-px w-2.5 h-2.5 rounded-full bg-white transition-all shadow-sm ${autoAdvance ? "left-2" : "left-px"}`} />
            </div>
            <span className="hidden xl:inline">
              Auto{autoAdvance && autoAdvanceCountdown > 0 ? ` ${autoAdvanceCountdown}s` : ""}
            </span>
          </button>

          {/* Pause */}
          <button
            onClick={onPause}
            className="h-8 w-8 xl:w-auto xl:px-3 rounded-[10px] bg-white border border-[#E8DFD2] text-[12px] font-medium text-[#4A4A4A] hover:bg-[#F8F2E8] cursor-pointer transition-colors flex items-center justify-center"
          >
            <span className="xl:hidden">⏸</span>
            <span className="hidden xl:inline">⏸ Pause</span>
          </button>

          {/* Broadcast */}
          <button
            onClick={onBroadcast}
            title="Message classe (B)"
            className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm text-[#7A7A7A] hover:text-[#2C2C2C] bg-white border border-[#E8DFD2] cursor-pointer transition-colors hover:shadow-sm"
          >
            📢
          </button>

          {/* Screen */}
          <button
            onClick={onScreen}
            title="Ecran eleves"
            className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm text-[#7A7A7A] hover:text-[#2C2C2C] bg-white border border-[#E8DFD2] cursor-pointer transition-colors hover:shadow-sm"
          >
            🖥
          </button>
        </div>
      </div>
    </header>
  );
}
