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
}

type PhaseStatus = "completed" | "active" | "upcoming";

export function PhaseStepper({
  phases,
  modules,
  activeModuleId,
  completedModules,
  onPhaseClick,
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

  return (
    <div className="relative flex items-center w-full">
      {/* Background gradient line — desktop */}
      <div
        className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[3px] rounded-full hidden md:block"
        style={{
          background: `linear-gradient(to right, ${gradientLine})`,
          opacity: 0.35,
        }}
      />
      {/* Background gradient line — mobile */}
      <div
        className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-[2px] rounded-full md:hidden"
        style={{
          background: `linear-gradient(to right, ${gradientLine})`,
          opacity: 0.3,
        }}
      />

      {/* Phase circles + labels */}
      <div className="relative z-10 flex items-center justify-between w-full">
        {visiblePhases.map((phase, idx) => {
          const status = getStatus(phase);
          return (
            <div key={phase.id} className="flex items-center">
              {/* Separator chevron (desktop only) */}
              {idx > 0 && (
                <span className="text-[10px] text-[#D9CFC0] mx-1 hidden md:inline select-none">
                  ›
                </span>
              )}

              <button
                onClick={() => onPhaseClick?.(phase.id)}
                className="flex flex-col items-center gap-1 cursor-pointer group"
                title={phase.label}
              >
                {/* Circle */}
                {status === "active" ? (
                  <motion.div
                    className="relative flex items-center justify-center rounded-full border-[3px] border-white w-5 h-5 md:w-9 md:h-9"
                    style={{
                      background: phase.color,
                      boxShadow: `0 0 16px ${phase.color}30`,
                    }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    <span className="text-white text-[10px] md:text-[13px] font-bold leading-none">
                      {phase.emoji}
                    </span>
                  </motion.div>
                ) : status === "completed" ? (
                  <div
                    className="flex items-center justify-center rounded-full border-2 border-white w-5 h-5 md:w-9 md:h-9"
                    style={{ background: phase.color }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="w-2.5 h-2.5 md:w-4 md:h-4"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center rounded-full border-2 w-5 h-5 md:w-9 md:h-9 opacity-60"
                    style={{ borderColor: "#D9CFC0", background: "transparent" }}
                  >
                    <span className="text-[10px] md:text-[13px] opacity-50 leading-none">
                      {phase.emoji}
                    </span>
                  </div>
                )}

                {/* Label — desktop only */}
                <span
                  className="hidden md:block text-[11px] leading-tight max-w-[80px] text-center truncate transition-colors"
                  style={{
                    color: status === "active" ? phase.color : "#B0A99E",
                    fontWeight: status === "active" ? 600 : 400,
                  }}
                >
                  {phase.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
