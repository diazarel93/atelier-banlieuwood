import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { safeJson } from "@/lib/api-utils";

// POST — student raises or lowers their hand
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;

  const rl = checkRateLimit(getIP(req), "hand-raise", { max: 20, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const { studentId, raised } = parsed.data as { studentId: string; raised: boolean };

  if (!studentId) {
    return NextResponse.json({ error: "studentId requis" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("students")
    .update({ hand_raised_at: raised ? new Date().toISOString() : null })
    .eq("id", studentId)
    .eq("session_id", sessionId);

  if (error) {
    console.error("[hand-raise]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, raised });
}
