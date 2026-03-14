import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildFicheTournage, ROLE_KEYS } from "@/lib/module-filmer-data";
import type { RoleKey } from "@/lib/module-filmer-data";
import { withErrorHandler } from "@/lib/api-utils";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

// GET — Fetch existing fiches de tournage
export const GET = withErrorHandler(async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const admin = createAdminClient();

  const { data: fiches, error } = await admin
    .from("module7_fiches_tournage")
    .select("role_key, content, generated_at")
    .eq("session_id", sessionId)
    .order("generated_at");

  if (error) {
    console.error("[fiches-tournage GET]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({
    fiches: (fiches || []).map((f) => ({
      roleKey: f.role_key,
      content: f.content,
      generatedAt: f.generated_at,
    })),
  });
});

// POST — Generate 6 fiches from M6 scenes + M7 storyboard + M6 scenario
export const POST = withErrorHandler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "fiches-tournage", { max: 10, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const admin = createAdminClient();

  // Verify session
  const { data: session, error: sessionError } = await admin
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // Fetch M6 scenes
  const { data: scenes } = await admin
    .from("module6_scenes")
    .select("id, scene_number, title, description, act, content")
    .eq("session_id", sessionId)
    .order("scene_number");

  if (!scenes || scenes.length === 0) {
    return NextResponse.json({ error: "Aucune scène M6 trouvée" }, { status: 400 });
  }

  // Fetch M7 storyboard
  const { data: storyboard } = await admin
    .from("module7_storyboard")
    .select("scenes")
    .eq("session_id", sessionId)
    .single();

  // Fetch M6 scenario
  const { data: scenario } = await admin
    .from("module6_scenario")
    .select("full_text")
    .eq("session_id", sessionId)
    .single();

  const sceneInputs = scenes.map((s) => ({
    title: s.title,
    description: s.description,
    act: s.act,
    content: s.content || "",
    sceneNumber: s.scene_number,
  }));

  const storyboardScenes = (storyboard?.scenes as { sceneId: string; title: string; plans: { position: number; planType: string; description: string; intention?: string; imageUrl?: string }[] }[]) || [];

  const scenarioInput = scenario ? { fullText: scenario.full_text } : null;

  // Build all 6 fiches
  const fichesToUpsert = ROLE_KEYS.map((role: RoleKey) => ({
    session_id: sessionId,
    role_key: role,
    content: buildFicheTournage(role, sceneInputs, storyboardScenes, scenarioInput),
    generated_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await admin
    .from("module7_fiches_tournage")
    .upsert(fichesToUpsert, { onConflict: "session_id,role_key" });

  if (upsertError) {
    console.error("[fiches-tournage POST]", upsertError.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    count: fichesToUpsert.length,
    fiches: fichesToUpsert.map((f) => ({
      roleKey: f.role_key,
      content: f.content,
    })),
  });
});
