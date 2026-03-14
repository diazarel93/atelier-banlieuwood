import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

// GET /api/analytics — cross-session analytics for a facilitator
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  // Get facilitator's sessions
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, title, status, current_module, created_at")
    .eq("facilitator_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({
      sessions: [],
      totals: { totalSessions: 0, totalStudents: 0, totalResponses: 0, totalVotes: 0 },
      trends: [],
    });
  }

  const sessionIds = sessions.map((s) => s.id);

  // Get student counts per session
  const { data: students } = await supabase
    .from("students")
    .select("id, session_id")
    .in("session_id", sessionIds);

  // Get response counts per session
  const { data: responses } = await supabase
    .from("responses")
    .select("id, session_id, submitted_at")
    .in("session_id", sessionIds);

  // Get vote counts
  const { data: votes } = await supabase
    .from("votes")
    .select("id, session_id")
    .in("session_id", sessionIds);

  // Compute per-session metrics
  const sessionMetrics = sessions.map((session) => {
    const sessionStudents = students?.filter((s) => s.session_id === session.id) || [];
    const sessionResponses = responses?.filter((r) => r.session_id === session.id) || [];
    const sessionVotes = votes?.filter((v) => v.session_id === session.id) || [];

    return {
      sessionId: session.id,
      title: session.title,
      status: session.status,
      module: session.current_module,
      date: session.created_at,
      studentCount: sessionStudents.length,
      responseCount: sessionResponses.length,
      voteCount: sessionVotes.length,
      responseRate: sessionStudents.length > 0
        ? Math.round((sessionResponses.length / sessionStudents.length) * 100)
        : 0,
    };
  });

  // Totals
  const totals = {
    totalSessions: sessions.length,
    totalStudents: students?.length || 0,
    totalResponses: responses?.length || 0,
    totalVotes: votes?.length || 0,
    avgResponseRate: sessionMetrics.length > 0
      ? Math.round(sessionMetrics.reduce((acc, m) => acc + m.responseRate, 0) / sessionMetrics.length)
      : 0,
  };

  // Weekly trends (last 8 weeks)
  const now = new Date();
  const trends = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (7 - i) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekSessions = sessionMetrics.filter((m) => {
      const d = new Date(m.date);
      return d >= weekStart && d < weekEnd;
    });

    return {
      week: weekStart.toISOString().slice(0, 10),
      sessions: weekSessions.length,
      students: weekSessions.reduce((acc, m) => acc + m.studentCount, 0),
      responses: weekSessions.reduce((acc, m) => acc + m.responseCount, 0),
    };
  });

  return NextResponse.json({ sessions: sessionMetrics, totals, trends });
}

// POST /api/analytics — track event (uses admin client to bypass RLS)
export async function POST(req: NextRequest) {
  const rl = checkRateLimit(getIP(req), "analytics-event", { max: 100, windowSec: 60 });
  if (rl) {
    return NextResponse.json({ error: rl.error }, { status: 429 });
  }

  const admin = createAdminClient();
  const body = await req.json();
  const { eventType, sessionId, studentId, profileId, metadata } = body;

  if (!eventType) {
    return NextResponse.json({ error: "eventType requis" }, { status: 400 });
  }

  const { error } = await admin.from("analytics_events").insert({
    event_type: eventType,
    session_id: sessionId || null,
    student_id: studentId || null,
    profile_id: profileId || null,
    metadata: metadata || {},
  });

  if (error) {
    console.error("[analytics POST]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
