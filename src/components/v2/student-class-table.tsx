"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GlassCardV2 } from "./glass-card";
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

function getActivityBadge(lastActiveAt: string) {
  const now = Date.now();
  const last = new Date(lastActiveAt).getTime();
  const diffDays = (now - last) / (1000 * 60 * 60 * 24);

  if (diffDays < 7)
    return { label: "Actif", dot: "bg-green-500", text: "text-green-700" };
  if (diffDays < 30)
    return { label: "Récent", dot: "bg-orange-400", text: "text-orange-600" };
  return { label: "Inactif", dot: "bg-gray-300", text: "text-gray-400" };
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function StudentClassTable({
  students,
  className,
}: StudentClassTableProps) {
  // Group by classLabel, sorted by name within each group
  const groups = useMemo(() => {
    const map = new Map<string, Student[]>();
    for (const s of students) {
      const key = s.classLabel || "Sans classe";
      const arr = map.get(key) || [];
      arr.push(s);
      map.set(key, arr);
    }
    // Sort students within each group
    for (const arr of map.values()) {
      arr.sort((a, b) => a.displayName.localeCompare(b.displayName, "fr"));
    }
    // Sort groups: real classes first (alpha), "Sans classe" last
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
          <GlassCardV2 key={groupLabel} className="overflow-hidden mb-4">
            {/* Group header */}
            <button
              type="button"
              onClick={() => toggleGroup(groupLabel)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[var(--color-bw-surface-dim)] hover:bg-[var(--color-bw-border-subtle)] transition-colors cursor-pointer"
            >
              <span className="text-sm font-semibold text-bw-heading">
                {groupLabel}{" "}
                <span className="font-normal text-bw-muted">
                  — {groupStudents.length} élève
                  {groupStudents.length !== 1 ? "s" : ""}
                </span>
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className={`text-bw-muted transition-transform ${isCollapsed ? "" : "rotate-180"}`}
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>

            {/* Table body */}
            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-bw-border)]">
                      <th className="px-4 py-2.5 text-left font-medium text-bw-muted text-xs uppercase tracking-wide">
                        Élève
                      </th>
                      <th className="px-3 py-2.5 text-center font-medium text-bw-muted text-xs uppercase tracking-wide">
                        Séances
                      </th>
                      <th className="px-3 py-2.5 text-center font-medium text-bw-muted text-xs uppercase tracking-wide">
                        Réponses
                      </th>
                      <th className="px-3 py-2.5 text-center font-medium text-bw-muted text-xs uppercase tracking-wide hidden sm:table-cell">
                        Dernière activité
                      </th>
                      <th className="px-3 py-2.5 text-center font-medium text-bw-muted text-xs uppercase tracking-wide">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupStudents.map((student) => {
                      const badge = getActivityBadge(student.lastActiveAt);
                      return (
                        <tr
                          key={student.profileId}
                          className="border-b border-[var(--color-bw-border-subtle)] last:border-0 hover:bg-[var(--color-bw-surface-dim)] transition-colors"
                        >
                          <td className="px-4 py-2.5">
                            <Link
                              href={ROUTES.eleveDetail(student.profileId)}
                              className="flex items-center gap-2 hover:underline"
                            >
                              {student.avatar && (
                                <span className="text-lg">
                                  {student.avatar}
                                </span>
                              )}
                              <span className="font-medium text-bw-heading truncate max-w-[160px]">
                                {student.displayName}
                              </span>
                            </Link>
                          </td>
                          <td className="px-3 py-2.5 text-center text-bw-muted tabular-nums">
                            {student.sessionCount}
                          </td>
                          <td className="px-3 py-2.5 text-center text-bw-muted tabular-nums">
                            {student.totalResponses}
                          </td>
                          <td className="px-3 py-2.5 text-center text-bw-muted text-xs hidden sm:table-cell">
                            {formatShortDate(student.lastActiveAt)}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-1.5">
                              <span
                                className={`inline-block h-2 w-2 rounded-full ${badge.dot}`}
                              />
                              <span
                                className={`text-xs font-medium ${badge.text}`}
                              >
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
