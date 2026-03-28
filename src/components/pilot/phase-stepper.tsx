"use client";

import { useMemo } from "react";
import type { PhaseDef, ModuleDef } from "@/lib/modules-data";
import { getModuleById } from "@/lib/modules-data";

interface PhaseStepperProps {
  phases: PhaseDef[];
  modules: ModuleDef[];
  activeModuleId: string | null;
  completedModules: string[];
  onPhaseClick?: (phaseId: string) => void;
  phaseTimings?: Record<string, { elapsed: number; estimated: number }>;
}

type PhaseStatus = "completed" | "active" | "upcoming";

function formatTiming(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Count completed modules within a phase */
function getPhaseProgress(phase: PhaseDef, completedModules: string[]): { done: number; total: number } {
  const enabledIds = phase.moduleIds.filter((id) => {
    const mod = getModuleById(id);
    return mod && !mod.disabled && !mod.comingSoon;
  });
  const done = enabledIds.filter((id) => completedModules.includes(id)).length;
  return { done, total: enabledIds.length };
}

export function PhaseStepper({
  phases,
  modules,
  activeModuleId,
  completedModules,
  onPhaseClick,
  phaseTimings,
}: PhaseStepperProps) {
  const visiblePhases = useMemo(
    () =>
      phases.filter((p) =>
        p.moduleIds.some((id) => {
          const mod = getModuleById(id);
          return mod && !mod.disabled && !mod.comingSoon;
        }),
      ),
    [phases],
  );

  const activePhaseId = useMemo(() => {
    if (!activeModuleId) return null;
    const p = phases.find((ph) => ph.moduleIds.includes(activeModuleId));
    return p?.id || null;
  }, [activeModuleId, phases]);

  const getStatus = (phase: PhaseDef): PhaseStatus => {
    const enabledIds = phase.moduleIds.filter((id) => {
      const mod = getModuleById(id);
      return mod && !mod.disabled && !mod.comingSoon;
    });
    if (enabledIds.length > 0 && enabledIds.every((id) => completedModules.includes(id))) {
      return "completed";
    }
    if (phase.id === activePhaseId) return "active";
    return "upcoming";
  };

  const activeIdx = useMemo(() => {
    if (!activePhaseId) return -1;
    return visiblePhases.findIndex((p) => p.id === activePhaseId);
  }, [activePhaseId, visiblePhases]);

  if (visiblePhases.length === 0) return null;

  return (
    <div className="relative flex items-center w-full">
      <div className="relative z-10 flex items-center justify-between w-full">
        {visiblePhases.map((phase, idx) => {
          const status = getStatus(phase);
          const nextPhase = visiblePhases[idx + 1];
          const lineCompleted = idx < activeIdx;
          const lineActive = idx === activeIdx;
          const progress = getPhaseProgress(phase, completedModules);

          return (
            <div key={phase.id} className="flex items-center flex-1 last:flex-initial">
              <button
                onClick={() => onPhaseClick?.(phase.id)}
                className="flex flex-col items-center gap-1 cursor-pointer group flex-shrink-0"
                title={`${phase.label} — ${phase.description}`}
              >
                {/* ── Act circle — cinema narrative style ── */}
                {status === "active" ? (
                  <div
                    className="relative flex items-center justify-center rounded-full w-7 h-7 md:w-[44px] md:h-[44px] glow-breathe"
                    style={{
                      background: phase.color,
                      boxShadow: `0 0 0 3px white, 0 0 20px ${phase.color}40`,
                    }}
                  >
                    {/* Act number in Bebas Neue */}
                    <span className="font-cinema text-white text-[10px] md:text-[15px] font-normal tracking-wider">
                      {idx + 1}
                    </span>
                    {/* Pulse ring */}
                    <span
                      className="absolute inset-[-4px] rounded-full border-2 animate-ping pointer-events-none"
                      style={{ borderColor: `${phase.color}30` }}
                    />
                  </div>
                ) : status === "completed" ? (
                  <div
                    className="flex items-center justify-center rounded-full w-7 h-7 md:w-[44px] md:h-[44px]"
                    style={{ background: phase.color, boxShadow: "0 0 0 3px white" }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="w-3 h-3 md:w-[18px] md:h-[18px]"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center rounded-full w-7 h-7 md:w-[44px] md:h-[44px]"
                    style={{
                      border: "2px dashed #D9CFC0",
                      background: "rgba(255,255,255,0.3)",
                      boxShadow: "0 0 0 2px white",
                      opacity: 0.5,
                    }}
                  >
                    <span className="font-cinema text-[#C4BDB2] text-[10px] md:text-[14px] tracking-wider">
                      {idx + 1}
                    </span>
                  </div>
                )}

                {/* ── Label + progress — desktop narrative ── */}
                <div className="hidden md:flex flex-col items-center gap-0.5 max-w-[100px]">
                  {/* Phase label — Bebas Neue cinema */}
                  <span
                    className="font-cinema uppercase text-center truncate transition-colors leading-tight"
                    style={{
                      color: status === "active" ? phase.color : status === "completed" ? phase.color : "#C4BDB2",
                      fontSize: 11,
                      letterSpacing: "0.06em",
                      opacity: status === "upcoming" ? 0.6 : 1,
                      fontWeight: status === "active" ? 700 : 400,
                    }}
                  >
                    {phase.label}
                  </span>

                  {/* Progress micro-bar + timing — completed artefacts count */}
                  {status === "active" && progress.total > 1 && (
                    <div className="flex items-center gap-1">
                      <div className="flex gap-px">
                        {Array.from({ length: progress.total }).map((_, i) => (
                          <div
                            key={i}
                            className="w-2 h-1 rounded-sm transition-colors"
                            style={{
                              background: i < progress.done ? phase.color : "#E0D8CC",
                              opacity: i < progress.done ? 0.8 : 0.4,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {status === "completed" && (
                    <span className="text-[9px] font-semibold text-bw-muted opacity-50">
                      {progress.done}/{progress.total}
                    </span>
                  )}

                  {phaseTimings?.[phase.id] && (
                    <span className="text-[9px] tabular-nums font-medium text-bw-muted opacity-60">
                      {formatTiming(phaseTimings[phase.id].elapsed)}
                    </span>
                  )}
                </div>
              </button>

              {/* ── Line segment between acts ── */}
              {nextPhase && (
                <div className="flex items-center flex-1 mx-0.5 md:mx-0 self-start md:mt-[20px] mt-[12px]">
                  {/* Desktop — completed: gradient, active: animated, upcoming: film-strip */}
                  {lineCompleted ? (
                    <div
                      className="flex-1 h-[3px] hidden md:block rounded-sm"
                      style={{
                        background: `linear-gradient(to right, ${phase.color}, ${nextPhase.color})`,
                        opacity: 0.55,
                      }}
                    />
                  ) : lineActive ? (
                    <div
                      className="flex-1 h-[3px] hidden md:block rounded-sm overflow-hidden"
                      style={{ background: "#E0D8CC" }}
                    >
                      <div
                        className="h-full rounded-sm"
                        style={{
                          width: progress.total > 0 ? `${(progress.done / progress.total) * 100}%` : "0%",
                          background: `linear-gradient(to right, ${phase.color}, ${nextPhase.color})`,
                          transition: "width 500ms ease-out",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 hidden md:block film-strip-line" />
                  )}
                  {/* Mobile */}
                  <div
                    className="flex-1 h-[2px] rounded-full md:hidden"
                    style={{
                      background:
                        lineCompleted || lineActive
                          ? `linear-gradient(to right, ${phase.color}, ${nextPhase.color})`
                          : "#E0D8CC",
                      opacity: lineCompleted || lineActive ? 0.5 : 0.3,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
