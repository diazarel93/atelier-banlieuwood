"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
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

export function PhaseStepper({
  phases,
  modules,
  activeModuleId,
  completedModules,
  onPhaseClick,
  phaseTimings,
}: PhaseStepperProps) {
  // Filter phases: only show those with at least 1 non-disabled module
  const visiblePhases = useMemo(
    () =>
      phases.filter((p) =>
        p.moduleIds.some((id) => {
          const mod = getModuleById(id);
          return mod && !mod.disabled && !mod.comingSoon;
        })
      ),
    [phases]
  );

  // Determine active phase
  const activePhaseId = useMemo(() => {
    if (!activeModuleId) return null;
    const p = phases.find((ph) => ph.moduleIds.includes(activeModuleId));
    return p?.id || null;
  }, [activeModuleId, phases]);

  // Phase status
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

  // Gradient stops
  const gradientLine = useMemo(() => {
    if (visiblePhases.length < 2) return visiblePhases[0]?.color || "#D9CFC0";
    return visiblePhases
      .map((p, i) => `${p.color} ${(i / (visiblePhases.length - 1)) * 100}%`)
      .join(", ");
  }, [visiblePhases]);

  if (visiblePhases.length === 0) return null;

  // Compute where active phase is for line styling
  const activeIdx = useMemo(() => {
    if (!activePhaseId) return -1;
    return visiblePhases.findIndex((p) => p.id === activePhaseId);
  }, [activePhaseId, visiblePhases]);

  return (
    <div className="relative flex items-center w-full">
      {/* ── Gradient line segments between circles ── */}
      {/* We draw individual segments between each pair of phases */}
      {/* Completed/active = solid, upcoming = dashed */}

      {/* Phase circles + labels */}
      <div className="relative z-10 flex items-center justify-between w-full">
        {visiblePhases.map((phase, idx) => {
          const status = getStatus(phase);
          const nextPhase = visiblePhases[idx + 1];
          // Line between this circle and the next
          const lineCompleted = idx < activeIdx;
          const lineActive = idx === activeIdx;

          return (
            <div key={phase.id} className="flex items-center flex-1 last:flex-initial">
              <button
                onClick={() => onPhaseClick?.(phase.id)}
                className="flex flex-col items-center gap-1.5 cursor-pointer group flex-shrink-0"
                title={phase.label}
              >
                {/* Circle */}
                {status === "active" ? (
                  <motion.div
                    className="relative flex items-center justify-center rounded-full w-6 h-6 md:w-[42px] md:h-[42px]"
                    style={{
                      background: phase.color,
                      boxShadow: `0 0 0 3px white, 0 0 24px ${phase.color}50`,
                    }}
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
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
                  </motion.div>
                ) : status === "completed" ? (
                  <div
                    className="flex items-center justify-center rounded-full w-6 h-6 md:w-[42px] md:h-[42px]"
                    style={{
                      background: phase.color,
                      boxShadow: "0 0 0 3px white",
                    }}
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
                    className="flex items-center justify-center rounded-full w-6 h-6 md:w-[42px] md:h-[42px]"
                    style={{
                      border: "2px solid #D9CFC0",
                      background: "rgba(255,255,255,0.5)",
                      boxShadow: "0 0 0 2px white",
                      opacity: 0.7,
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#D9CFC0"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="w-3 h-3 md:w-[18px] md:h-[18px]"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </div>
                )}

                {/* Label + timing — desktop only */}
                <div className="hidden md:flex flex-col items-center gap-0.5 max-w-[90px]">
                  <span
                    className="leading-tight text-center truncate transition-colors"
                    style={{
                      color: status === "active" ? phase.color : "#B0A99E",
                      fontWeight: status === "active" ? 700 : 400,
                      fontSize: status === "active" ? 12 : 11,
                    }}
                  >
                    {phase.label}
                  </span>
                  {phaseTimings?.[phase.id] && (
                    <span className="text-[9px] tabular-nums font-medium" style={{ color: "#B0A99E" }}>
                      {formatTiming(phaseTimings[phase.id].elapsed)} / {formatTiming(phaseTimings[phase.id].estimated)}
                    </span>
                  )}
                </div>
              </button>

              {/* ── Line segment + chevron to next phase ── */}
              {nextPhase && (
                <div className="flex items-center flex-1 mx-1 md:mx-0 self-start md:mt-[19px] mt-[10px]">
                  {/* Desktop line */}
                  <div
                    className="flex-1 h-[3px] hidden md:block"
                    style={
                      lineCompleted || lineActive
                        ? {
                            background: `linear-gradient(to right, ${phase.color}, ${nextPhase.color})`,
                            opacity: 0.55,
                            borderRadius: 2,
                          }
                        : {
                            backgroundImage: `repeating-linear-gradient(to right, #D3CAB8 0, #D3CAB8 6px, transparent 6px, transparent 12px)`,
                            opacity: 0.45,
                            height: 2,
                          }
                    }
                  />
                  {/* Mobile line */}
                  <div
                    className="flex-1 h-[2px] rounded-full md:hidden"
                    style={{
                      background: lineCompleted || lineActive
                        ? `linear-gradient(to right, ${phase.color}, ${nextPhase.color})`
                        : "#E0D8CC",
                      opacity: lineCompleted || lineActive ? 0.5 : 0.3,
                    }}
                  />
                  {/* Chevron separator — desktop only */}
                  <span className="text-[11px] text-[#D0C8BB] mx-1.5 hidden md:inline select-none flex-shrink-0 -mt-px">
                    ›
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
