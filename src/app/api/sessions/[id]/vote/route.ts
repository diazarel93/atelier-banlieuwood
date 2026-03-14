import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { safeJson } from "@/lib/api-utils";
import { voteSchema, formatZodError } from "@/lib/schemas";
import { logSessionEvent } from "@/lib/event-logger";
import * as Sentry from "@sentry/nextjs";
import { verifyStudentToken } from "@/lib/student-token";

// POST — student submits a vote
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "vote", { max: 20, windowSec: 60 });
  if (rl) {
    return NextResponse.json({ error: rl.error }, { status: 429 });
  }

  const { id: sessionId } = await params;
  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;

  const validated = voteSchema.safeParse(parsed.data);
  if (!validated.success) {
    return NextResponse.json(
      { error: formatZodError(validated.error) },
      { status: 400 }
    );
  }

  // Prefer token-based auth over body studentId
  let { studentId } = validated.data;
  const { situationId, chosenResponseId } = validated.data;

  const tokenCookie = req.cookies.get("bw-student-token")?.value;
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const rawToken = tokenCookie || bearerToken;
  if (rawToken) {
    const verified = verifyStudentToken(rawToken);
    if (verified && verified.sessionId === sessionId) {
      studentId = verified.studentId;
    }
  }

  const admin = createAdminClient();

  // Check session status
  const { data: session } = await admin
    .from("sessions")
    .select("status, current_module, current_seance, current_situation_index")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (!session || session.status !== "voting") {
    return NextResponse.json(
      { error: "Le vote n'est pas ouvert" },
      { status: 400 }
    );
  }

  // Verify student belongs to this session
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

  // Race condition guard: verify situation matches current session state
  const { data: voteSituation } = await admin
    .from("situations")
    .select("position, module, seance")
    .eq("id", situationId)
    .single();

  if (!voteSituation) {
    return NextResponse.json(
      { error: "Situation introuvable", code: "SITUATION_NOT_FOUND" },
      { status: 400 }
    );
  }

  const isStale =
    voteSituation.module !== session.current_module ||
    voteSituation.seance !== session.current_seance ||
    voteSituation.position !== session.current_situation_index;

  if (isStale) {
    return NextResponse.json(
      { error: "La session a deja avance a une nouvelle question", code: "SITUATION_ADVANCED" },
      { status: 409 }
    );
  }

  // Verify chosen response is a valid vote option (not hidden, is_vote_option = true)
  const { data: response } = await admin
    .from("responses")
    .select("id")
    .eq("id", chosenResponseId)
    .eq("session_id", sessionId)
    .eq("situation_id", situationId)
    .eq("is_vote_option", true)
    .eq("is_hidden", false)
    .single();

  if (!response) {
    return NextResponse.json(
      { error: "Option de vote invalide" },
      { status: 400 }
    );
  }

  // Upsert vote (student can change their vote)
  const { data, error } = await admin
    .from("votes")
    .upsert(
      {
        session_id: sessionId,
        student_id: studentId,
        situation_id: situationId,
        chosen_response_id: chosenResponseId,
      },
      { onConflict: "session_id,student_id,situation_id" }
    )
    .select()
    .single();

  if (error) {
    Sentry.captureException(error);
    console.error("[vote]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // Log vote event (fire-and-forget)
  logSessionEvent({
    sessionId,
    eventType: "vote_cast",
    studentId,
    situationId,
    payload: { chosenResponseId },
  });

  return NextResponse.json(data);
}
