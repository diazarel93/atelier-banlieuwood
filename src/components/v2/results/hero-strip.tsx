"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";
import { StatRing } from "@/components/v2/stat-ring";
import type { ExportData, FeedbackData } from "@/hooks/use-results-data";

interface HeroStripProps {
  exportData: ExportData;
  feedback: FeedbackData | null;
  onCopy: () => void;
  onCsv: () => void;
  onPdf: () => void;
  onDownloadMd: () => void;
  onShare: () => void;
}

export function HeroStrip({ exportData, feedback, onCopy, onCsv, onPdf, onDownloadMd, onShare }: HeroStripProps) {
  const { session, studentsCount, choicesCount } = exportData;
  const stats = feedback?.stats;

  const kpis = [
    {
      value: studentsCount,
      label: "Élèves",
      color: "var(--color-bw-teal, #4ECDC4)",
    },
    {
      value: stats?.totalResponses ?? choicesCount,
      label: "Réponses",
      color: "var(--color-bw-violet, #8B5CF6)",
    },
    {
      value: stats?.participationRate ?? 0,
      label: "Participation",
      color: "var(--color-bw-primary, #FF6B35)",
      isPercent: true,
    },
    {
      value: feedback?.overallScore ?? 0,
      label: "Score global",
      color: "var(--color-bw-gold, #D4A843)",
      isPercent: true,
    },
  ];

  return (
    <GlassCardV2 className="p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        {/* Title block */}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-bw-heading truncate">{session.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-bw-muted">
            <span>{session.date}</span>
            <span className="inline-block w-1 h-1 rounded-full bg-bw-muted" />
            <span className="capitalize">{session.level}</span>
            <span className="inline-block w-1 h-1 rounded-full bg-bw-muted" />
            <span>
              {studentsCount} élève{studentsCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "Copier", onClick: onCopy },
            { label: "CSV", onClick: onCsv, disabled: !feedback },
            { label: "PDF", onClick: onPdf },
            { label: ".md", onClick: onDownloadMd },
            { label: "Partager", onClick: onShare },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              disabled={btn.disabled}
              className="rounded-lg border border-[var(--color-bw-border)] px-3 py-1.5 text-xs font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="flex flex-col items-center gap-1">
            {kpi.isPercent ? (
              <StatRing value={kpi.value} label={kpi.label} color={kpi.color} size={64} strokeWidth={4} />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold tabular-nums" style={{ color: kpi.color }}>
                  {kpi.value}
                </span>
                <span className="text-xs font-medium text-bw-muted">{kpi.label}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </GlassCardV2>
  );
}
