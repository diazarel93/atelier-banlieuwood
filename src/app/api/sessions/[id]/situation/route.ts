import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUUID } from "@/lib/api-utils";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import * as Sentry from "@sentry/nextjs";
import {
  handleModule1,
  handleModule2EC,
  handleModule6,
  handleModule7,
  handleModule8,
  handleModule10,
  handleModule11,
  handleModule12,
  handleModule13,
  getStudentTeam,
} from "./handlers";

// GET — get current situation for a session (used by students via polling)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;

  // Rate limit per student (avoids NAT collision when 30+ students share one school IP)
  const rlStudentId = req.nextUrl.searchParams.get("studentId");
  const rateLimitKey = rlStudentId
    ? `situation:${sessionId}:${rlStudentId}`
    : `situation:${sessionId}:${getIP(req)}`;
  const limited = checkRateLimit(getIP(req), rateLimitKey, { max: 30, windowSec: 10 });
  if (limited) {
    return NextResponse.json({ error: limited.error }, { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } });
  }

  const admin = createAdminClient();

  // Get session state
  const { data: session, error: sessionError } = await admin
    .from("sessions")
    .select("id, status, current_module, current_seance, current_situation_index, level, title, join_code, template, timer_ends_at, mode, sharing_enabled, broadcast_message, broadcast_at, mute_sounds, reveal_phase")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (sessionError) {
    Sentry.captureException(sessionError);
  }
  if (sessionError || !session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // ── MODULE 1: Confiance + Diagnostic (images) ──
  if (session.current_module === 1) {
    return handleModule1(req, session, sessionId, admin);
  }

  // ── MODULE 2: Émotion Cachée ──
  if (session.current_module === 2) {
    return handleModule2EC(req, session, sessionId, admin);
  }

  // ── MODULE 6: Le Scénario (dbModule=5) ──
  if (session.current_module === 5) {
    return handleModule6(req, session, sessionId, admin);
  }

  // ── MODULE 7: La Mise en scène (dbModule=7) ──
  if (session.current_module === 7) {
    return handleModule7(req, session, sessionId, admin);
  }

  // ── MODULE 8: L'Équipe (dbModule=8) ──
  if (session.current_module === 8) {
    return handleModule8(req, session, sessionId, admin);
  }

  // ── MODULE 10: Et si... + Pitch ──
  if (session.current_module === 10) {
    return handleModule10(req, session, sessionId, admin);
  }

  // ── MODULE 11: Ciné-Débat ──
  if (session.current_module === 11) {
    return handleModule11(req, session, sessionId, admin);
  }

  // ── MODULE 12: Construction Collective ──
  if (session.current_module === 12) {
    return handleModule12(req, session, sessionId, admin);
  }

  // ── MODULE 13: La Post-prod ──
  if (session.current_module === 13) {
    return handleModule13(req, session, sessionId, admin);
  }

  // ── MODULE 3+ & 9: Situations normales ──

  // Get all variants for this position
  const { data: variants } = await admin
    .from("situations")
    .select("*")
    .eq("module", session.current_module)
    .eq("seance", session.current_seance)
    .eq("position", session.current_situation_index + 1);

  // Pick a variant deterministically based on session ID + position
  let situation = variants?.[0] || null;
  if (variants && variants.length > 1) {
    const hash = sessionId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const variantIndex = (hash + session.current_situation_index) % variants.length;
    situation = variants[variantIndex];
  }

  // Get the student ID from query params (for checking if already responded)
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (studentId && !isValidUUID(studentId)) {
    return NextResponse.json({ error: "studentId invalide" }, { status: 400 });
  }

  // ── Parallel queries: group independent DB calls ──
  const [
    responseResult,
    studentResult,
    studentTeamResult,
    voteOptionsResult,
    hasVotedResult,
    collectiveChoiceResult,
    connectedCountResult,
    responsesCountResult,
    budgetResult,
  ] = await Promise.all([
    // Q3: Student response check
    studentId && situation
      ? admin
          .from("responses")
          .select("id, teacher_nudge")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .eq("situation_id", situation.id)
          .is("reset_at", null)
          .single()
      : Promise.resolve({ data: null }),
    // Q4: Student warnings/kicked
    studentId
      ? admin
          .from("students")
          .select("warnings, kicked")
          .eq("id", studentId)
          .eq("session_id", sessionId)
          .single()
      : Promise.resolve({ data: null }),
    // Q5: Student team
    studentId
      ? getStudentTeam(admin, studentId, sessionId)
      : Promise.resolve(null),
    // Q6: Vote options
    session.status === "voting" && situation
      ? admin
          .from("responses")
          .select("id, text")
          .eq("session_id", sessionId)
          .eq("situation_id", situation.id)
          .eq("is_hidden", false)
          .eq("is_vote_option", true)
      : Promise.resolve({ data: null }),
    // Q7: Has voted
    session.status === "voting" && situation && studentId
      ? admin
          .from("votes")
          .select("id")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .eq("situation_id", situation.id)
          .single()
      : Promise.resolve({ data: null }),
    // Q8: Collective choice
    situation
      ? admin
          .from("collective_choices")
          .select("*")
          .eq("session_id", sessionId)
          .eq("situation_id", situation.id)
          .single()
      : Promise.resolve({ data: null }),
    // Q9: Connected students count
    admin
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .eq("is_active", true),
    // Q10: Responses count
    situation
      ? admin
          .from("responses")
          .select("*", { count: "exact", head: true })
          .eq("session_id", sessionId)
          .eq("situation_id", situation.id)
          .is("reset_at", null)
      : Promise.resolve({ count: 0 }),
    // Q11: Budget stats (module 9 séance 2)
    session.current_module === 9 && (session.current_seance || 1) === 2
      ? admin
          .from("module2_budgets")
          .select("choices")
          .eq("session_id", sessionId)
      : Promise.resolve({ data: null }),
  ]);

  // ── Unpack results with safe access ──
  const responseData = responseResult.data as { id?: string; teacher_nudge?: string } | null;
  const hasResponded = !!responseData;
  const teacherNudge = responseData?.teacher_nudge || null;
  const studentResponseId: string | null = responseData?.id || null;

  const studentData = studentResult.data as { warnings?: number; kicked?: boolean } | null;
  const studentWarnings = studentData?.warnings || 0;
  const studentKicked = studentData?.kicked || false;
  const studentTeam = studentTeamResult;

  const voteOptions: { id: string; text: string }[] = Array.isArray(voteOptionsResult.data) ? voteOptionsResult.data : [];
  const hasVoted = !!hasVotedResult.data;
  const collectiveChoice = collectiveChoiceResult.data || null;
  const count = "count" in connectedCountResult ? (connectedCountResult.count as number | null) : null;
  const responsesCount = "count" in responsesCountResult ? ((responsesCountResult.count as number | null) || 0) : 0;

  let budgetStats: { averages: Record<string, number>; submittedCount: number } | null = null;
  const budgets = Array.isArray(budgetResult.data) ? budgetResult.data : null;
  if (budgets && budgets.length > 0) {
    const budgetKeys = ["acteurs", "decors", "technique", "son", "montage"];
    const averages: Record<string, number> = {};
    for (const cat of budgetKeys) {
      const values = budgets.map((b: { choices: unknown }) => ((b.choices as Record<string, number>)?.[cat] || 0));
      averages[cat] = Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length);
    }
    budgetStats = { averages, submittedCount: budgets.length };
  } else if (session.current_module === 9 && (session.current_seance || 1) === 2) {
    budgetStats = { averages: {}, submittedCount: 0 };
  }

  // Get prompt for the session's level
  let prompt = "";
  if (situation) {
    const levelMap: Record<string, string> = {
      primaire: "prompt_6_9",
      college: "prompt_10_13",
      lycee: "prompt_14_18",
    };
    const field = levelMap[session.level] || "prompt_10_13";
    prompt = situation[field as keyof typeof situation] as string;
  }

  return NextResponse.json({
    session: {
      id: session.id,
      status: session.status,
      currentModule: session.current_module,
      currentSeance: session.current_seance,
      currentSituationIndex: session.current_situation_index,
      level: session.level,
      title: session.title,
      joinCode: session.join_code,
      template: session.template || null,
      timerEndsAt: session.timer_ends_at || null,
      mode: session.mode || "guided",
      sharingEnabled: session.sharing_enabled || false,
      broadcastMessage: session.broadcast_message || null,
      broadcastAt: session.broadcast_at || null,
      muteSounds: session.mute_sounds ?? false,
      revealPhase: session.reveal_phase ?? null,
    },
    situation: situation
      ? {
          id: situation.id,
          position: situation.position,
          category: situation.category,
          restitutionLabel: situation.restitution_label,
          prompt,
          nudgeText: situation.nudge_text,
        }
      : null,
    hasResponded,
    hasVoted,
    voteOptions,
    collectiveChoice,
    isMyResponseChosen: !!(collectiveChoice && studentResponseId && collectiveChoice.source_response_id === studentResponseId),
    connectedCount: count || 0,
    responsesCount,
    budgetStats,
    teacherNudge,
    studentWarnings,
    studentKicked,
    team: studentTeam,
  }, { headers: { "Cache-Control": "private, no-store" } });
}
