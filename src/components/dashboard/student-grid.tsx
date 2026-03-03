"use client";

import { Card } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { LedIndicator } from "@/components/ui/led-indicator";
import type { LedStatus } from "@/components/ui/led-indicator";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";
import { CHAPTER_META, TOTAL_QUESTIONS, type ChapterId } from "@/lib/models/atelier";
import type { LiveSnapshot } from "@/hooks/use-dashboard";

type StudentSnapshot = LiveSnapshot["students"][number];

const STATUS_TO_LED: Record<string, LedStatus> = {
  active: "active",
  answering: "active",
  struggling: "working",
  idle: "idle",
  waiting: "idle",
  "not-started": "offline",
  offline: "offline",
};

function StudentCard({
  student,
  onClick,
}: {
  student: StudentSnapshot;
  onClick: () => void;
}) {
  const progressPct =
    student.totalQuestions > 0
      ? Math.round((student.totalAnswered / student.totalQuestions) * 100)
      : 0;

  return (
    <GlassCard
      hover
      className="p-4 cursor-pointer transition-all"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
            {student.avatar}
          </div>
          <LedIndicator
            status={STATUS_TO_LED[student.status] ?? "offline"}
            className="absolute -bottom-0.5 -right-0.5"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{student.displayName}</p>
          {student.currentChapter ? (
            <p className="text-xs text-muted-foreground truncate">
              {CHAPTER_META[student.currentChapter as ChapterId]?.icon}{" "}
              {CHAPTER_META[student.currentChapter as ChapterId]?.label}
              {student.currentQuestion
                ? ` — Q${student.currentQuestion}`
                : ""}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Pas commenc\u00e9</p>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{progressPct}%</span>
          {student.avgScore !== undefined && student.avgScore > 0 && (
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{student.avgScore}</span>
            </span>
          )}
        </div>
        <Progress value={progressPct} className="h-1.5" />
      </div>
    </GlassCard>
  );
}

export function StudentGrid({
  students,
  onSelectStudent,
}: {
  students: StudentSnapshot[];
  onSelectStudent: (studentId: string) => void;
}) {
  if (students.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-2xl mb-2">👩‍🏫</p>
        <p className="text-sm text-muted-foreground">
          Aucun \u00e9l\u00e8ve n&apos;a encore rejoint la classe.
          Partagez le code d&apos;acc\u00e8s pour commencer.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {students.map((s) => (
        <StudentCard
          key={s.studentId}
          student={s}
          onClick={() => onSelectStudent(s.studentId)}
        />
      ))}
    </div>
  );
}
