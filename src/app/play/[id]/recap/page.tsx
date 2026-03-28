"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { CATEGORY_COLORS } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { BrandLogo } from "@/components/brand-logo";

interface StoryChoice {
  id: string;
  category: string;
  restitutionLabel: string;
  chosenText: string;
  isMine: boolean;
}

interface MyResponse {
  id: string;
  situationId: string;
  text: string;
}

interface MyPitch {
  objectif: string;
  obstacle: string;
  pitchText: string;
  chronoSeconds: number | null;
  prenom: string;
  trait: string | null;
}

interface RecapData {
  session: { id: string; title: string; status: string };
  story: StoryChoice[];
  myResponses: MyResponse[];
  myChosenCount: number;
  totalChoices: number;
  myPitch?: MyPitch | null;
}

type TabId = "film" | "contributions" | "pitch";

export default function RecapPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center bg-bw-bg"><div className="w-8 h-8 border-2 border-bw-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <RecapPageInner />
    </Suspense>
  );
}

function RecapPageInner() {
  const { id: sessionId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const shareToken = searchParams.get("share");
  const [data, setData] = useState<RecapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("film");
  const [revealedCount, setRevealedCount] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);

  useEffect(() => {
    // If share token present, use public share endpoint
    if (shareToken) {
      setIsSharedView(true);
      fetch(`/api/sessions/${sessionId}/recap/share?token=${shareToken}`)
        .then((r) => r.ok ? r.json() : null)
        .then((d) => { if (d) setData(d); })
        .catch(() => {})
        .finally(() => setLoading(false));
      return;
    }

    let studentId: string | null = null;
    try {
      const stored = localStorage.getItem(`bw-student-${sessionId}`);
      if (stored) {
        studentId = JSON.parse(stored).studentId;
      }
    } catch { /* no student */ }

    const params = studentId ? `?studentId=${studentId}` : "";
    // Try authenticated recap first (facilitator), fallback to student-public endpoint
    fetch(`/api/sessions/${sessionId}/recap${params}`)
      .then((r) => {
        if (r.ok) return r.json();
        // Fallback to public student recap if auth fails (student view)
        return fetch(`/api/sessions/${sessionId}/recap-student${params}`).then((r2) =>
          r2.ok ? r2.json().then((d) => ({
            session: { id: sessionId, title: d.sessionTitle, status: "done" },
            story: d.story.map((s: { category: string; restitutionLabel: string; chosenText: string; isMine: boolean }, i: number) => ({ id: String(i), ...s })),
            myResponses: [],
            myChosenCount: d.myChosenCount,
            totalChoices: d.totalChoices,
          })) : null
        );
      })
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId, shareToken]);

  const handleShare = useCallback(async () => {
    let studentId: string | null = null;
    try {
      const stored = localStorage.getItem(`bw-student-${sessionId}`);
      if (stored) studentId = JSON.parse(stored).studentId;
    } catch { /* */ }
    if (!studentId) {
      toast.error("Impossible de partager sans identification");
      return;
    }
    setSharing(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/recap/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const json = await res.json();
      if (json.shareToken) {
        const url = `${window.location.origin}/play/${sessionId}/recap?share=${json.shareToken}`;
        await navigator.clipboard.writeText(url);
        toast.success("Lien copie dans le presse-papiers !");
      } else {
        toast.error("Erreur lors du partage");
      }
    } catch {
      toast.error("Erreur reseau");
    } finally {
      setSharing(false);
    }
  }, [sessionId]);

  // Progressive reveal of story choices
  useEffect(() => {
    if (!data?.story.length || tab !== "film") return;
    if (revealedCount >= data.story.length) return;

    const timer = setTimeout(() => {
      setRevealedCount((prev) => prev + 1);
    }, 600);
    return () => clearTimeout(timer);
  }, [data?.story.length, revealedCount, tab]);

  // Reset reveal when switching to film tab
  useEffect(() => {
    if (tab === "film") setRevealedCount(0);
  }, [tab]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bw-bg">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-bw-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-bw-bg gap-4 px-4">
        <p className="text-bw-muted">Recap introuvable</p>
        <a href={ROUTES.play(sessionId)} className="text-bw-primary text-sm">Retour</a>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "film", label: "Le Film" },
    { id: "contributions", label: "Mes idées" },
    ...(data.myPitch ? [{ id: "pitch" as TabId, label: "Mon Pitch" }] : []),
  ];

  return (
    <div className="min-h-dvh bg-bw-bg text-bw-heading">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bw-bg/90 backdrop-blur-md border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center justify-between">
          <a href={isSharedView ? "/" : ROUTES.play(sessionId)} className="text-bw-muted text-xs hover:text-white transition-colors">
            &larr; {isSharedView ? "Accueil" : "Retour"}
          </a>
          <span className="font-cinema text-base tracking-[0.15em] uppercase">
            <BrandLogo />
          </span>
          {!isSharedView ? (
            <button
              onClick={handleShare}
              disabled={sharing}
              className="flex items-center gap-1.5 text-xs text-bw-muted hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Partager mon recap"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              {sharing ? "..." : "Partager"}
            </button>
          ) : (
            <div className="w-12" />
          )}
        </div>
        {/* Tabs */}
        <div className="flex px-4 gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 text-xs font-medium text-center rounded-t-lg transition-colors cursor-pointer ${
                tab === t.id
                  ? "text-white bg-white/[0.05] border-b-2 border-bw-primary"
                  : "text-bw-muted hover:text-bw-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-4 sm:py-6 max-w-sm sm:max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {tab === "film" ? (
            <FilmVivant key="film" story={data.story} revealedCount={revealedCount} title={data.session.title} />
          ) : tab === "pitch" && data.myPitch ? (
            <PitchRecap key="pitch" pitch={data.myPitch} />
          ) : (
            <Contributions
              key="contributions"
              myResponses={data.myResponses}
              story={data.story}
              myChosenCount={data.myChosenCount}
              totalChoices={data.totalChoices}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ——— Film Vivant — progressive story reveal ———
function FilmVivant({
  story,
  revealedCount,
  title,
}: {
  story: StoryChoice[];
  revealedCount: number;
  title: string;
}) {
  if (story.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <p className="text-bw-muted">L&apos;histoire n&apos;a pas encore commence...</p>
      </motion.div>
    );
  }

  // Group by category for visual sections
  let currentCategory = "";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      {/* Title card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6 space-y-3"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bw-primary to-bw-violet mx-auto flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <rect x="2" y="2" width="20" height="20" rx="2.18" />
            <path d="M7 2v20M17 2v20M2 12h20" />
          </svg>
        </div>
        <h1 className="text-xl font-bold">{title || "Notre Film"}</h1>
        <p className="text-xs text-bw-muted">L&apos;histoire ecrite par la classe</p>
      </motion.div>

      {/* Story choices — progressive reveal */}
      {story.slice(0, revealedCount).map((choice, i) => {
        const color = CATEGORY_COLORS[choice.category] || "#FF6B35";
        const showCategoryHeader = choice.category !== currentCategory;
        currentCategory = choice.category;

        return (
          <div key={choice.id}>
            {showCategoryHeader && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mt-6 mb-2"
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
                  {choice.restitutionLabel || choice.category}
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: `${color}20` }} />
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
              className={`relative rounded-xl p-4 border ${
                choice.isMine
                  ? "bg-bw-amber/5 border-bw-amber/30"
                  : "bg-bw-elevated border-white/[0.06]"
              }`}
            >
              {choice.isMine && (
                <span className="absolute -top-2 right-3 text-xs font-bold text-bw-amber bg-bw-amber/20 px-2 py-0.5 rounded-full">
                  Ton idee
                </span>
              )}
              <p className="text-sm leading-relaxed">{choice.chosenText}</p>
            </motion.div>
          </div>
        );
      })}

      {/* Still revealing indicator */}
      {revealedCount < story.length && (
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex justify-center gap-1 py-4"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
              className="w-1.5 h-1.5 rounded-full bg-bw-primary"
            />
          ))}
        </motion.div>
      )}

      {/* All revealed */}
      {revealedCount >= story.length && story.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8 space-y-2"
        >
          <p className="text-sm font-medium text-bw-violet">Fin</p>
          <p className="text-xs text-bw-muted">{story.length} choix collectifs</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ——— Pitch Recap — student's M10 pitch ———
function PitchRecap({ pitch }: { pitch: MyPitch }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="text-center">
        <span className="text-3xl">🎬</span>
        <h3 className="text-lg font-cinema tracking-wider mt-2">Mon Pitch</h3>
      </div>

      {/* Character card */}
      <div className="bg-bw-elevated rounded-xl p-4 border border-bw-amber/20 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎭</span>
          <div>
            <p className="text-base font-medium text-bw-heading">{pitch.prenom}</p>
            {pitch.trait && <p className="text-xs text-bw-muted">{pitch.trait}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 text-xs rounded-lg bg-bw-amber/10 border border-bw-amber/20 text-bw-amber">
            Objectif : {pitch.objectif}
          </span>
          <span className="px-2 py-1 text-xs rounded-lg bg-bw-danger/10 border border-bw-danger/20 text-bw-danger">
            Obstacle : {pitch.obstacle}
          </span>
        </div>
      </div>

      {/* Pitch text */}
      <div className="bg-bw-elevated rounded-xl p-4 border border-white/[0.06]">
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-bw-heading">{pitch.pitchText}</p>
      </div>

      {/* Chrono result */}
      {pitch.chronoSeconds != null && (
        <div className="bg-bw-elevated rounded-xl p-4 border border-white/[0.06] text-center">
          <p className="text-xs text-bw-muted uppercase tracking-wider mb-1">Chrono oral</p>
          <p className="text-2xl font-bold tabular-nums text-bw-heading">{pitch.chronoSeconds}s</p>
          <p className="text-xs text-bw-muted mt-1">
            {pitch.chronoSeconds <= 30 ? "Dans le temps !" : "Un peu long, mais l'essentiel est dit."}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ——— Contributions — student's personal recap ———
function Contributions({
  myResponses,
  story,
  myChosenCount,
  totalChoices,
}: {
  myResponses: MyResponse[];
  story: StoryChoice[];
  myChosenCount: number;
  totalChoices: number;
}) {
  if (myResponses.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <p className="text-bw-muted">Aucune contribution trouvee</p>
      </motion.div>
    );
  }

  // Find which of my responses were chosen
  const chosenSituationIds = new Set(
    story.filter((c) => c.isMine).map((c) => {
      // map back to situationId — we don't have it directly, so use myResponses
      const match = myResponses.find((r) => r.text === c.chosenText);
      return match?.situationId;
    }).filter(Boolean)
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
      {/* Stats header */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-bw-elevated rounded-xl p-3 text-center border border-white/[0.06]">
          <p className="text-2xl font-bold text-bw-primary">{myResponses.length}</p>
          <p className="text-xs text-bw-muted mt-0.5">Reponses</p>
        </div>
        <div className="bg-bw-elevated rounded-xl p-3 text-center border border-white/[0.06]">
          <p className="text-2xl font-bold text-bw-amber">{myChosenCount}</p>
          <p className="text-xs text-bw-muted mt-0.5">Retenues</p>
        </div>
        <div className="bg-bw-elevated rounded-xl p-3 text-center border border-white/[0.06]">
          <p className="text-2xl font-bold text-bw-teal">
            {totalChoices > 0 ? Math.round((myChosenCount / totalChoices) * 100) : 0}%
          </p>
          <p className="text-xs text-bw-muted mt-0.5">Impact</p>
        </div>
      </div>

      {/* Response list */}
      <div className="space-y-3">
        {myResponses.map((resp, i) => {
          const wasChosen = chosenSituationIds.has(resp.situationId);
          return (
            <motion.div
              key={resp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl p-4 border ${
                wasChosen
                  ? "bg-bw-amber/5 border-bw-amber/30"
                  : "bg-bw-elevated border-white/[0.06]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm leading-relaxed flex-1">{resp.text}</p>
                {wasChosen && (
                  <span className="text-xs font-bold text-bw-amber bg-bw-amber/20 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                    Retenue
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
