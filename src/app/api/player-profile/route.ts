import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUUID } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get("profileId");
  if (!profileId || !isValidUUID(profileId)) {
    return NextResponse.json(
      { error: "profileId invalide ou manquant" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // ── 1. Fetch profile ──
  const { data: profile, error: profileErr } = await supabase
    .from("student_profiles")
    .select(
      "id, display_name, avatar, avatar_frame, custom_title, total_xp, current_streak, best_streak, sessions_played, total_responses, retained_count, level, last_active_at, streak_updated_date, creative_profile"
    )
    .eq("id", profileId)
    .single();

  if (profileErr || !profile) {
    return NextResponse.json(
      { error: "Profil introuvable" },
      { status: 404 }
    );
  }

  // ── 2. Fetch achievements (joined with definitions) ──
  const { data: achievementsRaw } = await supabase
    .from("student_achievements")
    .select(
      "achievement_id, tier, progress, unlocked_at, achievement_definitions(id, category, name_fr, description_fr, icon, tiers, reward_type, reward_value)"
    )
    .eq("profile_id", profileId);

  const achievements = (achievementsRaw || []).map((a) => {
    const def = a.achievement_definitions as unknown as {
      id: string;
      category: string;
      name_fr: string;
      description_fr: string;
      icon: string;
      tiers: { tier: string; threshold: number; label: string }[];
      reward_type: string | null;
      reward_value: string | null;
    } | null;

    const tierDef = def?.tiers?.find(
      (t: { tier: string }) => t.tier === a.tier
    );

    return {
      id: a.achievement_id,
      name: def?.name_fr ?? a.achievement_id,
      description: def?.description_fr ?? "",
      icon: def?.icon ?? "",
      category: def?.category ?? "special",
      tier: a.tier,
      progress: a.progress ?? 0,
      threshold: tierDef?.threshold ?? 1,
      unlockedAt: a.unlocked_at,
      reward: def?.reward_type
        ? { type: def.reward_type, value: def.reward_value }
        : null,
    };
  });

  // ── 3. Fetch session history via students table ──
  const { data: students } = await supabase
    .from("students")
    .select("id, session_id, joined_at, sessions(id, title, class_label, created_at)")
    .eq("profile_id", profileId)
    .order("joined_at", { ascending: false });

  const sessionHistory = (students || []).map((s) => {
    const sess = s.sessions as unknown as {
      id: string;
      title: string;
      class_label: string | null;
      created_at: string;
    } | null;

    return {
      sessionId: sess?.id ?? s.session_id,
      title: sess?.title ?? "Seance",
      classLabel: sess?.class_label ?? null,
      date: sess?.created_at ?? s.joined_at,
    };
  });

  // ── 4. Class leaderboard ──
  // Find the most recent session's class_label for this profile
  const latestClassLabel = sessionHistory.find((s) => s.classLabel)?.classLabel;
  let classLeaderboard: {
    profileId: string;
    displayName: string;
    avatar: string;
    totalXp: number;
    rank: number;
  }[] = [];

  if (latestClassLabel) {
    // Find all sessions with same class_label
    const { data: classSessions } = await supabase
      .from("sessions")
      .select("id")
      .eq("class_label", latestClassLabel);

    if (classSessions && classSessions.length > 0) {
      const classSessionIds = classSessions.map((s) => s.id);

      // Find all profile_ids of students in those sessions
      const { data: classStudents } = await supabase
        .from("students")
        .select("profile_id")
        .in("session_id", classSessionIds)
        .not("profile_id", "is", null);

      if (classStudents && classStudents.length > 0) {
        const uniqueProfileIds = [
          ...new Set(classStudents.map((s) => s.profile_id).filter(Boolean)),
        ] as string[];

        // Fetch those profiles ordered by XP
        const { data: leaderboardProfiles } = await supabase
          .from("student_profiles")
          .select("id, display_name, avatar, total_xp")
          .in("id", uniqueProfileIds)
          .order("total_xp", { ascending: false })
          .limit(10);

        classLeaderboard = (leaderboardProfiles || []).map((p, i) => ({
          profileId: p.id,
          displayName: p.display_name,
          avatar: p.avatar,
          totalXp: p.total_xp ?? 0,
          rank: i + 1,
        }));
      }
    }
  }

  return NextResponse.json({
    profile: {
      id: profile.id,
      displayName: profile.display_name,
      avatar: profile.avatar,
      avatarFrame: profile.avatar_frame,
      customTitle: profile.custom_title,
      totalXp: profile.total_xp ?? 0,
      currentStreak: profile.current_streak ?? 0,
      bestStreak: profile.best_streak ?? 0,
      sessionsPlayed: profile.sessions_played ?? 0,
      totalResponses: profile.total_responses ?? 0,
      retainedCount: profile.retained_count ?? 0,
      level: profile.level ?? 0,
      lastActiveAt: profile.last_active_at,
      streakUpdatedDate: profile.streak_updated_date,
      creativeProfile: profile.creative_profile,
    },
    achievements,
    sessionHistory,
    classLeaderboard,
  });
}
