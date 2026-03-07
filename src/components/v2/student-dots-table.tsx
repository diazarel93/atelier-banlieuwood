"use client";

import { cn } from "@/lib/utils";
import { AXES, type AxesScores } from "@/lib/axes-mapping";
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

export function StudentDotsTable({ students, className }: StudentDotsTableProps) {
  return (
    <GlassCardV2 className={cn("overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-bw-border)]">
              <th className="px-4 py-3 text-left font-medium text-bw-muted text-xs uppercase tracking-wide">
                Élève
              </th>
              {AXES.map((axis) => (
                <th
                  key={axis.key}
                  className="px-3 py-3 text-center font-medium text-xs uppercase tracking-wide"
                  style={{ color: axis.color }}
                >
                  {axis.shortLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
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
