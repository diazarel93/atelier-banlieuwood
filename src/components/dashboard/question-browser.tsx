"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ChevronDown, ChevronUp, MessageSquarePlus } from "lucide-react";
import {
  CHAPTER_IDS,
  CHAPTER_META,
  scoreColor,
  type ChapterId,
} from "@/lib/models/atelier";
import type { StudentWithSession } from "@/lib/storage/dashboard-store";

export function QuestionBrowser({
  students,
  onAnnotate,
}: {
  students: StudentWithSession[];
  onAnnotate: (studentId: string, sessionId: string, chapterId: string, stepId: string) => void;
}) {
  const [selectedChapter, setSelectedChapter] = useState<ChapterId>("idea");
  const [selectedStep, setSelectedStep] = useState(0);
  const [expandedExchanges, setExpandedExchanges] = useState<Set<string>>(
    new Set()
  );

  const chapter = CHAPTER_META[selectedChapter];

  // Collect all answers for the selected question
  const answers: Array<{
    studentId: string;
    sessionId: string;
    displayName: string;
    avatar: string;
    answer: string;
    score: number;
    exchanges: Array<{ answer: string; feedback: string; score: number }>;
  }> = [];

  for (const s of students) {
    if (!s.session) continue;
    const ch = s.session.chapters.find(
      (c) => c.chapterId === selectedChapter
    );
    if (!ch) continue;
    const step = ch.steps[selectedStep];
    if (!step || step.status === "pending") continue;
    answers.push({
      studentId: s.id,
      sessionId: s.session.id,
      displayName: s.displayName,
      avatar: s.avatar,
      answer: step.answer,
      score: step.score,
      exchanges: step.exchanges.map((ex) => ({
        answer: ex.answer,
        feedback: ex.feedback,
        score: ex.score,
      })),
    });
  }

  // Stats
  const scores = answers.map((a) => a.score).filter((s) => s > 0);
  const avgScore =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) /
        10
      : 0;
  const dist = { 1: 0, 2: 0, 3: 0 };
  for (const s of scores) {
    if (s >= 1 && s <= 3) dist[s as 1 | 2 | 3]++;
  }

  const toggleExchanges = (id: string) => {
    setExpandedExchanges((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex gap-4 h-full">
      {/* Chapter sidebar */}
      <div className="w-48 shrink-0 space-y-1">
        {CHAPTER_IDS.map((id) => {
          const meta = CHAPTER_META[id];
          return (
            <button
              key={id}
              onClick={() => {
                setSelectedChapter(id);
                setSelectedStep(0);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                selectedChapter === id
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted"
              }`}
            >
              <span>{meta.icon}</span>
              <span className="truncate">{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <div className="flex-1 space-y-4">
        {/* Question tabs */}
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: chapter.questionCount }, (_, i) => (
            <Button
              key={i}
              variant={selectedStep === i ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStep(i)}
              className="w-10 h-8"
            >
              {i + 1}
            </Button>
          ))}
        </div>

        {/* Stats */}
        {answers.length > 0 && (
          <div className="flex gap-4 text-sm">
            <span>
              <strong>{answers.length}</strong> r\u00e9ponse
              {answers.length > 1 ? "s" : ""}
            </span>

            <span>
              Score moyen : <strong>{avgScore}</strong>/3
            </span>
            <span className="flex gap-2">
              {([3, 2, 1] as const).map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className={`${scoreColor(s)} text-xs`}
                >
                  {"★".repeat(s)} {dist[s]}
                </Badge>
              ))}
            </span>
          </div>
        )}

        {/* Answers list */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {answers.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-sm">
              Aucune r\u00e9ponse pour cette question.
            </Card>
          ) : (
            answers.map((a) => {
              const key = `${a.studentId}-${selectedStep}`;
              const isExpanded = expandedExchanges.has(key);
              return (
                <Card key={a.studentId} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{a.avatar}</span>
                      <span className="font-medium text-sm">
                        {a.displayName}
                      </span>
                      <span className={`flex items-center gap-0.5 text-xs ${scoreColor(a.score)}`}>
                        {Array.from({ length: a.score }, (_, i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 fill-current"
                          />
                        ))}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() =>
                        onAnnotate(
                          a.studentId,
                          a.sessionId,
                          selectedChapter,
                          `${selectedChapter}-${selectedStep}`
                        )
                      }
                    >
                      <MessageSquarePlus className="h-3.5 w-3.5 mr-1" />
                      Annoter
                    </Button>
                  </div>
                  <p className="text-sm leading-relaxed">{a.answer}</p>
                  {a.exchanges.length > 0 && (
                    <button
                      onClick={() => toggleExchanges(key)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                      {a.exchanges.length} \u00e9change
                      {a.exchanges.length > 1 ? "s" : ""} follow-up
                    </button>
                  )}
                  {isExpanded &&
                    a.exchanges.map((ex, i) => (
                      <div
                        key={i}
                        className="ml-4 pl-3 border-l-2 border-muted space-y-1 text-sm"
                      >
                        <p className="text-muted-foreground italic">
                          {ex.feedback}
                        </p>
                        <p>{ex.answer}</p>
                      </div>
                    ))}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
