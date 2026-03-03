"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useAtelierSessions,
  useCreateAtelier,
  useDeleteAtelier,
  useAchievements,
} from "@/hooks/use-atelier";
import {
  LEVEL_LABELS,
  LEVEL_DESCRIPTIONS,
  CHAPTER_IDS,
  CHAPTER_META,
  BADGE_STYLES,
  TOTAL_QUESTIONS,
  getLevel,
  type AtelierLevel,
  type ChapterId,
  type AtelierSession,
} from "@/lib/models/atelier";
import { ACHIEVEMENTS } from "@/lib/models/achievements";
import { AchievementGallery } from "@/components/atelier/achievement-gallery";
import { XpBar } from "@/components/atelier/xp-bar";
import {
  BookOpen,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Star,
  Flame,
  Award,
  Zap,
  Users,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";

// ── Hero section ─────────────────────────────────────────────────

function HeroSection({
  sessions,
  slug,
}: {
  sessions: AtelierSession[];
  slug: string;
}) {
  const router = useRouter();

  // Aggregate stats across all sessions
  let bestTotalXp = 0;
  let bestSession: AtelierSession | null = null;
  let totalAnswered = 0;
  let goldCount = 0;
  let bestStreak = 0;

  for (const s of sessions) {
    if (s.totalScore > bestTotalXp) {
      bestTotalXp = s.totalScore;
      bestSession = s;
    }
    const answered = s.chapters.reduce(
      (sum, ch) => sum + ch.steps.filter((st) => st.status === "validated").length,
      0
    );
    totalAnswered = Math.max(totalAnswered, answered);
    goldCount = Math.max(
      goldCount,
      s.chapters.filter((c) => c.badge === "gold").length
    );
    bestStreak = Math.max(bestStreak, s.bestStreak || 0);
  }

  const level = getLevel(bestTotalXp);

  // Find current chapter for CTA
  let ctaSession = bestSession;
  let ctaChapterId: string | null = null;
  let ctaQuestionNum = 0;
  if (ctaSession) {
    const ch = ctaSession.chapters.find(
      (c) => c.status === "in-progress" || c.status === "unlocked"
    );
    if (ch) {
      ctaChapterId = ch.chapterId;
      ctaQuestionNum =
        ch.steps.filter((s) => s.status === "validated").length + 1;
    }
  }

  return (
    <div className="space-y-6">
      {/* Level card + Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Level card */}
        <Card className="p-5 md:col-span-1 text-center space-y-3 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
            <span className="text-2xl font-black text-primary">
              {level.level}
            </span>
          </div>
          <div>
            <p className="text-lg font-black">{level.label}</p>
            <p className="text-xs text-muted-foreground">
              Niveau {level.level}
            </p>
          </div>
          <XpBar
            current={level.currentXp}
            max={level.nextXp}
            label={level.progress < 100 ? "Prochain niveau" : "Max"}
          />
        </Card>

        {/* Stat cards */}
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Zap className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <div className="text-3xl font-black">{totalAnswered}</div>
            <p className="text-xs text-muted-foreground font-medium">
              Questions repondues
            </p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
            <Star className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <div className="text-3xl font-black">{goldCount}</div>
            <p className="text-xs text-muted-foreground font-medium">
              Badges Or
            </p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <div className="text-3xl font-black">{bestStreak}</div>
            <p className="text-xs text-muted-foreground font-medium">
              Meilleure serie
            </p>
          </div>
        </Card>
      </div>

      {/* CTA Resume */}
      {ctaSession && ctaChapterId && (
        <Card
          className="p-5 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent cursor-pointer hover:border-primary/50 transition-all group"
          onClick={() =>
            router.push(
              `/project/${slug}/atelier/histoire/${ctaSession!.id}`
            )
          }
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="text-2xl">
                  {CHAPTER_META[ctaChapterId as ChapterId]?.icon}
                </span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-primary">
                  Reprendre
                </p>
                <h3 className="text-lg font-black">
                  {CHAPTER_META[ctaChapterId as ChapterId]?.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Question {ctaQuestionNum}
                </p>
              </div>
            </div>
            <Button
              size="lg"
              className="rounded-xl px-8 shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:scale-105 transition-all"
            >
              Reprendre
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Session Card ─────────────────────────────────────────────────

function SessionCard({
  session,
  slug,
  onDelete,
}: {
  session: AtelierSession;
  slug: string;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const completedChapters = session.chapters.filter(
    (ch) => ch.status === "completed"
  ).length;
  const totalAnswered = session.chapters.reduce(
    (sum, ch) => sum + ch.steps.filter((s) => s.status === "validated").length,
    0
  );
  const progressPct =
    TOTAL_QUESTIONS > 0
      ? Math.round((totalAnswered / TOTAL_QUESTIONS) * 100)
      : 0;
  const goldCount = session.chapters.filter((c) => c.badge === "gold").length;
  const silverCount = session.chapters.filter(
    (c) => c.badge === "silver"
  ).length;

  return (
    <Card
      className="hover:border-primary/50 transition-colors cursor-pointer group overflow-hidden"
      onClick={() =>
        router.push(`/project/${slug}/atelier/histoire/${session.id}`)
      }
    >
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  L&apos;Histoire
                </h3>
                <Badge variant="outline" className="text-xs">
                  {LEVEL_LABELS[session.level]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {totalAnswered}/{TOTAL_QUESTIONS} questions &middot;{" "}
                {completedChapters}/{CHAPTER_IDS.length} chapitres
              </p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 shrink-0 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                Suppr.
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cette session ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Toute la progression sera perdue.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(session.id)}>
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>

        {(goldCount > 0 || silverCount > 0) && (
          <div className="flex items-center gap-3 mt-3">
            {goldCount > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                <span>{goldCount} Or</span>
              </div>
            )}
            {silverCount > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Trophy className="h-3.5 w-3.5 text-gray-400" />
                <span>{silverCount} Argent</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-4 pb-3">
        <div className="flex gap-1">
          {session.chapters.map((ch) => {
            const meta = CHAPTER_META[ch.chapterId as ChapterId];
            const answered = ch.steps.filter(
              (s) => s.status === "validated"
            ).length;
            const pct =
              meta.questionCount > 0
                ? (answered / meta.questionCount) * 100
                : 0;
            return (
              <div key={ch.chapterId} className="flex-1 space-y-1">
                <div
                  className={`h-1.5 rounded-full ${
                    ch.status === "completed"
                      ? ch.badge === "gold"
                        ? "bg-yellow-500"
                        : ch.badge === "silver"
                          ? "bg-gray-400"
                          : "bg-orange-600"
                      : ch.status === "locked"
                        ? "bg-muted"
                        : "bg-primary/30"
                  }`}
                  style={{
                    background:
                      ch.status === "in-progress"
                        ? `linear-gradient(90deg, hsl(var(--primary)) ${pct}%, hsl(var(--muted)) ${pct}%)`
                        : undefined,
                  }}
                />
                <div className="text-center text-[9px]">{meta.icon}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
        >
          Continuer <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}

// ── Main Hub Page ────────────────────────────────────────────────

export default function AtelierHistoirePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: sessions, isLoading } = useAtelierSessions(slug);
  const createMutation = useCreateAtelier(slug);
  const deleteMutation = useDeleteAtelier(slug);
  const { data: achievementsData } = useAchievements(slug);

  const [showForm, setShowForm] = useState(false);
  const [level, setLevel] = useState<AtelierLevel>("college");

  const unlockedCount = achievementsData?.achievements.length || 0;

  const handleCreate = async () => {
    try {
      const session = await createMutation.mutateAsync({ level });
      toast.success("Atelier cree");
      router.push(`/project/${slug}/atelier/histoire/${session.id}`);
    } catch {
      toast.error("Erreur lors de la creation");
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Session supprimee"),
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/project/${slug}`)}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Retour au projet
      </Button>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Module 1 : L&apos;Histoire</h2>
          <p className="text-muted-foreground text-sm">
            7 chapitres &middot; {TOTAL_QUESTIONS} questions &middot; Un mentor
            evalue chaque reponse
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Dashboard + Join links */}
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => router.push(`/project/${slug}/atelier/dashboard`)}
          >
            <Users className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => router.push(`/project/${slug}/atelier/join`)}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Rejoindre
          </Button>
          {/* Achievement gallery button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl">
                <Award className="h-4 w-4 mr-2" />
                Succes ({unlockedCount}/{ACHIEVEMENTS.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Succes</DialogTitle>
              </DialogHeader>
              {achievementsData && (
                <AchievementGallery data={achievementsData} />
              )}
            </DialogContent>
          </Dialog>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Annuler" : "Nouvelle session"}
          </Button>
        </div>
      </div>

      {/* Hero section for returning users */}
      {sessions && sessions.length > 0 && (
        <HeroSection sessions={sessions} slug={slug} />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {CHAPTER_IDS.map((id) => {
          const meta = CHAPTER_META[id];
          return (
            <Card key={id} className="p-3 text-center space-y-1">
              <span className="text-2xl block">{meta.icon}</span>
              <p className="text-xs font-medium truncate">{meta.label}</p>
              <p className="text-[10px] text-muted-foreground">
                {meta.questionCount}q
              </p>
            </Card>
          );
        })}
      </div>

      {showForm && (
        <Card className="p-6 space-y-4 border-primary/30">
          <h3 className="font-semibold">Nouvelle session</h3>
          <div className="space-y-2">
            <Label>Choisis ton niveau</Label>
            <Select
              value={level}
              onValueChange={(v) => setLevel(v as AtelierLevel)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.entries(LEVEL_LABELS) as [AtelierLevel, string][]
                ).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {LEVEL_DESCRIPTIONS[level]}
            </p>
          </div>
          <Button onClick={handleCreate} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creation..." : "Demarrer l'atelier"}
          </Button>
        </Card>
      )}

      <Separator />

      {isLoading ? (
        <PageSkeleton variant="list" count={2} />
      ) : !sessions?.length ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold mb-2">
            Pret a ecrire ton film ?
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            L&apos;atelier te guide a travers 7 chapitres pour construire les
            fondements de ton histoire. Un mentor evalue chaque reponse et
            t&apos;aide a aller plus loin.
          </p>
          <Button onClick={() => setShowForm(true)}>
            Commencer l&apos;atelier
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              slug={slug}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
