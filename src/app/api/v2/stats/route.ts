import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import type { AxesScores } from "@/lib/axes-mapping";
import { getAuthUser } from "@/lib/auth-helpers";
import { log } from "@/lib/logger";
import { withErrorHandler } from "@/lib/api-utils";

/**
 * GET /api/v2/stats?classLabel=X&sessionId=Y&dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
 * Competency axes for the V2 Statistiques page.
 * OIE scoring has been removed (R2 doctrine compliance).
 * Future data source: B8_2 implication scores (table: implication_scores).
 * Mapping B8_2 → axes not yet specified by Banlieuwood — DO NOT implement until confirmed.
 */
export const GET = withErrorHandler<Record<string, never>>(async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const authUser = await getAuthUser(supabase);
  const isAdmin = authUser?.role === "admin";

  const url = new URL(req.url);
  const classLabel = url.searchParams.get("classLabel");
  const sessionId = url.searchParams.get("sessionId");
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");
  const moduleFilter = url.searchParams.get("module"); // dbModule number as string

  // Fetch sessions (admin sees all)
  let sessQuery = supabase
    .from("sessions")
    .select("id, title, status, class_label, created_at, current_module");

  if (!isAdmin) {
    sessQuery = sessQuery.eq("facilitator_id", user.id);
  }

  // Date range filters
  if (dateFrom) {
    sessQuery = sessQuery.gte("created_at", `${dateFrom}T00:00:00`);
  }
  if (dateTo) {
    sessQuery = sessQuery.lte("created_at", `${dateTo}T23:59:59`);
  }

  // Module filter
  if (moduleFilter) {
    sessQuery = sessQuery.eq("current_module", parseInt(moduleFilter, 10));
  }

  const { data: sessions, error: sessErr } = await sessQuery;
  if (sessErr) {
    return NextResponse.json({ error: sessErr.message }, { status: 500 });
  }

  const sessionIds = sessionId
    ? [sessionId]
    : (sessions || []).map((s) => s.id as string);

  if (sessionIds.length === 0) {
    return NextResponse.json({
      classAverage: { comprehension: 0, creativite: 0, expression: 0, engagement: 0 },
      students: [],
      sessionCount: 0,
      classLabels: [],
    });
  }

  // OIE scoring removed (R2) — return empty student/axes data
  const studentsList: { id: string; displayName: string; avatar: string | null; scores: AxesScores; totalResponses?: number }[] = [];
  const classAverage: AxesScores = { comprehension: 0, creativite: 0, expression: 0, engagement: 0 };

  // Unique class labels for the selector (class_label may not exist yet)
  const classLabels = [
    ...new Set(
      (sessions || [])
        .map((s) => (s as Record<string, unknown>).class_label as string | null)
        .filter((l): l is string => l !== null && l !== undefined)
    ),
  ];

  return NextResponse.json(
    {
      classAverage,
      students: studentsList,
      sessionCount: sessionIds.length,
      classLabels,
      sessions: (sessions || []).map((s) => ({
        id: s.id,
        title: s.title,
        classLabel: (s as Record<string, unknown>).class_label || null,
      })),
    },
    { headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=30" } }
  );
});
