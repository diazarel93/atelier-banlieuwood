"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDashboardSummary } from "@/hooks/use-dashboard-v2";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ROUTES } from "@/lib/routes";
import { TodaySessions } from "@/components/v2/today-sessions";
import { QuickStats } from "@/components/v2/quick-stats";
import { MiniCalendar } from "@/components/v2/mini-calendar";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { AtRiskWidget } from "@/components/v2/at-risk-widget";
import { FacilitatorTimeline } from "@/components/v2/facilitator-timeline";
import { OnboardingWizard } from "@/components/v2/onboarding-wizard";
import { ActionRequiredWidget } from "@/components/v2/action-required-widget";
import { WhatsNewWidget } from "@/components/v2/whats-new-widget";
import { PHASES, MAIN_PHASE_IDS } from "@/lib/modules-data";
import { ErrorBoundary } from "@/components/error-boundary";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bonjour";
  if (h >= 12 && h < 18) return "Bon après-midi";
  return "Bonsoir";
}

// Static computation — no need to recalculate per render
const mainPhases = PHASES.filter((p) =>
  (MAIN_PHASE_IDS as readonly string[]).includes(p.id)
);

export default function DashboardV2Page() {
  const [classLabel, setClassLabel] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useDashboardSummary(classLabel);
  const { data: authUser } = useAuthUser();
  const prefersReducedMotion = useReducedMotion();

  const router = useRouter();

  // Page-level keyboard shortcuts (Notion/Linear-style)
  const shortcuts = useMemo(
    () => [
      { key: "n", action: () => router.push(ROUTES.seanceNew), label: "Nouvelle séance" },
      { key: "s", action: () => router.push(ROUTES.seances), label: "Séances" },
      { key: "e", action: () => router.push(ROUTES.eleves), label: "Élèves" },
      { key: "r", action: () => { refetch(); toast.success("Données actualisées"); }, label: "Rafraîchir" },
    ],
    [router, refetch]
  );
  useKeyboardShortcuts(shortcuts);

  const sessionDates = useMemo(
    () => (data?.sessionDates || []).map((d) => new Date(d)),
    [data?.sessionDates]
  );

  const columnVariants = prefersReducedMotion
    ? { hidden: {}, visible: () => ({}) }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, delay: i * 0.1, ease: "easeOut" as const },
        }),
      };

  const isFirstUse = data && data.stats.totalSessions === 0;
  const completedModuleIds = data?.completedModuleIds || [];

  const todayCount = data?.todaySessions?.length || 0;
  const subtitle = todayCount > 0
    ? `${todayCount} séance${todayCount > 1 ? "s" : ""} aujourd'hui`
    : "Aucune séance prévue";

  // Milestone celebrations
  useEffect(() => {
    if (prefersReducedMotion) return;
    const milestones = [5, 10, 25, 50, 100];
    const done = data?.stats.doneSessions ?? 0;
    const reached = milestones.filter((m) => done >= m);
    if (reached.length === 0) return;
    const latest = reached[reached.length - 1];
    const seen = Number(localStorage.getItem("bw-milestone-seen") || "0");
    if (latest > seen) {
      localStorage.setItem("bw-milestone-seen", String(latest));
      import("canvas-confetti").then((mod) =>
        mod.default({ particleCount: 80, spread: 60 })
      );
      toast.success(`${latest} séances animées !`);
    }
  }, [data?.stats.doneSessions, prefersReducedMotion]);

  const firstName = authUser?.name ? authUser.name.split(" ")[0] : "";

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6" aria-live="polite">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-bw-heading">
            <span className="text-gradient-cinema">
              {getGreeting()}{firstName ? `, ${firstName}` : ""} !
            </span>
          </h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-bw-muted">
              {isLoading ? "Chargement..." : subtitle}
            </p>
            {data && data.stats.activeSessions > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-bw-green)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-[var(--color-bw-green)] opacity-75" />
                  <span className="relative rounded-full h-2 w-2 bg-[var(--color-bw-green)]" />
                </span>
                {data.stats.activeSessions} en direct
              </span>
            )}
          </div>
        </div>
        {data && data.classLabels.length > 0 && (
          <select
            value={classLabel ?? ""}
            onChange={(e) => setClassLabel(e.target.value || null)}
            aria-label="Filtrer par classe"
            className="rounded-lg border border-[var(--color-bw-border)] bg-card px-3 py-1.5 text-sm text-bw-heading focus:outline-none focus:ring-2 focus:ring-bw-primary/30"
          >
            <option value="">Toutes les classes</option>
            {data.classLabels.map((cl) => (
              <option key={cl} value={cl}>
                {cl}
              </option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : isFirstUse ? (
        <OnboardingWizard />
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column — Today's sessions */}
          <motion.div
            custom={0}
            variants={columnVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-4"
          >
            <ErrorBoundary variant="compact">
              <TodaySessions
                todaySessions={data.todaySessions}
                tomorrowSessions={data.tomorrowSessions}
              />
            </ErrorBoundary>
          </motion.div>

          {/* Center column — Stats */}
          <motion.div
            custom={1}
            variants={columnVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 flex flex-col gap-4"
          >
            <ErrorBoundary variant="compact">
              <QuickStats stats={data.stats} trends={data.trends} />
            </ErrorBoundary>

            <div className="flex-1">
              <h3 className="label-caps text-bw-muted mb-3">
                Agenda
              </h3>
              <ErrorBoundary variant="compact">
                <MiniCalendar sessionDates={sessionDates} />
              </ErrorBoundary>
            </div>
          </motion.div>

          {/* Right column — Actions + Modules progression + at-risk */}
          <motion.div
            custom={2}
            variants={columnVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-3 flex flex-col gap-4"
          >
            <ErrorBoundary variant="compact">
              <WhatsNewWidget
                stats={data.stats}
                trends={data.trends}
                recentSessions={data.recentSessions}
                todaySessions={data.todaySessions}
              />
            </ErrorBoundary>

            <ErrorBoundary variant="compact">
              <ActionRequiredWidget
                todaySessions={data.todaySessions}
                tomorrowSessions={data.tomorrowSessions}
                atRiskStudents={data.atRiskStudents}
                recentSessions={data.recentSessions}
              />
            </ErrorBoundary>

            {data.atRiskStudents && data.atRiskStudents.length > 0 && (
              <ErrorBoundary variant="compact">
                <AtRiskWidget students={data.atRiskStudents} />
              </ErrorBoundary>
            )}
            <ErrorBoundary variant="compact">
            <GlassCardV2 className="p-4">
              <h3 className="label-caps text-bw-muted mb-3">
                Modules
              </h3>
              <div className="flex flex-col gap-3">
                {mainPhases.map((phase) => {
                  const doneModuleCount = phase.moduleIds.filter((id) => completedModuleIds.includes(id)).length;
                  const total = phase.moduleIds.length;
                  const pct = total > 0 ? Math.round((doneModuleCount / total) * 100) : 0;

                  return (
                    <div key={phase.id} className="flex items-center gap-3">
                      {/* Emoji in colored circle */}
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full shrink-0 text-sm"
                        style={{
                          background: `linear-gradient(135deg, ${phase.color}33, ${phase.color}14)`,
                          border: `1px solid ${phase.color}40`,
                        }}
                      >
                        {phase.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-bw-heading truncate">
                          {phase.label}
                        </p>
                        <div
                          className="mt-1 h-1.5 w-full rounded-full bg-[var(--color-bw-surface-dim)] overflow-hidden"
                          role="progressbar"
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${phase.label} : ${pct}%`}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(to right, ${phase.color}, ${phase.color}80)`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-bw-muted tabular-nums whitespace-nowrap">
                        {doneModuleCount}/{total} · {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </GlassCardV2>
            </ErrorBoundary>

            {/* Facilitator session history timeline */}
            {data.recentSessions && data.recentSessions.length > 0 && (
              <ErrorBoundary variant="compact">
                <FacilitatorTimeline
                  sessions={data.recentSessions.map((s) => ({
                    id: s.id,
                    title: s.title,
                    status: s.status,
                    classLabel: s.classLabel,
                    studentCount: s.studentCount,
                    date: s.scheduledAt,
                  }))}
                />
              </ErrorBoundary>
            )}
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
    <GlassCardV2 className="p-8 flex flex-col items-center text-center max-w-md mx-auto">
      {/* Alert triangle SVG */}
      <div className="mb-4">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path
            d="M24 6L4 42h40L24 6z"
            fill="var(--color-bw-amber-100)"
            stroke="var(--color-bw-amber)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M24 20v10"
            stroke="var(--color-bw-amber)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="24" cy="35" r="1.5" fill="var(--color-bw-amber)" />
        </svg>
      </div>
      <p className="text-sm font-medium text-bw-heading mb-1">
        {isOnline
          ? "Erreur serveur"
          : "Pas de connexion internet"}
      </p>
      <p className="text-sm text-bw-muted mb-4">
        {isOnline
          ? "Impossible de charger le tableau de bord. Réessayez dans un instant."
          : "Vérifiez votre connexion et réessayez."}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-bw-primary px-4 py-2 text-sm font-medium text-white hover:bg-bw-primary-500 transition-colors"
        >
          Réessayer
        </button>
        <a
          href="mailto:support@banlieuwood.fr"
          className="text-xs text-bw-muted hover:text-bw-heading transition-colors"
        >
          Besoin d&apos;aide ?
        </a>
      </div>
    </GlassCardV2>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left — Today sessions skeleton */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl bg-card border border-[var(--color-bw-border)] p-5">
            <div className="h-2.5 w-20 rounded-full bg-[var(--color-bw-surface-dim)] shimmer mb-4" />
            <div className="flex flex-col gap-4">
              {[1, 2].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="h-6 w-1 rounded-full bg-[var(--color-bw-surface-dim)] shimmer" />
                  <div className="flex-1">
                    <div className="h-3.5 w-32 rounded-full bg-[var(--color-bw-surface-dim)] shimmer mb-2" />
                    <div className="h-2.5 w-20 rounded-full bg-[var(--color-bw-surface-dim)]/60 shimmer" />
                  </div>
                  <div className="h-6 w-16 rounded-full bg-[var(--color-bw-surface-dim)]/60 shimmer" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Center — KPIs + calendar */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl bg-card border border-[var(--color-bw-border)] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-2.5 w-16 rounded-full bg-[var(--color-bw-surface-dim)] shimmer mb-3" />
                  <div className="h-6 w-10 rounded-full bg-[var(--color-bw-surface-dim)] shimmer" />
                </div>
                <div className="h-10 w-10 rounded-xl bg-[var(--color-bw-surface-dim)]/60 shimmer" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-card border border-[var(--color-bw-border)] shimmer" />
      </div>
      {/* Right — Modules */}
      <div className="lg:col-span-3">
        <div className="rounded-2xl bg-card border border-[var(--color-bw-border)] p-5">
          <div className="h-2.5 w-20 rounded-full bg-[var(--color-bw-surface-dim)] shimmer mb-5" />
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[var(--color-bw-surface-dim)]/60 shimmer shrink-0" />
                <div className="flex-1">
                  <div className="h-3 w-24 rounded-full bg-[var(--color-bw-surface-dim)] shimmer mb-2" />
                  <div className="h-1.5 w-full rounded-full bg-[var(--color-bw-surface-dim)]/60 shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
