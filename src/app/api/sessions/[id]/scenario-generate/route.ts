import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator } from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateScenesPrompt, assignMissions } from "@/lib/module-scenario-data";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { log } from "@/lib/logger";

// POST — Facilitateur generates scenes from M12 winners via AI (facilitator only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "scenario-generate", { max: 5, windowSec: 60 });
  if (rl) {
    return NextResponse.json({ error: rl.error }, { status: 429 });
  }

  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();

  // Verify session exists
  const { data: session, error: sessionError } = await admin
    .from("sessions")
    .select("id, level")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // 1. Fetch M12 winners
  const { data: winnersData } = await admin
    .from("module12_winners")
    .select("manche, winning_text")
    .eq("session_id", sessionId)
    .order("manche");

  const winners: Record<number, string> = {};
  for (const w of winnersData || []) {
    winners[w.manche] = w.winning_text;
  }

  if (Object.keys(winners).length === 0) {
    return NextResponse.json(
      { error: "Aucun choix collectif M12 trouvé. Lancez d'abord le module Construction Collective." },
      { status: 400 }
    );
  }

  // 2. Fetch active students with creative profile
  const { data: students } = await admin
    .from("students")
    .select("id, creative_profile")
    .eq("session_id", sessionId)
    .eq("is_active", true);

  if (!students || students.length === 0) {
    return NextResponse.json({ error: "Aucun élève actif" }, { status: 400 });
  }

  // 3. Call AI to generate scenes
  const prompt = generateScenesPrompt(winners, session.level || "college");

  let scenes: { sceneNumber: number; title: string; description: string; act: string }[] = [];

  try {
    const { generateAIText } = await import("@/lib/ai");
    const { text } = await generateAIText({
      systemPrompt: "Tu es un assistant scénariste. Réponds uniquement en JSON valide.",
      userPrompt: prompt,
      maxTokens: 2000,
      timeout: 30_000,
      temperature: 0.7,
    });

    // Parse JSON from AI response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      scenes = parsed.scenes || [];
    }
  } catch (err) {
    log.error("AI scene generation failed, using fallback", { route: "/api/sessions/[id]/scenario-generate", error: String(err) });
  }

  // Fallback: generate basic scenes if AI failed
  if (scenes.length === 0) {
    scenes = [
      { sceneNumber: 1, title: "Le début", description: `${winners[2] || "Le quotidien du héros"} — le monde normal avant que tout change.`, act: "setup" },
      { sceneNumber: 2, title: "L'incident", description: `${winners[4] || "Un événement"} vient bouleverser la routine.`, act: "setup" },
      { sceneNumber: 3, title: "La quête", description: `${winners[3] || "Le héros"} doit surmonter ${winners[5] || "un obstacle"}.`, act: "confrontation" },
      { sceneNumber: 4, title: "Le climax", description: `Le moment de vérité : tout se joue maintenant.`, act: "confrontation" },
      { sceneNumber: 5, title: "Le dénouement", description: `Comment l'histoire se termine et ce qui a changé.`, act: "resolution" },
    ];
  }

  // 4. Insert scenes
  const insertedScenes: { id: string; sceneNumber: number; title: string }[] = [];
  for (const scene of scenes) {
    const { data: inserted, error } = await admin
      .from("module6_scenes")
      .upsert({
        session_id: sessionId,
        scene_number: scene.sceneNumber,
        title: scene.title,
        description: scene.description,
        act: scene.act,
        status: "incomplete",
      }, { onConflict: "session_id,scene_number" })
      .select("id, scene_number, title")
      .single();

    if (!error && inserted) {
      insertedScenes.push({ id: inserted.id, sceneNumber: inserted.scene_number, title: inserted.title });
    }
  }

  // 5. Assign missions (pass creative profile if available)
  const missions = assignMissions(
    students.map((s: { id: string; creative_profile?: string }) => ({
      id: s.id,
      creativeProfile: s.creative_profile || undefined,
    })),
    insertedScenes
  );

  // 6. Insert missions (with scribe flag)
  for (const mission of missions) {
    await admin.from("module6_missions").upsert(
      {
        session_id: sessionId,
        scene_id: mission.sceneId,
        student_id: mission.studentId,
        role: mission.role,
        task: mission.task,
        is_scribe: mission.isScribe,
        status: "pending",
      },
      { onConflict: "session_id,student_id,scene_id" }
    );
  }

  // 7. Create empty scenario entry
  await admin.from("module6_scenario").upsert(
    { session_id: sessionId, full_text: "", validated: false },
    { onConflict: "session_id" }
  );

  return NextResponse.json({
    success: true,
    scenesCount: insertedScenes.length,
    missionsCount: missions.length,
    scenes: insertedScenes,
  });
}
