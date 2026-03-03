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

  // Get all votes for this situation
  const { data: votes, error } = await auth.supabase
    .from("votes")
    .select("chosen_response_id, students(display_name, avatar)")
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

  // Count votes per response
  const voteCounts: Record<string, { response: { id: string; text: string; students: unknown }; count: number; voters: { display_name: string; avatar: string }[] }> = {};

  for (const r of responses || []) {
    voteCounts[r.id] = { response: { id: r.id, text: r.text, students: r.students }, count: 0, voters: [] };
  }

  for (const v of votes || []) {
    const rid = v.chosen_response_id as string;
    if (voteCounts[rid]) {
      voteCounts[rid].count++;
      const student = v.students as unknown as { display_name: string; avatar: string } | null;
      if (student) voteCounts[rid].voters.push(student);
    }
  }

  // Sort by vote count descending
  const results = Object.values(voteCounts).sort((a, b) => b.count - a.count);

  return NextResponse.json({
    totalVotes: votes?.length || 0,
    results,
  });
}
