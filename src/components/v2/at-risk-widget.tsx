"use client";

import Link from "next/link";
import { GlassCardV2 } from "./glass-card";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface AtRiskStudent {
  profileId: string;
  displayName: string;
  avatar: string | null;
  severity: "warning" | "alert";
  reasons: string[];
}

interface AtRiskWidgetProps {
  students: AtRiskStudent[];
}

export function AtRiskWidget({ students }: AtRiskWidgetProps) {
  if (students.length === 0) {
    return (
      <GlassCardV2 className="p-4">
        <h3 className="text-xs font-semibold text-bw-heading uppercase tracking-wide mb-3">
          Élèves à surveiller
        </h3>
        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Tous les élèves sont sur la bonne voie
        </div>
      </GlassCardV2>
    );
  }

  return (
    <GlassCardV2 className="p-4">
      <h3 className="text-xs font-semibold text-bw-heading uppercase tracking-wide mb-3">
        Élèves à surveiller
      </h3>
      <div className="flex flex-col gap-2">
        {students.slice(0, 5).map((student) => (
          <Link
            key={student.profileId}
            href={ROUTES.eleveDetail(student.profileId)}
            className="flex items-start gap-2 rounded-lg p-2 hover:bg-[var(--color-bw-surface-dim)] transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={cn(
                  "mt-1 h-2 w-2 rounded-full shrink-0",
                  student.severity === "alert"
                    ? "bg-red-500"
                    : "bg-amber-400"
                )}
              />
              {student.avatar && (
                <span className="text-sm shrink-0">{student.avatar}</span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-bw-heading truncate">
                  {student.displayName}
                </p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {student.reasons.map((reason, i) => (
                    <span
                      key={i}
                      className={cn(
                        "inline-block text-[10px] px-1.5 py-0.5 rounded-full",
                        student.severity === "alert"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-600"
                      )}
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </GlassCardV2>
  );
}
