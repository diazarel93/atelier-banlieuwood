import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator, safeJson, withErrorHandler } from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

// POST — facilitator validates the winning card for a manche
export const POST = withErrorHandler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rl = checkRateLimit(getIP(req), "manche-winner", { max: 30, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;

  const { manche, cardId, winningText } = parsed.data;

  if (!manche || typeof manche !== "number" || manche < 1 || manche > 8) {
    return NextResponse.json({ error: "manche requis (1-8)" }, { status: 400 });
  }
  if (!cardId || typeof cardId !== "string") {
    return NextResponse.json({ error: "cardId requis" }, { status: 400 });
  }
  if (!winningText || typeof winningText !== "string") {
    return NextResponse.json({ error: "winningText requis" }, { status: 400 });
  }

  const admin = createAdminClient();

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

  // Upsert winner
  const { error } = await admin.from("module12_winners").upsert(
    {
      session_id: sessionId,
      manche,
      card_id: cardId,
      winning_text: String(winningText).trim().slice(0, 500),
      validated_at: new Date().toISOString(),
    },
    { onConflict: "session_id,manche" },
  );

  if (error) {
    console.error("[manche-winner]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, manche, cardId, winningText });
});
