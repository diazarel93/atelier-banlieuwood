import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator } from "@/lib/api-utils";

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

  const body = await req.json();

  // Only allow updating specific fields
  const allowed = [
    "status",
    "current_module",
    "current_seance",
    "current_situation_index",
    "title",
    "timer_ends_at",
    "completed_modules",
    "sharing_enabled",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Rien a mettre a jour" }, { status: 400 });
  }

  // Validate field values
  const VALID_STATUSES = ["waiting", "responding", "reviewing", "voting", "results", "paused", "done"];
  if (updates.status && !VALID_STATUSES.includes(updates.status as string)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }
  if (updates.title) {
    updates.title = String(updates.title).trim().slice(0, 60);
  }
  if (updates.current_module != null && (typeof updates.current_module !== "number" || updates.current_module < 1 || updates.current_module > 10)) {
    return NextResponse.json({ error: "Module invalide" }, { status: 400 });
  }
  if (updates.current_seance != null && (typeof updates.current_seance !== "number" || updates.current_seance < 1 || updates.current_seance > 5)) {
    return NextResponse.json({ error: "Séance invalide" }, { status: 400 });
  }
  if (updates.current_situation_index != null && (typeof updates.current_situation_index !== "number" || updates.current_situation_index < 0)) {
    return NextResponse.json({ error: "Index de situation invalide" }, { status: 400 });
  }
  if (updates.timer_ends_at !== undefined && updates.timer_ends_at !== null && typeof updates.timer_ends_at !== "string") {
    return NextResponse.json({ error: "Timer invalide" }, { status: 400 });
  }
  if (updates.sharing_enabled !== undefined && typeof updates.sharing_enabled !== "boolean") {
    return NextResponse.json({ error: "sharing_enabled doit être un booléen" }, { status: 400 });
  }
  if (updates.completed_modules !== undefined) {
    const VALID_MODULE_IDS = ["m1", "m1a", "m1b", "m1c", "m1d", "m1e", "m2a", "m2b", "m2c", "m2d", "m2-perso", "m2", "m3", "m4", "m5", "u2a", "u2b", "u2c", "u2d", "m10a", "m10b"];
    if (!Array.isArray(updates.completed_modules) || !updates.completed_modules.every((id: unknown) => typeof id === "string" && VALID_MODULE_IDS.includes(id))) {
      return NextResponse.json({ error: "Modules complétés invalides" }, { status: 400 });
    }
    // Deduplicate
    updates.completed_modules = [...new Set(updates.completed_modules as string[])];
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

  return NextResponse.json(data);
}

// DELETE — delete session and all data (facilitator only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireFacilitator(id);
  if ("error" in auth) return auth.error;

  const { error } = await auth.supabase.from("sessions").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
