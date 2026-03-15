"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { OIEScores } from "@/lib/oie-profile";
import type { PosterChoice, PosterStudent } from "@/components/film-poster";
import type { FilmData } from "@/app/api/sessions/[id]/film/route";
import { CATEGORY_LABELS } from "@/lib/constants";

// ── Types ──

export interface ExportData {
  markdown: string;
  session: { title: string; level: string; date: string };
  choicesCount: number;
  studentsCount: number;
}

export interface FeedbackData {
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

export interface BilanData {
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

export interface FicheData {
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

export interface BibleData {
  logline: string;
  synopsis: string;
  characters: { name: string; role: string; description: string; arc: string }[];
  world: { setting: string; atmosphere: string; rules: string };
  conflict: { central: string; stakes: string; antagonist: string };
  structure: { act1: string; act2: string; act3: string };
  style: { genre: string; tone: string; influences: string[]; visualIdentity: string };
  themes: string[];
}

export interface M10Pitch {
  id: string;
  student_id: string;
  objectif: string;
  obstacle: string;
  pitch_text: string;
  chrono_seconds: number | null;
  students: { display_name: string; avatar: string } | null;
  module10_personnages: { prenom: string; avatar_data: Record<string, unknown> | null } | null;
}

export interface ReplayData {
  events: { id: string; event_type: string; student_id: string | null; situation_id: string | null; payload: Record<string, unknown>; occurred_at: string; offsetMs: number; seq: number }[];
  totalDurationMs: number;
  students: { id: string; display_name: string; avatar: string }[];
  responses: { id: string; student_id: string; situation_id: string; text: string; response_time_ms: number | null; ai_score: number | null; is_highlighted: boolean; submitted_at: string }[];
}

// ── Hook ──

export function useResultsData(sessionId: string) {
  // ── Eager queries ──

  const exportQuery = useQuery<ExportData>({
    queryKey: ["export", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/export`);
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  const budgetQuery = useQuery({
    queryKey: ["budgets", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/budget`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const pitchQuery = useQuery<{ pitchs: M10Pitch[]; count: number }>({
    queryKey: ["m10-pitchs", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/pitch`);
      if (!res.ok) return { pitchs: [], count: 0 };
      return res.json();
    },
  });

  const feedbackQuery = useQuery<FeedbackData | null>({
    queryKey: ["feedback", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/feedback`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const oieQuery = useQuery<{ scores: Record<string, OIEScores> }>({
    queryKey: ["oie-profile", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/oie-profile`);
      if (!res.ok) return { scores: {} };
      return res.json();
    },
  });

  const sessionDetailQuery = useQuery<{ template?: string | null }>({
    queryKey: ["session-detail", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) return {};
      return res.json();
    },
  });

  // ── Replay (eager for timeline, toggle for full player) ──
  const [showReplay, setShowReplay] = useState(false);
  const replayQuery = useQuery<ReplayData>({
    queryKey: ["replay", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/replay`);
      if (!res.ok) return { events: [], totalDurationMs: 0, students: [], responses: [] };
      return res.json();
    },
  });

  // ── Film data ──
  const filmQuery = useQuery<FilmData>({
    queryKey: ["film", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/film`);
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  // ── Lazy AI content ──
  const [bilan, setBilan] = useState<BilanData | null>(null);
  const [bilanLoading, setBilanLoading] = useState(false);
  const [bilanProvider, setBilanProvider] = useState<string | null>(null);

  const [fiche, setFiche] = useState<FicheData | null>(null);
  const [ficheLoading, setFicheLoading] = useState(false);
  const [ficheProvider, setFicheProvider] = useState<string | null>(null);

  const [bible, setBible] = useState<BibleData | null>(null);
  const [bibleLoading, setBibleLoading] = useState(false);
  const [bibleProvider, setBibleProvider] = useState<string | null>(null);

  // Load cached AI content on mount — with AbortController to prevent memory leaks
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetch(`/api/sessions/${sessionId}/bilan`, { signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.bilan) { setBilan(data.bilan); setBilanProvider(data.provider); } })
      .catch(() => {});

    fetch(`/api/sessions/${sessionId}/fiche-cours`, { signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.fiche) { setFiche(data.fiche); setFicheProvider(data.provider); } })
      .catch(() => {});

    fetch(`/api/sessions/${sessionId}/bible`, { signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.bible) { setBible(data.bible); setBibleProvider(data.provider); } })
      .catch(() => {});

    return () => controller.abort();
  }, [sessionId]);

  // ── Generators ──

  const generateBilan = useCallback(async () => {
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

  const generateFiche = useCallback(async () => {
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

  const generateBible = useCallback(async (force = false) => {
    setBibleLoading(true);
    try {
      const url = force
        ? `/api/sessions/${sessionId}/bible?force=true`
        : `/api/sessions/${sessionId}/bible`;
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur");
      }
      const data = await res.json();
      if (data?.bible) {
        setBible(data.bible);
        setBibleProvider(data.provider);
        toast.success("Bible du film générée !");
      }
    } catch {
      toast.error("Erreur lors de la génération");
    } finally {
      setBibleLoading(false);
    }
  }, [sessionId]);

  // ── Derived data ──

  const posterData = useMemo(() => {
    const exp = exportQuery.data;
    if (!exp) return null;
    const choiceLines = exp.markdown.split("\n").filter((l) => l.startsWith("- **"));
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

    const students: PosterStudent[] = (feedbackQuery.data?.students || []).map((s) => ({
      displayName: s.name,
      avatar: s.avatar,
    }));

    return { choices, students };
  }, [exportQuery.data, feedbackQuery.data]);

  // ── Exports ──

  const handleCopyMarkdown = useCallback(() => {
    if (!exportQuery.data) return;
    navigator.clipboard.writeText(exportQuery.data.markdown);
    toast.success("Copié dans le presse-papier !");
  }, [exportQuery.data]);

  const handleDownloadMarkdown = useCallback(() => {
    const exp = exportQuery.data;
    if (!exp) return;
    downloadFile(
      exp.markdown,
      `${exp.session.title.replace(/\s+/g, "-")}-histoire.md`,
      "text/markdown"
    );
  }, [exportQuery.data]);

  const handleExportCsv = useCallback(() => {
    const fb = feedbackQuery.data;
    const exp = exportQuery.data;
    if (!fb) return;
    const headers = ["Eleve", "Avatar", "Reponses", "Longueur moy.", "Choisi(e)s"];
    const rows = fb.students.map((s) => [
      s.name,
      s.avatar,
      String(s.responses),
      String(s.avgLength),
      String(s.chosenCount),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    downloadFile(
      "\uFEFF" + csv,
      `${exp?.session.title.replace(/\s+/g, "-") || "session"}-eleves.csv`,
      "text/csv;charset=utf-8"
    );
    toast.success("CSV exporté !");
  }, [feedbackQuery.data, exportQuery.data]);

  const handlePrintPdf = useCallback(() => {
    window.print();
  }, []);

  const handleShareSummary = useCallback(() => {
    const exp = exportQuery.data;
    const fb = feedbackQuery.data;
    if (!exp) return;

    const lines: string[] = [];
    lines.push(`# ${exp.session.title}`);
    lines.push(`*${exp.session.date} - ${exp.session.level}*`);
    lines.push("");

    // KPIs
    lines.push("## Chiffres cles");
    lines.push(`- ${exp.studentsCount} eleve${exp.studentsCount !== 1 ? "s" : ""}`);
    lines.push(`- ${fb?.stats.totalResponses ?? exp.choicesCount} reponse${(fb?.stats.totalResponses ?? exp.choicesCount) !== 1 ? "s" : ""}`);
    if (fb) {
      lines.push(`- ${fb.stats.participationRate}% de participation`);
      lines.push(`- Score global : ${fb.overallScore}%`);
    }
    lines.push("");

    // Competencies
    if (fb && fb.competencies.length > 0) {
      lines.push("## Competences");
      for (const c of fb.competencies) {
        lines.push(`- **${c.label}** : ${c.score}% (${c.detail})`);
      }
      lines.push("");
    }

    // Group profile
    if (fb) {
      lines.push("## Profil du groupe");
      lines.push(fb.groupProfile);
      lines.push("");
      if (fb.strengths) lines.push(`Point fort : ${fb.strengths.detail}`);
      if (fb.weakness) lines.push(`Axe de progression : ${fb.weakness.detail}`);
      lines.push("");
    }

    // Top students
    if (fb && fb.students.length > 0) {
      lines.push("## Top contributeurs");
      for (const s of fb.students.slice(0, 5)) {
        lines.push(`- ${s.name} : ${s.responses} rep., ${s.chosenCount} choix retenu${s.chosenCount !== 1 ? "s" : ""}`);
      }
      lines.push("");
    }

    lines.push("---");
    lines.push("*Genere avec Banlieuwood*");

    const summary = lines.join("\n");
    navigator.clipboard.writeText(summary);
    toast.success("Resume copie dans le presse-papier !");
  }, [exportQuery.data, feedbackQuery.data]);

  return {
    // Eager data
    exportData: exportQuery.data ?? null,
    isLoading: exportQuery.isLoading,
    isError: exportQuery.isError,
    budgetData: budgetQuery.data ?? null,
    pitchData: pitchQuery.data ?? null,
    feedback: feedbackQuery.data ?? null,
    oieData: oieData(oieQuery),
    sessionDetail: sessionDetailQuery.data ?? null,
    posterData,
    filmData: filmQuery.data ?? null,

    // Replay
    showReplay,
    setShowReplay,
    replayData: replayQuery.data ?? null,

    // AI lazy
    bilan,
    bilanLoading,
    bilanProvider,
    generateBilan,
    fiche,
    ficheLoading,
    ficheProvider,
    generateFiche,
    bible,
    bibleLoading,
    bibleProvider,
    generateBible,

    // Exports
    handleCopyMarkdown,
    handleDownloadMarkdown,
    handleExportCsv,
    handlePrintPdf,
    handleShareSummary,
  };
}

// ── Helpers ──

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function oieData(query: { data?: { scores: Record<string, OIEScores> } }) {
  return query.data ?? { scores: {} };
}
