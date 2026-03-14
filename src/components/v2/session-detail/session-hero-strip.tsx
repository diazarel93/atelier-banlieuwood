"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";
import type { ModuleDef, PhaseDef } from "@/lib/modules-data";

const LEVEL_LABELS: Record<string, string> = {
  primaire: "Primaire",
  college: "Collège",
  lycee: "Lycée",
};

interface SessionHeroStripProps {
  title: string;
  level: string;
  activeStudentCount: number;
  currentModule: ModuleDef | null;
  currentPhase: PhaseDef | null;
}

export function SessionHeroStrip({
  title,
  level,
  activeStudentCount,
  currentModule,
  currentPhase,
}: SessionHeroStripProps) {
  return (
    <GlassCardV2 variant="elevated" className="p-6 sm:p-8">
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {currentPhase && (
          <span
            className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: `${currentPhase.color}15`,
              color: currentPhase.color,
              border: `1px solid ${currentPhase.color}25`,
            }}
          >
            {currentPhase.label}
          </span>
        )}
        <span className="text-xs font-medium text-bw-muted px-2.5 py-1 rounded-full bg-[var(--color-bw-surface-dim)]">
          {LEVEL_LABELS[level] || level}
        </span>
      </div>

      <h2 className="text-2xl font-bold text-bw-heading leading-tight mb-2">
        {title}
      </h2>

      {currentModule && (
        <p className="text-sm text-bw-muted mb-4">
          Module en cours :{" "}
          <span className="font-medium text-bw-heading">
            {currentModule.title}
          </span>
          {currentModule.subtitle && (
            <span className="text-bw-muted"> — {currentModule.subtitle}</span>
          )}
        </p>
      )}

      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-bw-muted">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {activeStudentCount} élève{activeStudentCount !== 1 ? "s" : ""}
        </span>
        {currentModule && (
          <>
            <span className="text-bw-muted flex items-center gap-1">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {currentModule.duration}
            </span>
            <span className="text-bw-muted">
              {currentModule.questions} questions
            </span>
          </>
        )}
      </div>
    </GlassCardV2>
  );
}
