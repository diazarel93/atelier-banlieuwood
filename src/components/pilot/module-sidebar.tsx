"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { type ModuleDef, type PhaseDef } from "@/lib/modules-data";
import { ModuleIcon } from "./module-icon";
import { getSeanceIntro } from "@/lib/seance-intros";

interface ModuleSidebarProps {
  collapsed: boolean;
  modules: ModuleDef[];
  phases: PhaseDef[];
  activeModuleId: string | null;
  selectedModuleId?: string | null;
  completedModules: string[];
  onSelectModule: (moduleId: string) => void;
  onToggleCollapse: () => void;
  responsesCount?: number;
  moduleStartedAt?: string | null;
  sessionStatus?: string;
}

export function ModuleSidebar({
  collapsed,
  modules,
  phases,
  activeModuleId,
  selectedModuleId,
  completedModules,
  onSelectModule,
  onToggleCollapse,
  responsesCount,
  moduleStartedAt,
  sessionStatus,
}: ModuleSidebarProps) {
  // Auto-open the phase containing the active module
  const activePhase = activeModuleId
    ? phases.find((p) => p.moduleIds.includes(activeModuleId))
    : null;

  const [openPhaseIds, setOpenPhaseIds] = useState<string[]>(
    activePhase ? [activePhase.id] : [phases[0]?.id].filter(Boolean)
  );

  // Keep active phase open when it changes
  useEffect(() => {
    if (activePhase && !openPhaseIds.includes(activePhase.id)) {
      setOpenPhaseIds((prev) => [...prev, activePhase.id]);
    }
  }, [activePhase, openPhaseIds]);

  // Elapsed timer for active module
  const [elapsed, setElapsed] = useState("");
  useEffect(() => {
    if (!moduleStartedAt) { setElapsed(""); return; }
    function update() {
      const mins = Math.floor((Date.now() - new Date(moduleStartedAt!).getTime()) / 60000);
      setElapsed(mins < 1 ? "<1m" : `${mins}m`);
    }
    update();
    const iv = setInterval(update, 10000);
    return () => clearInterval(iv);
  }, [moduleStartedAt]);

  function togglePhase(phaseId: string) {
    setOpenPhaseIds((prev) =>
      prev.includes(phaseId) ? prev.filter((id) => id !== phaseId) : [...prev, phaseId]
    );
  }

  function getModuleStatus(mod: ModuleDef): "completed" | "active" | "available" | "locked" {
    if (completedModules.includes(mod.id)) return "completed";
    if (mod.id === activeModuleId) return "active";
    if (mod.disabled) return "locked";
    return "available";
  }

  function getStatusIcon(status: "completed" | "active" | "available" | "locked") {
    switch (status) {
      case "completed":
        return <div className="led led-done" />;
      case "active":
        return <div className="led led-active" />;
      case "locked":
        return <div className="led led-idle" />;
      default:
        return <div className="led led-idle" />;
    }
  }

  // ── Collapsed mode: phase icons only ──
  if (collapsed) {
    return (
      <aside className="w-14 flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-bw-surface">
        <button
          onClick={onToggleCollapse}
          className="p-3 text-bw-muted hover:text-bw-primary cursor-pointer transition-colors"
          title="Ouvrir le menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <div className="flex-1 overflow-y-auto py-1 space-y-0.5">
          {phases.map((phase) => {
            const completedCount = phase.moduleIds.filter((id) => completedModules.includes(id)).length;
            const isActive = activePhase?.id === phase.id;
            const allLocked = phase.moduleIds.every((id) => modules.find((m) => m.id === id)?.disabled);
            return (
              <button
                key={phase.id}
                onClick={() => {
                  onToggleCollapse();
                  if (!openPhaseIds.includes(phase.id)) {
                    setOpenPhaseIds((prev) => [...prev, phase.id]);
                  }
                }}
                className={`w-full flex flex-col items-center py-2.5 cursor-pointer transition-colors relative group ${
                  isActive ? "" : "hover:bg-white/[0.03]"
                } ${allLocked ? "opacity-30" : ""}`}
                title={`${phase.label} (${completedCount}/${phase.moduleIds.length})`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r" style={{ backgroundColor: phase.color }} />
                )}
                {isActive && (
                  <motion.div
                    className="absolute top-1 right-1 w-2 h-2 rounded-full bg-bw-primary"
                    animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black"
                  style={{
                    background: `linear-gradient(135deg, ${phase.color}25, ${phase.color}08)`,
                    color: phase.color,
                    border: `1px solid ${phase.color}30`,
                  }}
                >
                  {phase.label[0]}
                </span>
                {isActive && responsesCount !== undefined && responsesCount > 0 ? (
                  <span className="text-[8px] tabular-nums mt-0.5 font-bold text-bw-teal">
                    {responsesCount}
                  </span>
                ) : completedCount > 0 ? (
                  <span className="text-[8px] tabular-nums mt-0.5" style={{ color: phase.color }}>
                    {completedCount}/{phase.moduleIds.length}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  // ── Expanded mode: transparent panel ──
  const totalDone = completedModules.length;
  const totalActive = modules.filter((m) => !m.disabled).length;
  const progressPct = totalActive > 0 ? Math.round((totalDone / totalActive) * 100) : 0;

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-bw-surface">
      {/* Header */}
      <div className="px-3 py-2.5 space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCollapse}
            className="text-bw-muted hover:text-bw-primary cursor-pointer transition-colors p-0.5"
            title="Réduire"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-bw-primary flex-1">Parcours</span>
          <span className="text-[9px] tabular-nums font-medium" style={{ color: progressPct === 100 ? "#4ECDC4" : "#7D828A" }}>{totalDone}/{totalActive}</span>
        </div>
        {/* Global progress bar */}
        <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5 }}
            style={{ background: progressPct === 100 ? "linear-gradient(90deg, #4ECDC4, #10B981)" : "linear-gradient(90deg, #FF6B35, #D4A843)" }}
          />
        </div>
      </div>

      {/* Scrollable phases */}
      <div className="flex-1 overflow-y-auto">
        {phases.map((phase) => {
          const phaseMods = phase.moduleIds.map((id) => modules.find((m) => m.id === id)).filter(Boolean) as ModuleDef[];
          const completedCount = phaseMods.filter((m) => completedModules.includes(m.id)).length;
          const isOpen = openPhaseIds.includes(phase.id);
          const isActivePhase = activePhase?.id === phase.id;
          const allLocked = phaseMods.every((m) => m.disabled);

          return (
            <div key={phase.id} className="relative">
              {/* Active phase left border */}
              {isActivePhase && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r" style={{ backgroundColor: phase.color }} />
              )}
              {/* Phase header */}
              <button
                onClick={() => togglePhase(phase.id)}
                className={`w-full px-3 py-2.5 flex items-center gap-2 cursor-pointer transition-all duration-200 text-left rounded-xl mx-1 ${
                  isActivePhase ? "" : "hover:bg-white/[0.03]"
                } ${allLocked ? "opacity-40" : ""}`}
                style={isActivePhase ? { background: `linear-gradient(90deg, ${phase.color}12, transparent)` } : undefined}
              >
                <span
                  className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${phase.color}20, ${phase.color}08)`,
                    color: phase.color,
                    border: `1px solid ${phase.color}25`,
                  }}
                >
                  {phase.label[0]}
                </span>
                <span className={`text-[11px] font-medium flex-1 truncate ${isActivePhase ? "text-bw-heading" : "text-bw-muted"}`}>{phase.label}</span>
                <span className="text-[9px] tabular-nums" style={{ color: completedCount === phaseMods.length && completedCount > 0 ? "#4ECDC4" : "#555960" }}>
                  {completedCount}/{phaseMods.length}
                </span>
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555960" strokeWidth="2" strokeLinecap="round"
                  className={`transition-transform flex-shrink-0 ${isOpen ? "rotate-90" : ""}`}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Module list */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {phaseMods.map((mod) => {
                      const status = getModuleStatus(mod);
                      const isActive = mod.id === activeModuleId;
                      const isSelected = mod.id === selectedModuleId;

                      return (
                        <button
                          key={mod.id}
                          onClick={() => !mod.disabled && onSelectModule(mod.id)}
                          disabled={mod.disabled}
                          className={`w-full pl-5 pr-3 py-2.5 flex items-center gap-2 text-left transition-all relative group ${
                            mod.disabled ? "cursor-not-allowed opacity-30" : "cursor-pointer"
                          } ${isSelected ? "rounded-xl mx-1" : isActive ? "rounded-xl mx-1" : "hover:bg-white/[0.03]"}`}
                          style={isSelected ? { background: `linear-gradient(90deg, ${mod.color}15, ${mod.color}05)` } : isActive ? { background: `linear-gradient(90deg, ${mod.color}10, transparent)` } : undefined}
                        >
                          {/* Active/selected indicator */}
                          {(isActive || isSelected) && (
                            <div
                              className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r"
                              style={{ backgroundColor: mod.color }}
                            />
                          )}

                          {/* Status icon */}
                          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                            {getStatusIcon(status)}
                          </div>

                          {/* Module info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className={`text-[11px] leading-tight truncate ${
                                isSelected || isActive ? "text-bw-heading font-medium" : status === "completed" ? "text-bw-muted" : "text-bw-text"
                              }`}>
                                {mod.title}
                              </span>
                              {isActive && responsesCount !== undefined && responsesCount > 0 && (
                                <motion.span
                                  key={responsesCount}
                                  initial={{ scale: 1.4, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="inline-flex items-center gap-0.5 text-[9px] font-bold text-bw-teal bg-bw-teal/10 px-1 py-px rounded-full flex-shrink-0"
                                >
                                  <motion.span
                                    className="w-1.5 h-1.5 rounded-full bg-bw-teal"
                                    animate={{ opacity: [1, 0.3, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.2 }}
                                  />
                                  {responsesCount}
                                </motion.span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] text-bw-muted leading-tight">{mod.duration}</span>
                              {isActive && elapsed && (
                                <span className="text-[9px] text-bw-primary tabular-nums">{elapsed}</span>
                              )}
                              {(() => {
                                const intro = getSeanceIntro(mod.dbModule, mod.dbSeance);
                                return intro ? (
                                  <span className="text-[8px] px-1.5 py-px rounded-full truncate max-w-[90px]"
                                    style={{ backgroundColor: `${mod.color}15`, color: mod.color, border: `1px solid ${mod.color}20` }}>
                                    {intro.activityType.split(" · ")[0]}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                          </div>

                          {/* Mini icon */}
                          <div className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                            isSelected ? "opacity-50" : "text-bw-elevated group-hover:text-bw-text"
                          }`} style={isSelected ? { color: mod.color } : undefined}>
                            <ModuleIcon iconKey={mod.iconKey} size={14} />
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

// ── Mobile drawer wrapper ──
export function MobileSidebarDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-white/[0.06] lg:hidden bg-bw-surface"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
