"use client";

import { memo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { type ModuleDef, type PhaseDef } from "@/lib/modules-data";

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
      {/* ── SIDEBAR — full panel with labels ── */}
      <div className="fixed left-0 top-14 bottom-0 z-30 hidden sm:flex flex-col w-[220px] bg-white/95 backdrop-blur-sm border-r border-[#E8DFD2]"
        style={{ boxShadow: "2px 0 12px rgba(61,43,16,0.04)" }}
      >
        {/* Global progress header */}
        <div className="px-4 pt-4 pb-3 border-b border-[#EFE4D8]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A9082]">Modules</span>
            <span className="text-[13px] font-bold tabular-nums px-2 py-0.5 rounded-full"
              style={{
                background: globalDone === allMods.length && globalDone > 0 ? "#F0FAF4" : "#F5F1EB",
                color: globalDone === allMods.length && globalDone > 0 ? "#4CAF50" : "#2C2C2C",
              }}
            >
              {globalDone}/{allMods.length}
            </span>
          </div>
          {/* Mini progress bar */}
          <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-[#F0EBE0]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${allMods.length > 0 ? Math.round((globalDone / allMods.length) * 100) : 0}%`,
                background: globalDone === allMods.length && globalDone > 0
                  ? "linear-gradient(90deg, #4CAF50, #66BB6A)"
                  : "linear-gradient(90deg, #FF6B35, #FF8F5E)",
              }}
            />
          </div>
        </div>

        {/* Scrollable phase list */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {visiblePhases.map((phase) => {
            const isActivePhase = activePhase?.id === phase.id;
            const isExpanded = expandedPhaseId === phase.id;
            const { done, total, allDone } = getPhaseProgress(phase);
            const phaseMods = phase.moduleIds
              .map((id) => modules.find((m) => m.id === id))
              .filter((m): m is ModuleDef => !!m && !m.disabled);

            return (
              <div key={phase.id}>
                {/* Phase header button */}
                <button
                  onClick={() => setExpandedPhaseId(isExpanded ? null : phase.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all duration-150 group focus-visible:ring-2 focus-visible:ring-[#6B8CFF] focus-visible:outline-none"
                  style={{
                    background: isExpanded
                      ? `${phase.color}0C`
                      : isActivePhase
                        ? `${phase.color}06`
                        : undefined,
                  }}
                >
                  {/* Phase emoji + indicator */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all"
                      style={{
                        background: isExpanded ? `${phase.color}18` : "#F5F1EB",
                        border: isExpanded ? `1.5px solid ${phase.color}40` : "1.5px solid transparent",
                      }}
                    >
                      {phase.emoji}
                    </div>
                    {/* Active pulse dot */}
                    {isActivePhase && !isExpanded && (
                      <motion.div
                        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: phase.color, border: "2px solid white" }}
                        animate={{ scale: [0.8, 1.2, 0.8] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    )}
                    {/* Done badge */}
                    {allDone && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center" style={{ border: "1.5px solid #C6E9D0" }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="4" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                      </div>
                    )}
                  </div>

                  {/* Label + progress */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[#2C2C2C] truncate leading-tight group-hover:text-[#1a1a1a]">
                      {phase.label}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex-1 h-1 rounded-full bg-[#F0EBE0] max-w-[60px]">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${total > 0 ? Math.round((done / total) * 100) : 0}%`,
                            background: allDone ? "#4CAF50" : phase.color,
                          }}
                        />
                      </div>
                      <span className="text-[10px] tabular-nums text-[#9A9082] font-medium">{done}/{total}</span>
                    </div>
                  </div>

                  {/* Chevron */}
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A9082" strokeWidth="2" strokeLinecap="round"
                    className="flex-shrink-0 transition-transform duration-200"
                    style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>

                {/* Expanded modules list */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 pr-1 py-1 space-y-0.5">
                        {phaseMods.map((mod) => {
                          const status = getModuleStatus(mod);
                          const isActive = mod.id === activeModuleId;
                          const isDone = status === "completed";
                          const qCount = isActive && totalModuleQuestions ? totalModuleQuestions : mod.questions;

                          return (
                            <button
                              key={mod.id}
                              onClick={() => { onSelectModule(mod.id); }}
                              className="w-full text-left rounded-lg px-2.5 py-2 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#6B8CFF] focus-visible:outline-none group/mod"
                              style={{
                                background: isActive ? `${mod.color}0C` : undefined,
                                borderLeft: isActive ? `3px solid ${mod.color}` : "3px solid transparent",
                              }}
                            >
                              <div className="flex items-center gap-2">
                                {/* Status dot */}
                                {isDone ? (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" className="flex-shrink-0"><path d="M20 6L9 17l-5-5" /></svg>
                                ) : isActive ? (
                                  <motion.div
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ background: mod.color }}
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                  />
                                ) : (
                                  <div className="w-2 h-2 rounded-full flex-shrink-0 bg-[#D4CDC3]" />
                                )}

                                {/* Title */}
                                <span className={`text-[12.5px] leading-snug flex-1 truncate ${
                                  isActive ? "text-[#2C2C2C] font-semibold" : isDone ? "text-[#9A9082]" : "text-[#5A5A5A] group-hover/mod:text-[#2C2C2C]"
                                }`}>
                                  {mod.title}
                                </span>

                                {/* Duration */}
                                {!isActive && (
                                  <span className="text-[10px] text-[#B0A89C] flex-shrink-0 tabular-nums">{mod.duration}</span>
                                )}
                              </div>

                              {/* Active progress row */}
                              {isActive && (
                                <div className="flex items-center gap-2 mt-1 ml-[18px]">
                                  {qCount > 0 && (
                                    <span className="text-[11px] font-medium tabular-nums" style={{ color: mod.color }}>
                                      Q{(currentQuestionIndex ?? 0) + 1}/{qCount}
                                    </span>
                                  )}
                                  {responsesCount !== undefined && responsesCount > 0 && (
                                    <motion.span
                                      key={responsesCount}
                                      initial={{ scale: 1.3, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full"
                                      style={{ background: "#F0FAF4", color: "#4CAF50" }}
                                    >
                                      {responsesCount} rep.
                                    </motion.span>
                                  )}
                                  {elapsed && (
                                    <span className="text-[10px] tabular-nums font-medium" style={{ color: "#F5A45B" }}>{elapsed}</span>
                                  )}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Click-away to close expanded panel (no longer needed but keep for compat) */}
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
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-[300px] overflow-y-auto bg-white"
            style={{ borderRight: "1px solid #E8DFD2", boxShadow: "4px 0 24px rgba(61,43,16,0.10)" }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
