"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface AnalyticsData {
  totalSessions: number;
  activeSessions: number;
  doneSessions: number;
  totalStudents: number;
  totalResponses: number;
  totalVotes: number;
  totalChoices: number;
  avgParticipation: number;
  moduleUsage: { module: number; count: number }[];
  levelDistribution: { level: string; count: number }[];
  templateUsage?: { template: string; count: number }[];
  recentActivity: { title: string; date: string; students: number; status: string }[];
  weeklyTrend?: { week: string; sessions: number }[];
  dailyActivity?: { date: string; count: number }[];
}

const MODULE_NAMES: Record<number, string> = {
  1: "L'Idee",
  2: "Emotion Cachee",
  5: "L'Histoire",
  10: "Imagination",
};

const LEVEL_LABELS: Record<string, string> = {
  primaire: "Primaire",
  college: "College",
  lycee: "Lycee",
  "non defini": "Non defini",
};

const STATUS_COLORS: Record<string, string> = {
  waiting: "#F59E0B",
  responding: "#4ECDC4",
  reviewing: "#8B5CF6",
  vote: "#FF6B35",
  paused: "#555960",
  done: "#10B981",
};

export function DashboardAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true); // starts open, collapsible

  useEffect(() => {
    fetch("/api/sessions/analytics")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mt-6">
      <button onClick={() => setOpen((p) => !p)} className="group flex items-center gap-2.5 w-full cursor-pointer">
        <div className="w-[3px] h-5 rounded-full bg-gradient-to-b from-bw-violet to-bw-teal" />
        <h2
          className="bw-display text-lg uppercase text-bw-heading group-hover:text-white transition-colors"
          style={{ letterSpacing: "-0.01em" }}
        >
          Statistiques
        </h2>
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-bw-muted ml-1"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
        {!open && data && data.totalSessions > 0 && (
          <span className="text-xs text-bw-muted font-mono tabular-nums ml-auto">
            {data.totalResponses} rep. · {data.totalVotes} votes · {data.avgParticipation}% part.
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open &&
          (loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <AnalyticsSkeleton />
            </motion.div>
          ) : data && data.totalSessions > 0 ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-5">
                {/* KPI row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MiniKpi label="Reponses" value={data.totalResponses} color="#FF6B35" />
                  <MiniKpi label="Votes" value={data.totalVotes} color="#8B5CF6" />
                  <MiniKpi label="Choix collectifs" value={data.totalChoices} color="#4ECDC4" />
                  <MiniKpi label="Participation moy." value={data.avgParticipation} suffix="%" color="#D4A843" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Module usage */}
                  {data.moduleUsage.length > 0 && (
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bw-muted">
                        Modules utilises
                      </p>
                      <div className="space-y-2.5">
                        {data.moduleUsage.map((m) => {
                          const max = data.moduleUsage[0].count;
                          const pct = max > 0 ? (m.count / max) * 100 : 0;
                          return (
                            <div key={m.module} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-bw-text">
                                  {MODULE_NAMES[m.module] || `Module ${m.module}`}
                                </span>
                                <span className="text-xs font-mono text-bw-muted tabular-nums">{m.count}</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
                                  className="h-full rounded-full bg-gradient-to-r from-bw-violet to-bw-teal"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Level distribution */}
                  {data.levelDistribution.length > 0 && (
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bw-muted">Niveaux</p>
                      <div className="flex flex-wrap gap-2">
                        {data.levelDistribution.map((l) => (
                          <span
                            key={l.level}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-bw-text"
                          >
                            {LEVEL_LABELS[l.level] || l.level}
                            <span className="font-bold text-bw-primary tabular-nums">{l.count}</span>
                          </span>
                        ))}
                      </div>

                      {/* Recent activity */}
                      {data.recentActivity.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bw-muted">
                            Activite recente
                          </p>
                          {data.recentActivity.slice(0, 5).map((a, i) => (
                            <div key={i} className="flex items-center gap-2.5 py-1.5">
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: STATUS_COLORS[a.status] || "#555" }}
                              />
                              <span className="text-xs text-bw-text truncate flex-1">{a.title}</span>
                              <span className="text-xs text-bw-muted tabular-nums flex-shrink-0">
                                {a.students} eleves
                              </span>
                              <span className="text-xs text-bw-placeholder tabular-nums flex-shrink-0">
                                {new Date(a.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Weekly trend — mini bar chart */}
                  {data.weeklyTrend && data.weeklyTrend.some((w) => w.sessions > 0) && (
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bw-muted">
                        Tendance hebdomadaire
                      </p>
                      <div className="flex items-end gap-1 h-16">
                        {data.weeklyTrend.map((w, i) => {
                          const max = Math.max(...data.weeklyTrend!.map((x) => x.sessions), 1);
                          const h = (w.sessions / max) * 100;
                          return (
                            <motion.div
                              key={w.week}
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(h, 4)}%` }}
                              transition={{ duration: 0.5, delay: i * 0.05 }}
                              className="flex-1 rounded-sm"
                              style={{
                                backgroundColor: w.sessions > 0 ? "#4ECDC4" : "rgba(255,255,255,0.04)",
                                minHeight: 2,
                              }}
                              title={`${w.week}: ${w.sessions} session${w.sessions > 1 ? "s" : ""}`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-xs text-bw-placeholder">
                        <span>il y a 8 sem.</span>
                        <span>cette sem.</span>
                      </div>
                    </div>
                  )}

                  {/* Daily activity heatmap — 30 days */}
                  {data.dailyActivity && data.dailyActivity.some((d) => d.count > 0) && (
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bw-muted">
                        Activite (30 jours)
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {data.dailyActivity.map((d) => {
                          const max = Math.max(...data.dailyActivity!.map((x) => x.count), 1);
                          const intensity = d.count / max;
                          return (
                            <div
                              key={d.date}
                              className="w-3 h-3 rounded-sm"
                              style={{
                                backgroundColor:
                                  d.count > 0
                                    ? `rgba(78, 205, 196, ${0.2 + intensity * 0.8})`
                                    : "rgba(255,255,255,0.03)",
                              }}
                              title={`${d.date}: ${d.count} session${d.count > 1 ? "s" : ""}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : data && data.totalSessions === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="pt-4 text-[12px] text-bw-muted">
                Les statistiques apparaitront apres votre premiere session terminee.
              </p>
            </motion.div>
          ) : null)}
      </AnimatePresence>
    </div>
  );
}

function MiniKpi({ label, value, color, suffix }: { label: string; value: number; color: string; suffix?: string }) {
  const dim = value === 0;
  return (
    <div
      className="relative overflow-hidden rounded-xl bg-white/[0.03] border-t border-white/[0.08] px-3 py-3"
      style={{ borderLeft: `2px solid ${dim ? "transparent" : color}` }}
    >
      <p className="text-xs uppercase tracking-[0.12em] text-bw-muted font-semibold">{label}</p>
      <p
        className="text-lg font-bold font-mono tabular-nums mt-0.5"
        style={{ color: dim ? "rgba(255,255,255,0.25)" : color, letterSpacing: "-0.03em" }}
      >
        {value}
        {suffix || ""}
      </p>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="pt-4 space-y-4 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-white/[0.03] border-t border-white/[0.06] px-3 py-3 space-y-2">
            <div className="h-2 w-16 rounded bg-white/[0.04]" />
            <div className="h-5 w-10 rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 h-32" />
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 h-32" />
      </div>
    </div>
  );
}
