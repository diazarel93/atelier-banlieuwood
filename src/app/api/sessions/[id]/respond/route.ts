import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { safeJson, broadcastSessionUpdate, withErrorHandler } from "@/lib/api-utils";
import { respondSchema, formatZodError } from "@/lib/schemas";
import { getSeanceMax, MODULE_SEANCE_SITUATIONS } from "@/lib/constants";
import { logSessionEvent } from "@/lib/event-logger";
import * as Sentry from "@sentry/nextjs";
import { verifyStudentToken } from "@/lib/student-token";
// Module 1 uses real situation IDs from the situations table (module=1)

const MAX_RESPONSE_LENGTH = 500;
const MAX_NOTEBOOK_LENGTH = 2000;

// POST — student submits a response
export const POST = withErrorHandler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rl = checkRateLimit(getIP(req), "respond", { max: 20, windowSec: 60 });
  if (rl) {
    return NextResponse.json({ error: rl.error }, { status: 429 });
  }

  const { id: sessionId } = await params;
  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;

  const validated = respondSchema.safeParse(parsed.data);
  if (!validated.success) {
    return NextResponse.json({ error: formatZodError(validated.error) }, { status: 400 });
  }

  // Prefer token-based auth over body studentId
  let { studentId } = validated.data;
  const { situationId, text } = validated.data;

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

  // Fetch situation to check question_type and validate accordingly
  const { data: situationRow } = await admin
    .from("situations")
    .select("question_type, options")
    .eq("id", situationId)
    .single();

  const questionType = situationRow?.question_type || "open";
  let cleanText: string;

  if (questionType === "closed") {
    // For closed questions, text is the option key (a, b, c, d)
    cleanText = text.trim().toLowerCase();
    const validKeys = ((situationRow?.options || []) as { key: string }[]).map((o) => o.key);
    if (!validKeys.includes(cleanText)) {
      return NextResponse.json({ error: "Option invalide" }, { status: 400 });
    }
  } else {
    // Open or notebook questions (notebook allows longer text)
    const maxLen = questionType === "notebook" ? MAX_NOTEBOOK_LENGTH : MAX_RESPONSE_LENGTH;
    cleanText = text.trim().slice(0, maxLen);
    if (cleanText.length < 2) {
      return NextResponse.json({ error: "Réponse trop courte (2 caractères minimum)" }, { status: 400 });
    }
  }

  // Check session status + timer
  const { data: session } = await admin
    .from("sessions")
    .select("status, mode, current_module, current_seance, current_situation_index, timer_ends_at, question_opened_at")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (!session || session.status !== "responding") {
    return NextResponse.json({ error: "Les réponses ne sont pas ouvertes" }, { status: 400 });
  }

  // Race condition guard: verify the response's situation matches the current question.
  // If the session has already advanced past this situation, reject with 409.
  const { data: responseSituation } = await admin
    .from("situations")
    .select("position, module, seance")
    .eq("id", situationId)
    .single();

  if (responseSituation) {
    const sessionModule = session.current_module;
    const sessionSeance = session.current_seance;
    const sessionIdx = session.current_situation_index;

    const isStale =
      responseSituation.module !== sessionModule ||
      responseSituation.seance !== sessionSeance ||
      responseSituation.position !== sessionIdx;

    if (isStale) {
      return NextResponse.json(
        { error: "La session a déjà avancé à une nouvelle question", code: "SITUATION_ADVANCED" },
        { status: 409 },
      );
    }
  }

  // Reject responses after timer has expired (server-side enforcement)
  if (session.timer_ends_at && new Date(session.timer_ends_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Le temps est écoulé" }, { status: 400 });
  }

  // Verify student belongs to this session
  const { data: student } = await admin
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("session_id", sessionId)
    .single();

  if (!student) {
    return NextResponse.json({ error: "Joueur introuvable dans cette partie" }, { status: 404 });
  }

  // Upsert response (allows re-submission, clears reset flag if set)
  const { data, error } = await admin
    .from("responses")
    .upsert(
      {
        session_id: sessionId,
        student_id: studentId,
        situation_id: situationId,
        text: cleanText,
        reset_at: null,
      },
      { onConflict: "session_id,student_id,situation_id" },
    )
    .select()
    .single();

  if (error) {
    Sentry.captureException(error);
    console.error("[respond]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // Store response_time_ms if question_opened_at is available
  let responseTimeMs: number | null = null;
  if (session.question_opened_at && data) {
    const ms = Date.now() - new Date(session.question_opened_at).getTime();
    if (ms > 1000 && ms < 600000) {
      responseTimeMs = ms;
      await admin.from("responses").update({ response_time_ms: ms }).eq("id", data.id);
    }
  }

  // Log response event (fire-and-forget)
  if (data) {
    logSessionEvent({
      sessionId,
      eventType: "response_received",
      studentId,
      situationId,
      payload: { responseTimeMs, textLength: cleanText.length },
    });
  }

  // Update student last_seen
  await admin.from("students").update({ last_seen_at: new Date().toISOString() }).eq("id", studentId);

  // Broadcast update so pilot/screen get instant notification
  broadcastSessionUpdate(sessionId);

  // ── Free mode: auto-create collective choice + auto-advance ──
  if (session.mode === "free") {
    // Get situation info for the collective choice
    const { data: sit } = await admin
      .from("situations")
      .select("category, restitution_label")
      .eq("id", situationId)
      .single();

    if (sit) {
      // Auto-create collective choice (response = choice in solo)
      await admin.from("collective_choices").upsert(
        {
          session_id: sessionId,
          situation_id: situationId,
          category: sit.category,
          restitution_label: sit.restitution_label,
          chosen_text: cleanText,
          source_response_id: data.id,
        },
        { onConflict: "session_id,situation_id" },
      );

      // Auto-advance to next situation (module-aware séance map)
      const seanceMap = MODULE_SEANCE_SITUATIONS[session.current_module];
      const seanceMax = seanceMap?.[session.current_seance] ?? 8;
      const nextIndex = session.current_situation_index + 1;

      if (nextIndex < seanceMax) {
        // Next question in same séance
        await admin.from("sessions").update({ current_situation_index: nextIndex }).eq("id", sessionId);
      } else {
        // Check next séance
        const nextSeance = session.current_seance + 1;
        if (seanceMap?.[nextSeance]) {
          // Move to next séance
          await admin
            .from("sessions")
            .update({
              current_seance: nextSeance,
              current_situation_index: 0,
            })
            .eq("id", sessionId);
        } else {
          // All done
          await admin.from("sessions").update({ status: "done" }).eq("id", sessionId);
        }
      }
      // Broadcast auto-advance to all clients
      broadcastSessionUpdate(sessionId);
    }
  }

  return NextResponse.json(data);
});
