import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { oieToAxes, type AxesScores } from "@/lib/axes-mapping";

/**
 * GET /api/v2/class-students-evolution?classLabel=X
 * Returns per-session scores for all students in a class, chronologically.
 * Used for multi-student progression comparison.
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

  // Get facilitator sessions (optionally filtered by class)
  let sessQuery = supabase
    .from("sessions")
    .select("id, title, created_at, class_label")
    .eq("facilitator_id", user.id)
    .order("created_at", { ascending: true });

  if (classLabel) {
    sessQuery = sessQuery.eq("class_label", classLabel);
  }

  const { data: sessions } = await sessQuery;
  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ sessions: [], students: [] });
  }

  const sessionIds = sessions.map((s) => s.id as string);

  // Get OIE scores + student info in parallel
  const [oieResult, studentsResult] = await Promise.all([
    supabase
      .from("session_oie_scores")
      .select(
        "session_id, student_id, observation, imagination, expression, response_count"
      )
      .in("session_id", sessionIds),
    supabase
      .from("students")
      .select("id, display_name, avatar, profile_id")
      .in("session_id", sessionIds),
  ]);

  const oieScores = oieResult.data || [];
  const allStudents = studentsResult.data || [];

  // Build student info map (profile_id → first occurrence)
  const studentInfoMap = new Map<
    string,
    { id: string; displayName: string; avatar: string | null }
  >();
  for (const s of allStudents) {
    const key = s.profile_id || s.id;
    if (!studentInfoMap.has(key)) {
      studentInfoMap.set(key, {
        id: key,
        displayName: s.display_name,
        avatar: s.avatar,
      });
    }
  }

  // Map student_id → profile_id for grouping
  const idToProfile = new Map<string, string>();
  for (const s of allStudents) {
    idToProfile.set(s.id, s.profile_id || s.id);
  }

  // Group scores by student (profile_id) → session
  const studentSessions = new Map<
    string,
    { sessionId: string; axes: AxesScores }[]
  >();

  for (const row of oieScores) {
    const profileId = idToProfile.get(row.student_id) || row.student_id;
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

    if (!studentSessions.has(profileId)) {
      studentSessions.set(profileId, []);
    }
    studentSessions.get(profileId)!.push({
      sessionId: row.session_id,
      axes,
    });
  }

  // Build response
  const sessionMap = new Map(sessions.map((s) => [s.id, s]));

  const students = [...studentSessions.entries()]
    .filter(([, points]) => points.length >= 1)
    .map(([profileId, points]) => {
      const info = studentInfoMap.get(profileId);
      // Sort by session date
      const sorted = points.sort((a, b) => {
        const da = sessionMap.get(a.sessionId)?.created_at || "";
        const db = sessionMap.get(b.sessionId)?.created_at || "";
        return da.localeCompare(db);
      });
      return {
        id: profileId,
        displayName: info?.displayName || "Élève",
        avatar: info?.avatar || null,
        points: sorted.map((p) => ({
          sessionId: p.sessionId,
          sessionTitle: sessionMap.get(p.sessionId)?.title || "",
          date: sessionMap.get(p.sessionId)?.created_at || "",
          axes: p.axes,
        })),
      };
    });

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      title: s.title,
      date: s.created_at,
    })),
    students,
  });
}
