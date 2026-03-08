import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rankStudents, generateTalentCard } from "@/lib/module-equipe-data";

// POST — Facilitateur computes points & rankings for M8
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const admin = createAdminClient();

  // Verify session exists
  const { data: session, error: sessionError } = await admin
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // Get active students
  const { data: students } = await admin
    .from("students")
    .select("id, display_name")
    .eq("session_id", sessionId)
    .eq("is_active", true);

  if (!students || students.length === 0) {
    return NextResponse.json({ error: "Aucun élève actif" }, { status: 400 });
  }

  // Count responses per student (participation)
  const { data: responses } = await admin
    .from("responses")
    .select("student_id")
    .eq("session_id", sessionId)
    .is("reset_at", null);

  const responseCounts: Record<string, number> = {};
  for (const r of responses || []) {
    responseCounts[r.student_id] = (responseCounts[r.student_id] || 0) + 1;
  }

  // Count creative contributions (M10: etsi + personnages + pitchs + idea bank)
  const { data: etsi } = await admin
    .from("module10_etsi")
    .select("student_id")
    .eq("session_id", sessionId);

  const { data: personnages } = await admin
    .from("module10_personnages")
    .select("student_id")
    .eq("session_id", sessionId);

  const { data: pitchs } = await admin
    .from("module10_pitchs")
    .select("student_id")
    .eq("session_id", sessionId);

  // Adrian: "le carnet d'idées a un poids important" — count idea bank contributions
  const { data: ideaBank } = await admin
    .from("module10_idea_bank")
    .select("student_id")
    .eq("session_id", sessionId);

  const creativityCounts: Record<string, number> = {};
  for (const item of [...(etsi || []), ...(personnages || []), ...(pitchs || [])]) {
    creativityCounts[item.student_id] = (creativityCounts[item.student_id] || 0) + 1;
  }
  // Idea bank contributions count double (Adrian: "poids important")
  for (const item of ideaBank || []) {
    creativityCounts[item.student_id] = (creativityCounts[item.student_id] || 0) + 2;
  }

  // Count M6 missions done (engagement)
  const { data: missions } = await admin
    .from("module6_missions")
    .select("student_id, status")
    .eq("session_id", sessionId);

  const engagementCounts: Record<string, number> = {};
  for (const m of missions || []) {
    if (m.status === "done") {
      engagementCounts[m.student_id] = (engagementCounts[m.student_id] || 0) + 1;
    }
  }

  // Count M12 votes (additional engagement)
  const { data: votes } = await admin
    .from("module12_votes")
    .select("student_id")
    .eq("session_id", sessionId);

  for (const v of votes || []) {
    engagementCounts[v.student_id] = (engagementCounts[v.student_id] || 0) + 1;
  }

  // Adrian: "observations de l'intervenant" — facilitator tags feed into engagement
  const { data: tags } = await admin
    .from("facilitator_tags")
    .select("student_id, tag")
    .eq("session_id", sessionId);

  // Positive tags add points, negative tags are neutral (no penalty — Adrian: "pas de punition")
  const POSITIVE_TAGS = new Set([
    "tres_creatif", "force_de_proposition", "bonne_ecoute",
    "tres_investi", "bonne_cooperation", "leadership",
  ]);
  for (const t of tags || []) {
    if (POSITIVE_TAGS.has(t.tag)) {
      engagementCounts[t.student_id] = (engagementCounts[t.student_id] || 0) + 2;
    }
  }

  // Normalize scores (max 10 per category)
  const maxResponses = Math.max(1, ...Object.values(responseCounts), 1);
  const maxCreativity = Math.max(1, ...Object.values(creativityCounts), 1);
  const maxEngagement = Math.max(1, ...Object.values(engagementCounts), 1);

  const points = students.map((s: { id: string }) => ({
    studentId: s.id,
    participationScore: Math.round(((responseCounts[s.id] || 0) / maxResponses) * 10),
    creativityScore: Math.round(((creativityCounts[s.id] || 0) / maxCreativity) * 10),
    engagementScore: Math.round(((engagementCounts[s.id] || 0) / maxEngagement) * 10),
  }));

  // Rank
  const ranked = rankStudents(points);

  // Upsert points into DB
  for (const p of ranked) {
    await admin.from("module8_points").upsert(
      {
        session_id: sessionId,
        student_id: p.studentId,
        participation_score: p.participationScore,
        creativity_score: p.creativityScore,
        engagement_score: p.engagementScore,
        rank: p.rank,
      },
      { onConflict: "session_id,student_id" }
    );
  }

  // Return ranking to facilitator
  const nameMap: Record<string, string> = {};
  for (const s of students) {
    nameMap[s.id] = s.display_name;
  }

  return NextResponse.json({
    success: true,
    ranking: ranked.map((p) => ({
      studentId: p.studentId,
      displayName: nameMap[p.studentId] || "Élève",
      participation: p.participationScore,
      creativity: p.creativityScore,
      engagement: p.engagementScore,
      total: p.total,
      rank: p.rank,
    })),
  });
}

// POST to /equipe-compute/talent-cards — generate talent cards after roles are assigned
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const admin = createAdminClient();

  // Get all roles assigned
  const { data: roles } = await admin
    .from("module8_roles")
    .select("student_id, role_key")
    .eq("session_id", sessionId);

  if (!roles || roles.length === 0) {
    return NextResponse.json({ error: "Aucun rôle assigné" }, { status: 400 });
  }

  // Get points for each student
  const { data: points } = await admin
    .from("module8_points")
    .select("student_id, participation_score, creativity_score, engagement_score")
    .eq("session_id", sessionId);

  const pointsMap: Record<string, { participationScore: number; creativityScore: number; engagementScore: number }> = {};
  for (const p of points || []) {
    pointsMap[p.student_id] = {
      participationScore: p.participation_score,
      creativityScore: p.creativity_score,
      engagementScore: p.engagement_score,
    };
  }

  // Generate and insert talent cards
  let count = 0;
  for (const role of roles) {
    const scores = pointsMap[role.student_id] || { participationScore: 5, creativityScore: 5, engagementScore: 5 };
    const card = generateTalentCard(
      { id: role.student_id },
      scores,
      role.role_key
    );

    await admin.from("module8_talent_cards").upsert(
      {
        session_id: sessionId,
        student_id: role.student_id,
        talent_category: card.talentCategory,
        strengths: card.strengths,
        role_key: card.roleKey,
      },
      { onConflict: "session_id,student_id" }
    );
    count++;
  }

  return NextResponse.json({ success: true, cardsGenerated: count });
}
