import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// POST /api/festival/vote — vote for an entry
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { entryId, voterProfileId } = await req.json();

  if (!entryId || !voterProfileId) {
    return NextResponse.json(
      { error: "entryId et voterProfileId requis" },
      { status: 400 },
    );
  }

  // Check not voting for own entry
  const { data: entry } = await supabase
    .from("festival_entries")
    .select("profile_id")
    .eq("id", entryId)
    .single();

  if (entry?.profile_id === voterProfileId) {
    return NextResponse.json(
      { error: "Tu ne peux pas voter pour ta propre creation" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("festival_votes")
    .insert({ entry_id: entryId, voter_profile_id: voterProfileId });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Tu as deja vote pour cette creation" }, { status: 409 });
    }
    console.error("[festival vote]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // Increment vote count
  await supabase.rpc("increment_vote_count", { p_entry_id: entryId });

  return NextResponse.json({ success: true });
}
