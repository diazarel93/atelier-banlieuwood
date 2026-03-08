"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { AXES, type AxesScores, type AxisKey } from "@/lib/axes-mapping";
import { GlassCardV2 } from "./glass-card";

interface StudentRow {
  id: string;
  displayName: string;
  avatar?: string;
  scores: AxesScores;
}

interface StudentDotsTableProps {
  students: StudentRow[];
  className?: string;
}

type SortKey = "name" | AxisKey;
type SortDir = "asc" | "desc";

function ScoreDot({ value, color }: { value: number; color: string }) {
  // 0-33 = small dim, 34-66 = medium, 67-100 = large bright
  const tier = value < 34 ? "low" : value < 67 ? "mid" : "high";
  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "rounded-full transition-all",
          tier === "low" && "h-2 w-2 opacity-40",
          tier === "mid" && "h-2.5 w-2.5 opacity-70",
          tier === "high" && "h-3 w-3 opacity-100"
        )}
        style={{ backgroundColor: color }}
        title={`${value}%`}
      />
    </div>
  );
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
        active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
      )}
      aria-hidden="true"
    >
      <path
        d={dir === "asc" ? "M5 2l3 4H2l3-4z" : "M5 8L2 4h6L5 8z"}
        fill="currentColor"
      />
    </svg>
  );
}

export function StudentDotsTable({ students, className }: StudentDotsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  const sorted = useMemo(() => {
    const list = [...students];
    list.sort((a, b) => {
      let cmp: number;
      if (sortKey === "name") {
        cmp = a.displayName.localeCompare(b.displayName, "fr");
      } else {
        cmp = a.scores[sortKey] - b.scores[sortKey];
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [students, sortKey, sortDir]);

  return (
    <GlassCardV2 className={cn("overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-bw-border)]">
              <th className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={() => handleSort("name")}
                  className="group font-medium text-bw-muted text-xs uppercase tracking-wide cursor-pointer hover:text-bw-heading transition-colors"
                >
                  Élève
                  <SortIcon active={sortKey === "name"} dir={sortDir} />
                </button>
              </th>
              {AXES.map((axis) => (
                <th key={axis.key} className="px-3 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => handleSort(axis.key)}
                    className="group font-medium text-xs uppercase tracking-wide cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ color: axis.color }}
                  >
                    {axis.shortLabel}
                    <SortIcon active={sortKey === axis.key} dir={sortDir} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((student) => (
              <tr
                key={student.id}
                className="border-b border-[var(--color-bw-border-subtle)] last:border-0 hover:bg-[var(--color-bw-surface-dim)] transition-colors"
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    {student.avatar && (
                      <span className="text-lg">{student.avatar}</span>
                    )}
                    <span className="font-medium text-bw-heading truncate max-w-[140px]">
                      {student.displayName}
                    </span>
                  </div>
                </td>
                {AXES.map((axis) => (
                  <td key={axis.key} className="px-3 py-2.5">
                    <ScoreDot
                      value={student.scores[axis.key]}
                      color={axis.color}
                    />
                  </td>
                ))}
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-bw-muted text-sm"
                >
                  Aucun élève
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCardV2>
  );
}
