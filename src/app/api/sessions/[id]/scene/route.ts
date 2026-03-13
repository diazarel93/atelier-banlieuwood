import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import {
  isValidEmotion,
  isValidElement,
  getElement,
  EMOTIONS,
  MAX_SLOTS,
  MAX_TOKENS,
} from "@/lib/module5-data";
import { safeJson } from "@/lib/api-utils";

// AI feedback prompt
const SCENE_FEEDBACK_SYSTEM = `Tu es un mentor cinéma bienveillant pour adolescents. Un élève vient de construire une scène.
Règles STRICTES :
- JAMAIS punitif, TOUJOURS encourageant
- Analyse l'intention, l'obstacle et le changement : sont-ils clairs ? cohérents ?
- Commente l'équilibre des éléments choisis (trop d'action ? pas assez de tension ?)
- Maximum 3 forces et 2 suggestions
- Réponds UNIQUEMENT en JSON : {"strengths":["..."],"suggestions":["..."],"summary":"..."}
- Les "strengths" valorisent ce qui est bien fait
- Les "suggestions" sont des pistes, jamais des ordres
- Le "summary" est une phrase d'encouragement personnalisée (max 30 mots)`;

function buildSceneFeedbackPrompt(scene: {
  emotion: string;
  intention: string;
  obstacle: string;
  changement: string;
  elements: { key: string; label: string }[];
}): string {
  const emotionLabel = EMOTIONS.find((e) => e.key === scene.emotion)?.label || scene.emotion;
  const elementLabels = scene.elements.map((e) => e.label).join(", ");
  return `Émotion choisie : ${emotionLabel}
Intention du personnage : "${scene.intention}"
Obstacle : "${scene.obstacle}"
Changement à la fin : "${scene.changement}"
Éléments de scène utilisés : ${elementLabels || "aucun"}

Donne ton feedback en JSON.`;
}

// POST — student submits scene (Module 2 séance 2)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "scene", { max: 10, windowSec: 60 });
  if (rl) {
    return NextResponse.json({ error: rl.error }, { status: 429 });
  }

  const { id: sessionId } = await params;
  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const { studentId, emotion, intention, obstacle, changement, elements } = parsed.data;

  if (!studentId || !emotion || !intention || !obstacle || !changement) {
    return NextResponse.json(
      { error: "Tous les champs sont requis" },
      { status: 400 }
    );
  }

  // Validate emotion
  if (!isValidEmotion(emotion)) {
    return NextResponse.json({ error: "Émotion invalide" }, { status: 400 });
  }

  // Validate narrative fields
  if (intention.trim().length < 5 || obstacle.trim().length < 5 || changement.trim().length < 5) {
    return NextResponse.json(
      { error: "Chaque champ narratif doit avoir au moins 5 caractères" },
      { status: 400 }
    );
  }

  // Validate elements
  const elArray = Array.isArray(elements) ? elements : [];
  let totalTokens = 0;
  let totalSlots = 0;

  for (const el of elArray) {
    if (!isValidElement(el.key)) {
      return NextResponse.json({ error: `Élément invalide : ${el.key}` }, { status: 400 });
    }
    const def = getElement(el.key)!;
    totalTokens += def.cost;
    totalSlots += def.slots;
  }

  if (totalSlots > MAX_SLOTS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_SLOTS} emplacements (${totalSlots} utilisés)` },
      { status: 400 }
    );
  }

  if (totalTokens > MAX_TOKENS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_TOKENS} jetons (${totalTokens} utilisés)` },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Verify session is module 2, séance 2, responding
  const { data: session } = await admin
    .from("sessions")
    .select("status, current_module, current_seance, level")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (!session || session.current_module !== 2 || (session.current_seance || 1) !== 2) {
    return NextResponse.json(
      { error: "La construction de scène n'est pas disponible pour cette séance" },
      { status: 400 }
    );
  }

  if (session.status !== "responding") {
    return NextResponse.json(
      { error: "Les réponses ne sont pas ouvertes" },
      { status: 400 }
    );
  }

  // Verify student belongs to session
  const { data: student } = await admin
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("session_id", sessionId)
    .single();

  if (!student) {
    return NextResponse.json(
      { error: "Joueur introuvable dans cette partie" },
      { status: 404 }
    );
  }

  // Build clean elements array
  const cleanElements = elArray.map((el: { key: string }) => {
    const def = getElement(el.key)!;
    return { key: def.key, label: def.label, tier: def.tier, cost: def.cost };
  });

  // Insert scene
  const { data: scene, error } = await admin
    .from("module5_scenes")
    .upsert(
      {
        session_id: sessionId,
        student_id: studentId,
        emotion,
        intention: intention.trim(),
        obstacle: obstacle.trim(),
        changement: changement.trim(),
        elements: cleanElements,
        tokens_used: totalTokens,
        slots_used: totalSlots,
      },
      { onConflict: "session_id,student_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("[scene POST]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // AI feedback (non-blocking)
  let aiFeedback = null;
  try {
    const { generateAIText } = await import("@/lib/ai");
    const userPrompt = buildSceneFeedbackPrompt({
      emotion,
      intention: intention.trim(),
      obstacle: obstacle.trim(),
      changement: changement.trim(),
      elements: cleanElements,
    });

    const { text } = await generateAIText({
      systemPrompt: SCENE_FEEDBACK_SYSTEM,
      userPrompt,
      maxTokens: 500,
      timeout: 10_000,
      temperature: 0.6,
    });

    if (text) {
      const cleaned = text.replace(/^```json?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
      aiFeedback = JSON.parse(cleaned);

      // Save feedback to DB
      await admin
        .from("module5_scenes")
        .update({ ai_feedback: aiFeedback })
        .eq("id", scene.id);
    }
  } catch {
    // AI feedback is optional — scene is still saved
  }

  return NextResponse.json({
    ...scene,
    ai_feedback: aiFeedback || scene.ai_feedback,
  });
}

// GET — all scenes for session + stats
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("module5_scenes")
    .select("*, students(display_name, avatar)")
    .eq("session_id", sessionId)
    .order("submitted_at", { ascending: true });

  if (error) {
    console.error("[scene GET]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // Emotion distribution
  const emotionDistribution: Record<string, number> = {};
  for (const scene of data || []) {
    emotionDistribution[scene.emotion] = (emotionDistribution[scene.emotion] || 0) + 1;
  }

  return NextResponse.json({
    scenes: data || [],
    emotionDistribution,
    count: data?.length || 0,
  });
}
