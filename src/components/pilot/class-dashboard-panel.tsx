"use client";

import { useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { StudentState } from "@/components/pilot/pulse-ring";
import { SpatialClassroomGrid } from "@/components/pilot/spatial-classroom-grid";
import { ClassCognitiveState } from "@/components/pilot/class-cognitive-state";
import { CognitiveMap } from "@/components/pilot/cognitive-map";

// ═══════════════════════════════════════════════════════════════
// CLASS DASHBOARD PANEL — Left sidebar: engagement donut, progress,
// hands raised cards, spatial classroom, cognitive bars
// Premium pédagogique — richer, more actionable
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
  setFicheStudentId: (id: string) => void;
  lowerHand: { mutate: (id: string) => void; isPending: boolean };
  handleNudgeAllStuck: () => void;
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

const STATE_COLOR: Record<StudentState, string> = {
  responded: "#4CAF50",
  active: "#F2C94C",
  stuck: "#EB5757",
  disconnected: "#C4BDB2",
};

function ClassDashboardPanelInner({
  session,
  studentStates,
  stuckStudents,
  setFicheStudentId,
  lowerHand,
  handleNudgeAllStuck,
  cognitiveOptions,
  cognitiveTotal,
}: ClassDashboardPanelProps) {
  const [mapExpanded, setMapExpanded] = useState(true);

  // Compute engagement stats
  const stats = useMemo(() => {
    const respondedN = studentStates.filter(s => s.state === "responded").length;
    const thinkingN = studentStates.filter(s => s.state === "active").length;
    const stuckN = studentStates.filter(s => s.state === "stuck").length;
    const offN = studentStates.filter(s => s.state === "disconnected").length;
    const total = respondedN + thinkingN + stuckN + offN;
    const engagementPct = total > 0 ? Math.round(((respondedN + thinkingN) / total) * 100) : 0;
    const online = respondedN + thinkingN + stuckN;
    const responsePct = online > 0 ? Math.round((respondedN / online) * 100) : 0;
    return { respondedN, thinkingN, stuckN, offN, total, engagementPct, online, responsePct };
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

  // Hands raised (sorted oldest first = most urgent)
  const hands = useMemo(() =>
    (session.students || [])
      .filter(s => s.hand_raised_at && s.is_active && !s.kicked)
      .sort((a, b) => new Date(a.hand_raised_at!).getTime() - new Date(b.hand_raised_at!).getTime()),
    [session.students]
  );

  // Stuck students with avatar info
  const stuckWithAvatars = useMemo(() =>
    stuckStudents.map(s => {
      const raw = session.students?.find(st => st.id === s.id);
      return { ...s, avatar: raw?.avatar || "👤", display_name: raw?.display_name || s.name };
    }),
    [stuckStudents, session.students]
  );

  // Donut SVG data
  const donutSegments = useMemo(() => {
    const { respondedN, thinkingN, stuckN, offN, total } = stats;
    if (total === 0) return [];
    const circumference = 2 * Math.PI * 40;
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

  return (
    <div className="flex flex-col h-full">
      {/* ── Section title ── */}
      <div className="px-4 pt-4 pb-1 flex-shrink-0">
        <span className="text-[14px] font-bold text-[#2C2C2C]">Cockpit de classe</span>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 pb-3 space-y-2.5">

        {/* ── DONUT + LEGEND ── */}
        <GlassCard>
          <div className="flex items-center gap-4">
            {/* SVG Donut — 100px — shows RESPONSE progress, not engagement */}
            <div className="relative flex-shrink-0" style={{ width: 100, height: 100 }}
              role="img" aria-label={`Participation ${stats.respondedN}/${stats.online}`}>
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
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  key={stats.respondedN}
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  className="text-[18px] font-extrabold tabular-nums leading-none"
                  style={{ color: stats.responsePct >= 70 ? "#4CAF50" : stats.responsePct >= 30 ? "#F2C94C" : "#B0A99E" }}
                >
                  {stats.respondedN}/{stats.online}
                </motion.span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-[#B0A99E] mt-0.5">
                  reponses
                </span>
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

          {/* Response progress bar */}
          {stats.online > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-[#7A7A7A]">Progression reponses</span>
                <span className="text-[11px] font-bold tabular-nums" style={{ color: stats.responsePct >= 80 ? "#4CAF50" : stats.responsePct >= 50 ? "#F2C94C" : "#B0A99E" }}>
                  {stats.respondedN}/{stats.online}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "#EFE8DD" }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={false}
                  animate={{ width: `${stats.responsePct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    background: stats.responsePct >= 80
                      ? "linear-gradient(90deg, #4CAF50, #66BB6A)"
                      : stats.responsePct >= 50
                        ? "linear-gradient(90deg, #F2C94C, #FFD54F)"
                        : "linear-gradient(90deg, #C4BDB2, #D5CFC6)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Suggestion banner */}
          {suggestion && (
            <div className="flex items-center gap-2 px-2.5 py-2 mt-2.5 rounded-[10px]" style={{ background: suggestion.bg, border: `1px solid ${suggestion.color}20` }}>
              <span className="text-xs flex-shrink-0">{suggestion.icon}</span>
              <p className="text-[11px] font-medium leading-snug" style={{ color: suggestion.color }}>{suggestion.text}</p>
            </div>
          )}
        </GlassCard>

        {/* ── CLASS COGNITIVE STATE — one-liner ── */}
        <ClassCognitiveState
          studentStates={studentStates}
          optionDistribution={cognitiveOptions
            ? Object.fromEntries(cognitiveOptions.map(o => [o.key, o.count]))
            : undefined}
          optionLabels={cognitiveOptions
            ? Object.fromEntries(cognitiveOptions.map(o => [o.key, o.label]))
            : undefined}
        />

        {/* ── MAINS LEVEES — individual cards with avatar, duration, chevron ── */}
        {hands.length > 0 && (
          <GlassCard className="!p-0 overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.4)" }}>
              <span className="text-[12px] font-bold text-[#E88D2A] flex items-center gap-1.5">
                <span className="text-sm">✋</span> Mains levees ({hands.length})
              </span>
            </div>
            <div className="px-2 pb-2 space-y-1">
              {hands.map((s) => {
                const raisedMs = s.hand_raised_at ? Date.now() - new Date(s.hand_raised_at).getTime() : 0;
                const raisedMin = Math.floor(raisedMs / 60000);
                const durationLabel = raisedMin >= 1 ? `${raisedMin}min` : "<1min";
                const st = studentStates.find(ss => ss.id === s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => setFicheStudentId(s.id)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-all hover:bg-[#FFF8F0] group"
                    style={{ background: "rgba(255,248,240,0.4)", border: "1px solid rgba(232,141,42,0.1)" }}
                  >
                    {/* Avatar circle with state color ring */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={{
                        background: "rgba(255,255,255,0.8)",
                        boxShadow: `0 0 0 2px ${STATE_COLOR[st?.state || "active"]}`,
                      }}
                    >
                      {s.avatar}
                    </div>
                    {/* Name + duration */}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[12px] font-semibold text-[#2C2C2C] truncate">{s.display_name}</p>
                      <p className="text-[10px] text-[#B0A99E]">✋ depuis {durationLabel}</p>
                    </div>
                    {/* Lower hand button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); lowerHand.mutate(s.id); }}
                      disabled={lowerHand.isPending}
                      title="Baisser la main"
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-[#B0A99E] hover:text-[#4CAF50] hover:bg-[#F0FAF4] cursor-pointer transition-colors disabled:opacity-40 flex-shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      ✓
                    </button>
                    {/* Chevron */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4BDB2" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        )}

        {/* ── PLAN DE CLASSE (collapsible) ── */}
        <GlassCard className="!p-0 overflow-hidden">
          <button
            onClick={() => setMapExpanded(v => !v)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 cursor-pointer hover:bg-white/40 transition-colors"
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
                <SpatialClassroomGrid
                  studentStates={studentStates.map(s => {
                    const raw = session.students?.find(st => st.id === s.id);
                    return {
                      id: s.id,
                      state: s.state,
                      display_name: raw?.display_name || s.display_name,
                      avatar: raw?.avatar || s.avatar,
                      hand_raised_at: raw?.hand_raised_at,
                    };
                  })}
                  onStudentClick={(sid) => setFicheStudentId(sid)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* ── ELEVES EN DIFFICULTÉ — individual clickable cards ── */}
        {stuckWithAvatars.length > 0 && (
          <GlassCard className="!p-0 overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.4)" }}>
              <span className="text-[12px] font-bold text-[#C62828] flex items-center gap-1.5">
                <span className="text-sm">⚠️</span> En difficulte ({stuckWithAvatars.length})
              </span>
            </div>
            <div className="px-2 pb-2 space-y-1">
              {stuckWithAvatars.slice(0, 6).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setFicheStudentId(s.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-all hover:bg-[#FFF5F5] group"
                  style={{ background: "rgba(255,235,238,0.3)", border: "1px solid rgba(235,87,87,0.08)" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.8)", boxShadow: "0 0 0 2px #EB5757" }}
                  >
                    {s.avatar}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[12px] font-semibold text-[#2C2C2C] truncate">{s.display_name}</p>
                    <p className="text-[10px] text-[#C62828]">Bloque</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4BDB2" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              ))}
              {stuckWithAvatars.length > 6 && (
                <p className="text-[10px] text-[#C62828] text-center py-1">+{stuckWithAvatars.length - 6} autres</p>
              )}
            </div>
          </GlassCard>
        )}

        {/* ── COGNITIVE MAP — horizontal bars (M1 Positioning only) ── */}
        {cognitiveOptions && cognitiveTotal && cognitiveTotal >= 3 && (
          <GlassCard className="!p-0 overflow-hidden">
            <div className="px-3.5 py-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B0A99E]">
                Consistance cognitive
              </span>
            </div>
            <div className="px-2.5 pb-2.5">
              <CognitiveMap options={cognitiveOptions} total={cognitiveTotal} />
            </div>
          </GlassCard>
        )}
      </div>

      {/* ── Stuck action — bottom pinned ── */}
      {stuckStudents.length > 0 && (
        <div className="px-3 py-2 flex-shrink-0">
          <button onClick={handleNudgeAllStuck}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer transition-all hover:shadow-sm active:scale-[0.98]"
            style={{ background: "rgba(235,87,87,0.1)", border: "1px solid rgba(235,87,87,0.2)", color: "#C62828" }}>
            🚀 Relancer {stuckStudents.length} bloque{stuckStudents.length > 1 ? "s" : ""}
          </button>
        </div>
      )}
    </div>
  );
}

export const ClassDashboardPanel = memo(ClassDashboardPanelInner);
