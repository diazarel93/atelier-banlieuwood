import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator } from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeOIE, aggregateOIE, type OIEScores } from "@/lib/oie-profile";

// GET — return O-I-E scores for all students in the session
// ?debug=true returns signal breakdown per student (always recomputes)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const debug = req.nextUrl.searchParams.get("debug") === "true";
  const admin = createAdminClient();

  // Debug mode: always recompute with signal details
  if (debug) {
    const scores = await computeSessionOIE(admin, sessionId, true);
    return NextResponse.json({ scores, cached: false, debug: true });
  }

  // Try cache first
  const { data: cached } = await admin
    .from("session_oie_scores")
    .select("student_id, observation, imagination, expression, dominant, response_count, computed_at")
    .eq("session_id", sessionId);

  if (cached && cached.length > 0) {
    const scores: Record<string, OIEScores> = {};
    for (const row of cached) {
      scores[row.student_id] = {
        O: row.observation,
        I: row.imagination,
        E: row.expression,
        dominant: (row.dominant as "O" | "I" | "E") || "O",
        responseCount: row.response_count || 0,
        isReliable: (row.response_count || 0) >= 15,
      };
    }
    return NextResponse.json({ scores, cached: true, computedAt: cached[0]?.computed_at });
  }

  // No cache — compute on the fly
  const scores = await computeSessionOIE(admin, sessionId);
  return NextResponse.json({ scores, cached: false });
}

// POST — (re)compute O-I-E for all students, persist in cache + aggregate to profiles
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const admin = createAdminClient();

  // Verify session exists
  const { data: session } = await admin
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  const scores = await computeSessionOIE(admin, sessionId);

  // Upsert into session_oie_scores
  const now = new Date().toISOString();
  const rows = Object.entries(scores).map(([studentId, s]) => ({
    session_id: sessionId,
    student_id: studentId,
    observation: s.O,
    imagination: s.I,
    expression: s.E,
    dominant: s.dominant,
    response_count: s.responseCount,
    computed_at: now,
  }));

  if (rows.length > 0) {
    await admin
      .from("session_oie_scores")
      .upsert(rows, { onConflict: "session_id,student_id" });
  }

  // Aggregate cross-session for each student who has a profile
  for (const studentId of Object.keys(scores)) {
    // Find the student's profile_id via the students table
    const { data: studentRow } = await admin
      .from("students")
      .select("profile_id")
      .eq("id", studentId)
      .not("profile_id", "is", null)
      .limit(1)
      .maybeSingle();

    if (!studentRow?.profile_id) continue;

    const { data: allScores } = await admin
      .from("session_oie_scores")
      .select("observation, imagination, expression, response_count")
      .eq("student_id", studentId);

    if (allScores && allScores.length > 0) {
      const agg = aggregateOIE(allScores);
      await admin
        .from("student_profiles")
        .update({
          oie_observation: agg.O,
          oie_imagination: agg.I,
          oie_expression: agg.E,
          oie_dominant: agg.dominant,
          oie_response_count: agg.responseCount,
          oie_computed_at: now,
        })
        .eq("id", studentRow.profile_id);
    }
  }

  return NextResponse.json({ scores, computed: true });
}

// ═══════════════════════════════════════════════════════
// Internal computation
// ═══════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function computeSessionOIE(admin: any, sessionId: string, includeSignals = false): Promise<Record<string, OIEScores>> {
  // 1. Fetch responses with situation category
  const { data: responses } = await admin
    .from("responses")
    .select("id, student_id, text, response_time_ms, ai_score, is_highlighted, situation_id, situations(category)")
    .eq("session_id", sessionId);

  if (!responses || responses.length === 0) return {};

  // 2. Count votes received per student
  const { data: votes } = await admin
    .from("votes")
    .select("chosen_response_id")
    .eq("session_id", sessionId);

  // Map response_id → student_id for vote attribution
  const responseToStudent: Record<string, string> = {};
  for (const r of responses) {
    responseToStudent[r.id] = r.student_id;
  }

  const votesPerStudent: Record<string, number> = {};
  if (votes) {
    for (const v of votes) {
      const sid = responseToStudent[v.chosen_response_id];
      if (sid) {
        votesPerStudent[sid] = (votesPerStudent[sid] || 0) + 1;
      }
    }
  }

  // 3. Count collective choices per student (via source_response_id)
  const { data: choices } = await admin
    .from("collective_choices")
    .select("source_response_id")
    .eq("session_id", sessionId)
    .not("source_response_id", "is", null);

  const choicesPerStudent: Record<string, number> = {};
  if (choices) {
    for (const c of choices) {
      const sid = responseToStudent[c.source_response_id];
      if (sid) {
        choicesPerStudent[sid] = (choicesPerStudent[sid] || 0) + 1;
      }
    }
  }

  // 4. Group responses by student
  const byStudent: Record<string, typeof responses> = {};
  for (const r of responses) {
    if (!byStudent[r.student_id]) byStudent[r.student_id] = [];
    byStudent[r.student_id].push(r);
  }

  // 5. Compute O-I-E per student
  const scores: Record<string, OIEScores> = {};
  for (const [studentId, studentResponses] of Object.entries(byStudent)) {
    const signals = studentResponses.map((r: {
      student_id: string;
      situations: { category: string } | null;
      response_time_ms: number | null;
      text: string;
      ai_score: number | null;
      is_highlighted: boolean;
    }) => ({
      studentId: r.student_id,
      category: r.situations?.category || null,
      responseTimeMs: r.response_time_ms,
      textLength: (r.text || "").length,
      aiScore: r.ai_score,
      isHighlighted: r.is_highlighted,
    }));

    const voteSignal = votesPerStudent[studentId]
      ? { studentId, voteCount: votesPerStudent[studentId] }
      : undefined;

    const choiceSignal = choicesPerStudent[studentId]
      ? { studentId, choiceCount: choicesPerStudent[studentId] }
      : undefined;

    scores[studentId] = computeOIE(signals, voteSignal, choiceSignal, includeSignals);
  }

  return scores;
}
