import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator, safeJson, broadcastSessionUpdate, withErrorHandler } from "@/lib/api-utils";
import { patchSessionSchema, formatZodError } from "@/lib/schemas";
import { logSessionEvent } from "@/lib/event-logger";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

// GET — session detail (facilitator only)
export const GET = withErrorHandler(async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireFacilitator(id);
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("sessions")
    .select("id, title, status, level, template, join_code, facilitator_id, created_at, scheduled_at, class_label, current_module, current_seance, current_situation_index, timer_ends_at, question_opened_at, broadcast_message, completed_modules, thematique, deleted_at, teacher_notes, students(id, display_name, avatar, session_id, profile_id, joined_at, is_active)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[sessions GET]", id, error.message, error.code);
    // PGRST204 = no rows, else it's a query/schema error
    const status = error.code === "PGRST116" ? 404 : 500;
    return NextResponse.json(
      { error: status === 404 ? "Session introuvable" : `Erreur DB: ${error.message}` },
      { status }
    );
  }

  return NextResponse.json(data);
});

// PATCH — update session state (facilitator only)
export const PATCH = withErrorHandler(async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "session-update", { max: 30, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id } = await params;
  const auth = await requireFacilitator(id);
  if ("error" in auth) return auth.error;

  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;

  const validated = patchSessionSchema.safeParse(parsed.data);
  if (!validated.success) {
    return NextResponse.json(
      { error: formatZodError(validated.error) },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = { ...validated.data };

  // Record when question was opened (for response_time_ms computation)
  if (updates.status === "responding") {
    updates.question_opened_at = new Date().toISOString();
  }

  // Trim title
  if (updates.title) {
    updates.title = String(updates.title).trim();
  }
  // Trim broadcast message
  if (updates.broadcast_message !== undefined && updates.broadcast_message !== null) {
    updates.broadcast_message = String(updates.broadcast_message).trim();
  }
  // Deduplicate completed_modules
  if (updates.completed_modules) {
    updates.completed_modules = [...new Set(updates.completed_modules as string[])];
  }
  // Validate situation index upper bound
  if (updates.current_situation_index != null) {
    const mod = updates.current_module as number | undefined;
    const seance = updates.current_seance as number | undefined;
    if (mod && seance) {
      const { getSeanceMax } = await import("@/lib/constants");
      const max = getSeanceMax(mod, seance);
      if ((updates.current_situation_index as number) >= max) {
        return NextResponse.json(
          { error: `Index de situation invalide (max ${max - 1} pour ce module/séance)` },
          { status: 400 }
        );
      }
    }
  }

  const { data, error } = await auth.supabase
    .from("sessions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[sessions PATCH]", id, error.message);
    return NextResponse.json({ error: "Erreur lors de la mise à jour de la session" }, { status: 500 });
  }

  // Broadcast session update to all connected clients (bypasses RLS)
  broadcastSessionUpdate(id);

  // ── Log session events (fire-and-forget) ──
  if (updates.status) {
    logSessionEvent({ sessionId: id, eventType: "status_change", payload: { to: updates.status } });
  }
  if (updates.status === "responding") {
    logSessionEvent({
      sessionId: id,
      eventType: "question_launched",
      payload: {
        module: data.current_module,
        seance: data.current_seance,
        situationIndex: data.current_situation_index,
      },
    });
  }
  // Auto-trigger O-I-E computation when session is done
  if (updates.status === "done") {
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/sessions/${id}/oie-profile`, { method: "POST" })
      .then((r) => {
        if (!r.ok) console.error(`[OIE] Computation failed for session ${id}: HTTP ${r.status}`);
      })
      .catch((err) => console.error(`[OIE] Computation error for session ${id}:`, err.message));
  }

  return NextResponse.json(data);
});

// DELETE — soft-delete session (facilitator only)
// Sets deleted_at timestamp; RLS policies filter out soft-deleted rows.
export const DELETE = withErrorHandler(async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "session-update", { max: 30, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id } = await params;
  const auth = await requireFacilitator(id);
  if ("error" in auth) return auth.error;

  const { error } = await auth.supabase
    .from("sessions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[sessions DELETE]", id, error.message);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
});
