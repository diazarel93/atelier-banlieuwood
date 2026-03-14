import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withErrorHandler } from "@/lib/api-utils";

// GET /api/v2/notable-responses?sessionId=X
// Returns the 3 most notable responses: most voted, most creative, most divisive
export const GET = withErrorHandler<Record<string, never>>(async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId requis" }, { status: 400 });
  }

  // Auth: verify facilitator owns the session
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 403 });
  }

  const admin = createAdminClient();

  // Fetch all votes for this session
  const { data: votes } = await admin
    .from("votes")
    .select("chosen_response_id")
    .eq("session_id", sessionId);

  // Fetch all responses with student info
  const { data: responses } = await admin
    .from("responses")
    .select("id, text, ai_score, student_id, students(display_name, avatar)")
    .eq("session_id", sessionId);

  if (!responses || responses.length === 0) {
    return NextResponse.json({
      mostVoted: null,
      mostCreative: null,
      mostDivisive: null,
    });
  }

  // ── Most voted ──
  const voteCounts: Record<string, number> = {};
  for (const v of votes || []) {
    const rid = v.chosen_response_id as string;
    voteCounts[rid] = (voteCounts[rid] || 0) + 1;
  }

  const sortedByVotes = Object.entries(voteCounts)
    .sort((a, b) => b[1] - a[1]);

  let mostVoted = null;
  if (sortedByVotes.length > 0) {
    const [topId, topCount] = sortedByVotes[0];
    const resp = responses.find((r) => r.id === topId);
    if (resp && topCount > 0) {
      const student = resp.students as unknown as { display_name: string; avatar: string } | null;
      mostVoted = {
        id: resp.id,
        text: resp.text,
        studentName: student?.display_name || "Anonyme",
        avatar: student?.avatar || "",
        metric: `${topCount} vote${topCount > 1 ? "s" : ""}`,
      };
    }
  }

  // ── Most creative (highest ai_score, text > 50 chars) ──
  let mostCreative = null;
  const creative = responses
    .filter((r) => r.ai_score !== null && r.ai_score >= 4 && r.text.length > 50)
    .sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0));

  if (creative.length > 0) {
    const top = creative[0];
    // Skip if same as mostVoted
    if (!mostVoted || top.id !== mostVoted.id) {
      const student = top.students as unknown as { display_name: string; avatar: string } | null;
      mostCreative = {
        id: top.id,
        text: top.text,
        studentName: student?.display_name || "Anonyme",
        avatar: student?.avatar || "",
        metric: `Score IA : ${top.ai_score}/5`,
      };
    }
  }

  // ── Most divisive ──
  let mostDivisive = null;
  if (sortedByVotes.length >= 2) {
    const [, firstCount] = sortedByVotes[0];
    const [secondId, secondCount] = sortedByVotes[1];
    // "divise" = 2nd response has > 60% of the top votes
    if (firstCount > 0 && secondCount / firstCount > 0.6) {
      const resp = responses.find((r) => r.id === secondId);
      if (resp) {
        const totalTop2 = firstCount + secondCount;
        const pctFirst = Math.round((firstCount / totalTop2) * 100);
        const pctSecond = Math.round((secondCount / totalTop2) * 100);
        const student = resp.students as unknown as { display_name: string; avatar: string } | null;
        mostDivisive = {
          id: resp.id,
          text: resp.text,
          studentName: student?.display_name || "Anonyme",
          avatar: student?.avatar || "",
          metric: `${pctFirst}% vs ${pctSecond}%`,
        };
      }
    }
  }

  return NextResponse.json({ mostVoted, mostCreative, mostDivisive });
});
