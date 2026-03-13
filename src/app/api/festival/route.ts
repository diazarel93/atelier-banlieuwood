import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// GET /api/festival — list published entries
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const category = req.nextUrl.searchParams.get("category");
  const sort = req.nextUrl.searchParams.get("sort") || "recent"; // recent, popular

  let query = supabase
    .from("festival_entries")
    .select(`
      *,
      profile:student_profiles!festival_entries_profile_id_fkey(
        id, display_name, avatar, avatar_frame, level, custom_title
      )
    `)
    .eq("is_published", true);

  if (category) {
    query = query.eq("category", category);
  }

  if (sort === "popular") {
    query = query.order("vote_count", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query.limit(50);

  if (error) {
    console.error("[festival GET]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// POST /api/festival — submit entry
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const body = await req.json();
  const { profileId, sessionId, title, content, entryType, category } = body;

  if (!profileId || !title || !content || !entryType) {
    return NextResponse.json(
      { error: "profileId, title, content, et entryType requis" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("festival_entries")
    .insert({
      profile_id: profileId,
      session_id: sessionId || null,
      title,
      content,
      entry_type: entryType,
      category: category || null,
      is_published: true,
    })
    .select()
    .single();

  if (error) {
    console.error("[festival POST]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json(data);
}
