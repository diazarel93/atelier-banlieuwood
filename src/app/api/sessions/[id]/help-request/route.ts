import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { safeJson } from "@/lib/api-utils";
import { isValidHelpType, isValidHelpStep, MAX_HELP_PER_STEP } from "@/lib/module10-data";

const HELP_SYSTEM_PROMPT = `Tu es un mentor cinéma bienveillant pour adolescents (10-18 ans).
Un élève demande de l'aide pour écrire une idée de film.
Règles STRICTES :
- JAMAIS punitif, TOUJOURS encourageant
- Réponds en 2-3 phrases maximum
- Adapte ton vocabulaire à l'âge de l'élève
- Sois concret et inspirant`;

function buildHelpPrompt(helpType: string, step: string, context?: string): string {
  if (step === "etsi") {
    switch (helpType) {
      case "example":
        return `Donne un exemple court de "Et si..." pour inspirer l'élève. Contexte : ${context || "image libre"}. Commence par "Et si..."`;
      case "reformulate":
        return `L'élève a écrit : "${context || ""}". Aide-le à reformuler son idée "Et si..." pour la rendre plus claire et intéressante.`;
      case "starter":
        return `Donne une amorce de phrase "Et si..." que l'élève pourra compléter. Contexte : ${context || "image libre"}. Juste le début de la phrase.`;
      default:
        return "Aide l'élève à trouver une idée de film.";
    }
  }

  // pitch step
  switch (helpType) {
    case "example":
      return `Donne un exemple court de pitch de film en 3 phrases (personnage + objectif + obstacle). ${context ? `Le personnage s'appelle ${context}.` : ""}`;
    case "reformulate":
      return `L'élève a écrit ce pitch : "${context || ""}". Aide-le à le reformuler pour qu'il soit plus clair et accrocheur.`;
    case "starter":
      return `Donne une amorce de pitch que l'élève pourra compléter. ${context ? `Son personnage s'appelle ${context}.` : ""} Juste le début.`;
    default:
      return "Aide l'élève à construire son pitch.";
  }
}

// POST — log help request + return AI hint
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "help-request", { max: 10, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const { studentId, step, helpType, context } = parsed.data;

  if (!studentId || !step || !helpType) {
    return NextResponse.json(
      { error: "studentId, step et helpType requis" },
      { status: 400 }
    );
  }

  if (!isValidHelpStep(step)) {
    return NextResponse.json({ error: "Step invalide" }, { status: 400 });
  }

  if (!isValidHelpType(helpType)) {
    return NextResponse.json({ error: "Type d'aide invalide" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Adrian: "L'aide ne doit pas être automatique. Elle doit être activée par l'intervenant."
  const { data: session } = await admin
    .from("sessions")
    .select("help_enabled")
    .eq("id", sessionId)
    .single();

  if (!session?.help_enabled) {
    return NextResponse.json(
      { error: "L'aide n'est pas encore activée par l'intervenant" },
      { status: 403 }
    );
  }

  // Check help limit
  const { count } = await admin
    .from("module10_help_requests")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("student_id", studentId)
    .eq("step", step);

  if ((count || 0) >= MAX_HELP_PER_STEP) {
    return NextResponse.json(
      { error: `Maximum ${MAX_HELP_PER_STEP} aides par étape` },
      { status: 400 }
    );
  }

  // Log help request
  await admin
    .from("module10_help_requests")
    .insert({
      session_id: sessionId,
      student_id: studentId,
      step,
      help_type: helpType,
    });

  // Generate AI hint
  let hint = "";
  try {
    const { generateAIText } = await import("@/lib/ai");
    const { text } = await generateAIText({
      systemPrompt: HELP_SYSTEM_PROMPT,
      userPrompt: buildHelpPrompt(helpType, step, context),
      maxTokens: 200,
      timeout: 8_000,
      temperature: 0.7,
    });
    hint = text || "";
  } catch {
    // Fallback hints
    if (step === "etsi") {
      hint = helpType === "example"
        ? "Et si un ado découvrait que son meilleur ami cache un secret depuis des années ?"
        : helpType === "starter"
        ? "Et si un jour, en ouvrant la porte de..."
        : "Essaie de rendre ton idée plus surprenante. Qu'est-ce qui rendrait cette situation unique ?";
    } else {
      hint = helpType === "example"
        ? "Léa, 16 ans, veut prouver l'innocence de son frère accusé à tort. Mais le seul témoin refuse de parler."
        : helpType === "starter"
        ? "C'est l'histoire de... qui veut... mais..."
        : "Essaie de résumer en une phrase : qui est ton personnage, que veut-il, qu'est-ce qui l'en empêche ?";
    }
  }

  const remaining = MAX_HELP_PER_STEP - (count || 0) - 1;

  return NextResponse.json({ hint, remaining });
}
