"use client";

import { useMemo } from "react";
import { AttentionPriority, type AttentionSignals } from "@/components/pilot/attention-priority";
import { SessionTimeline, type TimelineEvent } from "@/components/pilot/session-timeline";
import type { Student, Response } from "@/hooks/use-pilot-session";
import type { StuckLevel } from "@/hooks/use-stuck-detection";

// ═══════════════════════════════════════════════════════════════
// ASSISTANT SIDEBAR — Right panel: contextual intelligence
// Priority alert + contextual suggestion + session timeline
// ═══════════════════════════════════════════════════════════════

interface AssistantSidebarProps {
  session: {
    status: string;
    students?: Student[];
  };
  responses: Response[];
  activeStudents: Student[];
  stuckLevels: Map<string, StuckLevel>;
  respondedStudentIds: Set<string>;
  respondingOpenedAt: number | null;
  timelineEvents: TimelineEvent[];
  sessionStartedAt: number;
  onAlertAction?: (actionId: string) => void;
}

export function AssistantSidebar({
  session,
  responses,
  activeStudents,
  stuckLevels,
  respondedStudentIds,
  respondingOpenedAt,
  timelineEvents,
  sessionStartedAt,
  onAlertAction,
}: AssistantSidebarProps) {
  // ── Build attention signals ──
  const attentionSignals = useMemo((): AttentionSignals => {
    const stuckNames: string[] = [];
    const handsNames: string[] = [];
    const handsRaisedAt: (string | null)[] = [];
    let stuckCount = 0;
    let handsRaised = 0;

    for (const s of activeStudents) {
      const level = stuckLevels.get(s.id);
      if (level === "stuck" || level === "slow") {
        stuckCount++;
        stuckNames.push(s.display_name);
      }
      if (s.hand_raised_at) {
        handsRaised++;
        handsNames.push(s.display_name);
        handsRaisedAt.push(s.hand_raised_at);
      }
    }

    const elapsedSeconds = respondingOpenedAt ? Math.floor((Date.now() - respondingOpenedAt) / 1000) : 0;

    return {
      stuckCount,
      stuckNames,
      handsRaised,
      handsNames,
      handsRaisedAt,
      responsesCount: responses.length,
      totalStudents: (session.students || []).filter((s) => s.is_active).length,
      onlineStudents: activeStudents.length,
      elapsedSeconds,
      status: session.status,
    };
  }, [activeStudents, stuckLevels, responses.length, respondingOpenedAt, session.status, session.students]);

  // ── Contextual suggestion ──
  const suggestion = useMemo(() => {
    const status = session.status;
    const responded = respondedStudentIds.size;
    const total = activeStudents.length;

    if (status === "waiting") {
      return {
        icon: "📺",
        text: "Projetez la question pour que les eleves puissent la lire.",
      };
    }
    if (status === "responding") {
      if (total > 0 && responded >= total) {
        return {
          icon: "🎉",
          text: "Tout le monde a repondu. Lancez le vote ?",
        };
      }
      if (responded === 0) {
        return {
          icon: "⏳",
          text: "Laissez-leur le temps de repondre...",
        };
      }
      const pct = Math.round((responded / total) * 100);
      return {
        icon: "✏️",
        text: `${responded}/${total} reponses (${pct}%). Attendez les retardataires.`,
      };
    }
    if (status === "voting") {
      return {
        icon: "🗳️",
        text: "Le vote est en cours. Attendez les retardataires.",
      };
    }
    if (status === "reviewing") {
      return {
        icon: "💬",
        text: "Rebondissez sur la reponse gagnante.",
      };
    }
    if (status === "paused") {
      return {
        icon: "⏸️",
        text: "La seance est en pause.",
      };
    }
    return null;
  }, [session.status, respondedStudentIds.size, activeStudents.length]);

  return (
    <div className="flex flex-col h-full bg-[#0c0c18]">
      {/* ── Header ── */}
      <div className="px-3 py-3 border-b border-[#2a2a50]">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Assistant</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-3 space-y-4">
          <AttentionPriority signals={attentionSignals} onAction={onAlertAction} showSecondary={false} />
          {suggestion && (
            <div
              className="rounded-xl px-3.5 py-3"
              style={{
                background: "rgba(139,92,246,0.08)",
                border: "1px solid rgba(139,92,246,0.2)",
              }}
            >
              <div className="flex items-start gap-2.5">
                <span className="text-base flex-shrink-0">{suggestion.icon}</span>
                <p className="text-[12px] leading-relaxed text-[#94a3b8]">{suggestion.text}</p>
              </div>
            </div>
          )}
          <SessionTimeline events={timelineEvents} sessionStartedAt={sessionStartedAt} />
        </div>
      </div>
    </div>
  );
}
