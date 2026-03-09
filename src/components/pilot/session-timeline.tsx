"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

// ═══════════════════════════════════════════════════════════════
// SESSION TIMELINE — Replay of key moments during the session
// Events tracked client-side: question launched, responses,
// stuck detected, debates, votes, broadcasts
// ═══════════════════════════════════════════════════════════════

export type TimelineEventType =
  | "question_launched"
  | "first_response"
  | "half_responded"
  | "all_responded"
  | "stuck_detected"
  | "class_divided"
  | "debate_launched"
  | "vote_launched"
  | "broadcast_sent"
  | "nudge_sent"
  | "module_completed"
  | "phase_changed";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: number; // Date.now()
  label: string;
  detail?: string;
  severity: "info" | "positive" | "warning" | "highlight";
}

const EVENT_STYLES: Record<string, { icon: string; color: string; bg: string }> = {
  question_launched: { icon: "📋", color: "#3B5998", bg: "#EEF3FF" },
  first_response: { icon: "✋", color: "#4CAF50", bg: "#E8F5E9" },
  half_responded: { icon: "📊", color: "#F59E0B", bg: "#FFF8E1" },
  all_responded: { icon: "🎉", color: "#2E7D32", bg: "#E8F5E9" },
  stuck_detected: { icon: "⚠️", color: "#C62828", bg: "#FFEBEE" },
  class_divided: { icon: "⚡", color: "#E040FB", bg: "#FCE4EC" },
  debate_launched: { icon: "🎭", color: "#5B3A8E", bg: "#F3E5F5" },
  vote_launched: { icon: "🗳️", color: "#14B8A6", bg: "#E0F2F1" },
  broadcast_sent: { icon: "📢", color: "#8B4513", bg: "#FFF3E0" },
  nudge_sent: { icon: "🚀", color: "#3B5998", bg: "#EEF3FF" },
  module_completed: { icon: "✅", color: "#4CAF50", bg: "#E8F5E9" },
  phase_changed: { icon: "➡️", color: "#8B5CF6", bg: "#F3E5F5" },
};

function formatTime(timestamp: number, sessionStart: number): string {
  const elapsed = Math.max(0, Math.floor((timestamp - sessionStart) / 1000));
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface SessionTimelineProps {
  events: TimelineEvent[];
  sessionStartedAt: number;
  maxVisible?: number;
}

export function SessionTimeline({ events, sessionStartedAt, maxVisible = 50 }: SessionTimelineProps) {
  const [expanded, setExpanded] = useState(false);

  if (events.length === 0) {
    return (
      <div className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.4)" }}>
        <span className="text-lg">📼</span>
        <p className="text-[12px] text-bw-muted mt-1">La timeline se remplit pendant la seance</p>
      </div>
    );
  }

  const visibleEvents = expanded ? events.slice(-maxVisible) : events.slice(-5);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.4)" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 cursor-pointer hover:bg-white/40 transition-colors"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.4)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">📼</span>
          <span className="text-[12px] font-bold text-bw-heading">Timeline de seance</span>
          <span className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full" style={{ background: "#EFE8DD", color: "#7A7A7A" }}>
            {events.length}
          </span>
        </div>
        <svg
          width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="#B0A99E" strokeWidth="2"
          className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {(expanded || events.length <= 5) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-2 space-y-0.5 max-h-[300px] overflow-y-auto">
              {visibleEvents.map((event, i) => {
                const style = EVENT_STYLES[event.type] || EVENT_STYLES.question_launched;
                const isLast = i === visibleEvents.length - 1;
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-start gap-2.5 py-1.5"
                  >
                    {/* Timeline dot + line */}
                    <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px]"
                        style={{ background: style.bg, border: `1.5px solid ${style.color}40` }}
                      >
                        {style.icon}
                      </div>
                      {!isLast && (
                        <div className="w-px flex-1 min-h-[12px] mt-0.5" style={{ background: "#E8DFD2" }} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tabular-nums text-bw-muted">
                          {formatTime(event.timestamp, sessionStartedAt)}
                        </span>
                        <span className="text-[11px] font-semibold truncate" style={{ color: style.color }}>
                          {event.label}
                        </span>
                      </div>
                      {event.detail && (
                        <p className="text-[10px] text-bw-text mt-0.5 leading-snug">{event.detail}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed preview: last event */}
      {!expanded && events.length > 5 && (
        <div className="px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px]">{EVENT_STYLES[events[events.length - 1].type]?.icon}</span>
            <span className="text-[11px] text-bw-text truncate">{events[events.length - 1].label}</span>
            <span className="text-[10px] text-bw-muted ml-auto">
              {formatTime(events[events.length - 1].timestamp, sessionStartedAt)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper to create timeline events ──
let eventCounter = 0;
export function createTimelineEvent(
  type: TimelineEventType,
  label: string,
  detail?: string,
  severity: TimelineEvent["severity"] = "info",
): TimelineEvent {
  return {
    id: `evt-${++eventCounter}-${Date.now()}`,
    type,
    timestamp: Date.now(),
    label,
    detail,
    severity,
  };
}
