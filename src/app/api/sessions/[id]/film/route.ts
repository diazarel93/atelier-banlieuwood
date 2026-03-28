import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { withErrorHandler } from "@/lib/api-utils";

// ── Types ──

export interface FilmData {
  session: {
    title: string;
    level: string;
    template: string | null;
    thematique: string | null;
    created_at: string;
  };
  collectiveChoices: {
    category: string;
    restitution_label: string;
    chosen_text: string;
  }[];
  personnages: {
    prenom: string;
    trait_dominant: string | null;
    avatar_data: Record<string, unknown>;
    studentName: string;
  }[];
  construction: {
    manche: number;
    winning_text: string;
  }[];
  students: {
    display_name: string;
    avatar: string;
  }[];
  stats: {
    totalStudents: number;
    totalResponses: number;
    participationRate: number;
  };
}

// GET — assemble all film data for the "Le Film" tab
export const GET = withErrorHandler(async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const supabase = await createServerSupabase();

  // Parallel queries
  const [sessionRes, choicesRes, personnagesRes, winnersRes, studentsRes, responsesRes] = await Promise.all([
    supabase.from("sessions").select("title, level, template, thematique, created_at").eq("id", sessionId).single(),
    supabase
      .from("collective_choices")
      .select("category, restitution_label, chosen_text")
      .eq("session_id", sessionId)
      .order("validated_at", { ascending: true }),
    supabase
      .from("module10_personnages")
      .select("prenom, trait_dominant, avatar_data, students(display_name)")
      .eq("session_id", sessionId)
      .order("submitted_at", { ascending: true }),
    supabase.from("module12_winners").select("manche, winning_text").eq("session_id", sessionId).order("manche"),
    supabase.from("students").select("display_name, avatar").eq("session_id", sessionId),
    supabase.from("responses").select("id, student_id").eq("session_id", sessionId),
  ]);

  if (sessionRes.error || !sessionRes.data) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  const session = sessionRes.data;
  const choices = choicesRes.data || [];
  const rawPersonnages = personnagesRes.data || [];
  const winners = winnersRes.data || [];
  const students = studentsRes.data || [];
  const responses = responsesRes.data || [];

  // Map personnages with student name
  const personnages = rawPersonnages.map((p) => {
    // Supabase join: single FK returns object, but TS infers array
    const stu = p.students as unknown as { display_name: string } | null;
    return {
      prenom: p.prenom,
      trait_dominant: p.trait_dominant,
      avatar_data: (p.avatar_data || {}) as Record<string, unknown>,
      studentName: stu?.display_name || "",
    };
  });

  // Construction (M12 winners)
  const construction = winners.map((w) => ({
    manche: w.manche,
    winning_text: w.winning_text,
  }));

  // Stats
  const totalStudents = students.length;
  const uniqueStudents = new Set(responses.map((r) => r.student_id)).size;
  const participationRate = totalStudents > 0 ? Math.round((uniqueStudents / totalStudents) * 100) : 0;

  const filmData: FilmData = {
    session: {
      title: session.title,
      level: session.level,
      template: session.template || null,
      thematique: session.thematique || null,
      created_at: session.created_at,
    },
    collectiveChoices: choices,
    personnages,
    construction,
    students,
    stats: {
      totalStudents,
      totalResponses: responses.length,
      participationRate,
    },
  };

  return NextResponse.json(filmData);
});
