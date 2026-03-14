import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { XP_RESPOND, XP_VOTE, XP_RETAINED } from "@/lib/xp";
import { withErrorHandler } from "@/lib/api-utils";

// GET — session leaderboard (collective badges, not competitive ranking)
export const GET = withErrorHandler(async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const supabase = await createServerSupabase();

  // Count responses per student
  const { data: responses } = await supabase
    .from("responses")
    .select("student_id")
    .eq("session_id", sessionId);

  // Count votes per student
  const { data: votes } = await supabase
    .from("votes")
    .select("student_id")
    .eq("session_id", sessionId);

  // Get collective choices to see which students' responses were retained
  const { data: choices } = await supabase
    .from("collective_choices")
    .select("chosen_response_id")
    .eq("session_id", sessionId);

  const chosenIds = new Set((choices || []).map((c) => c.chosen_response_id).filter(Boolean));

  // Get retained responses (responses that became collective choices)
  const { data: retainedResponses } = chosenIds.size > 0
    ? await supabase
        .from("responses")
        .select("student_id")
        .eq("session_id", sessionId)
        .in("id", Array.from(chosenIds))
    : { data: [] };

  // Get students
  const { data: students } = await supabase
    .from("students")
    .select("id, display_name, avatar")
    .eq("session_id", sessionId)
    .eq("kicked", false);

  // Aggregate
  const responseCounts: Record<string, number> = {};
  const voteCounts: Record<string, number> = {};
  const retainedCounts: Record<string, number> = {};

  for (const r of responses || []) {
    responseCounts[r.student_id] = (responseCounts[r.student_id] || 0) + 1;
  }
  for (const v of votes || []) {
    voteCounts[v.student_id] = (voteCounts[v.student_id] || 0) + 1;
  }
  for (const r of retainedResponses || []) {
    retainedCounts[r.student_id] = (retainedCounts[r.student_id] || 0) + 1;
  }

  // Build leaderboard entries with XP
  const entries = (students || []).map((s) => {
    const r = responseCounts[s.id] || 0;
    const v = voteCounts[s.id] || 0;
    const ret = retainedCounts[s.id] || 0;
    const xp = r * XP_RESPOND + v * XP_VOTE + ret * XP_RETAINED;
    return {
      id: s.id,
      displayName: s.display_name,
      avatar: s.avatar,
      responses: r,
      votes: v,
      retained: ret,
      xp,
    };
  });

  // Update total_xp on students (fire-and-forget)
  for (const e of entries) {
    if (e.xp > 0) {
      supabase
        .from("students")
        .update({ total_xp: e.xp })
        .eq("id", e.id)
        .then(() => {});
    }
  }

  // Collective badges
  const totalResponses = (responses || []).length;
  const totalVotes = (votes || []).length;
  const totalRetained = (choices || []).length;
  const participantCount = (students || []).length;

  const badges = [];
  if (totalResponses >= participantCount * 5) badges.push({ id: "prolific", label: "Prolifiques", description: "5+ réponses par personne en moyenne" });
  if (totalVotes >= participantCount * 3) badges.push({ id: "democratic", label: "Démocrates", description: "3+ votes par personne en moyenne" });
  if (totalRetained >= 10) badges.push({ id: "storytellers", label: "Conteurs", description: "10+ choix collectifs construits" });
  if (participantCount >= 15) badges.push({ id: "blockbuster", label: "Blockbuster", description: "15+ participants dans la session" });
  if (entries.every((e) => e.responses > 0)) badges.push({ id: "full-cast", label: "Casting complet", description: "Tout le monde a participé" });

  return NextResponse.json({
    entries: entries.sort((a, b) => b.xp - a.xp || b.retained - a.retained || b.responses - a.responses),
    badges,
    totals: { responses: totalResponses, votes: totalVotes, retained: totalRetained, participants: participantCount },
  });
});
