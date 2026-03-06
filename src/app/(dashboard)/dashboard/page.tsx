"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { TEMPLATE_LABELS } from "@/lib/constants";
import { PageShell } from "@/components/page-shell";
import { DashboardHeader } from "@/components/dashboard-header";
import { OnboardingTour } from "@/components/onboarding-tour";
import { HelpButton } from "@/components/help-button";
import { DashboardAnalytics } from "@/components/dashboard-analytics";
import { ConfirmModal } from "@/components/confirm-modal";
import { PHASES, MODULES, getModuleByDb } from "@/lib/modules-data";

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
  completed_modules?: string[];
  respondedCount?: number;
  activeCount?: number;
  disconnectedCount?: number;
  stuckCount?: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  waiting:   { label: "En attente", color: "var(--color-bw-amber)" },
  responding:{ label: "En cours",   color: "var(--color-bw-teal)" },
  reviewing: { label: "Review",     color: "var(--color-bw-violet)" },
  vote:      { label: "Vote",       color: "var(--color-bw-primary)" },
  paused:    { label: "Pause",      color: "var(--color-bw-placeholder)" },
  done:      { label: "Terminee",   color: "var(--color-bw-green)" },
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
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "students" | "title">("recent");

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
    setDeleteTarget(sessionId);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    fetch(`/api/sessions/${deleteTarget}`, { method: "DELETE" })
      .then((res) => {
        if (res.ok) { setSessions((p) => p.filter((s) => s.id !== deleteTarget)); toast.success("Partie supprimee", { icon: "\uD83D\uDDD1\uFE0F" }); }
        else toast.error("Erreur lors de la suppression");
      })
      .catch(() => toast.error("Erreur de connexion"))
      .finally(() => setDeleteTarget(null));
  }

  function handleDuplicate(sessionId: string) {
    fetch(`/api/sessions/${sessionId}/duplicate`, { method: "POST" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Erreur");
      })
      .then((newSession) => {
        setSessions((p) => [newSession, ...p]);
        toast.success("Session dupliquée !", { icon: "\uD83D\uDCCB" });
      })
      .catch(() => toast.error("Erreur lors de la duplication"));
  }

  const filtered = sessions
    .filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()))
    .filter(s => !levelFilter || s.level === levelFilter)
    .sort((a, b) => {
      if (sortBy === "students") return b.studentCount - a.studentCount;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  const activeSessions = filtered.filter((s) => s.status !== "done");
  const doneSessions = filtered.filter((s) => s.status === "done");
  const totalStudents = sessions.reduce((a, s) => a + s.studentCount, 0);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const sessionsThisWeek = sessions.filter(s => new Date(s.created_at).getTime() > weekAgo).length;
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
                <span className="text-xs text-bw-muted hidden sm:block font-mono tracking-tight">
                  {user.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-xs text-bw-muted hover:text-bw-primary hover:bg-bw-primary/8 transition-all duration-200 cursor-pointer"
              >
                Deconnexion
              </button>
            </>
          }
        />

        {/* ── Compact greeting + actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="mt-6 space-y-4"
        >
          {/* Greeting + primary CTA */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-0.5">
              <h1
                className="bw-display text-2xl sm:text-3xl uppercase text-white"
                style={{ letterSpacing: "-0.02em" }}
              >
                {directorName}
              </h1>
              {!loading && sessions.length > 0 && (
                <p className="text-xs text-bw-muted font-mono tabular-nums">
                  {activeSessions.length > 0 && (
                    <span className="text-bw-teal">{activeSessions.length} en cours</span>
                  )}
                  {activeSessions.length > 0 && totalStudents > 0 && <span className="text-bw-placeholder"> · </span>}
                  {totalStudents > 0 && <>{totalStudents} joueur{totalStudents > 1 ? "s" : ""}</>}
                  {sessionsThisWeek > 0 && (
                    <><span className="text-bw-placeholder"> · </span>{sessionsThisWeek} cette sem.</>
                  )}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => router.push("/fiche-cours")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium text-bw-muted border border-white/[0.06] cursor-pointer transition-all duration-200 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.1]"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
                Fiche
              </button>
              <button
                onClick={() => router.push("/join")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium text-bw-teal bg-bw-teal/8 border border-bw-teal/15 cursor-pointer transition-all duration-200 hover:bg-bw-teal/15 hover:border-bw-teal/30"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Rejoindre
              </button>
              <button
                data-tour="step-1"
                onClick={() => router.push("/session/new")}
                className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-white bg-gradient-to-r from-bw-primary to-[#E85D26] cursor-pointer transition-all duration-200 hover:shadow-[0_0_24px_rgba(255,107,53,0.25)]"
                style={{ boxShadow: "0 0 12px rgba(255,107,53,0.12)" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nouvelle Partie
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Filter bar — only for 6+ sessions ── */}
        {!loading && sessions.length >= 6 && (
          <div className="mt-5 space-y-2.5">
            <div className="relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-bw-muted pointer-events-none">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-[13px] bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-bw-muted focus:border-bw-primary/40 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { value: null, label: "Tous" },
                { value: "primaire", label: "Primaire" },
                { value: "college", label: "College" },
                { value: "lycee", label: "Lycee" },
              ].map((opt) => (
                <button
                  key={opt.value ?? "all"}
                  onClick={() => setLevelFilter(opt.value)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    levelFilter === opt.value
                      ? "bg-bw-primary/20 text-bw-primary border border-bw-primary/40"
                      : "bg-white/[0.04] text-bw-muted border border-white/[0.08] hover:border-white/[0.15]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <div className="ml-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "recent" | "students" | "title")}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-0.5 text-xs text-bw-muted cursor-pointer focus:outline-none focus:border-bw-primary/40"
                >
                  <option value="recent">Recentes</option>
                  <option value="students">Eleves</option>
                  <option value="title">A-Z</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Section header ── */}
        <div className="flex justify-between items-baseline mt-6 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-[3px] h-4 rounded-full bg-gradient-to-b from-bw-primary to-bw-gold" />
            <h2
              className="text-[13px] font-semibold uppercase tracking-[0.06em] text-bw-heading"
            >
              Mes parties
            </h2>
          </div>
          {!loading && sessions.length > 0 && (
            <span className="text-xs text-bw-muted font-mono tabular-nums">
              {filtered.length}{filtered.length !== sessions.length ? ` / ${sessions.length}` : ""}
            </span>
          )}
        </div>

        {loading ? (
          <LoadingSkeletons />
        ) : sessions.length === 0 ? (
          <EmptyState onAction={() => router.push("/session/new")} />
        ) : (
          <div className="space-y-6">
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
                    onDuplicate={() => handleDuplicate(session.id)}
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
                    onDuplicate={() => handleDuplicate(session.id)}
                  />
                ))}
              </SessionGroup>
            )}
          </div>
        )}

        {/* ── Curriculum progress (strategic view — below sessions) ── */}
        {!loading && sessions.length > 0 && (
          <CurriculumProgress sessions={sessions} />
        )}

        {/* ── Cross-session analytics (deep data — bottom) ── */}
        {!loading && sessions.length > 0 && <DashboardAnalytics />}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Supprimer cette partie ?"
        description="Cette action est irreversible. Toutes les donnees de la session seront perdues."
        confirmLabel="Supprimer"
        confirmVariant="danger"
      />

      {/* Onboarding tour for first-time facilitators */}
      <OnboardingTour />
      <HelpButton pageKey="dashboard" tips={[
        { title: "Creez une session", description: "Cliquez sur 'Nouvelle session' pour demarrer. Choisissez un modele ou creez une session vide." },
        { title: "Dupliquer une session", description: "Cliquez sur l'icone copie d'une session pour la dupliquer avec sa structure et ses modules." },
        { title: "Rejoindre une session", description: "Partagez le code a 6 chiffres ou le QR code avec vos eleves. Ils rejoignent depuis leur tablette ou ordinateur." },
      ]} />
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
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        {live ? (
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ backgroundColor: color }} />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: color }} />
          </span>
        ) : (
          <span className="inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: color, opacity: 0.5 }} />
        )}
        <span className="text-xs font-medium uppercase tracking-[0.1em] text-bw-muted">
          {label}
        </span>
        <span
          className="text-xs font-bold px-1.5 py-px rounded-md tabular-nums"
          style={{ backgroundColor: `${color}10`, color }}
        >
          {count}
        </span>
      </div>
      <AnimatePresence>
        <div className="space-y-2">
          {children}
        </div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Progress Ring — compact donut
   ═══════════════════════════════════════════════════════════════ */

function ProgressRing({ percent, color, size: sizeProp }: { percent: number; color: string; size?: number }) {
  const size = sizeProp || 36;
  const sw = 2.5;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums" style={{ color: percent > 0 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)" }}>
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
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-bw-muted">
          <circle cx="12" cy="7" r="4" /><path d="M5.5 21a8.38 8.38 0 0113 0" />
        </svg>
        <span className="text-xs text-bw-muted">0 joueur</span>
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
          <div className="w-5 h-5 rounded-full bg-white/[0.08] border-[1.5px] border-white/[0.04] text-xs font-bold text-bw-muted flex items-center justify-center">
            +{extra}
          </div>
        )}
      </div>
      <span className="text-xs text-bw-muted tabular-nums">
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
      <span className="text-xs font-bold font-mono tracking-[0.15em] text-bw-teal">
        {code}
      </span>
      {copied ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="3" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-bw-placeholder group-hover/code:text-bw-muted transition-colors">
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
  onDuplicate,
}: {
  session: SessionItem;
  index: number;
  onOpen: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
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

      <div className="relative z-10 px-4 py-4 sm:px-5 sm:py-4">
        <div className="flex items-center gap-4">
          {/* Progress Ring */}
          <ProgressRing percent={progressPercent} color={status.color} />

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Row 1: Title + status */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className="text-[13px] font-semibold text-white truncate leading-tight"
                style={{ letterSpacing: "-0.01em" }}
              >
                {session.title || "Seance sans titre"}
              </h3>
              <span className="inline-flex items-center gap-1 flex-shrink-0">
                <span
                  className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: status.color,
                    boxShadow: isLive ? `0 0 6px ${status.color}60` : "none",
                  }}
                />
                <span
                  className="text-xs font-semibold uppercase tracking-[0.06em]"
                  style={{ color: status.color }}
                >
                  {status.label}
                </span>
              </span>
              {isLive && (
                <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ backgroundColor: status.color }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: status.color }} />
                </span>
              )}
            </div>

            {/* Row 2: Meta — compact */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <AvatarStack count={session.studentCount} />
              <Dot />
              <JoinCode code={session.join_code} />
              <span className="text-xs text-bw-placeholder tabular-nums">
                {timeAgo(session.created_at)}
              </span>
            </div>

            {/* Row 3: Post-session nudge — fiche shortcut for recent done sessions */}
            {session.status === "done" && Date.now() - new Date(session.created_at).getTime() < 7 * 86400000 && (
              <div className="flex items-center gap-2.5 pt-1" onClick={(e) => e.stopPropagation()}>
                <a
                  href={`/session/${session.id}/results`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-bw-green bg-bw-green/8 border border-bw-green/20 hover:bg-bw-green/15 hover:border-bw-green/30 transition-all cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  Resultats
                </a>
                <a
                  href={`/session/${session.id}/results?tab=fiche`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-bw-violet bg-bw-violet/8 border border-bw-violet/20 hover:bg-bw-violet/15 hover:border-bw-violet/30 transition-all cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  Fiche de cours
                </a>
              </div>
            )}

            {/* Row 4: Student status indicators */}
            {isLive && session.studentCount > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                {(session.respondedCount ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-bw-green">
                    <span className="w-1.5 h-1.5 rounded-full bg-bw-green" />
                    {session.respondedCount} répondu
                  </span>
                )}
                {(session.activeCount ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-bw-amber">
                    <span className="w-1.5 h-1.5 rounded-full bg-bw-amber" />
                    {session.activeCount} en attente
                  </span>
                )}
                {(session.disconnectedCount ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-bw-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-bw-muted" />
                    {session.disconnectedCount} déco
                  </span>
                )}
                {(session.stuckCount ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-bw-amber/15 text-xs font-bold text-bw-amber">
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
                className="p-2 rounded-lg bg-bw-amber/15 border border-bw-amber/30 text-bw-amber hover:bg-bw-amber/25 hover:border-bw-amber/50 transition-all cursor-pointer"
                title={`${session.stuckCount} élève(s) bloqué(s) — piloter`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </button>
            )}
            <button
              onClick={onOpen}
              className="group/btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-[0.06em] cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: `${status.color}12`,
                color: status.color,
                border: `1px solid ${status.color}25`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${status.color}22`;
                e.currentTarget.style.borderColor = `${status.color}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${status.color}12`;
                e.currentTarget.style.borderColor = `${status.color}25`;
              }}
            >
              {session.status === "done" ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  Resultats
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                  Piloter
                </>
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className="p-2 rounded-lg text-bw-placeholder hover:text-bw-teal hover:bg-bw-teal/10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
              title="Dupliquer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg text-bw-placeholder hover:text-bw-danger hover:bg-bw-danger/10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
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
  const steps = [
    { label: "Cree ta session", desc: "Choisis un module et un niveau", color: "#FF6B35", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2" /><path d="M2 7h20" /><path d="M7 2v5" /><path d="M17 2v5" /></svg>
    )},
    { label: "Partage le code", desc: "QR code ou code a 6 chiffres", color: "#4ECDC4", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" /><path d="M21 14h-3v3" /><path d="M18 21v-3h3" /></svg>
    )},
    { label: "Pilote en direct", desc: "Cockpit temps reel avec tes eleves", color: "#8B5CF6", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
    )},
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-xl border-t border-white/[0.08] flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-bw-primary/[0.03] blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 space-y-2 mb-8"
      >
        <h3 className="bw-display text-lg text-bw-heading uppercase" style={{ letterSpacing: "-0.01em" }}>
          Votre studio est pret
        </h3>
        <p className="text-[13px] text-bw-muted max-w-sm leading-relaxed">
          3 etapes pour lancer votre premiere seance cinema.
        </p>
      </motion.div>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl mb-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-4 space-y-2 text-left"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${step.color}18`, color: step.color }}
              >
                {step.icon}
              </div>
              <span className="text-xs font-bold text-bw-muted tabular-nums">
                {i + 1}
              </span>
            </div>
            <p className="text-[13px] font-semibold text-white">{step.label}</p>
            <p className="text-xs text-bw-muted leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="relative z-10 flex flex-col items-center gap-3"
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
        <a
          href="/fiche-cours"
          className="text-xs text-bw-muted hover:text-bw-violet transition-colors"
        >
          Voir la fiche de cours &rarr;
        </a>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Curriculum Progress — cross-session module completion overview
   ═══════════════════════════════════════════════════════════════ */

function CurriculumProgress({ sessions }: { sessions: SessionItem[] }) {
  // Compute completed modules across all sessions
  const completedSet = new Set<string>();
  const inProgressSet = new Set<string>();

  for (const s of sessions) {
    if (s.completed_modules) {
      for (const m of s.completed_modules) completedSet.add(m);
    }
    // Active sessions have a "current" module that's in progress
    if (s.status !== "done") {
      const currentMod = getModuleByDb(s.current_module, s.current_seance);
      if (currentMod) inProgressSet.add(currentMod.id);
    }
  }

  // Filter out disabled phases (phases with all modules disabled)
  const enabledPhases = PHASES.filter((phase) => {
    const phaseModules = MODULES.filter((m) => phase.moduleIds.includes(m.id));
    return phaseModules.some((m) => !m.disabled);
  });

  const totalModules = enabledPhases.reduce((acc, phase) => {
    return acc + MODULES.filter((m) => phase.moduleIds.includes(m.id) && !m.disabled).length;
  }, 0);
  const totalCompleted = [...completedSet].filter((id) => {
    const mod = MODULES.find((m) => m.id === id);
    return mod && !mod.disabled;
  }).length;
  const overallPercent = totalModules > 0 ? Math.round((totalCompleted / totalModules) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="mt-6"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-[3px] h-5 rounded-full bg-gradient-to-b from-bw-teal to-bw-gold" />
        <h2
          className="bw-display text-lg uppercase text-bw-heading"
          style={{ letterSpacing: "-0.01em" }}
        >
          Parcours
        </h2>
        <span className="text-xs font-bold px-1.5 py-px rounded-md tabular-nums bg-bw-teal/12 text-bw-teal">
          {overallPercent}%
        </span>
      </div>

      {/* Timeline stepper */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute top-5 left-5 right-5 h-px bg-white/[0.08]" />
        <div
          className="absolute top-5 left-5 h-px transition-all duration-700"
          style={{
            width: `${Math.min(overallPercent, 100)}%`,
            maxWidth: "calc(100% - 40px)",
            background: "linear-gradient(90deg, #4ECDC4, #8B5CF6)",
            boxShadow: "0 0 8px rgba(78,205,196,0.3)",
          }}
        />

        <div className="relative flex justify-between gap-1 overflow-x-auto pb-2">
          {enabledPhases.map((phase, i) => {
            const phaseModules = MODULES.filter(
              (m) => phase.moduleIds.includes(m.id) && !m.disabled
            );
            const done = phaseModules.filter((m) => completedSet.has(m.id)).length;
            const inProg = phaseModules.some((m) => inProgressSet.has(m.id));
            const isComplete = done === phaseModules.length && phaseModules.length > 0;

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                className="flex flex-col items-center gap-1.5 min-w-[56px] flex-1"
              >
                {/* Node */}
                <div
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center text-base transition-all duration-300 ${
                    isComplete
                      ? "ring-2 ring-offset-1 ring-offset-[#08090E]"
                      : inProg
                        ? "ring-2 ring-offset-1 ring-offset-[#08090E] animate-pulse"
                        : ""
                  }`}
                  style={{
                    backgroundColor: isComplete
                      ? `${phase.color}25`
                      : inProg
                        ? `${phase.color}15`
                        : "rgba(255,255,255,0.04)",
                    // @ts-expect-error -- ring-color mapped via CSS custom property
                    "--tw-ring-color": isComplete ? phase.color : inProg ? `${phase.color}80` : undefined,
                    boxShadow: isComplete
                      ? `0 0 12px ${phase.color}30`
                      : inProg
                        ? `0 0 8px ${phase.color}20`
                        : "none",
                  }}
                >
                  {isComplete ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={phase.color} strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className={isComplete || inProg ? "" : "opacity-40"}>{phase.emoji}</span>
                  )}
                </div>
                {/* Label */}
                <span
                  className="text-xs font-semibold text-center leading-tight max-w-[64px]"
                  style={{
                    color: isComplete
                      ? phase.color
                      : inProg
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(255,255,255,0.3)",
                  }}
                >
                  {phase.label}
                </span>
                {/* Module count */}
                {done > 0 && (
                  <span className="text-xs font-mono tabular-nums text-bw-muted">
                    {done}/{phaseModules.length}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
