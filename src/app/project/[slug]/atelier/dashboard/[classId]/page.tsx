"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useClass,
  useClassStudents,
  useLiveSnapshot,
  useSendMessage,
  useCreateAnnotation,
  useAnnotations,
  useDeleteClass,
} from "@/hooks/use-dashboard";
import { ClassHeader } from "@/components/dashboard/class-header";
import { StudentGrid } from "@/components/dashboard/student-grid";
import { QuestionBrowser } from "@/components/dashboard/question-browser";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { StudentTimeline } from "@/components/dashboard/student-timeline";
import { MessageComposer } from "@/components/dashboard/message-composer";
import { AnnotationInline } from "@/components/dashboard/annotation-inline";
import type { AnnotationType } from "@/lib/models/dashboard";
import {
  ArrowLeft,
  LayoutGrid,
  BookOpen,
  User,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

export default function ClassDashboardPage() {
  const { slug, classId } = useParams<{ slug: string; classId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: cls, isLoading: loadingClass } = useClass(slug, classId);
  const { data: students } = useClassStudents(slug, classId);
  const { data: liveData } = useLiveSnapshot(slug, classId);
  const sendMessage = useSendMessage(slug, classId);
  const createAnnotation = useCreateAnnotation(slug, classId);
  const deleteClass = useDeleteClass(slug);

  // URL-persisted state
  const tab = searchParams.get("tab") || "overview";
  const selectedStudentId = searchParams.get("student") || "";

  const setTab = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const setSelectedStudentId = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("student", value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  // Message dialog
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgTargetId, setMsgTargetId] = useState<string | null>(null);
  const [msgTargetName, setMsgTargetName] = useState<string | undefined>();

  // Annotation state
  const [annotating, setAnnotating] = useState<{
    studentId: string;
    sessionId: string;
    chapterId: string;
    stepId: string;
  } | null>(null);

  // Annotations for selected student
  const { data: studentAnnotations } = useAnnotations(
    slug,
    classId,
    selectedStudentId || undefined
  );

  if (loadingClass) return <PageSkeleton variant="list" count={3} />;
  if (!cls) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Classe introuvable.</p>
      </Card>
    );
  }

  const handleSendMessage = () => {
    setMsgTargetId(null);
    setMsgTargetName(undefined);
    setMsgOpen(true);
  };

  const handleAnnotate = (
    studentId: string,
    sessionId: string,
    chapterId: string,
    stepId: string
  ) => {
    setAnnotating({ studentId, sessionId, chapterId, stepId });
  };

  const handleAnnotationSubmit = async (
    content: string,
    type: AnnotationType
  ) => {
    if (!annotating) return;
    try {
      await createAnnotation.mutateAsync({
        ...annotating,
        content,
        type,
      });
      toast.success("Annotation ajout\u00e9e");
      setAnnotating(null);
    } catch {
      toast.error("Erreur");
    }
  };

  const handleSelectStudentFromGrid = (studentId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "student");
    params.set("student", studentId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const selectedStudent = students?.find(
    (s) => s.id === selectedStudentId
  );

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/project/${slug}/atelier/dashboard`)}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Retour
      </Button>

      {/* Header */}
      <ClassHeader
        cls={cls}
        stats={liveData?.stats}
        onSendMessage={handleSendMessage}
        onDeleteClass={() => {
          deleteClass.mutate(classId, {
            onSuccess: () => {
              toast.success("Classe supprim\u00e9e");
              router.push(`/project/${slug}/atelier/dashboard`);
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        isDeleting={deleteClass.isPending}
      />

      {/* Progress bar */}
      {liveData && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progression moyenne de la classe</span>
            <span className="font-medium">{liveData.stats.avgProgress}%</span>
          </div>
          <Progress value={liveData.stats.avgProgress} className="h-2" />
        </div>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="overview" className="gap-1.5">
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Vue d&apos;ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="questions" className="gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Questions</span>
          </TabsTrigger>
          <TabsTrigger value="student" className="gap-1.5">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">\u00c9l\u00e8ve</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4">
          {liveData ? (
            <StudentGrid
              students={liveData.students}
              onSelectStudent={handleSelectStudentFromGrid}
            />
          ) : (
            <PageSkeleton variant="list" count={4} />
          )}
        </TabsContent>

        {/* Questions */}
        <TabsContent value="questions" className="mt-4">
          {students ? (
            <>
              <QuestionBrowser
                students={students}
                onAnnotate={handleAnnotate}
              />
              {annotating && (
                <div className="mt-4 max-w-md">
                  <AnnotationInline
                    onSubmit={handleAnnotationSubmit}
                    onCancel={() => setAnnotating(null)}
                    isPending={createAnnotation.isPending}
                  />
                </div>
              )}
            </>
          ) : (
            <PageSkeleton variant="list" count={3} />
          )}
        </TabsContent>

        {/* Individual student */}
        <TabsContent value="student" className="mt-4 space-y-4">
          <Select
            value={selectedStudentId}
            onValueChange={setSelectedStudentId}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Choisir un \u00e9l\u00e8ve..." />
            </SelectTrigger>
            <SelectContent>
              {students?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.avatar} {s.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedStudent?.session ? (
            <>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedStudent.avatar}</span>
                <div>
                  <h3 className="font-bold text-lg">
                    {selectedStudent.displayName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Score total : {selectedStudent.session.totalScore} &middot;
                    Streak : {selectedStudent.session.streak || 0}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() =>
                    router.push(
                      `/project/${slug}/atelier/dashboard/${classId}/student/${selectedStudentId}`
                    )
                  }
                >
                  Voir en d\u00e9tail
                </Button>
              </div>

              <StudentTimeline
                session={selectedStudent.session}
                annotations={studentAnnotations || []}
                onAnnotate={(chapterId, stepId) =>
                  handleAnnotate(
                    selectedStudentId,
                    selectedStudent.session!.id,
                    chapterId,
                    stepId
                  )
                }
              />

              {annotating && annotating.studentId === selectedStudentId && (
                <div className="max-w-md">
                  <AnnotationInline
                    onSubmit={handleAnnotationSubmit}
                    onCancel={() => setAnnotating(null)}
                    isPending={createAnnotation.isPending}
                  />
                </div>
              )}
            </>
          ) : selectedStudentId ? (
            <Card className="p-8 text-center text-muted-foreground text-sm">
              Cet \u00e9l\u00e8ve n&apos;a pas encore commenc\u00e9 l&apos;atelier.
            </Card>
          ) : (
            <Card className="p-8 text-center text-muted-foreground text-sm">
              S\u00e9lectionnez un \u00e9l\u00e8ve pour voir son parcours.
            </Card>
          )}
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="mt-4">
          {students ? (
            <AnalyticsCharts students={students} />
          ) : (
            <PageSkeleton variant="list" count={3} />
          )}
        </TabsContent>
      </Tabs>

      {/* Message composer */}
      <MessageComposer
        open={msgOpen}
        onOpenChange={setMsgOpen}
        onSend={(data) => {
          sendMessage.mutate(data, {
            onSuccess: () => toast.success("Message envoy\u00e9"),
            onError: () => toast.error("Erreur d'envoi"),
          });
        }}
        isPending={sendMessage.isPending}
        defaultStudentId={msgTargetId}
        studentName={msgTargetName}
      />
    </div>
  );
}
