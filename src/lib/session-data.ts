/**
 * Shared data layer — fetches all session data in one place.
 * Used by bilan, fiche-cours, and potentially feedback/export.
 */

import { createAdminClient } from "@/lib/supabase/admin";

export interface SessionFullData {
  session: {
    id: string;
    title: string;
    level: string;
    template: string | null;
    status: string;
    created_at: string;
  };
  students: {
    id: string;
    display_name: string;
    avatar: string;
    is_active: boolean;
  }[];
  responses: {
    id: string;
    student_id: string;
    situation_id: string;
    text: string;
    is_hidden: boolean;
    is_vote_option: boolean;
    relance_text: string | null;
    relance_response: string | null;
    submitted_at: string;
  }[];
  votes: {
    id: string;
    student_id: string;
    situation_id: string;
    chosen_response_id: string;
  }[];
  collectiveChoices: {
    id: string;
    situation_id: string;
    category: string;
    restitution_label: string;
    chosen_text: string;
    source_response_id: string | null;
  }[];
  budgets: {
    id: string;
    student_id: string;
    choices: Record<string, number>;
    credits_remaining: number;
    summary: string | null;
  }[];
  stats: {
    totalStudents: number;
    activeStudents: number;
    totalResponses: number;
    visibleResponses: number;
    totalVotes: number;
    totalChoices: number;
    participationRate: number;
    avgResponseLength: number;
  };
}

export async function getSessionFullData(sessionId: string): Promise<SessionFullData> {
  const supabase = createAdminClient();

  // Fetch all data in parallel
  const [sessionRes, studentsRes, responsesRes, votesRes, choicesRes, budgetsRes] =
    await Promise.all([
      supabase
        .from("sessions")
        .select("id, title, level, template, status, created_at")
        .eq("id", sessionId)
        .single(),
      supabase
        .from("students")
        .select("id, display_name, avatar, is_active")
        .eq("session_id", sessionId),
      supabase
        .from("responses")
        .select("id, student_id, situation_id, text, is_hidden, is_vote_option, relance_text, relance_response, submitted_at")
        .eq("session_id", sessionId),
      supabase
        .from("votes")
        .select("id, student_id, situation_id, chosen_response_id")
        .eq("session_id", sessionId),
      supabase
        .from("collective_choices")
        .select("id, situation_id, category, restitution_label, chosen_text, source_response_id")
        .eq("session_id", sessionId),
      supabase
        .from("module2_budgets")
        .select("id, student_id, choices, credits_remaining, summary")
        .eq("session_id", sessionId),
    ]);

  if (sessionRes.error || !sessionRes.data) {
    throw new Error("Session introuvable");
  }

  const session = sessionRes.data;
  const students = studentsRes.data || [];
  const responses = responsesRes.data || [];
  const votes = votesRes.data || [];
  const collectiveChoices = choicesRes.data || [];
  const budgets = (budgetsRes.data || []) as SessionFullData["budgets"];

  const visibleResponses = responses.filter((r) => !r.is_hidden);
  const respondingStudentIds = new Set(visibleResponses.map((r) => r.student_id));

  const stats: SessionFullData["stats"] = {
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.is_active).length,
    totalResponses: responses.length,
    visibleResponses: visibleResponses.length,
    totalVotes: votes.length,
    totalChoices: collectiveChoices.length,
    participationRate: students.length > 0
      ? Math.round((respondingStudentIds.size / students.length) * 100)
      : 0,
    avgResponseLength: visibleResponses.length > 0
      ? Math.round(
          visibleResponses.reduce((sum, r) => sum + r.text.length, 0) /
            visibleResponses.length
        )
      : 0,
  };

  return {
    session,
    students,
    responses,
    votes,
    collectiveChoices,
    budgets,
    stats,
  };
}
