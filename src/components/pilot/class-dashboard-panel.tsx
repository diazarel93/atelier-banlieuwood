"use client";

import { useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { StudentState } from "@/components/pilot/pulse-ring";
import { ClassroomMap } from "@/components/pilot/classroom-map";
import { CognitiveMap } from "@/components/pilot/cognitive-map";

// ═══════════════════════════════════════════════════════════════
// CLASS DASHBOARD PANEL — Left sidebar: engagement donut, hands,
// mini classroom map, cognitive bars (glassmorphism cards)
// ═══════════════════════════════════════════════════════════════

interface ClassDashboardPanelProps {
  session: {
    id: string;
    status: string;
    students?: {
      id: string;
      display_name: string;
      avatar: string;
      is_active: boolean;
      kicked?: boolean;
      hand_raised_at?: string | null;
      warnings?: number;
    }[];
  };
  studentStates: { id: string; state: StudentState; display_name: string; avatar: string }[];
  stuckStudents: { id: string; name: string }[];
  responses: { student_id: string; is_hidden?: boolean; text?: string; students?: { avatar?: string; display_name?: string } }[];
  teams: { id: string; team_name: string; team_color: string; team_number: number; students: { id: string; display_name: string; avatar: string }[] }[];
  interventionMode: boolean;
  setInterventionMode: (fn: (v: boolean) => boolean) => void;
  setFicheStudentId: (id: string) => void;
  lowerHand: { mutate: (id: string) => void; isPending: boolean };
  handleNudgeAllStuck: () => void;
  // ClassroomMap props
  classroomLayout: "rows" | "u-shape" | "islands" | "free";
  moduleResponseTexts: Map<string, string>;
  onNudge: (responseId: string, text: string) => void;
  onWarn: (sid: string) => void;
  onBroadcast: () => void;
  // CognitiveMap props (optional — only for M1 Positioning)
  cognitiveOptions?: { key: string; label: string; count: number }[];
  cognitiveTotal?: number;
}

// ── Glassmorphism card wrapper ──
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl p-3 ${className}`}
      style={{
        background: "rgba(255,255,255,0.7)",
        border: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 1px 4px rgba(61,43,16,0.04)",
      }}
    >
      {children}
    </div>
  );
}

function ClassDashboardPanelInner({
  session,
  studentStates,
  stuckStudents,
  responses,
  teams,
  interventionMode,
  setInterventionMode,
  setFicheStudentId,
  lowerHand,
  handleNudgeAllStuck,
  classroomLayout,
  moduleResponseTexts,
  onNudge,
  onWarn,
  onBroadcast,
  cognitiveOptions,
  cognitiveTotal,
}: ClassDashboardPanelProps) {
  const [mapExpanded, setMapExpanded] = useState(false);

  // Compute engagement stats
  const stats = useMemo(() => {
    const respondedN = studentStates.filter(s => s.state === "responded").length;
    const thinkingN = studentStates.filter(s => s.state === "active").length;
    const stuckN = studentStates.filter(s => s.state === "stuck").length;
    const offN = studentStates.filter(s => s.state === "disconnected").length;
    const total = respondedN + thinkingN + stuckN + offN;
    const engagementPct = total > 0 ? Math.round(((respondedN + thinkingN) / total) * 100) : 0;
    const online = respondedN + thinkingN + stuckN;
    return { respondedN, thinkingN, stuckN, offN, total, engagementPct, online };
  }, [studentStates]);

  // Suggestion logic
  const suggestion = useMemo(() => {
    const { stuckN, thinkingN, respondedN, online } = stats;
    if (stuckN >= 3) return { icon: "💡", text: `${stuckN} bloques — Donnez un exemple`, color: "#C62828", bg: "rgba(255,245,245,0.8)" };
    if (stuckN > 0) return { icon: "👀", text: `${stuckN} bloque${stuckN > 1 ? "s" : ""} — Coup de pouce ?`, color: "#E65100", bg: "rgba(255,248,225,0.8)" };
    if (thinkingN > 0 && respondedN === 0) return { icon: "⏳", text: "Tous reflechissent — Laissez du temps", color: "#F57F17", bg: "rgba(255,252,245,0.8)" };
    if (respondedN > 0 && respondedN === online && online > 0) return { icon: "🚀", text: "Tous ont repondu !", color: "#2E7D32", bg: "rgba(240,250,244,0.8)" };
    if (respondedN > online * 0.7) return { icon: "📢", text: "Plus de 70% — Lancez la discussion ?", color: "#1565C0", bg: "rgba(238,242,255,0.8)" };
    return null;
  }, [stats]);

  // Hands raised
  const hands = useMemo(() =>
    (session.students || [])
      .filter(s => s.hand_raised_at && s.is_active && !s.kicked)
      .sort((a, b) => new Date(a.hand_raised_at!).getTime() - new Date(b.hand_raised_at!).getTime()),
    [session.students]
  );

  // Donut SVG data
  const donutSegments = useMemo(() => {
    const { respondedN, thinkingN, stuckN, offN, total } = stats;
    if (total === 0) return [];
    const circumference = 2 * Math.PI * 40; // r=40 for 100px donut
    const segments = [
      { pct: (respondedN / total) * 100, color: "#4CAF50" },
      { pct: (thinkingN / total) * 100, color: "#F2C94C" },
      { pct: (stuckN / total) * 100, color: "#EB5757" },
      { pct: (offN / total) * 100, color: "#C4BDB2" },
    ];
    let offset = 0;
    return segments.map((seg) => {
      const dash = (seg.pct / 100) * circumference;
      const gap = circumference - dash;
      const result = { ...seg, dash, gap, offset };
      offset += dash;
      return result;
    });
  }, [stats]);

  const circumference = 2 * Math.PI * 40;

  return (
    <div className="flex flex-col h-full">
      {/* ── Section title ── */}
      <div className="px-4 pt-4 pb-1 flex-shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#B0A99E]">Cockpit de classe</span>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 pb-3 space-y-2.5">

        {/* ── DONUT — enlarged 100px with legend ── */}
        <GlassCard>
          <div className="flex items-center gap-4">
            {/* SVG Donut — 100px */}
            <div className="relative flex-shrink-0" style={{ width: 100, height: 100 }}
              role="img" aria-label={`Engagement ${stats.engagementPct}%`}>
              <svg width="100" height="100" viewBox="0 0 100 100" className="transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#EFE8DD" strokeWidth="8" />
                {donutSegments.map((seg, i) => {
                  if (seg.pct <= 0) return null;
                  return (
                    <motion.circle
                      key={i}
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="8"
                      strokeLinecap="round"
                      initial={false}
                      animate={{
                        strokeDasharray: `${seg.dash} ${seg.gap}`,
                        strokeDashoffset: -seg.offset,
                      }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  key={stats.engagementPct}
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  className="text-[20px] font-extrabold tabular-nums"
                  style={{ color: stats.engagementPct >= 70 ? "#4CAF50" : stats.engagementPct >= 40 ? "#F2C94C" : "#EB5757" }}
                >
                  {stats.engagementPct}%
                </motion.span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-1.5">
              {[
                { color: "#4CAF50", label: "Repondu", count: stats.respondedN },
                { color: "#F2C94C", label: "Reflexion", count: stats.thinkingN },
                { color: "#EB5757", label: "Bloque", count: stats.stuckN },
                { color: "#C4BDB2", label: "Absent", count: stats.offN },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-[12px] font-semibold text-[#4A4A4A] flex-1">{item.label}</span>
                  <motion.span
                    key={`${item.label}-${item.count}`}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-[13px] font-bold tabular-nums"
                    style={{ color: item.color }}
                  >
                    {item.count}
                  </motion.span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestion banner */}
          {suggestion && (
            <div className="flex items-center gap-2 px-2.5 py-2 mt-2.5 rounded-[10px]" style={{ background: suggestion.bg, border: `1px solid ${suggestion.color}20` }}>
              <span className="text-xs flex-shrink-0">{suggestion.icon}</span>
              <p className="text-[11px] font-medium leading-snug" style={{ color: suggestion.color }}>{suggestion.text}</p>
            </div>
          )}
        </GlassCard>

        {/* ── Intervention mode toggle ── */}
        <button
          onClick={() => setInterventionMode(v => !v)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-semibold cursor-pointer transition-all"
          style={{
            background: interventionMode ? "rgba(255,235,238,0.8)" : "rgba(255,255,255,0.5)",
            border: `1.5px solid ${interventionMode ? "#EF5350" : "rgba(255,255,255,0.5)"}`,
            color: interventionMode ? "#C62828" : "#7A7A7A",
          }}
        >
          🎯 Mode aide {interventionMode ? "ON" : ""}
          <span className="text-[10px] font-normal opacity-60">(H)</span>
        </button>
        {interventionMode && stuckStudents.length > 0 && (
          <p className="text-[11px] font-bold text-[#C62828] text-center animate-pulse">
            {stuckStudents.length} eleve{stuckStudents.length > 1 ? "s" : ""} {stuckStudents.length > 1 ? "ont" : "a"} besoin d&apos;aide
          </p>
        )}

        {/* ── MAINS LEVEES ── */}
        {hands.length > 0 && (
          <GlassCard className="!p-0 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-[11px] font-bold text-[#E88D2A] uppercase tracking-wider">
                ✋ Mains levees ({hands.length})
              </span>
            </div>
            <div className="px-2.5 pb-2.5 space-y-0.5">
              {hands.map((s, idx) => (
                <div key={s.id} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/60 transition-colors">
                  <span className="text-[10px] font-bold text-[#E88D2A] w-4 text-center tabular-nums">{idx + 1}</span>
                  <button onClick={() => setFicheStudentId(s.id)} className="text-[12px] font-semibold text-[#2C2C2C] truncate flex-1 text-left cursor-pointer hover:underline">
                    {s.display_name}
                  </button>
                  <button
                    onClick={() => lowerHand.mutate(s.id)}
                    disabled={lowerHand.isPending}
                    title="Baisser la main"
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-[#B0A99E] hover:text-[#4CAF50] hover:bg-[#F0FAF4] cursor-pointer transition-colors disabled:opacity-40"
                  >
                    ✓
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* ── PLAN DE CLASSE (mini, collapsible) ── */}
        <GlassCard className="!p-0 overflow-hidden">
          <button
            onClick={() => setMapExpanded(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-white/40 transition-colors"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B0A99E]">
              Plan de classe
            </span>
            <svg
              width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="#B0A99E" strokeWidth="2"
              className={`transition-transform duration-200 ${mapExpanded ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <AnimatePresence>
            {mapExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-1 pb-2" style={{ maxHeight: 280, overflowY: "auto" }}>
                  <ClassroomMap
                    students={studentStates.map(s => {
                      const raw = session.students?.find(st => st.id === s.id);
                      return {
                        id: s.id,
                        display_name: raw?.display_name || "",
                        avatar: raw?.avatar || "",
                        state: s.state,
                        hand_raised_at: raw?.hand_raised_at || null,
                        warnings: raw?.warnings || 0,
                      };
                    })}
                    teams={teams}
                    responses={responses as never[]}
                    moduleResponseTexts={moduleResponseTexts}
                    sessionStatus={session.status}
                    onNudge={(responseId, text) => onNudge(responseId, text)}
                    onWarn={(sid) => onWarn(sid)}
                    onBroadcast={onBroadcast}
                    onNudgeAllStuck={handleNudgeAllStuck}
                    onStudentClick={(sid) => setFicheStudentId(sid)}
                    layout={classroomLayout}
                    desksPerRow={classroomLayout === "rows" ? 4 : 3}
                    deskSize="sm"
                    sessionId={session.id}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* ── Student list — online/offline ── */}
        <GlassCard className="!p-0 overflow-hidden">
          <div className="px-3 py-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B0A99E]">
              Eleves ({stats.online}/{stats.total})
            </span>
          </div>
          <div className="px-2 pb-2" role="list" aria-label="Liste des eleves">
            {/* Online students */}
            {studentStates.filter(s => s.state !== "disconnected").map(s => {
              const raw = session.students?.find(st => st.id === s.id);
              if (!raw || !raw.is_active) return null;
              const hasHand = !!raw.hand_raised_at;
              const warnings = raw.warnings || 0;
              const stateColor = s.state === "responded" ? "#4CAF50" : s.state === "stuck" ? "#EB5757" : s.state === "active" ? "#F2C94C" : "#C4BDB2";
              const stateLabel = s.state === "responded" ? "a repondu" : s.state === "stuck" ? "bloque" : "en reflexion";
              return (
                <button key={s.id} onClick={() => setFicheStudentId(s.id)} role="listitem"
                  aria-label={`${raw.display_name} — ${stateLabel}${hasHand ? ", main levee" : ""}${warnings > 0 ? `, ${warnings} avertissement${warnings > 1 ? "s" : ""}` : ""}`}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg hover:bg-white/60 focus-visible:ring-2 focus-visible:ring-[#6B8CFF] focus-visible:ring-offset-1 transition-colors cursor-pointer mb-0.5 outline-none"
                  style={{ minHeight: 34 }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stateColor, boxShadow: s.state === "stuck" ? `0 0 6px ${stateColor}40` : undefined }} />
                  <span className="text-[12px] font-semibold text-[#2C2C2C] truncate flex-1">{raw.display_name}</span>
                  {hasHand && <span className="text-xs flex-shrink-0 animate-bounce">✋</span>}
                  {warnings > 0 && <span className="text-[10px] font-bold px-1 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(255,245,235,0.8)", color: "#F5A45B" }}>⚠{warnings}</span>}
                </button>
              );
            })}

            {/* Disconnected — collapsible */}
            {(() => {
              const offline = studentStates.filter(s => s.state === "disconnected");
              if (offline.length === 0) return null;
              return (
                <details className="mt-1.5">
                  <summary className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-[#B0A99E] cursor-pointer select-none hover:text-[#7A7A7A] transition-colors">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#C4BDB2" }} />
                    Hors ligne ({offline.length})
                  </summary>
                  <div className="mt-0.5">
                    {offline.map(s => {
                      const raw = session.students?.find(st => st.id === s.id);
                      if (!raw || !raw.is_active) return null;
                      return (
                        <button key={s.id} onClick={() => setFicheStudentId(s.id)} role="listitem"
                          aria-label={`${raw.display_name} — absent`}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg hover:bg-white/40 transition-colors cursor-pointer mb-0.5 outline-none opacity-50"
                          style={{ minHeight: 34 }}>
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#C4BDB2" }} />
                          <span className="text-[12px] font-semibold text-[#B0A99E] truncate flex-1">{raw.display_name}</span>
                        </button>
                      );
                    })}
                  </div>
                </details>
              );
            })()}
          </div>
        </GlassCard>

        {/* ── COGNITIVE MAP — horizontal bars (M1 Positioning only) ── */}
        {cognitiveOptions && cognitiveTotal && cognitiveTotal >= 3 && (
          <GlassCard className="!p-0 overflow-hidden">
            <div className="px-3 py-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B0A99E]">
                Consistance cognitive
              </span>
            </div>
            <div className="px-2 pb-2">
              <CognitiveMap options={cognitiveOptions} total={cognitiveTotal} />
            </div>
          </GlassCard>
        )}
      </div>

      {/* ── Stuck alert — bottom pinned ── */}
      {stuckStudents.length > 0 && (
        <div className="px-3 py-2 flex-shrink-0">
          <button onClick={handleNudgeAllStuck}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold cursor-pointer transition-colors"
            style={{ background: "rgba(235,87,87,0.1)", border: "1px solid rgba(235,87,87,0.2)", color: "#C62828" }}>
            🚀 Relancer {stuckStudents.length} bloque{stuckStudents.length > 1 ? "s" : ""}
          </button>
        </div>
      )}
    </div>
  );
}

export const ClassDashboardPanel = memo(ClassDashboardPanelInner);
