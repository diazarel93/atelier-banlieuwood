import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth-helpers";

/**
 * GET /api/v2/search?q=...
 * Lightweight search for command palette — returns matching sessions + students.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ sessions: [], students: [] });
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const authUser = await getAuthUser(supabase);
  const isAdmin = authUser?.role === "admin";
  const pattern = `%${q}%`;

  // Search sessions by title
  let sessionQuery = supabase
    .from("sessions")
    .select("id, title, status, class_label")
    .ilike("title", pattern)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!isAdmin) {
    sessionQuery = sessionQuery.eq("facilitator_id", user.id);
  }

  const { data: sessions } = await sessionQuery;

  // Search students by display_name
  // For non-admin, first get own session IDs to filter students
  let sessionIdsForFilter: string[] | null = null;
  if (!isAdmin) {
    const { data: ownSessions } = await supabase
      .from("sessions")
      .select("id")
      .eq("facilitator_id", user.id)
      .limit(200);
    sessionIdsForFilter = (ownSessions || []).map((s) => s.id);
  }

  let studentQuery = supabase
    .from("students")
    .select("id, display_name, avatar, profile_id")
    .ilike("display_name", pattern)
    .order("joined_at", { ascending: false })
    .limit(5);

  if (sessionIdsForFilter) {
    studentQuery = studentQuery.in("session_id", sessionIdsForFilter);
  }

  const { data: students } = await studentQuery;

  return NextResponse.json({
    sessions: (sessions || []).map((s) => ({
      id: s.id,
      title: s.title,
      status: s.status,
      classLabel: (s as Record<string, unknown>).class_label || null,
    })),
    students: (students || []).map((s) => ({
      id: s.profile_id || s.id,
      displayName: s.display_name,
      avatar: s.avatar,
    })),
  });
}
