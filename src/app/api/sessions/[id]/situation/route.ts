import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUUID, withErrorHandler } from "@/lib/api-utils";
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

// ── In-memory cache (2s TTL) ──────────────────────────────────────────────
// This endpoint is polled by every student every 3-5s. With 30 students that's
// 6-10 req/s, each triggering ~12 Supabase queries. The cache deduplicates
// session-level queries so only 1 request per 2s actually hits the DB.
// Student-specific data (response check, warnings, team, hasVoted)
// is always computed fresh per request.
//
// NOTE: RLS policies for module tables currently use permissive USING(true).
// These should be tightened in a future security sprint.
// ──────────────────────────────────────────────────────────────────────────

const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 2000; // 2 seconds

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) return entry.data as T;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
  // Prevent memory leak — clean old entries every 100 sets
  if (cache.size > 200) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now >= v.expiry) cache.delete(k);
    }
  }
}

/** Cached session-level data for the standard path (modules 3, 4, 9) */
interface SessionCacheData {
  session: Record<string, unknown>;
  situation: Record<string, unknown> | null;
  voteOptions: { id: string; text: string }[];
  collectiveChoice: Record<string, unknown> | null;
  connectedCount: number;
  responsesCount: number;
  budgetStats: { averages: Record<string, number>; submittedCount: number } | null;
  situationPayload: Record<string, unknown> | null;
  sessionPayload: Record<string, unknown>;
}

// GET — get current situation for a session (used by students via polling)
export const GET = withErrorHandler(async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;

  // Rate limit per student (avoids NAT collision when 30+ students share one school IP)
  const rlStudentId = req.nextUrl.searchParams.get("studentId");
  const rateLimitKey = rlStudentId ? `situation:${sessionId}:${rlStudentId}` : `situation:${sessionId}:${getIP(req)}`;
  const limited = checkRateLimit(getIP(req), rateLimitKey, { max: 30, windowSec: 10 });
  if (limited) {
    return NextResponse.json(
      { error: limited.error },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const admin = createAdminClient();

  // ── Session query (cached for all paths) ──
  const sessionCacheKey = `session:${sessionId}`;
  let session = getCached<Record<string, unknown>>(sessionCacheKey);

  if (!session) {
    const { data: sessionData, error: sessionError } = await admin
      .from("sessions")
      .select(
        "id, status, current_module, current_seance, current_situation_index, level, title, join_code, template, timer_ends_at, mode, sharing_enabled, broadcast_message, broadcast_at, mute_sounds, reveal_phase",
      )
      .eq("id", sessionId)
      .is("deleted_at", null)
      .single();

    if (sessionError) {
      Sentry.captureException(sessionError);
    }
    if (sessionError || !sessionData) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }

    session = sessionData as Record<string, unknown>;
    setCache(sessionCacheKey, session);
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

  // Get the student ID from query params (for checking if already responded)
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (studentId && !isValidUUID(studentId)) {
    return NextResponse.json({ error: "studentId invalide" }, { status: 400 });
  }

  // ── Session-level data (cached — same for all students) ──
  const stdCacheKey = `std:${sessionId}`;
  let cached = getCached<SessionCacheData>(stdCacheKey);

  if (!cached) {
    // Get all variants for this position
    const { data: variants } = await admin
      .from("situations")
      .select("*")
      .eq("module", session.current_module as number)
      .eq("seance", session.current_seance as number)
      .eq("position", (session.current_situation_index as number) + 1);

    // Pick a variant deterministically based on session ID + position
    let situation = variants?.[0] || null;
    if (variants && variants.length > 1) {
      const hash = sessionId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const variantIndex = (hash + (session.current_situation_index as number)) % variants.length;
      situation = variants[variantIndex];
    }

    // ── Session-level parallel queries ──
    const [voteOptionsResult, collectiveChoiceResult, connectedCountResult, responsesCountResult, budgetResult] =
      await Promise.all([
        // Q6: Vote options (session-level — same for all students)
        session.status === "voting" && situation
          ? admin
              .from("responses")
              .select("id, text")
              .eq("session_id", sessionId)
              .eq("situation_id", situation.id)
              .eq("is_hidden", false)
              .eq("is_vote_option", true)
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
        session.current_module === 9 && ((session.current_seance as number) || 1) === 2
          ? admin.from("module2_budgets").select("choices").eq("session_id", sessionId)
          : Promise.resolve({ data: null }),
      ]);

    // Unpack session-level results
    const voteOptions: { id: string; text: string }[] = Array.isArray(voteOptionsResult.data)
      ? voteOptionsResult.data
      : [];
    const collectiveChoice = collectiveChoiceResult.data || null;
    const connectedCount = "count" in connectedCountResult ? (connectedCountResult.count as number | null) || 0 : 0;
    const responsesCount = "count" in responsesCountResult ? (responsesCountResult.count as number | null) || 0 : 0;

    let budgetStats: { averages: Record<string, number>; submittedCount: number } | null = null;
    const budgets = Array.isArray(budgetResult.data) ? budgetResult.data : null;
    if (budgets && budgets.length > 0) {
      const budgetKeys = ["acteurs", "decors", "effets", "musique", "duree"];
      const averages: Record<string, number> = {};
      for (const cat of budgetKeys) {
        const values = budgets.map((b: { choices: unknown }) => (b.choices as Record<string, number>)?.[cat] || 0);
        averages[cat] = Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length);
      }
      budgetStats = { averages, submittedCount: budgets.length };
    } else if (session.current_module === 9 && ((session.current_seance as number) || 1) === 2) {
      budgetStats = { averages: {}, submittedCount: 0 };
    }

    // Build prompt from situation + level
    let prompt = "";
    if (situation) {
      const levelMap: Record<string, string> = {
        primaire: "prompt_6_9",
        college: "prompt_10_13",
        lycee: "prompt_14_18",
      };
      const field = levelMap[session.level as string] || "prompt_10_13";
      prompt = situation[field as keyof typeof situation] as string;
    }

    const situationPayload = situation
      ? {
          id: situation.id,
          position: situation.position,
          category: situation.category,
          restitutionLabel: situation.restitution_label,
          prompt,
          nudgeText: situation.nudge_text,
        }
      : null;

    const sessionPayload = {
      id: session.id,
      status: session.status,
      currentModule: session.current_module,
      currentSeance: session.current_seance,
      currentSituationIndex: session.current_situation_index,
      level: session.level,
      title: session.title,
      joinCode: session.join_code,
      template: (session.template as string) || null,
      timerEndsAt: (session.timer_ends_at as string) || null,
      mode: (session.mode as string) || "guided",
      sharingEnabled: (session.sharing_enabled as boolean) || false,
      broadcastMessage: (session.broadcast_message as string) || null,
      broadcastAt: (session.broadcast_at as string) || null,
      muteSounds: (session.mute_sounds as boolean) ?? false,
      revealPhase: (session.reveal_phase as string) ?? null,
    };

    cached = {
      session,
      situation,
      voteOptions,
      collectiveChoice: collectiveChoice as Record<string, unknown> | null,
      connectedCount,
      responsesCount,
      budgetStats,
      situationPayload,
      sessionPayload,
    };

    setCache(stdCacheKey, cached);
  }

  // ── Student-specific queries (always fresh — never cached) ──
  const situation = cached.situation;
  const [responseResult, studentResult, studentTeamResult, hasVotedResult] = await Promise.all([
    // Q3: Student response check
    studentId && situation
      ? admin
          .from("responses")
          .select("id, teacher_nudge")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .eq("situation_id", (situation as Record<string, unknown>).id as string)
          .is("reset_at", null)
          .single()
      : Promise.resolve({ data: null }),
    // Q4: Student warnings/kicked
    studentId
      ? admin.from("students").select("warnings, kicked").eq("id", studentId).eq("session_id", sessionId).single()
      : Promise.resolve({ data: null }),
    // Q5: Student team
    studentId ? getStudentTeam(admin, studentId, sessionId) : Promise.resolve(null),
    // Q7: Has voted
    session.status === "voting" && situation && studentId
      ? admin
          .from("votes")
          .select("id")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .eq("situation_id", (situation as Record<string, unknown>).id as string)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  // Unpack student-specific results
  const responseData = responseResult.data as { id?: string; teacher_nudge?: string } | null;
  const hasResponded = !!responseData;
  const teacherNudge = responseData?.teacher_nudge || null;
  const studentResponseId: string | null = responseData?.id || null;

  const studentData = studentResult.data as { warnings?: number; kicked?: boolean } | null;
  const studentWarnings = studentData?.warnings || 0;
  const studentKicked = studentData?.kicked || false;
  const studentTeam = studentTeamResult;

  const hasVoted = !!hasVotedResult.data;

  return NextResponse.json(
    {
      session: cached.sessionPayload,
      situation: cached.situationPayload,
      hasResponded,
      hasVoted,
      voteOptions: cached.voteOptions,
      collectiveChoice: cached.collectiveChoice,
      isMyResponseChosen: !!(
        cached.collectiveChoice &&
        studentResponseId &&
        (cached.collectiveChoice as Record<string, unknown>).source_response_id === studentResponseId
      ),
      connectedCount: cached.connectedCount,
      responsesCount: cached.responsesCount,
      budgetStats: cached.budgetStats,
      teacherNudge,
      studentWarnings,
      studentKicked,
      team: studentTeam,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
});
