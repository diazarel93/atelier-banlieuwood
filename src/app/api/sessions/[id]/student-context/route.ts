import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUUID, safeJson } from "@/lib/api-utils";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { checkAchievements, type ProfileStats, type AchievementUnlock } from "@/lib/achievement-checker";

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
 * Compute cross-session streak from streak_updated_date.
 * - If today: already counted, keep current_streak as-is
 * - If yesterday: increment current_streak
 * - If older or null: reset to 1
 */
function computeStreak(streakUpdatedDate: string | null, currentStreak: number): number {
  if (!streakUpdatedDate) return 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(streakUpdatedDate + "T00:00:00");
  const diffMs = today.getTime() - last.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return currentStreak; // already counted today
  if (diffDays === 1) return currentStreak + 1; // consecutive day
  return 1; // streak broken
}

/**
 * Upsert achievements into student_achievements.
 * - If not exists: INSERT
 * - If exists with lower tier: UPDATE tier + unlocked_at
 * - If exists with same/higher tier: skip
 * Returns the list of newly unlocked achievements.
 */
async function upsertAchievements(
  admin: ReturnType<typeof createAdminClient>,
  profileId: string,
  earned: AchievementUnlock[],
): Promise<AchievementUnlock[]> {
  if (earned.length === 0) return [];

  // Fetch existing achievements for this profile
  const { data: existingRows } = await admin
    .from("student_achievements")
    .select("achievement_id, tier")
    .eq("profile_id", profileId);

  // Build a map: achievementId -> set of tiers already unlocked
  const existingMap = new Map<string, Set<string>>();
  for (const row of existingRows || []) {
    const set = existingMap.get(row.achievement_id) || new Set();
    set.add(row.tier);
    existingMap.set(row.achievement_id, set);
  }

  const newUnlocks: AchievementUnlock[] = [];
  const now = new Date().toISOString();

  for (const unlock of earned) {
    const existing = existingMap.get(unlock.achievementId);
    if (existing?.has(unlock.tier)) continue; // already have this tier

    // Upsert: insert on conflict do nothing (unique constraint: profile_id, achievement_id, tier)
    const { error } = await admin
      .from("student_achievements")
      .upsert(
        {
          profile_id: profileId,
          achievement_id: unlock.achievementId,
          tier: unlock.tier,
          progress: unlock.progress,
          unlocked_at: now,
          seen: false,
        },
        { onConflict: "profile_id,achievement_id,tier" }
      );

    if (!error) {
      newUnlocks.push(unlock);
    }
  }

  return newUnlocks;
}

/**
 * PATCH /api/sessions/[id]/student-context
 * Write back session stats to persistent profile on session completion.
 * Also checks achievements and returns any new unlocks.
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

  let profileId: string;
  let updatedStats: ProfileStats;

  if (student.profile_id) {
    profileId = student.profile_id;

    // Fetch existing profile with all fields needed for achievements
    const { data: existing } = await admin
      .from("student_profiles")
      .select("total_xp, sessions_played, total_responses, retained_count, current_streak, best_streak, total_votes, level, streak_updated_date")
      .eq("id", profileId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    // Cross-session streak logic
    const computedStreak = computeStreak(existing.streak_updated_date, existing.current_streak || 0);
    const finalBestStreak = Math.max(existing.best_streak || 0, newBestStreak, computedStreak);

    const updatedTotalXp = (existing.total_xp || 0) + xpToAdd;
    const updatedSessionsPlayed = (existing.sessions_played || 0) + 1;
    const updatedTotalResponses = (existing.total_responses || 0) + responsesToAdd;
    const updatedRetainedCount = (existing.retained_count || 0) + retainedToAdd;

    await admin
      .from("student_profiles")
      .update({
        total_xp: updatedTotalXp,
        sessions_played: updatedSessionsPlayed,
        total_responses: updatedTotalResponses,
        retained_count: updatedRetainedCount,
        current_streak: computedStreak,
        best_streak: finalBestStreak,
        last_active_at: new Date().toISOString(),
        streak_updated_date: new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    updatedStats = {
      totalXp: updatedTotalXp,
      sessionsPlayed: updatedSessionsPlayed,
      totalResponses: updatedTotalResponses,
      retainedCount: updatedRetainedCount,
      currentStreak: computedStreak,
      bestStreak: finalBestStreak,
      totalVotes: existing.total_votes || 0,
      level: existing.level || 0,
    };
  } else {
    // Create new profile and link to student
    const computedStreak = 1; // first session = streak of 1

    const { data: newProfile, error: createErr } = await admin
      .from("student_profiles")
      .insert({
        display_name: student.display_name || "Eleve",
        avatar: student.avatar || "🎬",
        total_xp: xpToAdd,
        sessions_played: 1,
        total_responses: responsesToAdd,
        retained_count: retainedToAdd,
        current_streak: computedStreak,
        best_streak: Math.max(newBestStreak, computedStreak),
        last_active_at: new Date().toISOString(),
        streak_updated_date: new Date().toISOString().split("T")[0],
      })
      .select("id")
      .single();

    if (createErr || !newProfile) {
      console.error("[student-context] Profile creation failed:", createErr?.message);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    profileId = newProfile.id;

    // Link profile to student
    await admin
      .from("students")
      .update({ profile_id: profileId })
      .eq("id", studentId);

    updatedStats = {
      totalXp: xpToAdd,
      sessionsPlayed: 1,
      totalResponses: responsesToAdd,
      retainedCount: retainedToAdd,
      currentStreak: computedStreak,
      bestStreak: Math.max(newBestStreak, computedStreak),
      totalVotes: 0,
      level: 0,
    };
  }

  // Check achievements and upsert new unlocks
  const earned = checkAchievements(updatedStats);
  const newUnlocks = await upsertAchievements(admin, profileId, earned);

  return NextResponse.json({ ok: true, profileId, newUnlocks });
}
