"use client";

import { memo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { type ModuleDef, type PhaseDef } from "@/lib/modules-data";
import { ModuleIcon } from "./module-icon";

interface ModuleSidebarProps {
  modules: ModuleDef[];
  phases: PhaseDef[];
  activeModuleId: string | null;
  selectedModuleId?: string | null;
  completedModules: string[];
  onSelectModule: (moduleId: string) => void;
  onQuickLaunch?: (moduleId: string) => void;
  responsesCount?: number;
  moduleStartedAt?: string | null;
  sessionStatus?: string;
  currentQuestionIndex?: number;
  totalModuleQuestions?: number;
}

function ModuleSidebarInner({
  modules,
  phases,
  activeModuleId,
  completedModules,
  onSelectModule,
  responsesCount,
  moduleStartedAt,
  currentQuestionIndex,
  totalModuleQuestions,
}: ModuleSidebarProps) {
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(null);

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

  function getModuleStatus(mod: ModuleDef): "completed" | "active" | "available" | "locked" {
    if (completedModules.includes(mod.id)) return "completed";
    if (mod.id === activeModuleId) return "active";
    if (mod.disabled) return "locked";
    return "available";
  }

  const activePhase = activeModuleId
    ? phases.find((p) => p.moduleIds.includes(activeModuleId))
    : null;

  const visiblePhases = phases.filter((phase) =>
    phase.moduleIds.some((id) => {
      const mod = modules.find((m) => m.id === id);
      return mod && !mod.disabled;
    })
  );

  function getPhaseProgress(phase: PhaseDef) {
    const phaseMods = phase.moduleIds
      .map((id) => modules.find((m) => m.id === id))
      .filter((m): m is ModuleDef => !!m && !m.disabled);
    const done = phaseMods.filter((m) => completedModules.includes(m.id)).length;
    return { done, total: phaseMods.length, allDone: done === phaseMods.length && done > 0 };
  }

  const allMods = modules.filter((m) => !m.disabled);
  const globalDone = allMods.filter((m) => completedModules.includes(m.id)).length;

  useEffect(() => {
    if (activeModuleId && activePhase) {
      setExpandedPhaseId(activePhase.id);
    }
  }, [activeModuleId, activePhase]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.isContentEditable) return;

    const digit = parseInt(e.key);
    if (digit >= 1 && digit <= visiblePhases.length) {
      e.preventDefault();
      const phase = visiblePhases[digit - 1];
      setExpandedPhaseId((prev) => (prev === phase.id ? null : phase.id));
    }
  }, [visiblePhases]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <>
      {/* ── FLOATING PHASE DOCK — sm+ ── */}
      <div className="fixed left-2.5 top-1/2 -translate-y-1/2 z-30 hidden sm:flex items-start gap-0">
        {/* Phase icon strip */}
        <div
          className="flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded-[16px]"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E8DFD2",
            boxShadow: "0 4px 16px rgba(61,43,16,0.08), 0 1px 3px rgba(61,43,16,0.04)",
          }}
        >
          {/* Global progress mini */}
          <div className="flex flex-col items-center gap-0.5 pb-1.5 mb-0.5 w-full" style={{ borderBottom: "1px solid #EFE4D8" }}>
            <span className="text-[11px] font-semibold text-[#7A7A7A] uppercase tracking-wider">Modules</span>
            <span className="text-[12px] font-bold tabular-nums" style={{ color: globalDone === allMods.length && globalDone > 0 ? "#57C4B6" : "#5B5B5B" }}>
              {globalDone}/{allMods.length}
            </span>
          </div>

          {visiblePhases.map((phase) => {
            const isActivePhase = activePhase?.id === phase.id;
            const isExpanded = expandedPhaseId === phase.id;
            const { allDone } = getPhaseProgress(phase);

            return (
              <button
                key={phase.id}
                onClick={() => setExpandedPhaseId(isExpanded ? null : phase.id)}
                title={phase.label}
                className="relative w-9 h-9 rounded-[10px] flex items-center justify-center text-base transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#6B8CFF] focus-visible:outline-none"
                style={{
                  transform: isExpanded ? "scale(1.1)" : undefined,
                  background: isExpanded
                    ? `linear-gradient(135deg, ${phase.color}25, ${phase.color}08)`
                    : isActivePhase
                      ? `linear-gradient(135deg, ${phase.color}15, ${phase.color}05)`
                      : undefined,
                  border: isExpanded
                    ? `1.5px solid ${phase.color}40`
                    : isActivePhase
                      ? `1px solid ${phase.color}20`
                      : "1px solid transparent",
                }}
              >
                <span className="leading-none relative z-10">{phase.emoji}</span>

                {/* Active phase pulse */}
                {isActivePhase && !isExpanded && (
                  <motion.div
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                    style={{ backgroundColor: phase.color }}
                    animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}

                {/* All done badge */}
                {allDone && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center z-10" style={{ background: "#FFFFFF", border: "1px solid #D5EDE8" }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#57C4B6" strokeWidth="4" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Phase detail panel — modules list ── */}
        <AnimatePresence mode="wait">
          {expandedPhaseId && (() => {
            const phase = phases.find((p) => p.id === expandedPhaseId);
            if (!phase) return null;
            const phaseMods = phase.moduleIds
              .map((id) => modules.find((m) => m.id === id))
              .filter((m): m is ModuleDef => !!m && !m.disabled);
            const { done, total } = getPhaseProgress(phase);

            return (
              <motion.div
                key={expandedPhaseId}
                initial={{ opacity: 0, x: -8, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -8, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="ml-2 w-[230px] rounded-[16px] overflow-hidden"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E8DFD2",
                  boxShadow: "0 8px 32px rgba(61,43,16,0.10), 0 2px 8px rgba(61,43,16,0.04)",
                }}
              >
                {/* Phase header */}
                <div className="px-3.5 pt-3.5 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-lg" style={{ background: `${phase.color}15` }}>
                      {phase.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] font-semibold text-[#2C2C2C] truncate block">{phase.label}</span>
                      <span className="text-[12px] tabular-nums" style={{ color: done === total && done > 0 ? "#57C4B6" : "#7A7A7A" }}>
                        {done}/{total} termine{done !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2.5 h-1.5 rounded-full overflow-hidden" style={{ background: "#F0EBE0" }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${total > 0 ? Math.round((done / total) * 100) : 0}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      style={{
                        background: done === total && done > 0
                          ? "linear-gradient(90deg, #57C4B6, #4CAF50)"
                          : `linear-gradient(90deg, ${phase.color}, ${phase.color}90)`,
                      }}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-3 h-px" style={{ background: "#EFE4D8" }} />

                {/* Seances label */}
                <div className="px-3.5 pt-2 pb-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[#B0A99E]">Seances</span>
                </div>

                {/* Module list */}
                <div className="px-2 pb-2.5 space-y-0.5">
                  {phaseMods.map((mod) => {
                    const status = getModuleStatus(mod);
                    const isActive = mod.id === activeModuleId;
                    const isDone = status === "completed";
                    const qCount = isActive && totalModuleQuestions ? totalModuleQuestions : mod.questions;

                    return (
                      <button
                        key={mod.id}
                        onClick={() => {
                          onSelectModule(mod.id);
                          setExpandedPhaseId(null);
                        }}
                        className="w-full px-2.5 py-2 rounded-[10px] flex items-center gap-2.5 text-left transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#6B8CFF] focus-visible:outline-none"
                        style={{
                          background: isActive
                            ? `linear-gradient(90deg, ${mod.color}12, ${mod.color}04)`
                            : undefined,
                          border: isActive ? `1px solid ${mod.color}20` : "1px solid transparent",
                        }}
                        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#FAF6EE"; }}
                        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = ""; }}
                      >
                        {/* Status indicator */}
                        <span className="flex-shrink-0 text-xs">
                          {isDone ? (
                            <span className="w-4 h-4 rounded-full inline-flex items-center justify-center" style={{ background: "#EFFAF8" }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#57C4B6" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                            </span>
                          ) : isActive ? (
                            <span className="w-4 h-4 rounded-full inline-flex items-center justify-center" style={{ background: `${mod.color}20` }}>
                              <span className="w-2 h-2 rounded-full block" style={{ background: mod.color }} />
                            </span>
                          ) : (
                            <span className="w-4 h-4 rounded-full inline-flex items-center justify-center" style={{ background: "#F0EBE0" }}>
                              <span className="w-1.5 h-1.5 rounded-full block" style={{ background: "#C4BDB2" }} />
                            </span>
                          )}
                        </span>

                        {/* Icon */}
                        <div className="w-4 h-4 flex-shrink-0" style={{ color: isDone ? "#57C4B6" : isActive ? mod.color : "#7A7A7A" }}>
                          <ModuleIcon iconKey={mod.iconKey} size={16} />
                        </div>

                        {/* Title */}
                        <span className={`text-[13px] truncate flex-1 ${isActive ? "text-[#2C2C2C] font-medium" : isDone ? "text-[#B0A99E]" : "text-[#5B5B5B]"}`}>
                          {mod.title}
                        </span>

                        {/* Right side: active info */}
                        {isActive && (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {qCount > 0 && (
                              <span className="text-[11px] text-[#7A7A7A] tabular-nums">
                                {(currentQuestionIndex ?? 0) + 1}/{qCount}
                              </span>
                            )}
                            {responsesCount !== undefined && responsesCount > 0 && (
                              <motion.span
                                key={responsesCount}
                                initial={{ scale: 1.3, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded-full"
                                style={{ background: "#EFFAF8", color: "#57C4B6" }}
                              >
                                {responsesCount}
                              </motion.span>
                            )}
                            {elapsed && <span className="text-[11px] tabular-nums" style={{ color: "#F5A45B" }}>{elapsed}</span>}
                          </div>
                        )}

                        {/* Duration for non-active */}
                        {!isActive && (
                          <span className="text-[11px] text-[#B0A99E] flex-shrink-0">{mod.duration}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* Click-away to close panel */}
      {expandedPhaseId && (
        <div className="fixed inset-0 z-20 hidden sm:block" onClick={() => setExpandedPhaseId(null)} />
      )}
    </>
  );
}

export const ModuleSidebar = memo(ModuleSidebarInner);

// ── Mobile drawer (below sm) ──
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
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-[280px] overflow-y-auto"
            style={{
              background: "#FFFFFF",
              borderRight: "1px solid #E8DFD2",
              boxShadow: "4px 0 24px rgba(61,43,16,0.08)",
            }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
