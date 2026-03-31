import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { withErrorHandler } from "@/lib/api-utils";

// Competency categories derived from narrative categories
const COMPETENCIES: Record<string, { label: string; description: string }> = {
  personnage: { label: "Caractérisation", description: "Créer des personnages crédibles et nuancés" },
  liens: { label: "Relations", description: "Construire des liens et des dynamiques entre personnages" },
  environnement: { label: "Mise en scène", description: "Imaginer des lieux et des ambiances évocateurs" },
  conflit: { label: "Dramaturgie", description: "Créer de la tension et des obstacles narratifs" },
  trajectoire: { label: "Structure narrative", description: "Construire un arc avec progression et résolution" },
  intention: { label: "Sens et thématique", description: "Donner du sens et une intention à l'histoire" },
  renforcement: { label: "Cohérence", description: "Renforcer et relier les éléments entre eux" },
};

interface ResponseRow {
  id: string;
  student_id: string;
  text: string;
  is_hidden: boolean;
  situations: {
    category: string;
    position: number;
    restitution_label: string;
  };
}

// GET — generate educational feedback for a session
export const GET = withErrorHandler(async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Get session
  const { data: session } = await supabase
    .from("sessions")
    .select("id, title, level, template")
    .eq("id", sessionId)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // Get all responses with situation data
  const { data: responses } = (await supabase
    .from("responses")
    .select("id, student_id, text, is_hidden, situations(category, position, restitution_label)")
    .eq("session_id", sessionId)) as { data: ResponseRow[] | null };

  // Get students
  const { data: students } = await supabase
    .from("students")
    .select("id, display_name, avatar")
    .eq("session_id", sessionId);

  // Get votes
  const { data: votes } = await supabase
    .from("votes")
    .select("student_id, chosen_response_id")
    .eq("session_id", sessionId);

  // Get collective choices
  const { data: choices } = await supabase
    .from("collective_choices")
    .select("id, situation_id, chosen_text, source_response_id")
    .eq("session_id", sessionId);

  const allResponses = responses || [];
  const visibleResponses = allResponses.filter((r) => !r.is_hidden);
  const allStudents = students || [];
  const allVotes = votes || [];
  const allChoices = choices || [];

  // ——— PARTICIPATION STATS ———
  const participationByStudent = new Map<string, number>();
  for (const r of visibleResponses) {
    participationByStudent.set(r.student_id, (participationByStudent.get(r.student_id) || 0) + 1);
  }

  const avgResponseLength =
    visibleResponses.length > 0
      ? Math.round(visibleResponses.reduce((sum, r) => sum + r.text.length, 0) / visibleResponses.length)
      : 0;

  const participationRate =
    allStudents.length > 0 ? Math.round((participationByStudent.size / allStudents.length) * 100) : 0;

  // ——— COMPETENCY ANALYSIS ———
  const categoryResponseCounts = new Map<string, number>();
  const categoryTextLengths = new Map<string, number[]>();

  for (const r of visibleResponses) {
    const cat = r.situations?.category;
    if (!cat) continue;
    categoryResponseCounts.set(cat, (categoryResponseCounts.get(cat) || 0) + 1);
    if (!categoryTextLengths.has(cat)) categoryTextLengths.set(cat, []);
    categoryTextLengths.get(cat)!.push(r.text.length);
  }

  const competencyScores: { key: string; label: string; description: string; score: number; detail: string }[] = [];

  for (const [key, comp] of Object.entries(COMPETENCIES)) {
    const count = categoryResponseCounts.get(key) || 0;
    const lengths = categoryTextLengths.get(key) || [];
    const avgLen = lengths.length > 0 ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : 0;

    // Score: 0-100 based on response count + average length
    let score = 0;
    if (count > 0) {
      score = Math.min(
        100,
        Math.round(
          (Math.min(count, 10) / 10) * 50 + // 50% from participation
            (Math.min(avgLen, 200) / 200) * 50, // 50% from depth
        ),
      );
    }

    let detail = "";
    if (score === 0) detail = "Pas encore exploré";
    else if (score < 30) detail = "Découverte en cours";
    else if (score < 60) detail = "Bonne exploration";
    else if (score < 80) detail = "Très bonne maîtrise";
    else detail = "Excellent !";

    competencyScores.push({ key, label: comp.label, description: comp.description, score, detail });
  }

  // ——— TOP CONTRIBUTORS ———
  const studentScores: {
    id: string;
    name: string;
    avatar: string;
    responses: number;
    avgLength: number;
    votedFor: number;
    chosenCount: number;
  }[] = [];

  for (const s of allStudents) {
    const sResponses = visibleResponses.filter((r) => r.student_id === s.id);
    const avgLen =
      sResponses.length > 0 ? Math.round(sResponses.reduce((sum, r) => sum + r.text.length, 0) / sResponses.length) : 0;
    const votedFor = allVotes.filter((v) => v.student_id === s.id).length;
    const chosenCount = allChoices.filter(
      (c) => c.source_response_id && sResponses.some((r) => r.id === c.source_response_id),
    ).length;

    studentScores.push({
      id: s.id,
      name: s.display_name,
      avatar: s.avatar,
      responses: sResponses.length,
      avgLength: avgLen,
      votedFor,
      chosenCount,
    });
  }

  // Sort by impact (chosen > responses > avgLength)
  studentScores.sort(
    (a, b) =>
      b.chosenCount * 100 + b.responses * 10 + b.avgLength - (a.chosenCount * 100 + a.responses * 10 + a.avgLength),
  );

  // ——— GROUP PROFILE ———
  const topCompetency = [...competencyScores].sort((a, b) => b.score - a.score)[0];
  const weakCompetency = [...competencyScores].sort((a, b) => a.score - b.score)[0];

  const overallScore =
    competencyScores.length > 0
      ? Math.round(competencyScores.reduce((sum, c) => sum + c.score, 0) / competencyScores.length)
      : 0;

  let groupProfile = "";
  if (overallScore >= 70) groupProfile = "Groupe très créatif avec une belle diversité d'idées";
  else if (overallScore >= 50) groupProfile = "Groupe engagé avec un bon potentiel narratif";
  else if (overallScore >= 30) groupProfile = "Groupe en apprentissage — encourage les réponses plus détaillées";
  else groupProfile = "Début de parcours — continue à explorer !";

  return NextResponse.json({
    session: { title: session.title, level: session.level, template: session.template },
    stats: {
      totalStudents: allStudents.length,
      totalResponses: visibleResponses.length,
      totalVotes: allVotes.length,
      totalChoices: allChoices.length,
      participationRate,
      avgResponseLength,
      hiddenResponses: allResponses.length - visibleResponses.length,
    },
    competencies: competencyScores,
    students: studentScores,
    groupProfile,
    overallScore,
    strengths: topCompetency
      ? {
          label: topCompetency.label,
          detail: `Point fort du groupe en ${topCompetency.label.toLowerCase()} (${topCompetency.score}%)`,
        }
      : null,
    weakness: weakCompetency
      ? {
          label: weakCompetency.label,
          detail: `Axe de progression : ${weakCompetency.label.toLowerCase()} (${weakCompetency.score}%)`,
        }
      : null,
  });
});
