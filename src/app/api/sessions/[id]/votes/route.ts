import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator, isValidUUID } from "@/lib/api-utils";

// GET — vote results for a situation (facilitator only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const situationId = req.nextUrl.searchParams.get("situationId");

  if (!situationId) {
    return NextResponse.json({ error: "situationId requis" }, { status: 400 });
  }
  if (!isValidUUID(situationId)) {
    return NextResponse.json({ error: "situationId invalide" }, { status: 400 });
  }

  // Get all votes for this situation with team info
  const { data: votes, error } = await auth.supabase
    .from("votes")
    .select("chosen_response_id, students(display_name, avatar, team_id)")
    .eq("session_id", sessionId)
    .eq("situation_id", situationId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get all responses to match with votes
  const { data: responses } = await auth.supabase
    .from("responses")
    .select("id, text, students(display_name, avatar)")
    .eq("session_id", sessionId)
    .eq("situation_id", situationId);

  // Get teams for this session to resolve team names
  const { data: teams } = await auth.supabase
    .from("teams")
    .select("id, team_name, team_color")
    .eq("session_id", sessionId);

  const teamMap = new Map((teams || []).map((t) => [t.id, { team_name: t.team_name, team_color: t.team_color }]));

  // Count votes per response
  const voteCounts: Record<string, {
    response: { id: string; text: string; students: unknown };
    count: number;
    voters: { display_name: string; avatar: string; team_name?: string; team_color?: string }[];
  }> = {};

  for (const r of responses || []) {
    voteCounts[r.id] = { response: { id: r.id, text: r.text, students: r.students }, count: 0, voters: [] };
  }

  for (const v of votes || []) {
    const rid = v.chosen_response_id as string;
    if (voteCounts[rid]) {
      voteCounts[rid].count++;
      const student = v.students as unknown as { display_name: string; avatar: string; team_id?: string } | null;
      if (student) {
        const team = student.team_id ? teamMap.get(student.team_id) : null;
        voteCounts[rid].voters.push({
          display_name: student.display_name,
          avatar: student.avatar,
          ...(team ? { team_name: team.team_name, team_color: team.team_color } : {}),
        });
      }
    }
  }

  // Sort by vote count descending
  const results = Object.values(voteCounts).sort((a, b) => b.count - a.count);

  return NextResponse.json({
    totalVotes: votes?.length || 0,
    results,
  });
}
