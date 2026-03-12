import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUUID } from "@/lib/api-utils";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
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

  // Rate limit: 200 requests per 10 seconds per IP (school WiFi shares one IP for 30+ students)
  const limited = checkRateLimit(getIP(req), `situation:${sessionId}`, { max: 200, windowSec: 10 });
  if (limited) {
    return NextResponse.json({ error: limited.error }, { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } });
  }

  const admin = createAdminClient();

  // Get session state
  const { data: session, error: sessionError } = await admin
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

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
  let hasResponded = false;
  let teacherNudge: string | null = null;
  let studentWarnings = 0;
  let studentKicked = false;
  let studentResponseId: string | null = null;

  if (studentId && situation) {
    const { data: response } = await admin
      .from("responses")
      .select("id, teacher_nudge")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .eq("situation_id", situation.id)
      .is("reset_at", null)
      .single();

    hasResponded = !!response;
    teacherNudge = response?.teacher_nudge || null;
    studentResponseId = response?.id || null;
  }

  // Get student warnings/kicked status + team info
  let studentTeam: { id: string; teamName: string; teamColor: string; teamNumber: number } | null = null;
  if (studentId) {
    const { data: student } = await admin
      .from("students")
      .select("warnings, kicked")
      .eq("id", studentId)
      .eq("session_id", sessionId)
      .single();

    studentWarnings = student?.warnings || 0;
    studentKicked = student?.kicked || false;
    studentTeam = await getStudentTeam(admin, studentId, sessionId);
  }

  // Get vote options if status is 'voting'
  let voteOptions: { id: string; text: string }[] = [];
  let hasVoted = false;

  if (session.status === "voting" && situation) {
    // Only return responses the facilitator selected for voting
    const { data: responses } = await admin
      .from("responses")
      .select("id, text")
      .eq("session_id", sessionId)
      .eq("situation_id", situation.id)
      .eq("is_hidden", false)
      .eq("is_vote_option", true);

    voteOptions = responses || [];

    if (studentId) {
      const { data: vote } = await admin
        .from("votes")
        .select("id")
        .eq("session_id", sessionId)
        .eq("student_id", studentId)
        .eq("situation_id", situation.id)
        .single();

      hasVoted = !!vote;
    }
  }

  // Get collective choice if status is 'done' or we're reviewing
  let collectiveChoice = null;
  if (situation) {
    const { data: choice } = await admin
      .from("collective_choices")
      .select("*")
      .eq("session_id", sessionId)
      .eq("situation_id", situation.id)
      .single();

    collectiveChoice = choice;
  }

  // Get connected students count
  const { count } = await admin
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("is_active", true);

  // Get responses count for current situation (exclude reset responses)
  let responsesCount = 0;
  if (situation) {
    const { count: rCount } = await admin
      .from("responses")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .eq("situation_id", situation.id)
      .is("reset_at", null);
    responsesCount = rCount || 0;
  }

  // Get budget stats if module 9 séance 2 (budget quiz, old M2)
  let budgetStats: { averages: Record<string, number>; submittedCount: number } | null = null;
  if (session.current_module === 9 && (session.current_seance || 1) === 2) {
    const { data: budgets } = await admin
      .from("module2_budgets")
      .select("choices")
      .eq("session_id", sessionId);

    if (budgets && budgets.length > 0) {
      const budgetKeys = ["acteurs", "decors", "technique", "son", "montage"];
      const averages: Record<string, number> = {};
      for (const cat of budgetKeys) {
        const values = budgets.map((b) => ((b.choices as Record<string, number>)?.[cat] || 0));
        averages[cat] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      }
      budgetStats = { averages, submittedCount: budgets.length };
    } else {
      budgetStats = { averages: {}, submittedCount: 0 };
    }
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
  });
}
