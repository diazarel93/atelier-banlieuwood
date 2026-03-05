"use client";

import { memo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { type ModuleDef, type PhaseDef } from "@/lib/modules-data";
import { ModuleIcon } from "./module-icon";
import { getSeanceIntro } from "@/lib/seance-intros";

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

/** Tiny SVG progress ring around phase icon */
function PhaseRing({ done, total, color }: { done: number; total: number; color: string }) {
  const pct = total > 0 ? done / total : 0;
  const r = 17;
  const circ = 2 * Math.PI * r;
  return (
    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
      {pct > 0 && (
        <circle
          cx="18" cy="18" r={r}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${pct * circ} ${circ}`}
          className="transition-all duration-700"
          style={{ stroke: pct >= 1 ? "#4ECDC4" : color }}
        />
      )}
    </svg>
  );
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

  // Phase containing the active module
  const activePhase = activeModuleId
    ? phases.find((p) => p.moduleIds.includes(activeModuleId))
    : null;

  // Only show phases that have at least 1 non-disabled module
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

  // Global progress
  const allMods = modules.filter((m) => !m.disabled);
  const globalDone = allMods.filter((m) => completedModules.includes(m.id)).length;

  // ── Auto-expand active phase when activeModuleId changes ──
  useEffect(() => {
    if (activeModuleId && activePhase) {
      setExpandedPhaseId(activePhase.id);
    }
  }, [activeModuleId, activePhase]);

  // ── Keyboard shortcuts: digits 1-9 toggle phases ──
  const handleKey = useCallback((e: KeyboardEvent) => {
    // Skip if user is typing in an input
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
        <div className="flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded-2xl bg-bw-deep/80 backdrop-blur-md border border-white/[0.08] shadow-xl">
          {/* Global progress mini */}
          <div className="flex flex-col items-center gap-0.5 pb-1 border-b border-white/[0.06] mb-0.5 w-full">
            <span className="text-[7px] text-bw-muted font-semibold uppercase tracking-wider">Parcours</span>
            <span className="text-[8px] tabular-nums" style={{ color: globalDone === allMods.length && globalDone > 0 ? "#4ECDC4" : "#555960" }}>
              {globalDone}/{allMods.length}
            </span>
          </div>

          {visiblePhases.map((phase, idx) => {
            const isActivePhase = activePhase?.id === phase.id;
            const isExpanded = expandedPhaseId === phase.id;
            const { done, total, allDone } = getPhaseProgress(phase);

            return (
              <button
                key={phase.id}
                onClick={() => setExpandedPhaseId(isExpanded ? null : phase.id)}
                title={`${phase.label} (${done}/${total}) — touche ${idx + 1}`}
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none ${
                  isExpanded ? "scale-110" : "hover:scale-105 hover:bg-white/[0.06]"
                }`}
                style={{
                  background: isExpanded
                    ? `linear-gradient(135deg, ${phase.color}30, ${phase.color}10)`
                    : isActivePhase
                      ? `linear-gradient(135deg, ${phase.color}20, ${phase.color}08)`
                      : undefined,
                  border: isExpanded
                    ? `1.5px solid ${phase.color}50`
                    : isActivePhase
                      ? `1px solid ${phase.color}25`
                      : "1px solid transparent",
                }}
              >
                {/* Progress ring */}
                <PhaseRing done={done} total={total} color={phase.color} />

                <span className="leading-none relative z-10">{phase.emoji}</span>

                {/* Keyboard hint */}
                <span className="absolute -bottom-0.5 -left-0.5 text-[7px] text-white/20 font-mono leading-none pointer-events-none">
                  {idx + 1}
                </span>

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
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-bw-deep flex items-center justify-center z-10">
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="4" strokeLinecap="round">
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
                className="ml-2 w-[220px] rounded-2xl bg-bw-deep/90 backdrop-blur-md border border-white/[0.08] shadow-2xl overflow-hidden"
              >
                {/* Phase presentation header */}
                <div className="px-3 pt-3 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none">{phase.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-bw-heading truncate">{phase.label}</span>
                        <span className="text-[9px] tabular-nums flex-shrink-0" style={{ color: done === total && done > 0 ? "#4ECDC4" : "#555960" }}>
                          {done}/{total}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Phase description */}
                  <p className="text-[10px] text-bw-muted leading-relaxed mt-1.5">{phase.description}</p>
                  {/* Mini progress bar */}
                  <div className="mt-1.5 h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${total > 0 ? Math.round((done / total) * 100) : 0}%`,
                        background: done === total && done > 0 ? "linear-gradient(90deg, #4ECDC4, #10B981)" : `linear-gradient(90deg, ${phase.color}, ${phase.color}80)`,
                      }}
                    />
                  </div>
                </div>

                {/* Séances label */}
                <div className="px-3 pt-1 pb-0.5">
                  <span className="text-[8px] uppercase tracking-wider text-bw-muted font-semibold">Séances</span>
                </div>

                {/* Module list — with step numbers + connecting line */}
                <div className="px-2 pb-2">
                  {phaseMods.map((mod, modIdx) => {
                    const status = getModuleStatus(mod);
                    const isActive = mod.id === activeModuleId;
                    const isDone = status === "completed";
                    const intro = getSeanceIntro(mod.dbModule, mod.dbSeance);
                    const qCount = isActive && totalModuleQuestions ? totalModuleQuestions : mod.questions;
                    const isLast = modIdx === phaseMods.length - 1;

                    return (
                      <div key={mod.id} className="flex gap-0">
                        {/* Step number + vertical connector line */}
                        <div className="flex flex-col items-center w-5 flex-shrink-0">
                          <div
                            className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 z-10 border"
                            style={{
                              background: isDone
                                ? "#4ECDC420"
                                : isActive
                                  ? `${phase.color}30`
                                  : "rgba(255,255,255,0.04)",
                              borderColor: isDone
                                ? "#4ECDC440"
                                : isActive
                                  ? `${phase.color}60`
                                  : "rgba(255,255,255,0.08)",
                              color: isDone
                                ? "#4ECDC4"
                                : isActive
                                  ? phase.color
                                  : "#555960",
                            }}
                          >
                            {isDone ? "✓" : modIdx + 1}
                          </div>
                          {/* Connector line to next module */}
                          {!isLast && (
                            <div
                              className="w-px flex-1 min-h-[8px]"
                              style={{
                                background: isDone
                                  ? `linear-gradient(180deg, #4ECDC440, #4ECDC420)`
                                  : `linear-gradient(180deg, ${phase.color}20, ${phase.color}08)`,
                              }}
                            />
                          )}
                        </div>

                        {/* Module button */}
                        <button
                          onClick={() => {
                            onSelectModule(mod.id);
                            setExpandedPhaseId(null);
                          }}
                          className={`flex-1 min-w-0 px-1.5 py-1.5 rounded-lg flex items-center gap-1.5 text-left transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-bw-teal focus-visible:outline-none ${
                            isActive ? "" : "hover:bg-white/[0.04]"
                          } ${!isLast ? "mb-0.5" : ""}`}
                          style={isActive ? { background: `linear-gradient(90deg, ${mod.color}15, ${mod.color}05)` } : undefined}
                        >
                          {/* Icon */}
                          <div className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isDone ? "#4ECDC4" : mod.color }}>
                            <ModuleIcon iconKey={mod.iconKey} size={14} />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className={`text-[10px] truncate ${isActive ? "text-bw-heading font-medium" : isDone ? "text-bw-muted" : "text-bw-text"}`}>
                                {mod.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] text-bw-muted">{mod.duration}</span>
                              {intro && (
                                <span className="text-[7px] px-1 py-px rounded-full" style={{ backgroundColor: `${mod.color}12`, color: mod.color }}>
                                  {intro.activityType.split(" · ")[0]}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right side: status */}
                          {isDone && <span className="text-[9px] text-bw-teal flex-shrink-0">✓</span>}
                          {isActive && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {qCount > 0 && (
                                <span className="text-[8px] text-bw-muted tabular-nums">
                                  {(currentQuestionIndex ?? 0) + 1}/{qCount}
                                </span>
                              )}
                              {responsesCount !== undefined && responsesCount > 0 && (
                                <motion.span
                                  key={responsesCount}
                                  initial={{ scale: 1.3, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="text-[8px] font-bold text-bw-teal bg-bw-teal/10 px-1 py-px rounded-full tabular-nums"
                                >
                                  {responsesCount}
                                </motion.span>
                              )}
                              {elapsed && <span className="text-[8px] text-bw-primary tabular-nums">{elapsed}</span>}
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* Click-away to close panel — non-blocking: pointer-events only on overlay */}
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
            className="fixed inset-0 z-40 bg-black/40 sm:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -240, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -240, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-[240px] border-r border-white/[0.06] sm:hidden bg-bw-surface"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
