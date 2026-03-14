import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isValidUUID, withErrorHandler } from "@/lib/api-utils";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

// GET /api/missions — list available missions
export const GET = withErrorHandler<Record<string, never>>(async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const profileId = req.nextUrl.searchParams.get("profileId");

  const now = new Date().toISOString();

  const { data: missions, error } = await supabase
    .from("missions")
    .select("id, title, description, xp_reward, available_until, created_at")
    .or(`available_until.is.null,available_until.gte.${now}`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[missions GET]", error.message);
    return NextResponse.json({ error: "Erreur lors du chargement des missions" }, { status: 500 });
  }

  // Get submissions if profileId provided
  let submissions: Record<string, unknown>[] = [];
  if (profileId && isValidUUID(profileId)) {
    const { data } = await supabase
      .from("mission_submissions")
      .select("id, mission_id, profile_id, content, xp_earned, submitted_at")
      .eq("profile_id", profileId);
    submissions = data || [];
  }

  return NextResponse.json({ missions: missions || [], submissions });
});

// POST /api/missions — submit mission response
export const POST = withErrorHandler<Record<string, never>>(async function POST(req: NextRequest) {
  const rl = checkRateLimit(getIP(req), "missions", { max: 20, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const supabase = await createServerSupabase();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }
  const { missionId, profileId, content } = body as { missionId?: string; profileId?: string; content?: string };

  if (!missionId || !profileId || !content || !isValidUUID(missionId) || !isValidUUID(profileId)) {
    return NextResponse.json(
      { error: "missionId, profileId, et content requis" },
      { status: 400 },
    );
  }
  if (typeof content === "string" && content.length > 5000) {
    return NextResponse.json({ error: "Contenu trop long (max 5000 caractères)" }, { status: 400 });
  }

  // Get mission for XP reward
  const { data: mission } = await supabase
    .from("missions")
    .select("xp_reward")
    .eq("id", missionId)
    .single();

  if (!mission) {
    return NextResponse.json({ error: "Mission introuvable" }, { status: 404 });
  }

  const xpEarned = Math.round((mission.xp_reward || 50) * 0.5); // 50% of live XP

  const { data, error } = await supabase
    .from("mission_submissions")
    .upsert(
      {
        mission_id: missionId,
        profile_id: profileId,
        content,
        xp_earned: xpEarned,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "mission_id,profile_id" },
    )
    .select()
    .single();

  if (error) {
    console.error("[missions POST]", error.message);
    return NextResponse.json({ error: "Erreur lors de la soumission" }, { status: 500 });
  }

  // Update profile XP
  await supabase.rpc("increment_profile_xp", {
    p_profile_id: profileId,
    p_xp: xpEarned,
  });

  return NextResponse.json(data);
});
