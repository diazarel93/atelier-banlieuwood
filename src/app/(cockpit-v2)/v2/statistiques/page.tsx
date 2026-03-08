"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { StatsKpiRow } from "@/components/v2/stats-kpi-row";
import { StatsDistributionChart } from "@/components/v2/stats-distribution-chart";
import { StudentDotsTable } from "@/components/v2/student-dots-table";
import { SessionSelector } from "@/components/v2/session-selector";
import { QuestionAnalyticsTable } from "@/components/v2/question-analytics-table";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { EmptyState } from "@/components/v2/empty-state";
import { useQuestionAnalytics } from "@/hooks/use-question-analytics";
import type { AxesScores } from "@/lib/axes-mapping";

interface StatsData {
  classAverage: AxesScores;
  students: {
    id: string;
    displayName: string;
    avatar: string | null;
    scores: AxesScores;
  }[];
  sessionCount: number;
  classLabels: string[];
  sessions: { id: string; title: string; classLabel: string | null }[];
}

async function fetchStats(
  classLabel: string | null,
  sessionId: string | null
): Promise<StatsData> {
  const params = new URLSearchParams();
  if (classLabel) params.set("classLabel", classLabel);
  if (sessionId) params.set("sessionId", sessionId);
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["v2", "stats", classLabel, sessionId],
    queryFn: () => fetchStats(classLabel, sessionId),
    staleTime: 30_000,
  });

  const { data: qaData } = useQuestionAnalytics(sessionId, classLabel);

  const hasStudents = data && data.students.length > 0;

  function handleExportCsv() {
    if (!data) return;
    const header = ["Élève", "Compréhension", "Créativité", "Expression", "Engagement"];
    const rows = data.students.map((s) => [
      s.displayName,
      s.scores.comprehension,
      s.scores.creativite,
      s.scores.expression,
      s.scores.engagement,
    ]);
    const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statistiques-banlieuwood.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-bw-heading">Statistiques</h1>
          <p className="text-sm text-bw-muted mt-0.5">
            Vue d'ensemble des compétences par axe
          </p>
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
          {hasStudents && (
            <button
              type="button"
              onClick={handleExportCsv}
              className="rounded-lg border border-[var(--color-bw-border)] px-3 py-1.5 text-xs font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
            >
              Exporter CSV
            </button>
          )}
          {sessionId && (
            <Link
              href={`/v2/seances/${sessionId}/results`}
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
              <div key={i} className="h-28 rounded-2xl bg-white shimmer" />
            ))}
          </div>
          <div className="h-48 rounded-2xl bg-white shimmer" />
          <div className="h-64 rounded-2xl bg-white shimmer" />
        </div>
      ) : isError ? (
        <GlassCardV2 className="p-8 text-center">
          <p className="text-sm text-bw-muted mb-4">
            Impossible de charger les statistiques
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg border border-[var(--color-bw-border)] px-4 py-2 text-sm font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
          >
            Réessayer
          </button>
        </GlassCardV2>
      ) : data && !hasStudents ? (
        <EmptyState
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 15V8M7 15V5M11 15V9M15 15V3M19 15V7" />
              <line x1="1" y1="19" x2="23" y2="19" />
            </svg>
          }
          title="Pas encore de données"
          description="Les statistiques apparaîtront après qu'au moins une séance ait été terminée avec des élèves."
          action={{ label: "Voir mes séances", href: "/v2/seances" }}
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

          {/* Student dots table */}
          <div>
            <h2 className="text-sm font-semibold text-bw-heading mb-3">
              Détail par élève
            </h2>
            <StudentDotsTable
              students={data.students.map((s) => ({
                id: s.id,
                displayName: s.displayName,
                avatar: s.avatar || undefined,
                scores: s.scores,
              }))}
            />
          </div>

          {/* Question analytics */}
          {qaData && qaData.questions.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-bw-heading mb-3">
                Analyse par question
              </h2>
              <QuestionAnalyticsTable questions={qaData.questions} />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
