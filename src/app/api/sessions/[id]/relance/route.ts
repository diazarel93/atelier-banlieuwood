import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { isValidUUID, safeJson } from "@/lib/api-utils";
import { generateRelance } from "@/lib/ai";

// POST — Generate an AI relance for a student's response
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "relance", { max: 10, windowSec: 60 });
  if (rl) {
    return NextResponse.json({ error: rl.error }, { status: 429 });
  }

  const { id: sessionId } = await params;
  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const { studentId, responseId } = parsed.data;

  if (!studentId || !responseId) {
    return NextResponse.json(
      { error: "studentId et responseId requis" },
      { status: 400 }
    );
  }
  if (!isValidUUID(studentId) || !isValidUUID(responseId)) {
    return NextResponse.json(
      { error: "studentId ou responseId invalide" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Fetch the response + its situation prompt
  const { data: response, error: respErr } = await admin
    .from("responses")
    .select("id, text, situation_id, student_id, session_id")
    .eq("id", responseId)
    .eq("session_id", sessionId)
    .eq("student_id", studentId)
    .single();

  if (respErr || !response) {
    return NextResponse.json(
      { error: "Réponse introuvable" },
      { status: 404 }
    );
  }

  // Fetch the situation (for the original prompt + nudge fallback)
  const { data: situation } = await admin
    .from("situations")
    .select("prompt, nudge_text")
    .eq("id", response.situation_id)
    .single();

  if (!situation) {
    return NextResponse.json(
      { error: "Situation introuvable" },
      { status: 404 }
    );
  }

  // Fetch session level
  const { data: session } = await admin
    .from("sessions")
    .select("level")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  // Fetch previous answers for narrative context (max 5)
  const { data: previousResponses } = await admin
    .from("responses")
    .select("text")
    .eq("session_id", sessionId)
    .eq("student_id", studentId)
    .neq("id", responseId)
    .order("submitted_at", { ascending: true })
    .limit(5);

  const previousAnswers = previousResponses?.map((r) => r.text) || [];

  // Generate relance
  const relanceText = await generateRelance({
    question: situation.prompt,
    studentAnswer: response.text,
    level: session?.level || "college",
    previousAnswers,
    staticFallback: situation.nudge_text,
  });

  // Store in DB for traceability
  await admin
    .from("responses")
    .update({ relance_text: relanceText })
    .eq("id", responseId);

  return NextResponse.json({ relanceText });
}

// PATCH — Store student's response to the relance
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "relance-patch", {
    max: 20,
    windowSec: 60,
  });
  if (rl) {
    return NextResponse.json({ error: rl.error }, { status: 429 });
  }

  const { id: sessionId } = await params;
  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const { responseId, relanceResponse } = parsed.data;

  if (!responseId || !relanceResponse?.trim()) {
    return NextResponse.json(
      { error: "responseId et relanceResponse requis" },
      { status: 400 }
    );
  }
  if (!isValidUUID(responseId)) {
    return NextResponse.json(
      { error: "responseId invalide" },
      { status: 400 }
    );
  }

  const cleanText = relanceResponse.trim().slice(0, 500);
  const admin = createAdminClient();

  const { error } = await admin
    .from("responses")
    .update({ relance_response: cleanText })
    .eq("id", responseId)
    .eq("session_id", sessionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
