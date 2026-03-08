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

const SEVERITY_STYLES = {
  alert: {
    dot: "bg-[var(--color-bw-danger)]",
    pill: "bg-[var(--color-bw-danger-100)] text-[var(--color-bw-danger)]",
  },
  warning: {
    dot: "bg-[var(--color-bw-amber)]",
    pill: "bg-[var(--color-bw-amber-100)] text-[var(--color-bw-amber-500)]",
  },
} as const;

export function AtRiskWidget({ students }: AtRiskWidgetProps) {
  if (students.length === 0) {
    return (
      <GlassCardV2 className="p-5">
        <h3 className="label-caps mb-3">Élèves à surveiller</h3>
        <div className="flex items-center gap-2 text-body-sm text-[var(--color-bw-green)]">
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
    <GlassCardV2 className="p-5">
      <h3 className="label-caps mb-3">Élèves à surveiller</h3>
      <div className="flex flex-col gap-1">
        {students.slice(0, 5).map((student) => {
          const styles = SEVERITY_STYLES[student.severity];
          return (
            <Link
              key={student.profileId}
              href={ROUTES.eleveDetail(student.profileId)}
              className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-bw-primary/[0.025] transition-colors duration-100"
            >
              <div
                className={cn(
                  "mt-1.5 h-2 w-2 rounded-full shrink-0",
                  styles.dot
                )}
              />
              {student.avatar && (
                <span className="text-sm shrink-0">{student.avatar}</span>
              )}
              <div className="min-w-0">
                <p className="text-heading-xs text-bw-heading truncate">
                  {student.displayName}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {student.reasons.map((reason, i) => (
                    <span
                      key={i}
                      className={cn(
                        "inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ring-1 ring-inset ring-current/10",
                        styles.pill
                      )}
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </GlassCardV2>
  );
}
