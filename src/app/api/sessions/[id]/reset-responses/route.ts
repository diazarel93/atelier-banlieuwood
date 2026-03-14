import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator, isValidUUID, safeJson, withErrorHandler } from "@/lib/api-utils";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

// POST — reset all responses for a situation (teacher replays the question)
export const POST = withErrorHandler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "reset-responses", { max: 10, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const { situationId } = parsed.data;

  if (!situationId || !isValidUUID(situationId)) {
    return NextResponse.json({ error: "situationId requis et valide" }, { status: 400 });
  }

  // Save previous text and set reset_at on all non-reset responses for this situation
  const { data: responses, error: fetchError } = await auth.supabase
    .from("responses")
    .select("id, text")
    .eq("session_id", sessionId)
    .eq("situation_id", situationId)
    .is("reset_at", null);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!responses || responses.length === 0) {
    return NextResponse.json({ ok: true, resetCount: 0 });
  }

  // Batch update: set reset_at + previous_text for each response
  const now = new Date().toISOString();
  let resetCount = 0;

  for (const r of responses) {
    const { error } = await auth.supabase
      .from("responses")
      .update({
        reset_at: now,
        previous_text: r.text,
      })
      .eq("id", r.id);

    if (!error) resetCount++;
  }

  return NextResponse.json({ ok: true, resetCount });
});
