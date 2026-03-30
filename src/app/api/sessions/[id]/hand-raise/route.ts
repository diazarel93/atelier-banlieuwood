import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { safeJson, withErrorHandler } from "@/lib/api-utils";
import { verifyStudentToken } from "@/lib/student-token";

// POST — student raises or lowers their hand
export const POST = withErrorHandler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;

  const rl = checkRateLimit(getIP(req), "hand-raise", { max: 20, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const { studentId: _sid, raised } = parsed.data as { studentId: string; raised: boolean };
  let studentId = _sid;

  // Prefer token-based auth over body studentId
  const tokenCookie = req.cookies.get("bw-student-token")?.value;
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const rawToken = tokenCookie || bearerToken;
  if (rawToken) {
    const verified = verifyStudentToken(rawToken);
    if (verified && verified.sessionId === sessionId) {
      studentId = verified.studentId;
    }
  }

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
});
