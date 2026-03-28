import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator, isValidUUID, safeJson, withErrorHandler } from "@/lib/api-utils";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

// GET — all responses for a session (facilitator only)
export const GET = withErrorHandler(async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const situationId = req.nextUrl.searchParams.get("situationId");
  const situationIds = req.nextUrl.searchParams.getAll("situationIds");

  // Validate UUID params
  if (situationId && !isValidUUID(situationId)) {
    return NextResponse.json({ error: "situationId invalide" }, { status: 400 });
  }
  if (situationIds.length > 0 && !situationIds.every(isValidUUID)) {
    return NextResponse.json({ error: "situationIds invalides" }, { status: 400 });
  }

  let query = auth.supabase
    .from("responses")
    .select("*, students(display_name, avatar)")
    .eq("session_id", sessionId)
    .order("submitted_at", { ascending: true })
    .limit(200);

  if (situationId) {
    query = query.eq("situation_id", situationId);
  } else if (situationIds.length > 0) {
    query = query.in("situation_id", situationIds);
  }

  // Server-side filter for highlighted responses (avoids sending all to client)
  const highlighted = req.nextUrl.searchParams.get("highlighted");
  if (highlighted === "true") {
    query = query.eq("is_highlighted", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[responses GET]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json(data);
});

// PATCH — update a response (facilitator only: comment, highlight, hide, vote_option)
export const PATCH = withErrorHandler(async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rl = checkRateLimit(getIP(req), "responses-update", { max: 30, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const body = parsed.data;

  const { responseId } = body;
  if (!responseId || !isValidUUID(responseId)) {
    return NextResponse.json({ error: "responseId requis et valide" }, { status: 400 });
  }

  const allowed = [
    "teacher_comment",
    "is_highlighted",
    "is_hidden",
    "is_vote_option",
    "teacher_score",
    "ai_score",
    "ai_feedback",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Rien à mettre à jour" }, { status: 400 });
  }

  // Validate
  if (updates.teacher_comment !== undefined && updates.teacher_comment !== null) {
    updates.teacher_comment = String(updates.teacher_comment).trim().slice(0, 500);
    if (!updates.teacher_comment) updates.teacher_comment = null;
  }
  if (typeof updates.teacher_score === "number") {
    updates.teacher_score = Math.max(0, Math.min(5, Math.round(updates.teacher_score as number)));
  }
  if (typeof updates.ai_score === "number") {
    updates.ai_score = Math.max(0, Math.min(5, Math.round(updates.ai_score as number)));
  }
  if (updates.ai_feedback !== undefined && updates.ai_feedback !== null) {
    updates.ai_feedback = String(updates.ai_feedback).trim().slice(0, 500);
    if (!updates.ai_feedback) updates.ai_feedback = null;
  }

  const { data, error } = await auth.supabase
    .from("responses")
    .update(updates)
    .eq("id", responseId)
    .eq("session_id", sessionId)
    .select("*, students(display_name, avatar)")
    .single();

  if (error) {
    console.error("[responses PATCH]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json(data);
});
