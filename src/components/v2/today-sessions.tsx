"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { GlassCardV2 } from "./glass-card";
import { getSessionState } from "@/lib/session-state";
import type { SessionSummary } from "@/hooks/use-dashboard-v2";

interface TodaySessionsProps {
  todaySessions: SessionSummary[];
  tomorrowSessions: SessionSummary[];
  className?: string;
}

function SessionRow({ session }: { session: SessionSummary }) {
  const ss = getSessionState(session.status);
  const time = new Date(session.scheduledAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center gap-3 py-2.5">
      {/* Time */}
      <span className="text-xs font-medium text-bw-muted tabular-nums w-10 shrink-0">
        {time}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-bw-heading truncate">
          {session.title}
        </p>
        <p className="text-xs text-bw-muted">
          {session.classLabel || session.level} — {session.studentCount} élève
          {session.studentCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Action */}
      {ss.canPilot ? (
        <Link
          href={`/session/${session.id}/pilot`}
          className="shrink-0 rounded-lg bg-bw-primary px-3 py-1 text-xs font-semibold text-white hover:bg-bw-primary-500 transition-colors"
        >
          {ss.ctaShort}
        </Link>
      ) : ss.canViewResults ? (
        <Link
          href={`/session/${session.id}/results`}
          className="shrink-0 rounded-lg bg-[var(--color-bw-surface-dim)] px-3 py-1 text-xs font-medium text-bw-muted hover:text-bw-heading transition-colors"
        >
          {ss.ctaShort}
        </Link>
      ) : (
        <Link
          href={`/v2/seances/${session.id}/prepare`}
          className="shrink-0 rounded-lg border border-[var(--color-bw-border)] px-3 py-1 text-xs font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
        >
          Préparer
        </Link>
      )}
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
      <GlassCardV2 className="p-4">
        <h3 className="text-xs font-semibold text-bw-muted uppercase tracking-wide mb-2">
          Aujourd&apos;hui
        </h3>
        {todaySessions.length > 0 ? (
          <div className="divide-y divide-[var(--color-bw-border-subtle)]">
            {todaySessions.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-bw-muted py-2">
            Aucune séance prévue
          </p>
        )}
      </GlassCardV2>

      {/* Tomorrow */}
      {tomorrowSessions.length > 0 && (
        <GlassCardV2 className="p-4">
          <h3 className="text-xs font-semibold text-bw-muted uppercase tracking-wide mb-2">
            Demain
          </h3>
          <div className="divide-y divide-[var(--color-bw-border-subtle)]">
            {tomorrowSessions.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </div>
        </GlassCardV2>
      )}

      {/* New session CTA */}
      <Link
        href="/v2/seances/new"
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--color-bw-border)] py-3 text-sm font-medium text-bw-muted hover:border-bw-primary hover:text-bw-primary transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Nouvelle séance
      </Link>
    </div>
  );
}
