import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/badge/[token]
 * Public endpoint — returns student badge data for a share token.
 * No authentication required.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || token.length < 8) {
    return NextResponse.json({ error: "Token invalide" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Find student by share token
  const { data: student, error: studentErr } = await admin
    .from("students")
    .select("id, display_name, avatar, session_id, profile_id")
    .eq("share_token", token)
    .single();

  if (studentErr || !student) {
    return NextResponse.json({ error: "Badge introuvable" }, { status: 404 });
  }

  // Fetch session + responses + personnage + achievements in parallel
  const [sessionRes, responsesRes, retainedRes, personnageRes, achievementsRes] =
    await Promise.all([
      admin
        .from("sessions")
        .select("title, level, created_at")
        .eq("id", student.session_id)
        .single(),
      admin
        .from("responses")
        .select("id", { count: "exact", head: true })
        .eq("student_id", student.id)
        .eq("session_id", student.session_id)
        .is("reset_at", null),
      admin
        .from("collective_choices")
        .select("source_response_id, responses!inner(student_id)")
        .eq("session_id", student.session_id)
        .not("source_response_id", "is", null),
      admin
        .from("module10_personnages")
        .select("prenom, trait_dominant")
        .eq("session_id", student.session_id)
        .eq("student_id", student.id)
        .single(),
      student.profile_id
        ? admin
            .from("student_achievements")
            .select("achievement_key")
            .eq("profile_id", student.profile_id)
        : Promise.resolve({ data: [] }),
    ]);

  const session = sessionRes.data;
  if (!session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  const totalResponses = responsesRes.count || 0;

  // Count retained: collective choices whose source response belongs to this student
  const retained = (retainedRes.data || []).filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c: any) => c.responses?.student_id === student.id
  ).length;

  const impactRate =
    totalResponses > 0 ? Math.round((retained / totalResponses) * 100) : 0;

  // Get creative profile from student_profiles if available
  let creativeProfile: string | null = null;
  if (student.profile_id) {
    const { data: profile } = await admin
      .from("student_profiles")
      .select("creative_profile")
      .eq("id", student.profile_id)
      .single();
    creativeProfile = profile?.creative_profile || null;
  }

  return NextResponse.json({
    displayName: student.display_name,
    avatar: student.avatar,
    sessionTitle: session.title,
    level: session.level,
    responses: totalResponses,
    retained,
    impactRate,
    creativeProfile,
    personnage: personnageRes.data || null,
    achievements: (achievementsRes.data || []).map(
      (a: { achievement_key: string }) => a.achievement_key
    ),
    date: session.created_at,
  });
}
