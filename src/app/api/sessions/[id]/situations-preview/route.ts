import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUUID } from "@/lib/api-utils";

/**
 * GET /api/sessions/[id]/situations-preview
 * Returns ALL situations for a given module/seance (or the session's current one).
 * Accepts optional ?module=X&seance=Y query params to preview any module.
 * Used by the pilot cockpit + briefing to let teachers preview questions.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  if (!isValidUUID(sessionId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: session } = await admin
    .from("sessions")
    .select("current_module, current_seance, level")
    .eq("id", sessionId)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // Allow overriding module/seance via query params (for briefing preview)
  const url = new URL(req.url);
  const moduleParam = url.searchParams.get("module");
  const seanceParam = url.searchParams.get("seance");
  const targetModule = moduleParam ? parseInt(moduleParam, 10) : session.current_module;
  const targetSeance = seanceParam ? parseInt(seanceParam, 10) : session.current_seance;

  const { data: situations } = await admin
    .from("situations")
    .select("id, position, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text")
    .eq("module", targetModule)
    .eq("seance", targetSeance)
    .order("position", { ascending: true });

  const levelMap: Record<string, string> = {
    primaire: "prompt_6_9",
    college: "prompt_10_13",
    lycee: "prompt_14_18",
  };
  const promptField = levelMap[session.level] || "prompt_10_13";

  const items = (situations || []).map((sit: Record<string, unknown>) => ({
    position: sit.position as number,
    category: sit.category as string,
    restitutionLabel: sit.restitution_label as string,
    prompt: sit[promptField] as string,
    nudgeText: sit.nudge_text as string | null,
  }));

  // Deduplicate by position (variants → pick first)
  const byPosition = new Map<number, typeof items[number]>();
  for (const item of items) {
    if (!byPosition.has(item.position)) {
      byPosition.set(item.position, item);
    }
  }

  return NextResponse.json({
    situations: Array.from(byPosition.values()),
  });
}
