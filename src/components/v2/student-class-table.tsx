"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GlassCardV2 } from "./glass-card";
import { Avatar } from "./avatar";
import { ROUTES } from "@/lib/routes";

interface Student {
  profileId: string;
  displayName: string;
  avatar: string | null;
  classLabel: string | null;
  sessionCount: number;
  totalResponses: number;
  lastActiveAt: string;
}

interface StudentClassTableProps {
  students: Student[];
  className?: string;
}

type ActivityTier = "active" | "recent" | "inactive";

function getActivityBadge(lastActiveAt: string): {
  label: string;
  tier: ActivityTier;
} {
  const diffDays = (Date.now() - new Date(lastActiveAt).getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 7) return { label: "Actif", tier: "active" };
  if (diffDays < 30) return { label: "Récent", tier: "recent" };
  return { label: "Inactif", tier: "inactive" };
}

const BADGE_STYLES: Record<ActivityTier, string> = {
  active: "bg-[var(--color-bw-green-100)] text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20",
  recent: "bg-[var(--color-bw-amber-100)] text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20",
  inactive: "bg-[var(--color-bw-surface-dim)] text-bw-muted ring-1 ring-inset ring-[var(--color-bw-border)]",
};

const DOT_STYLES: Record<ActivityTier, string> = {
  active: "bg-emerald-500",
  recent: "bg-amber-400",
  inactive: "bg-[var(--color-bw-border)]",
};

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function StudentClassTable({ students, className }: StudentClassTableProps) {
  const groups = useMemo(() => {
    const map = new Map<string, Student[]>();
    for (const s of students) {
      const key = s.classLabel || "Sans classe";
      const arr = map.get(key) || [];
      arr.push(s);
      map.set(key, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.displayName.localeCompare(b.displayName, "fr"));
    }
    const entries = [...map.entries()].sort((a, b) => {
      if (a[0] === "Sans classe") return 1;
      if (b[0] === "Sans classe") return -1;
      return a[0].localeCompare(b[0], "fr");
    });
    return entries;
  }, [students]);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggleGroup(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className={className}>
      {groups.map(([groupLabel, groupStudents]) => {
        const isCollapsed = collapsed.has(groupLabel);
        return (
          <GlassCardV2 key={groupLabel} className="overflow-hidden mb-5">
            {/* ── Group header ── */}
            <button
              type="button"
              onClick={() => toggleGroup(groupLabel)}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-[var(--color-bw-surface-dim)]/60 hover:bg-[var(--color-bw-surface-dim)] transition-colors duration-150 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-heading-xs text-bw-heading">{groupLabel}</span>
                <span className="inline-flex items-center rounded-full bg-[var(--color-bw-border)] px-2 py-0.5 text-[11px] font-medium text-bw-muted tabular-nums">
                  {groupStudents.length}
                </span>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-bw-muted transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>

            {/* ── Table ── */}
            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-bw-border)]">
                      <th className="px-5 py-3 text-left text-body-xs font-semibold text-bw-muted uppercase tracking-wider">
                        Élève
                      </th>
                      <th className="px-3 py-3 text-center text-body-xs font-semibold text-bw-muted uppercase tracking-wider w-20">
                        Séances
                      </th>
                      <th className="px-3 py-3 text-center text-body-xs font-semibold text-bw-muted uppercase tracking-wider w-24">
                        Réponses
                      </th>
                      <th className="px-3 py-3 text-center text-body-xs font-semibold text-bw-muted uppercase tracking-wider hidden sm:table-cell w-32">
                        Activité
                      </th>
                      <th className="px-3 py-3 text-center text-body-xs font-semibold text-bw-muted uppercase tracking-wider w-24">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupStudents.map((student, idx) => {
                      const badge = getActivityBadge(student.lastActiveAt);
                      const isEven = idx % 2 === 1;
                      return (
                        <tr
                          key={student.profileId}
                          className={`
                            border-b border-[var(--color-bw-border-subtle)] last:border-0
                            transition-colors duration-100
                            hover:bg-bw-primary/[0.03]
                            ${isEven ? "bg-[var(--color-bw-surface-dim)]/30" : ""}
                          `}
                        >
                          <td className="px-5 py-3">
                            <Link
                              href={ROUTES.eleveDetail(student.profileId)}
                              className="group flex items-center gap-2.5"
                            >
                              <Avatar name={student.displayName} emoji={student.avatar} />
                              <span className="font-medium text-bw-heading truncate max-w-[180px] group-hover:text-bw-primary transition-colors duration-150">
                                {student.displayName}
                              </span>
                            </Link>
                          </td>
                          <td className="px-3 py-3 text-center text-bw-text tabular-nums font-medium">
                            {student.sessionCount}
                          </td>
                          <td className="px-3 py-3 text-center text-bw-text tabular-nums font-medium">
                            {student.totalResponses}
                          </td>
                          <td className="px-3 py-3 text-center text-bw-muted text-body-xs hidden sm:table-cell">
                            {formatShortDate(student.lastActiveAt)}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-center">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${BADGE_STYLES[badge.tier]}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[badge.tier]}`} />
                                {badge.label}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCardV2>
        );
      })}
    </div>
  );
}
