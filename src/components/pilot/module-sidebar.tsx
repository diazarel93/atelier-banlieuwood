"use client";

import { memo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { type ModuleDef, type PhaseDef } from "@/lib/modules-data";
import type { SpecModuleId } from "@/lib/spec-modules";

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
  /** Spec module IDs enabled for this session (from formula). Null = all enabled. */
  modulesEnabled?: SpecModuleId[] | null;
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
  modulesEnabled,
}: ModuleSidebarProps) {
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(null);

  const [elapsed, setElapsed] = useState("");
  useEffect(() => {
    if (!moduleStartedAt) {
      setElapsed("");
      return;
    }
    function update() {
      const mins = Math.floor((Date.now() - new Date(moduleStartedAt!).getTime()) / 60000);
      setElapsed(mins < 1 ? "<1m" : `${mins}m`);
    }
    update();
    const iv = setInterval(update, 10000);
    return () => clearInterval(iv);
  }, [moduleStartedAt]);

  /** Check if a module is visible given modulesEnabled filter */
  function isModuleVisible(mod: ModuleDef): boolean {
    if (mod.disabled) return false;
    // If modulesEnabled is null/undefined, show all (backward compat)
    if (!modulesEnabled) return true;
    // If module has a specModule, check if it's in the enabled list
    if (mod.specModule) return modulesEnabled.includes(mod.specModule);
    // Bonus modules (no specModule) are hidden when a formula is active
    return false;
  }

  function getModuleStatus(mod: ModuleDef): "completed" | "active" | "available" | "locked" {
    if (completedModules.includes(mod.id)) return "completed";
    if (mod.id === activeModuleId) return "active";
    if (mod.disabled || !isModuleVisible(mod)) return "locked";
    return "available";
  }

  const activePhase = activeModuleId ? phases.find((p) => p.moduleIds.includes(activeModuleId)) : null;

  const visiblePhases = phases.filter((phase) =>
    phase.moduleIds.some((id) => {
      const mod = modules.find((m) => m.id === id);
      return mod && isModuleVisible(mod);
    }),
  );

  function getPhaseProgress(phase: PhaseDef) {
    const phaseMods = phase.moduleIds
      .map((id) => modules.find((m) => m.id === id))
      .filter((m): m is ModuleDef => !!m && isModuleVisible(m));
    const done = phaseMods.filter((m) => completedModules.includes(m.id)).length;
    return { done, total: phaseMods.length, allDone: done === phaseMods.length && done > 0 };
  }

  const allMods = modules.filter((m) => isModuleVisible(m));
  const globalDone = allMods.filter((m) => completedModules.includes(m.id)).length;
  const globalPct = allMods.length > 0 ? Math.round((globalDone / allMods.length) * 100) : 0;

  useEffect(() => {
    if (activeModuleId && activePhase) {
      setExpandedPhaseId(activePhase.id);
    }
  }, [activeModuleId, activePhase]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.isContentEditable)
        return;
      const digit = parseInt(e.key);
      if (digit >= 1 && digit <= visiblePhases.length) {
        e.preventDefault();
        const phase = visiblePhases[digit - 1];
        setExpandedPhaseId((prev) => (prev === phase.id ? null : phase.id));
      }
    },
    [visiblePhases],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-white/40">Parcours</h2>
          <span
            className="text-[13px] font-bold tabular-nums px-2.5 py-1 rounded-lg"
            style={{
              background:
                globalDone === allMods.length && globalDone > 0 ? "rgba(76,175,80,0.15)" : "rgba(255,255,255,0.06)",
              color: globalDone === allMods.length && globalDone > 0 ? "#66BB6A" : "rgba(255,255,255,0.7)",
            }}
          >
            {globalDone}/{allMods.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${globalPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              background:
                globalDone === allMods.length && globalDone > 0
                  ? "linear-gradient(90deg, #4CAF50, #66BB6A)"
                  : "linear-gradient(90deg, #FF6B35, #FF8F5E)",
            }}
          />
        </div>
      </div>

      {/* ── Phase list ── */}
      <div
        className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 scrollbar-thin"
        style={{ scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
      >
        {visiblePhases.map((phase, phaseIdx) => {
          const isActivePhase = activePhase?.id === phase.id;
          const isExpanded = expandedPhaseId === phase.id;
          const { done, total, allDone } = getPhaseProgress(phase);
          const phaseMods = phase.moduleIds
            .map((id) => modules.find((m) => m.id === id))
            .filter((m): m is ModuleDef => !!m && !m.disabled);

          return (
            <div key={phase.id}>
              {/* Phase button */}
              <button
                onClick={() => setExpandedPhaseId(isExpanded ? null : phase.id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                style={{
                  background: isExpanded
                    ? `${phase.color}15`
                    : isActivePhase
                      ? "rgba(255,255,255,0.04)"
                      : "transparent",
                }}
              >
                {/* Number + emoji */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{
                      background: isExpanded
                        ? `${phase.color}25`
                        : allDone
                          ? "rgba(76,175,80,0.15)"
                          : "rgba(255,255,255,0.06)",
                      border: isExpanded
                        ? `2px solid ${phase.color}60`
                        : allDone
                          ? "2px solid rgba(76,175,80,0.3)"
                          : "2px solid transparent",
                    }}
                  >
                    {allDone ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#66BB6A"
                        strokeWidth="3"
                        strokeLinecap="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <span>{phase.emoji}</span>
                    )}
                  </div>
                  {/* Active pulse */}
                  {isActivePhase && !isExpanded && (
                    <motion.div
                      className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full"
                      style={{ backgroundColor: phase.color, border: "2px solid #1A1A2E" }}
                      animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                </div>

                {/* Label + count */}
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold text-white/90 leading-tight group-hover:text-white transition-colors">
                    {phase.label}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {/* Mini progress dots */}
                    <div className="flex gap-1">
                      {Array.from({ length: total }).map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full transition-colors"
                          style={{
                            background:
                              i < done
                                ? "#66BB6A"
                                : isActivePhase && i === done
                                  ? phase.color
                                  : "rgba(255,255,255,0.12)",
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] tabular-nums text-white/30 font-medium">
                      {done}/{total}
                    </span>
                  </div>
                </div>

                {/* Chevron */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="flex-shrink-0 text-white/20 group-hover:text-white/40 transition-all duration-200"
                  style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Expanded modules */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="py-1.5 pl-5 pr-2 space-y-0.5">
                      {phaseMods.map((mod) => {
                        const status = getModuleStatus(mod);
                        const isActive = mod.id === activeModuleId;
                        const isDone = status === "completed";
                        const qCount = isActive && totalModuleQuestions ? totalModuleQuestions : mod.questions;

                        return (
                          <button
                            key={mod.id}
                            onClick={() => onSelectModule(mod.id)}
                            className="w-full text-left rounded-lg px-3 py-2.5 transition-all duration-150 group/mod focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                            style={{
                              background: isActive ? `${mod.color}12` : "transparent",
                              borderLeft: isActive ? `3px solid ${mod.color}` : "3px solid transparent",
                            }}
                          >
                            <div className="flex items-center gap-2.5">
                              {/* Status */}
                              {isDone ? (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#66BB6A"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  className="flex-shrink-0"
                                >
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                              ) : isActive ? (
                                <motion.div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ background: mod.color, boxShadow: `0 0 8px ${mod.color}80` }}
                                  animate={{ scale: [1, 1.4, 1] }}
                                  transition={{ repeat: Infinity, duration: 1.5 }}
                                />
                              ) : (
                                <div
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ background: "rgba(255,255,255,0.15)" }}
                                />
                              )}

                              {/* Title — FULL, no truncation */}
                              <span
                                className={`text-[14px] leading-snug flex-1 ${
                                  isActive
                                    ? "text-white font-semibold"
                                    : isDone
                                      ? "text-white/35 line-through decoration-white/15"
                                      : "text-white/60 group-hover/mod:text-white/80"
                                }`}
                              >
                                {mod.title}
                              </span>

                              {/* Duration */}
                              {!isActive && (
                                <span className="text-[11px] text-white/20 flex-shrink-0 tabular-nums font-medium">
                                  {mod.duration}
                                </span>
                              )}
                            </div>

                            {/* Active: progress row */}
                            {isActive && (
                              <div className="flex items-center gap-2.5 mt-1.5 ml-[22px]">
                                {qCount > 0 && (
                                  <span className="text-[12px] font-bold tabular-nums" style={{ color: mod.color }}>
                                    Q{(currentQuestionIndex ?? 0) + 1}/{qCount}
                                  </span>
                                )}
                                {responsesCount !== undefined && responsesCount > 0 && (
                                  <motion.span
                                    key={responsesCount}
                                    initial={{ scale: 1.4, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full"
                                    style={{ background: "rgba(76,175,80,0.15)", color: "#66BB6A" }}
                                  >
                                    {responsesCount} rep.
                                  </motion.span>
                                )}
                                {elapsed && (
                                  <span className="text-[11px] tabular-nums font-semibold" style={{ color: "#F5A45B" }}>
                                    {elapsed}
                                  </span>
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
  );
}

export const ModuleSidebar = memo(ModuleSidebarInner);

// ── Sidebar Drawer — unified overlay for all screen sizes ──
export function SidebarDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-y-0 left-0 z-50 w-[280px] sm:w-[300px] flex flex-col"
            style={{
              background: "linear-gradient(180deg, #1A1A2E 0%, #16162A 100%)",
              borderRight: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
            }}
          >
            {/* Close button */}
            <div className="flex items-center justify-end px-3 pt-3 pb-0">
              <button
                onClick={onClose}
                aria-label="Fermer le parcours"
                className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
