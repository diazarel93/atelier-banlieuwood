import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { withErrorHandler } from "@/lib/api-utils";

/**
 * GET /api/v2/class-comparison
 * Compare scores across all classes for the facilitator.
 * OIE scoring has been removed — returns empty comparison data with student counts.
 */
export const GET = withErrorHandler<Record<string, never>>(async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // All facilitator sessions with class labels
  const { data: sessions, error: sessErr } = await supabase
    .from("sessions")
    .select("id, title, class_label, status, created_at")
    .eq("facilitator_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (sessErr) {
    return NextResponse.json({ error: sessErr.message }, { status: 500 });
  }

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ classes: [] });
  }

  const sessionIds = sessions.map((s) => s.id as string);

  // Fetch student counts
  const { data: allStudents } = await supabase
    .from("students")
    .select("id, session_id, display_name")
    .in("session_id", sessionIds)
    .eq("is_active", true);

  const studentsList = allStudents || [];

  // OIE scoring removed — return empty comparison data
  return NextResponse.json({
    classes: [],
    globalAverage: { comprehension: 0, creativite: 0, expression: 0, engagement: 0 },
    totalStudents: studentsList.length,
    totalSessions: sessions.length,
  });
});
