"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useAtelierSession,
  useEvaluateStep,
  useUpdateAtelier,
} from "@/hooks/use-atelier";
import { useSound } from "@/hooks/use-sound";
import { useCountUp } from "@/hooks/use-count-up";
import { getFirstQuestion } from "@/lib/ai/prompts";
import {
  CHAPTER_IDS,
  CHAPTER_META,
  QUESTION_HINTS,
  MAX_FOLLOWUPS,
  scoreColor,
  getScoreLabel,
  type ChapterId,
  type StepProgress,
  type GameConfig,
} from "@/lib/models/atelier";
import {
  Loader2,
  Trophy,
  ChevronLeft,
  Volume2,
  VolumeX,
  Star,
  Flame,
  Lock,
  Send,
  Zap,
  RotateCcw,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  Shield,
  Eye,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { GamePreGame } from "@/components/atelier/game-pregame";
import { StreakBreakOverlay } from "@/components/atelier/streak-break-overlay";
import { AchievementPopup } from "@/components/atelier/achievement-popup";
import { useStudentMessages } from "@/hooks/use-dashboard";
import type { TeacherMessage } from "@/lib/models/dashboard";
import { MessageSquare } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────

type MentorMood = "neutral" | "thinking" | "impressed" | "encouraging" | "concerned";

const MENTOR_EMOJI: Record<MentorMood, string> = {
  neutral: "🎬",
  thinking: "🤔",
  impressed: "🤩",
  encouraging: "💪",
  concerned: "🧐",
};

// ── Main Page ────────────────────────────────────────────────────

export default function AtelierSessionPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  const { data: session, isLoading, refetch } = useAtelierSession(slug, id);
  const evaluateMutation = useEvaluateStep(slug, id);
  const updateMutation = useUpdateAtelier(slug);
  const { play, muted, toggleMute } = useSound();

  const [activeChapter, setActiveChapter] = useState("");
  const [activeQIdx, setActiveQIdx] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [mentorMood, setMentorMood] = useState<MentorMood>("neutral");
  const [streak, setStreak] = useState(0);
  const [showStreakBreak, setShowStreakBreak] = useState(false);
  const [previousStreakVal, setPreviousStreakVal] = useState(0);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [showPreGame, setShowPreGame] = useState(true);
  const [answer, setAnswer] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Teacher messages (student-side: only if linked to a class)
  const [showTeacherMsg, setShowTeacherMsg] = useState(false);
  const [seenMsgCount, setSeenMsgCount] = useState(-1);
  const hasClass = !!session?.classId && !!session?.studentId;
  const { data: teacherMessages } = useStudentMessages(
    slug,
    hasClass ? session.classId : undefined,
    hasClass ? session.studentId : undefined
  );
  const msgCount = teacherMessages?.length ?? 0;
  const newMsgCount = seenMsgCount >= 0 ? Math.max(0, msgCount - seenMsgCount) : 0;

  // Init seen count on first load
  useEffect(() => {
    if (teacherMessages && seenMsgCount === -1) {
      setSeenMsgCount(teacherMessages.length);
    }
  }, [teacherMessages, seenMsgCount]);

  // Notify on new teacher message
  useEffect(() => {
    if (seenMsgCount >= 0 && msgCount > seenMsgCount) {
      const latest = teacherMessages?.[0];
      if (latest) {
        toast("Message de la prof", { description: latest.content.slice(0, 60) });
      }
    }
  }, [msgCount, seenMsgCount, teacherMessages]);

  // Score reveal state
  const [revealPhase, setRevealPhase] = useState<"suspense" | "reveal" | "criteria">("criteria");
  const [starsRevealed, setStarsRevealed] = useState(3);
  const [lastRevealStepId, setLastRevealStepId] = useState("");

  // Show pre-game only for sessions without a gameConfig set
  useEffect(() => {
    if (session) {
      if (session.gameConfig) setShowPreGame(false);
    }
  }, [session]);

  // Init active chapter + streak
  useEffect(() => {
    if (session && !activeChapter) {
      setActiveChapter(session.currentChapter);
      setStreak(session.streak || 0);
    }
  }, [session, activeChapter]);

  // Jump to pending question on chapter change
  useEffect(() => {
    if (!session) return;
    const ch = session.chapters.find((c) => c.chapterId === activeChapter);
    if (!ch) return;
    const pendingIdx = ch.steps.findIndex((s) => s.status === "pending");
    if (pendingIdx >= 0) setActiveQIdx(pendingIdx);
    else if (ch.steps.length > 0) setActiveQIdx(ch.steps.length - 1);
    else setActiveQIdx(0);
    setReviewing(false);
    setMentorMood("neutral");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChapter]);

  // Clear answer on question change
  useEffect(() => {
    setAnswer("");
    textareaRef.current?.focus();
  }, [activeQIdx, activeChapter]);

  const handlePreGameStart = useCallback(
    async (config: GameConfig) => {
      if (!session) return;
      await updateMutation.mutateAsync({
        id: session.id,
        data: { gameConfig: config },
      });
      await refetch();
      setShowPreGame(false);
    },
    [session, updateMutation, refetch]
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (!session) return;
      const ch = session.chapters.find((c) => c.chapterId === activeChapter);
      if (!ch) return;
      const step = ch.steps[activeQIdx];
      if (!step || step.status !== "pending") return;

      setIsEvaluating(true);
      setMentorMood("thinking");
      play("submit");

      try {
        const result = await evaluateMutation.mutateAsync({
          chapterId: activeChapter,
          stepId: step.stepId,
          answer: text,
        });

        if (!result.needsFollowUp) {
          const scoreKey = `score-${Math.min(3, Math.max(1, result.score))}` as "score-1" | "score-2" | "score-3";
          play(scoreKey);

          setMentorMood(result.score >= 3 ? "impressed" : result.score >= 2 ? "encouraging" : "concerned");

          if (result.streak !== undefined) {
            setStreak(result.streak);
            if (result.previousStreak !== undefined && result.previousStreak >= 3 && result.streak === 0) {
              setPreviousStreakVal(result.previousStreak);
              setShowStreakBreak(true);
              play("streak-break");
              setTimeout(() => setShowStreakBreak(false), 2000);
            } else if (result.streak >= 2 && result.streak > (result.previousStreak || 0)) {
              play("combo");
            }
          }

          if (result.isChapterComplete) {
            play("chapter-complete");
            if (result.badge === "gold") play("badge-gold");
          }

          if (result.newAchievements?.length) {
            setNewAchievements(result.newAchievements);
          }
        }

        const { data: freshSession } = await refetch();

        if (result.needsFollowUp) {
          setMentorMood("encouraging");
        } else if (freshSession) {
          const freshCh = freshSession.chapters.find((c) => c.chapterId === activeChapter);
          if (freshCh) {
            const nextPendingIdx = freshCh.steps.findIndex((s) => s.status === "pending");
            if (nextPendingIdx >= 0) setActiveQIdx(nextPendingIdx);
            else if (result.isChapterComplete) setActiveQIdx(freshCh.steps.length - 1);
          }
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
        setMentorMood("concerned");
        await refetch();
      } finally {
        setIsEvaluating(false);
        setAnswer("");
      }
    },
    [session, activeChapter, activeQIdx, evaluateMutation, refetch, play]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (answer.trim() && !isEvaluating) handleSend(answer.trim());
    }
  };

  // ── Loading ─────────────────────────────────────────────────────

  if (isLoading || !session) {
    return (
      <div className="fixed inset-0 z-50 bg-[#08080c] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  // ── Pre-game ────────────────────────────────────────────────────

  if (showPreGame) {
    return <GamePreGame level={session.level} onStart={handlePreGameStart} />;
  }

  // ── Game state ──────────────────────────────────────────────────

  const chapter = session.chapters.find((ch) => ch.chapterId === activeChapter);
  if (!chapter) return null;

  const meta = CHAPTER_META[activeChapter as ChapterId];
  const stageNumber = CHAPTER_IDS.indexOf(activeChapter as ChapterId) + 1;
  const isChapterComplete = chapter.status === "completed";
  const needsInit =
    chapter.steps.length === 0 &&
    (chapter.status === "unlocked" || chapter.status === "in-progress");

  const activeStep = activeQIdx < chapter.steps.length ? chapter.steps[activeQIdx] : null;
  const isPending = activeStep?.status === "pending";
  const isValidated = activeStep?.status === "validated";
  const hasFollowUp = !!activeStep?.currentFollowUp;
  const hint = QUESTION_HINTS[activeChapter as ChapterId]?.[activeQIdx] || null;

  const handleInitChapter = async () => {
    const firstQ = getFirstQuestion(activeChapter as ChapterId);
    const firstStep: StepProgress = {
      stepId: `${activeChapter}_q1`,
      question: firstQ,
      answer: "",
      feedback: "",
      score: 0,
      status: "pending",
      answeredAt: null,
      exchanges: [],
      currentFollowUp: null,
    };
    const updatedChapters = session.chapters.map((ch) =>
      ch.chapterId === activeChapter
        ? { ...ch, status: "in-progress" as const, steps: [firstStep] }
        : ch
    );
    await updateMutation.mutateAsync({
      id: session.id,
      data: { chapters: updatedChapters, currentChapter: activeChapter },
    });
    await refetch();
  };

  const handleNextChapter = () => {
    const idx = CHAPTER_IDS.indexOf(activeChapter as ChapterId);
    if (idx < CHAPTER_IDS.length - 1) setActiveChapter(CHAPTER_IDS[idx + 1]);
  };

  // View determination
  const showChapterStart = needsInit;
  const showChapterComplete = isChapterComplete && !reviewing;
  const showQuestion = !showChapterStart && !showChapterComplete && activeStep;

  // ── Render: full-screen game overlay ────────────────────────────

  return (
    <div className="fixed inset-0 z-50 bg-[#08080c] text-white flex flex-col overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-violet-600/[0.03] blur-[120px]" />
      </div>

      {/* ── HUD (single compact row) ───────────────────────────── */}
      <div className="relative shrink-0 h-12 flex items-center px-3 gap-2 border-b border-white/5 bg-white/[0.02]">
        {/* Back */}
        <button
          onClick={() => router.push(`/project/${slug}/atelier/histoire`)}
          className="flex items-center gap-1 text-white/40 hover:text-white/80 transition-colors text-xs font-medium shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Quitter</span>
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 shrink-0" />

        {/* Stage dots */}
        <div className="flex items-center gap-0.5 flex-1 justify-center overflow-x-auto scrollbar-hide">
          {session.chapters.map((ch, idx) => {
            const isActive = ch.chapterId === activeChapter;
            const isLocked = ch.status === "locked";
            const isCompleted = ch.status === "completed";
            const chMeta = CHAPTER_META[ch.chapterId as ChapterId];
            return (
              <button
                key={ch.chapterId}
                onClick={() => !isLocked && setActiveChapter(ch.chapterId)}
                disabled={isLocked}
                className={`relative flex items-center justify-center transition-all ${
                  isActive
                    ? "w-9 h-9 rounded-xl bg-violet-600/30 border border-violet-500/40 scale-110 z-10"
                    : isCompleted
                      ? "w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer"
                      : isLocked
                        ? "w-7 h-7 rounded-lg opacity-20 cursor-not-allowed"
                        : "w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
                }`}
              >
                {isLocked ? (
                  <Lock className="h-2.5 w-2.5 text-white/20" />
                ) : (
                  <span className={isActive ? "text-sm" : "text-xs"}>{chMeta.icon}</span>
                )}
                {ch.badge && (
                  <span className="absolute -top-1 -right-1 text-[8px]">
                    {ch.badge === "gold" ? "🥇" : ch.badge === "silver" ? "🥈" : "🥉"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 shrink-0" />

        {/* Streak */}
        {streak >= 2 && (
          <div className="flex items-center gap-1 text-orange-400 shrink-0">
            <Flame className="h-3.5 w-3.5" />
            <span className="text-xs font-black">{streak}</span>
          </div>
        )}

        {/* Teacher messages */}
        {hasClass && (
          <button
            onClick={() => { setShowTeacherMsg(!showTeacherMsg); setSeenMsgCount(msgCount); }}
            className="relative text-white/30 hover:text-white/60 transition-colors shrink-0"
          >
            <MessageSquare className="h-4 w-4" />
            {newMsgCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-violet-500 text-[8px] font-bold flex items-center justify-center text-white">
                {newMsgCount}
              </span>
            )}
          </button>
        )}

        {/* Mute */}
        <button onClick={toggleMute} className="text-white/30 hover:text-white/60 transition-colors shrink-0">
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        {/* XP */}
        <div className="flex items-center gap-1.5 bg-yellow-500/10 rounded-lg px-2.5 py-1 shrink-0">
          <Trophy className="h-3.5 w-3.5 text-yellow-500" />
          <span className="text-xs font-black text-yellow-400">{session.totalScore}</span>
        </div>
      </div>

      {/* ── Step progress (sub-HUD) ────────────────────────────── */}
      {!showChapterStart && (
        <div className="relative shrink-0 h-8 flex items-center px-4 gap-3 bg-white/[0.01]">
          <span className="text-xs text-white/30 font-medium shrink-0">
            {meta.icon} {meta.label}
          </span>
          <div className="flex items-center gap-1 flex-1">
            {Array.from({ length: meta.questionCount }, (_, i) => {
              const step = chapter.steps[i];
              const isActive = i === activeQIdx;
              const done = step?.status === "validated";
              return (
                <button
                  key={i}
                  onClick={() => step && (setActiveQIdx(i), setReviewing(true))}
                  disabled={!step}
                  className={`h-1.5 rounded-full transition-all ${
                    isActive
                      ? "w-6 bg-violet-500"
                      : done
                        ? step.score >= 3
                          ? "w-1.5 bg-emerald-500"
                          : step.score >= 2
                            ? "w-1.5 bg-blue-500"
                            : "w-1.5 bg-orange-500"
                        : step?.currentFollowUp
                          ? "w-1.5 bg-amber-400 animate-pulse"
                          : "w-1.5 bg-white/10"
                  } ${step && !isActive ? "hover:scale-[2] cursor-pointer" : ""}`}
                />
              );
            })}
          </div>
          <span className="text-[10px] text-white/20 font-bold shrink-0">
            {chapter.totalScore}/{chapter.maxScore} XP
          </span>
        </div>
      )}

      {/* ── Content area (takes all remaining space) ───────────── */}
      <div className="relative flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {/* ── STAGE INTRO ──────────────────────────────────────── */}
          {showChapterStart && (
            <motion.div
              key={`intro-${activeChapter}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex items-center justify-center px-4"
            >
              <div className="text-center space-y-6 max-w-sm">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <span className="text-4xl">{meta.icon}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-violet-400 font-bold">
                    Etape {stageNumber}/{CHAPTER_IDS.length}
                  </p>
                  <h1 className="text-3xl font-black tracking-tight">{meta.label}</h1>
                  <p className="text-sm text-white/40 leading-relaxed">{meta.description}</p>
                </div>
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-xl font-black text-violet-400">{meta.questionCount}</div>
                    <div className="text-[10px] text-white/30">questions</div>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                    <div className="text-xl font-black text-yellow-400">{meta.questionCount * 3}</div>
                    <div className="text-[10px] text-white/30">XP max</div>
                  </div>
                </div>
                <Button
                  onClick={handleInitChapter}
                  disabled={updateMutation.isPending}
                  className="rounded-2xl px-8 h-12 bg-violet-600 hover:bg-violet-500 text-white border-0 shadow-lg shadow-violet-600/20"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2 fill-current" />
                  )}
                  Commencer
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── QUESTION VIEW ────────────────────────────────────── */}
          {showQuestion && isPending && (
            <motion.div
              key={`q-${activeChapter}-${activeQIdx}-fu${activeStep?.exchanges?.length || 0}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-4 max-w-2xl mx-auto w-full"
            >
              {/* Mentor + tag */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-lg border border-white/10">
                  {MENTOR_EMOJI[isEvaluating ? "thinking" : "neutral"]}
                </div>
                {hasFollowUp ? (
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                    <RotateCcw className="h-3 w-3" />
                    Le mentor creuse &middot; tentative {(activeStep.exchanges?.length || 0) + 1}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-violet-400 text-xs font-bold">
                    <Zap className="h-3 w-3" />
                    Question {activeQIdx + 1}/{meta.questionCount}
                  </div>
                )}
              </div>

              {/* Previous feedback (shown during follow-ups so student understands WHY) */}
              {hasFollowUp && activeStep.exchanges && activeStep.exchanges.length > 0 && (
                <div className="w-full max-w-lg rounded-xl border border-amber-500/10 bg-amber-500/5 px-4 py-2.5">
                  <p className="text-xs text-amber-200/70 leading-relaxed">
                    <span className="font-bold text-amber-300">Mentor :</span>{" "}
                    {activeStep.exchanges[activeStep.exchanges.length - 1].feedback}
                  </p>
                </div>
              )}

              {/* Question text */}
              <h1 className="text-xl sm:text-2xl font-black leading-snug tracking-tight text-center max-w-lg">
                {hasFollowUp ? activeStep.currentFollowUp : activeStep.question}
              </h1>

              {/* Hint */}
              {hint && !hasFollowUp && (
                <details className="group">
                  <summary className="flex items-center gap-1.5 text-xs text-amber-400/60 cursor-pointer hover:text-amber-400 font-medium">
                    <Lightbulb className="h-3 w-3" />
                    Indice
                  </summary>
                  <p className="mt-2 text-xs text-white/30 leading-relaxed max-w-md text-center">
                    {hint}
                  </p>
                </details>
              )}

              {/* Answer input */}
              <div className="w-full max-w-lg relative mt-2">
                <Textarea
                  ref={textareaRef}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={hasFollowUp ? "Developpe ta pensee..." : "Ta reponse..."}
                  className="min-h-[100px] max-h-[160px] text-sm leading-relaxed rounded-2xl border border-white/10 bg-white/[0.03] text-white pr-12 resize-none placeholder:text-white/15 focus:border-violet-500/40"
                  disabled={isEvaluating}
                />
                <Button
                  onClick={() => answer.trim() && handleSend(answer.trim())}
                  disabled={!answer.trim() || isEvaluating}
                  size="icon"
                  className="absolute bottom-2.5 right-2.5 h-9 w-9 rounded-xl bg-violet-600 hover:bg-violet-500 border-0"
                >
                  {isEvaluating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              {/* Helper text */}
              {isEvaluating ? (
                <div className="flex items-center gap-2 text-xs text-violet-400">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                  Le mentor analyse...
                </div>
              ) : (
                <p className="text-[10px] text-white/20">
                  Entree pour valider &middot; Shift+Entree pour un saut de ligne
                </p>
              )}
            </motion.div>
          )}

          {/* ── SCORE REVEAL ─────────────────────────────────────── */}
          {showQuestion && isValidated && (
            <ScoreRevealCompact
              key={`score-${activeChapter}-${activeQIdx}`}
              step={activeStep}
              questionIndex={activeQIdx}
              totalQuestions={meta.questionCount}
              hint={hint}
              mentorMood={mentorMood}
              onNext={() => {
                const nextPending = chapter.steps.findIndex(
                  (s, i) => i > activeQIdx && s.status === "pending"
                );
                if (nextPending >= 0) {
                  setActiveQIdx(nextPending);
                  setReviewing(false);
                  setMentorMood("neutral");
                } else if (activeQIdx < chapter.steps.length - 1) {
                  setActiveQIdx(activeQIdx + 1);
                }
              }}
              onPrev={() => activeQIdx > 0 && setActiveQIdx(activeQIdx - 1)}
              hasPrev={activeQIdx > 0}
              hasNext={
                activeQIdx < chapter.steps.length - 1 ||
                chapter.steps.some((s, i) => i > activeQIdx && s.status === "pending")
              }
            />
          )}

          {/* ── STAGE COMPLETE ───────────────────────────────────── */}
          {showChapterComplete && (
            <StageCompleteCompact
              key={`complete-${activeChapter}`}
              chapter={chapter}
              chapterId={activeChapter as ChapterId}
              stageNumber={stageNumber}
              hasNextChapter={CHAPTER_IDS.indexOf(activeChapter as ChapterId) < CHAPTER_IDS.length - 1}
              onReview={() => {
                setReviewing(true);
                setActiveQIdx(0);
              }}
              onNext={handleNextChapter}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Teacher messages panel */}
      {showTeacherMsg && teacherMessages && teacherMessages.length > 0 && (
        <div className="absolute bottom-4 right-4 z-[60] w-80 max-h-64 rounded-2xl border border-white/10 bg-[#12121a] shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
            <span className="text-xs font-bold text-violet-400">Messages de la prof</span>
            <button onClick={() => setShowTeacherMsg(false)} className="text-white/30 hover:text-white/60 text-xs">
              Fermer
            </button>
          </div>
          <div className="overflow-y-auto max-h-48 p-3 space-y-2">
            {teacherMessages.map((msg: TeacherMessage) => (
              <div key={msg.id} className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white/70">
                <p>{msg.content}</p>
                <p className="text-[10px] text-white/20 mt-1">
                  {new Date(msg.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overlays */}
      <StreakBreakOverlay previousStreak={previousStreakVal} show={showStreakBreak} />
      <AchievementPopup achievementIds={newAchievements} />
    </div>
  );
}

// ── Score Reveal (compact, inline) ──────────────────────────────

function ScoreRevealCompact({
  step,
  questionIndex,
  totalQuestions,
  hint,
  mentorMood,
  onNext,
  onPrev,
  hasPrev,
  hasNext,
}: {
  step: StepProgress;
  questionIndex: number;
  totalQuestions: number;
  hint: string | null;
  mentorMood: MentorMood;
  onNext: () => void;
  onPrev: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const exchanges = step.exchanges || [];
  const lastExchange = exchanges[exchanges.length - 1];
  const criteria = lastExchange?.criteria;
  const [phase, setPhase] = useState<"suspense" | "reveal" | "full">("suspense");
  const [starsCount, setStarsCount] = useState(0);
  const xpAnimated = useCountUp(step.score, 500, phase !== "suspense");

  useEffect(() => {
    setPhase("suspense");
    setStarsCount(0);
    const t1 = setTimeout(() => setPhase("reveal"), 800);
    const t2 = setTimeout(() => setPhase("full"), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [step.stepId]);

  useEffect(() => {
    if (phase !== "reveal" && phase !== "full") return;
    let count = 0;
    const iv = setInterval(() => {
      count++;
      setStarsCount(count);
      if (count >= step.score) clearInterval(iv);
    }, 150);
    return () => clearInterval(iv);
  }, [phase, step.score]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-4 max-w-lg mx-auto w-full overflow-y-auto"
    >
      <AnimatePresence mode="wait">
        {phase === "suspense" ? (
          <motion.div
            key="suspense"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-2"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto text-2xl"
            >
              🤔
            </motion.div>
            <p className="text-xs text-white/30 animate-pulse">Le mentor reflechit...</p>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-center space-y-3"
          >
            {/* Mentor reaction */}
            <div className="text-2xl">{MENTOR_EMOJI[mentorMood]}</div>

            {/* Score box */}
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl border ${
                step.score >= 3
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : step.score >= 2
                    ? "bg-blue-500/10 border-blue-500/20"
                    : "bg-orange-500/10 border-orange-500/20"
              } ${step.score === 1 ? "animate-shake" : ""}`}
            >
              <span className="text-2xl font-black">+{xpAnimated}</span>
              <span className="inline-flex gap-0.5">
                {[1, 2, 3].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 transition-all duration-300 ${
                      i <= starsCount
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-white/10"
                    }`}
                  />
                ))}
              </span>
            </motion.div>

            <h2 className={`text-lg font-black ${scoreColor(step.score)}`}>
              {getScoreLabel(step.score)}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback + criteria (only after reveal) */}
      {phase === "full" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-3"
        >
          {/* Question + answer summary */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-white/20 font-bold">
              Q{questionIndex + 1}/{totalQuestions}
            </p>
            <p className="text-xs text-white/50 leading-relaxed">
              {lastExchange?.feedback || step.feedback}
            </p>
          </div>

          {/* Criteria */}
          {criteria && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1 } }, hidden: {} }}
              className="grid grid-cols-3 gap-2"
            >
              {[
                { icon: Target, label: "Pertinence", value: criteria.pertinence },
                { icon: Shield, label: "Profondeur", value: criteria.profondeur },
                { icon: Sparkles, label: "Creativite", value: criteria.creativite },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } },
                  }}
                  className={`rounded-xl border p-2.5 text-center ${
                    item.value >= 3
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : item.value >= 2
                        ? "border-blue-500/20 bg-blue-500/5"
                        : "border-orange-500/20 bg-orange-500/5"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5 mx-auto mb-1 opacity-60" />
                  <div className="flex gap-0.5 justify-center mb-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 w-3 rounded-full ${
                          i <= item.value ? "bg-current" : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[9px] text-white/30 font-bold uppercase">{item.label}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Hint */}
          {hint && (
            <details className="group">
              <summary className="flex items-center gap-1.5 text-xs text-white/20 cursor-pointer hover:text-white/40 font-medium">
                <Lightbulb className="h-3 w-3" /> Conseil
              </summary>
              <p className="mt-1 text-xs text-white/20 leading-relaxed">{hint}</p>
            </details>
          )}
        </motion.div>
      )}

      {/* Navigation */}
      {phase === "full" && (
        <div className="flex items-center gap-2">
          {hasPrev && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrev}
              className="rounded-xl text-xs text-white/40 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Precedente
            </Button>
          )}
          {hasNext && (
            <Button
              size="sm"
              onClick={onNext}
              className="rounded-xl text-xs bg-violet-600 hover:bg-violet-500 text-white border-0"
            >
              Suivante
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Stage Complete (compact, inline) ────────────────────────────

function StageCompleteCompact({
  chapter,
  chapterId,
  stageNumber,
  hasNextChapter,
  onReview,
  onNext,
}: {
  chapter: { totalScore: number; maxScore: number; badge: string | null };
  chapterId: ChapterId;
  stageNumber: number;
  hasNextChapter: boolean;
  onReview: () => void;
  onNext: () => void;
}) {
  const meta = CHAPTER_META[chapterId];
  const pct = chapter.maxScore > 0 ? Math.round((chapter.totalScore / chapter.maxScore) * 100) : 0;
  const badgeEmoji = chapter.badge === "gold" ? "🥇" : chapter.badge === "silver" ? "🥈" : chapter.badge === "bronze" ? "🥉" : null;

  useEffect(() => {
    const t = setTimeout(() => {
      if (chapter.badge === "gold") {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ["#fbbf24", "#f59e0b", "#d97706", "#fff"] });
        setTimeout(() => confetti({ particleCount: 60, spread: 50, origin: { y: 0.4, x: 0.6 } }), 300);
      } else if (chapter.badge) {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 } });
      }
    }, 200);
    return () => clearTimeout(t);
  }, [chapter.badge]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex items-center justify-center px-4"
    >
      <div className="text-center space-y-6 max-w-sm">
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
          className="relative mx-auto w-fit"
        >
          <div className="w-24 h-24 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <Trophy className="h-12 w-12 text-yellow-500" />
          </div>
          {badgeEmoji && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.4, stiffness: 400 }}
              className="absolute -top-2 -right-2 text-3xl"
            >
              {badgeEmoji}
            </motion.span>
          )}
        </motion.div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-yellow-400 font-bold">
            Etape {stageNumber} terminee
          </p>
          <h1 className="text-3xl font-black">{meta.label}</h1>
        </div>

        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-black text-violet-400">{pct}%</div>
            <div className="text-[10px] text-white/30">Score</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-black text-yellow-400">{chapter.totalScore}</div>
            <div className="text-[10px] text-white/30">/ {chapter.maxScore} XP</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReview}
            className="rounded-xl text-xs text-white/40 hover:text-white hover:bg-white/5"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            Revoir
          </Button>
          {hasNextChapter && (
            <Button
              onClick={onNext}
              className="rounded-xl px-6 bg-violet-600 hover:bg-violet-500 text-white border-0 shadow-lg shadow-violet-600/20"
            >
              Etape suivante
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
