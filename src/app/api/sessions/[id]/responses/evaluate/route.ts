import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator, isValidUUID } from "@/lib/api-utils";
import { generateAIText } from "@/lib/ai";

/**
 * POST /api/sessions/{id}/responses/evaluate
 * AI-evaluate one or more responses for quality.
 * Body: { responseIds: string[] } — max 20 at a time
 * Returns: { results: { responseId, ai_score, ai_feedback }[] }
 */

const EVAL_SYSTEM_PROMPT = `Tu es un évaluateur pédagogique pour un atelier d'écriture cinématographique avec des collégiens/lycéens.

Tu évalues la QUALITÉ d'une réponse d'élève sur une échelle de 1 à 5 :
1 = Hors-sujet ou vide de sens
2 = Basique, peu développé, cliché
3 = Correct, montre une réflexion
4 = Bien développé, créatif, personnel
5 = Excellent, original, mature, profond

Critères :
- Pertinence : la réponse répond-elle à la question ?
- Créativité : l'idée est-elle originale ou cliché ?
- Profondeur : y a-t-il un vrai effort de réflexion ?
- Cohérence narrative : l'idée s'intègre-t-elle dans une histoire ?

Réponds UNIQUEMENT en JSON strict, sans code fences :
{"score": <1-5>, "feedback": "<1 phrase courte justifiant la note>"}`;

function buildEvalUserPrompt(
  question: string,
  answer: string,
  level: string
): string {
  return `Niveau: ${level}
Question posée: "${question}"
Réponse de l'élève: "${answer}"

Évalue cette réponse.`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { responseIds } = body;

  if (!Array.isArray(responseIds) || responseIds.length === 0) {
    return NextResponse.json({ error: "responseIds requis (tableau)" }, { status: 400 });
  }
  if (responseIds.length > 20) {
    return NextResponse.json({ error: "Max 20 réponses à la fois" }, { status: 400 });
  }
  if (!responseIds.every(isValidUUID)) {
    return NextResponse.json({ error: "responseIds invalides" }, { status: 400 });
  }

  // Fetch session info (level)
  const { data: session } = await auth.supabase
    .from("sessions")
    .select("level")
    .eq("id", sessionId)
    .single();

  const level = session?.level || "college";

  // Fetch responses with their situation text
  const { data: responses, error } = await auth.supabase
    .from("responses")
    .select("id, text, situation_id, situations(prompt)")
    .eq("session_id", sessionId)
    .in("id", responseIds);

  if (error || !responses) {
    return NextResponse.json({ error: "Erreur chargement réponses" }, { status: 500 });
  }

  // Evaluate each response via AI (in parallel, batched by 5)
  const results: { responseId: string; ai_score: number; ai_feedback: string }[] = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < responses.length; i += BATCH_SIZE) {
    const batch = responses.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (resp) => {
        const question = (resp.situations as unknown as { prompt: string } | null)?.prompt || "Question inconnue";
        const userPrompt = buildEvalUserPrompt(question, resp.text, level);

        const { text: aiResponse } = await generateAIText({
          systemPrompt: EVAL_SYSTEM_PROMPT,
          userPrompt,
          maxTokens: 200,
          timeout: 15_000,
          temperature: 0.3,
        });

        let score = 3;
        let feedback = "Évaluation non disponible";

        if (aiResponse) {
          try {
            const cleaned = aiResponse.replace(/^```json?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
            const parsed = JSON.parse(cleaned);
            score = Math.max(1, Math.min(5, Math.round(parsed.score || 3)));
            feedback = String(parsed.feedback || "").slice(0, 200);
          } catch {
            // Parse failed — try to extract score from text
            const scoreMatch = aiResponse.match(/(\d)\s*\/\s*5/);
            if (scoreMatch) score = parseInt(scoreMatch[1], 10);
          }
        }

        // Save to DB
        await auth.supabase
          .from("responses")
          .update({ ai_score: score, ai_feedback: feedback })
          .eq("id", resp.id)
          .eq("session_id", sessionId);

        return { responseId: resp.id, ai_score: score, ai_feedback: feedback };
      })
    );
    results.push(...batchResults);
  }

  return NextResponse.json({ results });
}
