import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUUID } from "@/lib/api-utils";
import { getElement } from "@/lib/module5-data";

// POST — facilitator selects 2 scenes for comparison (Module 2 séance 3)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const { sceneAId, sceneBId } = await req.json();

  if (!sceneAId || !sceneBId) {
    return NextResponse.json(
      { error: "sceneAId et sceneBId requis" },
      { status: 400 }
    );
  }

  if (!isValidUUID(sceneAId) || !isValidUUID(sceneBId)) {
    return NextResponse.json({ error: "IDs invalides" }, { status: 400 });
  }

  if (sceneAId === sceneBId) {
    return NextResponse.json(
      { error: "Les deux scènes doivent être différentes" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Verify both scenes belong to this session
  const { data: scenes } = await admin
    .from("module5_scenes")
    .select("id")
    .eq("session_id", sessionId)
    .in("id", [sceneAId, sceneBId]);

  if (!scenes || scenes.length !== 2) {
    return NextResponse.json(
      { error: "Scènes introuvables dans cette session" },
      { status: 404 }
    );
  }

  // Upsert comparison
  const { data, error } = await admin
    .from("module5_comparisons")
    .upsert(
      {
        session_id: sessionId,
        scene_a_id: sceneAId,
        scene_b_id: sceneBId,
      },
      { onConflict: "session_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// GET — returns the 2 scenes (anonymized) for projection
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const admin = createAdminClient();

  // Get comparison
  const { data: comparison } = await admin
    .from("module5_comparisons")
    .select("scene_a_id, scene_b_id")
    .eq("session_id", sessionId)
    .single();

  if (!comparison) {
    return NextResponse.json({ sceneA: null, sceneB: null });
  }

  // Fetch both scenes (anonymized — no student info)
  const { data: scenes } = await admin
    .from("module5_scenes")
    .select("id, emotion, intention, obstacle, changement, elements, tokens_used, slots_used")
    .in("id", [comparison.scene_a_id, comparison.scene_b_id]);

  if (!scenes || scenes.length !== 2) {
    return NextResponse.json({ sceneA: null, sceneB: null });
  }

  const enrichElements = (elements: { key: string }[] | null) =>
    (elements || []).map((el) => {
      const def = getElement(el.key);
      return def
        ? { key: def.key, label: def.label, tier: def.tier, cost: def.cost }
        : { key: el.key, label: el.key, tier: 0, cost: 0 };
    });

  const rawA = scenes.find((s) => s.id === comparison.scene_a_id) || scenes[0];
  const rawB = scenes.find((s) => s.id === comparison.scene_b_id) || scenes[1];
  const sceneA = { ...rawA, elements: enrichElements(rawA.elements as { key: string }[] | null) };
  const sceneB = { ...rawB, elements: enrichElements(rawB.elements as { key: string }[] | null) };

  return NextResponse.json({ sceneA, sceneB });
}
