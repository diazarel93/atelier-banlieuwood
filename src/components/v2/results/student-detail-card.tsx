"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { Avatar } from "@/components/v2/avatar";
import type { FeedbackData } from "@/hooks/use-results-data";

interface ResponseRow {
  id: string;
  student_id: string;
  situation_id: string;
  text: string;
  ai_score: number | null;
  ai_feedback: string | null;
  teacher_score: number | null;
  teacher_comment: string | null;
  is_highlighted: boolean;
  is_hidden: boolean;
  submitted_at: string;
  response_time_ms: number | null;
  students: { display_name: string; avatar: string } | null;
}

interface StudentDetailCardProps {
  sessionId: string;
  feedback: FeedbackData | null;
}

export function StudentDetailCard({ sessionId, feedback }: StudentDetailCardProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const students = feedback?.students ?? [];

  // Fetch all responses for the session
  const { data: responses } = useQuery<ResponseRow[]>({
    queryKey: ["responses-all", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/responses`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: students.length > 0,
  });

  // Group responses by student
  const studentResponses = useMemo(() => {
    if (!responses) return new Map<string, ResponseRow[]>();
    const map = new Map<string, ResponseRow[]>();
    for (const r of responses) {
      if (r.is_hidden) continue;
      const list = map.get(r.student_id) || [];
      list.push(r);
      map.set(r.student_id, list);
    }
    return map;
  }, [responses]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const selectedResponses = selectedStudentId ? studentResponses.get(selectedStudentId) || [] : [];

  // Compute XP-like score for selected student
  const studentXp = useMemo(() => {
    if (!selectedStudent) return 0;
    // XP = responses * 10 + chosenCount * 25 + avg score * 5
    let xp = selectedStudent.responses * 10;
    xp += selectedStudent.chosenCount * 25;
    const scores = selectedResponses.map((r) => r.ai_score ?? r.teacher_score).filter((s): s is number => s !== null);
    if (scores.length > 0) {
      xp += Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 5);
    }
    return xp;
  }, [selectedStudent, selectedResponses]);

  if (students.length === 0) return null;

  return (
    <GlassCardV2 className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <h3 className="label-caps shrink-0">Par eleve</h3>
        <select
          value={selectedStudentId || ""}
          onChange={(e) => setSelectedStudentId(e.target.value || null)}
          className="h-9 rounded-lg border border-[var(--color-bw-border)] bg-card px-3 text-sm text-bw-heading focus:outline-none focus:ring-2 focus:ring-bw-primary/30 max-w-xs"
        >
          <option value="">Choisir un eleve...</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.responses} rep.)
            </option>
          ))}
        </select>
      </div>

      {selectedStudent && (
        <div className="space-y-4">
          {/* Student summary header */}
          <div className="flex items-center gap-3 rounded-xl bg-[var(--color-bw-surface-dim)] px-4 py-3">
            <Avatar name={selectedStudent.name} emoji={selectedStudent.avatar} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-heading-xs text-bw-heading truncate">{selectedStudent.name}</p>
              <p className="text-body-xs text-bw-muted">
                {selectedStudent.responses} reponse{selectedStudent.responses !== 1 ? "s" : ""} &middot;{" "}
                {selectedStudent.chosenCount} choix retenu{selectedStudent.chosenCount !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-bw-primary tabular-nums">{studentXp}</p>
              <p className="label-caps text-bw-muted">XP</p>
            </div>
          </div>

          {/* Responses list */}
          {selectedResponses.length === 0 ? (
            <p className="text-sm text-bw-muted text-center py-4">Aucune reponse pour cet eleve.</p>
          ) : (
            <div className="space-y-2">
              {selectedResponses.map((r, idx) => (
                <div key={r.id} className="rounded-lg border border-[var(--color-bw-border)] px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-bw-muted mb-1">
                        Question {idx + 1}
                        {r.is_highlighted && (
                          <span className="ml-2 inline-flex items-center gap-0.5 text-bw-gold-text">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                            </svg>
                            Mise en avant
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-bw-text whitespace-pre-wrap">{r.text}</p>
                    </div>
                    {(r.ai_score !== null || r.teacher_score !== null) && (
                      <div className="shrink-0 flex items-center gap-1">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-bw-primary-50 text-xs font-bold text-bw-primary">
                          {r.teacher_score ?? r.ai_score}
                        </span>
                      </div>
                    )}
                  </div>
                  {(r.ai_feedback || r.teacher_comment) && (
                    <div className="mt-2 pt-2 border-t border-[var(--color-bw-border)]">
                      <p className="text-xs text-bw-muted italic">{r.teacher_comment || r.ai_feedback}</p>
                    </div>
                  )}
                  {r.response_time_ms && (
                    <p className="text-[10px] text-bw-muted mt-1 tabular-nums">
                      {Math.round(r.response_time_ms / 1000)}s de reflexion
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedStudentId && (
        <p className="text-sm text-bw-muted text-center py-4">
          Selectionnez un eleve pour voir ses reponses individuelles.
        </p>
      )}
    </GlassCardV2>
  );
}
