import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { safeJson, withErrorHandler } from "@/lib/api-utils";

const MAX_USES_PER_SESSION = 5;

const CREATIVE_PROMPTS: Record<string, { system: string; build: (input: string, ctx?: string) => string }> = {
  dialogue: {
    system: `Tu es un mentor cinéma bienveillant pour adolescents.
Un élève te demande de l'aider à écrire un dialogue de film.
Règles :
- Écris un dialogue court (4-8 répliques) entre les personnages décrits
- Format scénario : PRÉNOM en majuscules, puis le texte
- Le dialogue doit être naturel, vivant, avec du sous-texte
- Ajoute une courte didascalie entre parenthèses si nécessaire
- Ne fais PAS plus de 150 mots
- Sois concret et inspirant`,
    build: (input, ctx) =>
      `L'élève décrit cette situation : "${input}"${ctx ? `\nContexte de son film : ${ctx}` : ""}\n\nÉcris un court dialogue de scénario pour cette scène.`,
  },
  scene: {
    system: `Tu es un mentor cinéma bienveillant pour adolescents.
Un élève te demande de l'aider à décrire une scène.
Règles :
- Écris une description de scène au format scénario (INT./EXT., lieu, moment)
- Inclus des indications visuelles (lumière, cadrage, mouvement)
- 3-5 phrases maximum
- Vocabulaire cinématographique accessible
- Ne fais PAS plus de 120 mots`,
    build: (input, ctx) =>
      `L'élève veut mettre en scène : "${input}"${ctx ? `\nContexte de son film : ${ctx}` : ""}\n\nÉcris une courte description de scène au format scénario.`,
  },
  critique: {
    system: `Tu es un mentor cinéma bienveillant pour adolescents.
Un élève partage son idée de film pour avoir un retour.
Règles :
- TOUJOURS commencer par ce qui fonctionne bien (1-2 points forts)
- Puis suggérer 1-2 pistes d'amélioration sous forme de questions
- Terminer par un encouragement
- JAMAIS punitif, TOUJOURS constructif
- Ne fais PAS plus de 100 mots`,
    build: (input, ctx) =>
      `L'élève partage cette idée : "${input}"${ctx ? `\nContexte de son film : ${ctx}` : ""}\n\nDonne un retour constructif et bienveillant.`,
  },
};

export const POST = withErrorHandler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rl = checkRateLimit(getIP(req), "creative", { max: 15, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const { studentId, mode, input, context } = parsed.data;

  if (!studentId || !mode || !input) {
    return NextResponse.json({ error: "studentId, mode et input requis" }, { status: 400 });
  }

  if (!CREATIVE_PROMPTS[mode]) {
    return NextResponse.json({ error: "Mode invalide" }, { status: 400 });
  }

  if (typeof input !== "string" || input.length > 500) {
    return NextResponse.json({ error: "Input trop long (max 500 car.)" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Check usage limit — use responses table as proxy (count creative uses)
  const { count } = await admin
    .from("responses")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("student_id", studentId)
    .like("text", "creative:%");

  const used = count || 0;
  if (used >= MAX_USES_PER_SESSION) {
    return NextResponse.json(
      { error: `Maximum ${MAX_USES_PER_SESSION} utilisations par session`, remaining: 0 },
      { status: 400 },
    );
  }

  // Generate AI response
  const promptConfig = CREATIVE_PROMPTS[mode];
  let text = "";

  try {
    const { generateAIText } = await import("@/lib/ai");
    const result = await generateAIText({
      systemPrompt: promptConfig.system,
      userPrompt: promptConfig.build(input, context),
      maxTokens: 300,
      timeout: 12_000,
      temperature: 0.8,
    });
    text = result.text || "";
  } catch {
    // Fallback responses
    if (mode === "dialogue") {
      text =
        "Le mentor est occupé, mais voici un conseil : commence par définir ce que chaque personnage veut dans cette scène. Un bon dialogue naît du conflit entre deux désirs opposés !";
    } else if (mode === "scene") {
      text =
        "Le mentor est occupé, mais voici un conseil : ferme les yeux et imagine la scène. Que vois-tu en premier ? Commence par ça. Décris le lieu, la lumière, puis le mouvement.";
    } else {
      text =
        "Le mentor est occupé, mais ton idée a du potentiel ! Demande-toi : qu'est-ce qui rend ton personnage unique ? Quel est l'obstacle le plus inattendu qu'il pourrait rencontrer ?";
    }
  }

  // Log usage (store as creative:{mode} in responses for tracking)
  await admin
    .from("responses")
    .insert({
      session_id: sessionId,
      student_id: studentId,
      situation_id: `creative-${mode}`,
      text: `creative:${mode}:${input.slice(0, 100)}`,
    })
    .then(
      () => {},
      () => {},
    );

  const remaining = MAX_USES_PER_SESSION - used - 1;

  return NextResponse.json({ text, remaining });
});
