"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { GlassCardV2 } from "./glass-card";
import type { QuestionAnalyticsItem } from "@/hooks/use-question-analytics";

interface QuestionAnalyticsTableProps {
  questions: QuestionAnalyticsItem[];
  className?: string;
}

type SortKey = "label" | "responseCount" | "avgAiScore" | "avgResponseTimeMs";
type SortDir = "asc" | "desc";

function scoreColor(score: number | null): string {
  if (score === null) return "text-bw-muted";
  if (score < 2) return "text-red-500";
  if (score < 3) return "text-amber-500";
  return "text-emerald-500";
}

function formatTime(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      className={cn(
        "inline-block ml-1 transition-opacity",
        active ? "opacity-100" : "opacity-0 group-hover:opacity-40",
      )}
      aria-hidden="true"
    >
      <path d={dir === "asc" ? "M5 2l3 4H2l3-4z" : "M5 8L2 4h6L5 8z"} fill="currentColor" />
    </svg>
  );
}

export function QuestionAnalyticsTable({ questions, className }: QuestionAnalyticsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("avgAiScore");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "label" ? "asc" : "asc");
    }
  }

  const sorted = useMemo(() => {
    const list = [...questions];
    list.sort((a, b) => {
      let cmp: number;
      if (sortKey === "label") {
        cmp = a.label.localeCompare(b.label, "fr");
      } else {
        const aVal = a[sortKey] ?? -1;
        const bVal = b[sortKey] ?? -1;
        cmp = (aVal as number) - (bVal as number);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [questions, sortKey, sortDir]);

  if (questions.length === 0) {
    return (
      <GlassCardV2 className={cn("p-6 text-center", className)}>
        <p className="text-sm text-bw-muted">Aucune donnée par question disponible</p>
      </GlassCardV2>
    );
  }

  return (
    <GlassCardV2 className={cn("overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-bw-border)]">
              <th className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={() => handleSort("label")}
                  className="group font-medium text-bw-muted text-xs uppercase tracking-wide cursor-pointer hover:text-bw-heading transition-colors"
                >
                  Question
                  <SortIcon active={sortKey === "label"} dir={sortDir} />
                </button>
              </th>
              <th className="px-3 py-3 text-center">
                <button
                  type="button"
                  onClick={() => handleSort("responseCount")}
                  className="group font-medium text-bw-muted text-xs uppercase tracking-wide cursor-pointer hover:text-bw-heading transition-colors"
                >
                  Réponses
                  <SortIcon active={sortKey === "responseCount"} dir={sortDir} />
                </button>
              </th>
              <th className="px-3 py-3 text-center">
                <button
                  type="button"
                  onClick={() => handleSort("avgAiScore")}
                  className="group font-medium text-bw-muted text-xs uppercase tracking-wide cursor-pointer hover:text-bw-heading transition-colors"
                >
                  Score moyen
                  <SortIcon active={sortKey === "avgAiScore"} dir={sortDir} />
                </button>
              </th>
              <th className="px-3 py-3 text-center hidden sm:table-cell">
                <button
                  type="button"
                  onClick={() => handleSort("avgResponseTimeMs")}
                  className="group font-medium text-bw-muted text-xs uppercase tracking-wide cursor-pointer hover:text-bw-heading transition-colors"
                >
                  Temps moyen
                  <SortIcon active={sortKey === "avgResponseTimeMs"} dir={sortDir} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((q) => (
              <tr
                key={q.situationId}
                className="border-b border-[var(--color-bw-border-subtle)] last:border-0 hover:bg-[var(--color-bw-surface-dim)] transition-colors"
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-bw-heading line-clamp-1">{q.label}</span>
                    {q.category && (
                      <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-bw-surface-dim)] text-bw-muted whitespace-nowrap">
                        {q.category}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center text-bw-muted tabular-nums">{q.responseCount}</td>
                <td className="px-3 py-2.5 text-center">
                  <span className={cn("font-bold tabular-nums", scoreColor(q.avgAiScore))}>
                    {q.avgAiScore !== null ? q.avgAiScore.toFixed(1) : "—"}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center text-bw-muted tabular-nums hidden sm:table-cell">
                  {formatTime(q.avgResponseTimeMs)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCardV2>
  );
}
