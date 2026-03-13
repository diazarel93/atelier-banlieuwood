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
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") || "20", 10)));

  // Get all sessions for this facilitator
  let sessionsQuery = supabase
    .from("sessions")
    .select("id, class_label, created_at")
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

  // Build session→class_label lookup
  const sessionClassMap = new Map<string, string | null>();
  for (const s of sessions) {
    sessionClassMap.set(s.id, s.class_label ?? null);
  }

  // Get all students from those sessions
  const { data: students, error: studError } = await supabase
    .from("students")
    .select("id, display_name, avatar, profile_id, session_id, is_active, joined_at")
    .in("session_id", sessionIds);

  if (studError) {
    return NextResponse.json({ error: studError.message }, { status: 500 });
  }

  // Get scores for response counts
  const { data: scores } = await supabase
    .from("session_oie_scores")
    .select("student_id, response_count")
    .in("session_id", sessionIds);

  // Group by profile_id (or student id if no profile)
  const profileMap = new Map<
    string,
    {
      profileId: string;
      displayName: string;
      avatar: string | null;
      classLabel: string | null;
      sessionCount: number;
      lastActiveAt: string;
      totalResponses: number;
    }
  >();

  // Pre-index scores by student_id (replaces O(n*m) filter loop)
  const scoresByStudent = new Map<string, typeof scores>();
  for (const sc of scores || []) {
    const arr = scoresByStudent.get(sc.student_id);
    if (arr) arr.push(sc);
    else scoresByStudent.set(sc.student_id, [sc]);
  }

  for (const student of students || []) {
    const profileId = student.profile_id || student.id;
    const existing = profileMap.get(profileId);
    const joinedAt = student.joined_at || new Date().toISOString();
    const studentClassLabel = sessionClassMap.get(student.session_id) ?? null;

    const studentScores = scoresByStudent.get(student.id) || [];
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
        existing.classLabel = studentClassLabel;
      }
      existing.totalResponses += totalResponses;
    } else {
      profileMap.set(profileId, {
        profileId,
        displayName: student.display_name,
        avatar: student.avatar,
        classLabel: studentClassLabel,
        sessionCount: 1,
        lastActiveAt: joinedAt,
        totalResponses,
      });
    }
  }

  const profiles = [...profileMap.values()];

  // Sort by display name
  profiles.sort((a, b) => a.displayName.localeCompare(b.displayName, "fr"));

  // Paginate
  const total = profiles.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginatedProfiles = profiles.slice(start, start + limit);

  return NextResponse.json({
    profiles: paginatedProfiles,
    // Backward-compatible: also include `data` alias for V2 consumers
    data: paginatedProfiles,
    total,
    page,
    totalPages,
  });
}
