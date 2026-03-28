import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth-helpers";
import { withErrorHandler } from "@/lib/api-utils";

/**
 * GET /api/v2/dashboard-summary
 * Light aggregation for the V2 dashboard hub.
 * Returns: today's sessions, quick stats, session dates for calendar.
 * Optional: ?classLabel=X to filter by class.
 */
export const GET = withErrorHandler<Record<string, never>>(async function GET(req: NextRequest) {
  const rawClassLabel = req.nextUrl.searchParams.get("classLabel");
  const classLabelFilter = rawClassLabel && rawClassLabel.length <= 50 ? rawClassLabel : null;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const authUser = await getAuthUser(supabase);
  const isAdmin = authUser?.role === "admin";

  // Fetch sessions (admin sees all, others see own)
  let query = supabase
    .from("sessions")
    .select(
      "id, title, status, level, template, created_at, scheduled_at, class_label, completed_modules, students(id)",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (!isAdmin) {
    query = query.eq("facilitator_id", user.id);
  }

  const { data: sessions, error } = await query;

  if (error) {
    console.error("[dashboard-summary]", error.message);
    return NextResponse.json({ error: "Erreur lors du chargement du tableau de bord" }, { status: 500 });
  }

  // Collect all unique class labels before filtering
  const classLabels = [
    ...new Set(
      (sessions || []).map((s) => (s as Record<string, unknown>).class_label as string | null).filter(Boolean),
    ),
  ].sort() as string[];

  // Apply class label filter if provided
  const allSessions = classLabelFilter
    ? (sessions || []).filter((s) => (s as Record<string, unknown>).class_label === classLabelFilter)
    : sessions || [];
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  // Sessions for today and tomorrow (use scheduled_at if available, fallback to created_at)
  const todaySessions = allSessions.filter((s) => {
    const d = ((s as Record<string, unknown>).scheduled_at as string) || s.created_at;
    return d && d.slice(0, 10) === todayStr;
  });

  const tomorrowSessions = allSessions.filter((s) => {
    const d = ((s as Record<string, unknown>).scheduled_at as string) || s.created_at;
    return d && d.slice(0, 10) === tomorrowStr;
  });

  // Quick stats
  const totalSessions = allSessions.length;
  const doneSessions = allSessions.filter((s) => s.status === "done").length;
  const totalStudents = allSessions.reduce((acc, s) => acc + ((s.students as { id: string }[])?.length || 0), 0);

  // Unique modules completed (sessions with status "done")
  const activeStatuses = ["responding", "reviewing", "voting", "waiting"];
  const activeSessions = allSessions.filter((s) => activeStatuses.includes(s.status)).length;

  // Aggregate completed module IDs across all sessions
  const completedModuleIds = [
    ...new Set(allSessions.flatMap((s) => ((s as Record<string, unknown>).completed_modules as string[]) || [])),
  ];

  // Dates that have sessions (for calendar dots)
  const sessionDates = [
    ...new Set(
      allSessions
        .map((s) => (((s as Record<string, unknown>).scheduled_at as string) || s.created_at)?.slice(0, 10))
        .filter(Boolean),
    ),
  ];

  // Recent sessions for the timeline (last 15, descending)
  const recentSessions = allSessions.slice(0, 15).map(summarize);

  // Trends: compare last 7 days vs previous 7 days
  const d7ago = new Date(now);
  d7ago.setDate(d7ago.getDate() - 7);
  const d14ago = new Date(now);
  d14ago.setDate(d14ago.getDate() - 14);

  const sessionsLast7 = allSessions.filter((s) => {
    const d = ((s as Record<string, unknown>).scheduled_at as string) || s.created_at;
    return d && d >= d7ago.toISOString();
  });
  const sessionsPrev7 = allSessions.filter((s) => {
    const d = ((s as Record<string, unknown>).scheduled_at as string) || s.created_at;
    return d && d >= d14ago.toISOString() && d < d7ago.toISOString();
  });

  const doneLast7 = sessionsLast7.filter((s) => s.status === "done").length;
  const donePrev7 = sessionsPrev7.filter((s) => s.status === "done").length;
  const studentsLast7 = sessionsLast7.reduce((acc, s) => acc + ((s.students as { id: string }[])?.length || 0), 0);
  const studentsPrev7 = sessionsPrev7.reduce((acc, s) => acc + ((s.students as { id: string }[])?.length || 0), 0);

  function pctChange(curr: number, prev: number): number {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  }

  const trends = {
    doneSessions: { value: pctChange(doneLast7, donePrev7), label: "vs 7j préc." },
    activeSessions: {
      value: pctChange(
        activeSessions,
        sessionsPrev7.filter((s) => s.status === "active" || s.status === "responding" || s.status === "waiting")
          .length,
      ),
      label: "vs 7j préc.",
    },
    totalSessions: { value: pctChange(sessionsLast7.length, sessionsPrev7.length), label: "vs 7j préc." },
    totalStudents: { value: pctChange(studentsLast7, studentsPrev7), label: "vs 7j préc." },
  };

  return NextResponse.json(
    {
      todaySessions: todaySessions.map(summarize),
      tomorrowSessions: tomorrowSessions.map(summarize),
      recentSessions,
      stats: {
        totalSessions,
        doneSessions,
        activeSessions,
        totalStudents,
      },
      trends,
      sessionDates,
      completedModuleIds,
      classLabels,
    },
    { headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=20" } },
  );
});

function summarize(s: Record<string, unknown>) {
  return {
    id: s.id,
    title: s.title,
    status: s.status,
    level: s.level,
    template: s.template,
    scheduledAt: s.scheduled_at || s.created_at,
    classLabel: s.class_label || null,
    studentCount: ((s.students as { id: string }[]) || []).length,
  };
}
