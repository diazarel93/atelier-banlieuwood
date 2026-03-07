import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator, isValidUUID, safeJson } from "@/lib/api-utils";
import { logSessionEvent } from "@/lib/event-logger";

// GET — fetch all collective choices for a session (facilitator only)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("collective_choices")
    .select("id, situation_id, category, restitution_label, chosen_text, validated_at")
    .eq("session_id", sessionId)
    .order("validated_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST — facilitator validates a collective choice
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const { situationId, category, restitutionLabel, chosenText, sourceResponseId } =
    parsed.data;

  if (!situationId || !isValidUUID(situationId)) {
    return NextResponse.json({ error: "situationId requis et valide" }, { status: 400 });
  }
  if (!chosenText) {
    return NextResponse.json({ error: "chosenText requis" }, { status: 400 });
  }
  if (sourceResponseId && !isValidUUID(sourceResponseId)) {
    return NextResponse.json({ error: "sourceResponseId invalide" }, { status: 400 });
  }

  // Sanitize inputs
  const cleanText = String(chosenText).trim().slice(0, 500);
  const cleanCategory = category ? String(category).trim().slice(0, 50) : "";
  const cleanLabel = restitutionLabel ? String(restitutionLabel).trim().slice(0, 100) : "";

  if (cleanText.length < 1) {
    return NextResponse.json({ error: "Texte de choix trop court" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("collective_choices")
    .upsert(
      {
        session_id: sessionId,
        situation_id: situationId,
        category: cleanCategory,
        restitution_label: cleanLabel,
        chosen_text: cleanText,
        source_response_id: sourceResponseId || null,
      },
      { onConflict: "session_id,situation_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log collective choice event (fire-and-forget)
  logSessionEvent({
    sessionId,
    eventType: "collective_choice",
    situationId,
    payload: { category: cleanCategory, sourceResponseId: sourceResponseId || null },
  });

  return NextResponse.json(data);
}
