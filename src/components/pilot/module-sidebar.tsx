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
      {/* ── FLOATING DOCK — icons strip ── */}
      <div className="fixed left-3 top-1/2 -translate-y-1/2 z-30 hidden sm:flex items-start gap-0">
        <div
          className="flex flex-col items-center gap-1 py-3 px-1.5"
          style={{
            borderRadius: 18,
            background: "#FFFFFF",
            border: "1px solid #E8DFD2",
            boxShadow: "0 4px 20px rgba(61,43,16,0.08), 0 1px 3px rgba(61,43,16,0.04)",
          }}
        >
          {/* Global progress */}
          <div className="flex flex-col items-center gap-0.5 pb-2 mb-1 w-full" style={{ borderBottom: "1px solid #EFE4D8" }}>
            <span className="text-[10px] font-bold text-[#B0A99E] uppercase tracking-widest">Modules</span>
            <span className="text-[13px] font-bold tabular-nums" style={{ color: globalDone === allMods.length && globalDone > 0 ? "#4CAF50" : "#2C2C2C" }}>
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
                className="relative w-10 h-10 rounded-[12px] flex items-center justify-center text-lg transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#6B8CFF] focus-visible:outline-none"
                style={{
                  background: isExpanded
                    ? `${phase.color}18`
                    : isActivePhase
                      ? `${phase.color}0A`
                      : undefined,
                  border: isExpanded
                    ? `2px solid ${phase.color}50`
                    : isActivePhase
                      ? `1.5px solid ${phase.color}25`
                      : "1.5px solid transparent",
                  transform: isExpanded ? "scale(1.08)" : undefined,
                }}
              >
                <span className="leading-none">{phase.emoji}</span>

                {/* Active pulse */}
                {isActivePhase && !isExpanded && (
                  <motion.div
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: phase.color, border: "2px solid #FFFFFF" }}
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}

                {/* Done badge */}
                {allDone && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#FFFFFF", border: "1.5px solid #C6E9D0", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="3.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── DETAIL PANEL — wide, readable ── */}
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
                initial={{ opacity: 0, x: -10, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -10, scale: 0.96 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="ml-2.5 w-[320px] overflow-hidden"
                style={{
                  borderRadius: 18,
                  background: "#FFFFFF",
                  border: "1px solid #E8DFD2",
                  boxShadow: "0 8px 32px rgba(61,43,16,0.12), 0 2px 8px rgba(61,43,16,0.05)",
                }}
              >
                {/* Phase header */}
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-[12px] flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${phase.color}15`, border: `1.5px solid ${phase.color}25` }}
                    >
                      {phase.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-bold text-[#2C2C2C] leading-tight">{phase.label}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[13px] tabular-nums font-medium" style={{ color: done === total && done > 0 ? "#4CAF50" : "#7A7A7A" }}>
                          {done}/{total} termine{done !== 1 ? "s" : ""}
                        </span>
                        {done === total && done > 0 && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F0FAF4", color: "#4CAF50" }}>Complet</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "#F0EBE0" }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${total > 0 ? Math.round((done / total) * 100) : 0}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{
                        background: done === total && done > 0
                          ? "linear-gradient(90deg, #4CAF50, #66BB6A)"
                          : `linear-gradient(90deg, ${phase.color}, ${phase.color}BB)`,
                      }}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px mx-4" style={{ background: "#EFE4D8" }} />

                {/* Seances list */}
                <div className="p-2.5 space-y-1">
                  {phaseMods.map((mod) => {
                    const status = getModuleStatus(mod);
                    const isActive = mod.id === activeModuleId;
                    const isDone = status === "completed";
                    const qCount = isActive && totalModuleQuestions ? totalModuleQuestions : mod.questions;

                    return (
                      <button
                        key={mod.id}
                        onClick={() => { onSelectModule(mod.id); setExpandedPhaseId(null); }}
                        className="w-full text-left rounded-[12px] transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#6B8CFF] focus-visible:outline-none group"
                        style={{
                          padding: isActive ? "10px 12px" : "8px 12px",
                          background: isActive
                            ? `linear-gradient(135deg, ${mod.color}10, ${mod.color}05)`
                            : undefined,
                          border: isActive ? `1.5px solid ${mod.color}30` : "1.5px solid transparent",
                        }}
                        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#FAF6EE"; }}
                        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = ""; }}
                      >
                        <div className="flex items-center gap-3">
                          {/* Status indicator */}
                          {isDone ? (
                            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#F0FAF4", border: "1.5px solid #C6E9D0" }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                            </div>
                          ) : isActive ? (
                            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${mod.color}20`, border: `1.5px solid ${mod.color}40` }}>
                              <motion.div
                                className="w-2 h-2 rounded-full"
                                style={{ background: mod.color }}
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                              />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#F0EBE0" }}>
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#C4BDB2" }} />
                            </div>
                          )}

                          {/* Title — FULL, no truncation */}
                          <span className={`text-[14px] leading-snug flex-1 ${
                            isActive ? "text-[#2C2C2C] font-semibold" : isDone ? "text-[#B0A99E]" : "text-[#5B5B5B] group-hover:text-[#2C2C2C]"
                          }`}>
                            {mod.title}
                          </span>

                          {/* Duration badge (non-active) */}
                          {!isActive && (
                            <span className="text-[12px] text-[#B0A99E] flex-shrink-0 tabular-nums">{mod.duration}</span>
                          )}
                        </div>

                        {/* Active module: progress row below title */}
                        {isActive && (
                          <div className="flex items-center gap-2.5 mt-2 ml-8">
                            {qCount > 0 && (
                              <span className="text-[12px] font-medium tabular-nums" style={{ color: mod.color }}>
                                Question {(currentQuestionIndex ?? 0) + 1}/{qCount}
                              </span>
                            )}
                            {responsesCount !== undefined && responsesCount > 0 && (
                              <motion.span
                                key={responsesCount}
                                initial={{ scale: 1.3, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full"
                                style={{ background: "#F0FAF4", color: "#4CAF50" }}
                              >
                                {responsesCount} rep.
                              </motion.span>
                            )}
                            {elapsed && (
                              <span className="text-[11px] tabular-nums font-medium" style={{ color: "#F5A45B" }}>{elapsed}</span>
                            )}
                          </div>
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
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-[300px] overflow-y-auto"
            style={{
              background: "#FFFFFF",
              borderRight: "1px solid #E8DFD2",
              boxShadow: "4px 0 24px rgba(61,43,16,0.10)",
            }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
