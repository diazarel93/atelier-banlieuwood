import { NextRequest, NextResponse } from "next/server";
import { isValidUUID, requireFacilitator, safeJson, withErrorHandler } from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

// GET — get vote results for a manche (facilitator only)
export const GET = withErrorHandler(async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;

  // Auth: only the facilitator who owns this session
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const mancheStr = req.nextUrl.searchParams.get("manche");
  const studentId = req.nextUrl.searchParams.get("studentId");

  if (!mancheStr) {
    return NextResponse.json({ error: "manche requis" }, { status: 400 });
  }
  const manche = parseInt(mancheStr, 10);
  if (isNaN(manche) || manche < 1 || manche > 8) {
    return NextResponse.json({ error: "manche invalide (1-8)" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Get votes for this manche
  const { data: votes } = await admin
    .from("module12_votes")
    .select("card_id, student_id")
    .eq("session_id", sessionId)
    .eq("manche", manche);

  // Count votes per card
  const voteCounts: Record<string, number> = {};
  for (const v of votes || []) {
    voteCounts[v.card_id] = (voteCounts[v.card_id] || 0) + 1;
  }

  // Get student's own vote if requested
  let studentVote: string | null = null;
  if (studentId && isValidUUID(studentId)) {
    const found = (votes || []).find((v) => v.student_id === studentId);
    studentVote = found?.card_id || null;
  }

  return NextResponse.json({
    manche,
    voteCounts,
    totalVotes: (votes || []).length,
    studentVote,
  });
});

// POST — student votes on a manche (upsert)
export const POST = withErrorHandler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "manche-vote", { max: 20, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;

  const { studentId, manche, cardId } = parsed.data;

  if (!studentId || !isValidUUID(studentId)) {
    return NextResponse.json({ error: "studentId requis et valide" }, { status: 400 });
  }
  if (!manche || typeof manche !== "number" || manche < 1 || manche > 8) {
    return NextResponse.json({ error: "manche requis (1-8)" }, { status: 400 });
  }
  if (!cardId || typeof cardId !== "string") {
    return NextResponse.json({ error: "cardId requis" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify student belongs to this session
  const { data: student } = await admin
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("session_id", sessionId)
    .single();

  if (!student) {
    return NextResponse.json({ error: "Élève non trouvé dans cette session" }, { status: 403 });
  }

  // Verify pool exists and card is valid
  const { data: pool } = await admin
    .from("module12_pools")
    .select("cards")
    .eq("session_id", sessionId)
    .eq("manche", manche)
    .single();

  if (!pool) {
    return NextResponse.json({ error: "Pool non trouvé pour cette manche" }, { status: 404 });
  }

  const cards = pool.cards as { cardId: string }[];
  if (!cards.some((c) => c.cardId === cardId)) {
    return NextResponse.json({ error: "Carte invalide" }, { status: 400 });
  }

  // Upsert vote
  const { error } = await admin
    .from("module12_votes")
    .upsert(
      {
        session_id: sessionId,
        student_id: studentId,
        manche,
        card_id: cardId,
        voted_at: new Date().toISOString(),
      },
      { onConflict: "session_id,student_id,manche" }
    );

  if (error) {
    console.error("[manche-vote POST]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, manche, cardId });
});
