import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { oieToAxes, aggregateAxes, type AxesScores } from "@/lib/axes-mapping";

/**
 * GET /api/v2/class-comparison
 * Compare scores across all classes for the facilitator.
 * Returns per-class averages and per-class student counts.
 */
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // All facilitator sessions with class labels
  const { data: sessions, error: sessErr } = await supabase
    .from("sessions")
    .select("id, title, class_label, status, created_at")
    .eq("facilitator_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (sessErr) {
    return NextResponse.json({ error: sessErr.message }, { status: 500 });
  }

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ classes: [] });
  }

  const sessionIds = sessions.map((s) => s.id as string);

  // Fetch OIE scores + student counts in parallel
  const [oieResult, studentsResult] = await Promise.all([
    supabase
      .from("session_oie_scores")
      .select("session_id, student_id, observation, imagination, expression, response_count")
      .in("session_id", sessionIds),
    supabase
      .from("students")
      .select("id, session_id, display_name")
      .in("session_id", sessionIds)
      .eq("is_active", true),
  ]);

  const oieScores = oieResult.data || [];
  const allStudents = studentsResult.data || [];

  // Build session → class label map
  const sessionClassMap = new Map<string, string>();
  for (const s of sessions) {
    sessionClassMap.set(s.id, s.class_label || "Sans classe");
  }

  // Group OIE scores by class
  const classScoresMap = new Map<string, AxesScores[]>();
  const classStudentIds = new Map<string, Set<string>>();

  for (const row of oieScores) {
    const classLabel = sessionClassMap.get(row.session_id) || "Sans classe";
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

    if (!classScoresMap.has(classLabel)) {
      classScoresMap.set(classLabel, []);
      classStudentIds.set(classLabel, new Set());
    }
    classScoresMap.get(classLabel)!.push(axes);
    classStudentIds.get(classLabel)!.add(row.student_id);
  }

  // Count students per class (from students table, not just scored ones)
  const classStudentCounts = new Map<string, number>();
  for (const s of allStudents) {
    const classLabel = sessionClassMap.get(s.session_id) || "Sans classe";
    classStudentCounts.set(classLabel, (classStudentCounts.get(classLabel) || 0) + 1);
  }

  // Count sessions per class
  const classSessionCounts = new Map<string, number>();
  for (const s of sessions) {
    const classLabel = s.class_label || "Sans classe";
    classSessionCounts.set(classLabel, (classSessionCounts.get(classLabel) || 0) + 1);
  }

  // Build comparison array
  const classes = [...classScoresMap.entries()].map(([classLabel, scores]) => {
    const studentCount = classStudentCounts.get(classLabel) || 0;
    const scoredStudentCount = classStudentIds.get(classLabel)?.size || 0;
    const participationRate =
      studentCount > 0
        ? Math.round((scoredStudentCount / studentCount) * 100)
        : 0;
    return {
      classLabel,
      averageScores: aggregateAxes(scores),
      studentCount,
      scoredStudentCount,
      sessionCount: classSessionCounts.get(classLabel) || 0,
      participationRate,
    };
  });

  // Global average
  const allScores = [...classScoresMap.values()].flat();
  const globalAverage = aggregateAxes(allScores);

  return NextResponse.json({
    classes,
    globalAverage,
    totalStudents: allStudents.length,
    totalSessions: sessions.length,
  });
}
