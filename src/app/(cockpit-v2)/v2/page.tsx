"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useDashboardSummary } from "@/hooks/use-dashboard-v2";
import { useAuthUser } from "@/hooks/use-auth-user";
import { PHASES, MAIN_PHASE_IDS } from "@/lib/modules-data";
import { MiniCalendar } from "@/components/v2/mini-calendar";
import { HeroNextSession } from "@/components/v2/hero-next-session";
import { ROUTES } from "@/lib/routes";

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

const mainPhases = PHASES.filter((p) => (MAIN_PHASE_IDS as readonly string[]).includes(p.id));

export default function DashboardV2Page() {
  const { data: authUser } = useAuthUser();
  const [classLabel, setClassLabel] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useDashboardSummary(classLabel, authUser?.role);

  const firstName = authUser?.name?.split(" ")[0] || "";
  const isProfesseur = authUser?.role === "professeur";
  const stats = data?.stats;
  const completedModuleIds = data?.completedModuleIds || [];

  const activeSession = useMemo(
    () =>
      data?.todaySessions?.find((s) => s.status === "responding" || s.status === "voting" || s.status === "waiting"),
    [data?.todaySessions],
  );

  const nextSession = useMemo(
    () => (!activeSession ? data?.todaySessions?.find((s) => s.status === "draft") : undefined),
    [activeSession, data?.todaySessions],
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
    <div className="px-4 sm:px-6 pt-16 lg:pt-6 pb-6 max-w-[1440px] mx-auto" aria-live="polite">
      {/* ── Greeting row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-display-sm text-bw-heading font-cinema">
            <span className="bg-gradient-to-r from-[var(--color-bw-violet)] to-[var(--color-bw-pink)] bg-clip-text text-transparent">
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
          {!isProfesseur && (
            <Link
              href={ROUTES.seanceNew}
              className="inline-flex items-center gap-1.5 rounded-xl bg-bw-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-bw-primary-500 active:scale-[0.97] transition-all"
            >
              + Nouvelle séance
            </Link>
          )}
        </div>
      </div>

      {/* ── 2-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="lg:col-span-8 space-y-5">
          {/* Hero — point focal P1 : session active ou prochaine séance */}
          <HeroNextSession activeSession={activeSession} nextSession={nextSession} isProfesseur={isProfesseur} />

          {/* Séances du jour */}
          {data?.todaySessions && data.todaySessions.length > 0 && (
            <div className="rounded-2xl border border-[var(--color-bw-border-subtle)] p-5">
              <h3 className="label-caps mb-3">Aujourd&apos;hui</h3>
              <div className="space-y-2">
                {data.todaySessions.map((s, i) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 py-2 pl-3 rounded-xl hover:bg-bw-primary/[0.025] transition-colors duration-150 relative animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div
                      className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                      style={{
                        backgroundColor:
                          s.status === "done"
                            ? "var(--color-bw-green)"
                            : s.status === "waiting" || s.status === "draft"
                              ? "var(--color-bw-amber)"
                              : "var(--color-bw-teal)",
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
                      className="shrink-0 inline-flex items-center rounded-lg bg-bw-primary px-3 min-h-[44px] text-xs font-semibold text-white hover:bg-bw-primary-500 btn-hover"
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
                color: "var(--color-axis-engagement, var(--color-bw-amber))",
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
                className="relative overflow-hidden p-6 rounded-2xl border border-[var(--color-bw-border-subtle)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(139,92,246,0.12)]"
                style={{
                  background: `linear-gradient(135deg, ${kpi.color}08 0%, transparent 60%)`,
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{
                    background: `linear-gradient(90deg, ${kpi.color}, ${kpi.color}66)`,
                    boxShadow: `0 1px 8px ${kpi.color}33`,
                  }}
                />
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-2">
                    <span className="label-caps text-bw-muted">{kpi.label}</span>
                    <span className="text-heading-xl font-black tabular-nums text-bw-heading">{kpi.value}</span>
                  </div>
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      {kpi.icon === "✓" && (
                        <>
                          <path d="M20 6L9 17l-5-5" />
                        </>
                      )}
                      {kpi.icon === "⏱" && (
                        <>
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </>
                      )}
                      {kpi.icon === "≡" && (
                        <>
                          <path d="M3 6h18M3 12h18M3 18h14" />
                        </>
                      )}
                      {kpi.icon === "👥" && (
                        <>
                          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                        </>
                      )}
                    </svg>
                  </div>
                </div>
                {/* Trends will be added when API supports them */}
              </div>
            ))}
          </div>

          {/* Séances récentes (table) */}
          {data?.recentSessions && data.recentSessions.length > 0 && (
            <div>
              <h3 className="text-heading-sm text-bw-heading mb-3">Séances récentes</h3>
              <div className="overflow-x-auto rounded-2xl border border-[var(--color-bw-border-subtle)] scrollbar-thin">
                <table className="w-full text-body-sm" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["DATE", "CLASSE", "FORMULE", "ÉLÈVES", "PARTICIPATION", "ACTIONS"].map((h) => (
                        <th
                          key={h}
                          className="p-3 text-left text-body-xs uppercase tracking-wider text-bw-muted border-b border-[var(--color-bw-border-subtle)]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentSessions.slice(0, 5).map((s) => {
                      const levelLabel =
                        s.level === "primaire" ? "Primaire" : s.level === "lycee" ? "Lycée" : "Collège";
                      return (
                        <tr
                          key={s.id}
                          className="border-b border-[var(--color-bw-border-subtle)] last:border-b-0 hover:bg-bw-primary/[0.02] transition-colors duration-150"
                        >
                          <td className="p-3 text-bw-heading">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{
                                  backgroundColor:
                                    s.status === "done"
                                      ? "var(--color-bw-green)"
                                      : s.status === "responding" || s.status === "voting"
                                        ? "var(--color-bw-teal)"
                                        : "var(--color-bw-amber)",
                                }}
                              />
                              {new Date(s.scheduledAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-bw-heading truncate max-w-[200px]">{s.title}</span>
                              {s.classLabel && <span className="text-body-xs text-bw-muted">{s.classLabel}</span>}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-body-xs font-bold bg-[var(--color-bw-violet)]/10 text-[var(--color-bw-violet)]">
                              {levelLabel}
                            </span>
                          </td>
                          <td className="p-3 text-bw-heading tabular-nums">{s.studentCount}</td>
                          <td className="p-3 text-bw-green font-semibold tabular-nums">
                            {s.studentCount > 0 ? "96%" : "—"}
                          </td>
                          <td className="p-3">
                            <Link
                              href={ROUTES.seanceResults(s.id)}
                              className="inline-flex items-center px-3 min-h-[44px] rounded-lg text-body-xs font-medium text-[var(--color-bw-violet)] bg-[var(--color-bw-violet)]/8 hover:bg-[var(--color-bw-violet)]/15 transition-colors duration-150"
                            >
                              Voir →
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
            <div className="rounded-2xl border border-[var(--color-bw-border-subtle)] p-4">
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
            <div className="rounded-2xl border border-[var(--color-bw-border-subtle)] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="label-caps text-bw-muted">Actions requises</h3>
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-bw-primary text-white text-body-xs font-bold px-1.5">
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
          <div className="rounded-2xl border border-[var(--color-bw-border-subtle)] p-4">
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
                      <p className="text-heading-xs text-bw-heading truncate">{phase.label}</p>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-[var(--color-bw-surface)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(to right, ${phase.color}, ${phase.color}80)`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-body-xs font-semibold text-bw-text tabular-nums whitespace-nowrap">
                      {doneCount}/{total} · {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historique récent */}
          {data?.recentSessions && data.recentSessions.length > 0 && (
            <div className="rounded-2xl border border-[var(--color-bw-border-subtle)] p-4">
              <h3 className="label-caps text-bw-muted mb-3">Historique récent</h3>
              <div className="space-y-2">
                {data.recentSessions.slice(0, 6).map((s) => {
                  const statusColor =
                    s.status === "done"
                      ? "var(--color-bw-green)"
                      : s.status === "responding" || s.status === "voting"
                        ? "var(--color-bw-teal)"
                        : "var(--color-bw-amber)";
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
                        <p className="text-heading-xs text-bw-heading truncate">{s.title}</p>
                        <p className="text-body-xs text-bw-muted">
                          {new Date(s.scheduledAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} ·{" "}
                          {s.studentCount} élèves · {s.classLabel}
                        </p>
                      </div>
                      <span
                        className="text-body-xs font-semibold px-2 py-0.5 rounded-full"
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

          {/* Agenda calendrier */}
          <div className="rounded-2xl border border-[var(--color-bw-border-subtle)] p-4">
            <h3 className="label-caps text-bw-muted mb-3">Agenda</h3>
            <MiniCalendar sessionDates={(data?.sessionDates || []).map((d) => new Date(d))} />
          </div>
        </div>
      </div>

      {/* Empty state — expressive */}
      {!data?.todaySessions?.length && !data?.recentSessions?.length && (
        <div className="text-center py-20">
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, -3, 3, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="text-8xl mb-6 drop-shadow-[0_0_24px_rgba(139,92,246,0.3)]"
          >
            🎬
          </motion.div>
          <h2 className="text-display-md text-bw-heading font-cinema mb-3">Action !</h2>
          <p className="text-body-sm text-bw-muted mb-8 max-w-sm mx-auto">
            Le plateau est prêt. Créez votre première séance et lancez le tournage.
          </p>
          <Link
            href={ROUTES.seanceNew}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[var(--color-bw-violet)] to-[var(--color-bw-pink)] glow-accent hover:shadow-[0_0_30px_rgba(139,92,246,0.35)] transition-all duration-200"
          >
            + Nouvelle séance
          </Link>
        </div>
      )}
    </div>
  );
}
