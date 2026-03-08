import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * GET /api/v2/student-profiles/[profileId]
 * Full student profile: info, session history with scores, recent responses, achievements, teacher notes.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Get all sessions for this facilitator
  const { data: facSessions } = await supabase
    .from("sessions")
    .select("id, title, class_label, created_at")
    .eq("facilitator_id", user.id);

  if (!facSessions || facSessions.length === 0) {
    return NextResponse.json({ error: "Aucune séance trouvée" }, { status: 404 });
  }

  const facSessionIds = facSessions.map((s) => s.id);

  // Find students matching this profileId (could be profile_id or student id)
  const { data: students } = await supabase
    .from("students")
    .select("id, display_name, avatar, profile_id, session_id, joined_at")
    .in("session_id", facSessionIds)
    .or(`profile_id.eq.${profileId},id.eq.${profileId}`);

  if (!students || students.length === 0) {
    return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
  }

  const studentIds = students.map((s) => s.id);
  const student = students.sort((a, b) =>
    (b.joined_at || "").localeCompare(a.joined_at || "")
  )[0];

  // Session history with scores
  const { data: scores } = await supabase
    .from("session_oie_scores")
    .select("session_id, observation, imagination, expression, response_count, computed_at")
    .in("student_id", studentIds)
    .order("computed_at", { ascending: true });

  const sessionHistory = (scores || []).map((sc) => {
    const sess = facSessions.find((s) => s.id === sc.session_id);
    return {
      sessionId: sc.session_id,
      sessionTitle: sess?.title || "Séance",
      classLabel: sess?.class_label || null,
      date: sc.computed_at,
      scores: {
        comprehension: Math.round(sc.observation ?? 0),
        creativite: Math.round(sc.imagination ?? 0),
        expression: Math.round(sc.expression ?? 0),
        engagement: Math.min(
          100,
          Math.round(((sc.response_count || 0) / 20) * 100)
        ),
      },
    };
  });

  // Recent responses (last 20)
  const { data: responses } = await supabase
    .from("responses")
    .select("id, situation_id, text_response, ai_score, response_time_ms, created_at")
    .in("student_id", studentIds)
    .order("created_at", { ascending: false })
    .limit(20);

  // Fetch situation labels for the responses
  const situationIds = [
    ...new Set((responses || []).map((r) => r.situation_id).filter(Boolean)),
  ];
  let situationMap = new Map<string, string>();
  if (situationIds.length > 0) {
    const { data: situations } = await supabase
      .from("situations")
      .select("id, label")
      .in("id", situationIds);
    situationMap = new Map(
      (situations || []).map((s) => [s.id, s.label])
    );
  }

  const recentResponses = (responses || []).map((r) => ({
    id: r.id,
    situationLabel: situationMap.get(r.situation_id) || "Question",
    textResponse: r.text_response,
    aiScore: r.ai_score,
    responseTimeMs: r.response_time_ms,
    createdAt: r.created_at,
  }));

  // Teacher notes (column names: profile_id, facilitator_id)
  const { data: notes } = await supabase
    .from("student_notes")
    .select("id, note_type, content, session_id, created_at")
    .eq("profile_id", profileId)
    .eq("facilitator_id", user.id)
    .order("created_at", { ascending: false });

  // Achievements (column names: profile_id, unlocked_at)
  let achievements: { id: string; name: string; tier: string; unlockedAt: string }[] = [];
  try {
    const { data: achData } = await supabase
      .from("student_achievements")
      .select("id, achievement_id, tier, unlocked_at")
      .in("profile_id", [profileId]);
    achievements = (achData || []).map((a) => ({
      id: a.achievement_id,
      name: a.achievement_id,
      tier: a.tier || "bronze",
      unlockedAt: a.unlocked_at,
    }));
  } catch {
    // Table may not exist, skip
  }

  // Aggregate average scores
  const allScoreArrays = scores || [];
  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const aggregateScores = {
    comprehension: avg(allScoreArrays.map((s) => s.observation ?? 0)),
    creativite: avg(allScoreArrays.map((s) => s.imagination ?? 0)),
    expression: avg(allScoreArrays.map((s) => s.expression ?? 0)),
    engagement: avg(
      allScoreArrays.map((s) =>
        Math.min(100, Math.round(((s.response_count || 0) / 20) * 100))
      )
    ),
  };

  return NextResponse.json({
    profileId,
    displayName: student.display_name,
    avatar: student.avatar,
    sessionCount: students.length,
    totalResponses: (responses || []).length,
    scores: aggregateScores,
    sessionHistory,
    recentResponses,
    achievements,
    notes: notes || [],
  });
}
