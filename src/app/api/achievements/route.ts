import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/api-utils";

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
    console.error("[achievements GET]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
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

  const validTiers = ["bronze", "silver", "gold"];
  if (!profileId || !achievementId || !tier || !isValidUUID(profileId)) {
    return NextResponse.json(
      { error: "profileId (UUID), achievementId, et tier requis" },
      { status: 400 },
    );
  }
  if (!validTiers.includes(tier)) {
    return NextResponse.json(
      { error: "tier invalide (bronze, silver, gold)" },
      { status: 400 },
    );
  }
  if (progress !== undefined && (typeof progress !== "number" || progress < 0 || progress > 100)) {
    return NextResponse.json(
      { error: "progress doit être entre 0 et 100" },
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
    console.error("[achievements POST]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json(data);
}
