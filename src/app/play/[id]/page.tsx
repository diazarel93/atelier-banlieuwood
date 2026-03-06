"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import { useSessionPolling, SessionState } from "@/hooks/use-session-polling";
import { useRealtimeInvalidation } from "@/hooks/use-realtime-invalidation";
import { useOfflineQueue } from "@/hooks/use-offline-queue";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useSound } from "@/hooks/use-sound";
import { CATEGORY_COLORS, SEANCE_SITUATIONS, MODULE_SEANCE_SITUATIONS, TOTAL_SITUATIONS, getSeanceMax } from "@/lib/constants";
import { getCoachTip } from "@/lib/coach-tips";
import { CountdownTimer } from "@/components/countdown-timer";
import { CoachBubble } from "@/components/play/coach-bubble";
import { BrandLogo } from "@/components/brand-logo";
import type { AvatarOptions } from "@/components/avatar-dicebear";
import { CharacterCard } from "@/components/module10/character-card";
import { ErrorBoundary } from "@/components/error-boundary";
import { HelpButton } from "@/components/help-button";
import { fireConfetti, haptic } from "@/components/play/utils";
import { XpToast } from "@/components/play/xp-toast";
import { XpBar } from "@/components/play/xp-bar";
import { XP_RESPOND, XP_VOTE, XP_RETAINED, XP_STREAK_BONUS_PER, XP_COMBO_PER, getLevel } from "@/lib/xp";
import { CinematicIntro } from "@/components/play/cinematic-intro";
import { CinemaFade } from "@/components/play/cinema-fade";
import { WaitingState } from "@/components/play/states/waiting-state";
import { SituationState } from "@/components/play/states/situation-state";
import { RelanceState } from "@/components/play/states/relance-state";
import { SentState } from "@/components/play/states/sent-state";
import { VoteState } from "@/components/play/states/vote-state";
import { ResultState } from "@/components/play/states/result-state";
import { PausedState } from "@/components/play/states/paused-state";
import { DoneState } from "@/components/play/states/done-state";
import { PositioningState } from "@/components/play/module-1/positioning-state";
import { ImageQuestionState } from "@/components/play/module-1/image-question-state";
import { NotebookState } from "@/components/play/module-1/notebook-state";
import { ChecklistState } from "@/components/play/module-2/checklist-state";
import { SceneBuilderState } from "@/components/play/module-2/scene-builder-state";
import { BudgetState } from "@/components/play/module-9/budget-state";
import { EtsiWriterState } from "@/components/play/module-10/etsi-writer-state";
import { IdeaBankState } from "@/components/play/module-10/idea-bank-state";
import { AvatarDoneState } from "@/components/play/module-10/avatar-done-state";
import { AvatarBuilderState } from "@/components/play/module-10/avatar-builder-state";
import { ObjectifObstacleState } from "@/components/play/module-10/objectif-obstacle-state";
import { PitchAssemblyState } from "@/components/play/module-10/pitch-assembly-state";
import { ChronoTestState } from "@/components/play/module-10/chrono-test-state";
import { PitchConfrontationState } from "@/components/play/module-10/pitch-confrontation-state";
import { CineDebatState } from "@/components/play/module-11/cine-debat-state";
import { MancheVoteState } from "@/components/play/module-12/manche-vote-state";
import { TeamChat } from "@/components/play/team-chat";
import { PowerUpsBar } from "@/components/play/power-ups-bar";
import { CelebrationOverlay } from "@/components/celebrations";


// ——— Main Page ———
export default function PlayPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [voting, setVoting] = useState(false);
  const [budgetDone, setBudgetDone] = useState(false);
  const [checklistDone, setChecklistDone] = useState(false);
  const [sceneDone, setSceneDone] = useState(false);
  const [etsiDone, setEtsiDone] = useState(false);
  const [characterCard, setCharacterCard] = useState<{
    personnage: { prenom: string; age: string; trait: string; avatar: AvatarOptions };
    objectif?: string;
    obstacle?: string;
    pitchText?: string;
    chronoSeconds?: number;
    revealLevel: 0 | 1 | 2 | 3;
  } | null>(null);
  const [storyContext, setStoryContext] = useState<Record<string, string>>({});
  const [relanceData, setRelanceData] = useState<{
    text: string;
    responseId: string;
    situationId: string;
  } | null>(null);
  const [handRaised, setHandRaised] = useState(false);
  const [celebration, setCelebration] = useState<{ type: "achievement" | "level_up" | "streak" | "retained" | "combo"; title: string; subtitle?: string; icon?: string } | null>(null);

  // Engagement tracking
  const [streak, setStreak] = useState(1);
  const [comboCount, setComboCount] = useState(0);
  const [collectedCategories, setCollectedCategories] = useState<{ key: string; label: string; color: string }[]>([]);
  const [gameStats, setGameStats] = useState({ responses: 0, retained: 0, bestStreak: 1 });
  const [sessionXp, setSessionXp] = useState(0);
  const [xpDelta, setXpDelta] = useState<{ amount: number; key: number } | null>(null);
  const [lastXpGain, setLastXpGain] = useState(0);
  const prevLevelRef = useRef(0);

  const [noStudent, setNoStudent] = useState(false);
  const [studentLoaded, setStudentLoaded] = useState(false);
  const [studentDisplayName, setStudentDisplayName] = useState("Eleve");
  const [studentAvatar, setStudentAvatar] = useState("🎬");
  const [waitingFullscreen, setWaitingFullscreen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [broadcastMsg, setBroadcastMsg] = useState<string | null>(null);
  const [coachTip, setCoachTip] = useState<string | null>(null);
  const coachShownForRef = useRef<string | null>(null);
  const lastBroadcastAt = useRef<string | null>(null);
  const isOnline = useOnlineStatus();
  useRealtimeInvalidation(sessionId);
  const { submitWithQueue, pendingCount } = useOfflineQueue();

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  // Reconnection toast
  const wasOnlineRef = useRef(true);
  useEffect(() => {
    if (isOnline && !wasOnlineRef.current) {
      toast.success("Reconnecté", { duration: 2000 });
    }
    wasOnlineRef.current = isOnline;
  }, [isOnline]);

  // Play jingle on first load
  useEffect(() => {
    if (showIntro) {
      const t = setTimeout(() => play("jingle"), 300);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Recover student info from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`bw-student-${sessionId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setStudentId(parsed.studentId);
        if (parsed.displayName) setStudentDisplayName(parsed.displayName);
        if (parsed.avatar) setStudentAvatar(parsed.avatar);
      } else {
        setNoStudent(true);
      }
    } catch {
      // Corrupted localStorage — force re-join
      localStorage.removeItem(`bw-student-${sessionId}`);
      setNoStudent(true);
    }
    setStudentLoaded(true);
  }, [sessionId]);

  const { data, isLoading, error } = useSessionPolling(sessionId, studentId);
  const { play } = useSound({ muted: data?.session?.muteSounds });

  const isFreeMode = data?.session?.mode === "free";

  // Broadcast message from teacher
  useEffect(() => {
    if (!data?.session?.broadcastMessage || !data.session.broadcastAt) return;
    if (data.session.broadcastAt === lastBroadcastAt.current) return;
    lastBroadcastAt.current = data.session.broadcastAt;
    setBroadcastMsg(data.session.broadcastMessage);
    play("vote");
    // Auto-dismiss after 12s
    const t = setTimeout(() => setBroadcastMsg(null), 12000);
    return () => clearTimeout(t);
  }, [data?.session?.broadcastMessage, data?.session?.broadcastAt, play]);

  // Smart scroll to top on game state change
  const prevViewKeyRef = useRef<string>("");
  useEffect(() => {
    if (!data) return;
    const vk = `${data.session.status}-${data.situation?.id || ""}-${data.hasResponded}-${data.hasVoted}`;
    if (prevViewKeyRef.current && vk !== prevViewKeyRef.current) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    prevViewKeyRef.current = vk;
  }, [data]);

  // Coach bubble — show once per situation/status change
  useEffect(() => {
    if (!data || showIntro) return;
    const status = data.session.status;
    const sitId = data.situation?.id || "";
    // Build a unique key for this game state so coach shows once per situation+state
    let coachKey = "";
    let category = data.situation?.category || "default";
    if (status === "voting" && sitId) {
      coachKey = `vote-${sitId}`;
      category = "vote";
    } else if (status === "responding" && sitId && !data.hasResponded) {
      coachKey = `respond-${sitId}`;
      // category comes from situation
    } else if (relanceData) {
      coachKey = `relance-${relanceData.responseId}`;
      category = "relance";
    } else {
      return; // No coach tip for waiting/done/paused/sent states
    }
    if (coachKey === coachShownForRef.current) return;
    coachShownForRef.current = coachKey;
    setCoachTip(getCoachTip(category));
  }, [data?.session?.status, data?.situation?.id, data?.hasResponded, relanceData, showIntro]); // eslint-disable-line react-hooks/exhaustive-deps

  // Level-up detection
  useEffect(() => {
    const currentLevel = getLevel(sessionXp).level;
    if (currentLevel > prevLevelRef.current && prevLevelRef.current > 0) {
      play("levelUp");
      fireConfetti();
      const info = getLevel(sessionXp);
      toast.success(`Niveau ${info.level} — ${info.name} !`, { duration: 4000 });
    }
    prevLevelRef.current = currentLevel;
  }, [sessionXp, play]);

  // Reset budgetDone when module or situation changes
  // Only clear relanceData if module changes (not situation index — free mode auto-advances)
  const currentModule = data?.session?.currentModule;
  const currentSituationIndex = data?.session?.currentSituationIndex;
  useEffect(() => {
    setBudgetDone(false);
    setChecklistDone(false);
    setSceneDone(false);
  }, [currentModule, currentSituationIndex]);
  useEffect(() => {
    setRelanceData(null);
  }, [currentModule]);

  // Reconnect Module 10 character card from API data on page reload
  const m10Data = data?.module10;
  useEffect(() => {
    if (characterCard || !m10Data?.personnage || !m10Data?.submitted) return;
    if (currentModule !== 10 || data?.session?.currentSeance !== 2) return;
    let rl: 0 | 1 | 2 | 3 = 0;
    const persoData = { prenom: m10Data.personnage.prenom, age: m10Data.personnage.age, trait: m10Data.personnage.trait, avatar: m10Data.personnage.avatar as unknown as AvatarOptions };
    const rebuilt: Parameters<typeof setCharacterCard>[0] = { personnage: persoData, revealLevel: rl };
    if (m10Data.objectif) { rebuilt.objectif = m10Data.objectif; rebuilt.obstacle = m10Data.obstacle ?? undefined; rl = 1; }
    if (m10Data.pitchText) { rebuilt.pitchText = m10Data.pitchText; rl = 2; }
    if (m10Data.chronoSeconds != null) { rebuilt.chronoSeconds = m10Data.chronoSeconds; rl = 3; }
    rebuilt.revealLevel = rl;
    setCharacterCard(rebuilt);
  }, [characterCard, m10Data, currentModule, data?.session?.currentSeance]);

  // Fetch story context for budget (Module 9, old M2)
  useEffect(() => {
    if (currentModule !== 9) return;
    fetch(`/api/sessions/${sessionId}/budget?context=true`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.storyContext) setStoryContext(d.storyContext);
      })
      .catch(() => { /* Budget context is optional — student can still play */ });
  }, [sessionId, currentModule]);

  // Play reveal sound when collective choice appears + celebrate if student's idea was chosen
  const prevChoiceRef = useRef<string | null>(null);
  useEffect(() => {
    const choiceId = data?.collectiveChoice?.id || null;
    if (choiceId && choiceId !== prevChoiceRef.current) {
      play("reveal");
      haptic(20);

      // Collect category badge
      if (data?.collectiveChoice) {
        const cat = data.collectiveChoice.category;
        const label = data.collectiveChoice.restitution_label || cat;
        const color = CATEGORY_COLORS[cat] || "#FF6B35";
        setCollectedCategories((prev) => {
          if (prev.some((c) => c.key === cat && c.label === label)) return prev;
          return [...prev, { key: cat, label, color }];
        });
      }

      if (data?.isMyResponseChosen) {
        const newCombo = comboCount + 1;
        setComboCount(newCombo);
        setGameStats((prev) => ({ ...prev, retained: prev.retained + 1 }));
        // XP gain for retained + combo bonus
        const comboBonus = newCombo >= 2 ? newCombo * XP_COMBO_PER : 0;
        const retainedXp = XP_RETAINED + comboBonus;
        setSessionXp((prev) => prev + retainedXp);
        setXpDelta({ amount: retainedXp, key: Date.now() });
        setTimeout(() => {
          play("success");
          // Escalating confetti for combos
          if (newCombo >= 3) {
            fireConfetti();
            setTimeout(() => fireConfetti(), 300);
          } else {
            fireConfetti();
          }
          toast.success(
            newCombo >= 2
              ? `Combo x${newCombo} ! Encore ton idée retenue !`
              : "Ton idée a été retenue par la classe !",
            { duration: 5000 }
          );
        }, 2500); // After suspense reveal
      }
    }
    prevChoiceRef.current = choiceId;
  }, [data?.collectiveChoice?.id, data?.isMyResponseChosen, play]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRespond(text: string) {
    if (!studentId || !data?.situation) return;
    setSubmitting(true);

    try {
      const { ok, data: responseData } = await submitWithQueue(
        `/api/sessions/${sessionId}/respond`,
        { studentId, situationId: data.situation.id, text },
        "respond"
      );

      if (!ok) {
        toast.error((responseData as { error?: string })?.error || "Erreur lors de l'envoi");
      } else {
        play("send");
        haptic(10);

        // Track streak + stats
        setStreak((prev) => prev + 1);
        setGameStats((prev) => ({
          ...prev,
          responses: prev.responses + 1,
          bestStreak: Math.max(prev.bestStreak, streak + 1),
        }));

        // XP gain
        const streakBonus = streak >= 2 ? streak * XP_STREAK_BONUS_PER : 0;
        const xpGain = XP_RESPOND + streakBonus;
        setSessionXp((prev) => prev + xpGain);
        setXpDelta({ amount: xpGain, key: Date.now() });
        setLastXpGain(xpGain);

        // Module 3/4: trigger AI relance
        const rd = responseData as { id?: string } | null;
        if ((data.session.currentModule === 3 || data.session.currentModule === 4) && rd?.id) {
          try {
            const relanceRes = await fetch(`/api/sessions/${sessionId}/relance`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                studentId,
                responseId: rd.id,
              }),
            });
            if (relanceRes.ok) {
              const { relanceText } = await relanceRes.json();
              if (relanceText) {
                setRelanceData({
                  text: relanceText,
                  responseId: rd.id,
                  situationId: data.situation.id,
                });
              }
            }
          } catch {
            // Relance failed silently — student continues normally
          }
        }
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRelanceSubmit(text: string) {
    if (!relanceData) return;
    try {
      await fetch(`/api/sessions/${sessionId}/relance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responseId: relanceData.responseId,
          relanceResponse: text,
        }),
      });
      play("send");
    } catch {
      // Silent fail
    }
    setRelanceData(null);
  }

  function handleRelanceSkip() {
    setRelanceData(null);
  }

  // Compute global progress for free mode (across all séances)
  const freeProgress = data ? (() => {
    const mod = data.session.currentModule;
    const seanceMap = MODULE_SEANCE_SITUATIONS[mod] ?? SEANCE_SITUATIONS;
    let completed = 0;
    for (let s = 1; s < data.session.currentSeance; s++) {
      completed += seanceMap[s] || 0;
    }
    completed += data.session.currentSituationIndex;
    const totalForModule = Object.values(seanceMap).reduce((a, b) => a + b, 0);
    return { current: completed + 1, total: totalForModule || TOTAL_SITUATIONS };
  })() : null;

  async function handleVote(chosenResponseId: string) {
    if (!studentId || !data?.situation) return;
    setVoting(true);

    try {
      const { ok, data: errData } = await submitWithQueue(
        `/api/sessions/${sessionId}/vote`,
        { studentId, situationId: data.situation.id, chosenResponseId },
        "vote"
      );

      if (!ok) {
        toast.error((errData as { error?: string })?.error || "Erreur lors du vote");
      } else {
        play("vote");
        // XP gain for voting
        setSessionXp((prev) => prev + XP_VOTE);
        setXpDelta({ amount: XP_VOTE, key: Date.now() });
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setVoting(false);
    }
  }

  // Determine which state to render
  function getView() {
    if (!data) return null;
    const { session, situation, hasResponded, hasVoted, voteOptions, collectiveChoice, connectedCount, responsesCount } = data;

    // Module 1 — Redesign Adrian — 3 types: positioning, image, notebook
    if (session.currentModule === 1 && data.module1 && (session.status === "responding" || (isFreeMode && session.status === "waiting"))) {
      switch (data.module1.type) {
        case "positioning":
          return (
            <PositioningState
              key={`m1-pos-${session.currentSituationIndex}`}
              module1={data.module1}
              sessionId={sessionId}
              studentId={studentId!}
              currentSituationIndex={session.currentSituationIndex}
              onAnswered={() => play("send")}
            />
          );
        case "image":
          return (
            <ImageQuestionState
              key={`m1-img-${data.module1.currentSeance}`}
              module1={data.module1}
              sessionId={sessionId}
              studentId={studentId!}
              onAnswered={() => play("send")}
            />
          );
        case "notebook":
          return (
            <NotebookState
              key="m1-notebook"
              module1={data.module1}
              sessionId={sessionId}
              studentId={studentId!}
              onAnswered={() => play("send")}
            />
          );
      }
    }

    // Module 1 waiting (guided mode)
    if (session.currentModule === 1 && data.module1 && session.status === "waiting") {
      if (data.module1.type === "image" && data.module1.image) {
        return (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-5 w-full max-w-md mx-auto px-4"
            >
              <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-bw-violet/20 text-bw-violet">
                {data.module1.image.title || `Image ${data.module1.image.position}`}
              </span>
              <div
                className="w-full rounded-xl overflow-hidden border border-white/[0.06] cursor-pointer"
                onClick={() => setWaitingFullscreen(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.module1.image.url}
                  alt={data.module1.image.title}
                  className="w-full object-contain"
                />
              </div>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-center space-y-1"
              >
                <p className="text-sm text-bw-muted">Observe bien cette image...</p>
                <p className="text-xs text-bw-muted">La question arrive bientôt</p>
              </motion.div>
            </motion.div>
            {/* Fullscreen overlay */}
            <AnimatePresence>
              {waitingFullscreen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                  onClick={() => setWaitingFullscreen(false)}
                >
                  <button
                    onClick={() => setWaitingFullscreen(false)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-colors z-10"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.module1.image.url}
                    alt={data.module1.image.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        );
      }
      // Positioning or notebook waiting
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-bw-violet/20 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round">
              {data.module1.type === "positioning"
                ? <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>
                : <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></>
              }
            </svg>
          </div>
          <p className="text-sm text-bw-violet font-medium">
            {data.module1.type === "positioning" ? "Positionnement" : "Carnet d'idées"}
          </p>
          <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}
            className="text-xs text-bw-muted">En attente du facilitateur...</motion.p>
        </motion.div>
      );
    }

    // ── MODULE 2: Émotion Cachée — special components ──
    // Séance 1 index 0 — Checklist
    if (session.currentModule === 2 && session.currentSeance === 1 && session.currentSituationIndex === 0 && session.status === "responding") {
      if (checklistDone || data.module5?.submitted) {
        return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} lastXpGain={lastXpGain} sessionId={sessionId} studentId={studentId ?? undefined} currentModule={session.currentModule} currentSeance={session.currentSeance} />;
      }
      if (data.module5?.type === "checklist") {
        return (
          <ChecklistState
            key="m2ec-checklist"
            sessionId={sessionId}
            studentId={studentId!}
            module5={data.module5}
            onDone={() => { setChecklistDone(true); play("send"); }}
          />
        );
      }
    }

    // Séance 2 index 1 — Scene Builder
    if (session.currentModule === 2 && session.currentSeance === 2 && session.currentSituationIndex === 1 && session.status === "responding") {
      if (sceneDone || data.module5?.submitted) {
        return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} lastXpGain={lastXpGain} sessionId={sessionId} studentId={studentId ?? undefined} currentModule={session.currentModule} currentSeance={session.currentSeance} />;
      }
      if (data.module5?.type === "scene-builder") {
        return (
          <SceneBuilderState
            key="m2ec-scene"
            sessionId={sessionId}
            studentId={studentId!}
            module5={data.module5}
            onDone={() => { setSceneDone(true); play("send"); }}
          />
        );
      }
    }

    // Séance 3 — Comparison display above standard question
    // The comparison data is shown in the situation prompt area, standard Q&A for the response
    // (comparison scenes are displayed on screen page for projection, students just answer the open questions)

    // ── MODULE 10: Et si... + Pitch — special components ──
    if (session.currentModule === 10 && data.module10 && session.status === "responding") {
      const m10 = data.module10;

      // Séance 1: Et si...
      if (session.currentSeance === 1) {
        if (m10.type === "etsi") {
          if (etsiDone || m10.submitted) return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} lastXpGain={lastXpGain} sessionId={sessionId} studentId={studentId ?? undefined} currentModule={session.currentModule} currentSeance={session.currentSeance} />;
          return <EtsiWriterState key="m10-etsi" module10={m10} sessionId={sessionId} studentId={studentId!} onDone={() => { setEtsiDone(true); play("send"); }} />;
        }
        if (m10.type === "idea-bank") {
          if (m10.submitted) return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} lastXpGain={lastXpGain} sessionId={sessionId} studentId={studentId ?? undefined} currentModule={session.currentModule} currentSeance={session.currentSeance} />;
          return <IdeaBankState key="m10-ideas" module10={m10} sessionId={sessionId} studentId={studentId!} onDone={() => play("send")} />;
        }
        // QCM falls through to standard Q&A below
      }

      // Séance 2: Pitch — progressive character card
      if (session.currentSeance === 2) {
        // Reconnection handled by useEffect above

        if (m10.type === "avatar") {
          if (characterCard) return <CharacterCard {...characterCard} responsesCount={responsesCount} connectedCount={connectedCount} />;
          if (m10.submitted && m10.personnage) return <CharacterCard personnage={{ prenom: m10.personnage.prenom, age: m10.personnage.age, trait: m10.personnage.trait, avatar: m10.personnage.avatar as unknown as AvatarOptions }} revealLevel={0} responsesCount={responsesCount} connectedCount={connectedCount} />;
          if (m10.submitted) return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} lastXpGain={lastXpGain} sessionId={sessionId} studentId={studentId ?? undefined} currentModule={session.currentModule} currentSeance={session.currentSeance} />;
          return <AvatarBuilderState key="m10-avatar" module10={m10} sessionId={sessionId} studentId={studentId!} onDone={(data) => { setCharacterCard({ personnage: data, revealLevel: 0 }); play("cardReveal"); }} />;
        }
        if (m10.type === "objectif") {
          if (characterCard && characterCard.revealLevel >= 1) return <CharacterCard {...characterCard} responsesCount={responsesCount} connectedCount={connectedCount} />;
          if (m10.submitted && characterCard) return <CharacterCard {...characterCard} objectif={m10.objectif ?? undefined} obstacle={m10.obstacle ?? undefined} revealLevel={1} responsesCount={responsesCount} connectedCount={connectedCount} />;
          if (m10.submitted) return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} lastXpGain={lastXpGain} sessionId={sessionId} studentId={studentId ?? undefined} currentModule={session.currentModule} currentSeance={session.currentSeance} />;
          // Late join: no personnage yet — let them create one first
          if (!m10.personnage) return <AvatarBuilderState key="m10-avatar-late" module10={m10} sessionId={sessionId} studentId={studentId!} onDone={(data) => { setCharacterCard({ personnage: data, revealLevel: 0 }); play("cardReveal"); }} />;
          return <ObjectifObstacleState key="m10-objectif" module10={m10} sessionId={sessionId} studentId={studentId!} onDone={(d) => { setCharacterCard((prev) => prev ? { ...prev, objectif: d.objectif, obstacle: d.obstacle, revealLevel: 1 } : prev); play("cardReveal"); }} />;
        }
        if (m10.type === "pitch") {
          if ((characterCard && characterCard.revealLevel >= 2) || m10.submitted) {
            if (characterCard) return <CharacterCard {...characterCard} pitchText={characterCard.pitchText || m10.pitchText || undefined} revealLevel={Math.max(characterCard.revealLevel, 2) as 0 | 1 | 2 | 3} responsesCount={responsesCount} connectedCount={connectedCount} />;
            return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} lastXpGain={lastXpGain} sessionId={sessionId} studentId={studentId ?? undefined} currentModule={session.currentModule} currentSeance={session.currentSeance} />;
          }
          // Late join: no personnage — create one first
          if (!m10.personnage) return <AvatarBuilderState key="m10-avatar-late" module10={m10} sessionId={sessionId} studentId={studentId!} onDone={(data) => { setCharacterCard({ personnage: data, revealLevel: 0 }); play("cardReveal"); }} />;
          return <PitchAssemblyState key="m10-pitch" module10={m10} sessionId={sessionId} studentId={studentId!} onDone={(d) => { setCharacterCard((prev) => prev ? { ...prev, pitchText: d.pitchText, revealLevel: 2 } : prev); play("cardReveal"); }} />;
        }
        if (m10.type === "chrono") {
          if ((characterCard && characterCard.revealLevel >= 3) || m10.submitted) {
            if (characterCard) return <CharacterCard {...characterCard} chronoSeconds={characterCard.chronoSeconds ?? m10.chronoSeconds ?? undefined} revealLevel={3} responsesCount={responsesCount} connectedCount={connectedCount} />;
            return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} lastXpGain={lastXpGain} sessionId={sessionId} studentId={studentId ?? undefined} currentModule={session.currentModule} currentSeance={session.currentSeance} />;
          }
          // Late join: no personnage — create one first
          if (!m10.personnage) return <AvatarBuilderState key="m10-avatar-late" module10={m10} sessionId={sessionId} studentId={studentId!} onDone={(data) => { setCharacterCard({ personnage: data, revealLevel: 0 }); play("cardReveal"); }} />;
          return <ChronoTestState key="m10-chrono" module10={m10} sessionId={sessionId} studentId={studentId!} onDone={(d) => { setCharacterCard((prev) => prev ? { ...prev, chronoSeconds: d.chronoSeconds, revealLevel: 3 } : prev); play("cardReveal"); fireConfetti(); }} />;
        }
        if (m10.type === "confrontation") {
          return <PitchConfrontationState key="m10-confrontation" module10={m10} sessionId={sessionId} studentId={studentId!} />;
        }
      }
    }

    // ── MODULE 11: Ciné-Débat — rich stimulus component ──
    if (session.currentModule === 11 && data.module11 && session.status === "responding") {
      if (hasResponded) return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} lastXpGain={lastXpGain} sessionId={sessionId} studentId={studentId ?? undefined} currentModule={session.currentModule} currentSeance={session.currentSeance} />;
      return (
        <CineDebatState
          key={`m11-${situation?.id}`}
          module11={data.module11}
          prompt={situation?.prompt || ""}
          nudgeText={situation?.nudgeText || null}
          onSubmit={handleRespond}
          submitting={submitting}
        />
      );
    }

    // ── MODULE 12: Construction Collective — manche vote ──
    if (session.currentModule === 12 && data.module12 && session.status === "responding") {
      return (
        <MancheVoteState
          key={`m12-${data.module12.manche}`}
          module12={data.module12}
          sessionId={sessionId}
          studentId={studentId!}
        />
      );
    }

    // Module 9 séance 2 — Budget game (other séances use regular Q&A)
    if (session.currentModule === 9 && (session.currentSeance || 1) === 2 && session.status === "responding") {
      if (budgetDone) {
        if (isFreeMode) return <SentState />;
        return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} lastXpGain={lastXpGain} sessionId={sessionId} studentId={studentId ?? undefined} currentModule={session.currentModule} currentSeance={session.currentSeance} />;
      }
      return <BudgetState sessionId={sessionId} studentId={studentId!} storyContext={storyContext} onDone={() => { setBudgetDone(true); play("send"); }} />;
    }

    // Done
    if (session.status === "done") return <DoneState sessionId={sessionId} stats={gameStats} xp={sessionXp} characterCard={characterCard} />;

    // Paused
    if (session.status === "paused") return <PausedState />;

    // AI Relance — show if pending
    // Free mode: always show (server already advanced, relance is for the previous question)
    // Guided mode: only show if still on the same situation
    if (relanceData && (isFreeMode || relanceData.situationId === situation?.id)) {
      return (
        <RelanceState
          key={`relance-${relanceData.responseId}`}
          relanceText={relanceData.text}
          onSubmit={handleRelanceSubmit}
          onSkip={handleRelanceSkip}
        />
      );
    }

    // Free mode: skip vote/review, just show situation or done
    if (isFreeMode) {
      if (session.status === "responding" && situation) {
        // In free mode, hasResponded means the server auto-advanced.
        // The polling will pick up the new situation, so just show the form.
        return <SituationState key={situation.id} situation={situation} onSubmit={handleRespond} submitting={submitting} />;
      }
      return <WaitingState session={session} connectedCount={connectedCount} />;
    }

    // Reviewing — show result if choice exists, otherwise wait
    if (session.status === "reviewing") {
      if (collectiveChoice) return <ResultState collectiveChoice={collectiveChoice} isMyResponseChosen={data.isMyResponseChosen} comboCount={comboCount} onReveal={() => play("drumroll")} />;
      return <WaitingState session={session} connectedCount={connectedCount} />;
    }

    // Voting
    if (session.status === "voting" && situation) {
      if (hasVoted) return <SentState />; // No counter needed during vote
      return <VoteState key={situation.id} voteOptions={voteOptions} situation={situation} sessionId={sessionId} studentId={studentId!} onVote={handleVote} voting={voting} />;
    }

    // Responding
    if (session.status === "responding" && situation) {
      if (hasResponded) return <SentState responsesCount={responsesCount} connectedCount={connectedCount} streak={streak} lastXpGain={lastXpGain} sessionId={sessionId} studentId={studentId ?? undefined} currentModule={session.currentModule} currentSeance={session.currentSeance} />;
      return <SituationState key={situation.id} situation={situation} onSubmit={handleRespond} submitting={submitting} />;
    }

    // Waiting (default)
    return <WaitingState session={session} connectedCount={connectedCount} />;
  }

  if (noStudent) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-16 h-16 rounded-full bg-bw-primary/20 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round">
            <rect x="2" y="2" width="20" height="20" rx="2.18" />
            <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" />
          </svg>
        </div>
        <p className="text-bw-muted text-center">Tu dois d&apos;abord rejoindre la partie</p>
        <a href="/join" className="text-bw-primary font-medium cursor-pointer">Rejoindre</a>
      </div>
    );
  }

  if (!studentLoaded || isLoading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
        {/* Skeleton header */}
        <div className="fixed top-0 left-0 right-0 z-10 bg-bw-bg border-b border-white/[0.06]">
          <div className="px-4 py-2.5 flex justify-between items-center">
            <div className="h-4 w-24 rounded bg-white/[0.06] animate-pulse" />
            <div className="h-3 w-16 rounded bg-white/[0.06] animate-pulse" />
            <div className="h-3 w-10 rounded bg-white/[0.06] animate-pulse" />
          </div>
          <div className="h-1 bg-white/[0.03]" />
        </div>
        {/* Skeleton content */}
        <div className="w-full max-w-md mt-12 space-y-5">
          {/* Prompt skeleton */}
          <div className="bg-bw-elevated rounded-xl p-5 space-y-3 border border-white/[0.06]">
            <div className="h-4 w-3/4 rounded bg-white/[0.06] animate-pulse" />
            <div className="h-4 w-full rounded bg-white/[0.06] animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-white/[0.06] animate-pulse" />
          </div>
          {/* Textarea skeleton */}
          <div className="bg-bw-elevated rounded-xl p-4 h-20 border border-white/[0.06] animate-pulse" />
          {/* Button skeleton */}
          <div className="flex justify-end">
            <div className="h-12 w-28 rounded-xl bg-white/[0.06] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-bw-danger/20 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </div>
          <p className="text-bw-muted">Session introuvable ou expirée</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-glow px-4 py-2 bg-bw-primary text-white rounded-xl text-sm font-medium cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Kicked: student was excluded after 3 warnings
  if (data.studentKicked) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 gap-6">
        <div className="w-20 h-20 rounded-full bg-bw-danger/20 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
          </svg>
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-bold text-bw-danger">Session terminée</p>
          <p className="text-bw-muted text-sm">Tu as reçu 3 avertissements et tu as été retiré de la session.</p>
        </div>
      </div>
    );
  }

  // Compute view key for cinema transitions
  const viewKey = data.session.status === "done" ? "done"
    : data.session.status === "paused" ? "paused"
    : `${data.session.status}-${data.situation?.id || "no-sit"}-${data.hasResponded}-${data.hasVoted}-${!!data.collectiveChoice}`;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-3 sm:px-4 py-8">
      {/* Cinematic intro */}
      <AnimatePresence>
        {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {/* Warning banner */}
      <AnimatePresence>
        {data.studentWarnings > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="w-full max-w-md mb-3"
          >
            <div className={`px-4 py-2.5 rounded-xl text-center text-sm font-medium ${
              data.studentWarnings >= 2
                ? "bg-bw-danger/20 text-bw-danger border border-bw-danger/30"
                : "bg-bw-amber/20 text-bw-amber border border-bw-amber/30"
            }`}>
              ⚠️ Avertissement {data.studentWarnings}/3
              {data.studentWarnings >= 2 && " — Prochain = exclusion"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teacher nudge banner */}
      <AnimatePresence>
        {data.teacherNudge && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full max-w-md mb-3"
          >
            <div className="px-4 py-3 rounded-xl bg-bw-amber/10 border border-bw-amber/30 text-center space-y-1">
              <p className="text-[10px] text-bw-amber font-semibold uppercase tracking-wider">Message du prof</p>
              <p className="text-sm text-bw-amber">{data.teacherNudge}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Broadcast message from teacher */}
      <AnimatePresence>
        {broadcastMsg && (
          <motion.div
            initial={{ height: 0, opacity: 0, scale: 0.95 }}
            animate={{ height: "auto", opacity: 1, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.95 }}
            className="w-full max-w-md mb-3"
          >
            <div className="px-4 py-3 rounded-xl bg-bw-primary/15 border border-bw-primary/30 text-center space-y-1 relative">
              <p className="text-[10px] text-bw-primary font-semibold uppercase tracking-wider">Message du prof</p>
              <p className="text-sm text-white font-medium">{broadcastMsg}</p>
              <button
                onClick={() => setBroadcastMsg(null)}
                className="absolute top-1.5 right-2 text-bw-muted hover:text-white text-xs cursor-pointer"
              >✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-bw-danger/90 text-white text-center py-2 text-sm font-medium"
          >
            Pas de connexion internet
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-white/20">
                {pendingCount} en attente
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with enhanced progress */}
      <div className={`fixed ${!isOnline ? "top-8" : "top-0"} left-0 right-0 z-10 backdrop-blur-md transition-all border-b border-white/[0.06]`}
        style={{ background: "linear-gradient(90deg, rgba(18,20,24,0.95), rgba(18,20,24,0.92) 50%, rgba(18,20,24,0.95))" }}>
        <div className="px-4 py-2.5 flex justify-between items-center">
          <span className="font-cinema text-base tracking-[0.15em] uppercase">
            <BrandLogo />
          </span>

          {/* Center: progress label */}
          {data.session.status !== "done" && (() => {
            const mod = data.session.currentModule;
            const seance = data.session.currentSeance;
            const seanceLabels: Record<number, string> = { 1: "Acte I", 2: "Acte II", 3: "Acte III" };
            // Module 3/4: show "Séquence X/Y — Acte Z"
            if ((mod === 3 || mod === 4) && !isFreeMode && data.situation) {
              const seanceMax = getSeanceMax(mod, seance);
              return (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-bw-primary bg-bw-primary/10 px-2 py-0.5 rounded-full">
                    {seanceLabels[seance] || `Séance ${seance}`}
                  </span>
                  <span className="text-xs text-bw-muted tabular-nums">
                    Q{data.situation.position}/{seanceMax}
                  </span>
                </div>
              );
            }
            // Free mode
            if (isFreeMode && freeProgress) {
              return (
                <span className="text-xs text-bw-primary font-medium tabular-nums">
                  Question {freeProgress.current}/{freeProgress.total}
                </span>
              );
            }
            // Module 1
            if (mod === 1 && data.module1) {
              return (
                <span className="text-xs text-bw-violet font-medium">
                  {data.module1.type === "positioning" ? `Q${(data.session.currentSituationIndex || 0) + 1}/8`
                    : data.module1.type === "image" && data.module1.image ? data.module1.image.title
                    : data.module1.type === "notebook" ? "Carnet" : ""}
                </span>
              );
            }
            return null;
          })()}

          {/* Team badge */}
          {data.team && (
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full border"
              style={{ color: data.team.teamColor, borderColor: `${data.team.teamColor}40`, backgroundColor: `${data.team.teamColor}15` }}>
              {data.team.teamName}
            </span>
          )}

          {/* Right: XP bar + timer or online count */}
          <div className="flex items-center gap-2">
            {sessionXp > 0 && <XpBar xp={sessionXp} />}
            {data.session.timerEndsAt && new Date(data.session.timerEndsAt).getTime() > Date.now() && (
              <CountdownTimer endsAt={data.session.timerEndsAt} size="sm" />
            )}
            {!isFreeMode && (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-bw-teal" />
                <span className="text-[10px] text-bw-muted tabular-nums">{data.connectedCount}</span>
              </div>
            )}
          </div>
        </div>
        {/* Progress bar — visible for all modules now */}
        {data.session.status !== "done" && (
          <div className="h-1 bg-white/[0.04]">
            <motion.div
              className="h-full rounded-r-full"
              style={{ background: "linear-gradient(90deg, #FF6B35, #D4A843)" }}
              animate={{
                width: data.session.currentModule === 1
                  ? `${((data.module1?.currentSeance || 1) / (data.module1?.totalSeances || 5)) * 100}%`
                  : isFreeMode && freeProgress
                    ? `${(freeProgress.current / freeProgress.total) * 100}%`
                    : `${((data.session.currentSituationIndex + 1) / getSeanceMax(data.session.currentModule, data.session.currentSeance)) * 100}%`
              }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
        )}
      </div>

      {/* XP Toast */}
      <XpToast delta={xpDelta} />

      {/* Category badges — film building up */}
      {collectedCategories.length > 0 && (
        <div className="w-full max-w-md mt-12 mb-2 overflow-x-auto">
          <div className="flex gap-1.5 px-1">
            <AnimatePresence>
              {collectedCategories.map((cat) => (
                <motion.span
                  key={`${cat.key}-${cat.label}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="flex-shrink-0 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                  style={{ color: cat.color, borderColor: `${cat.color}40`, backgroundColor: `${cat.color}10` }}
                >
                  {cat.label}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Coach bubble — contextual tip */}
      {coachTip && (
        <div className={`w-full max-w-md ${collectedCategories.length > 0 ? "" : "mt-12"} mb-3`}>
          <CoachBubble
            key={coachShownForRef.current}
            tip={coachTip}
            onDismiss={() => setCoachTip(null)}
          />
        </div>
      )}

      {/* Main content */}
      <div className={`w-full max-w-md ${collectedCategories.length > 0 ? "" : coachTip ? "" : "mt-12"}`}>
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <CinemaFade viewKey={viewKey}>
              {getView()}
            </CinemaFade>
          </AnimatePresence>
        </ErrorBoundary>
      </div>

      {/* Hand raise button — floating bottom-left */}
      {studentId && data.session.status !== "done" && (
        <button
          onClick={async () => {
            const next = !handRaised;
            setHandRaised(next);
            try {
              await fetch(`/api/sessions/${sessionId}/hand-raise`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, raised: next }),
              });
              if (next) {
                toast("Main levée ! Le prof est prévenu.", { icon: "✋" });
                haptic(20);
              }
            } catch { /* ignore */ }
          }}
          className={`fixed bottom-4 left-4 z-20 w-11 h-11 rounded-full flex items-center justify-center text-lg cursor-pointer transition-all shadow-lg ${
            handRaised
              ? "bg-bw-amber/20 border-2 border-bw-amber/60 scale-110"
              : "bg-bw-surface/80 backdrop-blur border border-white/[0.08] hover:border-white/20"
          }`}
          title={handRaised ? "Baisser la main" : "Lever la main (j'ai besoin d'aide)"}
        >
          {handRaised ? (
            <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>
              ✋
            </motion.span>
          ) : (
            <span className="opacity-50">✋</span>
          )}
        </button>
      )}

      <HelpButton pageKey="play" tips={[
        { title: "Ecris ta reponse", description: "Quand une question apparait, tape ta reponse et envoie-la. Sois creatif !" },
        { title: "Vote pour tes preferes", description: "Apres les reponses, tu peux voter pour les idees que tu preferes. Tape sur une carte pour voter." },
        { title: "Le choix collectif", description: "Le prof choisit la meilleure idee parmi les plus votees. Elle construit le film de la classe !" },
        { title: "Mode hors-ligne", description: "Pas de reseau ? Ta reponse est gardee et envoyee automatiquement quand tu te reconnectes." },
        { title: "Lever la main", description: "Appuie sur ✋ en bas a gauche pour signaler au prof que tu as besoin d'aide." },
      ]} />

      {/* Team Chat */}
      {studentId && data.team && (
        <TeamChat
          sessionId={sessionId}
          teamId={data.team.id}
          studentId={studentId}
          studentName={studentDisplayName}
          studentAvatar={studentAvatar}
        />
      )}

      {/* Celebration Overlay */}
      {celebration && (
        <CelebrationOverlay
          type={celebration.type}
          title={celebration.title}
          subtitle={celebration.subtitle}
          icon={celebration.icon}
          visible={!!celebration}
          onDismiss={() => setCelebration(null)}
        />
      )}
    </div>
  );
}
