"use client";

import type { PhaseDef, ModuleDef } from "@/lib/modules-data";
import { PhaseStepper } from "@/components/pilot/phase-stepper";
import { ElapsedTimer } from "@/components/pilot/elapsed-timer";

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
      <div className="flex items-center h-[72px] px-3 xl:px-5 gap-3">
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
          <span className="text-[18px] font-semibold text-[#2C2C2C] tracking-tight">
            cockpit
          </span>
        </div>

        {/* CENTER/RIGHT: Phase Stepper — takes remaining space */}
        <div className="flex-1 min-w-0 px-2">
          <PhaseStepper
            phases={phases}
            modules={modules}
            activeModuleId={activeModuleId}
            completedModules={completedModules}
            onPhaseClick={onPhaseClick}
            phaseTimings={phaseTimings}
          />
        </div>
      </div>

      {/* ── Row 2: Status bar ── */}
      <div
        className="flex items-center h-11 px-3 xl:px-5 gap-2.5 xl:gap-3"
        style={{
          background: "rgba(245,239,230,0.45)",
          borderTop: "1px solid rgba(232,223,210,0.5)",
        }}
      >
        {/* LEFT: Module pill + Session timer + Question timer + Students */}
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

          {/* Session total elapsed timer */}
          {sessionStartedAt && (
            <span className="text-[13px] font-medium text-[#7D828A] tabular-nums flex-shrink-0 hidden sm:block">
              <ElapsedTimer startedAt={sessionStartedAt} variant="plain" />
            </span>
          )}

          {/* Question elapsed timer — red pill */}
          {respondingOpenedAt && (
            <span className="flex-shrink-0 hidden sm:block">
              <ElapsedTimer startedAt={respondingOpenedAt} variant="pill" />
            </span>
          )}

          {/* Student count */}
          <span className="text-[13px] font-medium text-[#7D828A] tabular-nums flex-shrink-0 hidden xl:block">
            {activeStudentCount} eleve{activeStudentCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* RIGHT: Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Auto-advance toggle */}
          <button
            onClick={onToggleAuto}
            className={`flex items-center gap-1.5 h-9 px-3 xl:px-4 rounded-full text-[13px] font-medium cursor-pointer transition-all ${
              autoAdvance
                ? "bg-bw-teal/15 text-bw-teal border border-bw-teal/30"
                : "bg-white/80 text-[#4A4A4A] border border-[#E0D8CC]"
            }`}
          >
            <div className={`w-5 h-3 rounded-full transition-all relative ${autoAdvance ? "bg-bw-teal" : "bg-black/10"}`}>
              <div className={`absolute top-px w-2.5 h-2.5 rounded-full bg-white transition-all shadow-sm ${autoAdvance ? "left-2" : "left-px"}`} />
            </div>
            <span className="hidden xl:inline">
              Auto{autoAdvance && autoAdvanceCountdown > 0 ? ` ${autoAdvanceCountdown}s` : ""}
            </span>
          </button>

          {/* Pause — with dropdown chevron */}
          <button
            onClick={onPause}
            className="h-9 px-3 xl:px-4 rounded-full bg-white/80 border border-[#E0D8CC] text-[13px] font-medium text-[#4A4A4A] hover:bg-[#F8F2E8] cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <span className="text-[12px]">⏸</span>
            <span className="hidden xl:inline">Pause</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-40 hidden xl:block">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
