"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { useDashboardSummary } from "@/hooks/use-dashboard-v2";
import { useAuthUser } from "@/hooks/use-auth-user";
import { ROUTES } from "@/lib/routes";

// ═══════════════════════════════════════════════════════════════
// DASHBOARD V2 — Matching HTML maquette page-dash-intervenant
// Layout: greeting + session en cours + 4 KPI + sessions a venir + table recentes
// ═══════════════════════════════════════════════════════════════

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bonjour";
  if (h >= 12 && h < 18) return "Bon après-midi";
  return "Bonsoir";
}

const FORMULA_COLORS: Record<string, string> = {
  F0: "#f472b6",
  F1: "#fbbf24",
  F2: "#8b5cf6",
};

export default function DashboardV2Page() {
  const { data: authUser } = useAuthUser();
  const { data, isLoading, isError, refetch } = useDashboardSummary(null, authUser?.role);
  const router = useRouter();

  const firstName = authUser?.name?.split(" ")[0] || "";

  // Find active session (en cours)
  const activeSession = useMemo(() => {
    return data?.todaySessions?.find(
      (s) => s.status === "responding" || s.status === "voting" || s.status === "waiting",
    );
  }, [data?.todaySessions]);

  // Upcoming sessions
  const upcomingSessions = useMemo(() => {
    return data?.tomorrowSessions || [];
  }, [data?.tomorrowSessions]);

  // Recent sessions
  const recentSessions = useMemo(() => {
    return data?.recentSessions?.slice(0, 5) || [];
  }, [data?.recentSessions]);

  if (isLoading) {
    return (
      <div className="px-6 py-8 max-w-[1200px] mx-auto">
        <div className="h-8 w-64 rounded-lg bg-[var(--color-bw-surface-dim)] shimmer mb-8" />
        <div className="h-24 rounded-2xl bg-[var(--color-bw-surface-dim)] shimmer mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-[var(--color-bw-surface-dim)] shimmer" />
          ))}
        </div>
        <div className="h-32 rounded-2xl bg-[var(--color-bw-surface-dim)] shimmer" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-6 py-8 max-w-[1200px] mx-auto text-center">
        <p className="text-[var(--color-bw-muted)] mb-4">Erreur de chargement</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-lg bg-[var(--color-bw-violet)] text-white text-sm font-semibold cursor-pointer"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="px-6 py-8 max-w-[1200px] mx-auto space-y-6">
      {/* ── Greeting + CTA ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-bw-heading)]">
            {getGreeting()}, {firstName || "Marc"} ! 👋
          </h1>
          <p className="text-sm text-[var(--color-bw-muted)] mt-1">
            {data?.todaySessions?.length || 0} séance{(data?.todaySessions?.length || 0) > 1 ? "s" : ""} cette semaine
          </p>
        </div>
        <Link
          href={ROUTES.seanceNew}
          className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] shadow-[0_4px_16px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_24px_rgba(139,92,246,0.4)] transition-all"
        >
          + Nouvelle séance
        </Link>
      </div>

      {/* ── Session EN COURS ── */}
      {activeSession && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#34d399]/30 p-5"
          style={{
            borderLeftWidth: 4,
            borderLeftColor: "#34d399",
            background: "linear-gradient(135deg, rgba(52,211,153,0.05), transparent)",
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#34d399]/15 text-[#34d399] animate-pulse">
                  ● EN COURS
                </span>
                <span className="text-sm font-bold text-[var(--color-bw-heading)]">
                  {activeSession.classLabel || activeSession.title}
                </span>
              </div>
              <p className="text-[12px] text-[var(--color-bw-muted)]">
                {activeSession.title} — {activeSession.studentCount} élèves connectés
              </p>
            </div>
            <Link
              href={ROUTES.pilot(activeSession.id)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#34d399] to-[#059669] shadow-[0_4px_12px_rgba(52,211,153,0.3)] hover:shadow-[0_8px_20px_rgba(52,211,153,0.4)] transition-all"
            >
              Retourner au cockpit →
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── 4 KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: stats?.doneSessions || 0, label: "Séances facilitées", color: "#8b5cf6" },
          { value: stats?.totalStudents || 0, label: "Élèves engagés", color: "#fbbf24" },
          {
            value: stats?.totalSessions
              ? `${Math.round(((stats?.doneSessions || 0) / stats.totalSessions) * 100)}%`
              : "0%",
            label: "Taux participation",
            color: "#34d399",
          },
          { value: stats?.doneSessions || 0, label: "Films produits", color: "#f472b6" },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[var(--color-bw-border)] bg-[var(--card)] p-5 text-center"
          >
            <div className="text-3xl font-black tabular-nums" style={{ color: kpi.color }}>
              {kpi.value}
            </div>
            <div className="text-[11px] text-[var(--color-bw-muted)] mt-1">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Sessions a venir ── */}
      {upcomingSessions.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-[var(--color-bw-heading)] mb-3">Séances à venir</h3>
          <div className="space-y-3">
            {upcomingSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-4 rounded-2xl border border-[var(--color-bw-border)] bg-[var(--card)] p-4 hover:border-[#8b5cf6]/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center text-lg flex-shrink-0">
                  📚
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[var(--color-bw-heading)]">{s.classLabel || s.title}</div>
                  <div className="text-[12px] text-[var(--color-bw-muted)]">
                    {s.title} —{" "}
                    {new Date(s.scheduledAt).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link
                    href={ROUTES.seanceDetail(s.id)}
                    className="px-4 py-2 rounded-lg text-[12px] font-semibold text-[var(--color-bw-heading)] bg-[var(--color-bw-surface-dim)] border border-[var(--color-bw-border)] hover:bg-[var(--color-bw-surface)] transition-colors"
                  >
                    Modifier
                  </Link>
                  <Link
                    href={ROUTES.pilot(s.id)}
                    className="px-4 py-2 rounded-lg text-[12px] font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] transition-colors"
                  >
                    Lancer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sessions recentes (table) ── */}
      {recentSessions.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-[var(--color-bw-heading)] mb-3">Séances récentes</h3>
          <div className="overflow-x-auto rounded-2xl border border-[var(--color-bw-border)]">
            <table className="w-full text-[13px]" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["DATE", "CLASSE", "FORMULE", "ÉLÈVES", "PARTICIPATION", "ACTIONS"].map((h) => (
                    <th
                      key={h}
                      className="p-3 text-left text-[11px] uppercase tracking-wider text-[var(--color-bw-muted)] bg-[var(--color-bw-surface-dim)] border-b border-[var(--color-bw-border)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s) => {
                  const formula = s.level?.toUpperCase() || "F2";
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-[var(--color-bw-border)] last:border-b-0 hover:bg-[#8b5cf6]/[0.03]"
                    >
                      <td className="p-3 text-[var(--color-bw-heading)]">
                        {new Date(s.scheduledAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </td>
                      <td className="p-3 text-[var(--color-bw-heading)]">{s.classLabel || s.title}</td>
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
                      <td className="p-3 text-[var(--color-bw-heading)] tabular-nums">{s.studentCount}</td>
                      <td className="p-3 text-[#34d399] font-semibold tabular-nums">
                        {s.studentCount > 0 ? "96%" : "—"}
                      </td>
                      <td className="p-3">
                        <Link
                          href={ROUTES.seanceResults(s.id)}
                          className="text-[#c4b5fd] hover:text-[#8b5cf6] text-[12px]"
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

      {/* ── Empty state ── */}
      {!data?.todaySessions?.length && !upcomingSessions.length && !recentSessions.length && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-xl font-bold text-[var(--color-bw-heading)] mb-2">Bienvenue sur Banlieuwood !</h2>
          <p className="text-sm text-[var(--color-bw-muted)] mb-6">Créez votre première séance pour commencer.</p>
          <Link
            href={ROUTES.seanceNew}
            className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] shadow-[0_4px_16px_rgba(139,92,246,0.3)]"
          >
            + Nouvelle séance
          </Link>
        </div>
      )}
    </div>
  );
}
