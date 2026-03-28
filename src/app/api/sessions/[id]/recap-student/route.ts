import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUUID, withErrorHandler } from "@/lib/api-utils";

/**
 * GET /api/sessions/[id]/recap-student?studentId=...
 * Public route for students to view their session recap.
 * Returns collective choices + student's own contributions.
 * No facilitator auth required — studentId is validated against session.
 */
export const GET = withErrorHandler(async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const studentId = req.nextUrl.searchParams.get("studentId");

  if (!isValidUUID(sessionId)) {
    return NextResponse.json({ error: "Session invalide" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Get session info (must be done)
  const { data: session } = await admin
    .from("sessions")
    .select("id, title, status")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (!session) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  if (session.status !== "done") return NextResponse.json({ error: "Session pas encore terminee" }, { status: 400 });

  // Get all collective choices (the assembled story)
  const { data: choices } = await admin
    .from("collective_choices")
    .select("id, category, restitution_label, chosen_text, source_response_id, validated_at")
    .eq("session_id", sessionId)
    .order("validated_at", { ascending: true });

  // Build story
  let myResponseIds = new Set<string>();

  if (studentId && isValidUUID(studentId)) {
    // Validate student belongs to session
    const { data: student } = await admin
      .from("students")
      .select("id")
      .eq("id", studentId)
      .eq("session_id", sessionId)
      .single();

    if (student) {
      const { data: responses } = await admin
        .from("responses")
        .select("id")
        .eq("session_id", sessionId)
        .eq("student_id", studentId);

      myResponseIds = new Set((responses || []).map((r) => r.id));
    }
  }

  const story = (choices || []).map((c) => ({
    category: c.category,
    restitutionLabel: c.restitution_label,
    chosenText: c.chosen_text,
    isMine: !!(c.source_response_id && myResponseIds.has(c.source_response_id)),
  }));

  const myChosenCount = story.filter((s) => s.isMine).length;

  return NextResponse.json({
    sessionTitle: session.title,
    story,
    myChosenCount,
    totalChoices: story.length,
  });
});
