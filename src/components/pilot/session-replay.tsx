"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  detectKeyMoments,
  generateReplaySummary,
  formatReplayTime,
  type ReplayEvent,
  type ReplayStudent,
} from "@/lib/replay-analysis";

// ═══════════════════════════════════════════════════════
// SESSION REPLAY — Video-player metaphor for post-session review
// Pure analysis logic extracted to src/lib/replay-analysis.ts
// ═══════════════════════════════════════════════════════

interface ReplayResponse {
  id: string;
  student_id: string;
  situation_id: string;
  text: string;
  response_time_ms: number | null;
  ai_score: number | null;
  is_highlighted: boolean;
  submitted_at: string;
}

interface SessionReplayProps {
  events: ReplayEvent[];
  totalDurationMs: number;
  students: ReplayStudent[];
  responses: ReplayResponse[];
  onClose: () => void;
}

const EVENT_COLORS: Record<string, string> = {
  question_launched: "#3B82F6",
  response_received: "#4ECDC4",
  vote_cast: "#8B5CF6",
  collective_choice: "#F59E0B",
  highlight: "#EC4899",
  status_change: "#6B7280",
};

const EVENT_LABELS: Record<string, string> = {
  question_launched: "Question lancée",
  response_received: "Réponse",
  vote_cast: "Vote",
  collective_choice: "Choix collectif",
  highlight: "Mis en avant",
  status_change: "Changement de phase",
};

const SPEEDS = [1, 2, 4, 8];

export function SessionReplay({ events, totalDurationMs, students, responses, onClose }: SessionReplayProps) {
  const [playing, setPlaying] = useState(false);
  const [playheadMs, setPlayheadMs] = useState(0);
  const [speed, setSpeed] = useState(1);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Student name lookup
  const studentMap = useMemo(() => {
    const m: Record<string, ReplayStudent> = {};
    for (const s of students) m[s.id] = s;
    return m;
  }, [students]);

  // Detect key moments
  const keyMoments = useMemo(() => detectKeyMoments(events, studentMap), [events, studentMap]);
  const replaySummary = useMemo(() => generateReplaySummary(keyMoments, totalDurationMs, events.length), [keyMoments, totalDurationMs, events.length]);

  // Events visible at current playhead
  const visibleEvents = useMemo(() => {
    return events.filter((e) => e.offsetMs <= playheadMs);
  }, [events, playheadMs]);

  // Current question (last question_launched before playhead)
  const currentQuestion = useMemo(() => {
    const qs = visibleEvents.filter((e) => e.event_type === "question_launched");
    return qs.length > 0 ? qs[qs.length - 1] : null;
  }, [visibleEvents]);

  // Responses visible at playhead
  const visibleResponses = useMemo(() => {
    const responseEvents = visibleEvents.filter((e) => e.event_type === "response_received");
    return responseEvents.map((e) => {
      const student = e.student_id ? studentMap[e.student_id] : null;
      return {
        ...e,
        studentName: student?.display_name || "?",
        studentAvatar: student?.avatar || "?",
      };
    });
  }, [visibleEvents, studentMap]);

  // Active key moment (closest moment near playhead)
  const activeKeyMoment = useMemo(() => {
    return keyMoments.find((m) => Math.abs(m.offsetMs - playheadMs) < 5000 && m.offsetMs <= playheadMs);
  }, [keyMoments, playheadMs]);

  // Animation loop
  const tick = useCallback((now: number) => {
    if (lastFrameRef.current === 0) lastFrameRef.current = now;
    const delta = (now - lastFrameRef.current) * speed;
    lastFrameRef.current = now;

    setPlayheadMs((prev) => {
      const next = prev + delta;
      if (next >= totalDurationMs) {
        setPlaying(false);
        return totalDurationMs;
      }
      return next;
    });

    rafRef.current = requestAnimationFrame(tick);
  }, [speed, totalDurationMs]);

  useEffect(() => {
    if (playing) {
      lastFrameRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, tick]);

  // Timeline scrubber click
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || totalDurationMs === 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setPlayheadMs(pct * totalDurationMs);
  }, [totalDurationMs]);

  const progressPct = totalDurationMs > 0 ? (playheadMs / totalDurationMs) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">🎬</span>
          <h3 className="text-sm font-bold text-bw-heading">Replay de séance</h3>
          {keyMoments.length > 0 && (
            <span className="text-[10px] text-bw-muted bg-black/[0.04] px-2 py-0.5 rounded-full">
              {keyMoments.length} moment{keyMoments.length > 1 ? "s" : ""} clé{keyMoments.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-xs text-bw-muted hover:text-bw-heading cursor-pointer transition-colors"
        >
          Fermer
        </button>
      </div>

      {/* Summary */}
      <div className="px-3 py-2.5 rounded-[10px] bg-black/[0.03] border border-black/[0.06]">
        <p className="text-[11px] text-[#5B5B5B] leading-relaxed">{replaySummary}</p>
      </div>

      {/* Timeline */}
      <div className="glass-card p-4 space-y-3">
        {/* Scrubber */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="relative h-10 rounded-lg bg-black/[0.04] cursor-pointer overflow-hidden"
        >
          {/* Progress */}
          <div
            className="absolute inset-y-0 left-0 bg-bw-primary/10 border-r-2 border-bw-primary transition-[width] duration-75"
            style={{ width: `${progressPct}%` }}
          />

          {/* Key moment markers (triangles at top) */}
          {keyMoments.map((m, i) => {
            const leftPct = totalDurationMs > 0 ? (m.offsetMs / totalDurationMs) * 100 : 0;
            return (
              <button
                key={`km-${i}`}
                onClick={(e) => { e.stopPropagation(); setPlayheadMs(m.offsetMs); }}
                className="absolute top-0 -translate-x-1/2 cursor-pointer group"
                style={{ left: `${leftPct}%` }}
                title={`${m.icon} ${m.label} — ${formatReplayTime(m.offsetMs)}`}
              >
                <div
                  className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent"
                  style={{ borderTopColor: m.color }}
                />
              </button>
            );
          })}

          {/* Event dots (lower half) */}
          {events.map((e) => {
            const leftPct = totalDurationMs > 0 ? (e.offsetMs / totalDurationMs) * 100 : 0;
            const color = EVENT_COLORS[e.event_type] || "#999";
            return (
              <div
                key={e.id}
                className="absolute bottom-2 -translate-x-0.5 w-1.5 h-1.5 rounded-full opacity-60"
                style={{ left: `${leftPct}%`, backgroundColor: color }}
              />
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlaying(!playing)}
              className="w-8 h-8 rounded-full bg-bw-primary text-white flex items-center justify-center cursor-pointer hover:brightness-110 transition-all active:scale-95"
            >
              {playing ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>
              )}
            </button>

            <span className="text-xs font-mono text-bw-text">
              {formatReplayTime(playheadMs)} / {formatReplayTime(totalDurationMs)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                  speed === s ? "bg-bw-primary text-white" : "bg-black/[0.04] text-bw-muted hover:bg-black/[0.08]"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Active key moment banner */}
        {activeKeyMoment && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: `${activeKeyMoment.color}10`, border: `1px solid ${activeKeyMoment.color}25` }}
          >
            <span className="text-sm">{activeKeyMoment.icon}</span>
            <div>
              <p className="text-[11px] font-semibold" style={{ color: activeKeyMoment.color }}>{activeKeyMoment.label}</p>
              <p className="text-[10px] text-[#5B5B5B]">{activeKeyMoment.detail}</p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* State panel */}
        <div className="glass-card p-4 space-y-3">
          {/* Current question */}
          {currentQuestion && (
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-bw-muted">Question active</p>
              <div className="bg-black/[0.03] rounded-lg px-3 py-2">
                <p className="text-xs text-bw-text">
                  Module {String(currentQuestion.payload.module)} — Séance {String(currentQuestion.payload.seance)} — Q{Number(currentQuestion.payload.situationIndex) + 1}
                </p>
              </div>
            </div>
          )}

          {/* Responses feed */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-bw-muted">
              Réponses ({visibleResponses.length})
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {visibleResponses.slice(-10).reverse().map((r) => (
                <div key={r.id} className="flex items-start gap-2 px-2 py-1.5 rounded-lg bg-black/[0.02]">
                  <span className="text-sm flex-shrink-0">{r.studentAvatar}</span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-medium text-bw-heading">{r.studentName}</span>
                    {typeof r.payload.responseTimeMs === "number" && (
                      <span className="text-[9px] text-bw-muted ml-1">({Math.round(r.payload.responseTimeMs / 1000)}s)</span>
                    )}
                  </div>
                </div>
              ))}
              {visibleResponses.length === 0 && (
                <p className="text-[10px] text-bw-muted text-center py-2">Aucune réponse encore</p>
              )}
            </div>
          </div>

          {/* Event counter */}
          <div className="flex gap-3 flex-wrap">
            {Object.entries(EVENT_COLORS).map(([type, color]) => {
              const count = visibleEvents.filter((e) => e.event_type === type).length;
              if (count === 0) return null;
              return (
                <div key={type} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-bw-muted">{count} {EVENT_LABELS[type] || type}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key moments panel */}
        <div className="glass-card p-4 space-y-3">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-bw-muted">
            Moments clés ({keyMoments.length})
          </p>

          {keyMoments.length === 0 ? (
            <p className="text-[10px] text-bw-muted text-center py-4">
              Pas assez de données pour détecter des moments clés.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {keyMoments.map((m, i) => {
                const isPast = m.offsetMs <= playheadMs;
                return (
                  <button
                    key={i}
                    onClick={() => setPlayheadMs(m.offsetMs)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left cursor-pointer transition-all ${
                      isPast ? "bg-black/[0.03]" : "bg-black/[0.01] opacity-50"
                    } hover:bg-black/[0.06]`}
                  >
                    <span className="text-sm flex-shrink-0">{m.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold" style={{ color: m.color }}>{m.label}</p>
                      <p className="text-[9px] text-[#8894A0] truncate">{m.detail}</p>
                    </div>
                    <span className="text-[9px] font-mono text-bw-muted flex-shrink-0">{formatReplayTime(m.offsetMs)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
