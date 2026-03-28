import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator, withErrorHandler } from "@/lib/api-utils";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

// POST — assign or unassign students to/from a team
export const POST = withErrorHandler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rl = checkRateLimit(getIP(req), "teams-assign", { max: 30, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const { studentIds, teamId } = await req.json();

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return NextResponse.json({ error: "studentIds requis" }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("students")
    .update({ team_id: teamId || null })
    .in("id", studentIds)
    .eq("session_id", sessionId);

  if (error) {
    console.error("[teams assign]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
});
