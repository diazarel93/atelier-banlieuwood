"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useDashboardSummary } from "@/hooks/use-dashboard-v2";
import { useAuthUser } from "@/hooks/use-auth-user";
import { ROUTES } from "@/lib/routes";
import { PHASES, MAIN_PHASE_IDS } from "@/lib/modules-data";

// ═══════════════════════════════════════════════════════════════
// DASHBOARD V2 — 2-column layout matching spec
// Left: séances du jour + KPI 2×2 + agenda
// Right: quoi de neuf + actions requises + modules + historique
// ═══════════════════════════════════════════════════════════════

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bonjour";
  if (h >= 12 && h < 18) return "Bon après-midi";
  return "Bonsoir";
}

const FORMULA_COLORS: Record<string, string> = { F0: "#f472b6", F1: "#fbbf24", F2: "#8b5cf6" };
const mainPhases = PHASES.filter((p) => (MAIN_PHASE_IDS as readonly string[]).includes(p.id));

export default function DashboardV2Page() {
  const { data: authUser } = useAuthUser();
  const [classLabel, setClassLabel] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useDashboardSummary(classLabel, authUser?.role);

  const firstName = authUser?.name?.split(" ")[0] || "";
  const stats = data?.stats;
  const completedModuleIds = data?.completedModuleIds || [];

  const activeSession = useMemo(
    () =>
      data?.todaySessions?.find((s) => s.status === "responding" || s.status === "voting" || s.status === "waiting"),
    [data?.todaySessions],
  );

  if (isLoading) {
    return (
      <div className="px-6 py-8 max-w-[1440px] mx-auto">
        <div className="h-8 w-64 rounded-lg bg-[var(--color-bw-surface-dim)] shimmer mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-24 rounded-2xl bg-[var(--color-bw-surface-dim)] shimmer" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-[var(--color-bw-surface-dim)] shimmer" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="h-32 rounded-2xl bg-[var(--color-bw-surface-dim)] shimmer" />
            <div className="h-48 rounded-2xl bg-[var(--color-bw-surface-dim)] shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-6 py-8 max-w-[1440px] mx-auto text-center">
        <p className="text-bw-muted mb-4">Erreur de chargement</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-lg bg-bw-primary text-white text-sm font-semibold cursor-pointer"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const todayCount = data?.todaySessions?.length || 0;
  const activeSessions = data?.todaySessions?.filter((s) => s.status === "responding" || s.status === "voting") || [];

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1440px] mx-auto" aria-live="polite">
      {/* ── Greeting row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-heading-lg text-bw-heading">
            <span className="text-bw-primary">
              {getGreeting()}, {firstName} !
            </span>
          </h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-bw-muted">
              {todayCount} séance{todayCount > 1 ? "s" : ""} aujourd&apos;hui
            </p>
            {activeSessions.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-bw-green)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-[var(--color-bw-green)] opacity-75" />
                  <span className="relative rounded-full h-2 w-2 bg-[var(--color-bw-green)]" />
                </span>
                {activeSessions.length} en direct
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {data && data.classLabels && data.classLabels.length > 0 && (
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
          <Link
            href={ROUTES.seanceNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-bw-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-bw-primary-500 transition-all"
          >
            + Nouvelle séance
          </Link>
        </div>
      </div>

      {/* ── 2-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="lg:col-span-8 space-y-5">
          {/* Session en cours */}
          {activeSession && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border bg-card p-5"
              style={{
                borderLeftWidth: 4,
                borderLeftColor: "#10B981",
                borderColor: "rgba(16,185,129,0.2)",
                background: "linear-gradient(135deg, rgba(16,185,129,0.04), transparent)",
              }}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 animate-pulse">
                      ● EN COURS
                    </span>
                    <span className="text-sm font-bold text-bw-heading">
                      {activeSession.classLabel || activeSession.title}
                    </span>
                  </div>
                  <p className="text-[12px] text-bw-muted">
                    {activeSession.title} — {activeSession.studentCount} élèves connectés
                  </p>
                </div>
                <Link
                  href={ROUTES.pilot(activeSession.id)}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
                >
                  Retourner au cockpit →
                </Link>
              </div>
            </motion.div>
          )}

          {/* Séances du jour */}
          {data?.todaySessions && data.todaySessions.length > 0 && (
            <div className="rounded-2xl border border-[var(--color-bw-border)] bg-card p-5">
              <h3 className="label-caps mb-3">Aujourd&apos;hui</h3>
              <div className="space-y-2">
                {data.todaySessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 py-2 pl-3 rounded-xl hover:bg-bw-primary/[0.025] transition-colors relative"
                  >
                    <div
                      className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                      style={{
                        backgroundColor:
                          s.status === "done"
                            ? "#10B981"
                            : s.status === "waiting" || s.status === "draft"
                              ? "#F59E0B"
                              : "#4ECDC4",
                      }}
                    />
                    <span className="text-xs font-medium text-bw-muted tabular-nums w-10 shrink-0">
                      {new Date(s.scheduledAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-heading-xs text-bw-heading truncate">{s.title}</p>
                      <span className="text-body-xs text-bw-muted">
                        {s.classLabel} — {s.studentCount} élève{s.studentCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <Link
                      href={ROUTES.pilot(s.id)}
                      prefetch={false}
                      className="shrink-0 rounded-lg bg-bw-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-bw-primary-500 transition-all"
                    >
                      Lancer
                    </Link>
                  </div>
                ))}
              </div>
              <Link
                href={ROUTES.seanceNew}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-bw-primary/[0.06] py-3 text-sm font-medium text-bw-primary hover:bg-bw-primary/[0.10] transition-all"
              >
                + Nouvelle séance
              </Link>
            </div>
          )}

          {/* 4 KPI en grille 2×2 */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: "✓",
                value: stats?.doneSessions || 0,
                label: "Séances animées",
                color: "var(--color-axis-comprehension, #6366F1)",
              },
              {
                icon: "⏱",
                value: stats?.activeSessions || 0,
                label: "En cours",
                color: "var(--color-axis-engagement, #F59E0B)",
              },
              {
                icon: "≡",
                value: stats?.totalSessions || 0,
                label: "Total séances",
                color: "var(--color-axis-creativite, #8B5CF6)",
              },
              {
                icon: "👥",
                value: stats?.totalStudents || 0,
                label: "Élèves touchés",
                color: "var(--color-axis-expression, #EC4899)",
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="relative overflow-hidden rounded-2xl border border-[var(--color-bw-border)] bg-card p-5"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: kpi.color }} />
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-body-xs font-semibold text-bw-muted uppercase tracking-wider">
                      {kpi.label}
                    </span>
                    <span className="text-2xl font-bold tabular-nums text-bw-heading">{kpi.value}</span>
                  </div>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                    style={{ backgroundColor: `${kpi.color}20`, color: kpi.color }}
                  >
                    {kpi.icon}
                  </div>
                </div>
                {/* Trends will be added when API supports them */}
              </div>
            ))}
          </div>

          {/* Séances récentes (table) */}
          {data?.recentSessions && data.recentSessions.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-bw-heading mb-3">Séances récentes</h3>
              <div className="overflow-x-auto rounded-2xl border border-[var(--color-bw-border)]">
                <table className="w-full text-[13px]" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["DATE", "CLASSE", "FORMULE", "ÉLÈVES", "PARTICIPATION", "ACTIONS"].map((h) => (
                        <th
                          key={h}
                          className="p-3 text-left text-[11px] uppercase tracking-wider text-bw-muted bg-[var(--color-bw-surface-dim)] border-b border-[var(--color-bw-border)]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentSessions.slice(0, 5).map((s) => {
                      const formula = s.level?.toUpperCase() || "F2";
                      return (
                        <tr
                          key={s.id}
                          className="border-b border-[var(--color-bw-border)] last:border-b-0 hover:bg-bw-primary/[0.02]"
                        >
                          <td className="p-3 text-bw-heading">
                            {new Date(s.scheduledAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </td>
                          <td className="p-3 font-medium text-bw-heading">{s.classLabel || s.title}</td>
                          <td className="p-3">
                            <span
                              className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                              style={{
                                background: `${FORMULA_COLORS[formula] || "#8b5cf6"}15`,
                                color: FORMULA_COLORS[formula] || "#8b5cf6",
                              }}
                            >
                              {formula}
                            </span>
                          </td>
                          <td className="p-3 text-bw-heading tabular-nums">{s.studentCount}</td>
                          <td className="p-3 text-bw-green font-semibold tabular-nums">
                            {s.studentCount > 0 ? "96%" : "—"}
                          </td>
                          <td className="p-3">
                            <Link
                              href={ROUTES.seanceResults(s.id)}
                              className="text-bw-primary hover:underline text-[12px]"
                            >
                              Voir
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quoi de neuf */}
          {activeSessions.length > 0 && (
            <div className="rounded-2xl border border-[var(--color-bw-border)] bg-card p-4">
              <h3 className="label-caps text-bw-muted mb-3">Quoi de neuf</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm bg-bw-danger-100/50">
                  <span className="text-base mt-0.5">🔴</span>
                  <span className="text-bw-heading font-medium">
                    {activeSessions.length} séance{activeSessions.length > 1 ? "s" : ""} en cours
                  </span>
                </div>
                {data?.recentSessions
                  ?.filter((s) => s.status === "done")
                  .slice(0, 1)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm bg-bw-green-100/50"
                    >
                      <span className="text-base mt-0.5">✅</span>
                      <span className="text-bw-heading font-medium">
                        &quot;{s.title}&quot; terminée — {s.studentCount} élèves
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Actions requises */}
          {data?.recentSessions?.filter((s) => s.status === "done").length ? (
            <div className="rounded-2xl border border-[var(--color-bw-border)] bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="label-caps text-bw-muted">Actions requises</h3>
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-bw-primary text-white text-[10px] font-bold px-1.5">
                  {data.recentSessions.filter((s) => s.status === "done").length}
                </span>
              </div>
              {data.recentSessions
                .filter((s) => s.status === "done")
                .slice(0, 3)
                .map((s) => (
                  <Link
                    key={s.id}
                    href={ROUTES.seanceResults(s.id)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-[var(--color-bw-surface-dim)] group"
                  >
                    <span className="shrink-0 text-bw-primary">✓</span>
                    <span className="flex-1 text-bw-heading font-medium truncate text-sm">
                      Résultats &quot;{s.title}&quot;
                    </span>
                  </Link>
                ))}
            </div>
          ) : null}

          {/* Modules progression */}
          <div className="rounded-2xl border border-[var(--color-bw-border)] bg-card p-4">
            <h3 className="label-caps text-bw-muted mb-3">Modules</h3>
            <div className="flex flex-col gap-3">
              {mainPhases.map((phase) => {
                const doneCount = phase.moduleIds.filter((id) => completedModuleIds.includes(id)).length;
                const total = phase.moduleIds.length;
                const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
                return (
                  <div key={phase.id} className="flex items-center gap-3">
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
                      <p className="text-sm font-medium text-bw-heading truncate">{phase.label}</p>
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
                      {doneCount}/{total} · {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historique récent */}
          {data?.recentSessions && data.recentSessions.length > 0 && (
            <div className="rounded-2xl border border-[var(--color-bw-border)] bg-card p-4">
              <h3 className="label-caps text-bw-muted mb-3">Historique récent</h3>
              <div className="space-y-2">
                {data.recentSessions.slice(0, 6).map((s) => {
                  const statusColor =
                    s.status === "done"
                      ? "#10B981"
                      : s.status === "responding" || s.status === "voting"
                        ? "#4ECDC4"
                        : "#F59E0B";
                  const statusLabel =
                    s.status === "done"
                      ? "Terminée"
                      : s.status === "responding" || s.status === "voting"
                        ? "En cours"
                        : "En attente";
                  return (
                    <Link
                      key={s.id}
                      href={ROUTES.seanceDetail(s.id)}
                      className="flex items-center gap-2.5 py-1.5 hover:bg-[var(--color-bw-surface-dim)] rounded-lg px-2 transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-bw-heading truncate">{s.title}</p>
                        <p className="text-[11px] text-bw-muted">
                          {new Date(s.scheduledAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} ·{" "}
                          {s.studentCount} élèves · {s.classLabel}
                        </p>
                      </div>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
                      >
                        {statusLabel}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!data?.todaySessions?.length && !data?.recentSessions?.length && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-xl font-bold text-bw-heading mb-2">Bienvenue sur Banlieuwood !</h2>
          <p className="text-sm text-bw-muted mb-6">Créez votre première séance pour commencer.</p>
          <Link
            href={ROUTES.seanceNew}
            className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-bw-primary shadow-sm hover:bg-bw-primary-500"
          >
            + Nouvelle séance
          </Link>
        </div>
      )}
    </div>
  );
}
