"use client";

import { GlassCardV2 } from "./glass-card";
import type { DashboardStats, SessionSummary } from "@/hooks/use-dashboard-v2";

interface WhatsNewWidgetProps {
  stats: DashboardStats;
  trends?: Record<string, { value: number; label?: string }>;
  recentSessions: SessionSummary[];
  todaySessions: SessionSummary[];
}

interface Insight {
  id: string;
  emoji: string;
  text: string;
  type: "positive" | "neutral" | "attention";
}

function computeInsights({ stats, trends, recentSessions, todaySessions }: WhatsNewWidgetProps): Insight[] {
  const insights: Insight[] = [];

  // Milestone reached
  const milestones = [5, 10, 25, 50, 100];
  const currentMilestone = milestones.filter((m) => stats.doneSessions >= m).pop();
  if (currentMilestone && stats.doneSessions === currentMilestone) {
    insights.push({
      id: "milestone",
      emoji: "🏆",
      text: `Cap des ${currentMilestone} séances atteint !`,
      type: "positive",
    });
  }

  // Sessions trend up
  if (trends?.doneSessions && trends.doneSessions.value > 20) {
    insights.push({
      id: "sessions-up",
      emoji: "📈",
      text: `+${trends.doneSessions.value}% de séances complétées cette semaine`,
      type: "positive",
    });
  }

  // Students trend up
  if (trends?.totalStudents && trends.totalStudents.value > 20) {
    insights.push({
      id: "students-up",
      emoji: "👥",
      text: `+${trends.totalStudents.value}% d'élèves actifs vs semaine dernière`,
      type: "positive",
    });
  }

  // Active sessions right now
  if (stats.activeSessions > 0) {
    insights.push({
      id: "live",
      emoji: "🔴",
      text: `${stats.activeSessions} séance${stats.activeSessions > 1 ? "s" : ""} en cours en ce moment`,
      type: "neutral",
    });
  }

  // Busy day
  if (todaySessions.length >= 3) {
    insights.push({
      id: "busy-day",
      emoji: "📅",
      text: `Journée chargée : ${todaySessions.length} séances programmées`,
      type: "neutral",
    });
  }

  // Sessions trend down
  if (trends?.doneSessions && trends.doneSessions.value < -30) {
    insights.push({
      id: "sessions-down",
      emoji: "💡",
      text: "Activité en baisse — c'est le moment de planifier une séance",
      type: "attention",
    });
  }

  // Recent completed sessions
  const recentDone = recentSessions.filter((s) => s.status === "done");
  if (recentDone.length > 0 && insights.length < 3) {
    const latest = recentDone[0];
    insights.push({
      id: "recent-done",
      emoji: "✅",
      text: `"${latest.title}" terminée — ${latest.studentCount} élèves ont participé`,
      type: "positive",
    });
  }

  // First sessions
  if (stats.totalSessions > 0 && stats.totalSessions <= 3) {
    insights.push({
      id: "getting-started",
      emoji: "🚀",
      text: `Beau début ! ${stats.totalSessions} séance${stats.totalSessions > 1 ? "s" : ""} créée${stats.totalSessions > 1 ? "s" : ""}`,
      type: "positive",
    });
  }

  return insights.slice(0, 3); // Max 3 insights
}

const TYPE_STYLES = {
  positive: "bg-[var(--color-bw-green-100)]/50",
  neutral: "bg-[var(--color-bw-surface-dim)]",
  attention: "bg-[var(--color-bw-amber-100)]/50",
} as const;

export function WhatsNewWidget(props: WhatsNewWidgetProps) {
  const insights = computeInsights(props);

  if (insights.length === 0) return null;

  return (
    <GlassCardV2 className="p-4">
      <h3 className="label-caps text-bw-muted mb-3">Quoi de neuf</h3>
      <div className="flex flex-col gap-2">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm ${TYPE_STYLES[insight.type]}`}
          >
            <span className="text-base leading-none mt-0.5" aria-hidden="true">
              {insight.emoji}
            </span>
            <span className="text-bw-heading font-medium leading-snug">{insight.text}</span>
          </div>
        ))}
      </div>
    </GlassCardV2>
  );
}
