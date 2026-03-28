import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { BUDGET_CATEGORIES, BUDGET_TOTAL, BUDGET_RESERVE_MIN, generateBudgetSummary } from "@/lib/constants";
import { safeJson, withErrorHandler } from "@/lib/api-utils";

const VALID_KEYS = BUDGET_CATEGORIES.map((c) => c.key);
const VALID_COSTS = new Map(BUDGET_CATEGORIES.map((c) => [c.key, new Set(c.options.map((o) => o.cost))]));

// POST — student submits budget allocation (Module 2)
export const POST = withErrorHandler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rl = checkRateLimit(getIP(req), "budget", { max: 10, windowSec: 60 });
  if (rl) {
    return NextResponse.json({ error: rl.error }, { status: 429 });
  }

  const { id: sessionId } = await params;
  const parsed = await safeJson<{ studentId: string; choices: Record<string, number> }>(req);
  if ("error" in parsed) return parsed.error;
  const { studentId, choices } = parsed.data;

  if (!studentId || !choices || typeof choices !== "object") {
    return NextResponse.json({ error: "studentId et choices requis" }, { status: 400 });
  }

  // Validate keys and costs
  for (const key of VALID_KEYS) {
    if (choices[key] == null) continue;
    const validCosts = VALID_COSTS.get(key);
    if (!validCosts || !validCosts.has(choices[key])) {
      return NextResponse.json({ error: `Choix invalide pour ${key}` }, { status: 400 });
    }
  }

  // Validate total + reserve
  const total = VALID_KEYS.reduce((sum, k) => sum + (choices[k] || 0), 0);
  const remaining = BUDGET_TOTAL - total;
  if (remaining < BUDGET_RESERVE_MIN) {
    return NextResponse.json(
      { error: `Réserve minimum de ${BUDGET_RESERVE_MIN} crédits non respectée` },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Verify session is on budget séance and accepting responses
  const { data: session } = await admin
    .from("sessions")
    .select("status, current_module, current_seance")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (!session || session.current_module !== 9 || (session.current_seance || 1) !== 2) {
    return NextResponse.json({ error: "Le budget n'est pas disponible pour cette séance" }, { status: 400 });
  }

  if (session.status !== "responding") {
    return NextResponse.json({ error: "Les réponses ne sont pas ouvertes" }, { status: 400 });
  }

  // Verify student belongs to session
  const { data: student } = await admin
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("session_id", sessionId)
    .single();

  if (!student) {
    return NextResponse.json({ error: "Joueur introuvable dans cette partie" }, { status: 404 });
  }

  // Build clean choices object (only valid keys)
  const cleanChoices: Record<string, number> = {};
  for (const key of VALID_KEYS) {
    cleanChoices[key] = choices[key] ?? 0;
  }

  const summary = generateBudgetSummary(cleanChoices);

  const { data, error } = await admin
    .from("module2_budgets")
    .upsert(
      {
        session_id: sessionId,
        student_id: studentId,
        choices: cleanChoices,
        credits_remaining: remaining,
        summary,
      },
      { onConflict: "session_id,student_id" },
    )
    .select()
    .single();

  if (error) {
    console.error("[budget POST]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json(data);
});

// GET — all budgets for a session (facilitator) + optional story context
export const GET = withErrorHandler(async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const wantContext = req.nextUrl.searchParams.get("context") === "true";

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("module2_budgets")
    .select("*, students(display_name, avatar)")
    .eq("session_id", sessionId)
    .order("submitted_at", { ascending: true });

  if (error) {
    console.error("[budget GET]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // Compute class averages per category
  const averages: Record<string, number> = {};

  if (data && data.length > 0) {
    for (const cat of VALID_KEYS) {
      const values = data.map((b) => (b.choices as Record<string, number>)?.[cat] || 0);
      averages[cat] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    }
  }

  // Optionally fetch story context from collective_choices (Module 3)
  let storyContext: Record<string, string> | undefined;
  if (wantContext) {
    const { data: choices } = await admin
      .from("collective_choices")
      .select("category, chosen_text")
      .eq("session_id", sessionId);

    if (choices && choices.length > 0) {
      storyContext = {};
      // Pick the first choice per category
      for (const c of choices) {
        if (c.category && c.chosen_text && !storyContext[c.category]) {
          storyContext[c.category] = c.chosen_text;
        }
      }
    }
  }

  return NextResponse.json({
    budgets: data || [],
    averages,
    count: data?.length || 0,
    ...(storyContext ? { storyContext } : {}),
  });
});
