"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeInvalidation } from "@/hooks/use-realtime-invalidation";
import { MODULES, PHASES, getModuleByDb, getPhaseForModule } from "@/lib/modules-data";
import { getModuleGuide } from "@/lib/guide-data";
import { DEMO_STUDENT_NAMES } from "@/lib/demo-data";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { CinemaQuoteBanner } from "@/components/cinema-illustrations";

const QRCodeSVG = dynamic(
  () => import("qrcode.react").then(mod => ({ default: mod.QRCodeSVG })),
  { ssr: false, loading: () => <div className="w-full h-full bg-white/5 rounded animate-pulse" /> }
);
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OnboardingTour } from "@/components/onboarding-tour";
import { HelpButton } from "@/components/help-button";
import { PreSessionChecklist } from "@/components/pre-session-checklist";

const LEVEL_LABELS: Record<string, string> = {
  primaire: "Primaire (6-9 ans)",
  college: "Collège (10-13 ans)",
  lycee: "Lycée (14-18 ans)",
};

const TMDB_IMG = "https://image.tmdb.org/t/p";

const CINEMA_REFS = [
  { title: "La Haine", year: 1995, director: "Kassovitz", theme: "Tension sociale", color: "#EF4444", poster: "/gfdhSzPyAWtAizqs4ytc0MwOlQg.jpg" },
  { title: "Les Misérables", year: 2019, director: "Ladj Ly", theme: "Banlieue & regard", color: "#FF6B35", poster: "/sOy9Sa9Noro1VjZjdTTh7U3XmcU.jpg" },
  { title: "Divines", year: 2016, director: "Houda Benyamina", theme: "Rêves de grandeur", color: "#8B5CF6", poster: "/6P12dmdR0XFXXOPx1HsI8kT6yMX.jpg" },
  { title: "Intouchables", year: 2011, director: "Nakache & Toledano", theme: "Amitié inattendue", color: "#4ECDC4", poster: "/i97FM40bOMKvKIo3hjQviETE5yf.jpg" },
  { title: "Les 400 Coups", year: 1959, director: "Truffaut", theme: "Enfance & liberté", color: "#F59E0B", poster: "/nHZQrKd96pCytnuTCsFibhrRyIR.jpg" },
  { title: "La Graine et le Mulet", year: 2007, director: "Kechiche", theme: "Famille & persévérance", color: "#10B981", poster: "/fqEJAEiFlo8flo5AQMeLLP5Rmno.jpg" },
  { title: "Bande de filles", year: 2014, director: "Sciamma", theme: "Identité & sororité", color: "#EC4899", poster: "/nFHw4N7eEpbXwFkUH61P0zs1FTm.jpg" },
  { title: "Caché", year: 2005, director: "Haneke", theme: "Secrets & culpabilité", color: "#6366F1", poster: "/vSIGVNCLDnw1NYH8mgSrxC5jYQn.jpg" },
];

/* Phase icon — typographic initial in gradient container (replaces emojis) */
const PHASE_ICONS: Record<string, string> = {
  regard: "R", scene: "S", etsi: "?", pitch: "P", collectif: "V",
  scenario: "S", "mise-en-scene": "M", equipe: "É",
  postprod: "P", cinema: "C", story: "H", cinedebat: "D",
};

interface SessionData {
  id: string;
  title: string;
  level: string;
  status: string;
  join_code: string;
  current_module: number;
  current_seance: number;
  current_situation_index: number;
  template: string | null;
  completed_modules: string[];
  students: { id: string; display_name: string; avatar: string; is_active: boolean }[];
  created_at: string;
}

export default function SessionOverviewPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [projectionMode, setProjectionMode] = useState(false);
  const queryClient = useQueryClient();
  useRealtimeInvalidation(sessionId);
  const [checklistDismissed, setChecklistDismissed] = useState(false);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCheckingAuth(false);
    }
    check();
  }, [router]);

  const { data: session, isLoading } = useQuery<SessionData>({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) throw new Error("Session introuvable");
      return res.json();
    },
    enabled: !checkingAuth,
    refetchInterval: 30_000,
  });

  // Demo mode mutations
  const activateDemo = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/demo`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || "Erreur");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`${data.students.length} eleves virtuels ont rejoint !`);
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deactivateDemo = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/demo`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || "Erreur");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`${data.deleted} eleves virtuels supprimes`);
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  if (checkingAuth || isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-bw-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-bw-muted">Session introuvable</p>
          <Button variant="link" onClick={() => router.push("/dashboard")}>
            Retour au dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentModule = getModuleByDb(session.current_module, session.current_seance);
  const currentPhase = currentModule ? getPhaseForModule(currentModule.id) : null;
  const guide = currentModule ? getModuleGuide(currentModule.id) : null;
  const joinUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/join`;
  const activeStudents = session.students.filter(s => s.is_active);

  // Demo mode detection
  const demoStudents = activeStudents.filter(s => DEMO_STUDENT_NAMES.includes(s.display_name));
  const realStudents = activeStudents.filter(s => !DEMO_STUDENT_NAMES.includes(s.display_name));
  const hasDemoStudents = demoStudents.length > 0;

  // Projection mode — dark, big code, QR
  if (projectionMode) {
    return (
      <div className="dark bg-bw-bg text-bw-heading min-h-dvh flex flex-col items-center justify-center relative">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setProjectionMode(false)}
          className="absolute top-4 right-4 text-bw-muted hover:text-white hover:bg-white/10 z-10"
        >
          Quitter projection
        </Button>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <h1 className="text-3xl font-bold tracking-[0.3em] uppercase font-cinema">
            <BrandLogo />
          </h1>

          <div className="flex gap-2 justify-center">
            {session.join_code.split("").map((char, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="w-16 h-20 bg-bw-elevated border border-white/[0.06] rounded-xl flex items-center justify-center text-3xl font-bold font-mono"
              >
                {char}
              </motion.div>
            ))}
          </div>

          <p className="text-bw-muted text-lg">
            Rejoins sur <span className="text-white font-medium">banlieuwood.app/join</span>
          </p>

          <div className="bg-white p-4 rounded-2xl inline-block">
            <QRCodeSVG value={joinUrl + "?code=" + session.join_code} size={200} />
          </div>

          <div className="flex items-center gap-2 justify-center text-bw-muted">
            <div className="flex -space-x-1">
              {activeStudents.slice(0, 8).map((s) => (
                <span key={s.id} className="text-lg">{s.avatar}</span>
              ))}
            </div>
            <span>{activeStudents.length} connecté{activeStudents.length > 1 ? "s" : ""}</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Prof mode — light, rich content
  return (
    <PageShell maxWidth="xl">
      <DashboardHeader
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: session.title },
        ]}
        actions={
          <div data-tour="step-2" className="flex items-center gap-2 px-3 py-1.5 bg-bw-surface rounded-xl border border-bw-border">
            <span className="text-xs text-bw-muted">Code :</span>
            <span className="font-mono font-bold text-sm tracking-wider">{session.join_code}</span>
          </div>
        }
      />
        {/* Hero section — cinematic */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden text-white"
        >
          {/* Multi-layer cinematic background — Deep Slate + ambient glows */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0E0800] via-[#0A0E18] to-[#080C16]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(255,107,53,0.20),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(139,92,246,0.14),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_0%,rgba(78,205,196,0.08),transparent_50%)]" />
          {/* Subtle border glow */}
          <div className="absolute inset-0 rounded-2xl border border-white/[0.06]" />

          <div className="relative z-10 p-8 md:p-10 space-y-5">
            <div className="flex items-center gap-3 flex-wrap">
              {currentPhase && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10"
                  style={{ backgroundColor: `${currentPhase.color}30`, color: currentPhase.color }}>
                  {PHASE_ICONS[currentPhase.id] || currentPhase.label[0]} &middot; {currentPhase.label}
                </motion.span>
              )}
              <span className="text-xs text-white/50 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm">
                {LEVEL_LABELS[session.level] || session.level}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold font-cinema tracking-wider leading-tight">
              {session.title}
            </h1>

            {currentModule && (
              <p className="text-white/70 text-lg max-w-xl">
                Module en cours : <span className="text-white font-medium">{currentModule.title}</span>
                {currentModule.subtitle && <span className="text-bw-muted"> — {currentModule.subtitle}</span>}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm pt-2">
              <span className="flex items-center gap-2 text-white/60">
                <span className="w-2 h-2 rounded-full bg-bw-green animate-pulse" />
                {activeStudents.length} élève{activeStudents.length > 1 ? "s" : ""} connecté{activeStudents.length > 1 ? "s" : ""}
              </span>
              {currentModule && (
                <span className="text-bw-muted flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  {currentModule.duration}
                </span>
              )}
              {currentModule && (
                <span className="text-bw-muted">{currentModule.questions} questions</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick actions — cinematic cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.button
            data-tour="step-3"
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -2 }}
            onClick={() => router.push(`/session/${sessionId}/pilot`)}
            className="relative flex items-center gap-4 p-5 rounded-xl overflow-hidden cursor-pointer group btn-glow"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-bw-primary to-bw-primary-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="relative z-10 flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <div className="text-left">
                <span className="font-semibold block">Lancer le cockpit</span>
                <span className="text-sm text-white/70">Piloter la séance en live</span>
              </div>
            </div>
          </motion.button>

          <motion.button
            data-tour="step-4"
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -2 }}
            onClick={() => setProjectionMode(true)}
            className="relative flex items-center gap-4 p-5 rounded-xl overflow-hidden cursor-pointer group border border-bw-violet/20 bg-gradient-to-br from-bw-violet/5 to-bw-violet/10 hover:border-bw-violet/40 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-bw-violet/15 flex items-center justify-center text-bw-violet group-hover:bg-bw-violet/25 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <div className="text-left">
              <span className="font-semibold block text-bw-ink">Écran projection</span>
              <span className="text-sm text-bw-muted">Code + QR pour les élèves</span>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -2 }}
            onClick={() => router.push(`/session/${sessionId}/results`)}
            className="relative flex items-center gap-4 p-5 rounded-xl overflow-hidden cursor-pointer group border border-bw-teal/20 bg-gradient-to-br from-bw-teal/5 to-bw-teal/10 hover:border-bw-teal/40 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-bw-teal/15 flex items-center justify-center text-bw-teal group-hover:bg-bw-teal/25 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="text-left">
              <span className="font-semibold block text-bw-ink">Résultats</span>
              <span className="text-sm text-bw-muted">Histoire + bilan + export</span>
            </div>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Left column — pedagogical content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pedagogical objectives */}
            {guide && (
              <Card>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-bw-muted">
                      Objectifs pédagogiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {guide.socleCommun.map((code) => (
                        <span key={code} className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{
                            backgroundColor: code === "D1" ? "#3B82F620" : code === "D3" ? "#10B98120" : "#8B5CF620",
                            color: code === "D1" ? "#3B82F6" : code === "D3" ? "#10B981" : "#8B5CF6",
                          }}>
                          {code}
                        </span>
                      ))}
                    </div>
                    <p className="text-bw-ink leading-relaxed">{guide.objectifPedagogique}</p>
                    <ul className="space-y-2">
                      {guide.competences.map((comp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-bw-text">
                          <span className="text-bw-teal mt-0.5">&#10003;</span>
                          {comp}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </motion.div>
              </Card>
            )}

            {/* Module progression */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-bw-muted">
                  Parcours des modules
                </CardTitle>
              </CardHeader>
              <CardContent>
              <div className="space-y-3">
                {PHASES.map((phase) => {
                  const phaseModules = MODULES.filter(m => phase.moduleIds.includes(m.id));
                  const completedInPhase = phaseModules.filter(m =>
                    session.completed_modules?.includes(m.id)
                  ).length;
                  const isCurrent = phaseModules.some(m => m.id === currentModule?.id);

                  return (
                    <div key={phase.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isCurrent ? "glass-card" : "hover:bg-white/[0.02]"
                    }`}>
                      {/* Phase icon — typographic, not emoji */}
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 tracking-tight"
                        style={{
                          background: `linear-gradient(135deg, ${phase.color}20, ${phase.color}08)`,
                          color: phase.color,
                          border: `1px solid ${phase.color}25`,
                        }}
                      >
                        {PHASE_ICONS[phase.id] || phase.label[0]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold tracking-tight ${isCurrent ? "text-bw-ink" : "text-bw-muted"}`}>
                            {phase.label}
                          </span>
                          {phaseModules[0]?.comingSoon && (
                            <span className="text-xs text-bw-placeholder font-medium tracking-wider uppercase">Bientôt</span>
                          )}
                        </div>
                        {!phaseModules[0]?.comingSoon && (
                          <div className="flex gap-1.5 mt-1.5">
                            {phaseModules.map((m) => {
                              const isCompleted = session.completed_modules?.includes(m.id);
                              const isActive = m.id === currentModule?.id;
                              return (
                                <div
                                  key={m.id}
                                  className="h-1.5 rounded-full flex-1 transition-all duration-500"
                                  style={{
                                    backgroundColor: isCompleted
                                      ? phase.color
                                      : isActive
                                        ? `${phase.color}60`
                                        : "rgba(255,255,255,0.06)",
                                    boxShadow: isCompleted ? `0 0 8px ${phase.color}40` : "none",
                                  }}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-mono text-bw-placeholder tabular-nums">
                        {!phaseModules[0]?.comingSoon ? `${completedInPhase}/${phaseModules.length}` : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
              </CardContent>
            </Card>
            </motion.div>

            {/* Facilitator tips */}
            {guide && (
              <Card>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-bw-muted">
                      Conseils de l&apos;intervenant
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 glass-card">
                      <Badge variant="default" className="uppercase text-xs">Intro à dire</Badge>
                      <p className="text-sm text-bw-ink mt-2 italic leading-relaxed">&ldquo;{guide.introADire}&rdquo;</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 glass-surface rounded-xl">
                        <Badge variant="teal" className="uppercase text-xs">Relancer</Badge>
                        <ul className="mt-2 space-y-1.5">
                          {guide.commentRelancer.map((r, i) => (
                            <li key={i} className="text-xs text-bw-text leading-relaxed">&bull; {r}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 glass-surface rounded-xl">
                        <Badge variant="violet" className="uppercase text-xs">Challenger</Badge>
                        <ul className="mt-2 space-y-1.5">
                          {guide.commentChallenger.map((c, i) => (
                            <li key={i} className="text-xs text-bw-text leading-relaxed">&bull; {c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              </Card>
            )}

            {/* Cinema references — poster style */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h2 className="text-sm font-semibold uppercase tracking-wider text-bw-muted mb-5">
                Références cinéma
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {CINEMA_REFS.map((film, i) => (
                  <motion.div
                    key={film.title}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="group relative rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:translate-y-[-2px]"
                    style={{ boxShadow: `0 0 0 0 ${film.color}00` }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 32px ${film.color}20`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 0 0 ${film.color}00`; }}
                  >
                    {/* Poster — real TMDB image */}
                    <div className="relative aspect-[2/3] overflow-hidden bg-black/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${TMDB_IMG}/w342${film.poster}`}
                        alt={film.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      />
                      {/* Gradient overlay at bottom for readability */}
                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
                      {/* Year badge — top corner */}
                      <span className="absolute top-2 right-2 text-xs font-mono tracking-wider px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white/70 border border-white/10">
                        {film.year}
                      </span>
                    </div>
                    {/* Info bottom */}
                    <div className="p-3 bg-white/[0.02]">
                      <p className="font-semibold text-sm text-bw-ink leading-tight tracking-tight">{film.title}</p>
                      <p className="text-xs text-bw-placeholder mt-0.5">{film.director}</p>
                      <p className="text-xs font-medium mt-2 px-2 py-0.5 rounded-full inline-block border"
                        style={{ borderColor: `${film.color}25`, color: `${film.color}CC`, backgroundColor: `${film.color}08` }}>
                        {film.theme}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right column — session info */}
          <div className="space-y-6">
            {/* Students connected */}
            <Card>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
              <CardHeader className="flex-row items-center gap-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-bw-muted">
                  Élèves
                </CardTitle>
                <Badge>{activeStudents.length}</Badge>
                {hasDemoStudents && (
                  <Badge variant="violet" className="text-xs">Mode démo</Badge>
                )}
              </CardHeader>
              <CardContent>
              {activeStudents.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-bw-primary/10 mx-auto flex items-center justify-center mb-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  </div>
                  <p className="text-sm text-bw-placeholder">En attente des élèves...</p>
                  <p className="text-xs text-bw-placeholder mt-1">Partagez le code pour commencer</p>

                  {/* Demo mode button — only when no students at all */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 text-bw-violet border-bw-violet/30 hover:bg-bw-violet/10 hover:border-bw-violet/50"
                    disabled={activateDemo.isPending}
                    onClick={() => activateDemo.mutate()}
                  >
                    {activateDemo.isPending ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="inline-block w-4 h-4 border-2 border-bw-violet border-t-transparent rounded-full mr-2"
                      />
                    ) : (
                      <span className="mr-1.5">&#127917;</span>
                    )}
                    Tester en mode démo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeStudents.map((s, i) => {
                    const isDemo = DEMO_STUDENT_NAMES.includes(s.display_name);
                    return (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                          isDemo
                            ? "bg-bw-violet/5 border border-bw-violet/15 hover:bg-bw-violet/10"
                            : "bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04]"
                        }`}
                      >
                        <span className="text-lg">{s.avatar}</span>
                        <span className="text-sm text-bw-ink font-medium">{s.display_name}</span>
                        {isDemo && (
                          <Badge variant="ghost" className="text-xs py-0 px-1.5">virtuel</Badge>
                        )}
                        <span className={`ml-auto w-2 h-2 rounded-full ${isDemo ? "bg-bw-violet" : "bg-bw-green"} animate-pulse`} />
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Demo mode actions — below the student list */}
              {hasDemoStudents && (
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs text-bw-placeholder">
                    {demoStudents.length} virtuel{demoStudents.length > 1 ? "s" : ""}
                    {realStudents.length > 0 && ` + ${realStudents.length} reel${realStudents.length > 1 ? "s" : ""}`}
                  </span>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-bw-danger/70 hover:text-bw-danger hover:bg-bw-danger/10 text-xs"
                    disabled={deactivateDemo.isPending}
                    onClick={() => deactivateDemo.mutate()}
                  >
                    {deactivateDemo.isPending ? "Suppression..." : "Supprimer les demos"}
                  </Button>
                </div>
              )}

              {/* Activate demo when real students exist but no demo yet */}
              {!hasDemoStudents && activeStudents.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-bw-violet/60 hover:text-bw-violet hover:bg-bw-violet/10 text-xs w-full"
                    disabled={activateDemo.isPending}
                    onClick={() => activateDemo.mutate()}
                  >
                    <span className="mr-1">&#127917;</span>
                    {activateDemo.isPending ? "Ajout..." : "Ajouter des eleves virtuels"}
                  </Button>
                </div>
              )}
              </CardContent>
              </motion.div>
            </Card>

            {/* Join QR — cinematic card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl overflow-hidden border border-bw-border"
            >
              <div className="bg-white/[0.03] backdrop-blur-xl p-6 text-center">
                <div className="relative z-10">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-bw-text mb-4">
                    Rejoindre la partie
                  </h3>
                  <div className="inline-block bg-white p-3 rounded-xl shadow-lg">
                    <QRCodeSVG value={joinUrl + "?code=" + session.join_code} size={120} />
                  </div>
                  <p className="text-xs text-bw-muted mt-4">
                    banlieuwood.app/join
                  </p>
                  <div className="flex gap-1.5 justify-center mt-2">
                    {session.join_code.split("").map((char, i) => (
                      <span key={i} className="w-8 h-10 bg-white/[0.06] rounded-lg flex items-center justify-center text-white font-mono font-bold text-lg border border-white/[0.08]">
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Session meta — stylized */}
            <Card>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-bw-muted">
                    Infos session
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <dt className="text-bw-placeholder">Niveau</dt>
                      <dd>
                        <Badge variant="secondary">{LEVEL_LABELS[session.level] || session.level}</Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-bw-placeholder">Statut</dt>
                      <dd>
                        <Badge variant="teal" className="capitalize">{session.status}</Badge>
                      </dd>
                    </div>
                    {session.template && (
                      <div className="flex justify-between items-center">
                        <dt className="text-bw-placeholder">Genre</dt>
                        <dd>
                          <Badge variant="violet" className="capitalize">{session.template}</Badge>
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <dt className="text-bw-placeholder">Créée le</dt>
                      <dd className="text-bw-ink font-medium">
                        {new Date(session.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-bw-placeholder">Modules faits</dt>
                      <dd className="text-bw-ink font-bold text-lg">{session.completed_modules?.length || 0}</dd>
                    </div>
                  </dl>
                </CardContent>
              </motion.div>
            </Card>
          </div>
        </div>

      {/* Pre-session checklist — appears when waiting, no module started */}
      {session.status === "waiting" && !checklistDismissed && (
        <PreSessionChecklist
          connectedCount={activeStudents.length}
          moduleSelected={!!currentModule}
          moduleName={currentModule?.title}
          joinCode={session.join_code}
          onDismiss={() => setChecklistDismissed(true)}
        />
      )}

      {/* Onboarding tour for first-time facilitators */}
      <OnboardingTour />
      <HelpButton pageKey="session" tips={[
        { title: "Vue d'ensemble", description: "Cette page resume votre session : eleves connectes, modules actifs, et avancement." },
        { title: "Lancer le pilotage", description: "Cliquez sur 'Piloter' pour ouvrir la console de pilotage et guider la session en direct." },
        { title: "Ecran de projection", description: "Ouvrez l'ecran dans un nouvel onglet et projetez-le au tableau pour que toute la classe voie." },
      ]} />
    </PageShell>
  );
}
