import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// GET /api/missions — list available missions
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const profileId = req.nextUrl.searchParams.get("profileId");

  const now = new Date().toISOString();

  const { data: missions, error } = await supabase
    .from("missions")
    .select("*")
    .or(`available_until.is.null,available_until.gte.${now}`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get submissions if profileId provided
  let submissions: Record<string, unknown>[] = [];
  if (profileId) {
    const { data } = await supabase
      .from("mission_submissions")
      .select("*")
      .eq("profile_id", profileId);
    submissions = data || [];
  }

  return NextResponse.json({ missions: missions || [], submissions });
}

// POST /api/missions — submit mission response
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const body = await req.json();
  const { missionId, profileId, content } = body;

  if (!missionId || !profileId || !content) {
    return NextResponse.json(
      { error: "missionId, profileId, et content requis" },
      { status: 400 },
    );
  }

  // Get mission for XP reward
  const { data: mission } = await supabase
    .from("missions")
    .select("xp_reward")
    .eq("id", missionId)
    .single();

  const xpEarned = Math.round((mission?.xp_reward || 50) * 0.5); // 50% of live XP

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update profile XP
  await supabase.rpc("increment_profile_xp", {
    p_profile_id: profileId,
    p_xp: xpEarned,
  });

  return NextResponse.json(data);
}
