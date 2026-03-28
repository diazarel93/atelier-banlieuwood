import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator, safeJson, withErrorHandler } from "@/lib/api-utils";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

// PATCH — warn a student (auto-kick at 3 warnings)
export const PATCH = withErrorHandler<{ id: string; studentId: string }>(async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> },
) {
  const rl = checkRateLimit(getIP(req), "student-manage", { max: 30, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId, studentId } = await params;

  // Auth: only the facilitator who owns this session
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;
  const supabase = auth.supabase;

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

    if (error) {
      console.error("[studentId clear_hand]", error.message);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
    return NextResponse.json({ hand_raised_at: null });
  }

  // Toggle active state — pause/reactivate student (#24)
  if (body.action === "toggle_active") {
    const newActive = body.is_active === true;
    const { error } = await supabase
      .from("students")
      .update({ is_active: newActive })
      .eq("id", studentId)
      .eq("session_id", sessionId);

    if (error) {
      console.error("[studentId toggle_active]", error.message);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json({ is_active: newActive });
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
      console.error("[studentId warn]", error.message);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json({ warnings: newWarnings, kicked });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
});

// DELETE — remove a student from the session (facilitator only)
export const DELETE = withErrorHandler<{ id: string; studentId: string }>(async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> },
) {
  const rl = checkRateLimit(getIP(req), "student-manage", { max: 30, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId, studentId } = await params;

  // Auth: only the facilitator who owns this session
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;
  const supabase = auth.supabase;

  // Deactivate the student (soft delete — keep their data)
  const { error } = await supabase
    .from("students")
    .update({ is_active: false })
    .eq("id", studentId)
    .eq("session_id", sessionId);

  if (error) {
    console.error("[studentId DELETE]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
});
