import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUUID, withErrorHandler } from "@/lib/api-utils";

export const GET = withErrorHandler<Record<string, never>>(async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get("profileId");
  if (!profileId || !isValidUUID(profileId)) {
    return NextResponse.json({ error: "profileId invalide ou manquant" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // ── 1. Fetch profile ──
  const { data: profile, error: profileErr } = await supabase
    .from("student_profiles")
    .select(
      "id, display_name, avatar, avatar_frame, custom_title, total_xp, current_streak, best_streak, sessions_played, total_responses, retained_count, level, last_active_at, streak_updated_date, creative_profile, profile_code",
    )
    .eq("id", profileId)
    .single();

  if (profileErr || !profile) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  // ── 2. Fetch achievements (joined with definitions) ──
  const { data: achievementsRaw } = await supabase
    .from("student_achievements")
    .select(
      "achievement_id, tier, progress, unlocked_at, achievement_definitions(id, category, name_fr, description_fr, icon, tiers, reward_type, reward_value)",
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

    const tierDef = def?.tiers?.find((t: { tier: string }) => t.tier === a.tier);

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
      reward: def?.reward_type ? { type: def.reward_type, value: def.reward_value } : null,
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

  // ── 4. Next scheduled session ──
  const latestClassLabel = sessionHistory.find((s) => s.classLabel)?.classLabel;
  let nextSession: { title: string; scheduledAt: string; classLabel: string } | null = null;
  if (latestClassLabel) {
    const { data: upcoming } = await supabase
      .from("sessions")
      .select("id, title, scheduled_at, class_label")
      .eq("class_label", latestClassLabel)
      .gt("scheduled_at", new Date().toISOString())
      .is("deleted_at", null)
      .order("scheduled_at", { ascending: true })
      .limit(1)
      .single();

    if (upcoming) {
      nextSession = {
        title: upcoming.title,
        scheduledAt: upcoming.scheduled_at,
        classLabel: upcoming.class_label,
      };
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
      profileCode: profile.profile_code ?? null,
    },
    achievements,
    sessionHistory,
    nextSession,
  });
});
