import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUUID } from "@/lib/api-utils";

// GET — fetch recap data for a student (collective story + personal contributions)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const studentId = req.nextUrl.searchParams.get("studentId");

  if (!isValidUUID(sessionId)) {
    return NextResponse.json({ error: "Session invalide" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Get session info
  const { data: session } = await admin
    .from("sessions")
    .select("id, title, status, current_module")
    .eq("id", sessionId)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // Get all collective choices (the assembled story)
  const { data: choices } = await admin
    .from("collective_choices")
    .select("id, situation_id, category, restitution_label, chosen_text, source_response_id, validated_at")
    .eq("session_id", sessionId)
    .order("validated_at", { ascending: true });

  // Get student's own responses if studentId provided
  let myResponses: { situationId: string; text: string; id: string }[] = [];
  let myChosenCount = 0;

  if (studentId && isValidUUID(studentId)) {
    const { data: responses } = await admin
      .from("responses")
      .select("id, situation_id, text")
      .eq("session_id", sessionId)
      .eq("student_id", studentId);

    myResponses = (responses || []).map((r) => ({
      id: r.id,
      situationId: r.situation_id,
      text: r.text,
    }));

    // Count how many of student's responses were chosen
    const myIds = new Set(myResponses.map((r) => r.id));
    myChosenCount = (choices || []).filter((c) => c.source_response_id && myIds.has(c.source_response_id)).length;
  }

  // Mark which choices came from this student
  const myResponseIds = new Set(myResponses.map((r) => r.id));
  const story = (choices || []).map((c) => ({
    id: c.id,
    category: c.category,
    restitutionLabel: c.restitution_label,
    chosenText: c.chosen_text,
    isMine: !!(c.source_response_id && myResponseIds.has(c.source_response_id)),
  }));

  return NextResponse.json({
    session: { id: session.id, title: session.title, status: session.status },
    story,
    myResponses,
    myChosenCount,
    totalChoices: story.length,
  });
}
