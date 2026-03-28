"use client";

// REFACTOR PLAN: This file is 2090 lines. Consider extracting:
//
// 1. Module-specific screen sections (the <main> block, lines 334-2027):
//    The main content is a single giant AnimatePresence with conditional branches
//    per module and status. Extract per-module screen components:
//
//    a. ScreenInitialJoin → src/components/screen/screen-initial-join.tsx (~80 lines)
//       Waiting state with no module selected: clapperboard, join code, QR (lines 337-412).
//
//    b. ScreenModule1 → src/components/screen/screen-module1.tsx (~350 lines)
//       M1 waiting/responding/reviewing for positioning, image, notebook (lines 413-680).
//
//    c. ScreenModule9Budget → src/components/screen/screen-module9-budget.tsx (~90 lines)
//       M9 seance 2 budget waiting + responding with budget bars (lines 505-775).
//
//    d. ScreenModule2EC → src/components/screen/screen-module2ec.tsx (~220 lines)
//       M2 EC checklist, scene builder, comparison (lines 776-1063).
//
//    e. ScreenModule10 → src/components/screen/screen-module10.tsx (~340 lines)
//       M10 "Et si..." + Pitch: all etsi/avatar/pitch/chrono/confrontation (lines 1064-1406).
//
//    f. ScreenModule11 → src/components/screen/screen-module11.tsx (~150 lines)
//       M11 Cine-debat: stimulus projection (lines 1407-1555).
//
//    g. ScreenVotingReviewing → src/components/screen/screen-voting-reviewing.tsx (~250 lines)
//       Voting results, reviewing states, collective choice celebration (lines 1556-1908).
//
//    h. ScreenDonePaused → src/components/screen/screen-done-paused.tsx (~100 lines)
//       Paused + Done cinema celebration (lines 1909-2027).
//
// 2. useScreenData (hook) → src/hooks/use-screen-data.ts (~200 lines)
//    All derived state logic: module flags, situation parsing, M10/M11 data (lines 50-300).
//
// Estimated total reduction: ~1600 lines extracted, leaving ~490 lines in this file.
// Priority: Extract per-module screen components first (natural boundaries, self-contained).

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useSessionPolling, Module10Data, Module11Data } from "@/hooks/use-session-polling";
import { useRealtimeInvalidation, getPollingInterval } from "@/hooks/use-realtime-invalidation";
import { useQuery } from "@tanstack/react-query";
import {
  CATEGORY_COLORS,
  TEMPLATE_LABELS,
  MODULE_SEANCE_SITUATIONS,
  PRODUCTION_CATEGORIES,
  getSeanceMax,
} from "@/lib/constants";
import dynamic from "next/dynamic";
import { CountdownTimer } from "@/components/countdown-timer";
import { getSeanceIntro } from "@/lib/seance-intros";
import { getModuleByDb } from "@/lib/modules-data";

const QRCodeSVG = dynamic(() => import("qrcode.react").then((mod) => ({ default: mod.QRCodeSVG })), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-white/5 rounded animate-pulse" />,
});

import { PosterGallery } from "@/components/screen/poster-gallery";
import { BroadcastMessageOverlay } from "@/components/screen/broadcast-overlay";
import { AmbientGradients } from "@/components/screen/ambient-gradients";
import { BriefingOverlay } from "@/components/screen/briefing-overlay";
import { QuestionTransitionCelebration } from "@/components/screen/question-transition";
import { StoryFilmstrip } from "@/components/screen/story-filmstrip";
import { HighlightedResponsesPanel } from "@/components/screen/highlighted-panel";
import { ScreenHeader } from "@/components/screen/screen-header";
import { ObjectiveBanner } from "@/components/screen/objective-banner";
import { FloatingReactions } from "@/components/screen/floating-reactions";
import { WordCloud } from "@/components/screen/word-cloud";
import { RevealMode } from "@/components/screen/reveal-mode";
import { useScreenHeartbeat } from "@/hooks/use-screen-connection";
import { ApplauseMeter } from "@/components/screen/applause-meter";
import { ReactionBar } from "@/components/reaction-bar";
import { ErrorBoundary } from "@/components/error-boundary";
import { HelpButton } from "@/components/help-button";
import { SafeImage } from "@/components/safe-image";
import { FlipCounter } from "@/components/screen/flip-counter";
import { TicketReveal } from "@/components/screen/ticket-reveal";
import { SpotlightView } from "@/components/screen/spotlight-view";

interface VoteResult {
  response: { id: string; text: string; students: { display_name: string; avatar: string } };
  count: number;
  voters: { display_name: string; avatar: string; team_name?: string; team_color?: string }[];
}

import type { HighlightedResponse } from "@/components/screen/highlighted-panel";

// PRODUCTION_CATEGORIES imported from constants

export default function ScreenPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  useScreenHeartbeat(); // Send heartbeat to cockpit via BroadcastChannel
  const { status: realtimeStatus } = useRealtimeInvalidation(sessionId);
  const { data, error, refetch } = useSessionPolling(sessionId, null, { skipStudentCheck: true, realtimeStatus });

  // Vote results for projection
  const { data: voteData } = useQuery<{ totalVotes: number; results: VoteResult[] }>({
    queryKey: ["screen-votes", sessionId, data?.situation?.id],
    queryFn: async () => {
      if (!data?.situation?.id) return { totalVotes: 0, results: [] };
      const res = await fetch(`/api/sessions/${sessionId}/votes?situationId=${data.situation.id}`);
      if (!res.ok) return { totalVotes: 0, results: [] };
      return res.json();
    },
    refetchInterval: getPollingInterval(realtimeStatus, 8_000, 30_000),
    staleTime: 3_000,
    enabled: !!data?.situation?.id && (data?.session?.status === "voting" || data?.session?.status === "reviewing"),
  });

  // Highlighted responses — teacher-projected to class screen (current situation only)
  const currentSituationId = data?.situation?.id;
  const { data: highlightedResponses } = useQuery<HighlightedResponse[]>({
    queryKey: ["screen-highlighted", sessionId, currentSituationId],
    queryFn: async () => {
      if (!currentSituationId) return [];
      const res = await fetch(
        `/api/sessions/${sessionId}/responses?situationId=${currentSituationId}&highlighted=true`,
      );
      if (!res.ok) return [];
      return res.json() as Promise<HighlightedResponse[]>;
    },
    refetchInterval: getPollingInterval(realtimeStatus, 8_000, 30_000),
    staleTime: 3_000,
    enabled: !!data?.session && data.session.status !== "done" && !!currentSituationId,
  });

  // Word cloud — staggered: 10s / 35s
  const { data: wordCloudTexts } = useQuery<string[]>({
    queryKey: ["screen-wordcloud", sessionId, currentSituationId],
    queryFn: async () => {
      if (!currentSituationId) return [];
      const res = await fetch(`/api/sessions/${sessionId}/responses?situationId=${currentSituationId}`);
      if (!res.ok) return [];
      const all: { text: string }[] = await res.json();
      return all.map((r) => r.text).filter(Boolean);
    },
    refetchInterval: getPollingInterval(realtimeStatus, 10_000, 35_000),
    staleTime: 4_000,
    refetchOnWindowFocus: true,
    enabled:
      !!data?.session &&
      (data.session.status === "responding" || data?.session?.broadcastMessage === "__SCREEN_MODE:wordcloud") &&
      !!currentSituationId,
  });

  // Reveal mode — staggered: 9s / 30s
  const revealPhase = data?.session?.revealPhase;
  const { data: revealResponses } = useQuery<{ id: string; text: string; studentName: string; avatar: string }[]>({
    queryKey: ["screen-reveal", sessionId, currentSituationId],
    queryFn: async () => {
      if (!currentSituationId) return [];
      const res = await fetch(`/api/sessions/${sessionId}/responses?situationId=${currentSituationId}`);
      if (!res.ok) return [];
      const all: { id: string; text: string; students?: { display_name: string; avatar: string } }[] = await res.json();
      return all.map((r) => ({
        id: r.id,
        text: r.text,
        studentName: r.students?.display_name || "?",
        avatar: r.students?.avatar || "🎭",
      }));
    },
    refetchInterval: getPollingInterval(realtimeStatus, 9_000, 30_000),
    staleTime: 3_000,
    refetchOnWindowFocus: true,
    enabled: !!data?.session && data.session.status === "reviewing" && revealPhase != null && !!currentSituationId,
  });

  // Reaction counts — staggered: 12s / 35s
  const { data: screenReactions } = useQuery<Record<string, Record<string, { count: number; studentIds: string[] }>>>({
    queryKey: ["screen-reactions", sessionId, currentSituationId],
    queryFn: async () => {
      if (!currentSituationId) return {};
      const res = await fetch(`/api/sessions/${sessionId}/reactions?situationId=${currentSituationId}`);
      if (!res.ok) return {};
      const json = await res.json();
      return json.reactions || {};
    },
    refetchInterval: getPollingInterval(realtimeStatus, 12_000, 35_000),
    staleTime: 5_000,
    refetchOnWindowFocus: true,
    enabled:
      !!data?.session && ["voting", "reviewing", "results"].includes(data.session.status) && !!currentSituationId,
  });

  // Broadcast message overlay
  const [broadcastMsg, setBroadcastMsg] = useState<string | null>(null);
  const lastBroadcastAt = useRef<string | null>(null);
  useEffect(() => {
    const msg = data?.session?.broadcastMessage;
    const at = data?.session?.broadcastAt;
    // Handle null/cleared broadcast — always clear overlay
    if (!msg) {
      setBroadcastMsg(null);
      lastBroadcastAt.current = null;
      return;
    }
    if (!at) return;
    if (at === lastBroadcastAt.current) return;
    lastBroadcastAt.current = at;
    setBroadcastMsg(msg);
    // Screen control commands persist until cleared — no auto-dismiss
    const isScreenCommand = msg.startsWith("__SCREEN_MODE:") || msg === "__SCREEN_FROZEN";
    if (!isScreenCommand) {
      const t = setTimeout(() => setBroadcastMsg(null), 12000);
      return () => clearTimeout(t);
    }
  }, [data?.session?.broadcastMessage, data?.session?.broadcastAt]);

  // Parse screen mode from broadcast message (#15)
  const screenModeFromBroadcast = broadcastMsg?.startsWith("__SCREEN_MODE:")
    ? broadcastMsg.replace("__SCREEN_MODE:", "")
    : null;

  // ── Briefing state ──
  const [showBriefing, setShowBriefing] = useState(false);
  const prevModuleKey = useRef<string | null>(null);

  // ── Transition state ──
  const [showTransition, setShowTransition] = useState(false);
  const prevSituationIndex = useRef<number>(-1);
  const [completedQuestion, setCompletedQuestion] = useState(0);

  // ── Done phase state ──
  const [donePhase, setDonePhase] = useState<"clap" | "title" | "credits">("clap");

  // ── Collective choice celebration ──
  const prevChoiceId = useRef<string | null>(null);

  // Collective choices for filmstrip
  const { data: allChoices } = useQuery<
    { id: string; category: string; chosen_text: string; restitution_label?: string }[]
  >({
    queryKey: ["screen-all-choices", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/collective-choice`);
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: getPollingInterval(realtimeStatus, 15_000, 40_000),
    staleTime: 8_000,
    refetchOnWindowFocus: true,
    enabled: !!data?.session && data.session.status !== "done",
  });

  // Detect module/séance changes → show briefing
  useEffect(() => {
    if (!data?.session || data.session.currentModule === 0) return;
    const key = `${data.session.currentModule}-${data.session.currentSeance || 1}`;
    if (prevModuleKey.current !== null && prevModuleKey.current !== key) {
      setShowBriefing(true);
      const t = setTimeout(() => setShowBriefing(false), 8000);
      return () => clearTimeout(t);
    }
    prevModuleKey.current = key;
  }, [data?.session?.currentModule, data?.session?.currentSeance, data?.session]);

  // Detect question changes → show micro-celebration
  useEffect(() => {
    if (!data?.session || data.session.currentModule === 0) return;
    const idx = data.session.currentSituationIndex ?? 0;
    if (prevSituationIndex.current >= 0 && prevSituationIndex.current !== idx && idx > prevSituationIndex.current) {
      setCompletedQuestion(prevSituationIndex.current + 1);
      setShowTransition(true);
      const t = setTimeout(() => setShowTransition(false), 800);
      return () => clearTimeout(t);
    }
    prevSituationIndex.current = idx;
  }, [data?.session?.currentSituationIndex, data?.session?.currentModule, data?.session]);

  // Done phase sequencing — enhanced celebration
  useEffect(() => {
    if (data?.session?.status !== "done") {
      setDonePhase("clap");
      return;
    }
    // Phase 1: big confetti burst
    import("canvas-confetti").then((mod) => {
      mod.default({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#FF6B35", "#F59E0B", "#8B5CF6", "#22C55E"],
      });
      // Second burst slightly delayed for a richer effect
      setTimeout(() => mod.default({ particleCount: 80, spread: 120, origin: { y: 0.4, x: 0.3 } }), 300);
      setTimeout(() => mod.default({ particleCount: 80, spread: 120, origin: { y: 0.4, x: 0.7 } }), 600);
    });
    const t1 = setTimeout(() => setDonePhase("title"), 2500);
    const t2 = setTimeout(() => {
      setDonePhase("credits");
      // Final confetti shower for credits
      import("canvas-confetti").then((mod) =>
        mod.default({ particleCount: 60, spread: 160, origin: { y: 0 }, gravity: 0.6, ticks: 200 }),
      );
    }, 6000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [data?.session?.status]);

  // Collective choice celebration — confetti on new choice
  useEffect(() => {
    if (!data?.collectiveChoice?.id) return;
    if (prevChoiceId.current !== null && prevChoiceId.current !== data.collectiveChoice.id) {
      import("canvas-confetti").then((mod) =>
        mod.default({ particleCount: 80, spread: 60, origin: { y: 0.5 }, colors: ["#FF6B35", "#F59E0B", "#8B5CF6"] }),
      );
    }
    prevChoiceId.current = data.collectiveChoice.id;
  }, [data?.collectiveChoice?.id]);

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-bw-bg gap-4">
        <p className="text-bw-muted text-lg">Session introuvable ou expirée</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-bw-primary text-white rounded-lg hover:opacity-90 transition"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!data) {
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

  const { session, situation, collectiveChoice, connectedCount, responsesCount, budgetStats } = data;
  const categoryColor = CATEGORY_COLORS[situation?.category || ""] || "#FF6B35";
  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/join?code=${session.joinCode || ""}` : "";
  const templateInfo = session.template ? TEMPLATE_LABELS[session.template] : null;

  // Progression (standard Q&A modules)
  const currentSeance = session.currentSeance || 1;
  // Module 2 (Émotion Cachée) special positions (checklist s1i0, scene builder s2i1) are NOT Q&A
  const isM2ECSpecial =
    session.currentModule === 2 &&
    ((currentSeance === 1 && session.currentSituationIndex === 0) ||
      (currentSeance === 2 && session.currentSituationIndex === 1));
  const isM2ECComparison = session.currentModule === 2 && currentSeance === 3 && session.currentSituationIndex === 0;
  // Module 10 flags
  const isM10 = session.currentModule === 10;
  const isM10Etsi = isM10 && currentSeance === 1;
  const isM10Special = isM10 && !(isM10Etsi && session.currentSituationIndex === 1); // pos 1 séance 1 = QCM standard
  const isM10QA = isM10 && !isM10Special;
  const module10 = data.module10 as Module10Data | undefined;
  // Module 11 flags
  const isM11 = session.currentModule === 11;
  const module11 = data.module11 as Module11Data | undefined;
  // Module 12 flags
  const isM12 = session.currentModule === 12;
  const isScreenQA =
    session.currentModule === 3 ||
    session.currentModule === 4 ||
    (session.currentModule === 9 && currentSeance !== 2) ||
    (session.currentModule === 2 && !isM2ECSpecial && !isM2ECComparison) ||
    isM10QA;
  const maxSituations =
    session.currentModule === 2
      ? MODULE_SEANCE_SITUATIONS?.[2]?.[currentSeance] || getSeanceMax(session.currentModule, currentSeance)
      : getSeanceMax(session.currentModule, currentSeance);
  const progressPct =
    isScreenQA || isM10 || isM11 || isM12
      ? Math.min(100, Math.round(((session.currentSituationIndex + 1) / maxSituations) * 100))
      : 0;

  // No module selected yet = initial join state
  const noModuleSelected = session.currentModule === 0;

  // Séance intro slide data
  const seanceIntro = !noModuleSelected ? getSeanceIntro(session.currentModule, currentSeance) : undefined;

  // Module info for header + ambient
  const moduleDef = !noModuleSelected ? getModuleByDb(session.currentModule, currentSeance) : undefined;
  const moduleColor = moduleDef?.color || seanceIntro?.color || "#FF6B35";

  // Cinema fun facts for waiting screen
  const CINEMA_FACTS = [
    "Le premier film de l'histoire dure 46 secondes (1895).",
    "Un film utilise en moyenne 1 500 plans.",
    "Le clap sert à synchroniser le son et l'image.",
    "Hitchcock disait : « Le cinéma, c'est la vie sans les moments ennuyeux. »",
    "Pixar a mis 4 ans à créer Toy Story.",
    "Le mot « scénario » vient de l'italien « scenario » (décor).",
  ];

  // Cinema fun fact for ObjectiveBanner
  const cinemaFact =
    CINEMA_FACTS[Math.abs((session.currentSituationIndex ?? 0) + session.currentModule) % CINEMA_FACTS.length];

  return (
    <ErrorBoundary variant="full">
      <div className="min-h-dvh flex flex-col relative film-grain">
        {/* Broadcast message overlay */}
        <BroadcastMessageOverlay broadcastMsg={broadcastMsg} />

        {/* Screen mode: Responses — full-screen highlighted responses (#15) */}
        <AnimatePresence>
          {screenModeFromBroadcast === "responses" && highlightedResponses && highlightedResponses.length > 0 && (
            <motion.div
              key="screen-mode-responses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-gradient-to-b from-[#1a1a2e] to-[#16213e] flex flex-col items-center justify-center p-8"
            >
              <p className="text-sm text-white/50 uppercase tracking-[0.2em] font-semibold mb-6">
                Réponses mises en avant
              </p>
              <div className="max-w-3xl w-full space-y-4 max-h-[80vh] overflow-y-auto">
                {highlightedResponses.map((r, i) => (
                  <motion.div
                    key={r.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="px-6 py-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm"
                  >
                    <p className="text-lg text-white/90 leading-relaxed">{r.text}</p>
                    <p className="text-sm text-white/40 mt-2">{r.students?.display_name}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Screen mode: Word Cloud — full-screen (#15) */}
        <AnimatePresence>
          {screenModeFromBroadcast === "wordcloud" && wordCloudTexts && wordCloudTexts.length > 0 && (
            <motion.div
              key="screen-mode-wordcloud"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-gradient-to-b from-[#1a1a2e] to-[#16213e] flex flex-col items-center justify-center p-8"
            >
              <p className="text-sm text-white/50 uppercase tracking-[0.2em] font-semibold mb-6">Nuage de mots</p>
              <div className="max-w-4xl w-full">
                <WordCloud texts={wordCloudTexts} accentColor={moduleColor} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Screen mode: Spotlight — single highlighted response large (#Phase4) */}
        <AnimatePresence>
          {screenModeFromBroadcast === "spotlight" && highlightedResponses && highlightedResponses.length > 0 && (
            <SpotlightView responses={highlightedResponses} moduleColor={moduleColor} />
          )}
        </AnimatePresence>

        {/* Screen mode: Consigne — full-screen text */}
        <AnimatePresence>
          {screenModeFromBroadcast?.startsWith("consigne:") && (
            <motion.div
              key="screen-mode-consigne"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-gradient-to-b from-[#1a1a2e] to-[#16213e] flex items-center justify-center p-12"
            >
              <h1 className="text-5xl sm:text-7xl font-bold text-white text-center leading-tight max-w-4xl">
                {screenModeFromBroadcast.replace("consigne:", "")}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Screen mode: Waiting — preparation animation */}
        <AnimatePresence>
          {screenModeFromBroadcast === "waiting" && (
            <motion.div
              key="screen-mode-waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-gradient-to-b from-[#1a1a2e] to-[#16213e] flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="text-[120px] mb-8"
              >
                🎬
              </motion.div>
              <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4">Preparez-vous...</h1>
              <p className="text-lg text-white/50">La suite arrive bientot</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Screen mode: Black — freeze screens */}
        <AnimatePresence>
          {screenModeFromBroadcast === "black" && (
            <motion.div
              key="screen-mode-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black"
            />
          )}
        </AnimatePresence>

        {/* Screen mode: Debate — options side by side */}
        <AnimatePresence>
          {screenModeFromBroadcast === "debate" && highlightedResponses && highlightedResponses.length >= 2 && (
            <motion.div
              key="screen-mode-debate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-gradient-to-b from-[#1a1a2e] to-[#16213e] flex flex-col items-center justify-center p-8"
            >
              <p className="text-sm text-white/50 uppercase tracking-[0.2em] font-semibold mb-8">
                A debattre
              </p>
              <div className="flex gap-8 max-w-5xl w-full">
                {highlightedResponses.slice(0, 3).map((r, i) => (
                  <motion.div
                    key={r.id || i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="flex-1 p-8 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm text-center"
                  >
                    <div className="text-6xl mb-4">{["🅰️", "🅱️", "🅲️"][i]}</div>
                    <p className="text-xl text-white leading-relaxed">{r.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient colored light spots — follow module color */}
        <AmbientGradients moduleColor={moduleColor} />

        {/* Floating reactions when new responses arrive */}
        {session.status === "responding" && <FloatingReactions triggerCount={responsesCount} />}

        {/* Header */}
        <ScreenHeader
          session={session}
          seanceIntro={seanceIntro}
          moduleColor={moduleColor}
          maxSituations={maxSituations}
          progressPct={progressPct}
          connectedCount={connectedCount}
          noModuleSelected={noModuleSelected}
        />

        {/* ═══ BRIEFING SÉANCE — fullscreen overlay ═══ */}
        <BriefingOverlay showBriefing={showBriefing} seanceIntro={seanceIntro} />

        {/* ═══ QUESTION TRANSITION — micro-celebration ═══ */}
        <QuestionTransitionCelebration
          showTransition={showTransition}
          completedQuestion={completedQuestion}
          moduleColor={moduleColor}
        />

        {/* Main */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatePresence mode="wait">
            {/* ═══ INITIAL JOIN — no module selected yet ═══ */}
            {session.status === "waiting" && noModuleSelected && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-5 max-w-2xl"
              >
                {/* Animated clapperboard */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="w-24 h-24 rounded-2xl mx-auto flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #FF6B35, #D4A843)",
                    boxShadow: "0 12px 48px rgba(255,107,53,0.35), 0 0 80px rgba(255,107,53,0.15)",
                  }}
                >
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="2.18" />
                    <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" />
                  </svg>
                </motion.div>

                <div className="space-y-6">
                  <h2 className="text-3xl font-bold font-cinema tracking-wider">Rejoignez la partie !</h2>

                  {/* Join code — animated letters */}
                  <div
                    className="inline-block rounded-2xl px-10 py-6 backdrop-blur-md"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,107,53,0.1), rgba(139,92,246,0.06))",
                      border: "1px solid rgba(255,107,53,0.2)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
                    }}
                  >
                    <p className="text-xs text-bw-muted mb-3 uppercase tracking-[0.2em]">Code d&apos;accès</p>
                    <div className="flex gap-2 justify-center">
                      {(session.joinCode || "------").split("").map((char, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.08 }}
                          className="w-14 h-16 rounded-xl flex items-center justify-center text-4xl font-bold font-mono text-white"
                          style={{
                            background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                            border: "1px solid rgba(255,255,255,0.1)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
                          }}
                        >
                          {char}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>

                {joinUrl && (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-white p-4 rounded-2xl inline-block"
                    style={{ boxShadow: "0 8px 48px rgba(255,255,255,0.12), 0 0 0 1px rgba(255,255,255,0.1)" }}
                  >
                    <QRCodeSVG value={joinUrl} size={200} />
                  </motion.div>
                )}

                {connectedCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-3 h-3 rounded-full bg-bw-teal"
                    />
                    <span className="text-xl text-bw-teal font-medium">
                      {connectedCount} joueur{connectedCount > 1 ? "s" : ""} connecté{connectedCount > 1 ? "s" : ""}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ═══ MODULE 1 — WAITING ═══ */}
            {session.status === "waiting" && session.currentModule === 1 && data.module1 && (
              <>
                {/* Image waiting: show image + QR */}
                {data.module1.type === "image" && data.module1.image && (
                  <motion.div
                    key="m1-img-waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="max-w-5xl w-full relative"
                  >
                    <div className="text-center mb-6">
                      <span className="text-lg font-semibold uppercase tracking-wider px-5 py-2 rounded-full inline-block bg-bw-violet/20 text-bw-violet">
                        {data.module1.image.title}
                      </span>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 max-h-[60vh] mx-auto">
                      <SafeImage
                        src={data.module1.image.url}
                        alt={data.module1.image.title}
                        width={1200}
                        height={750}
                        className="w-full h-full object-contain max-h-[60vh]"
                      />
                      <div
                        className="absolute bottom-4 right-4 backdrop-blur-md rounded-xl p-4 flex items-center gap-4"
                        style={{
                          background: "rgba(18,20,24,0.85)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                        }}
                      >
                        {joinUrl && (
                          <div className="bg-white p-2 rounded-lg">
                            <QRCodeSVG value={joinUrl} size={80} />
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-xs text-bw-muted uppercase tracking-wider mb-1">Rejoignez</p>
                          <p className="font-mono font-bold text-2xl tracking-[0.2em]">
                            {session.joinCode || "------"}
                          </p>
                          {connectedCount > 0 && (
                            <p className="text-sm text-bw-teal mt-1">
                              {connectedCount} connecté{connectedCount > 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <motion.p
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="text-center text-bw-muted mt-4 text-sm"
                    >
                      Observez l&apos;image... Le facilitateur va bientôt ouvrir la question
                    </motion.p>
                  </motion.div>
                )}
                {/* Positioning or notebook waiting: minimal */}
                {(data.module1.type === "positioning" || data.module1.type === "notebook") && (
                  <motion.div
                    key="m1-other-waiting"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    className="max-w-3xl w-full text-center space-y-5"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bw-violet to-bw-violet/60 mx-auto flex items-center justify-center">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        {data.module1.type === "positioning" ? (
                          <>
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" />
                          </>
                        ) : (
                          <>
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                          </>
                        )}
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold">
                      {data.module1.type === "positioning" ? "Positionnement" : "Carnet d'idées"}
                    </h2>
                    <ObjectiveBanner
                      seanceIntro={seanceIntro}
                      connectedCount={connectedCount}
                      objectifText={cinemaFact}
                      moduleColor={moduleColor}
                    />
                  </motion.div>
                )}
              </>
            )}

            {/* ═══ Q&A modules — WAITING: show question + "en attente" ═══ */}
            {session.status === "waiting" && isScreenQA && (
              <motion.div
                key="m34-waiting"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-4xl w-full text-center space-y-5"
              >
                <span
                  className="text-lg font-semibold uppercase tracking-wider px-5 py-2 rounded-full inline-block"
                  style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                >
                  {situation?.restitutionLabel ||
                    situation?.category ||
                    (session.currentModule === 4
                      ? "Vis ma vie"
                      : session.currentModule === 9
                        ? currentSeance === 1
                          ? "Le Cinéma"
                          : currentSeance === 3
                            ? "Les Imprévus"
                            : currentSeance === 4
                              ? "Le Plan"
                              : "Module 9"
                        : `Séance ${currentSeance}`)}
                </span>
                {situation?.prompt ? (
                  <p className="text-4xl leading-snug font-medium px-4">{situation.prompt}</p>
                ) : (
                  <p className="text-3xl leading-snug font-medium px-4 text-bw-muted">Préparez-vous...</p>
                )}
                <ObjectiveBanner
                  seanceIntro={seanceIntro}
                  connectedCount={connectedCount}
                  objectifText={cinemaFact}
                  moduleColor={moduleColor}
                />
              </motion.div>
            )}

            {/* ═══ MODULE 9 (old M2) séance 2 — WAITING: budget intro ═══ */}
            {session.status === "waiting" && session.currentModule === 9 && currentSeance === 2 && (
              <motion.div
                key="m2-waiting"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-3xl w-full text-center space-y-5"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bw-amber to-bw-amber/60 mx-auto flex items-center justify-center">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v12M8 10h8M8 14h8" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold">Contrainte & Responsabilité</h2>
                <ObjectiveBanner
                  seanceIntro={seanceIntro}
                  connectedCount={connectedCount}
                  objectifText={cinemaFact}
                  moduleColor={moduleColor}
                />
              </motion.div>
            )}

            {/* RESPONDING (Module 1 — Positioning) — question + option bar chart */}
            {session.status === "responding" &&
              session.currentModule === 1 &&
              data.module1?.type === "positioning" &&
              data.module1.questions && (
                <motion.div
                  key="m1-pos-responding"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="max-w-3xl w-full space-y-5"
                >
                  <div className="text-center space-y-3">
                    <span className="text-lg font-semibold uppercase tracking-wider px-5 py-2 rounded-full inline-block bg-bw-violet/20 text-bw-violet">
                      Question {(session.currentSituationIndex || 0) + 1}/8
                    </span>
                    {data.module1.questions[session.currentSituationIndex || 0] && (
                      <p className="text-3xl leading-snug font-medium px-4">
                        {data.module1.questions[session.currentSituationIndex || 0].text}
                      </p>
                    )}
                  </div>
                  {/* Option distribution bars */}
                  {data.module1.questions[session.currentSituationIndex || 0]?.options && (
                    <div className="space-y-4">
                      {data.module1.questions[session.currentSituationIndex || 0].options!.map((opt, i) => {
                        const count = data.module1!.optionDistribution?.[opt.key] || 0;
                        const pct = connectedCount > 0 ? Math.round((count / connectedCount) * 100) : 0;
                        const colors = ["#8B5CF6", "#4ECDC4", "#FF6B35", "#F59E0B"];
                        const color = colors[i % colors.length];
                        return (
                          <motion.div
                            key={opt.key}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="flex items-center gap-4"
                          >
                            <span
                              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                              style={{ backgroundColor: `${color}20`, color }}
                            >
                              {opt.key.toUpperCase()}
                            </span>
                            <div className="flex-1 space-y-1">
                              <span className="text-base text-bw-text">{opt.label}</span>
                              <div
                                className="h-4 rounded-full overflow-hidden"
                                style={{ background: "rgba(34,37,43,0.8)" }}
                              >
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.6, delay: i * 0.08 }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                              </div>
                            </div>
                            <span className="text-2xl font-bold flex-shrink-0 w-16 text-right" style={{ color }}>
                              {pct}%
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-bw-teal" />
                    <span className="text-lg text-bw-muted">
                      {responsesCount}/{connectedCount} réponse{responsesCount > 1 ? "s" : ""}
                    </span>
                  </div>
                </motion.div>
              )}

            {/* RESPONDING (Module 1 — Image) — large image + single counter */}
            {session.status === "responding" && session.currentModule === 1 && data.module1?.type === "image" && (
              <motion.div
                key="m1-img-responding"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-5xl w-full space-y-6"
              >
                <div className="text-center space-y-3">
                  <span className="text-lg font-semibold uppercase tracking-wider px-5 py-2 rounded-full inline-block bg-bw-violet/20 text-bw-violet">
                    {data.module1.image?.title || "Image"}
                  </span>
                </div>
                {data.module1.image && (
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 max-h-[50vh] mx-auto">
                    <SafeImage
                      src={data.module1.image.url}
                      alt={data.module1.image.title}
                      width={1200}
                      height={750}
                      className="w-full h-full object-contain max-h-[50vh]"
                    />
                  </div>
                )}
                {data.module1.question && (
                  <p className="text-2xl text-center leading-snug font-medium px-8">{data.module1.question.text}</p>
                )}
                <div className="flex items-center justify-center gap-4">
                  {session.timerEndsAt && new Date(session.timerEndsAt).getTime() > Date.now() && (
                    <CountdownTimer endsAt={session.timerEndsAt} size="lg" />
                  )}
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-bw-teal" />
                    <span className="text-lg text-bw-muted">
                      {data.module1.responsesCount || 0}/{connectedCount} réponse
                      {(data.module1.responsesCount || 0) > 1 ? "s" : ""}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* RESPONDING (Module 1 — Notebook) — simple counter */}
            {session.status === "responding" && session.currentModule === 1 && data.module1?.type === "notebook" && (
              <motion.div
                key="m1-notebook-responding"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-3xl w-full text-center space-y-5"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bw-violet to-bw-violet/60 mx-auto flex items-center justify-center">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold">Carnet d&apos;idées</h2>
                <p className="text-xl text-bw-muted">Les élèves écrivent...</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-bw-teal" />
                  <span className="text-lg text-bw-muted">
                    {data.module1.responsesCount || 0}/{connectedCount} carnet
                    {(data.module1.responsesCount || 0) > 1 ? "s" : ""} soumis
                  </span>
                </div>
              </motion.div>
            )}

            {/* REVIEWING (Module 1 — Confrontation) — split A/B view */}
            {session.status === "reviewing" &&
              session.currentModule === 1 &&
              data.module1?.type === "image" &&
              data.module1.confrontation && (
                <motion.div
                  key="m1-confrontation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-5xl w-full space-y-5"
                >
                  <div className="text-center">
                    <span className="text-lg font-semibold uppercase tracking-[0.3em] px-6 py-2 rounded-full inline-block bg-bw-violet/20 text-bw-violet">
                      Confrontation
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-6 min-h-[40vh]">
                    {/* Response A */}
                    <motion.div
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      className="rounded-2xl p-8 flex flex-col backdrop-blur-md"
                      style={{
                        background: "rgba(15,42,74,0.7)",
                        border: "1px solid rgba(59,130,246,0.25)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(59,130,246,0.1)",
                      }}
                    >
                      <p className="text-sm text-[#93C5FD] font-bold uppercase tracking-wider mb-6">Réponse A</p>
                      <p className="text-2xl leading-relaxed text-bw-heading flex-1 flex items-center">
                        {data.module1.confrontation.responseA}
                      </p>
                    </motion.div>
                    {/* Response B */}
                    <motion.div
                      initial={{ x: 100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
                      className="rounded-2xl p-8 flex flex-col backdrop-blur-md"
                      style={{
                        background: "rgba(74,15,15,0.7)",
                        border: "1px solid rgba(239,68,68,0.25)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(239,68,68,0.1)",
                      }}
                    >
                      <p className="text-sm text-[#FCA5A5] font-bold uppercase tracking-wider mb-6">Réponse B</p>
                      <p className="text-2xl leading-relaxed text-bw-heading flex-1 flex items-center">
                        {data.module1.confrontation.responseB}
                      </p>
                    </motion.div>
                  </div>
                  <p className="text-center text-bw-muted text-sm">Textes anonymes — Débat oral en classe</p>
                </motion.div>
              )}

            {/* RESPONDING (Module 9 Q&A / 3 / 4 / M10 QCM) — question + live counter */}
            {session.status === "responding" &&
              (session.currentModule === 3 ||
                session.currentModule === 4 ||
                (session.currentModule === 9 && currentSeance !== 2) ||
                (session.currentModule === 2 && !isM2ECSpecial && !isM2ECComparison) ||
                isM10QA) &&
              situation && (
                <motion.div
                  key="responding"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="max-w-4xl w-full text-center space-y-5"
                >
                  <span
                    className="text-lg font-semibold uppercase tracking-wider px-5 py-2 rounded-full inline-block"
                    style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                  >
                    {situation.restitutionLabel || situation.category}
                  </span>
                  <p className="text-4xl leading-snug font-medium px-4">{situation.prompt}</p>
                  {/* Live response counter — FlipCounter + timer */}
                  <div className="flex items-center justify-center gap-8">
                    {session.timerEndsAt && new Date(session.timerEndsAt).getTime() > Date.now() && (
                      <CountdownTimer endsAt={session.timerEndsAt} size="lg" />
                    )}
                    <FlipCounter current={responsesCount} total={connectedCount} label="réponses" />
                  </div>
                  {/* Word cloud — appears when responses come in */}
                  {wordCloudTexts && wordCloudTexts.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                      <WordCloud texts={wordCloudTexts} accentColor={moduleColor} />
                    </motion.div>
                  )}
                </motion.div>
              )}

            {/* FIX #1: RESPONDING (Module 9 séance 2 — Budget) — live budget bars */}
            {session.status === "responding" && session.currentModule === 9 && currentSeance === 2 && (
              <motion.div
                key="budget"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-3xl w-full space-y-5"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bw-amber to-bw-amber/60 mx-auto flex items-center justify-center">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v12M8 10h8M8 14h8" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold">Contrainte & Responsabilité</h2>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-bw-teal" />
                    <p className="text-lg text-bw-muted">
                      {budgetStats?.submittedCount || 0}/{connectedCount} choix soumis
                    </p>
                  </div>
                </div>
                {budgetStats && budgetStats.submittedCount > 0 && (
                  <div className="space-y-4">
                    {PRODUCTION_CATEGORIES.map((cat, i) => {
                      const val = budgetStats.averages[cat.key] || 0;
                      const maxCost = Math.max(...cat.options.map((o) => o.cost));
                      const pct = maxCost > 0 ? Math.round((val / maxCost) * 100) : 0;
                      // Find closest option for label
                      const closestOpt = cat.options.reduce((prev, curr) =>
                        Math.abs(curr.cost - val) < Math.abs(prev.cost - val) ? curr : prev,
                      );
                      return (
                        <motion.div
                          key={cat.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-center gap-4"
                        >
                          <span className="w-36 text-right text-sm font-medium" style={{ color: cat.color }}>
                            {cat.label}
                          </span>
                          <div
                            className="flex-1 h-6 rounded-full overflow-hidden"
                            style={{ background: "rgba(34,37,43,0.8)" }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, delay: i * 0.08 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                          </div>
                          <span className="w-32 text-base font-medium text-right" style={{ color: cat.color }}>
                            {closestOpt.label}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══ MODULE 2 EC séance 1 index 0 — Checklist WAITING ═══ */}
            {session.status === "waiting" &&
              session.currentModule === 2 &&
              currentSeance === 1 &&
              session.currentSituationIndex === 0 && (
                <motion.div
                  key="m2ec-checklist-wait"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="max-w-3xl w-full text-center space-y-5"
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-bw-pink to-bw-pink/60 mx-auto flex items-center justify-center"
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                  </motion.div>
                  <h2 className="text-3xl font-bold">Tes contenus préférés</h2>
                  <p className="text-xl text-bw-muted">
                    Préparez-vous à sélectionner vos films, séries et anime favoris...
                  </p>
                  <ObjectiveBanner
                    seanceIntro={seanceIntro}
                    connectedCount={connectedCount}
                    objectifText={cinemaFact}
                    moduleColor={moduleColor}
                  />
                </motion.div>
              )}

            {/* ═══ MODULE 2 EC séance 1 index 0 — Checklist responding ═══ */}
            {session.status === "responding" &&
              session.currentModule === 2 &&
              currentSeance === 1 &&
              session.currentSituationIndex === 0 && (
                <motion.div
                  key="m2ec-checklist"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="max-w-3xl w-full text-center space-y-5"
                >
                  {/* Animated progress ring */}
                  <div className="relative w-28 h-28 mx-auto">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <motion.circle
                        cx="56"
                        cy="56"
                        r="48"
                        fill="none"
                        stroke="#EC4899"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 48}
                        initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                        animate={{
                          strokeDashoffset:
                            connectedCount > 0
                              ? 2 * Math.PI * 48 * (1 - responsesCount / connectedCount)
                              : 2 * Math.PI * 48,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.span
                        key={responsesCount}
                        initial={{ scale: 1.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-2xl font-bold text-bw-pink tabular-nums"
                      >
                        {responsesCount}
                      </motion.span>
                    </div>
                  </div>
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold"
                  >
                    Tes contenus préférés
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl text-bw-muted"
                  >
                    Les élèves sélectionnent leurs films, séries et anime...
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-2 h-2 rounded-full bg-bw-pink"
                    />
                    <span className="text-lg text-bw-muted">
                      {responsesCount}/{connectedCount} soumis
                    </span>
                  </motion.div>
                </motion.div>
              )}

            {/* ═══ MODULE 2 EC séance 2 index 1 — Scene Builder WAITING ═══ */}
            {session.status === "waiting" &&
              session.currentModule === 2 &&
              currentSeance === 2 &&
              session.currentSituationIndex === 1 && (
                <motion.div
                  key="m2ec-scene-wait"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="max-w-3xl w-full text-center space-y-5"
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-bw-pink to-bw-pink/60 mx-auto flex items-center justify-center"
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="2.18" />
                      <path d="M7 2v20M17 2v20M2 12h20" />
                    </svg>
                  </motion.div>
                  <h2 className="text-3xl font-bold">Construction de scène</h2>
                  <p className="text-xl text-bw-muted">
                    Préparez-vous à construire une scène avec des jetons et des contraintes...
                  </p>
                  <ObjectiveBanner
                    seanceIntro={seanceIntro}
                    connectedCount={connectedCount}
                    objectifText={cinemaFact}
                    moduleColor={moduleColor}
                  />
                </motion.div>
              )}

            {/* ═══ MODULE 2 EC séance 2 index 1 — Scene Builder responding ═══ */}
            {session.status === "responding" &&
              session.currentModule === 2 &&
              currentSeance === 2 &&
              session.currentSituationIndex === 1 && (
                <motion.div
                  key="m2ec-scene"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="max-w-3xl w-full text-center space-y-5"
                >
                  {/* Animated progress ring */}
                  <div className="relative w-28 h-28 mx-auto">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <motion.circle
                        cx="56"
                        cy="56"
                        r="48"
                        fill="none"
                        stroke="#EC4899"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 48}
                        initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                        animate={{
                          strokeDashoffset:
                            connectedCount > 0
                              ? 2 * Math.PI * 48 * (1 - responsesCount / connectedCount)
                              : 2 * Math.PI * 48,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.span
                        key={responsesCount}
                        initial={{ scale: 1.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-2xl font-bold text-bw-pink tabular-nums"
                      >
                        {responsesCount}
                      </motion.span>
                    </div>
                  </div>
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold"
                  >
                    Construction de scène
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl text-bw-muted"
                  >
                    Les élèves construisent leurs scènes avec des jetons...
                  </motion.p>
                  {/* Staggered token indicators */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center gap-2"
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 400, damping: 15 }}
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: i < Math.min(5, responsesCount) ? "#EC4899" : "rgba(255,255,255,0.06)",
                        }}
                      />
                    ))}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-2 h-2 rounded-full bg-bw-pink"
                    />
                    <span className="text-lg text-bw-muted">
                      {responsesCount}/{connectedCount} scènes
                    </span>
                  </motion.div>
                </motion.div>
              )}

            {/* ═══ MODULE 2 EC séance 3 — Waiting for comparison ═══ */}
            {session.currentModule === 2 &&
              currentSeance === 3 &&
              (session.status === "waiting" || session.status === "responding" || session.status === "reviewing") &&
              !data.module5?.comparison && (
                <motion.div
                  key="m2ec-compare-wait"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="max-w-3xl w-full text-center space-y-5"
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-bw-pink to-bw-pink/60 mx-auto flex items-center justify-center"
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </motion.div>
                  <h2 className="text-3xl font-bold">Phase Collective</h2>
                  <p className="text-xl text-bw-muted">
                    Le facilitateur sélectionne deux scènes pour la confrontation...
                  </p>
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-bw-amber" />
                    <span className="text-lg text-bw-muted">En attente de la sélection</span>
                  </motion.div>
                </motion.div>
              )}

            {/* ═══ MODULE 2 EC séance 3 — Comparison display (2 anonymous scenes) ═══ */}
            {session.currentModule === 2 &&
              currentSeance === 3 &&
              (session.status === "waiting" || session.status === "responding" || session.status === "reviewing") &&
              data.module5?.comparison?.sceneA &&
              data.module5?.comparison?.sceneB &&
              (() => {
                const scA = data.module5!.comparison!.sceneA;
                const scB = data.module5!.comparison!.sceneB;
                return (
                  <motion.div
                    key="m2ec-comparison"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="max-w-6xl w-full space-y-6"
                  >
                    <motion.div className="text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                      <span className="text-lg font-semibold uppercase tracking-[0.3em] px-6 py-2 rounded-full inline-block bg-bw-pink/20 text-bw-pink">
                        Deux scènes face à face
                      </span>
                    </motion.div>
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-stretch min-h-[45vh]">
                      {/* Scene A */}
                      <motion.div
                        initial={{ x: -120, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.2 }}
                        className="rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden backdrop-blur-md"
                        style={{
                          background: "rgba(34,37,43,0.65)",
                          border: "1px solid rgba(236,72,153,0.25)",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(236,72,153,0.08)",
                        }}
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-bw-pink to-bw-pink/30" />
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-black text-bw-pink/20">A</span>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-bw-pink/15 text-bw-pink font-medium">
                            {scA.emotion || "Émotion"}
                          </span>
                        </div>
                        <div className="space-y-4 flex-1">
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <span className="text-xs uppercase tracking-wider text-bw-muted font-medium">
                              Intention
                            </span>
                            <p className="text-lg text-bw-heading leading-snug mt-0.5">{scA.intention}</p>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <span className="text-xs uppercase tracking-wider text-bw-muted font-medium">Obstacle</span>
                            <p className="text-lg text-bw-heading leading-snug mt-0.5">{scA.obstacle}</p>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                          >
                            <span className="text-xs uppercase tracking-wider text-bw-muted font-medium">
                              Changement
                            </span>
                            <p className="text-lg text-bw-heading leading-snug mt-0.5">{scA.changement}</p>
                          </motion.div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-white/5">
                          {((scA.elements as { key: string; label?: string }[]) || []).map((el, i) => (
                            <motion.span
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.7 + i * 0.05, type: "spring", stiffness: 300 }}
                              className="text-xs bg-bw-pink/10 text-bw-pink px-2.5 py-1 rounded-full border border-bw-pink/20"
                            >
                              {el.label || el.key}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>

                      {/* VS separator */}
                      <div className="flex items-center justify-center">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                          className="w-14 h-14 rounded-full bg-gradient-to-br from-bw-pink/20 to-bw-violet/20 border border-white/10 flex items-center justify-center"
                        >
                          <span className="text-lg font-black text-white/60">VS</span>
                        </motion.div>
                      </div>

                      {/* Scene B */}
                      <motion.div
                        initial={{ x: 120, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.3 }}
                        className="rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden backdrop-blur-md"
                        style={{
                          background: "rgba(34,37,43,0.65)",
                          border: "1px solid rgba(139,92,246,0.25)",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(139,92,246,0.08)",
                        }}
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-bw-violet to-bw-violet/30" />
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-black text-bw-violet/20">B</span>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-bw-violet/15 text-bw-violet font-medium">
                            {scB.emotion || "Émotion"}
                          </span>
                        </div>
                        <div className="space-y-4 flex-1">
                          <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <span className="text-xs uppercase tracking-wider text-bw-muted font-medium">
                              Intention
                            </span>
                            <p className="text-lg text-bw-heading leading-snug mt-0.5">{scB.intention}</p>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                          >
                            <span className="text-xs uppercase tracking-wider text-bw-muted font-medium">Obstacle</span>
                            <p className="text-lg text-bw-heading leading-snug mt-0.5">{scB.obstacle}</p>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                          >
                            <span className="text-xs uppercase tracking-wider text-bw-muted font-medium">
                              Changement
                            </span>
                            <p className="text-lg text-bw-heading leading-snug mt-0.5">{scB.changement}</p>
                          </motion.div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-white/5">
                          {((scB.elements as { key: string; label?: string }[]) || []).map((el, i) => (
                            <motion.span
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.8 + i * 0.05, type: "spring", stiffness: 300 }}
                              className="text-xs bg-bw-violet/10 text-bw-violet px-2.5 py-1 rounded-full border border-bw-violet/20"
                            >
                              {el.label || el.key}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="text-center text-bw-muted text-sm"
                    >
                      Scènes anonymes — Débat oral en classe
                    </motion.p>
                  </motion.div>
                );
              })()}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* MODULE 10 — ET SI... + PITCH — SCREEN PROJECTOR      */}
            {/* ═══════════════════════════════════════════════════════ */}

            {/* M10 — WAITING: Et si... image (pos 0) — Big image + waiting pulse */}
            {session.status === "waiting" && isM10 && module10?.type === "etsi" && module10.image && (
              <motion.div
                key="m10-etsi-wait"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-5xl w-full relative"
              >
                <div className="text-center mb-6">
                  <motion.span
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="text-lg font-semibold uppercase tracking-wider px-5 py-2 rounded-full inline-block"
                    style={{ backgroundColor: "rgba(6,182,212,0.15)", color: "#06B6D4" }}
                  >
                    ✨ Et si...
                  </motion.span>
                </div>
                <div
                  className="relative rounded-2xl overflow-hidden border border-cyan-500/20 max-h-[55vh] mx-auto"
                  style={{ boxShadow: "0 0 60px rgba(6,182,212,0.12), 0 8px 32px rgba(0,0,0,0.4)" }}
                >
                  <SafeImage
                    src={module10.image.url}
                    alt={module10.image.title}
                    width={1200}
                    height={750}
                    className="w-full h-full object-contain max-h-[55vh]"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-6 py-4">
                    <p className="text-lg font-medium text-white">{module10.image.title}</p>
                    <p className="text-sm text-white/60">{module10.image.description}</p>
                  </div>
                </div>
                <motion.p
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-center text-bw-muted mt-6 text-lg"
                >
                  Observez bien l&apos;image... 👀
                </motion.p>
              </motion.div>
            )}

            {/* M10 — RESPONDING: Et si... image (pos 0) — Image + live counter */}
            {session.status === "responding" && isM10 && module10?.type === "etsi" && module10.image && (
              <motion.div
                key="m10-etsi-respond"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-5xl w-full space-y-6"
              >
                <div className="text-center">
                  <span
                    className="text-lg font-semibold uppercase tracking-wider px-5 py-2 rounded-full inline-block"
                    style={{ backgroundColor: "rgba(6,182,212,0.15)", color: "#06B6D4" }}
                  >
                    ✨ Et si...
                  </span>
                </div>
                <div
                  className="relative rounded-2xl overflow-hidden border border-cyan-500/20 max-h-[45vh] mx-auto"
                  style={{ boxShadow: "0 0 40px rgba(6,182,212,0.1), 0 8px 32px rgba(0,0,0,0.4)" }}
                >
                  <SafeImage
                    src={module10.image.url}
                    alt={module10.image.title}
                    width={1200}
                    height={750}
                    className="w-full h-full object-contain max-h-[45vh]"
                  />
                </div>
                <p className="text-3xl text-center leading-snug font-medium px-8">
                  Et si cette scène était le début d&apos;un film... ?
                </p>
                <div className="flex items-center justify-center gap-4">
                  {session.timerEndsAt && new Date(session.timerEndsAt).getTime() > Date.now() && (
                    <CountdownTimer endsAt={session.timerEndsAt} size="lg" />
                  )}
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                      <motion.circle
                        cx="40"
                        cy="40"
                        r="34"
                        fill="none"
                        stroke="#06B6D4"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 34}
                        initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                        animate={{
                          strokeDashoffset:
                            connectedCount > 0
                              ? 2 * Math.PI * 34 * (1 - responsesCount / connectedCount)
                              : 2 * Math.PI * 34,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.span
                        key={responsesCount}
                        initial={{ scale: 1.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-lg font-bold tabular-nums"
                        style={{ color: "#06B6D4" }}
                      >
                        {responsesCount}
                      </motion.span>
                    </div>
                  </div>
                  <span className="text-lg text-bw-muted">
                    {responsesCount}/{connectedCount} « Et si... » reçus
                  </span>
                </div>
              </motion.div>
            )}

            {/* M10 — Idea bank (pos 2 séance 1) — Live wall of ideas */}
            {isM10 && module10?.type === "idea-bank" && (
              <motion.div
                key="m10-ideabank"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-4xl w-full space-y-5"
              >
                <div className="text-center space-y-3">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05))",
                      border: "1px solid rgba(6,182,212,0.3)",
                      boxShadow: "0 0 40px rgba(6,182,212,0.15)",
                    }}
                  >
                    <span className="text-3xl">💡</span>
                  </motion.div>
                  <h2 className="text-3xl font-bold">Banque d&apos;idées</h2>
                  <p className="text-lg text-bw-muted">Les meilleures idées de la classe</p>
                </div>
                {module10.ideaBankItems && module10.ideaBankItems.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {module10.ideaBankItems.slice(0, 8).map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: i * 0.1, type: "spring", stiffness: 200, damping: 15 }}
                        className="rounded-xl p-5 backdrop-blur-md relative overflow-hidden"
                        style={{
                          background: "rgba(34,37,43,0.7)",
                          border: "1px solid rgba(6,182,212,0.15)",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                        }}
                      >
                        <div
                          className="absolute top-0 left-0 w-full h-0.5"
                          style={{
                            background: `linear-gradient(90deg, #06B6D4 ${Math.min(100, item.votes * 20)}%, transparent)`,
                          }}
                        />
                        <p className="text-lg text-bw-heading leading-snug">{item.text}</p>
                        {item.votes > 0 && (
                          <div className="flex items-center gap-1.5 mt-3">
                            <span className="text-cyan-400">♥</span>
                            <span className="text-sm font-medium text-cyan-400">{item.votes}</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-center py-12"
                  >
                    <span className="text-lg text-bw-muted">En attente des idées...</span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* M10 — WAITING/RESPONDING: Avatar builder (séance 2, pos 0) */}
            {(session.status === "waiting" || session.status === "responding") &&
              isM10 &&
              module10?.type === "avatar" && (
                <motion.div
                  key="m10-avatar"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="max-w-5xl w-full text-center space-y-4"
                >
                  <h2 className="text-2xl font-bold">Créez votre personnage</h2>
                  <p className="text-base text-bw-muted">
                    Prénom, âge, trait dominant, avatar — c&apos;est votre héros !
                  </p>

                  {/* Avatar gallery — compact tiles */}
                  {module10.allSubmissions && module10.allSubmissions.length > 0 ? (
                    <PosterGallery submissions={module10.allSubmissions} />
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.1))",
                        border: "1px solid rgba(6,182,212,0.3)",
                      }}
                    >
                      <span className="text-3xl">🎭</span>
                    </motion.div>
                  )}

                  <span className="text-sm text-bw-muted">
                    {module10.submittedCount || 0}/{connectedCount} personnage
                    {(module10.submittedCount || 0) > 1 ? "s" : ""} créé{(module10.submittedCount || 0) > 1 ? "s" : ""}
                  </span>
                </motion.div>
              )}

            {/* M10 — Objectif + Obstacle (séance 2, pos 1) */}
            {(session.status === "waiting" || session.status === "responding") &&
              isM10 &&
              module10?.type === "objectif" && (
                <motion.div
                  key="m10-objectif"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="max-w-3xl w-full text-center space-y-5"
                >
                  <div className="flex items-center justify-center gap-6">
                    <motion.div
                      initial={{ x: -40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))",
                        border: "1px solid rgba(16,185,129,0.3)",
                      }}
                    >
                      <span className="text-3xl">🎯</span>
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="text-3xl text-bw-muted"
                    >
                      +
                    </motion.div>
                    <motion.div
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))",
                        border: "1px solid rgba(239,68,68,0.3)",
                      }}
                    >
                      <span className="text-3xl">🧱</span>
                    </motion.div>
                  </div>
                  <h2 className="text-3xl font-bold">Objectif + Obstacle</h2>
                  <p className="text-xl text-bw-muted">
                    Que veut votre personnage ? Qu&apos;est-ce qui l&apos;en empêche ?
                  </p>
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#06B6D4" }} />
                    <span className="text-lg text-bw-muted">Les élèves définissent leur histoire...</span>
                  </motion.div>
                </motion.div>
              )}

            {/* M10 — Pitch assembly (séance 2, pos 2) */}
            {(session.status === "waiting" || session.status === "responding") &&
              isM10 &&
              module10?.type === "pitch" && (
                <motion.div
                  key="m10-pitch"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="max-w-3xl w-full text-center space-y-5"
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="w-24 h-24 rounded-full mx-auto flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(245,158,11,0.1))",
                      border: "1px solid rgba(6,182,212,0.3)",
                      boxShadow: "0 0 48px rgba(6,182,212,0.15)",
                    }}
                  >
                    <span className="text-4xl">📝</span>
                  </motion.div>
                  <h2 className="text-3xl font-bold">Assemblage du pitch</h2>
                  <p className="text-xl text-bw-muted">
                    Personnage + objectif + obstacle = votre histoire en 2 phrases
                  </p>
                  <div className="relative w-28 h-28 mx-auto">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <motion.circle
                        cx="56"
                        cy="56"
                        r="48"
                        fill="none"
                        stroke="#06B6D4"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 48}
                        initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                        animate={{
                          strokeDashoffset:
                            connectedCount > 0
                              ? 2 * Math.PI * 48 * (1 - (module10.submittedCount || 0) / connectedCount)
                              : 2 * Math.PI * 48,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.span
                        key={module10.submittedCount}
                        initial={{ scale: 1.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-2xl font-bold tabular-nums"
                        style={{ color: "#06B6D4" }}
                      >
                        {module10.submittedCount || 0}
                      </motion.span>
                    </div>
                  </div>
                  <span className="text-lg text-bw-muted">
                    {module10.submittedCount || 0}/{connectedCount} pitch{(module10.submittedCount || 0) > 1 ? "s" : ""}{" "}
                    assemblé{(module10.submittedCount || 0) > 1 ? "s" : ""}
                  </span>
                </motion.div>
              )}

            {/* M10 — Chrono test (séance 2, pos 3) — Giant 30s timer */}
            {(session.status === "waiting" || session.status === "responding") &&
              isM10 &&
              module10?.type === "chrono" && (
                <motion.div
                  key="m10-chrono"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="max-w-3xl w-full text-center space-y-5"
                >
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-32 h-32 rounded-full mx-auto flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.1))",
                      border: "2px solid rgba(245,158,11,0.4)",
                      boxShadow: "0 0 60px rgba(245,158,11,0.2)",
                    }}
                  >
                    <span className="text-5xl">⏱️</span>
                  </motion.div>
                  <h2 className="text-4xl font-bold">Test Chrono</h2>
                  <p className="text-2xl text-bw-amber font-medium">30 secondes pour pitcher votre histoire !</p>
                  <p className="text-lg text-bw-muted">
                    Lisez votre pitch à voix haute. Soyez concis, soyez convaincant.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-bw-amber" />
                    <span className="text-lg text-bw-muted">
                      {module10.submittedCount || 0}/{connectedCount} chrono
                      {(module10.submittedCount || 0) > 1 ? "s" : ""} terminé
                      {(module10.submittedCount || 0) > 1 ? "s" : ""}
                    </span>
                  </div>
                </motion.div>
              )}

            {/* M10 — Confrontation (séance 2, pos 4) — Two pitchs A vs B */}
            {isM10 && module10?.type === "confrontation" && module10.confrontation && (
              <motion.div
                key="m10-confrontation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-5xl w-full space-y-6"
              >
                <motion.div className="text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                  <span
                    className="text-lg font-semibold uppercase tracking-[0.3em] px-6 py-2 rounded-full inline-block"
                    style={{ backgroundColor: "rgba(6,182,212,0.15)", color: "#06B6D4" }}
                  >
                    ⚔️ Confrontation
                  </span>
                </motion.div>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-stretch min-h-[40vh]">
                  {/* Pitch A */}
                  <motion.div
                    initial={{ x: -120, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.2 }}
                    className="rounded-2xl p-8 flex flex-col gap-4 relative overflow-hidden backdrop-blur-md"
                    style={{
                      background: "rgba(15,42,74,0.7)",
                      border: "1px solid rgba(59,130,246,0.25)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(59,130,246,0.1)",
                    }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-500/30" />
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-blue-400/30">A</span>
                      <span className="text-sm font-medium text-blue-300">{module10.confrontation.pitchA.prenom}</span>
                    </div>
                    <p className="text-2xl leading-relaxed text-bw-heading flex-1 flex items-center">
                      {module10.confrontation.pitchA.text}
                    </p>
                  </motion.div>

                  {/* VS separator */}
                  <div className="flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.1))",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "0 0 24px rgba(6,182,212,0.15)",
                      }}
                    >
                      <span className="text-xl font-black text-white/70">VS</span>
                    </motion.div>
                  </div>

                  {/* Pitch B */}
                  <motion.div
                    initial={{ x: 120, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.3 }}
                    className="rounded-2xl p-8 flex flex-col gap-4 relative overflow-hidden backdrop-blur-md"
                    style={{
                      background: "rgba(74,15,15,0.7)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(239,68,68,0.1)",
                    }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-500/30" />
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-red-400/30">B</span>
                      <span className="text-sm font-medium text-red-300">{module10.confrontation.pitchB.prenom}</span>
                    </div>
                    <p className="text-2xl leading-relaxed text-bw-heading flex-1 flex items-center">
                      {module10.confrontation.pitchB.text}
                    </p>
                  </motion.div>
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center text-bw-muted text-sm"
                >
                  Quel pitch donne le plus envie de voir le film ?
                </motion.p>
              </motion.div>
            )}

            {/* M10 — Confrontation WAITING (no pitchs selected yet) */}
            {isM10 && module10?.type === "confrontation" && !module10.confrontation && (
              <motion.div
                key="m10-confront-wait"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-3xl w-full text-center space-y-5"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05))",
                    border: "1px solid rgba(6,182,212,0.3)",
                  }}
                >
                  <span className="text-3xl">⚔️</span>
                </motion.div>
                <h2 className="text-3xl font-bold">Confrontation</h2>
                <p className="text-xl text-bw-muted">Le facilitateur sélectionne deux pitchs pour le duel...</p>
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex items-center justify-center gap-3"
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#06B6D4" }} />
                  <span className="text-lg text-bw-muted">En attente de la sélection</span>
                </motion.div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* MODULE 11 — CINÉ-DÉBAT — SCREEN PROJECTOR             */}
            {/* ═══════════════════════════════════════════════════════ */}

            {/* M11 — Stimulus projection (all types) */}
            {(session.status === "waiting" || session.status === "responding") && isM11 && module11 && (
              <motion.div
                key={`m11-stim-${session.currentSituationIndex}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-5xl w-full space-y-6"
              >
                {/* Type badge */}
                <div className="text-center">
                  <span
                    className="text-lg font-semibold uppercase tracking-wider px-5 py-2 rounded-full inline-block"
                    style={{ backgroundColor: "rgba(225,29,72,0.15)", color: "#E11D48" }}
                  >
                    {module11.type === "citation"
                      ? "💬 Citation"
                      : module11.type === "scene"
                        ? "🎬 Scène"
                        : module11.type === "poster"
                          ? "🖼️ Affiche"
                          : "⚖️ Débat"}
                  </span>
                </div>

                {/* Citation: quote + author portrait + filmography */}
                {module11.type === "citation" && (
                  <div className="text-center space-y-6">
                    <motion.blockquote
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative px-8 py-6 mx-auto max-w-3xl rounded-2xl border border-white/[0.08]"
                      style={{ background: "linear-gradient(135deg, rgba(225,29,72,0.06), rgba(26,26,26,0.9))" }}
                    >
                      <span className="absolute top-3 left-5 text-5xl opacity-20" style={{ color: "#E11D48" }}>
                        &ldquo;
                      </span>
                      <p className="text-2xl sm:text-3xl font-medium text-bw-heading italic leading-relaxed pl-6">
                        {module11.text}
                      </p>
                    </motion.blockquote>
                    {module11.author && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-center gap-4"
                      >
                        {module11.authorImageUrl && (
                          <SafeImage
                            src={module11.authorImageUrl}
                            alt={module11.author}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full object-cover border-2"
                            style={{ borderColor: "#E11D48" }}
                          />
                        )}
                        <div className="text-left">
                          <p className="text-xl font-bold text-bw-heading">{module11.author}</p>
                          {module11.authorRole && <p className="text-sm text-bw-muted">{module11.authorRole}</p>}
                          {module11.authorBio && <p className="text-sm text-bw-text mt-0.5">{module11.authorBio}</p>}
                        </div>
                      </motion.div>
                    )}
                    {module11.filmography && module11.filmography.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex gap-4 justify-center"
                      >
                        {module11.filmography.map((film, i) => (
                          <div key={i} className="text-center">
                            <SafeImage
                              src={`https://image.tmdb.org/t/p/w185${film.posterPath}`}
                              alt={film.title}
                              width={96}
                              height={144}
                              className="w-24 h-36 rounded-xl object-cover border border-white/[0.08]"
                            />
                            <p className="text-xs text-bw-muted mt-1">
                              {film.title} ({film.year})
                            </p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Scene: YouTube video */}
                {module11.type === "scene" && module11.videoId && (
                  <div className="text-center space-y-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative w-full max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden border border-white/[0.08]"
                      style={{ boxShadow: "0 0 60px rgba(225,29,72,0.1), 0 8px 32px rgba(0,0,0,0.4)" }}
                    >
                      <iframe
                        src={`https://www.youtube.com/embed/${module11.videoId}?rel=0&modestbranding=1${module11.videoStart ? `&start=${module11.videoStart}` : ""}${module11.videoEnd ? `&end=${module11.videoEnd}` : ""}`}
                        title={module11.sourceTitle || "Scène"}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </motion.div>
                    {module11.sourceTitle && (
                      <p className="text-lg text-bw-muted">
                        {module11.sourceTitle}
                        {module11.sourceYear && <span className="ml-1">({module11.sourceYear})</span>}
                      </p>
                    )}
                  </div>
                )}

                {/* Poster: film poster image */}
                {module11.type === "poster" && module11.imageUrl && (
                  <div className="text-center space-y-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-block rounded-2xl overflow-hidden border border-white/[0.08]"
                      style={{ boxShadow: "0 0 60px rgba(225,29,72,0.1), 0 8px 32px rgba(0,0,0,0.4)" }}
                    >
                      <SafeImage
                        src={module11.imageUrl}
                        alt={module11.sourceTitle || "Affiche"}
                        width={600}
                        height={900}
                        className="max-h-[55vh] object-contain"
                      />
                    </motion.div>
                    {module11.sourceTitle && (
                      <p className="text-lg text-bw-muted">
                        {module11.sourceTitle}
                        {module11.sourceYear && <span className="ml-1">({module11.sourceYear})</span>}
                      </p>
                    )}
                  </div>
                )}

                {/* Debat: statement + options display */}
                {module11.type === "debat" && (
                  <div className="text-center space-y-6">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-8 py-8 mx-auto max-w-3xl rounded-2xl border border-white/[0.08]"
                      style={{ background: "linear-gradient(135deg, rgba(225,29,72,0.06), rgba(26,26,26,0.9))" }}
                    >
                      <span className="text-4xl mb-4 block">⚖️</span>
                      <p className="text-2xl sm:text-3xl font-bold text-bw-heading leading-relaxed">{module11.text}</p>
                    </motion.div>
                    <div className="flex gap-4 justify-center">
                      {module11.debatOptions?.map((opt, i) => (
                        <motion.div
                          key={opt.key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="px-6 py-4 rounded-2xl border border-white/[0.08] bg-bw-surface text-center min-w-[140px]"
                        >
                          <span className="text-3xl block mb-2">
                            {opt.key === "daccord" ? "👍" : opt.key === "pasdaccord" ? "👎" : "🤔"}
                          </span>
                          <p className="text-lg font-medium text-bw-heading">{opt.label}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live counter */}
                {session.status === "responding" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                  >
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-bw-surface border border-white/[0.06]">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-2.5 h-2.5 rounded-full bg-green-400"
                      />
                      <span className="text-lg tabular-nums">
                        <span className="font-bold text-bw-heading">{data.responsesCount}</span>
                        <span className="text-bw-muted">/{data.connectedCount}</span>
                      </span>
                      <span className="text-bw-muted">réponses</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* REVIEWING (Module 1 — Positioning) — show final option distribution */}
            {session.status === "reviewing" &&
              session.currentModule === 1 &&
              data.module1?.type === "positioning" &&
              data.module1.questions && (
                <motion.div
                  key="m1-pos-reviewing"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="max-w-3xl w-full space-y-5"
                >
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bw-violet to-bw-violet/60 mx-auto flex items-center justify-center">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <path d="M22 4 12 14.01l-3-3" />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold uppercase tracking-wider px-5 py-2 rounded-full inline-block bg-bw-violet/20 text-bw-violet">
                      Résultats — Q{(session.currentSituationIndex || 0) + 1}/8
                    </span>
                    {data.module1.questions[session.currentSituationIndex || 0] && (
                      <p className="text-3xl leading-snug font-medium px-4">
                        {data.module1.questions[session.currentSituationIndex || 0].text}
                      </p>
                    )}
                  </div>
                  {data.module1.questions[session.currentSituationIndex || 0]?.options && (
                    <div className="space-y-4">
                      {data.module1.questions[session.currentSituationIndex || 0].options!.map((opt, i) => {
                        const count = data.module1!.optionDistribution?.[opt.key] || 0;
                        const total =
                          data.module1!.responseCounts?.[session.currentSituationIndex || 0] || connectedCount;
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        const colors = ["#8B5CF6", "#4ECDC4", "#FF6B35", "#F59E0B"];
                        const color = colors[i % colors.length];
                        const isWinner =
                          pct > 0 &&
                          pct ===
                            Math.max(
                              ...(data.module1!.questions![session.currentSituationIndex || 0].options || []).map(
                                (o) => {
                                  const c = data.module1!.optionDistribution?.[o.key] || 0;
                                  return total > 0 ? Math.round((c / total) * 100) : 0;
                                },
                              ),
                            );
                        return (
                          <motion.div
                            key={opt.key}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.12 }}
                            className="flex items-center gap-4"
                          >
                            <motion.span
                              animate={isWinner ? { scale: [1, 1.15, 1] } : {}}
                              transition={isWinner ? { repeat: Infinity, duration: 2 } : {}}
                              className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
                              style={{
                                backgroundColor: `${color}25`,
                                color,
                                border: isWinner ? `2px solid ${color}` : "none",
                              }}
                            >
                              {opt.key.toUpperCase()}
                            </motion.span>
                            <div className="flex-1 space-y-1">
                              <span className="text-lg text-bw-text">{opt.label}</span>
                              <div
                                className="h-5 rounded-full overflow-hidden"
                                style={{ background: "rgba(34,37,43,0.8)" }}
                              >
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, delay: 0.3 + i * 0.12 }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                              </div>
                            </div>
                            <span className="text-3xl font-bold flex-shrink-0 w-20 text-right" style={{ color }}>
                              {pct}%
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-center text-bw-muted text-sm">
                    {responsesCount} réponse{responsesCount > 1 ? "s" : ""} reçues
                  </p>
                </motion.div>
              )}

            {/* REVIEWING (Module 1 — Notebook) — carnets soumis summary */}
            {session.status === "reviewing" && session.currentModule === 1 && data.module1?.type === "notebook" && (
              <motion.div
                key="m1-notebook-reviewing"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-3xl w-full text-center space-y-5"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-bw-violet to-bw-violet/60 mx-auto flex items-center justify-center"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="M22 4 12 14.01l-3-3" />
                  </svg>
                </motion.div>
                <h2 className="text-3xl font-bold">Carnets d&apos;idées reçus</h2>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="text-6xl font-bold text-bw-violet tabular-nums"
                >
                  {data.module1.responsesCount || 0}
                </motion.div>
                <p className="text-xl text-bw-muted">
                  {(data.module1.responsesCount || 0) === connectedCount
                    ? "Tout le monde a écrit !"
                    : `sur ${connectedCount} élève${connectedCount > 1 ? "s" : ""}`}
                </p>
                <p className="text-sm text-bw-muted">
                  Le facilitateur peut maintenant lire les meilleures idées à voix haute
                </p>
              </motion.div>
            )}

            {/* VOTING — show vote results live */}
            {session.status === "voting" && (
              <motion.div
                key="voting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl w-full space-y-6"
              >
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bw-primary to-bw-primary/60 mx-auto flex items-center justify-center">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold">Vote en cours</h2>
                  {session.timerEndsAt && new Date(session.timerEndsAt).getTime() > Date.now() && (
                    <CountdownTimer endsAt={session.timerEndsAt} size="lg" />
                  )}
                  {voteData && (
                    <p className="text-lg text-bw-muted">
                      {voteData.totalVotes} vote{voteData.totalVotes > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                {/* Podium — top 3 (only show with 3+ results, otherwise list is enough) */}
                {voteData && voteData.results.length >= 3 && (
                  <div className="flex items-end justify-center gap-3 pt-4">
                    {[1, 0, 2].map((rank) => {
                      const vr = voteData.results[rank];
                      if (!vr) return null;
                      const heights = [160, 120, 90];
                      const colors = ["#FF6B35", "#4ECDC4", "#8B5CF6"];
                      const medals = ["1er", "2e", "3e"];
                      const pct = voteData.totalVotes > 0 ? Math.round((vr.count / voteData.totalVotes) * 100) : 0;
                      return (
                        <motion.div
                          key={rank}
                          className="flex flex-col items-center gap-2 w-36"
                          initial={{ opacity: 0, y: 40 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + rank * 0.15, type: "spring", stiffness: 200, damping: 20 }}
                        >
                          <span className="text-3xl">{vr.response.students?.avatar}</span>
                          <span className="text-xs text-bw-muted truncate max-w-full">
                            {vr.response.students?.display_name}
                          </span>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: heights[rank] }}
                            transition={{ delay: 0.5 + rank * 0.15, type: "spring", stiffness: 150, damping: 20 }}
                            className="w-full rounded-t-xl flex flex-col items-center justify-end pb-3"
                            style={{
                              background: `linear-gradient(180deg, ${colors[rank]}40, ${colors[rank]}15)`,
                              border: `1px solid ${colors[rank]}30`,
                              borderBottom: "none",
                            }}
                          >
                            <span className="text-2xl font-bold" style={{ color: colors[rank] }}>
                              {pct}%
                            </span>
                            <span className="text-xs font-semibold text-bw-muted">{medals[rank]}</span>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
                {voteData && voteData.results.length > 0 && (
                  <div className="space-y-4">
                    {voteData.results.slice(0, 5).map((vr, i) => {
                      const pct = voteData.totalVotes > 0 ? Math.round((vr.count / voteData.totalVotes) * 100) : 0;
                      return (
                        <motion.div
                          key={vr.response.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="rounded-xl p-5 backdrop-blur-md"
                          style={{
                            background: "rgba(34,37,43,0.7)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                          }}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{vr.response.students?.avatar}</span>
                              <span className="text-lg">{vr.response.students?.display_name}</span>
                            </div>
                            <span className="text-3xl font-bold" style={{ color: i === 0 ? "#FF6B35" : "#888" }}>
                              {pct}%
                            </span>
                          </div>
                          <p className="text-lg text-bw-text mb-2">{vr.response.text}</p>
                          {screenReactions && screenReactions[vr.response.id] && (
                            <div className="mb-2">
                              <ReactionBar
                                responseId={vr.response.id}
                                sessionId={sessionId}
                                counts={screenReactions[vr.response.id]}
                              />
                            </div>
                          )}
                          <div
                            className="w-full rounded-full h-3 overflow-hidden"
                            style={{ background: "rgba(18,20,24,0.8)" }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: i === 0 ? "#FF6B35" : "#4ECDC4" }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* REVIEWING — progressive reveal mode */}
            {session.status === "reviewing" && revealPhase != null && (
              <RevealMode
                phase={revealPhase}
                responsesCount={data?.responsesCount || 0}
                responses={revealResponses || []}
                categoryColor={categoryColor}
                situationPrompt={situation?.prompt || ""}
              />
            )}

            {/* REVIEWING — collective choice celebration */}
            {session.status === "reviewing" && revealPhase == null && collectiveChoice && (
              <motion.div
                key={`result-${collectiveChoice.id}`}
                className="max-w-3xl w-full text-center space-y-5 relative"
              >
                {/* Phase 1: Black fade overlay (0→0.5s) */}
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="fixed inset-0 z-40 bg-black pointer-events-none"
                />
                {/* Phase 2: "La classe a choisi..." text (0.4→1.2s) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{ times: [0, 0.2, 0.7, 1], duration: 1.8, delay: 0.3 }}
                  className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                >
                  <span className="text-3xl font-cinema tracking-[0.2em] uppercase text-bw-gold">
                    La classe a choisi...
                  </span>
                </motion.div>
                {/* Phase 3: Star icon reveal (1.5s) */}
                <motion.div
                  initial={{ scale: 0, rotate: -180, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ delay: 1.8, type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-full mx-auto flex items-center justify-center relative"
                  style={{
                    background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(255,107,53,0.15))",
                    border: "2px solid rgba(245,158,11,0.5)",
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 2 }}
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: "0 0 40px rgba(245,158,11,0.4), 0 0 80px rgba(245,158,11,0.2)" }}
                  />
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </motion.div>
                {/* Phase 4: Category badge slide-in (2s) */}
                <div className="space-y-4">
                  <motion.span
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.2, type: "spring", stiffness: 200, damping: 20 }}
                    className="text-lg font-semibold uppercase tracking-wider px-5 py-2 rounded-full inline-block"
                    style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                  >
                    {collectiveChoice.restitution_label || collectiveChoice.category}
                  </motion.span>
                  {/* Phase 5: Chosen text with animated bar (2.4s) */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.6, type: "spring", stiffness: 120, damping: 15 }}
                    className="relative"
                  >
                    <p className="text-4xl leading-snug font-medium">{collectiveChoice.chosen_text}</p>
                    {/* Animated underline bar */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 3.0, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                      className="h-1 rounded-full mx-auto mt-4 origin-left"
                      style={{
                        background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}60)`,
                        maxWidth: "200px",
                      }}
                    />
                  </motion.div>
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.4 }}
                  className="text-lg text-bw-muted"
                >
                  Choix collectif de la classe
                </motion.p>
              </motion.div>
            )}

            {/* REVIEWING — applause meter from reactions during voting phase */}
            {session.status === "reviewing" &&
              revealPhase == null &&
              collectiveChoice &&
              voteData &&
              voteData.results.length >= 2 &&
              screenReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 4.5 }}
                  className="w-full mt-8"
                >
                  <ApplauseMeter
                    entries={voteData.results.slice(0, 5).map((vr) => {
                      const reactionCount = screenReactions[vr.response.id]
                        ? Object.values(screenReactions[vr.response.id]).reduce((sum, r) => sum + (r?.count || 0), 0)
                        : vr.count;
                      return {
                        responseId: vr.response.id,
                        text: vr.response.text,
                        studentName: vr.response.students?.display_name || "?",
                        avatar: vr.response.students?.avatar || "🎭",
                        clapCount: reactionCount,
                      };
                    })}
                    accentColor={categoryColor}
                    topN={5}
                  />
                </motion.div>
              )}

            {/* FIX #4: REVIEWING without choice yet — show last vote results instead of empty screen */}
            {session.status === "reviewing" &&
              revealPhase == null &&
              !collectiveChoice &&
              !isM2ECComparison &&
              !(
                session.currentModule === 1 &&
                (data.module1?.type === "positioning" || data.module1?.type === "notebook")
              ) && (
                <motion.div
                  key="reviewing-wait"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-3xl w-full space-y-6"
                >
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bw-violet to-bw-violet/60 mx-auto flex items-center justify-center">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold">Le facilitateur choisit...</h2>
                  </div>
                  {/* Show last vote results as context */}
                  {voteData && voteData.results.length > 0 && (
                    <div className="space-y-3">
                      {voteData.results.slice(0, 3).map((vr, i) => {
                        const pct = voteData.totalVotes > 0 ? Math.round((vr.count / voteData.totalVotes) * 100) : 0;
                        return (
                          <motion.div
                            key={vr.response.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-xl p-4 flex items-center gap-4 backdrop-blur-sm"
                            style={{ background: "rgba(34,37,43,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-xl">{vr.response.students?.avatar}</span>
                              <p className="text-base text-bw-text truncate">{vr.response.text}</p>
                            </div>
                            <span
                              className="text-xl font-bold flex-shrink-0"
                              style={{ color: i === 0 ? "#FF6B35" : "#888" }}
                            >
                              {pct}%
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

            {/* PAUSED */}
            {session.status === "paused" && (
              <motion.div
                key="paused"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-6"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-bw-amber to-bw-amber/40 mx-auto flex items-center justify-center">
                  <div className="flex gap-2">
                    <div className="w-3 h-10 bg-white rounded-sm" />
                    <div className="w-3 h-10 bg-white rounded-sm" />
                  </div>
                </div>
                <p className="text-3xl text-bw-muted">Pause</p>
              </motion.div>
            )}

            {/* DONE — Cinema celebration */}
            {session.status === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-5 max-w-3xl w-full"
              >
                {/* Phase 1: Clap */}
                {donePhase === "clap" && (
                  <motion.div
                    initial={{ scale: 1.5, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="space-y-6"
                  >
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-32 h-32 rounded-full mx-auto flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,107,53,0.2), rgba(139,92,246,0.15))",
                        border: "2px solid rgba(255,107,53,0.4)",
                        boxShadow: "0 0 80px rgba(255,107,53,0.3)",
                      }}
                    >
                      <svg
                        width="56"
                        height="56"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <rect x="2" y="2" width="20" height="20" rx="2.18" />
                        <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" />
                      </svg>
                    </motion.div>
                    <h2 className="text-5xl font-bold">
                      C&apos;est dans la <span className="text-bw-primary">boite</span> !
                    </h2>
                  </motion.div>
                )}

                {/* Phase 2: Title card with stats */}
                {donePhase === "title" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 150, damping: 15 }}
                    className="space-y-6"
                  >
                    <p className="text-sm uppercase tracking-[0.5em] text-bw-muted font-medium">Un film de</p>
                    <h2 className="text-6xl font-bold font-cinema tracking-wider text-white">
                      {session.title || "Notre Film"}
                    </h2>
                    {templateInfo && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl px-6 py-2 rounded-full inline-block"
                        style={{
                          backgroundColor: `${moduleColor}20`,
                          color: moduleColor,
                          border: `1px solid ${moduleColor}40`,
                        }}
                      >
                        {templateInfo}
                      </motion.span>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center justify-center gap-8"
                    >
                      <div className="text-center">
                        <p className="text-3xl font-bold text-bw-teal">{connectedCount}</p>
                        <p className="text-xs text-bw-muted uppercase tracking-wider mt-1">
                          cinéaste{connectedCount > 1 ? "s" : ""}
                        </p>
                      </div>
                      {responsesCount > 0 && (
                        <div className="text-center">
                          <p className="text-3xl font-bold text-bw-primary">{responsesCount}</p>
                          <p className="text-xs text-bw-muted uppercase tracking-wider mt-1">
                            réponse{responsesCount > 1 ? "s" : ""}
                          </p>
                        </div>
                      )}
                      {allChoices && allChoices.length > 0 && (
                        <div className="text-center">
                          <p className="text-3xl font-bold text-purple-400">{allChoices.length}</p>
                          <p className="text-xs text-bw-muted uppercase tracking-wider mt-1">
                            choix collectif{allChoices.length > 1 ? "s" : ""}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}

                {/* Phase 3: Credits scroll */}
                {donePhase === "credits" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    <p className="text-sm uppercase tracking-[0.5em] text-bw-muted font-medium">
                      Les choix de la classe
                    </p>
                    <div className="max-h-[50vh] overflow-y-auto space-y-3 px-4 scrollbar-thin">
                      {allChoices && allChoices.length > 0 ? (
                        allChoices.map((choice, i) => (
                          <motion.div
                            key={choice.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.3 }}
                            className="rounded-xl p-4 backdrop-blur-md text-left"
                            style={{
                              background: "rgba(34,37,43,0.6)",
                              borderLeft: `3px solid ${CATEGORY_COLORS[choice.category] || moduleColor}`,
                            }}
                          >
                            <span
                              className="text-xs uppercase tracking-wider font-medium"
                              style={{ color: CATEGORY_COLORS[choice.category] || moduleColor }}
                            >
                              {choice.restitution_label || choice.category}
                            </span>
                            <p className="text-lg text-white mt-1">{choice.chosen_text}</p>
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-bw-muted text-lg">Bravo à toute la classe !</p>
                      )}
                    </div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (allChoices?.length || 0) * 0.3 + 0.5 }}
                      className="text-xl text-bw-muted mt-8"
                    >
                      Merci à tous !
                    </motion.p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ═══ STORY FILMSTRIP — collective choices ═══ */}
        {allChoices && allChoices.length > 0 && session.status !== "done" && (
          <StoryFilmstrip allChoices={allChoices} moduleColor={moduleColor} />
        )}

        {/* Small floating QR when session is active but no students yet */}
        {!noModuleSelected && session.status !== "done" && connectedCount === 0 && joinUrl && (
          <div className="fixed bottom-20 right-8 opacity-60 hover:opacity-100 transition-opacity">
            <div
              className="bg-white p-2 rounded-lg"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)" }}
            >
              <QRCodeSVG value={joinUrl} size={80} />
            </div>
          </div>
        )}

        {/* Highlighted responses — teacher-projected, anchored bottom */}
        {highlightedResponses && highlightedResponses.length > 0 && (
          <TicketReveal responses={highlightedResponses} maxVisible={3} />
        )}

        {/* Live response counter bar */}
        <AnimatePresence>
          {session.status === "responding" && connectedCount > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative z-20 px-6 py-2 flex items-center gap-3"
              style={{ background: "rgba(255,255,255,0.03)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="text-sm text-white font-medium tabular-nums">
                {responsesCount}/{connectedCount} ont repondu
              </span>
              <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #FF6B35, #4ECDC4)" }}
                  animate={{ width: `${connectedCount > 0 ? (responsesCount / connectedCount) * 100 : 0}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer
          className="px-6 py-2 flex justify-between items-center text-bw-muted flex-shrink-0 relative z-10 backdrop-blur-sm"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <span className="text-xs text-bw-muted/60">{session.joinCode && `Code : ${session.joinCode}`}</span>
          <span className="text-xs text-bw-muted/60">
            {seanceIntro ? `${seanceIntro.subtitle} · ${seanceIntro.title}` : "Banlieuwood"}
          </span>
        </footer>

        <HelpButton
          pageKey="screen"
          tips={[
            {
              title: "Ecran de projection",
              description:
                "Cet ecran est fait pour etre projete en classe. Il affiche la question, les reponses et les resultats en temps reel.",
            },
            {
              title: "Reactions en direct",
              description:
                "Des emojis flottants apparaissent quand les eleves envoient leurs reponses. L'ecran s'anime tout seul !",
            },
            {
              title: "Le film se construit",
              description:
                "La bande en bas montre tous les choix collectifs deja faits. Le film se construit sous vos yeux.",
            },
          ]}
        />
      </div>
    </ErrorBoundary>
  );
}
