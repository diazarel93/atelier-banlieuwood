"use client";

import Link from "next/link";
import { GlassCardV2 } from "./glass-card";
import { ROUTES } from "@/lib/routes";
import { IconCheck, IconChevronRight } from "./icons";
import type { SessionSummary } from "@/hooks/use-dashboard-v2";

interface ActionRequiredWidgetProps {
  todaySessions: SessionSummary[];
  tomorrowSessions: SessionSummary[];
  recentSessions: SessionSummary[];
}

interface ActionItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  href: string;
  priority: "high" | "medium";
}

export function ActionRequiredWidget({ todaySessions, tomorrowSessions, recentSessions }: ActionRequiredWidgetProps) {
  const actions: ActionItem[] = [];

  // Sessions to prepare (draft, scheduled within 48h)
  const draftSoon = [...todaySessions, ...tomorrowSessions].filter((s) => s.status === "draft");
  for (const s of draftSoon) {
    actions.push({
      id: `prepare-${s.id}`,
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      label: `Préparer "${s.title}"`,
      href: ROUTES.seancePrepare(s.id),
      priority: "high",
    });
  }

  // Done sessions not yet viewed (recent "done" sessions)
  const recentDone = recentSessions.filter((s) => s.status === "done").slice(0, 3);
  for (const s of recentDone) {
    actions.push({
      id: `results-${s.id}`,
      icon: <IconCheck />,
      label: `Résultats "${s.title}"`,
      href: ROUTES.seanceResults(s.id),
      priority: "medium",
    });
  }

  if (actions.length === 0) return null;

  return (
    <GlassCardV2 className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="label-caps text-bw-muted">Actions requises</h3>
        <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-[var(--color-bw-violet)] text-white text-[10px] font-bold px-1.5 shadow-[0_0_8px_rgba(139,92,246,0.25)]">
          {actions.length}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-[var(--color-bw-surface-dim)] group"
          >
            <span
              className={`shrink-0 ${action.priority === "high" ? "text-[var(--color-bw-violet)]" : "text-bw-muted"}`}
            >
              {action.icon}
            </span>
            <span className="flex-1 text-bw-heading font-medium truncate text-sm">{action.label}</span>
            <IconChevronRight className="text-bw-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </Link>
        ))}
      </div>
    </GlassCardV2>
  );
}
