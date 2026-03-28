"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { StatRing } from "@/components/v2/stat-ring";
import { useCockpitData, useCockpitActions } from "@/components/pilot/cockpit-context";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════
// REMOTE CONTROL VIEW — Tablet telecommande for walking teachers
//
// 4 big buttons, donut progress, truncated question.
// Replaces the main FocusCockpit content when activated.
// ═══════════════════════════════════════════════════════════════

interface RemoteAction {
  icon: string;
  label: string;
  action: () => void;
  color?: string;
  disabled?: boolean;
}

interface RemoteControlViewProps {
  questionText: string | null;
  respondedCount: number;
  onOpenBroadcast: () => void;
  onNextAction: () => void;
  onQuickVote: () => void;
  onExit: () => void;
}

export function RemoteControlView({
  questionText,
  respondedCount,
  onOpenBroadcast,
  onNextAction,
  onQuickVote,
  onExit,
}: RemoteControlViewProps) {
  const { session, activeStudents, responses } = useCockpitData();
  const { updateSession } = useCockpitActions();

  const total = activeStudents.length;
  const pct = total > 0 ? Math.round((respondedCount / total) * 100) : 0;
  const status = session.status;

  // Stuck count
  const stuckCount = useMemo(() => {
    if (status !== "responding") return 0;
    const respondedIds = new Set(responses.map((r) => r.student_id));
    return activeStudents.filter((s) => !respondedIds.has(s.id)).length;
  }, [status, responses, activeStudents]);

  // Phase-adaptive buttons
  const actions = useMemo((): RemoteAction[] => {
    switch (status) {
      case "waiting":
        return [
          {
            icon: "📺",
            label: "Projeter",
            action: () => {
              updateSession.mutate({
                broadcast_message: "__SCREEN_MODE:default",
                broadcast_at: new Date().toISOString(),
              });
              toast.success("Ecran : Question");
            },
          },
          {
            icon: "▶️",
            label: "Ouvrir",
            action: () => {
              updateSession.mutate({ status: "responding" });
            },
            color: "#22C55E",
          },
          {
            icon: "⏱️",
            label: "Timer",
            action: () => {
              updateSession.mutate({ timer_ends_at: new Date(Date.now() + 60000).toISOString() });
              toast.success("Timer 60s");
            },
          },
          { icon: "⏸️", label: "Pause", action: () => updateSession.mutate({ status: "paused" }) },
        ];
      case "responding":
        return [
          { icon: "📢", label: stuckCount > 0 ? `Relancer (${stuckCount})` : "Message", action: onOpenBroadcast },
          { icon: "🗳️", label: "Vote", action: onQuickVote, color: "#F59E0B" },
          {
            icon: "⏱️",
            label: "Timer",
            action: () => {
              updateSession.mutate({ timer_ends_at: new Date(Date.now() + 60000).toISOString() });
              toast.success("Timer 60s");
            },
          },
          { icon: "⏸️", label: "Pause", action: () => updateSession.mutate({ status: "paused" }) },
        ];
      case "voting":
        return [
          { icon: "📢", label: "Message", action: onOpenBroadcast },
          {
            icon: "📊",
            label: "Resultats",
            action: () => updateSession.mutate({ status: "reviewing", timer_ends_at: null }),
            color: "#8B5CF6",
          },
          {
            icon: "⏱️",
            label: "Timer",
            action: () => {
              updateSession.mutate({ timer_ends_at: new Date(Date.now() + 30000).toISOString() });
              toast.success("Timer 30s");
            },
          },
          { icon: "⏸️", label: "Pause", action: () => updateSession.mutate({ status: "paused" }) },
        ];
      case "reviewing":
        return [
          { icon: "🎭", label: "Debat", action: () => toast("Lancez le debat a l'oral !", { icon: "🎭" }) },
          { icon: "⏭️", label: "Suivante", action: onNextAction, color: "#FF6B35" },
          {
            icon: "📊",
            label: "Comparer",
            action: () => {
              updateSession.mutate({
                broadcast_message: "__SCREEN_MODE:responses",
                broadcast_at: new Date().toISOString(),
              });
              toast.success("Ecran : Reponses");
            },
          },
          { icon: "⏸️", label: "Pause", action: () => updateSession.mutate({ status: "paused" }) },
        ];
      case "paused":
        return [
          {
            icon: "▶️",
            label: "Reprendre",
            action: () => updateSession.mutate({ status: "waiting" }),
            color: "#22C55E",
          },
          { icon: "📢", label: "Message", action: onOpenBroadcast },
          {
            icon: "⬛",
            label: "Noir",
            action: () => {
              updateSession.mutate({
                broadcast_message: "__SCREEN_MODE:blank",
                broadcast_at: new Date().toISOString(),
              });
            },
          },
          {
            icon: "📺",
            label: "Question",
            action: () => {
              updateSession.mutate({
                broadcast_message: "__SCREEN_MODE:default",
                broadcast_at: new Date().toISOString(),
              });
            },
          },
        ];
      default:
        return [
          { icon: "📊", label: "Resultats", action: onNextAction, color: "#8B5CF6" },
          { icon: "📢", label: "Message", action: onOpenBroadcast },
          {
            icon: "📺",
            label: "Ecran",
            action: () => {
              updateSession.mutate({
                broadcast_message: "__SCREEN_MODE:default",
                broadcast_at: new Date().toISOString(),
              });
            },
          },
          { icon: "⏸️", label: "Pause", action: () => updateSession.mutate({ status: "paused" }) },
        ];
    }
  }, [status, stuckCount, updateSession, onOpenBroadcast, onQuickVote, onNextAction]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 bg-gray-50/50">
      {/* Exit button */}
      <button
        onClick={onExit}
        className="absolute top-4 right-4 text-[11px] font-medium text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
      >
        Quitter le mode tablette
      </button>

      {/* Donut + stats */}
      <div className="flex flex-col items-center mb-6">
        <StatRing
          value={pct}
          label={`${respondedCount}/${total}`}
          color={pct >= 100 ? "#22C55E" : pct >= 50 ? "#F59E0B" : "#6B8CFF"}
          size={96}
          strokeWidth={7}
        />
      </div>

      {/* Question preview (truncated) */}
      {questionText && (
        <p className="text-center text-[15px] font-medium text-gray-700 leading-snug max-w-md mb-8 line-clamp-2">
          {questionText}
        </p>
      )}

      {/* 4 Big buttons — 2x2 grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {actions.map((btn, i) => (
          <motion.button
            key={`${status}-${i}`}
            onClick={btn.action}
            disabled={btn.disabled}
            whileTap={{ scale: 0.93 }}
            className="flex flex-col items-center justify-center gap-2 py-6 rounded-2xl border-2 transition-colors cursor-pointer disabled:opacity-40"
            style={{
              background: btn.color ? `${btn.color}10` : "#F9FAFB",
              borderColor: btn.color ? `${btn.color}30` : "#E5E7EB",
              color: btn.color || "#374151",
            }}
          >
            <span className="text-3xl">{btn.icon}</span>
            <span className="text-[13px] font-bold">{btn.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Inline alert — stuck students */}
      {status === "responding" && stuckCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 px-4 py-3 rounded-xl text-center max-w-sm w-full"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
        >
          <span className="text-[13px] font-medium text-red-600">
            {stuckCount} eleve{stuckCount > 1 ? "s" : ""} en attente de reponse
          </span>
        </motion.div>
      )}
    </div>
  );
}
