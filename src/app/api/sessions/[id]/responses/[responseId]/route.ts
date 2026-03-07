import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { safeJson } from "@/lib/api-utils";
import { logSessionEvent } from "@/lib/event-logger";

// PATCH — update response flags (is_hidden, is_vote_option) — facilitator only
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; responseId: string }> }
) {
  const { id: sessionId, responseId } = await params;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  // Verify facilitator owns this session (RLS ensures this, but be explicit)
  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const body = parsed.data;

  // ── Reset action: save previous text, set reset_at ──
  if (body.action === "reset") {
    // First get current text to save as previous_text
    const { data: current } = await supabase
      .from("responses")
      .select("text, reset_at")
      .eq("id", responseId)
      .eq("session_id", sessionId)
      .single();

    if (!current) {
      return NextResponse.json({ error: "Réponse introuvable" }, { status: 404 });
    }

    if (current.reset_at) {
      return NextResponse.json({ error: "Déjà relancé" }, { status: 400 });
    }

    const { error } = await supabase
      .from("responses")
      .update({
        reset_at: new Date().toISOString(),
        previous_text: current.text,
      })
      .eq("id", responseId)
      .eq("session_id", sessionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, reset: true });
  }

  const updates: Record<string, unknown> = {};

  if (typeof body.is_hidden === "boolean") {
    updates.is_hidden = body.is_hidden;
  }
  if (typeof body.is_vote_option === "boolean") {
    updates.is_vote_option = body.is_vote_option;
  }
  if (typeof body.is_highlighted === "boolean") {
    updates.is_highlighted = body.is_highlighted;
  }
  if (body.teacher_comment !== undefined) {
    updates.teacher_comment = body.teacher_comment
      ? String(body.teacher_comment).trim().slice(0, 500)
      : null;
  }
  if (body.teacher_nudge !== undefined) {
    updates.teacher_nudge = body.teacher_nudge
      ? String(body.teacher_nudge).trim().slice(0, 300)
      : null;
  }
  if (typeof body.teacher_score === "number") {
    updates.teacher_score = Math.max(0, Math.min(5, Math.round(body.teacher_score)));
  }
  if (typeof body.ai_score === "number") {
    updates.ai_score = Math.max(0, Math.min(5, Math.round(body.ai_score)));
  }
  if (body.ai_feedback !== undefined) {
    updates.ai_feedback = body.ai_feedback
      ? String(body.ai_feedback).trim().slice(0, 500)
      : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Aucun champ valide fourni" },
      { status: 400 }
    );
  }

  // Update response — verify it belongs to this session
  const { data, error } = await supabase
    .from("responses")
    .update(updates)
    .eq("id", responseId)
    .eq("session_id", sessionId)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Réponse introuvable dans cette session" },
      { status: 404 }
    );
  }

  // Log highlight event (fire-and-forget)
  if (typeof body.is_highlighted === "boolean" && body.is_highlighted) {
    logSessionEvent({
      sessionId,
      eventType: "highlight",
      payload: { responseId },
    });
  }

  return NextResponse.json({ ok: true });
}
