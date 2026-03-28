"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { StatsKpiRow } from "@/components/v2/stats-kpi-row";
import { StatsDistributionChart } from "@/components/v2/stats-distribution-chart";
import { SessionSelector } from "@/components/v2/session-selector";
import { QuestionAnalyticsTable } from "@/components/v2/question-analytics-table";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { EmptyState } from "@/components/v2/empty-state";
import { useQuestionAnalytics } from "@/hooks/use-question-analytics";
import { ClassComparisonChart } from "@/components/v2/class-comparison-chart";
import { ClassEvolutionChart } from "@/components/v2/class-evolution-chart";
import { PHASES, getModuleById } from "@/lib/modules-data";
import type { AxesScores } from "@/lib/axes-mapping";

interface StatsStudent {
  id: string;
  displayName: string;
  avatar: string | null;
  scores: AxesScores;
  totalResponses?: number;
}

interface StatsData {
  classAverage: AxesScores;
  students: StatsStudent[];
  sessionCount: number;
  classLabels: string[];
  sessions: { id: string; title: string; classLabel: string | null }[];
}

// Build unique module options from PHASES for the filter dropdown
const MODULE_OPTIONS = PHASES.flatMap((p) =>
  p.moduleIds.map((mid) => {
    const mod = getModuleById(mid);
    return mod ? { value: String(mod.dbModule), label: `${p.label} — ${mod.title}`, dbModule: mod.dbModule } : null;
  }),
).filter((o): o is { value: string; label: string; dbModule: number } => o !== null);

// Deduplicate by dbModule (keep first occurrence)
const UNIQUE_MODULE_OPTIONS = MODULE_OPTIONS.filter((opt, i, arr) => arr.findIndex((o) => o.value === opt.value) === i);

async function fetchStats(
  classLabel: string | null,
  sessionId: string | null,
  dateFrom: string | null,
  dateTo: string | null,
  moduleFilter: string | null,
): Promise<StatsData> {
  const params = new URLSearchParams();
  if (classLabel) params.set("classLabel", classLabel);
  if (sessionId) params.set("sessionId", sessionId);
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  if (moduleFilter) params.set("module", moduleFilter);
  const res = await fetch(`/api/v2/stats?${params}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }
  return res.json();
}

export default function StatistiquesPage() {
  const [classLabel, setClassLabel] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [moduleFilter, setModuleFilter] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["v2", "stats", classLabel, sessionId, dateFrom, dateTo, moduleFilter],
    queryFn: () => fetchStats(classLabel, sessionId, dateFrom, dateTo, moduleFilter),
    staleTime: 30_000,
  });

  const { data: qaData } = useQuestionAnalytics(sessionId, classLabel);

  const hasStudents = data && data.students.length > 0;

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 pt-16 lg:pt-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-heading-lg text-bw-heading">Statistiques</h1>
          <p className="text-sm text-bw-muted mt-0.5">Vue d&apos;ensemble des compétences par axe</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {data && data.sessions.length > 0 && (
            <SessionSelector
              sessions={data.sessions}
              classLabels={data.classLabels}
              selectedClassLabel={classLabel}
              selectedSessionId={sessionId}
              onClassChange={setClassLabel}
              onSessionChange={setSessionId}
            />
          )}
          {/* Module filter */}
          <select
            value={moduleFilter || ""}
            onChange={(e) => setModuleFilter(e.target.value || null)}
            className="h-9 rounded-lg border border-[var(--color-bw-border)] bg-card px-3 text-sm text-bw-heading focus:outline-none focus:ring-2 focus:ring-bw-primary/30"
          >
            <option value="">Tous les modules</option>
            {UNIQUE_MODULE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-bw-muted shrink-0">Du</label>
            <input
              type="date"
              value={dateFrom || ""}
              onChange={(e) => setDateFrom(e.target.value || null)}
              className="h-9 rounded-lg border border-[var(--color-bw-border)] bg-card px-2 text-sm text-bw-heading focus:outline-none focus:ring-2 focus:ring-bw-primary/30"
            />
            <label className="text-xs text-bw-muted shrink-0">au</label>
            <input
              type="date"
              value={dateTo || ""}
              onChange={(e) => setDateTo(e.target.value || null)}
              className="h-9 rounded-lg border border-[var(--color-bw-border)] bg-card px-2 text-sm text-bw-heading focus:outline-none focus:ring-2 focus:ring-bw-primary/30"
            />
            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => {
                  setDateFrom(null);
                  setDateTo(null);
                }}
                className="h-9 rounded-lg border border-[var(--color-bw-border)] px-2 text-xs font-medium text-bw-muted hover:text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
                title="Effacer les dates"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          {sessionId && (
            <Link
              href={ROUTES.seanceResults(sessionId)}
              className="rounded-lg border border-[var(--color-bw-border)] px-3 py-1.5 text-xs font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
            >
              Voir les résultats
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-card shimmer" />
            ))}
          </div>
          <div className="h-48 rounded-2xl bg-card shimmer" />
          <div className="h-64 rounded-2xl bg-card shimmer" />
        </div>
      ) : isError ? (
        <GlassCardV2 className="p-8 text-center">
          <p className="text-sm text-bw-muted mb-4">Impossible de charger les statistiques</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-[var(--color-bw-border)] px-4 py-2 text-sm font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
          >
            Réessayer
          </button>
        </GlassCardV2>
      ) : data && !hasStudents ? (
        <EmptyState
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M3 15V8M7 15V5M11 15V9M15 15V3M19 15V7" />
              <line x1="1" y1="19" x2="23" y2="19" />
            </svg>
          }
          title="Pas encore de données"
          description="Les statistiques apparaîtront après qu'au moins une séance ait été terminée avec des élèves."
          action={{ label: "Voir mes séances", href: ROUTES.seances }}
        />
      ) : data ? (
        <div className="flex flex-col gap-6">
          {/* KPI rings */}
          <StatsKpiRow scores={data.classAverage} />

          {/* Distribution */}
          <StatsDistributionChart
            scores={data.classAverage}
            sessionCount={data.sessionCount}
            studentCount={data.students.length}
          />

          {/* Class comparison */}
          <ClassComparisonChart />

          {/* Multi-student evolution */}
          <ClassEvolutionChart classLabel={classLabel} />

          {/* Question analytics */}
          {qaData && qaData.questions.length > 0 && (
            <div>
              <h2 className="label-caps mb-3">Analyse par question</h2>
              <QuestionAnalyticsTable questions={qaData.questions} />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
