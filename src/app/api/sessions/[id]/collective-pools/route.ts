import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator, safeJson } from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  MANCHES,
  extractCandidates,
  selectCards,
  getUncoveredStudents,
  type PoolCard,
} from "@/lib/module12-data";

// GET — fetch existing pools + winners for this session
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();

  const [poolsRes, winnersRes] = await Promise.all([
    admin
      .from("module12_pools")
      .select("manche, cards, generated_at")
      .eq("session_id", sessionId)
      .order("manche"),
    admin
      .from("module12_winners")
      .select("manche, card_id, winning_text, validated_at")
      .eq("session_id", sessionId)
      .order("manche"),
  ]);

  return NextResponse.json({
    pools: poolsRes.data || [],
    winners: winnersRes.data || [],
    totalManches: MANCHES.length,
  });
}

// POST — generate pools from Module 10 data (inter-séance)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();
  const parsed = await safeJson(req);
  const forceRegenerate = parsed && !("error" in parsed) && parsed.data?.force === true;

  // Check if pools already exist
  const { data: existing } = await admin
    .from("module12_pools")
    .select("manche")
    .eq("session_id", sessionId);

  if (existing && existing.length > 0 && !forceRegenerate) {
    return NextResponse.json(
      { error: "Pools déjà générés. Utilisez force=true pour régénérer." },
      { status: 409 }
    );
  }

  // Fetch Module 10 data
  const [etsiRes, persoRes, pitchsRes, studentsRes, qcmRes] = await Promise.all([
    admin
      .from("module10_etsi")
      .select("id, student_id, etsi_text")
      .eq("session_id", sessionId),
    admin
      .from("module10_personnages")
      .select("id, student_id, prenom, age, trait_dominant")
      .eq("session_id", sessionId),
    admin
      .from("module10_pitchs")
      .select("id, student_id, objectif, obstacle, pitch_text")
      .eq("session_id", sessionId),
    admin
      .from("students")
      .select("id")
      .eq("session_id", sessionId)
      .eq("is_active", true),
    // QCM responses from M10 S1 P2 (standard responses table)
    admin
      .from("responses")
      .select("student_id, text")
      .eq("session_id", sessionId)
      .in(
        "situation_id",
        (
          await admin
            .from("situations")
            .select("id")
            .eq("module", 10)
            .eq("seance", 1)
            .eq("position", 2)
        ).data?.map((s) => s.id) || []
      ),
  ]);

  const m10Data = {
    etsiResponses: etsiRes.data || [],
    personnages: persoRes.data || [],
    pitchs: pitchsRes.data || [],
    qcmResponses: qcmRes.data || [],
  };

  const allStudentIds = (studentsRes.data || []).map((s) => s.id);

  // Delete existing pools if regenerating
  if (forceRegenerate && existing && existing.length > 0) {
    await admin
      .from("module12_pools")
      .delete()
      .eq("session_id", sessionId);
  }

  // Generate pools for each manche
  const generatedPools: { manche: number; cards: PoolCard[] }[] = [];

  for (let i = 0; i < MANCHES.length; i++) {
    const mancheNum = i + 1;
    const config = MANCHES[i];
    const candidates = extractCandidates(mancheNum, m10Data);
    const uncovered = getUncoveredStudents(generatedPools, allStudentIds);
    const cards = selectCards(candidates, config.maxCards, uncovered, mancheNum);
    generatedPools.push({ manche: mancheNum, cards });
  }

  // Insert all pools
  const { error: insertError } = await admin
    .from("module12_pools")
    .insert(
      generatedPools.map((p) => ({
        session_id: sessionId,
        manche: p.manche,
        cards: p.cards,
      }))
    );

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    pools: generatedPools.map((p) => ({
      manche: p.manche,
      cardCount: p.cards.length,
      studentCards: p.cards.filter((c) => !c.isBanlieuwood).length,
      banlieuCards: p.cards.filter((c) => c.isBanlieuwood).length,
    })),
  });
}
