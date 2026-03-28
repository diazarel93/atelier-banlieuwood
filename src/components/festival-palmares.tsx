"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";

/* ── Types ── */

interface StudentAward {
  name: string;
  avatar: string;
  value: number;
  label: string;
}

interface Trophy {
  id: string;
  title: string;
  emoji: string;
  gradient: string;
  borderColor: string;
  winner: StudentAward | null;
  runnerUp: StudentAward | null;
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
  students: {
    id: string;
    name: string;
    avatar: string;
    responses: number;
    avgLength: number;
    chosenCount: number;
  }[];
  overallScore: number;
}

/* ── Component ── */

export function FestivalPalmares({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false);

  const { data: feedback } = useQuery<FeedbackData>({
    queryKey: ["feedback", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/feedback`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const trophies = useMemo<Trophy[]>(() => {
    if (!feedback?.students?.length) return [];

    const students = [...feedback.students];

    // 1. Meilleure Participation — most responses
    const byResponses = students.filter((s) => s.responses > 0).sort((a, b) => b.responses - a.responses);
    const participation: Trophy = {
      id: "participation",
      title: "Prix de la Participation",
      emoji: "\uD83C\uDFC6",
      gradient: "from-bw-gold/20 to-bw-amber/10",
      borderColor: "rgba(212,168,67,0.3)",
      winner: byResponses[0]
        ? {
            name: byResponses[0].name,
            avatar: byResponses[0].avatar,
            value: byResponses[0].responses,
            label: `${byResponses[0].responses} réponses`,
          }
        : null,
      runnerUp: byResponses[1]
        ? {
            name: byResponses[1].name,
            avatar: byResponses[1].avatar,
            value: byResponses[1].responses,
            label: `${byResponses[1].responses} réponses`,
          }
        : null,
    };

    // 2. Plume d'Or — longest avg response (most depth)
    const byDepth = students.filter((s) => s.avgLength > 0).sort((a, b) => b.avgLength - a.avgLength);
    const plume: Trophy = {
      id: "plume",
      title: "Plume d'Or",
      emoji: "\u270D\uFE0F",
      gradient: "from-bw-violet/20 to-bw-primary/10",
      borderColor: "rgba(139,92,246,0.3)",
      winner: byDepth[0]
        ? {
            name: byDepth[0].name,
            avatar: byDepth[0].avatar,
            value: byDepth[0].avgLength,
            label: `${byDepth[0].avgLength} car. moy.`,
          }
        : null,
      runnerUp: byDepth[1]
        ? {
            name: byDepth[1].name,
            avatar: byDepth[1].avatar,
            value: byDepth[1].avgLength,
            label: `${byDepth[1].avgLength} car. moy.`,
          }
        : null,
    };

    // 3. Prix du Public — most times chosen in collective vote
    const byChosen = students.filter((s) => s.chosenCount > 0).sort((a, b) => b.chosenCount - a.chosenCount);
    const publicPrix: Trophy = {
      id: "public",
      title: "Prix du Public",
      emoji: "\uD83C\uDF1F",
      gradient: "from-bw-teal/20 to-bw-green/10",
      borderColor: "rgba(78,205,196,0.3)",
      winner: byChosen[0]
        ? {
            name: byChosen[0].name,
            avatar: byChosen[0].avatar,
            value: byChosen[0].chosenCount,
            label: `${byChosen[0].chosenCount}× choisi(e)`,
          }
        : null,
      runnerUp: byChosen[1]
        ? {
            name: byChosen[1].name,
            avatar: byChosen[1].avatar,
            value: byChosen[1].chosenCount,
            label: `${byChosen[1].chosenCount}× choisi(e)`,
          }
        : null,
    };

    // 4. Grand Prix — composite score (participation + depth + chosen)
    const scored = students
      .map((s) => {
        const maxResp = byResponses[0]?.responses || 1;
        const maxLen = byDepth[0]?.avgLength || 1;
        const maxChosen = byChosen[0]?.chosenCount || 1;
        const composite =
          (s.responses / maxResp) * 0.3 + (s.avgLength / maxLen) * 0.3 + (s.chosenCount / maxChosen) * 0.4;
        return { ...s, composite };
      })
      .sort((a, b) => b.composite - a.composite);

    const grandPrix: Trophy = {
      id: "grand-prix",
      title: "Grand Prix du Festival",
      emoji: "\uD83C\uDF96\uFE0F",
      gradient: "from-bw-primary/25 to-bw-gold/15",
      borderColor: "rgba(255,107,53,0.35)",
      winner: scored[0]
        ? {
            name: scored[0].name,
            avatar: scored[0].avatar,
            value: Math.round(scored[0].composite * 100),
            label: "Score composite",
          }
        : null,
      runnerUp: scored[1]
        ? {
            name: scored[1].name,
            avatar: scored[1].avatar,
            value: Math.round(scored[1].composite * 100),
            label: "Score composite",
          }
        : null,
    };

    return [grandPrix, participation, plume, publicPrix].filter((t) => t.winner !== null);
  }, [feedback]);

  if (!feedback?.students?.length || trophies.length === 0) return null;

  return (
    <div className="space-y-4" id="section-festival">
      <div>
        <h2 className="font-cinema text-xl tracking-wide uppercase text-bw-ink scroll-mt-16">
          Festival &amp; Palmar&egrave;s
        </h2>
        <div className="w-12 h-0.5 mt-1 bg-gradient-to-r from-bw-gold to-bw-primary rounded-full" />
      </div>

      {/* Trophy grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {trophies.map((trophy, i) => (
          <motion.div
            key={trophy.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <TrophyCard trophy={trophy} rank={i + 1} />
          </motion.div>
        ))}
      </div>

      {/* Session comparison — festival mode */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="group flex items-center gap-2.5 cursor-pointer transition-colors mt-2"
      >
        <div className="w-[3px] h-5 rounded-full bg-gradient-to-b from-bw-gold to-bw-primary" />
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-bw-muted group-hover:text-white transition-colors">
          Comparer les sessions
        </h3>
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-bw-muted"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <ComparisonFestival sessionId={sessionId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Trophy Card ── */

function TrophyCard({ trophy, rank }: { trophy: Trophy; rank: number }) {
  const isGrandPrix = trophy.id === "grand-prix";

  return (
    <div
      className={`relative rounded-xl p-4 overflow-hidden bg-gradient-to-br ${trophy.gradient}`}
      style={{ border: `1px solid ${trophy.borderColor}` }}
    >
      {/* Shimmer for Grand Prix */}
      {isGrandPrix && (
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)" }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />
      )}

      <div className="relative z-10 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <span className={`text-2xl ${isGrandPrix ? "animate-pulse" : ""}`}>{trophy.emoji}</span>
          <div>
            <p className="text-xs uppercase tracking-widest text-bw-muted font-semibold">
              {isGrandPrix ? "Grand Prix" : `Prix #${rank}`}
            </p>
            <p className="text-sm font-bold text-white">{trophy.title}</p>
          </div>
        </div>

        {/* Winner */}
        {trophy.winner && (
          <div
            className="flex items-center gap-3 rounded-lg px-3 py-2.5"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <span className="text-xl">{"\uD83E\uDD47"}</span>
            <span className="text-lg">{trophy.winner.avatar}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{trophy.winner.name}</p>
              <p className="text-xs text-bw-muted">{trophy.winner.label}</p>
            </div>
          </div>
        )}

        {/* Runner-up */}
        {trophy.runnerUp && (
          <div
            className="flex items-center gap-3 rounded-lg px-3 py-2 opacity-70"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <span className="text-base">{"\uD83E\uDD48"}</span>
            <span className="text-base">{trophy.runnerUp.avatar}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-bw-text truncate">{trophy.runnerUp.name}</p>
              <p className="text-xs text-bw-muted">{trophy.runnerUp.label}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Comparison Festival ── */

interface CompareData {
  current: { id: string; title: string; level: string; template: string | null; module: number };
  currentChoices: { category: string; chosen_text: string; restitution_label: string | null }[];
  similar: {
    session: { id: string; title: string; studentCount: number; createdAt: string };
    choices: { category: string; chosen_text: string; restitution_label: string | null }[];
  }[];
}

function ComparisonFestival({ sessionId }: { sessionId: string }) {
  const { data, isLoading } = useQuery<CompareData>({
    queryKey: ["session-compare", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/compare`);
      if (!res.ok) return { current: null, currentChoices: [], similar: [] };
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="py-4 space-y-3 animate-pulse">
        <div className="h-10 rounded-xl bg-white/[0.03]" />
        <div className="h-24 rounded-xl bg-white/[0.03]" />
      </div>
    );
  }

  if (!data?.similar?.length) {
    return (
      <p className="py-4 text-[12px] text-bw-muted">
        Pas encore d&apos;autres sessions &agrave; comparer. Le festival commence avec 2+ sessions !
      </p>
    );
  }

  // Compute "match score" for each similar session
  const currentTexts = new Set(data.currentChoices.map((c) => c.chosen_text));
  const ranked = data.similar
    .map((s) => {
      const matches = s.choices.filter((c) => currentTexts.has(c.chosen_text)).length;
      const total = Math.max(data.currentChoices.length, s.choices.length, 1);
      const matchPct = Math.round((matches / total) * 100);
      return { ...s, matches, matchPct };
    })
    .sort((a, b) => b.matchPct - a.matchPct);

  return (
    <div className="py-2 space-y-3">
      <p className="text-xs uppercase tracking-widest text-bw-muted font-semibold">
        Sessions similaires ({ranked.length})
      </p>
      {ranked.map((s, i) => (
        <motion.div
          key={s.session.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Medal */}
          <span className="text-lg flex-shrink-0">
            {i === 0 ? "\uD83E\uDD47" : i === 1 ? "\uD83E\uDD48" : i === 2 ? "\uD83E\uDD49" : "\uD83C\uDFAC"}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{s.session.title}</p>
            <p className="text-xs text-bw-muted">
              {s.session.studentCount} &eacute;l&egrave;ves &middot;{" "}
              {new Date(s.session.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </p>
          </div>

          {/* Match percentage */}
          <div className="flex-shrink-0 text-right">
            <p
              className={`text-sm font-bold ${s.matchPct > 60 ? "text-bw-teal" : s.matchPct > 30 ? "text-bw-gold" : "text-bw-muted"}`}
            >
              {s.matchPct}%
            </p>
            <p className="text-xs text-bw-muted">similitude</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
