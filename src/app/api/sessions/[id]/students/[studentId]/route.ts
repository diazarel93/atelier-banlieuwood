import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { safeJson } from "@/lib/api-utils";

// PATCH — warn a student (auto-kick at 3 warnings)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  const { id: sessionId, studentId } = await params;
  const supabase = await createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

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

  // Hand raise — toggle (facilitator can also clear it)
  if (body.action === "clear_hand") {
    const { error } = await supabase
      .from("students")
      .update({ hand_raised_at: null })
      .eq("id", studentId)
      .eq("session_id", sessionId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ hand_raised_at: null });
  }

  if (body.action === "warn") {
    // Get current warnings
    const { data: student } = await supabase
      .from("students")
      .select("warnings")
      .eq("id", studentId)
      .eq("session_id", sessionId)
      .single();

    const newWarnings = (student?.warnings || 0) + 1;
    const kicked = newWarnings >= 3;

    const { error } = await supabase
      .from("students")
      .update({
        warnings: newWarnings,
        ...(kicked ? { kicked: true, is_active: false } : {}),
      })
      .eq("id", studentId)
      .eq("session_id", sessionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ warnings: newWarnings, kicked });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}

// DELETE — remove a student from the session (facilitator only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  const { id: sessionId, studentId } = await params;
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // Deactivate the student (soft delete — keep their data)
  const { error } = await supabase
    .from("students")
    .update({ is_active: false })
    .eq("id", studentId)
    .eq("session_id", sessionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
