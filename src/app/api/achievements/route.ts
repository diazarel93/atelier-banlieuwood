import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// GET /api/achievements — get current user's achievements
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const profileId = req.nextUrl.searchParams.get("profileId");

  if (!profileId) {
    return NextResponse.json({ error: "profileId requis" }, { status: 400 });
  }

  const { data: achievements, error } = await supabase
    .from("student_achievements")
    .select("*")
    .eq("profile_id", profileId)
    .order("unlocked_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also get all definitions
  const { data: definitions } = await supabase
    .from("achievement_definitions")
    .select("*");

  return NextResponse.json({
    unlocked: achievements || [],
    definitions: definitions || [],
  });
}

// POST /api/achievements — unlock an achievement
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const body = await req.json();
  const { profileId, achievementId, tier, progress } = body;

  if (!profileId || !achievementId || !tier) {
    return NextResponse.json(
      { error: "profileId, achievementId, et tier requis" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("student_achievements")
    .upsert(
      {
        profile_id: profileId,
        achievement_id: achievementId,
        tier,
        progress: progress || 0,
        unlocked_at: new Date().toISOString(),
      },
      { onConflict: "profile_id,achievement_id,tier" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
