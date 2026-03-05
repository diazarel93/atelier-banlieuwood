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
  module10?: {
    etsiResponses: {
      id: string;
      student_id: string;
      etsi_text: string;
      submitted_at: string;
    }[];
    personnages: {
      id: string;
      student_id: string;
      prenom: string;
      age: string | null;
      trait_dominant: string | null;
      avatar_data: Record<string, unknown> | null;
    }[];
    pitchs: {
      id: string;
      student_id: string;
      objectif: string;
      obstacle: string;
      pitch_text: string;
      chrono_seconds: number | null;
      submitted_at: string;
    }[];
    ideaBank: {
      id: string;
      student_id: string;
      text: string;
      votes: number;
    }[];
  };
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
  const [sessionRes, studentsRes, responsesRes, votesRes, choicesRes, budgetsRes,
    m10EtsiRes, m10PersoRes, m10PitchsRes, m10IdeasRes] =
    await Promise.all([
      supabase
        .from("sessions")
        .select("id, title, level, template, status, thematique, created_at")
        .eq("id", sessionId)
        .is("deleted_at", null)
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
      // Module 10 data
      supabase
        .from("module10_etsi")
        .select("id, student_id, etsi_text, submitted_at")
        .eq("session_id", sessionId)
        .order("submitted_at"),
      supabase
        .from("module10_personnages")
        .select("id, student_id, prenom, age, trait_dominant, avatar_data")
        .eq("session_id", sessionId),
      supabase
        .from("module10_pitchs")
        .select("id, student_id, objectif, obstacle, pitch_text, chrono_seconds, submitted_at")
        .eq("session_id", sessionId)
        .order("submitted_at"),
      supabase
        .from("module10_idea_bank")
        .select("id, student_id, text, votes")
        .eq("session_id", sessionId)
        .order("votes", { ascending: false }),
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

  // Module 10 data (may be empty if session didn't use M10)
  const m10Etsi = (m10EtsiRes.data || []) as SessionFullData["module10"] extends undefined ? never : NonNullable<SessionFullData["module10"]>["etsiResponses"];
  const m10Perso = (m10PersoRes.data || []) as NonNullable<SessionFullData["module10"]>["personnages"];
  const m10Pitchs = (m10PitchsRes.data || []) as NonNullable<SessionFullData["module10"]>["pitchs"];
  const m10Ideas = (m10IdeasRes.data || []) as NonNullable<SessionFullData["module10"]>["ideaBank"];
  const hasM10Data = m10Etsi.length > 0 || m10Perso.length > 0 || m10Pitchs.length > 0 || m10Ideas.length > 0;

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
    ...(hasM10Data ? {
      module10: {
        etsiResponses: m10Etsi,
        personnages: m10Perso,
        pitchs: m10Pitchs,
        ideaBank: m10Ideas,
      },
    } : {}),
    stats,
  };
}
