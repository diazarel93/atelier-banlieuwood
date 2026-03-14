import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { oieToAxes } from "@/lib/axes-mapping";
import { isValidUUID, withErrorHandler } from "@/lib/api-utils";

/**
 * GET /api/v2/student-progression?studentId=X
 * Returns per-session axis scores for a single student, ordered chronologically.
 */
export const GET = withErrorHandler<Record<string, never>>(async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId");

  if (!studentId || !isValidUUID(studentId)) {
    return NextResponse.json(
      { error: "studentId requis (UUID)" },
      { status: 400 }
    );
  }

  // Find all student records for this profile (or direct student id)
  const { data: students } = await supabase
    .from("students")
    .select("id, display_name, session_id, profile_id")
    .or(`profile_id.eq.${studentId},id.eq.${studentId}`);

  if (!students || students.length === 0) {
    return NextResponse.json(
      { error: "Élève introuvable" },
      { status: 404 }
    );
  }

  const studentIds = students.map((s) => s.id);
  const displayName = students[0].display_name;

  // Get OIE scores for all these student records
  const { data: oieScores } = await supabase
    .from("session_oie_scores")
    .select(
      "session_id, student_id, observation, imagination, expression, response_count"
    )
    .in("student_id", studentIds);

  if (!oieScores || oieScores.length === 0) {
    return NextResponse.json({
      studentId,
      displayName,
      points: [],
    });
  }

  // Fetch session info for dates + titles
  const sessionIds = [...new Set(oieScores.map((s) => s.session_id))];
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, title, created_at")
    .in("id", sessionIds)
    .order("created_at", { ascending: true });

  const sessionMap = new Map(
    (sessions || []).map((s) => [s.id, s])
  );

  // Build chronological points
  const points = oieScores
    .map((row) => {
      const session = sessionMap.get(row.session_id);
      if (!session) return null;
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
      return {
        sessionId: row.session_id,
        sessionTitle: session.title,
        date: session.created_at,
        axes,
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(a!.date).getTime() - new Date(b!.date).getTime()
    );

  return NextResponse.json({
    studentId,
    displayName,
    points,
  });
});
