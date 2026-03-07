"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CATEGORY_COLORS, CATEGORY_LABELS, BUDGET_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/page-shell";
import { DashboardHeader } from "@/components/dashboard-header";
import FilmPosterExport from "@/components/film-poster-export";
import { SessionComparison } from "@/components/session-comparison";
import { FestivalPalmares } from "@/components/festival-palmares";
import type { PosterChoice, PosterStudent } from "@/components/film-poster";
import { OIERadar, OIERadarMini } from "@/components/pilot/oie-radar";
import type { OIEScores } from "@/lib/oie-profile";
import { SessionReplay } from "@/components/pilot/session-replay";

interface ExportData {
  markdown: string;
  session: { title: string; level: string; date: string };
  choicesCount: number;
  studentsCount: number;
}

interface FeedbackData {
  stats: {
    totalStudents: number;
    totalResponses: number;
    totalVotes: number;
    totalChoices: number;
    participationRate: number;
    avgResponseLength: number;
  };
  competencies: {
    key: string;
    label: string;
    description: string;
    score: number;
    detail: string;
  }[];
  students: {
    id: string;
    name: string;
    avatar: string;
    responses: number;
    avgLength: number;
    chosenCount: number;
  }[];
  groupProfile: string;
  overallScore: number;
  strengths: { label: string; detail: string } | null;
  weakness: { label: string; detail: string } | null;
}

interface BilanData {
  narrativeSummary: string;
  groupDynamics: {
    summary: string;
    influencers: string[];
    collaborationLevel: string;
  };
  keyMoments: { category: string; description: string }[];
  engagement: {
    summary: string;
    participationTrend: string;
    depth: string;
  };
  pedagogicalRecommendations: string[];
}

interface FicheData {
  title: string;
  duration: string;
  objectives: { objective: string; socleCommun: string }[];
  competencies: {
    domaine1: { title: string; skills: string[] };
    domaine3: { title: string; skills: string[] };
    domaine5: { title: string; skills: string[] };
  };
  animationTips: { phase: string; tip: string; timing: string }[];
  relaunchTips: string[];
  adaptationByLevel: { primaire: string; college: string; lycee: string };
  evaluation: string[];
  sessionRecap: string | null;
}

const COLLAB_COLORS: Record<string, string> = {
  faible: "#EF4444",
  moyen: "#F59E0B",
  bon: "#4ECDC4",
  excellent: "#10B981",
};

const TREND_LABELS: Record<string, { label: string; icon: string }> = {
  croissant: { label: "Croissant", icon: "↗" },
  stable: { label: "Stable", icon: "→" },
  "décroissant": { label: "Décroissant", icon: "↘" },
};

const DEPTH_COLORS: Record<string, string> = {
  superficiel: "#F59E0B",
  correct: "#4ECDC4",
  approfondi: "#10B981",
};

const MOMENT_COLORS: Record<string, string> = {
  tournant: "#FF6B35",
  "créatif": "#8B5CF6",
  collectif: "#4ECDC4",
  tension: "#EF4444",
};

const SOCLE_COLORS: Record<string, string> = {
  D1: "#3B82F6",
  D3: "#10B981",
  D5: "#8B5CF6",
};

export default function ResultsPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const autoScrolled = useRef(false);
  const [activeSection, setActiveSection] = useState("section-histoire");

  // Bilan state
  const [bilan, setBilan] = useState<BilanData | null>(null);
  const [bilanLoading, setBilanLoading] = useState(false);
  const [bilanProvider, setBilanProvider] = useState<string | null>(null);

  // Fiche state
  const [fiche, setFiche] = useState<FicheData | null>(null);
  const [ficheLoading, setFicheLoading] = useState(false);
  const [ficheProvider, setFicheProvider] = useState<string | null>(null);

  // Bible du Film state
  const [bible, setBible] = useState<{ logline: string; synopsis: string; characters: { name: string; role: string; description: string; arc: string }[]; world: { setting: string; atmosphere: string; rules: string }; conflict: { central: string; stakes: string; antagonist: string }; structure: { act1: string; act2: string; act3: string }; style: { genre: string; tone: string; influences: string[]; visualIdentity: string }; themes: string[] } | null>(null);
  const [bibleLoading, setBibleLoading] = useState(false);
  const [bibleProvider, setBibleProvider] = useState<string | null>(null);

  // Replay state
  const [showReplay, setShowReplay] = useState(false);

  // Fiche level tab
  const [ficheTab, setFicheTab] = useState<"primaire" | "college" | "lycee">("college");

  // Fiche accordion
  const [openDomaine, setOpenDomaine] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCheckingAuth(false);
    }
    check();
  }, [router]);

  const { data: exportData, isLoading } = useQuery<ExportData>({
    queryKey: ["export", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/export`);
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    enabled: !checkingAuth,
  });

  const { data: budgetData } = useQuery({
    queryKey: ["budgets", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/budget`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !checkingAuth,
  });

  // Module 10 pitchs data
  const { data: m10PitchData } = useQuery<{
    pitchs: {
      id: string;
      student_id: string;
      objectif: string;
      obstacle: string;
      pitch_text: string;
      chrono_seconds: number | null;
      students: { display_name: string; avatar: string } | null;
      module10_personnages: { prenom: string; avatar_data: Record<string, unknown> | null } | null;
    }[];
    count: number;
  }>({
    queryKey: ["m10-pitchs", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/pitch`);
      if (!res.ok) return { pitchs: [], count: 0 };
      return res.json();
    },
    enabled: !checkingAuth,
  });

  const { data: feedback } = useQuery<FeedbackData>({
    queryKey: ["feedback", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/feedback`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !checkingAuth,
  });

  // O-I-E creative profiles
  const { data: oieData } = useQuery<{ scores: Record<string, OIEScores> }>({
    queryKey: ["oie-profile", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/oie-profile`);
      if (!res.ok) return { scores: {} };
      return res.json();
    },
    enabled: !checkingAuth,
  });

  // Replay data (only fetched when opened)
  const { data: replayData } = useQuery<{
    events: { id: string; event_type: string; student_id: string | null; situation_id: string | null; payload: Record<string, unknown>; occurred_at: string; offsetMs: number; seq: number }[];
    totalDurationMs: number;
    students: { id: string; display_name: string; avatar: string }[];
    responses: { id: string; student_id: string; situation_id: string; text: string; response_time_ms: number | null; ai_score: number | null; is_highlighted: boolean; submitted_at: string }[];
  }>({
    queryKey: ["replay", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/replay`);
      if (!res.ok) return { events: [], totalDurationMs: 0, students: [], responses: [] };
      return res.json();
    },
    enabled: showReplay && !checkingAuth,
  });

  // Fetch session detail (for template/genre)
  const { data: sessionDetail } = useQuery<{ template?: string | null }>({
    queryKey: ["session-detail", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) return {};
      return res.json();
    },
    enabled: !checkingAuth,
  });

  // Derive poster data from existing queries
  const posterData = useMemo(() => {
    if (!exportData) return null;

    // Parse collective choices from markdown lines (format: "- **Label** : Text")
    const choiceLines = exportData.markdown.split("\n").filter((l) => l.startsWith("- **"));
    const choices: PosterChoice[] = choiceLines
      .map((line) => {
        const match = line.match(/^- \*\*(.+?)\*\* : (.+)$/);
        if (!match) return null;
        const [, label, text] = match;
        const category =
          Object.keys(CATEGORY_LABELS).find((c) =>
            label.toLowerCase().includes(c)
          ) || "personnage";
        return { category, text } as PosterChoice;
      })
      .filter((c): c is PosterChoice => c !== null);

    // Students from feedback data
    const students: PosterStudent[] = (feedback?.students || []).map((s) => ({
      displayName: s.name,
      avatar: s.avatar,
    }));

    return { choices, students };
  }, [exportData, feedback]);

  // Try loading cached bilan on mount
  useEffect(() => {
    if (checkingAuth) return;
    fetch(`/api/sessions/${sessionId}/bilan`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.bilan) {
          setBilan(data.bilan);
          setBilanProvider(data.provider);
        }
      })
      .catch(() => {});
  }, [sessionId, checkingAuth]);

  // Try loading cached fiche on mount
  useEffect(() => {
    if (checkingAuth) return;
    fetch(`/api/sessions/${sessionId}/fiche-cours`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.fiche) {
          setFiche(data.fiche);
          setFicheProvider(data.provider);
        }
      })
      .catch(() => {});
  }, [sessionId, checkingAuth]);

  // Try loading cached bible on mount
  useEffect(() => {
    if (checkingAuth) return;
    fetch(`/api/sessions/${sessionId}/bible`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.bible) {
          setBible(data.bible);
          setBibleProvider(data.provider);
        }
      })
      .catch(() => {});
  }, [sessionId, checkingAuth]);

  // Auto-scroll to section from ?tab= query param — observes DOM until target appears
  useEffect(() => {
    if (autoScrolled.current) return;
    const tab = searchParams.get("tab");
    if (!tab) return;
    const sectionMap: Record<string, string> = {
      histoire: "section-histoire",
      bilan: "section-bilan-educatif",
      profils: "section-profils-creatifs",
      "bilan-ia": "section-bilan-ia",
      fiche: "section-fiche-cours",
      bible: "section-bible-film",
      festival: "section-festival",
    };
    const targetId = sectionMap[tab];
    if (!targetId) return;

    function tryScroll() {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        autoScrolled.current = true;
        return true;
      }
      return false;
    }

    // Try immediately
    if (tryScroll()) return;

    // Observe DOM mutations until element appears (max 10s)
    const observer = new MutationObserver(() => {
      if (tryScroll()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const timeout = setTimeout(() => observer.disconnect(), 10000);
    return () => { observer.disconnect(); clearTimeout(timeout); };
  }, [searchParams]);

  // Track active section for sticky nav highlight
  useEffect(() => {
    const ids = ["section-histoire", "section-bilan-educatif", "section-profils-creatifs", "section-bilan-ia", "section-fiche-cours", "section-bible-film", "section-festival"];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [exportData, feedback, bilan, fiche]);

  const handleGenerateBilan = useCallback(async () => {
    setBilanLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/bilan`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur");
      }
      const data = await res.json();
      setBilan(data.bilan);
      setBilanProvider(data.provider);
      toast.success("Bilan généré !");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de la génération");
    } finally {
      setBilanLoading(false);
    }
  }, [sessionId]);

  const handleGenerateFiche = useCallback(async () => {
    setFicheLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/fiche-cours`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur");
      }
      const data = await res.json();
      setFiche(data.fiche);
      setFicheProvider(data.provider);
      toast.success("Fiche de cours générée !");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de la génération");
    } finally {
      setFicheLoading(false);
    }
  }, [sessionId]);

  function downloadMarkdown(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function bilanToMarkdown(b: BilanData): string {
    const lines = [
      "# Bilan de Session IA",
      "",
      "## Résumé narratif",
      b.narrativeSummary,
      "",
      "## Dynamique de groupe",
      b.groupDynamics.summary,
      `**Collaboration :** ${b.groupDynamics.collaborationLevel}`,
      `**Influenceurs :** ${b.groupDynamics.influencers.join(", ")}`,
      "",
      "## Moments clés",
      ...b.keyMoments.map((m) => `- [${m.category}] ${m.description}`),
      "",
      "## Engagement",
      b.engagement.summary,
      `**Tendance :** ${b.engagement.participationTrend} | **Profondeur :** ${b.engagement.depth}`,
      "",
      "## Recommandations pédagogiques",
      ...b.pedagogicalRecommendations.map((r, i) => `${i + 1}. ${r}`),
    ];
    return lines.join("\n");
  }

  function ficheToMarkdown(f: FicheData): string {
    const lines = [
      `# ${f.title}`,
      "",
      `**Durée :** ${f.duration}`,
      "",
      "## Objectifs",
      ...f.objectives.map((o) => `- [${o.socleCommun}] ${o.objective}`),
      "",
      "## Compétences",
      "",
      `### ${f.competencies.domaine1.title}`,
      ...f.competencies.domaine1.skills.map((s) => `- ${s}`),
      "",
      `### ${f.competencies.domaine3.title}`,
      ...f.competencies.domaine3.skills.map((s) => `- ${s}`),
      "",
      `### ${f.competencies.domaine5.title}`,
      ...f.competencies.domaine5.skills.map((s) => `- ${s}`),
      "",
      "## Conseils d'animation",
      ...f.animationTips.map((t) => `- **${t.phase}** (${t.timing}) : ${t.tip}`),
      "",
      "## Relance",
      ...f.relaunchTips.map((t) => `- ${t}`),
      "",
      "## Adaptation par niveau",
      `- **Primaire :** ${f.adaptationByLevel.primaire}`,
      `- **Collège :** ${f.adaptationByLevel.college}`,
      `- **Lycée :** ${f.adaptationByLevel.lycee}`,
      "",
      "## Évaluation",
      ...f.evaluation.map((e) => `- ${typeof e === 'string' ? e : Object.values(e as Record<string, string>).join(' — ')}`),
    ];
    if (f.sessionRecap) {
      lines.push("", "## Résumé de session", f.sessionRecap);
    }
    return lines.join("\n");
  }

  function handleCopyMarkdown() {
    if (!exportData) return;
    navigator.clipboard.writeText(exportData.markdown);
    toast.success("Copié dans le presse-papier !");
  }

  function handleDownload() {
    if (!exportData) return;
    downloadMarkdown(
      exportData.markdown,
      `${exportData.session.title.replace(/\s+/g, "-")}-histoire.md`
    );
  }

  function handleExportCsv() {
    if (!feedback) return;
    const headers = ["Eleve", "Avatar", "Reponses", "Longueur moy.", "Choisi(e)s"];
    const rows = feedback.students.map(s => [
      s.name,
      s.avatar,
      String(s.responses),
      String(s.avgLength),
      String(s.chosenCount),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportData?.session.title.replace(/\s+/g, "-") || "session"}-eleves.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exporte !");
  }

  if (checkingAuth || isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-bw-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!exportData) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-bw-danger/20 mx-auto flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </div>
          <p className="text-bw-muted">Impossible de charger les résultats</p>
        </div>
      </div>
    );
  }

  const lines = exportData.markdown.split("\n");

  return (
    <PageShell maxWidth="lg">
      <DashboardHeader
        backHref={`/session/${sessionId}`}
        backLabel="Session"
        actions={
          <div className="no-print flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopyMarkdown}>
              Copier
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExportCsv} disabled={!feedback}>
              CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              PDF
            </Button>
            <Button size="sm" onClick={handleDownload}>
              Télécharger .md
            </Button>
          </div>
        }
      />
        {/* ── Sticky section nav ── */}
        <div className="no-print sticky top-0 z-30 py-2.5 bg-bw-bg/85 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: "section-histoire", label: "Histoire", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
              { id: "section-bilan-educatif", label: "Bilan educatif", icon: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01 9 11.01" },
              { id: "section-profils-creatifs", label: "Profils créatifs", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" },
              { id: "section-bilan-ia", label: "Bilan IA", icon: "M12 2a10 10 0 110 20 10 10 0 010-20zM12 6v6l4 2" },
              { id: "section-fiche-cours", label: "Fiche de cours", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6" },
              { id: "section-bible-film", label: "Bible du Film", icon: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z" },
              { id: "section-festival", label: "Festival", icon: "M6 9H4.5a2.5 2.5 0 010-5C5.3 4 6 4.7 6 5.5V9zm12 0h1.5a2.5 2.5 0 000-5c-.8 0-1.5.7-1.5 1.5V9zM4 22h16v-7H4v7zM4 15h16V9H4v6zm4-6V4m8 5V4" },
            ].map((nav) => {
              const isActive = activeSection === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => document.getElementById(nav.id)?.scrollIntoView({ behavior: "smooth" })}
                  className={`relative flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-white bg-white/[0.1] border border-white/[0.15] shadow-[0_0_12px_rgba(255,255,255,0.05)]"
                      : "text-bw-muted hover:text-bw-text hover:bg-white/[0.05]"
                  }`}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={nav.icon} />
                  </svg>
                  {nav.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Title — cinematic header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 relative"
        >
          <div className="inline-block">
            <h1 className="text-4xl font-bold font-cinema tracking-wider">{exportData.session.title}</h1>
            <div className="h-1 rounded-full bg-gradient-to-r from-bw-primary via-bw-gold to-bw-violet mt-2" />
          </div>
          <p className="text-bw-muted">
            {exportData.studentsCount} joueur{exportData.studentsCount > 1 ? "s" : ""} &mdash; {exportData.choicesCount} choix collectif{exportData.choicesCount > 1 ? "s" : ""}
          </p>
          {/* Replay button */}
          <button
            onClick={() => setShowReplay(!showReplay)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-black/[0.04] border border-black/[0.06] hover:bg-black/[0.08] cursor-pointer transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5,3 19,12 5,21"/></svg>
            {showReplay ? "Fermer le replay" : "Revoir la séance"}
          </button>
        </motion.div>

        {/* Session Replay */}
        {showReplay && replayData && replayData.events.length > 0 && (
          <SessionReplay
            events={replayData.events}
            totalDurationMs={replayData.totalDurationMs}
            students={replayData.students}
            responses={replayData.responses}
            onClose={() => setShowReplay(false)}
          />
        )}
        {showReplay && replayData && replayData.events.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-bw-muted">Aucun événement enregistré pour cette séance.</p>
          </div>
        )}

        {/* Collective choices visual */}
        {exportData.choicesCount > 0 ? (
          <div className="space-y-4">
            <div>
              <h2 id="section-histoire" className="font-cinema text-xl tracking-wide uppercase text-bw-ink scroll-mt-16">L&apos;Histoire Collective</h2>
              <div className="w-12 h-0.5 mt-1 bg-gradient-to-r from-bw-primary to-bw-gold rounded-full" />
            </div>
            {lines.filter(l => l.startsWith("- **")).map((line, i) => {
              const match = line.match(/^- \*\*(.+?)\*\* : (.+)$/);
              if (!match) return null;
              const [, label, text] = match;
              const cat = Object.keys(CATEGORY_LABELS).find(c =>
                label.toLowerCase().includes(c)
              ) || "personnage";
              const color = CATEGORY_COLORS[cat] || "#FF6B35";

              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-bw-surface rounded-xl p-5 border-l-4"
                  style={{ borderLeftColor: color }}>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{label}</span>
                  <p className="text-lg leading-relaxed mt-2">{text}</p>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-bw-muted/10 mx-auto flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-bw-muted">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <p className="text-bw-muted">Aucun choix collectif pour l&apos;instant.</p>
            <p className="text-sm text-bw-muted mt-1">Validez des réponses depuis le cockpit pour construire l&apos;histoire.</p>
          </div>
        )}

        {/* ——— FILM POSTER ——— */}
        {posterData && posterData.choices.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-cinema text-xl tracking-wide uppercase text-bw-ink">Affiche du Film</h2>
              <div className="w-12 h-0.5 mt-1 bg-gradient-to-r from-bw-gold to-bw-primary rounded-full" />
            </div>
            <FilmPosterExport
              title={exportData.session.title}
              template={sessionDetail?.template || null}
              collectiveChoices={posterData.choices}
              students={posterData.students}
            />
          </div>
        )}

        {/* Budget summary */}
        {budgetData?.averages && Object.keys(budgetData.averages).length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-cinema text-xl tracking-wide uppercase text-bw-ink">Choix de production (moyenne classe)</h2>
              <div className="w-12 h-0.5 mt-1 bg-gradient-to-r from-bw-primary to-bw-gold rounded-full" />
            </div>
            <Card>
              <CardContent className="space-y-3">
              {BUDGET_CATEGORIES.map((cat) => {
                const avg = (budgetData.averages as Record<string, number>)?.[cat.key] || 0;
                const closestOption = cat.options.reduce((prev, curr) =>
                  Math.abs(curr.cost - avg) < Math.abs(prev.cost - avg) ? curr : prev
                );
                return (
                  <div key={cat.key} className="flex items-center gap-3">
                    <span className="text-sm w-24 font-medium" style={{ color: cat.color }}>{cat.label}</span>
                    <div className="flex-1 bg-bw-border rounded-full h-4 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(avg / 40) * 100}%` }}
                        transition={{ duration: 0.6 }}
                        className="h-full rounded-full" style={{ backgroundColor: cat.color }} />
                    </div>
                    <span className="text-sm text-bw-muted w-28 text-right">{closestOption.label} ({avg})</span>
                  </div>
                );
              })}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Module 10 — Pitchs & Personnages */}
        {m10PitchData && m10PitchData.pitchs.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-cinema text-xl tracking-wide uppercase text-bw-ink">Pitchs des élèves</h2>
              <div className="w-12 h-0.5 mt-1 bg-gradient-to-r from-amber-500 to-bw-primary rounded-full" />
              <p className="text-sm text-bw-muted mt-2">{m10PitchData.count} pitch{m10PitchData.count > 1 ? "s" : ""} créé{m10PitchData.count > 1 ? "s" : ""}</p>
            </div>
            <div className="grid gap-3">
              {m10PitchData.pitchs.filter(p => p.pitch_text && p.pitch_text.length > 0).map((p) => (
                <Card key={p.id}>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{p.students?.avatar || "👤"}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{p.module10_personnages?.prenom || p.students?.display_name || "Élève"}</span>
                        {p.module10_personnages?.prenom && p.students?.display_name && (
                          <span className="text-xs text-bw-muted ml-1.5">({p.students.display_name})</span>
                        )}
                      </div>
                      {p.chrono_seconds != null && (
                        <Badge variant="outline" className="text-xs tabular-nums">{p.chrono_seconds}s</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">Objectif : {p.objectif}</Badge>
                      <Badge variant="destructive" className="text-xs">Obstacle : {p.obstacle}</Badge>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{p.pitch_text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── Profils Créatifs O-I-E ── */}
        {oieData && Object.keys(oieData.scores).length > 0 && (() => {
          const entries = Object.entries(oieData.scores);
          const avgO = Math.round(entries.reduce((s, [, v]) => s + v.O, 0) / entries.length);
          const avgI = Math.round(entries.reduce((s, [, v]) => s + v.I, 0) / entries.length);
          const avgE = Math.round(entries.reduce((s, [, v]) => s + v.E, 0) / entries.length);
          let classDom: "O" | "I" | "E" = "O";
          if (avgI >= avgO && avgI >= avgE) classDom = "I";
          else if (avgE >= avgO && avgE >= avgI) classDom = "E";
          const classAvg: OIEScores = { O: avgO, I: avgI, E: avgE, dominant: classDom, responseCount: entries.reduce((s, [, v]) => s + v.responseCount, 0), isReliable: true };

          const countO = entries.filter(([, v]) => v.dominant === "O").length;
          const countI = entries.filter(([, v]) => v.dominant === "I").length;
          const countE = entries.filter(([, v]) => v.dominant === "E").length;

          const dominantLabels: Record<string, string> = { O: "Observateurs", I: "Imaginatifs", E: "Expressifs" };
          const dominantColors: Record<string, string> = { O: "#8B5CF6", I: "#06B6D4", E: "#F59E0B" };

          // Match students with feedback data for names
          const studentNames: Record<string, { name: string; avatar: string }> = {};
          if (feedback?.students) {
            for (const s of feedback.students) studentNames[s.id] = { name: s.name, avatar: s.avatar };
          }

          return (
            <div className="space-y-6">
              <div>
                <h2 id="section-profils-creatifs" className="font-cinema text-xl tracking-wide uppercase text-bw-ink scroll-mt-16">Profils créatifs</h2>
                <div className="w-12 h-0.5 mt-1 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] rounded-full" />
              </div>

              {/* Class average radar + distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Profil moyen de la classe</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <OIERadar scores={classAvg} size={180} showLabel={false} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(["O", "I", "E"] as const).map((axis) => {
                      const count = axis === "O" ? countO : axis === "I" ? countI : countE;
                      const pct = entries.length > 0 ? Math.round((count / entries.length) * 100) : 0;
                      return (
                        <div key={axis} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium" style={{ color: dominantColors[axis] }}>{dominantLabels[axis]}</span>
                            <span className="text-bw-muted">{count} ({pct}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-black/[0.04] overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: dominantColors[axis] }}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-[11px] text-bw-muted mt-2">
                      {countI > countO && countI > countE && "La classe est très imaginative"}
                      {countO > countI && countO > countE && "La classe est très analytique"}
                      {countE > countO && countE > countI && "La classe est très expressive"}
                      {countO === countI && countO === countE && "Profil de classe équilibré"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Mini radars per student */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Profils individuels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {entries.map(([studentId, scores]) => {
                      const info = studentNames[studentId];
                      return (
                        <div key={studentId} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-black/[0.02] transition-colors">
                          <OIERadarMini scores={scores} size={56} />
                          <span className="text-[10px] font-medium text-bw-text truncate max-w-[80px]">
                            {info?.avatar} {info?.name || "Élève"}
                          </span>
                          <span className="text-[9px] font-semibold" style={{ color: dominantColors[scores.dominant] }}>
                            {dominantLabels[scores.dominant]?.slice(0, -1)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })()}

        {/* Educational Feedback */}
        {feedback && (
          <div className="space-y-6">
            <div>
              <h2 id="section-bilan-educatif" className="font-cinema text-xl tracking-wide uppercase text-bw-ink scroll-mt-16">Bilan éducatif</h2>
              <div className="w-12 h-0.5 mt-1 bg-gradient-to-r from-bw-primary to-bw-gold rounded-full" />
            </div>

            <Card>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative w-20 h-20">
                      <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                        <motion.circle
                          cx="18" cy="18" r="15.9155" fill="none"
                          stroke={feedback.overallScore >= 60 ? "#4ECDC4" : feedback.overallScore >= 30 ? "#F59E0B" : "#EF4444"}
                          strokeWidth="3" strokeLinecap="round"
                          strokeDasharray="100" initial={{ strokeDashoffset: 100 }}
                          animate={{ strokeDashoffset: 100 - feedback.overallScore }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                        {feedback.overallScore}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-lg font-medium">{feedback.groupProfile}</p>
                    <div className="flex items-center gap-4 text-sm text-bw-muted">
                      <span>{feedback.stats.totalResponses} réponses</span>
                      <span>{feedback.stats.participationRate}% de participation</span>
                      <span>~{feedback.stats.avgResponseLength} car./réponse</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  {feedback.strengths && (
                    <div className="bg-bw-teal/10 border border-bw-teal/20 rounded-xl p-3">
                      <Badge variant="teal" className="uppercase text-xs">Point fort</Badge>
                      <p className="text-sm mt-1">{feedback.strengths.detail}</p>
                    </div>
                  )}
                  {feedback.weakness && (
                    <div className="bg-bw-amber/10 border border-bw-amber/20 rounded-xl p-3">
                      <Badge variant="gold" className="uppercase text-xs">Progression</Badge>
                      <p className="text-sm mt-1">{feedback.weakness.detail}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Compétences narratives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {feedback.competencies.map((comp, i) => (
                  <div key={comp.key} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{comp.label}</span>
                      <span className="text-xs text-bw-muted">{comp.detail}</span>
                    </div>
                    <div className="w-full bg-bw-border rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${comp.score}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: comp.score >= 60 ? "#4ECDC4" : comp.score >= 30 ? "#F59E0B" : "#666",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {feedback.students.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Participation des joueurs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {feedback.students.slice(0, 10).map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 px-3 py-2 bg-bw-bg rounded-xl">
                      <span className="text-lg">{s.avatar}</span>
                      <span className="text-sm flex-1">{s.name}</span>
                      <Badge variant="secondary">{s.responses} rép.</Badge>
                      {s.chosenCount > 0 && (
                        <Badge>{s.chosenCount} choisi{s.chosenCount > 1 ? "s" : ""}</Badge>
                      )}
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ——— BILAN IA ——— */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="section-bilan-ia" className="font-cinema text-xl tracking-wide uppercase text-bw-ink scroll-mt-16">Bilan IA</h2>
              <div className="w-12 h-0.5 mt-1 bg-gradient-to-r from-bw-primary to-bw-gold rounded-full" />
            </div>
            {bilan && (
              <Button variant="ghost" size="xs"
                onClick={() => downloadMarkdown(bilanToMarkdown(bilan), "bilan-session.md")}
              >
                Télécharger .md
              </Button>
            )}
          </div>

          {!bilan && !bilanLoading && (
            <Button
              variant="outline"
              size="lg"
              className="w-full border-bw-primary/30 text-bw-primary hover:bg-bw-primary/10"
              onClick={handleGenerateBilan}
            >
              Générer le bilan IA
            </Button>
          )}

          {bilanLoading && (
            <div className="flex items-center justify-center gap-3 py-8">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-bw-primary border-t-transparent rounded-full" />
              <span className="text-sm text-bw-muted">L&apos;IA analyse la session...</span>
            </div>
          )}

          {bilan && (
            <div className="space-y-4">
              {bilanProvider && (
                <Badge variant="secondary" className="text-xs">
                  {bilanProvider === "fallback" ? "Algorithmique" : bilanProvider}
                </Badge>
              )}

              {/* Narrative summary */}
              <Card className="border-l-4 border-l-bw-primary">
                <CardContent>
                  <Badge className="uppercase text-xs">Résumé narratif</Badge>
                  <p className="text-lg leading-relaxed mt-2 italic text-bw-text">&ldquo;{bilan.narrativeSummary}&rdquo;</p>
                </CardContent>
              </Card>

              {/* Group dynamics */}
              <Card>
                <CardHeader className="flex-row items-center gap-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Dynamique de groupe</CardTitle>
                  <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${COLLAB_COLORS[bilan.groupDynamics.collaborationLevel] || "#666"}20`,
                      color: COLLAB_COLORS[bilan.groupDynamics.collaborationLevel] || "#666",
                    }}>
                    {bilan.groupDynamics.collaborationLevel}
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-bw-text mb-3">{bilan.groupDynamics.summary}</p>
                  {bilan.groupDynamics.influencers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {bilan.groupDynamics.influencers.map((inf, i) => (
                        <Badge key={i} variant="secondary">{inf}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Key moments */}
              {bilan.keyMoments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Moments clés</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {bilan.keyMoments.map((m, i) => {
                      const color = MOMENT_COLORS[m.category] || "#888";
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="pl-4 border-l-2 py-1" style={{ borderLeftColor: color }}>
                          <span className="text-xs font-semibold uppercase" style={{ color }}>{m.category}</span>
                          <p className="text-sm text-bw-text">{m.description}</p>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-bw-text mb-3">{bilan.engagement.summary}</p>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {TREND_LABELS[bilan.engagement.participationTrend]?.icon || ""}{" "}
                      {TREND_LABELS[bilan.engagement.participationTrend]?.label || bilan.engagement.participationTrend}
                    </Badge>
                    <span className="text-xs px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${DEPTH_COLORS[bilan.engagement.depth] || "#666"}20`,
                        color: DEPTH_COLORS[bilan.engagement.depth] || "#666",
                      }}>
                      {bilan.engagement.depth}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Recommandations pédagogiques</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 list-decimal list-inside">
                    {bilan.pedagogicalRecommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-bw-text">{rec}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* ——— FICHE DE COURS ——— */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="section-fiche-cours" className="font-cinema text-xl tracking-wide uppercase text-bw-ink scroll-mt-16">Fiche de Cours</h2>
              <div className="w-12 h-0.5 mt-1 bg-gradient-to-r from-bw-primary to-bw-gold rounded-full" />
            </div>
            {fiche && (
              <Button variant="ghost" size="xs"
                onClick={() => downloadMarkdown(ficheToMarkdown(fiche), "fiche-de-cours.md")}
              >
                Télécharger .md
              </Button>
            )}
          </div>

          {!fiche && !ficheLoading && (
            <Button
              variant="outline"
              size="lg"
              className="w-full border-bw-violet/30 text-bw-violet hover:bg-bw-violet/10"
              onClick={handleGenerateFiche}
            >
              Générer la fiche pédagogique
            </Button>
          )}

          {ficheLoading && (
            <div className="flex items-center justify-center gap-3 py-8">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-bw-violet border-t-transparent rounded-full" />
              <span className="text-sm text-bw-muted">Génération de la fiche pédagogique...</span>
            </div>
          )}

          {fiche && (
            <div className="space-y-4">
              {ficheProvider && (
                <Badge variant="secondary" className="text-xs">
                  {ficheProvider === "fallback" ? "Template" : ficheProvider}
                </Badge>
              )}

              {/* Title + Duration */}
              <Card className="border-l-4 border-l-bw-violet">
                <CardContent>
                  <h3 className="text-lg font-semibold">{fiche.title}</h3>
                  <p className="text-sm text-bw-muted mt-1">{fiche.duration}</p>
                </CardContent>
              </Card>

              {/* Objectives with socle commun badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Objectifs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {fiche.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                        style={{
                          backgroundColor: `${SOCLE_COLORS[obj.socleCommun] || "#666"}20`,
                          color: SOCLE_COLORS[obj.socleCommun] || "#666",
                        }}>
                        {obj.socleCommun}
                      </span>
                      <span className="text-sm text-bw-text">{obj.objective}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Competencies accordion */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Compétences du socle commun</CardTitle>
                </CardHeader>
                {(["domaine1", "domaine3", "domaine5"] as const).map((key) => {
                  const domaine = fiche.competencies[key];
                  if (!domaine) return null;
                  const isOpen = openDomaine === key;
                  const color = key === "domaine1" ? "#3B82F6" : key === "domaine3" ? "#10B981" : "#8B5CF6";
                  return (
                    <div key={key} className="border-t border-bw-border">
                      <Button
                        variant="ghost"
                        onClick={() => setOpenDomaine(isOpen ? null : key)}
                        className="w-full flex items-center justify-between px-5 py-3 h-auto rounded-none"
                      >
                        <span className="text-sm font-medium" style={{ color }}>{domaine.title}</span>
                        <span className="text-xs text-bw-muted">{isOpen ? "▲" : "▼"}</span>
                      </Button>
                      {isOpen && (
                        <div className="px-5 pb-4 space-y-1">
                          {domaine.skills.map((skill, i) => (
                            <p key={i} className="text-sm text-bw-text pl-3 border-l-2" style={{ borderLeftColor: color }}>
                              {skill}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Card>

              {/* Animation tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Conseils d&apos;animation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {fiche.animationTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Badge variant="violet" className="text-xs font-mono flex-shrink-0 mt-0.5">
                        {tip.timing}
                      </Badge>
                      <div>
                        <span className="text-sm font-medium text-bw-ink">{tip.phase}</span>
                        <p className="text-sm text-bw-placeholder mt-0.5">{tip.tip}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Relaunch tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Relancer les élèves</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {fiche.relaunchTips.map((tip, i) => (
                      <li key={i} className="text-sm text-bw-text pl-3 border-l-2 border-bw-amber">{tip}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Adaptation by level — tabs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Adaptation par niveau</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-3">
                    {(["primaire", "college", "lycee"] as const).map((lvl) => (
                      <Button key={lvl} size="xs"
                        variant={ficheTab === lvl ? "default" : "ghost"}
                        className={ficheTab === lvl ? "bg-bw-violet hover:bg-bw-violet/90 shadow-none" : ""}
                        onClick={() => setFicheTab(lvl)}>
                        {lvl === "primaire" ? "Primaire" : lvl === "college" ? "Collège" : "Lycée"}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-bw-text">{fiche.adaptationByLevel[ficheTab]}</p>
                </CardContent>
              </Card>

              {/* Evaluation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Critères d&apos;évaluation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {fiche.evaluation.map((crit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-bw-text">
                        <span className="text-bw-green flex-shrink-0 mt-0.5">&#10003;</span>
                        {typeof crit === 'string' ? crit : Object.values(crit as Record<string, string>).join(' — ')}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Session recap */}
              {fiche.sessionRecap && (
                <Card className="border-l-4 border-l-bw-teal">
                  <CardContent>
                    <Badge variant="teal" className="uppercase text-xs">Résumé de session</Badge>
                    <p className="text-sm text-bw-text mt-2">{fiche.sessionRecap}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* ——— BIBLE DU FILM ——— */}
        <div className="space-y-4 scroll-mt-16">
          <div className="flex items-center justify-between gap-4">
            <h2 id="section-bible-film" className="font-cinema text-xl tracking-wide uppercase text-bw-ink scroll-mt-16">Bible du Film</h2>
            {!bible && !bibleLoading && (
              <Button size="sm" variant="default" className="bg-bw-violet hover:bg-bw-violet/90 shadow-none"
                onClick={async () => {
                  setBibleLoading(true);
                  try {
                    const res = await fetch(`/api/sessions/${sessionId}/bible`, { method: "POST" });
                    const data = await res.json();
                    if (data?.bible) { setBible(data.bible); setBibleProvider(data.provider); }
                  } catch { /* */ } finally { setBibleLoading(false); }
                }}>
                Générer la Bible
              </Button>
            )}
            {bible && (
              <Button size="sm" variant="ghost" className="text-bw-muted text-xs"
                onClick={async () => {
                  setBibleLoading(true);
                  try {
                    const res = await fetch(`/api/sessions/${sessionId}/bible?force=true`, { method: "POST" });
                    const data = await res.json();
                    if (data?.bible) { setBible(data.bible); setBibleProvider(data.provider); }
                  } catch { /* */ } finally { setBibleLoading(false); }
                }}>
                Régénérer
              </Button>
            )}
          </div>

          {bibleLoading && (
            <Card><CardContent className="py-8 text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-6 h-6 border-2 border-bw-violet border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-bw-muted">Génération de la Bible du Film...</p>
            </CardContent></Card>
          )}

          {bible && (
            <div className="grid gap-4">
              {/* Logline */}
              <Card className="border-l-4 border-l-bw-primary">
                <CardContent>
                  <Badge variant="default" className="uppercase text-xs mb-2">Logline</Badge>
                  <p className="text-lg font-medium text-bw-ink italic">&ldquo;{bible.logline}&rdquo;</p>
                </CardContent>
              </Card>

              {/* Synopsis */}
              <Card>
                <CardHeader><CardTitle className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Synopsis</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-bw-text leading-relaxed">{bible.synopsis}</p></CardContent>
              </Card>

              {/* Characters */}
              {bible.characters && bible.characters.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Personnages</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {bible.characters.map((c, i) => (
                        <div key={i} className="bg-bw-surface rounded-xl p-3 border border-bw-border">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-bw-ink">{c.name}</span>
                            <Badge variant="secondary" className="text-xs">{c.role}</Badge>
                          </div>
                          <p className="text-xs text-bw-text mb-1">{c.description}</p>
                          <p className="text-xs text-bw-muted italic">Arc : {c.arc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* World */}
              <Card>
                <CardHeader><CardTitle className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Univers</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div><span className="text-xs font-bold text-bw-violet uppercase">Lieu & Époque</span><p className="text-sm text-bw-text">{bible.world.setting}</p></div>
                  <div><span className="text-xs font-bold text-bw-violet uppercase">Ambiance</span><p className="text-sm text-bw-text">{bible.world.atmosphere}</p></div>
                  {bible.world.rules && <div><span className="text-xs font-bold text-bw-violet uppercase">Règles</span><p className="text-sm text-bw-text">{bible.world.rules}</p></div>}
                </CardContent>
              </Card>

              {/* Conflict */}
              <Card className="border-l-4 border-l-bw-danger">
                <CardHeader><CardTitle className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Conflit Central</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-bw-text">{bible.conflict.central}</p>
                  <div className="flex gap-4 text-xs">
                    <div><span className="font-bold text-bw-amber">Enjeux : </span><span className="text-bw-text">{bible.conflict.stakes}</span></div>
                  </div>
                  <p className="text-xs text-bw-muted">{bible.conflict.antagonist}</p>
                </CardContent>
              </Card>

              {/* Structure */}
              <Card>
                <CardHeader><CardTitle className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Structure en 3 Actes</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(["act1", "act2", "act3"] as const).map((act, i) => (
                      <div key={act} className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-bw-violet/10 border border-bw-violet/20 flex items-center justify-center text-xs font-bold text-bw-violet">{i + 1}</div>
                        <div><p className="text-xs font-bold text-bw-muted uppercase mb-0.5">{i === 0 ? "Exposition" : i === 1 ? "Confrontation" : "Résolution"}</p><p className="text-sm text-bw-text">{bible.structure[act]}</p></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Style & Themes */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Style</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div><span className="text-xs font-bold text-bw-violet uppercase">Genre</span><p className="text-sm text-bw-text">{bible.style.genre}</p></div>
                    <div><span className="text-xs font-bold text-bw-violet uppercase">Ton</span><p className="text-sm text-bw-text">{bible.style.tone}</p></div>
                    <div><span className="text-xs font-bold text-bw-violet uppercase">Identité visuelle</span><p className="text-sm text-bw-text">{bible.style.visualIdentity}</p></div>
                    {bible.style.influences && bible.style.influences.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-bw-violet uppercase">Influences</span>
                        <div className="flex flex-wrap gap-1 mt-1">{bible.style.influences.map((inf, i) => <Badge key={i} variant="secondary" className="text-xs">{inf}</Badge>)}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Thèmes</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">{bible.themes?.map((t, i) => <Badge key={i} variant="teal" className="text-xs">{t}</Badge>)}</div>
                  </CardContent>
                </Card>
              </div>

              {bibleProvider && (
                <p className="text-xs text-bw-muted text-right">Généré par {bibleProvider === "fallback" ? "algorithme" : bibleProvider}</p>
              )}
            </div>
          )}
        </div>

        {/* Festival & Palmarès */}
        <FestivalPalmares sessionId={sessionId} />

        {/* Session comparison */}
        <SessionComparison sessionId={sessionId} />

        {/* Raw markdown preview */}
        <details className="group">
          <summary className="text-sm text-bw-muted cursor-pointer hover:text-bw-ink transition-colors">
            Voir le Markdown brut &#9656;
          </summary>
          <pre className="mt-3 bg-bw-surface rounded-xl p-4 text-sm text-bw-placeholder overflow-x-auto whitespace-pre-wrap border border-bw-border">
            {exportData.markdown}
          </pre>
        </details>
    </PageShell>
  );
}
