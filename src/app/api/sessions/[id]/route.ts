import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator, safeJson, broadcastSessionUpdate } from "@/lib/api-utils";
import { patchSessionSchema, formatZodError } from "@/lib/schemas";

// GET — session detail (facilitator only)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireFacilitator(id);
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("sessions")
    .select("*, students(*)")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PATCH — update session state (facilitator only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Broadcast session update to all connected clients (bypasses RLS)
  broadcastSessionUpdate(id);

  return NextResponse.json(data);
}

// DELETE — soft-delete session (facilitator only)
// Sets deleted_at timestamp; RLS policies filter out soft-deleted rows.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireFacilitator(id);
  if ("error" in auth) return auth.error;

  const { error } = await auth.supabase
    .from("sessions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
