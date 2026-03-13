import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { oieToAxes, aggregateAxes, type AxesScores } from "@/lib/axes-mapping";
import { getAuthUser } from "@/lib/auth-helpers";
import { log } from "@/lib/logger";

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

  const authUser = await getAuthUser(supabase);
  const isAdmin = authUser?.role === "admin";

  const url = new URL(req.url);
  const classLabel = url.searchParams.get("classLabel");
  const sessionId = url.searchParams.get("sessionId");

  // Fetch sessions (admin sees all)
  let sessQuery = supabase
    .from("sessions")
    .select("id, title, status");

  if (!isAdmin) {
    sessQuery = sessQuery.eq("facilitator_id", user.id);
  }

  const { data: sessions, error: sessErr } = await sessQuery;
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
  const { data: oieScores, error: oieErr } = await supabase
    .from("session_oie_scores")
    .select("student_id, observation, imagination, expression, response_count")
    .in("session_id", sessionIds)
    .limit(1000);

  if (oieErr) {
    log.error("OIE scores query failed", { route: "/api/v2/stats", error: oieErr.message });
    return NextResponse.json({ error: `OIE query failed: ${oieErr.message}` }, { status: 500 });
  }

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
        O: row.observation ?? 0,
        I: row.imagination ?? 0,
        E: row.expression ?? 0,
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
