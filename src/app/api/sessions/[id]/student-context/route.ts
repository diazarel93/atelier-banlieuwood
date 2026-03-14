import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUUID, safeJson } from "@/lib/api-utils";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

/**
 * GET /api/sessions/[id]/student-context?studentId=X
 * Returns the student's persistent profile for cross-session continuity.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const studentId = req.nextUrl.searchParams.get("studentId");

  if (!studentId || !isValidUUID(studentId)) {
    return NextResponse.json({ error: "studentId requis" }, { status: 400 });
  }

  const rl = checkRateLimit(getIP(req), `student-ctx:${studentId}`, { max: 10, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const admin = createAdminClient();

  // Find student and their profile_id
  const { data: student } = await admin
    .from("students")
    .select("id, profile_id")
    .eq("id", studentId)
    .eq("session_id", sessionId)
    .single();

  if (!student) {
    return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
  }

  // No profile linked yet — return defaults
  if (!student.profile_id) {
    return NextResponse.json({
      profileId: null,
      totalXp: 0,
      currentStreak: 0,
      bestStreak: 0,
      sessionsPlayed: 0,
      totalResponses: 0,
      retainedCount: 0,
      level: 0,
    });
  }

  // Fetch profile
  const { data: profile } = await admin
    .from("student_profiles")
    .select("id, total_xp, current_streak, best_streak, sessions_played, total_responses, retained_count, level")
    .eq("id", student.profile_id)
    .single();

  if (!profile) {
    return NextResponse.json({
      profileId: null,
      totalXp: 0,
      currentStreak: 0,
      bestStreak: 0,
      sessionsPlayed: 0,
      totalResponses: 0,
      retainedCount: 0,
      level: 0,
    });
  }

  return NextResponse.json({
    profileId: profile.id,
    totalXp: profile.total_xp || 0,
    currentStreak: profile.current_streak || 0,
    bestStreak: profile.best_streak || 0,
    sessionsPlayed: profile.sessions_played || 0,
    totalResponses: profile.total_responses || 0,
    retainedCount: profile.retained_count || 0,
    level: profile.level || 0,
  });
}

/**
 * PATCH /api/sessions/[id]/student-context
 * Write back session stats to persistent profile on session completion.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;

  const { studentId, sessionXp, responses, retained, streak, bestStreak } = parsed.data as {
    studentId?: string;
    sessionXp?: number;
    responses?: number;
    retained?: number;
    streak?: number;
    bestStreak?: number;
  };

  if (!studentId || !isValidUUID(studentId)) {
    return NextResponse.json({ error: "studentId requis" }, { status: 400 });
  }

  const rl = checkRateLimit(getIP(req), `student-ctx-write:${studentId}`, { max: 5, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const admin = createAdminClient();

  // Verify student belongs to session
  const { data: student } = await admin
    .from("students")
    .select("id, profile_id, display_name, avatar")
    .eq("id", studentId)
    .eq("session_id", sessionId)
    .single();

  if (!student) {
    return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
  }

  const xpToAdd = sessionXp || 0;
  const responsesToAdd = responses || 0;
  const retainedToAdd = retained || 0;
  const newStreak = streak || 0;
  const newBestStreak = bestStreak || 0;

  if (student.profile_id) {
    // Update existing profile — increment counters
    const { data: existing } = await admin
      .from("student_profiles")
      .select("total_xp, sessions_played, total_responses, retained_count, current_streak, best_streak")
      .eq("id", student.profile_id)
      .single();

    if (existing) {
      await admin
        .from("student_profiles")
        .update({
          total_xp: (existing.total_xp || 0) + xpToAdd,
          sessions_played: (existing.sessions_played || 0) + 1,
          total_responses: (existing.total_responses || 0) + responsesToAdd,
          retained_count: (existing.retained_count || 0) + retainedToAdd,
          current_streak: newStreak,
          best_streak: Math.max(existing.best_streak || 0, newBestStreak),
          last_active_at: new Date().toISOString(),
          streak_updated_date: new Date().toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
        })
        .eq("id", student.profile_id);
    }

    return NextResponse.json({ ok: true, profileId: student.profile_id });
  }

  // Create new profile and link to student
  const { data: newProfile, error: createErr } = await admin
    .from("student_profiles")
    .insert({
      display_name: student.display_name || "Élève",
      avatar: student.avatar || "🎬",
      total_xp: xpToAdd,
      sessions_played: 1,
      total_responses: responsesToAdd,
      retained_count: retainedToAdd,
      current_streak: newStreak,
      best_streak: newBestStreak,
      last_active_at: new Date().toISOString(),
      streak_updated_date: new Date().toISOString().split("T")[0],
    })
    .select("id")
    .single();

  if (createErr || !newProfile) {
    console.error("[student-context] Profile creation failed:", createErr?.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // Link profile to student
  await admin
    .from("students")
    .update({ profile_id: newProfile.id })
    .eq("id", studentId);

  return NextResponse.json({ ok: true, profileId: newProfile.id });
}
