import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator, withErrorHandler } from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/admin";

// GET — return replay data (events + context) for a finished session
export const GET = withErrorHandler(async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();

  // Fetch all events ordered by sequence
  const { data: events, error: evErr } = await admin
    .from("session_events")
    .select("id, event_type, student_id, situation_id, payload, occurred_at, seq")
    .eq("session_id", sessionId)
    .order("seq", { ascending: true })
    .limit(5000);

  if (evErr) {
    return NextResponse.json({ error: evErr.message }, { status: 500 });
  }

  if (!events || events.length === 0) {
    return NextResponse.json({ events: [], students: [], responses: [], collectiveChoices: [], situations: [] });
  }

  // Compute offsetMs relative to first event
  const firstTs = new Date(events[0].occurred_at).getTime();
  const enrichedEvents = events.map((e) => ({
    ...e,
    offsetMs: new Date(e.occurred_at).getTime() - firstTs,
  }));

  // Fetch context data
  const [studentsRes, responsesRes, choicesRes, situationsRes] = await Promise.all([
    admin.from("students").select("id, display_name, avatar").eq("session_id", sessionId),
    admin
      .from("responses")
      .select("id, student_id, situation_id, text, response_time_ms, ai_score, is_highlighted, submitted_at")
      .eq("session_id", sessionId)
      .order("submitted_at", { ascending: true })
      .limit(1000),
    admin
      .from("collective_choices")
      .select("id, situation_id, category, restitution_label, chosen_text, validated_at")
      .eq("session_id", sessionId),
    admin.from("situations").select("id, prompt, category, position, question_type").eq("session_id", sessionId),
  ]);

  return NextResponse.json({
    events: enrichedEvents,
    totalDurationMs: enrichedEvents[enrichedEvents.length - 1].offsetMs,
    students: studentsRes.data || [],
    responses: responsesRes.data || [],
    collectiveChoices: choicesRes.data || [],
    situations: situationsRes.data || [],
  });
});
