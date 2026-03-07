import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { oieToAxes, aggregateAxes, type AxesScores } from "@/lib/axes-mapping";

/**
 * GET /api/v2/stats?classLabel=X&sessionId=Y
 * Aggregate OIE scores → 4 axes for the V2 Statistiques page.
 */
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const url = new URL(req.url);
  const classLabel = url.searchParams.get("classLabel");
  const sessionId = url.searchParams.get("sessionId");

  // Fetch facilitator's sessions
  const { data: sessions, error: sessErr } = await supabase
    .from("sessions")
    .select("id, title, status")
    .eq("facilitator_id", user.id);
  if (sessErr) {
    return NextResponse.json({ error: sessErr.message }, { status: 500 });
  }

  const sessionIds = sessionId
    ? [sessionId]
    : (sessions || []).map((s) => s.id as string);

  if (sessionIds.length === 0) {
    return NextResponse.json({
      classAverage: { comprehension: 0, creativite: 0, expression: 0, engagement: 0 },
      students: [],
      sessionCount: 0,
      classLabels: [],
    });
  }

  // Fetch OIE scores
  const { data: oieScores } = await supabase
    .from("session_oie_scores")
    .select("student_id, o_score, i_score, e_score, response_count")
    .in("session_id", sessionIds);

  // Fetch student names
  const studentIds = [
    ...new Set((oieScores || []).map((s) => s.student_id)),
  ];

  const { data: studentRows } = studentIds.length > 0
    ? await supabase
        .from("students")
        .select("id, display_name, avatar")
        .in("id", studentIds)
    : { data: [] };

  const studentMap = new Map(
    (studentRows || []).map((s) => [s.id, s])
  );

  // Aggregate per student (latest score)
  const perStudent = new Map<string, AxesScores>();
  for (const row of oieScores || []) {
    const axes = oieToAxes(
      {
        O: row.o_score ?? 0,
        I: row.i_score ?? 0,
        E: row.e_score ?? 0,
        dominant: "O",
        responseCount: row.response_count ?? 0,
        isReliable: true,
      },
      20
    );
    // Keep latest (or best) per student
    perStudent.set(row.student_id, axes);
  }

  const studentsList = [...perStudent.entries()].map(([id, scores]) => {
    const info = studentMap.get(id);
    return {
      id,
      displayName: info?.display_name || "Élève",
      avatar: info?.avatar || null,
      scores,
    };
  });

  const classAverage = aggregateAxes(studentsList.map((s) => s.scores));

  // Unique class labels for the selector (class_label may not exist yet)
  const classLabels = [
    ...new Set(
      (sessions || [])
        .map((s) => (s as Record<string, unknown>).class_label as string | null)
        .filter((l): l is string => l !== null && l !== undefined)
    ),
  ];

  return NextResponse.json({
    classAverage,
    students: studentsList,
    sessionCount: sessionIds.length,
    classLabels,
    sessions: (sessions || []).map((s) => ({
      id: s.id,
      title: s.title,
      classLabel: (s as Record<string, unknown>).class_label || null,
    })),
  });
}
