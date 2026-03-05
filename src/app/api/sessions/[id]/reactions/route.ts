import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { safeJson } from "@/lib/api-utils";
import { reactionSchema, formatZodError } from "@/lib/schemas";

// POST — toggle emoji reaction on a response
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "reaction", { max: 60, windowSec: 60 });
  if (rl) {
    return NextResponse.json({ error: rl.error }, { status: 429 });
  }

  const { id: sessionId } = await params;
  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;

  const validated = reactionSchema.safeParse(parsed.data);
  if (!validated.success) {
    return NextResponse.json(
      { error: formatZodError(validated.error) },
      { status: 400 }
    );
  }

  const { responseId, studentId, emoji } = validated.data;
  const admin = createAdminClient();

  // Verify session is in a reactable state
  const { data: session } = await admin
    .from("sessions")
    .select("status")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (!session || !["reviewing", "voting", "results"].includes(session.status)) {
    return NextResponse.json(
      { error: "Les réactions ne sont pas ouvertes" },
      { status: 400 }
    );
  }

  // Verify student belongs to this session
  const { data: student } = await admin
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("session_id", sessionId)
    .single();

  if (!student) {
    return NextResponse.json(
      { error: "Joueur introuvable" },
      { status: 404 }
    );
  }

  // Toggle: check if reaction already exists
  const { data: existing } = await admin
    .from("response_reactions")
    .select("id")
    .eq("response_id", responseId)
    .eq("student_id", studentId)
    .eq("emoji", emoji)
    .single();

  if (existing) {
    // Remove reaction
    await admin.from("response_reactions").delete().eq("id", existing.id);
    return NextResponse.json({ action: "removed" });
  }

  // Add reaction
  const { error } = await admin.from("response_reactions").insert({
    response_id: responseId,
    student_id: studentId,
    session_id: sessionId,
    emoji,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ action: "added" });
}

// GET — reaction counts for a situation's responses
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const situationId = req.nextUrl.searchParams.get("situationId");

  if (!situationId) {
    return NextResponse.json(
      { error: "situationId requis" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Get all responses for this situation
  const { data: responses } = await admin
    .from("responses")
    .select("id")
    .eq("session_id", sessionId)
    .eq("situation_id", situationId);

  if (!responses || responses.length === 0) {
    return NextResponse.json({ reactions: {} });
  }

  const responseIds = responses.map((r) => r.id);

  // Get all reactions for these responses
  const { data: reactions } = await admin
    .from("response_reactions")
    .select("response_id, emoji, student_id")
    .in("response_id", responseIds);

  // Aggregate: { responseId: { emoji: { count, studentIds } } }
  const aggregated: Record<string, Record<string, { count: number; studentIds: string[] }>> = {};

  for (const r of reactions || []) {
    if (!aggregated[r.response_id]) aggregated[r.response_id] = {};
    if (!aggregated[r.response_id][r.emoji]) {
      aggregated[r.response_id][r.emoji] = { count: 0, studentIds: [] };
    }
    aggregated[r.response_id][r.emoji].count++;
    aggregated[r.response_id][r.emoji].studentIds.push(r.student_id);
  }

  return NextResponse.json({ reactions: aggregated });
}
