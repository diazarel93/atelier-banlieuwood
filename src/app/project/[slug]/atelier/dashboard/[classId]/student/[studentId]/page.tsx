"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import {
  useStudentDetail,
  useAnnotations,
  useCreateAnnotation,
  useSendMessage,
  useMessages,
  useDeleteStudent,
} from "@/hooks/use-dashboard";
import { StudentTimeline } from "@/components/dashboard/student-timeline";
import { AnnotationInline } from "@/components/dashboard/annotation-inline";
import { MessageComposer } from "@/components/dashboard/message-composer";
import type { AnnotationType } from "@/lib/models/dashboard";
import {
  CHAPTER_IDS,
  CHAPTER_META,
  TOTAL_QUESTIONS,
  BADGE_STYLES,
  getLevel,
  type ChapterId,
} from "@/lib/models/atelier";
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
  ArrowLeft,
  MessageSquare,
  Star,
  Flame,
  Trophy,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function StudentDetailPage() {
  const { slug, classId, studentId } = useParams<{
    slug: string;
    classId: string;
    studentId: string;
  }>();
  const router = useRouter();

  const { data: student, isLoading } = useStudentDetail(
    slug,
    classId,
    studentId
  );
  const { data: annotations } = useAnnotations(slug, classId, studentId);
  const { data: messages } = useMessages(slug, classId, studentId);
  const createAnnotation = useCreateAnnotation(slug, classId);
  const sendMessage = useSendMessage(slug, classId);
  const deleteStudent = useDeleteStudent(slug, classId);

  const [annotating, setAnnotating] = useState<{
    chapterId: string;
    stepId: string;
  } | null>(null);
  const [msgOpen, setMsgOpen] = useState(false);

  if (isLoading) return <PageSkeleton variant="list" count={4} />;
  if (!student) {
    return (
      <Card className="p-12 text-center text-muted-foreground">
        \u00c9l\u00e8ve introuvable.
      </Card>
    );
  }

  const session = student.session;
  const totalAnswered = session
    ? session.chapters.reduce(
        (sum, ch) =>
          sum + ch.steps.filter((s) => s.status === "validated").length,
        0
      )
    : 0;
  const progressPct =
    TOTAL_QUESTIONS > 0 ? Math.round((totalAnswered / TOTAL_QUESTIONS) * 100) : 0;
  const level = session ? getLevel(session.totalScore) : null;

  const handleAnnotationSubmit = async (
    content: string,
    type: AnnotationType
  ) => {
    if (!annotating || !session) return;
    try {
      await createAnnotation.mutateAsync({
        studentId,
        sessionId: session.id,
        chapterId: annotating.chapterId,
        stepId: annotating.stepId,
        content,
        type,
      });
      toast.success("Annotation ajout\u00e9e");
      setAnnotating(null);
    } catch {
      toast.error("Erreur");
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          router.push(`/project/${slug}/atelier/dashboard/${classId}`)
        }
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Retour au dashboard
      </Button>

      {/* Student header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl">
          {student.avatar}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{student.displayName}</h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
            {level && (
              <Badge variant="outline">
                Nv.{level.level} {level.label}
              </Badge>
            )}
            {session && (
              <>
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-yellow-500" />
                  {session.totalScore} pts
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  {session.bestStreak || 0} best streak
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setMsgOpen(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="text-muted-foreground hover:text-red-500 hover:border-red-500"
                disabled={deleteStudent.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Retirer {student.displayName} ?</AlertDialogTitle>
                <AlertDialogDescription>
                  L&apos;\u00e9l\u00e8ve et sa session atelier seront supprim\u00e9s. Cette action est irr\u00e9versible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    deleteStudent.mutate(studentId, {
                      onSuccess: () => {
                        toast.success("\u00c9l\u00e8ve retir\u00e9");
                        router.push(`/project/${slug}/atelier/dashboard/${classId}`);
                      },
                      onError: () => toast.error("Erreur lors de la suppression"),
                    });
                  }}
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Progress + badges */}
      {session && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4 space-y-2">
            <p className="text-sm font-medium">Progression</p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {totalAnswered}/{TOTAL_QUESTIONS} questions
              </span>
              <span>{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </Card>
          <Card className="p-4 space-y-2">
            <p className="text-sm font-medium">Badges</p>
            <div className="flex gap-2 flex-wrap">
              {session.chapters
                .filter((ch) => ch.badge)
                .map((ch) => {
                  const meta = CHAPTER_META[ch.chapterId as ChapterId];
                  return (
                    <Badge
                      key={ch.chapterId}
                      variant="outline"
                      className={
                        BADGE_STYLES[ch.badge || "bronze"]?.bg || ""
                      }
                    >
                      {meta?.icon}{" "}
                      {ch.badge === "gold"
                        ? "Or"
                        : ch.badge === "silver"
                          ? "Argent"
                          : "Bronze"}
                    </Badge>
                  );
                })}
              {session.chapters.filter((ch) => ch.badge).length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Aucun badge pour le moment
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Messages from teacher */}
      {messages && messages.length > 0 && (
        <Card className="p-4 space-y-2">
          <p className="text-sm font-medium">Messages envoy\u00e9s</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {messages.map((m) => (
              <div key={m.id} className="text-sm p-2 rounded bg-muted/50">
                <p>{m.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(m.createdAt).toLocaleString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Timeline */}
      {session ? (
        <>
          <h3 className="font-semibold">Parcours complet</h3>
          <StudentTimeline
            session={session}
            annotations={annotations || []}
            onAnnotate={(chapterId, stepId) =>
              setAnnotating({ chapterId, stepId })
            }
          />
          {annotating && (
            <div className="max-w-md">
              <AnnotationInline
                onSubmit={handleAnnotationSubmit}
                onCancel={() => setAnnotating(null)}
                isPending={createAnnotation.isPending}
              />
            </div>
          )}
        </>
      ) : (
        <Card className="p-8 text-center text-muted-foreground text-sm">
          Cet \u00e9l\u00e8ve n&apos;a pas encore commenc\u00e9 l&apos;atelier.
        </Card>
      )}

      {/* Message composer */}
      <MessageComposer
        open={msgOpen}
        onOpenChange={setMsgOpen}
        onSend={(data) => {
          sendMessage.mutate(
            { ...data, targetStudentId: studentId },
            {
              onSuccess: () => toast.success("Message envoy\u00e9"),
              onError: () => toast.error("Erreur d'envoi"),
            }
          );
        }}
        isPending={sendMessage.isPending}
        defaultStudentId={studentId}
        studentName={student.displayName}
      />
    </div>
  );
}
