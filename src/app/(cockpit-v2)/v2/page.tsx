"use client";

import Link from "next/link";
import { useDashboardSummary } from "@/hooks/use-dashboard-v2";
import { TodaySessions } from "@/components/v2/today-sessions";
import { QuickStats } from "@/components/v2/quick-stats";
import { MiniCalendar } from "@/components/v2/mini-calendar";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { PHASES } from "@/lib/modules-data";

export default function DashboardV2Page() {
  const { data, isLoading, isError } = useDashboardSummary();

  const sessionDates = (data?.sessionDates || []).map((d) => new Date(d));

  // Main phases for the progress sidebar
  const mainPhases = PHASES.filter((p) =>
    ["idea", "emotion", "imagination", "collectif", "scenario"].includes(p.id)
  );

  const isFirstUse = data && data.stats.totalSessions === 0;

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6">
      {/* Welcome header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-bw-heading">Bienvenue</h1>
        <p className="text-sm text-bw-muted mt-0.5">
          Votre espace de pilotage pédagogique
        </p>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <ErrorState />
      ) : isFirstUse ? (
        <FirstUseState />
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column — Today's sessions */}
          <div className="lg:col-span-4">
            <TodaySessions
              todaySessions={data.todaySessions}
              tomorrowSessions={data.tomorrowSessions}
            />
          </div>

          {/* Center column — Stats */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <QuickStats stats={data.stats} />

            <GlassCardV2 className="p-4 flex-1">
              <h3 className="text-xs font-semibold text-bw-muted uppercase tracking-wide mb-3">
                Agenda
              </h3>
              <MiniCalendar sessionDates={sessionDates} />
            </GlassCardV2>
          </div>

          {/* Right column — Modules progression */}
          <div className="lg:col-span-3">
            <GlassCardV2 className="p-4">
              <h3 className="text-xs font-semibold text-bw-muted uppercase tracking-wide mb-3">
                Modules
              </h3>
              <div className="flex flex-col gap-3">
                {mainPhases.map((phase) => {
                  // Compute completed count from done sessions
                  const doneModuleCount = 0; // TODO: wire from actual completed_modules data
                  const total = phase.moduleIds.length;
                  const pct = total > 0 ? Math.round((doneModuleCount / total) * 100) : 0;

                  return (
                    <div key={phase.id} className="flex items-center gap-3">
                      <span className="text-lg">{phase.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-bw-heading truncate">
                          {phase.label}
                        </p>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-[var(--color-bw-surface-dim)] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: phase.color,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-bw-muted tabular-nums">
                        {doneModuleCount}/{total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </GlassCardV2>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FirstUseState() {
  return (
    <GlassCardV2 className="p-8 flex flex-col items-center text-center max-w-lg mx-auto">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bw-primary/10 mb-4">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M8 6l18 10-18 10V6z" fill="var(--color-bw-primary)" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-bw-heading mb-2">
        Prêt à lancer votre première séance ?
      </h2>
      <p className="text-sm text-bw-muted mb-6 leading-relaxed">
        Créez une séance pour commencer à piloter des ateliers d'écriture
        cinématographique avec vos élèves.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/v2/seances/new"
          className="inline-flex items-center gap-2 rounded-lg bg-bw-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-bw-primary-500 transition-colors btn-glow"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Créer ma première séance
        </Link>
        <Link
          href="/v2/bibliotheque"
          className="rounded-lg border border-[var(--color-bw-border)] px-4 py-2.5 text-sm font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
        >
          Explorer les modules
        </Link>
      </div>
    </GlassCardV2>
  );
}

function ErrorState() {
  return (
    <GlassCardV2 className="p-8 text-center max-w-md mx-auto">
      <p className="text-sm text-bw-muted mb-4">
        Impossible de charger le tableau de bord. Vérifiez votre connexion.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-lg border border-[var(--color-bw-border)] px-4 py-2 text-sm font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
      >
        Réessayer
      </button>
    </GlassCardV2>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 flex flex-col gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-white shimmer" />
        ))}
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white shimmer" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-white shimmer" />
      </div>
      <div className="lg:col-span-3">
        <div className="h-72 rounded-2xl bg-white shimmer" />
      </div>
    </div>
  );
}
