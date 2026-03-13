import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSceneStoryboardUrl } from "@/lib/pollinations";

// POST — Facilitator assembles storyboard from student decoupages
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const admin = createAdminClient();

  // Verify session exists
  const { data: session, error: sessionError } = await admin
    .from("sessions")
    .select("id, current_module")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // Fetch M6 scenes (ordered by tension: confrontation > resolution > setup)
  const { data: scenes } = await admin
    .from("module6_scenes")
    .select("id, scene_number, title, description, act")
    .eq("session_id", sessionId)
    .order("scene_number");

  if (!scenes || scenes.length === 0) {
    return NextResponse.json({ error: "Aucune scène M6 trouvée" }, { status: 400 });
  }

  // Select top 3 scenes by narrative tension
  const ACT_PRIORITY: Record<string, number> = { confrontation: 3, resolution: 2, setup: 1 };
  const keyScenes = [...scenes]
    .sort((a, b) => (ACT_PRIORITY[b.act] || 0) - (ACT_PRIORITY[a.act] || 0))
    .slice(0, 3);

  // Fetch all student decoupages
  const { data: decoupages } = await admin
    .from("module7_decoupages")
    .select("scene_id, student_id, plans")
    .eq("session_id", sessionId);

  // Aggregate: for each scene, find most-voted planType per position
  const assembledScenes = keyScenes.map((scene) => {
    const sceneDecoupages = (decoupages || []).filter((d) => d.scene_id === scene.id);
    const plans = sceneDecoupages[0]?.plans as { position: number; planType: string; description: string; intention: string }[] | undefined;
    const positionCount = plans?.length || 3;

    const assembledPlans = [];
    for (let pos = 1; pos <= positionCount; pos++) {
      // Collect all student plans at this position
      const plansAtPos = sceneDecoupages
        .map((d) => {
          const studentPlans = d.plans as { position: number; planType: string; description: string; intention: string }[];
          return studentPlans?.find((p) => p.position === pos);
        })
        .filter(Boolean) as { position: number; planType: string; description: string; intention: string }[];

      if (plansAtPos.length === 0) continue;

      // Most voted planType
      const typeCounts: Record<string, number> = {};
      for (const p of plansAtPos) {
        if (p.planType) typeCounts[p.planType] = (typeCounts[p.planType] || 0) + 1;
      }
      const winnerType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "plan-moyen";

      // Pick description from the first student who chose the winning type
      const winnerPlan = plansAtPos.find((p) => p.planType === winnerType) || plansAtPos[0];

      // Generate Pollinations image URL
      const imageUrl = generateSceneStoryboardUrl({
        sceneTitle: scene.title,
        sceneDescription: scene.description,
        planType: winnerType,
        planDescription: winnerPlan.description || scene.description,
      });

      assembledPlans.push({
        position: pos,
        planType: winnerType,
        description: winnerPlan.description || "",
        intention: winnerPlan.intention || "",
        imageUrl,
      });
    }

    return {
      sceneId: scene.id,
      title: scene.title,
      plans: assembledPlans,
    };
  });

  // Upsert into module7_storyboard
  const { error: upsertError } = await admin
    .from("module7_storyboard")
    .upsert(
      {
        session_id: sessionId,
        scenes: assembledScenes,
        validated: false,
        validated_at: null,
      },
      { onConflict: "session_id" }
    );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, scenes: assembledScenes });
}

// PATCH — Validate storyboard
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const admin = createAdminClient();

  const { error } = await admin
    .from("module7_storyboard")
    .update({ validated: true, validated_at: new Date().toISOString() })
    .eq("session_id", sessionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, validated: true });
}
