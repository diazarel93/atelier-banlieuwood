"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { CATEGORY_COLORS } from "@/lib/constants";
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

interface RecapData {
  session: { id: string; title: string; status: string };
  story: StoryChoice[];
  myResponses: MyResponse[];
  myChosenCount: number;
  totalChoices: number;
}

type TabId = "film" | "contributions";

export default function RecapPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const [data, setData] = useState<RecapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("film");
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    let studentId: string | null = null;
    try {
      const stored = localStorage.getItem(`bw-student-${sessionId}`);
      if (stored) {
        studentId = JSON.parse(stored).studentId;
      }
    } catch { /* no student */ }

    const params = studentId ? `?studentId=${studentId}` : "";
    fetch(`/api/sessions/${sessionId}/recap${params}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
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
        <a href={`/play/${sessionId}`} className="text-bw-primary text-sm">Retour</a>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "film", label: "Le Film" },
    { id: "contributions", label: "Mes idees" },
  ];

  return (
    <div className="min-h-dvh bg-bw-bg text-bw-heading">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bw-bg/90 backdrop-blur-md border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center justify-between">
          <a href={`/play/${sessionId}`} className="text-bw-muted text-xs hover:text-white transition-colors">
            &larr; Retour
          </a>
          <span className="font-cinema text-base tracking-[0.15em] uppercase">
            <BrandLogo />
          </span>
          <div className="w-12" />
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
      <div className="px-4 py-6 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {tab === "film" ? (
            <FilmVivant key="film" story={data.story} revealedCount={revealedCount} title={data.session.title} />
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
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
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
                <span className="absolute -top-2 right-3 text-[9px] font-bold text-bw-amber bg-bw-amber/20 px-2 py-0.5 rounded-full">
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
          <p className="text-[10px] text-bw-muted mt-0.5">Reponses</p>
        </div>
        <div className="bg-bw-elevated rounded-xl p-3 text-center border border-white/[0.06]">
          <p className="text-2xl font-bold text-bw-amber">{myChosenCount}</p>
          <p className="text-[10px] text-bw-muted mt-0.5">Retenues</p>
        </div>
        <div className="bg-bw-elevated rounded-xl p-3 text-center border border-white/[0.06]">
          <p className="text-2xl font-bold text-bw-teal">
            {totalChoices > 0 ? Math.round((myChosenCount / totalChoices) * 100) : 0}%
          </p>
          <p className="text-[10px] text-bw-muted mt-0.5">Impact</p>
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
                  <span className="text-[9px] font-bold text-bw-amber bg-bw-amber/20 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
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
