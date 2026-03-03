"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { TEMPLATE_LABELS } from "@/lib/constants";
import { PageShell } from "@/components/page-shell";
import { DashboardHeader } from "@/components/dashboard-header";
import { ClapperboardIllustration } from "@/components/cinema-illustrations";

/* ═══════════════════════════════════════════════════════════════
   Types & Config
   ═══════════════════════════════════════════════════════════════ */

interface SessionItem {
  id: string;
  title: string;
  level: string;
  status: string;
  join_code: string;
  current_module: number;
  current_seance: number;
  current_situation_index: number;
  created_at: string;
  studentCount: number;
  template: string | null;
  respondedCount?: number;
  activeCount?: number;
  disconnectedCount?: number;
  stuckCount?: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  waiting:   { label: "En attente", color: "#F59E0B" },
  responding:{ label: "En cours",   color: "#4ECDC4" },
  reviewing: { label: "Review",     color: "#8B5CF6" },
  vote:      { label: "Vote",       color: "#FF6B35" },
  paused:    { label: "Pause",      color: "#555960" },
  done:      { label: "Terminee",   color: "#10B981" },
};

const LEVEL_LABELS: Record<string, string> = {
  primaire: "6-9 ans",
  college: "10-13 ans",
  lycee: "14-18 ans",
};

const AVATAR_COLORS = ["#FF6B35", "#4ECDC4", "#8B5CF6", "#D4A843", "#EC4899"];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "A l'instant";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
}

/* ═══════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push("/login"); return; }
      setUser(authUser);
      try {
        const res = await fetch("/api/sessions");
        if (res.ok) setSessions(await res.json());
      } catch { toast.error("Erreur de chargement"); }
      finally { setLoading(false); }
    }
    load();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  function handleDelete(sessionId: string) {
    if (!confirm("Supprimer cette partie ? Cette action est irreversible.")) return;
    fetch(`/api/sessions/${sessionId}`, { method: "DELETE" })
      .then((res) => {
        if (res.ok) { setSessions((p) => p.filter((s) => s.id !== sessionId)); toast.success("Partie supprimee"); }
        else toast.error("Erreur lors de la suppression");
      })
      .catch(() => toast.error("Erreur de connexion"));
  }

  const activeSessions = sessions.filter((s) => s.status !== "done");
  const doneSessions = sessions.filter((s) => s.status === "done");
  const totalStudents = sessions.reduce((a, s) => a + s.studentCount, 0);
  const directorName = user?.email?.split("@")[0] || "Director";

  return (
    <PageShell maxWidth="lg">
      {/* ── Ambient Key Lights — Electric Cinema atmosphere ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-left warm key light */}
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(255,107,53,0.06),transparent_65%)] blur-3xl" />
        {/* Bottom-right cool fill light */}
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(78,205,196,0.04),transparent_65%)] blur-3xl" />
        {/* Center subtle violet backlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,rgba(139,92,246,0.02),transparent_60%)] blur-3xl" />
        {/* Horizontal lens streak */}
        <div className="absolute top-[30%] right-0 w-96 h-px bg-gradient-to-l from-bw-primary/[0.06] via-bw-primary/[0.02] to-transparent blur-[1px]" />
      </div>

      <div className="relative z-10">
        <DashboardHeader
          actions={
            <>
              {user?.email && (
                <span className="text-[11px] text-slate-500 hidden sm:block font-mono tracking-tight">
                  {user.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-[11px] text-slate-500 hover:text-bw-primary hover:bg-bw-primary/8 transition-all duration-200 cursor-pointer"
              >
                Deconnexion
              </button>
            </>
          }
        />

        {/* ── Hero — cinematic control room ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="relative overflow-hidden rounded-2xl mt-6 bg-white/[0.03] backdrop-blur-xl"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.12)",
            borderLeft: "1px solid rgba(255,255,255,0.04)",
            borderRight: "1px solid rgba(255,255,255,0.04)",
            borderBottom: "1px solid transparent",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_20%,rgba(255,107,53,0.12),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_90%_80%,rgba(139,92,246,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,168,67,0.04),transparent_35%)]" />

          <div className="relative z-10 px-7 py-7 sm:px-8 sm:py-9 flex items-center justify-between gap-6">
            <div className="space-y-2.5">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400"
              >
                Bienvenue, {directorName}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="bw-display text-3xl sm:text-4xl uppercase text-white"
                style={{ letterSpacing: "-0.02em" }}
              >
                Studio de{" "}
                <span className="text-gradient-cinema">Production</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-[13px] text-slate-400 max-w-md leading-relaxed"
              >
                Creez, pilotez et analysez vos seances en temps reel.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
              transition={{
                opacity: { delay: 0.3, duration: 0.5 },
                scale: { delay: 0.3, type: "spring", stiffness: 200, damping: 20 },
                y: { delay: 1, duration: 4, repeat: Infinity, ease: "easeInOut" },
              }}
              className="hidden sm:block flex-shrink-0 opacity-50"
            >
              <ClapperboardIllustration size={80} />
            </motion.div>
          </div>
        </motion.section>

        {/* ── Quick Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="flex flex-wrap items-center gap-3 mt-6"
        >
          <button
            onClick={() => router.push("/session/new")}
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-bw-primary to-[#E85D26] cursor-pointer transition-all duration-300 hover:shadow-[0_0_32px_rgba(255,107,53,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]"
            style={{ boxShadow: "0 0 20px rgba(255,107,53,0.15), inset 0 1px 0 rgba(255,255,255,0.1)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouvelle Partie
          </button>
          <button
            onClick={() => router.push("/join")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium text-bw-teal bg-bw-teal/8 border border-bw-teal/15 cursor-pointer transition-all duration-300 hover:bg-bw-teal/15 hover:border-bw-teal/30 hover:shadow-[0_0_24px_rgba(78,205,196,0.1)]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Rejoindre
          </button>
          <button
            onClick={() => router.push("/fiche-cours")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium text-slate-400 border border-white/[0.06] cursor-pointer transition-all duration-300 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.1]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
            Fiche de cours
          </button>
        </motion.div>

        {/* ── KPI Stats ── */}
        {!loading && sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6"
          >
            <KpiCard label="En cours" value={activeSessions.length} color="#4ECDC4" icon="play" />
            <KpiCard label="Joueurs" value={totalStudents} color="#FF6B35" icon="users" />
            <KpiCard label="Terminees" value={doneSessions.length} color="#10B981" icon="check" />
          </motion.div>
        )}

        {/* ── Section header ── */}
        <div className="flex justify-between items-baseline mt-8 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-5 rounded-full bg-gradient-to-b from-bw-primary to-bw-gold" />
            <h2
              className="bw-display text-lg uppercase text-bw-heading"
              style={{ letterSpacing: "-0.01em" }}
            >
              Mes parties
            </h2>
          </div>
          {!loading && sessions.length > 0 && (
            <span className="text-[11px] text-slate-500 font-mono tabular-nums">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loading ? (
          <LoadingSkeletons />
        ) : sessions.length === 0 ? (
          <EmptyState onAction={() => router.push("/session/new")} />
        ) : (
          <div className="space-y-10">
            {/* Active sessions */}
            {activeSessions.length > 0 && (
              <SessionGroup label="En cours" count={activeSessions.length} color="#4ECDC4" live>
                {activeSessions.map((session, i) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    index={i}
                    onOpen={() => router.push(`/session/${session.id}`)}
                    onDelete={() => handleDelete(session.id)}
                  />
                ))}
              </SessionGroup>
            )}

            {/* Completed sessions */}
            {doneSessions.length > 0 && (
              <SessionGroup label="Terminees" count={doneSessions.length} color="#10B981">
                {doneSessions.map((session, i) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    index={i}
                    onOpen={() => router.push(`/session/${session.id}/results`)}
                    onDelete={() => handleDelete(session.id)}
                  />
                ))}
              </SessionGroup>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Session Group — section header with label + count
   ═══════════════════════════════════════════════════════════════ */

function SessionGroup({
  label,
  count,
  color,
  live,
  children,
}: {
  label: string;
  count: number;
  color: string;
  live?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        {live ? (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ backgroundColor: color }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
          </span>
        ) : (
          <span className="inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color, opacity: 0.6 }} />
        )}
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
          {label}
        </span>
        <span
          className="text-[10px] font-bold px-1.5 py-px rounded-md tabular-nums"
          style={{ backgroundColor: `${color}12`, color }}
        >
          {count}
        </span>
      </div>
      <AnimatePresence>
        <div className="space-y-3">
          {children}
        </div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   KPI Card — precision metric tile
   ═══════════════════════════════════════════════════════════════ */

function KpiCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: "play" | "users" | "check";
}) {
  const dim = value === 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="relative overflow-hidden rounded-xl bg-white/[0.03] backdrop-blur-xl transition-all duration-300"
      style={{
        borderTop: `1px solid rgba(255,255,255,0.1)`,
        borderLeft: "1px solid rgba(255,255,255,0.04)",
        borderRight: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid transparent",
      }}
    >
      {/* Colored top edge — visible */}
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(90deg, transparent 10%, ${color}50, transparent 90%)` }} />
      {/* Gradient fill */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(160deg, ${color}0C, transparent 55%)` }} />

      <div className="relative z-10 px-3 py-3 sm:px-5 sm:py-4 flex items-start justify-between gap-2">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-[0.14em] text-slate-400 font-semibold block">
            {label}
          </span>
          <span
            className="block leading-none font-mono font-bold text-xl sm:text-[28px]"
            style={{ color: dim ? "rgba(255,255,255,0.25)" : color, letterSpacing: "-0.03em" }}
          >
            {value}
          </span>
        </div>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}18`, color: dim ? `${color}40` : color }}
        >
          {icon === "play" && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16" fill="currentColor" stroke="none" /></svg>
          )}
          {icon === "users" && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
          )}
          {icon === "check" && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Progress Ring — cinematic donut
   ═══════════════════════════════════════════════════════════════ */

function ProgressRing({ percent, color }: { percent: number; color: string }) {
  const size = 48;
  const sw = 3;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={sw} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
        />
        {percent > 0 && (
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={sw + 6} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            opacity={0.12}
            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)", filter: "blur(4px)" }}
          />
        )}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums" style={{ color: percent > 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)" }}>
        {percent > 0 ? `${percent}%` : "—"}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Avatar Stack
   ═══════════════════════════════════════════════════════════════ */

function AvatarStack({ count }: { count: number }) {
  if (count === 0) {
    return (
      <div className="flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500">
          <circle cx="12" cy="7" r="4" /><path d="M5.5 21a8.38 8.38 0 0113 0" />
        </svg>
        <span className="text-[11px] text-slate-500">0 joueur</span>
      </div>
    );
  }

  const shown = Math.min(count, 4);
  const extra = count - shown;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center -space-x-1.5">
        {Array.from({ length: shown }).map((_, i) => (
          <div
            key={i}
            className="w-5 h-5 rounded-full border-[1.5px] border-white/[0.06]"
            style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length], zIndex: shown - i }}
          />
        ))}
        {extra > 0 && (
          <div className="w-5 h-5 rounded-full bg-white/[0.08] border-[1.5px] border-white/[0.04] text-[8px] font-bold text-slate-400 flex items-center justify-center">
            +{extra}
          </div>
        )}
      </div>
      <span className="text-[11px] text-slate-400 tabular-nums">
        {count}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Join Code — mono code block with copy
   ═══════════════════════════════════════════════════════════════ */

function JoinCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="group/code inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-200 cursor-pointer"
      title="Copier le code"
    >
      <span className="text-[11px] font-bold font-mono tracking-[0.15em] text-bw-teal">
        {code}
      </span>
      {copied ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="3" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600 group-hover/code:text-slate-400 transition-colors">
          <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Session Card — the hero component
   ═══════════════════════════════════════════════════════════════ */

function SessionCard({
  session,
  index,
  onOpen,
  onDelete,
}: {
  session: SessionItem;
  index: number;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const status = STATUS_CONFIG[session.status] || STATUS_CONFIG.waiting;
  const templateInfo = session.template ? TEMPLATE_LABELS[session.template] : null;

  const totalSteps = 21;
  const currentStep = (session.current_seance - 1) * 7 + session.current_situation_index;
  const progressPercent = session.status === "done"
    ? 100
    : Math.min(Math.round((currentStep / totalSteps) * 100), 95);

  const isLive = ["responding", "reviewing", "vote"].includes(session.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, transition: { duration: 0.15 } }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-xl backdrop-blur-xl cursor-pointer transition-all duration-300"
      style={{
        background: isLive ? `linear-gradient(135deg, ${status.color}08, transparent 60%)` : "rgba(255,255,255,0.03)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        borderLeft: "1px solid rgba(255,255,255,0.04)",
        borderRight: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px ${status.color}12, 0 0 1px ${status.color}20`;
        (e.currentTarget as HTMLElement).style.background = isLive
          ? `linear-gradient(135deg, ${status.color}0E, rgba(255,255,255,0.03) 60%)`
          : "rgba(255,255,255,0.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.background = isLive
          ? `linear-gradient(135deg, ${status.color}08, transparent 60%)`
          : "rgba(255,255,255,0.03)";
      }}
      onClick={onOpen}
    >
      {/* Top edge micro-highlight */}
      <div className="absolute top-0 inset-x-4 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />

      {/* Left accent — always visible, brighter when live */}
      <div
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full transition-opacity duration-300"
        style={{
          backgroundColor: status.color,
          opacity: isLive ? 1 : 0.5,
          boxShadow: isLive ? `0 0 8px ${status.color}40` : "none",
        }}
      />

      {/* Live ambient glow */}
      {isLive && (
        <div
          className="absolute -left-4 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full blur-2xl pointer-events-none"
          style={{ backgroundColor: `${status.color}12` }}
        />
      )}

      <div className="relative z-10 px-5 py-5 sm:px-6 sm:py-5">
        <div className="flex items-center gap-5">
          {/* Progress Ring */}
          <ProgressRing percent={progressPercent} color={status.color} />

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Row 1: Title + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className="text-[14px] font-semibold text-white truncate leading-tight"
                style={{ letterSpacing: "-0.01em" }}
              >
                {session.title || "Seance sans titre"}
              </h3>
              <span className="inline-flex items-center gap-1.5 flex-shrink-0">
                <span
                  className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: status.color,
                    boxShadow: `0 0 6px ${status.color}60, 0 0 12px ${status.color}20`,
                  }}
                />
                <span
                  className="text-[9px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: status.color }}
                >
                  {status.label}
                </span>
              </span>
              {templateInfo && (
                <span className="text-[9px] px-1.5 py-[2px] rounded-md bg-white/[0.05] text-slate-400 border border-white/[0.06] flex-shrink-0">
                  {templateInfo}
                </span>
              )}
              {isLive && (
                <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ backgroundColor: status.color }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: status.color }} />
                </span>
              )}
            </div>

            {/* Row 2: Meta — relaxed spacing */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] text-slate-400">
                {LEVEL_LABELS[session.level] || session.level}
              </span>
              <Dot />
              <AvatarStack count={session.studentCount} />
              <Dot />
              <JoinCode code={session.join_code} />
              <Dot />
              <span className="text-[11px] text-slate-500 tabular-nums">
                {timeAgo(session.created_at)}
              </span>
            </div>

            {/* Row 3: Student status indicators */}
            {isLive && session.studentCount > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                {(session.respondedCount ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {session.respondedCount} répondu
                  </span>
                )}
                {(session.activeCount ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {session.activeCount} en attente
                  </span>
                )}
                {(session.disconnectedCount ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    {session.disconnectedCount} déco
                  </span>
                )}
                {(session.stuckCount ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 text-[10px] font-bold text-amber-400">
                    {session.stuckCount} bloqué{(session.stuckCount ?? 0) > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {/* Quick relance button for stuck students */}
            {(session.stuckCount ?? 0) > 0 && (
              <button
                onClick={onOpen}
                className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 hover:border-amber-500/50 transition-all cursor-pointer"
                title={`${session.stuckCount} élève(s) bloqué(s) — piloter`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </button>
            )}
            <button
              onClick={onOpen}
              className="group/btn relative inline-flex items-center gap-2.5 px-4 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-[0.06em] cursor-pointer transition-all duration-300"
              style={{
                backgroundColor: `${status.color}15`,
                color: "#FFFFFF",
                border: `1px solid ${status.color}40`,
                boxShadow: `0 0 12px ${status.color}20`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 24px ${status.color}35, 0 0 48px ${status.color}15`;
                e.currentTarget.style.backgroundColor = `${status.color}25`;
                e.currentTarget.style.borderColor = `${status.color}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 0 12px ${status.color}20`;
                e.currentTarget.style.backgroundColor = `${status.color}15`;
                e.currentTarget.style.borderColor = `${status.color}40`;
              }}
            >
              {session.status === "done" ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200 group-hover/btn:translate-x-0.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  Resultats
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200 group-hover/btn:translate-x-0.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                  Piloter
                </>
              )}
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg text-slate-600 hover:text-bw-danger hover:bg-bw-danger/10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
              title="Supprimer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Micro dot separator ── */
function Dot() {
  return <span className="w-[3px] h-[3px] rounded-full bg-white/[0.15]" />;
}

/* ═══════════════════════════════════════════════════════════════
   Loading Skeletons
   ═══════════════════════════════════════════════════════════════ */

function LoadingSkeletons() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl bg-white/[0.03] backdrop-blur-xl border-t border-white/[0.08] px-6 py-5 animate-pulse">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-white/[0.03]" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-3.5 w-36 rounded-md bg-white/[0.04]" />
                <div className="h-4 w-16 rounded-md bg-white/[0.03]" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2.5 w-14 rounded bg-white/[0.03]" />
                <div className="h-2.5 w-20 rounded bg-white/[0.03]" />
                <div className="h-2.5 w-16 rounded bg-white/[0.03]" />
              </div>
            </div>
            <div className="h-8 w-20 rounded-lg bg-white/[0.03]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Empty State
   ═══════════════════════════════════════════════════════════════ */

function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-xl border-t border-white/[0.08] flex flex-col items-center justify-center py-20 px-8 text-center"
    >
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-bw-primary/[0.03] blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", delay: 0.25 }}
        className="relative z-10 mb-8 opacity-60"
      >
        <ClapperboardIllustration size={88} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="relative z-10 space-y-2"
      >
        <h3 className="bw-display text-lg text-bw-heading uppercase" style={{ letterSpacing: "-0.01em" }}>
          Votre studio est pret
        </h3>
        <p className="text-[13px] text-slate-400 max-w-xs leading-relaxed">
          Creez votre premiere partie pour lancer l&apos;aventure cinema.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="relative z-10 mt-8"
      >
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-bw-primary to-[#E85D26] cursor-pointer transition-all duration-300 hover:shadow-[0_0_32px_rgba(255,107,53,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]"
          style={{ boxShadow: "0 0 20px rgba(255,107,53,0.15), inset 0 1px 0 rgba(255,255,255,0.1)" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Creer ma premiere partie
        </button>
      </motion.div>
    </motion.div>
  );
}
