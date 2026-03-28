"use client";

import { useState, useMemo } from "react";
import { GlassCardV2 } from "@/components/v2/glass-card";

interface TimelineEvent {
  event_type: string;
  situation_id: string | null;
  payload: Record<string, unknown>;
  offsetMs: number;
}

interface SessionTimelineProps {
  events: TimelineEvent[];
  totalDurationMs: number;
}

const EVENT_CONFIG: Record<string, { label: string; color: string }> = {
  session_start: { label: "Début de séance", color: "#9CA3AF" },
  situation_start: { label: "Question", color: "#FF6B35" },
  vote_start: { label: "Vote", color: "#8B5CF6" },
  collective_choice: { label: "Choix collectif", color: "#10B981" },
  session_end: { label: "Fin de séance", color: "#9CA3AF" },
};

const RELEVANT_TYPES = new Set(Object.keys(EVENT_CONFIG));

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getEventLabel(event: TimelineEvent): string {
  const config = EVENT_CONFIG[event.event_type];
  if (!config) return event.event_type;

  if (event.event_type === "situation_start") {
    const prompt = event.payload?.prompt as string | undefined;
    if (prompt) {
      const short = prompt.length > 60 ? prompt.slice(0, 57) + "..." : prompt;
      return short;
    }
    return config.label;
  }

  return config.label;
}

export function SessionTimeline({ events, totalDurationMs }: SessionTimelineProps) {
  const [open, setOpen] = useState(false);

  const timelineNodes = useMemo(() => {
    // Filter to relevant event types
    const relevant = events.filter((e) => RELEVANT_TYPES.has(e.event_type));

    // Aggregate: keep only the first occurrence of each situation_start per situation_id
    const seen = new Set<string>();
    const nodes: TimelineEvent[] = [];

    for (const event of relevant) {
      if (event.event_type === "situation_start" && event.situation_id) {
        if (seen.has(event.situation_id)) continue;
        seen.add(event.situation_id);
      }
      nodes.push(event);
    }

    return nodes;
  }, [events]);

  if (timelineNodes.length === 0) return null;

  return (
    <div className="space-y-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-semibold text-bw-heading uppercase tracking-wide cursor-pointer hover:text-bw-primary transition-colors"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-90" : ""}`}
        >
          <polyline points="9,18 15,12 9,6" />
        </svg>
        Déroulé de la séance
        <span className="text-xs font-normal text-bw-muted normal-case">({formatTime(totalDurationMs)})</span>
      </button>

      {open && (
        <GlassCardV2 className="p-5">
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[var(--color-bw-border)]" />

            <div className="space-y-4">
              {timelineNodes.map((node, i) => {
                const config = EVENT_CONFIG[node.event_type] || {
                  label: node.event_type,
                  color: "#888",
                };
                return (
                  <div key={i} className="relative flex items-start gap-3">
                    {/* Dot */}
                    <div
                      className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-[var(--card)]"
                      style={{ backgroundColor: config.color }}
                    />
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-bw-muted">{formatTime(node.offsetMs)}</span>
                        <span className="text-xs font-semibold uppercase" style={{ color: config.color }}>
                          {config.label}
                        </span>
                      </div>
                      {node.event_type === "situation_start" && (
                        <p className="text-sm text-bw-heading mt-0.5 truncate">{getEventLabel(node)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCardV2>
      )}
    </div>
  );
}
