"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { GlassCardV2 } from "./glass-card";

interface TimelineSession {
  id: string;
  title: string;
  status: string;
  classLabel: string | null;
  studentCount: number;
  date: string;
}

interface FacilitatorTimelineProps {
  sessions: TimelineSession[];
}

const STATUS_DOTS: Record<string, { color: string; label: string }> = {
  done: { color: "#10B981", label: "Terminée" },
  results: { color: "#6366F1", label: "Résultats" },
  responding: { color: "#F59E0B", label: "En cours" },
  reviewing: { color: "#F59E0B", label: "En cours" },
  voting: { color: "#F59E0B", label: "En cours" },
  waiting: { color: "#94A3B8", label: "En attente" },
  draft: { color: "#64748B", label: "Brouillon" },
  paused: { color: "#EF4444", label: "Pause" },
};

function formatRelativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function FacilitatorTimeline({ sessions }: FacilitatorTimelineProps) {
  if (sessions.length === 0) return null;

  // Sort by date descending, take last 10
  const sorted = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  return (
    <GlassCardV2 className="p-5">
      <h3 className="label-caps mb-4">Historique récent</h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--color-bw-border-subtle)]" />

        <div className="space-y-3">
          {sorted.map((session) => {
            const status = STATUS_DOTS[session.status] || STATUS_DOTS.draft;
            return (
              <Link
                key={session.id}
                href={ROUTES.seanceDetail(session.id)}
                className="flex items-start gap-3 group relative pl-5 py-1 rounded-lg hover:bg-[var(--color-bw-surface-dim)] transition-colors -ml-1 pr-2"
              >
                {/* Dot */}
                <div
                  className="absolute left-0 top-3 w-[15px] h-[15px] rounded-full border-2 border-[var(--color-bw-bg)]"
                  style={{ backgroundColor: status.color }}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-bw-heading truncate group-hover:text-bw-primary transition-colors">
                    {session.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-bw-muted mt-0.5">
                    <span>{formatRelativeDate(session.date)}</span>
                    <span>·</span>
                    <span>
                      {session.studentCount} élève{session.studentCount !== 1 ? "s" : ""}
                    </span>
                    {session.classLabel && (
                      <>
                        <span>·</span>
                        <span>{session.classLabel}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <span
                  className="shrink-0 mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${status.color}15`,
                    color: status.color,
                  }}
                >
                  {status.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {sessions.length > 10 && (
        <Link
          href={ROUTES.seances}
          className="block text-center text-xs text-bw-muted hover:text-bw-primary mt-4 transition-colors"
        >
          Voir toutes les séances →
        </Link>
      )}
    </GlassCardV2>
  );
}
