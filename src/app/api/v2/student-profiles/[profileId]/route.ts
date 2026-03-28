import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isValidUUID, withErrorHandler, safeJson } from "@/lib/api-utils";

/**
 * GET /api/v2/student-profiles/[profileId]
 * Full student profile: info, scores, session history, responses, tags, portfolio, achievements, notes.
 */
export const GET = withErrorHandler<{ profileId: string }>(async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params;
  if (!isValidUUID(profileId)) {
    return NextResponse.json({ error: "profileId invalide" }, { status: 400 });
  }
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Get all sessions for this facilitator
  const { data: facSessions } = await supabase
    .from("sessions")
    .select("id, title, class_label, created_at")
    .eq("facilitator_id", user.id);

  if (!facSessions || facSessions.length === 0) {
    return NextResponse.json({ error: "Aucune séance trouvée" }, { status: 404 });
  }

  const facSessionIds = facSessions.map((s) => s.id);

  // Find students matching this profileId (could be profile_id or student id)
  const { data: students } = await supabase
    .from("students")
    .select("id, display_name, avatar, profile_id, session_id, joined_at, creative_profile, total_xp")
    .in("session_id", facSessionIds)
    .or(`profile_id.eq.${profileId},id.eq.${profileId}`);

  if (!students || students.length === 0) {
    return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
  }

  const studentIds = students.map((s) => s.id);
  const student = students.sort((a, b) =>
    (b.joined_at || "").localeCompare(a.joined_at || "")
  )[0];

  // ── Parallel queries ──
  const [
    scoresRes,
    responsesRes,
    responseCountRes,
    tagsRes,
    personnageRes,
    pitchRes,
    talentRes,
    roleRes,
    reactionsRes,
    achievementsRes,
    notesRes,
  ] = await Promise.all([
    // OIE scores removed — return empty array to preserve shape
    Promise.resolve({ data: [], error: null }),

    // Recent responses (last 30 with full data)
    supabase
      .from("responses")
      .select("id, situation_id, text, ai_score, response_time_ms, teacher_score, teacher_flag, is_highlighted, submitted_at, situations(category, restitution_label)")
      .in("student_id", studentIds)
      .order("submitted_at", { ascending: false })
      .limit(30),

    // Total response count (separate query, no limit)
    supabase
      .from("responses")
      .select("id", { count: "exact", head: true })
      .in("student_id", studentIds),

    // Facilitator tags across all sessions
    supabase
      .from("facilitator_tags")
      .select("tag, session_id, created_at")
      .in("student_id", studentIds)
      .in("session_id", facSessionIds),

    // M10 personnage (latest)
    supabase
      .from("module10_personnages")
      .select("prenom, trait_dominant, force, faiblesse, avatar_data, submitted_at")
      .in("student_id", studentIds)
      .order("submitted_at", { ascending: false })
      .limit(1),

    // M10 pitch (latest)
    supabase
      .from("module10_pitchs")
      .select("objectif, obstacle, pitch_text, chrono_seconds, submitted_at")
      .in("student_id", studentIds)
      .order("submitted_at", { ascending: false })
      .limit(1),

    // M8 talent card (latest)
    supabase
      .from("module8_talent_cards")
      .select("talent_category, strengths, role_key, generated_at")
      .in("student_id", studentIds)
      .order("generated_at", { ascending: false })
      .limit(1),

    // M8 role (latest)
    supabase
      .from("module8_roles")
      .select("role_key, is_veto, chosen_at")
      .in("student_id", studentIds)
      .order("chosen_at", { ascending: false })
      .limit(1),

    // Reaction counts received on this student's responses
    supabase
      .from("response_reactions")
      .select("emoji")
      .in("session_id", facSessionIds),

    // Achievements
    supabase
      .from("student_achievements")
      .select("achievement_id, tier, progress, unlocked_at")
      .in("profile_id", [profileId]),

    // Teacher notes
    supabase
      .from("student_notes")
      .select("id, note_type, content, session_id, created_at")
      .eq("profile_id", profileId)
      .eq("facilitator_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const responses = responsesRes.data || [];
  const totalResponseCount = responseCountRes.count ?? responses.length;
  const tags = tagsRes.data || [];

  // OIE scoring removed — sessionHistory is empty
  const sessionHistory: {
    sessionId: string;
    sessionTitle: string;
    classLabel: string | null;
    date: string;
    scores: { comprehension: number; creativite: number; expression: number; engagement: number };
  }[] = [];

  // ── Situation labels for responses ──
  const recentResponses = responses.map((r) => {
    const sit = r.situations as unknown as { category: string; restitution_label: string } | null;
    return {
      id: r.id,
      situationLabel: sit?.restitution_label || sit?.category || "Question",
      textResponse: r.text,
      aiScore: r.ai_score,
      teacherScore: r.teacher_score,
      teacherFlag: r.teacher_flag,
      isHighlighted: r.is_highlighted,
      responseTimeMs: r.response_time_ms,
      createdAt: r.submitted_at,
    };
  });

  // ── Facilitator tags aggregated ──
  const tagCounts: Record<string, number> = {};
  for (const t of tags) {
    tagCounts[t.tag] = (tagCounts[t.tag] || 0) + 1;
  }
  const facilitatorTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  // ── Module portfolio ──
  const personnage = personnageRes.data?.[0] || null;
  const pitch = pitchRes.data?.[0] || null;
  const talentCard = talentRes.data?.[0] || null;
  const filmRole = roleRes.data?.[0] || null;

  const portfolio = {
    personnage: personnage
      ? {
          prenom: personnage.prenom,
          traitDominant: personnage.trait_dominant,
          force: personnage.force,
          faiblesse: personnage.faiblesse,
          avatarData: personnage.avatar_data,
        }
      : null,
    pitch: pitch
      ? {
          objectif: pitch.objectif,
          obstacle: pitch.obstacle,
          pitchText: pitch.pitch_text,
          chronoSeconds: pitch.chrono_seconds,
        }
      : null,
    talentCard: talentCard
      ? {
          talentCategory: talentCard.talent_category,
          strengths: talentCard.strengths,
          roleKey: talentCard.role_key,
        }
      : null,
    filmRole: filmRole
      ? {
          roleKey: filmRole.role_key,
          isVeto: filmRole.is_veto,
        }
      : null,
  };

  // ── Achievements ──
  const achievements = (achievementsRes.data || []).map((a) => ({
    id: a.achievement_id,
    name: a.achievement_id,
    tier: a.tier || "bronze",
    progress: a.progress || 0,
    unlockedAt: a.unlocked_at,
  }));

  // OIE scoring removed — aggregate scores are zeroed
  const aggregateScores = {
    comprehension: 0,
    creativite: 0,
    expression: 0,
    engagement: 0,
  };

  // OIE scoring removed — no deltas
  const deltas: Record<string, number> | null = null;

  // ── Average ai_score across all responses ──
  const aiScores = responses.filter((r) => r.ai_score !== null).map((r) => r.ai_score as number);
  const avgAiScore = aiScores.length > 0
    ? Math.round((aiScores.reduce((a, b) => a + b, 0) / aiScores.length) * 10) / 10
    : null;

  // ── Average response time ──
  const responseTimes = responses.filter((r) => r.response_time_ms !== null).map((r) => r.response_time_ms as number);
  const avgResponseTimeMs = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : null;

  return NextResponse.json({
    profileId,
    displayName: student.display_name,
    avatar: student.avatar,
    creativeProfile: student.creative_profile || null,
    totalXp: student.total_xp || 0,
    sessionCount: students.length,
    totalResponses: totalResponseCount,
    scores: aggregateScores,
    deltas,
    avgAiScore,
    avgResponseTimeMs,
    sessionHistory,
    recentResponses,
    facilitatorTags,
    portfolio,
    achievements,
    notes: notesRes.data || [],
  });
});

/**
 * PATCH /api/v2/student-profiles/[profileId]
 * Update student display_name. The teacher must own at least one session the student belongs to.
 * Body: { displayName: string }
 */
export const PATCH = withErrorHandler<{ profileId: string }>(async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params;
  if (!isValidUUID(profileId)) {
    return NextResponse.json({ error: "profileId invalide" }, { status: 400 });
  }

  const parsed = await safeJson<{ displayName: string }>(req);
  if ("error" in parsed) return parsed.error;
  const { displayName } = parsed.data;

  if (!displayName || typeof displayName !== "string" || displayName.trim().length === 0) {
    return NextResponse.json({ error: "displayName requis" }, { status: 400 });
  }

  const trimmedName = displayName.trim().slice(0, 100);

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  // Get facilitator sessions to verify ownership
  const { data: facSessions } = await supabase
    .from("sessions")
    .select("id")
    .eq("facilitator_id", user.id);

  if (!facSessions || facSessions.length === 0) {
    return NextResponse.json({ error: "Aucune seance trouvee" }, { status: 404 });
  }

  const facSessionIds = facSessions.map((s) => s.id);

  // Find all student rows for this profile in facilitator's sessions
  const { data: students } = await supabase
    .from("students")
    .select("id, session_id")
    .in("session_id", facSessionIds)
    .or(`profile_id.eq.${profileId},id.eq.${profileId}`);

  if (!students || students.length === 0) {
    return NextResponse.json({ error: "Eleve introuvable" }, { status: 404 });
  }

  // Update display_name on all matching student rows
  const studentIds = students.map((s) => s.id);
  const { error: updateError } = await supabase
    .from("students")
    .update({ display_name: trimmedName })
    .in("id", studentIds);

  if (updateError) {
    console.error("[PATCH student-profiles] update error:", updateError);
    return NextResponse.json({ error: "Erreur lors de la mise a jour" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, displayName: trimmedName });
});
