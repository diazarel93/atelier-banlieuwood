import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * GET /api/v2/student-profiles
 * List all student profiles linked to the facilitator's sessions.
 * Optional: ?classLabel=X to filter by class.
 */
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const classLabelFilter = req.nextUrl.searchParams.get("classLabel");

  // Get all sessions for this facilitator
  let sessionsQuery = supabase
    .from("sessions")
    .select("id, class_label")
    .eq("facilitator_id", user.id);

  if (classLabelFilter) {
    sessionsQuery = sessionsQuery.eq("class_label", classLabelFilter);
  }

  const { data: sessions, error: sessError } = await sessionsQuery;

  if (sessError) {
    return NextResponse.json({ error: sessError.message }, { status: 500 });
  }

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ profiles: [] });
  }

  const sessionIds = sessions.map((s) => s.id);

  // Get all students from those sessions
  const { data: students, error: studError } = await supabase
    .from("students")
    .select("id, display_name, avatar, profile_id, session_id, is_active, joined_at")
    .in("session_id", sessionIds);

  if (studError) {
    return NextResponse.json({ error: studError.message }, { status: 500 });
  }

  // Get scores for those sessions
  const { data: scores } = await supabase
    .from("session_oie_scores")
    .select("student_id, observation, imagination, expression, response_count")
    .in("session_id", sessionIds);

  // Group by profile_id (or student id if no profile)
  const profileMap = new Map<
    string,
    {
      profileId: string;
      displayName: string;
      avatar: string | null;
      sessionCount: number;
      lastActiveAt: string;
      totalResponses: number;
      oScores: number[];
      iScores: number[];
      eScores: number[];
      engagementScores: number[];
    }
  >();

  for (const student of students || []) {
    const profileId = student.profile_id || student.id;
    const existing = profileMap.get(profileId);
    const joinedAt = student.joined_at || new Date().toISOString();

    const studentScores = (scores || []).filter(
      (sc) => sc.student_id === student.id
    );
    const totalResponses = studentScores.reduce(
      (sum, sc) => sum + (sc.response_count || 0),
      0
    );

    if (existing) {
      existing.sessionCount += 1;
      if (joinedAt > existing.lastActiveAt) {
        existing.lastActiveAt = joinedAt;
        existing.displayName = student.display_name;
        existing.avatar = student.avatar;
      }
      existing.totalResponses += totalResponses;
      for (const sc of studentScores) {
        existing.oScores.push(sc.observation ?? 0);
        existing.iScores.push(sc.imagination ?? 0);
        existing.eScores.push(sc.expression ?? 0);
        existing.engagementScores.push(
          Math.min(100, Math.round(((sc.response_count || 0) / 20) * 100))
        );
      }
    } else {
      profileMap.set(profileId, {
        profileId,
        displayName: student.display_name,
        avatar: student.avatar,
        sessionCount: 1,
        lastActiveAt: joinedAt,
        totalResponses,
        oScores: studentScores.map((sc) => sc.observation ?? 0),
        iScores: studentScores.map((sc) => sc.imagination ?? 0),
        eScores: studentScores.map((sc) => sc.expression ?? 0),
        engagementScores: studentScores.map((sc) =>
          Math.min(100, Math.round(((sc.response_count || 0) / 20) * 100))
        ),
      });
    }
  }

  const profiles = [...profileMap.values()].map((p) => {
    const avg = (arr: number[]) =>
      arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    return {
      profileId: p.profileId,
      displayName: p.displayName,
      avatar: p.avatar,
      sessionCount: p.sessionCount,
      lastActiveAt: p.lastActiveAt,
      totalResponses: p.totalResponses,
      scores: {
        comprehension: avg(p.oScores),
        creativite: avg(p.iScores),
        expression: avg(p.eScores),
        engagement: avg(p.engagementScores),
      },
    };
  });

  // Sort by display name
  profiles.sort((a, b) => a.displayName.localeCompare(b.displayName, "fr"));

  return NextResponse.json({ profiles });
}
