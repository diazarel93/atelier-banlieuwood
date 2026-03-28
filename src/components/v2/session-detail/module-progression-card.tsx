"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";
import { MODULES, PHASES, type ModuleDef } from "@/lib/modules-data";

interface ModuleProgressionCardProps {
  completedModules: string[];
  currentModule: ModuleDef | null;
}

export function ModuleProgressionCard({ completedModules, currentModule }: ModuleProgressionCardProps) {
  return (
    <GlassCardV2 className="p-5">
      <p className="text-sm font-semibold text-bw-heading uppercase tracking-wide mb-4">Parcours des modules</p>

      <div className="space-y-3">
        {PHASES.map((phase) => {
          const phaseModules = MODULES.filter((m) => phase.moduleIds.includes(m.id));
          const completedInPhase = phaseModules.filter((m) => completedModules?.includes(m.id)).length;
          const isCurrent = phaseModules.some((m) => m.id === currentModule?.id);

          return (
            <div
              key={phase.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isCurrent
                  ? "bg-[var(--color-bw-surface-dim)] border border-[var(--color-bw-border)]"
                  : "hover:bg-[var(--color-bw-surface-dim)]"
              }`}
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${phase.color}20, ${phase.color}08)`,
                  color: phase.color,
                  border: `1px solid ${phase.color}25`,
                }}
              >
                {phase.label[0]}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${isCurrent ? "text-bw-heading" : "text-bw-muted"}`}>
                    {phase.label}
                  </span>
                  {phaseModules[0]?.comingSoon && (
                    <span className="text-xs text-bw-muted font-medium uppercase tracking-wider">Bientôt</span>
                  )}
                </div>
                {!phaseModules[0]?.comingSoon && (
                  <div className="flex gap-1.5 mt-1.5">
                    {phaseModules.map((m) => {
                      const isCompleted = completedModules?.includes(m.id);
                      const isActive = m.id === currentModule?.id;
                      return (
                        <div
                          key={m.id}
                          className="h-1.5 rounded-full flex-1 transition-all duration-500"
                          style={{
                            backgroundColor: isCompleted
                              ? phase.color
                              : isActive
                                ? `${phase.color}60`
                                : "rgba(0,0,0,0.06)",
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              <span className="text-xs font-mono text-bw-muted tabular-nums">
                {!phaseModules[0]?.comingSoon ? `${completedInPhase}/${phaseModules.length}` : ""}
              </span>
            </div>
          );
        })}
      </div>
    </GlassCardV2>
  );
}
