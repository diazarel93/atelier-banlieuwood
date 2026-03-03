"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LedIndicator } from "@/components/ui/led-indicator";
import { Star } from "lucide-react";
import {
  CHAPTER_META,
  scoreColor,
  scoreBg,
  type ChapterId,
} from "@/lib/models/atelier";
import type { Annotation } from "@/lib/models/dashboard";
import { ANNOTATION_STYLES } from "@/lib/models/dashboard";
import type { AtelierSession } from "@/lib/models/atelier";

export function StudentTimeline({
  session,
  annotations,
  onAnnotate,
}: {
  session: AtelierSession;
  annotations: Annotation[];
  onAnnotate?: (chapterId: string, stepId: string) => void;
}) {
  // Build annotation lookup: key = `${chapterId}-${stepId}`
  const annotationMap = new Map<string, Annotation[]>();
  for (const ann of annotations) {
    const key = `${ann.chapterId}-${ann.stepId}`;
    if (!annotationMap.has(key)) annotationMap.set(key, []);
    annotationMap.get(key)!.push(ann);
  }

  return (
    <div className="space-y-6">
      {session.chapters.map((ch) => {
        const meta = CHAPTER_META[ch.chapterId as ChapterId];
        if (!meta) return null;
        const answeredSteps = ch.steps.filter(
          (s) => s.status === "validated" || s.status === "answered"
        );
        if (answeredSteps.length === 0) return null;

        return (
          <div key={ch.chapterId} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{meta.icon}</span>
              <h4 className="font-semibold text-sm">{meta.label}</h4>
              {ch.badge && (
                <Badge variant="outline" className="text-xs">
                  {ch.badge === "gold"
                    ? "🥇"
                    : ch.badge === "silver"
                      ? "🥈"
                      : "🥉"}{" "}
                  {ch.badge}
                </Badge>
              )}
            </div>

            <div className="relative pl-6 border-l-2 border-muted space-y-4">
              {answeredSteps.map((step, idx) => {
                const stepKey = `${ch.chapterId}-${step.stepId}`;
                const stepAnnotations = annotationMap.get(stepKey) || [];

                return (
                  <div key={step.stepId} className="relative">
                    {/* Timeline dot */}
                    <LedIndicator
                      status={
                        step.score >= 3
                          ? "active"
                          : step.score >= 2
                            ? "working"
                            : "idle"
                      }
                      className="absolute -left-[calc(1.5rem+5px)]"
                    />

                    <Card className={`p-3 ${scoreBg(step.score)}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs text-muted-foreground font-medium">
                          Question {idx + 1}
                        </p>
                        <span
                          className={`flex items-center gap-0.5 ${scoreColor(step.score)}`}
                        >
                          {Array.from({ length: step.score }, (_, i) => (
                            <Star
                              key={i}
                              className="h-3 w-3 fill-current"
                            />
                          ))}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {step.question}
                      </p>
                      <p className="text-sm">{step.answer}</p>

                      {/* Follow-up exchanges */}
                      {step.exchanges.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {step.exchanges.map((ex, i) => (
                            <div
                              key={i}
                              className="pl-3 border-l-2 border-muted-foreground/20 text-xs space-y-0.5"
                            >
                              <p className="text-muted-foreground italic">
                                {ex.feedback}
                              </p>
                              <p>{ex.answer}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Annotations */}
                      {stepAnnotations.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {stepAnnotations.map((ann) => {
                            const style = ANNOTATION_STYLES[ann.type];
                            return (
                              <div
                                key={ann.id}
                                className={`rounded px-2 py-1.5 text-xs ${style.bg}`}
                              >
                                {style.icon} {ann.content}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {onAnnotate && (
                        <button
                          onClick={() =>
                            onAnnotate(ch.chapterId, step.stepId)
                          }
                          className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          + Annoter
                        </button>
                      )}
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
