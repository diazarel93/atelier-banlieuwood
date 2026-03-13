"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { GlassCardV2 } from "./glass-card";
import { StatusBadge, type SessionStatus } from "./status-badge";
import { getSessionState } from "@/lib/session-state";
import type { SessionSummary } from "@/hooks/use-dashboard-v2";

interface TodaySessionsProps {
  todaySessions: SessionSummary[];
  tomorrowSessions: SessionSummary[];
  className?: string;
}

const STATUS_BAR_COLORS: Record<string, string> = {
  draft: "#9CA3AF",
  waiting: "#F59E0B",
  responding: "#4ECDC4",
  paused: "#F59E0B",
  done: "#10B981",
};

function SessionRow({ session }: { session: SessionSummary }) {
  const ss = getSessionState(session.status);
  const time = new Date(session.scheduledAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const barColor = STATUS_BAR_COLORS[session.status] || STATUS_BAR_COLORS.draft;

  return (
    <div className="relative flex items-center gap-3 py-3 pl-4 rounded-xl hover:bg-bw-primary/[0.025] transition-colors duration-100">
      {/* Left status bar */}
      <div
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
        style={{ backgroundColor: barColor }}
      />

      {/* Time */}
      <span className="text-xs font-medium text-bw-muted tabular-nums w-10 shrink-0">
        {time}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-heading-xs text-bw-heading truncate">
          {session.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-body-xs text-bw-muted">
            {session.classLabel || session.level} — {session.studentCount} élève
            {session.studentCount !== 1 ? "s" : ""}
          </span>
          <StatusBadge status={session.status as SessionStatus} size="sm" />
        </div>
      </div>

      {/* Action */}
      {ss.canPilot ? (
        <Link
          href={ROUTES.pilot(session.id)}
          prefetch={false}
          className="shrink-0 rounded-lg bg-bw-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-bw-primary-500 active:scale-95 transition-all duration-150"
        >
          {ss.ctaShort}
        </Link>
      ) : ss.canViewResults ? (
        <Link
          href={ROUTES.seanceResults(session.id)}
          className="shrink-0 rounded-lg bg-[var(--color-bw-surface-dim)] px-3 py-1.5 text-xs font-medium text-bw-muted hover:text-bw-heading transition-colors"
        >
          {ss.ctaShort}
        </Link>
      ) : (
        <Link
          href={ROUTES.seancePrepare(session.id)}
          className="shrink-0 rounded-lg border border-[var(--color-bw-border)] px-3 py-1.5 text-xs font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
        >
          Préparer
        </Link>
      )}
    </div>
  );
}

function EmptyToday() {
  return (
    <div className="flex flex-col items-center text-center py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-bw-surface-dim)] mb-3">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-bw-muted">
          <circle cx="9" cy="9" r="7" />
          <path d="M9 5v4l2.5 1.5" />
        </svg>
      </div>
      <p className="text-body-sm text-bw-muted">
        Journée libre — aucune séance prévue
      </p>
    </div>
  );
}

export function TodaySessions({
  todaySessions,
  tomorrowSessions,
  className,
}: TodaySessionsProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Today */}
      <GlassCardV2 className="p-5">
        <h3 className="label-caps mb-3">
          Aujourd&apos;hui
        </h3>
        {todaySessions.length > 0 ? (
          <div className="flex flex-col gap-1">
            {todaySessions.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </div>
        ) : (
          <EmptyToday />
        )}
      </GlassCardV2>

      {/* Tomorrow */}
      {tomorrowSessions.length > 0 && (
        <GlassCardV2 className="p-5">
          <h3 className="label-caps mb-3">
            Demain
          </h3>
          <div className="flex flex-col gap-1">
            {tomorrowSessions.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </div>
        </GlassCardV2>
      )}

      {/* New session CTA — solid, not dashed */}
      <Link
        href={ROUTES.seanceNew}
        className="group flex items-center justify-center gap-2 rounded-xl bg-bw-primary/[0.06] py-3.5 text-sm font-medium text-bw-primary hover:bg-bw-primary/[0.10] active:scale-[0.98] transition-all duration-150"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="transition-transform duration-200 group-hover:rotate-90">
          <path d="M7.5 2.5v10M2.5 7.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Nouvelle séance
      </Link>
    </div>
  );
}
