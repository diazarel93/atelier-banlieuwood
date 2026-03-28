import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { withErrorHandler } from "@/lib/api-utils";

/**
 * GET /api/v2/class-students-evolution?classLabel=X
 * Returns per-session scores for all students in a class, chronologically.
 * OIE scoring has been removed — returns empty student evolution data.
 */
export const GET = withErrorHandler<Record<string, never>>(async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const url = new URL(req.url);
  const classLabel = url.searchParams.get("classLabel");

  // Get facilitator sessions (optionally filtered by class)
  let sessQuery = supabase
    .from("sessions")
    .select("id, title, created_at, class_label")
    .eq("facilitator_id", user.id)
    .order("created_at", { ascending: true });

  if (classLabel) {
    sessQuery = sessQuery.eq("class_label", classLabel);
  }

  const { data: sessions } = await sessQuery;
  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ sessions: [], students: [] });
  }

  // OIE scoring removed — return sessions but empty student evolution
  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      title: s.title,
      date: s.created_at,
    })),
    students: [],
  });
});
