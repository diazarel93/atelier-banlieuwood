"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useDashboardSummary } from "@/hooks/use-dashboard-v2";
import { TodaySessions } from "@/components/v2/today-sessions";
import { QuickStats } from "@/components/v2/quick-stats";
import { MiniCalendar } from "@/components/v2/mini-calendar";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { AtRiskWidget } from "@/components/v2/at-risk-widget";
import { PHASES } from "@/lib/modules-data";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bonjour";
  if (h >= 12 && h < 18) return "Bon après-midi";
  return "Bonsoir";
}

export default function DashboardV2Page() {
  const [classLabel, setClassLabel] = useState<string | null>(null);
  const { data, isLoading, isError } = useDashboardSummary(classLabel);

  const sessionDates = (data?.sessionDates || []).map((d) => new Date(d));

  // Main phases for the progress sidebar
  const mainPhases = PHASES.filter((p) =>
    ["idea", "emotion", "imagination", "collectif", "scenario"].includes(p.id)
  );

  const isFirstUse = data && data.stats.totalSessions === 0;
  const completedModuleIds = data?.completedModuleIds || [];

  const todayCount = data?.todaySessions?.length || 0;
  const subtitle = todayCount > 0
    ? `${todayCount} séance${todayCount > 1 ? "s" : ""} aujourd'hui`
    : "Aucune séance prévue";

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-bw-heading">
            <span className="text-gradient-cinema">{getGreeting()}</span>
          </h1>
          <p className="text-sm text-bw-muted mt-0.5">
            {isLoading ? "Chargement..." : subtitle}
          </p>
        </div>
        {data && data.classLabels.length > 0 && (
          <select
            value={classLabel ?? ""}
            onChange={(e) => setClassLabel(e.target.value || null)}
            className="rounded-lg border border-[var(--color-bw-border)] bg-white px-3 py-1.5 text-sm text-bw-heading focus:outline-none focus:ring-2 focus:ring-bw-primary/30"
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

            <div className="flex-1">
              <h3 className="label-caps text-bw-muted mb-3">
                Agenda
              </h3>
              <MiniCalendar sessionDates={sessionDates} />
            </div>
          </div>

          {/* Right column — Modules progression + at-risk */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {data.atRiskStudents && data.atRiskStudents.length > 0 && (
              <AtRiskWidget students={data.atRiskStudents} />
            )}
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
                        <div className="mt-1 h-1.5 w-full rounded-full bg-[var(--color-bw-surface-dim)] overflow-hidden">
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
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FirstUseState() {
  const steps = [
    { num: 1, label: "Créez une séance", color: "#FF6B35" },
    { num: 2, label: "Préparez le contenu", color: "#D4A843" },
    { num: 3, label: "Lancez avec vos élèves", color: "#8B5CF6" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassCardV2 className="p-8 flex flex-col items-center text-center max-w-lg mx-auto">
        {/* Clap SVG illustration */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Clap base */}
            <rect x="12" y="38" width="56" height="30" rx="4" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="1.5" />
            {/* Clap top (hinged) */}
            <path d="M12 38L22 18H58L68 38" fill="#FF6B35" fillOpacity="0.15" stroke="#FF6B35" strokeWidth="1.5" strokeLinejoin="round" />
            {/* Diagonal stripes on top */}
            <line x1="30" y1="22" x2="26" y2="36" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="40" y1="20" x2="36" y2="36" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="50" y1="22" x2="46" y2="36" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round" />
            {/* Text lines on base */}
            <line x1="22" y1="48" x2="48" y2="48" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" />
            <line x1="22" y1="54" x2="40" y2="54" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <line x1="22" y1="60" x2="34" y2="60" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            {/* Sparkles */}
            <circle cx="16" cy="14" r="2" fill="#FF6B35" opacity="0.6" />
            <circle cx="64" cy="12" r="1.5" fill="#D4A843" opacity="0.5" />
            <circle cx="72" cy="24" r="2" fill="#8B5CF6" opacity="0.4" />
          </svg>
        </motion.div>

        <motion.h2
          className="text-lg font-bold text-bw-heading mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          Prêt à lancer votre première séance ?
        </motion.h2>
        <motion.p
          className="text-sm text-bw-muted mb-6 leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          Créez une séance pour commencer à piloter des ateliers d&apos;écriture
          cinématographique avec vos élèves.
        </motion.p>

        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
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
        </motion.div>

        {/* 3 steps with staggered animation */}
        <div className="flex items-start gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="flex flex-col items-center gap-2 flex-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: step.color }}
              >
                {step.num}
              </div>
              <span className="text-xs text-bw-muted leading-tight text-center">
                {step.label}
              </span>
            </motion.div>
          ))}
        </div>
      </GlassCardV2>
    </motion.div>
  );
}

function ErrorState() {
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
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 6L4 42h40L24 6z"
            fill="#FEF3C7"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M24 20v10"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="24" cy="35" r="1.5" fill="#F59E0B" />
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
          onClick={() => window.location.reload()}
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
          <div key={i} className="rounded-2xl bg-white border border-[var(--color-bw-border)] p-5">
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
            <div key={i} className="rounded-2xl bg-white border border-[var(--color-bw-border)] p-5">
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
        <div className="h-64 rounded-2xl bg-white border border-[var(--color-bw-border)] shimmer" />
      </div>
      {/* Right — Modules */}
      <div className="lg:col-span-3">
        <div className="rounded-2xl bg-white border border-[var(--color-bw-border)] p-5">
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
