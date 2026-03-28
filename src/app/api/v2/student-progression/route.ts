import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isValidUUID, withErrorHandler } from "@/lib/api-utils";

/**
 * GET /api/v2/student-progression?studentId=X
 * Returns per-session axis scores for a single student, ordered chronologically.
 * OIE scoring has been removed — returns empty points for now.
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
  const studentId = url.searchParams.get("studentId");

  if (!studentId || !isValidUUID(studentId)) {
    return NextResponse.json({ error: "studentId requis (UUID)" }, { status: 400 });
  }

  // Find all student records for this profile (or direct student id)
  const { data: students } = await supabase
    .from("students")
    .select("id, display_name, session_id, profile_id")
    .or(`profile_id.eq.${studentId},id.eq.${studentId}`);

  if (!students || students.length === 0) {
    return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
  }

  const displayName = students[0].display_name;

  // OIE scoring removed — return empty progression
  return NextResponse.json({
    studentId,
    displayName,
    points: [],
  });
});
