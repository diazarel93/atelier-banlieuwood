import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * GET /api/v2/question-analytics
 * Per-question analytics: avg score, response count, avg response time.
 * Optional: ?sessionId=X&classLabel=Y
 */
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const sessionIdFilter = req.nextUrl.searchParams.get("sessionId");
  const classLabelFilter = req.nextUrl.searchParams.get("classLabel");

  // Get facilitator's sessions
  let sessionsQuery = supabase
    .from("sessions")
    .select("id")
    .eq("facilitator_id", user.id);

  if (sessionIdFilter) {
    sessionsQuery = sessionsQuery.eq("id", sessionIdFilter);
  }
  if (classLabelFilter) {
    sessionsQuery = sessionsQuery.eq("class_label", classLabelFilter);
  }

  const { data: sessions, error: sessErr } = await sessionsQuery;

  if (sessErr) {
    return NextResponse.json({ error: sessErr.message }, { status: 500 });
  }

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ questions: [] });
  }

  const sessionIds = sessions.map((s) => s.id);

  // Get all responses for these sessions
  const { data: responses, error: respErr } = await supabase
    .from("responses")
    .select("situation_id, ai_score, response_time_ms, session_id")
    .in("session_id", sessionIds);

  if (respErr) {
    return NextResponse.json({ error: respErr.message }, { status: 500 });
  }

  if (!responses || responses.length === 0) {
    return NextResponse.json({ questions: [] });
  }

  // Get unique situation IDs and fetch their info
  const situationIds = [...new Set(responses.map((r) => r.situation_id).filter(Boolean))];

  if (situationIds.length === 0) {
    return NextResponse.json({ questions: [] });
  }

  const { data: situations } = await supabase
    .from("situations")
    .select("id, label, category, module")
    .in("id", situationIds);

  const situationMap = new Map(
    (situations || []).map((s) => [s.id, s])
  );

  // Aggregate per situation
  const grouped = new Map<
    string,
    { scores: number[]; times: number[]; count: number }
  >();

  for (const r of responses) {
    if (!r.situation_id) continue;
    const existing = grouped.get(r.situation_id) || {
      scores: [],
      times: [],
      count: 0,
    };
    existing.count++;
    if (r.ai_score !== null && r.ai_score !== undefined) {
      existing.scores.push(r.ai_score);
    }
    if (r.response_time_ms !== null && r.response_time_ms !== undefined) {
      existing.times.push(r.response_time_ms);
    }
    grouped.set(r.situation_id, existing);
  }

  const questions = [...grouped.entries()]
    .map(([situationId, data]) => {
      const sit = situationMap.get(situationId);
      const avgScore =
        data.scores.length > 0
          ? Math.round(
              (data.scores.reduce((a, b) => a + b, 0) / data.scores.length) *
                10
            ) / 10
          : null;
      const avgTimeMs =
        data.times.length > 0
          ? Math.round(
              data.times.reduce((a, b) => a + b, 0) / data.times.length
            )
          : null;

      return {
        situationId,
        module: sit?.module || null,
        category: sit?.category || null,
        label: sit?.label || "Question",
        responseCount: data.count,
        avgAiScore: avgScore,
        avgResponseTimeMs: avgTimeMs,
      };
    })
    // Sort by avg score ASC (hardest first), nulls at end
    .sort((a, b) => {
      if (a.avgAiScore === null && b.avgAiScore === null) return 0;
      if (a.avgAiScore === null) return 1;
      if (b.avgAiScore === null) return -1;
      return a.avgAiScore - b.avgAiScore;
    });

  return NextResponse.json({ questions });
}
