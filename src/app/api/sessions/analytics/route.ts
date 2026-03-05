import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// GET — Cross-session analytics for the facilitator's dashboard
export async function GET() {
  const supabase = await createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  // Fetch all non-deleted sessions for this facilitator
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, title, status, current_module, template, level, created_at")
    .eq("facilitator_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({
      totalSessions: 0,
      activeSessions: 0,
      doneSessions: 0,
      totalStudents: 0,
      totalResponses: 0,
      totalVotes: 0,
      totalChoices: 0,
      avgParticipation: 0,
      moduleUsage: [],
      levelDistribution: [],
      recentActivity: [],
    });
  }

  const sessionIds = sessions.map((s) => s.id);

  // Count students across all sessions
  const { count: totalStudents } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .in("session_id", sessionIds)
    .eq("kicked", false);

  // Count responses across all sessions
  const { count: totalResponses } = await supabase
    .from("responses")
    .select("id", { count: "exact", head: true })
    .in("session_id", sessionIds);

  // Count votes across all sessions
  const { count: totalVotes } = await supabase
    .from("votes")
    .select("id", { count: "exact", head: true })
    .in("session_id", sessionIds);

  // Count collective choices across all sessions
  const { count: totalChoices } = await supabase
    .from("collective_choices")
    .select("id", { count: "exact", head: true })
    .in("session_id", sessionIds);

  // Per-session participation rates (students who responded / total students)
  const participationRates: number[] = [];
  // Only compute for done sessions (avoid skewing with in-progress sessions)
  const doneSessions = sessions.filter((s) => s.status === "done");

  for (const s of doneSessions.slice(0, 20)) {
    const { count: sStudents } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("session_id", s.id)
      .eq("kicked", false);

    const { data: respondents } = await supabase
      .from("responses")
      .select("student_id")
      .eq("session_id", s.id);

    const uniqueRespondents = new Set((respondents || []).map((r) => r.student_id)).size;
    if (sStudents && sStudents > 0) {
      participationRates.push(Math.round((uniqueRespondents / sStudents) * 100));
    }
  }

  const avgParticipation = participationRates.length > 0
    ? Math.round(participationRates.reduce((a, b) => a + b, 0) / participationRates.length)
    : 0;

  // Module usage distribution
  const moduleCounts: Record<number, number> = {};
  for (const s of sessions) {
    const mod = s.current_module || 0;
    if (mod > 0) moduleCounts[mod] = (moduleCounts[mod] || 0) + 1;
  }
  const moduleUsage = Object.entries(moduleCounts)
    .map(([mod, count]) => ({ module: parseInt(mod), count }))
    .sort((a, b) => b.count - a.count);

  // Level distribution
  const levelCounts: Record<string, number> = {};
  for (const s of sessions) {
    const lvl = s.level || "non defini";
    levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
  }
  const levelDistribution = Object.entries(levelCounts)
    .map(([level, count]) => ({ level, count }))
    .sort((a, b) => b.count - a.count);

  // Recent activity — last 7 sessions with student counts
  const recent = sessions.slice(0, 7);
  const recentActivity: { title: string; date: string; students: number; status: string }[] = [];
  for (const s of recent) {
    const { count: sc } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("session_id", s.id)
      .eq("kicked", false);

    recentActivity.push({
      title: s.title || "Session",
      date: s.created_at,
      students: sc || 0,
      status: s.status,
    });
  }

  // Weekly trend — sessions per week for last 8 weeks
  const now = new Date();
  const weeklyTrend: { week: string; sessions: number; students: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i * 7 + now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekSessions = sessions.filter((s) => {
      const d = new Date(s.created_at);
      return d >= weekStart && d < weekEnd;
    });

    weeklyTrend.push({
      week: weekStart.toISOString().slice(0, 10),
      sessions: weekSessions.length,
      students: 0, // filled below if needed
    });
  }

  // Daily activity — sessions per day for last 30 days
  const dailyActivity: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dayStr = day.toISOString().slice(0, 10);
    const count = sessions.filter(
      (s) => s.created_at.slice(0, 10) === dayStr
    ).length;
    dailyActivity.push({ date: dayStr, count });
  }

  // Template usage
  const templateCounts: Record<string, number> = {};
  for (const s of sessions) {
    const tpl = s.template || "aucun";
    templateCounts[tpl] = (templateCounts[tpl] || 0) + 1;
  }
  const templateUsage = Object.entries(templateCounts)
    .map(([template, count]) => ({ template, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    totalSessions: sessions.length,
    activeSessions: sessions.filter((s) => s.status !== "done").length,
    doneSessions: doneSessions.length,
    totalStudents: totalStudents || 0,
    totalResponses: totalResponses || 0,
    totalVotes: totalVotes || 0,
    totalChoices: totalChoices || 0,
    avgParticipation,
    moduleUsage,
    levelDistribution,
    templateUsage,
    recentActivity,
    weeklyTrend,
    dailyActivity,
  });
}
