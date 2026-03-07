import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * GET /api/v2/dashboard-summary
 * Light aggregation for the V2 dashboard hub.
 * Returns: today's sessions, quick stats, session dates for calendar.
 */
export async function GET() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Fetch all sessions for this facilitator
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("id, title, status, level, template, created_at, scheduled_at, class_label, students(id)")
    .eq("facilitator_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const allSessions = sessions || [];
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  // Sessions for today and tomorrow
  const todaySessions = allSessions.filter((s) => {
    const d = s.scheduled_at || s.created_at;
    return d && d.slice(0, 10) === todayStr;
  });

  const tomorrowSessions = allSessions.filter((s) => {
    const d = s.scheduled_at || s.created_at;
    return d && d.slice(0, 10) === tomorrowStr;
  });

  // Quick stats
  const totalSessions = allSessions.length;
  const doneSessions = allSessions.filter((s) => s.status === "done").length;
  const totalStudents = allSessions.reduce(
    (acc, s) => acc + ((s.students as { id: string }[])?.length || 0),
    0
  );

  // Unique modules completed (sessions with status "done")
  const activeStatuses = ["responding", "reviewing", "voting", "waiting"];
  const activeSessions = allSessions.filter((s) =>
    activeStatuses.includes(s.status)
  ).length;

  // Dates that have sessions (for calendar dots)
  const sessionDates = [
    ...new Set(
      allSessions
        .map((s) => (s.scheduled_at || s.created_at)?.slice(0, 10))
        .filter(Boolean)
    ),
  ];

  return NextResponse.json({
    todaySessions: todaySessions.map(summarize),
    tomorrowSessions: tomorrowSessions.map(summarize),
    stats: {
      totalSessions,
      doneSessions,
      activeSessions,
      totalStudents,
    },
    sessionDates,
  });
}

function summarize(s: Record<string, unknown>) {
  return {
    id: s.id,
    title: s.title,
    status: s.status,
    level: s.level,
    template: s.template,
    scheduledAt: s.scheduled_at || s.created_at,
    classLabel: s.class_label,
    studentCount: ((s.students as { id: string }[]) || []).length,
  };
}
