import { NextRequest, NextResponse } from "next/server";
import { isValidUUID } from "@/lib/api-utils";
import { MANCHES } from "@/lib/module12-data";
import { getStudentTeam } from "./shared";
import type { AdminClient } from "./types";

// ── MODULE 12 handler — Construction Collective (8 manches de vote) ──
export async function handleModule12(
  req: NextRequest,
  session: Record<string, unknown>,
  sessionId: string,
  admin: AdminClient,
) {
  const currentIndex = (session.current_situation_index as number) || 0;
  const manche = currentIndex + 1; // 1-8

  const studentId = req.nextUrl.searchParams.get("studentId");
  if (studentId && !isValidUUID(studentId)) {
    return NextResponse.json({ error: "studentId invalide" }, { status: 400 });
  }

  const { count: connectedCount } = await admin
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("is_active", true);

  const m12Team = await getStudentTeam(admin, studentId, sessionId);

  const sessionBase = {
    id: session.id,
    status: session.status,
    currentModule: session.current_module,
    currentSeance: session.current_seance,
    currentSituationIndex: session.current_situation_index,
    level: session.level,
    title: session.title,
    joinCode: session.join_code,
    template: (session.template as string) || null,
    timerEndsAt: (session.timer_ends_at as string) || null,
    mode: (session.mode as string) || "guided",
    sharingEnabled: (session.sharing_enabled as boolean) || false,
    broadcastMessage: (session.broadcast_message as string) || null,
    broadcastAt: (session.broadcast_at as string) || null,
    muteSounds: (session.mute_sounds as boolean) ?? false,
    revealPhase: (session.reveal_phase as string) ?? null,
  };

  // Fetch pool for current manche
  const { data: pool } = await admin
    .from("module12_pools")
    .select("cards")
    .eq("session_id", sessionId)
    .eq("manche", manche)
    .single();

  const poolReady = !!pool;
  const rawCards = (pool?.cards || []) as {
    cardId: string;
    text: string;
    isBanlieuwood: boolean;
    contributorIds: string[];
  }[];

  // Strip contributorIds for student view (anonymous cards)
  const cards = rawCards.map((c) => ({
    cardId: c.cardId,
    text: c.text,
    isBanlieuwood: c.isBanlieuwood,
  }));

  // Get student's vote for this manche
  let studentVote: string | null = null;
  if (studentId) {
    const { data: vote } = await admin
      .from("module12_votes")
      .select("card_id")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .eq("manche", manche)
      .single();
    studentVote = vote?.card_id || null;
  }

  // Get vote counts (facilitator only — determined by absence of studentId)
  let voteCounts: Record<string, number> | null = null;
  if (!studentId) {
    const { data: votes } = await admin
      .from("module12_votes")
      .select("card_id")
      .eq("session_id", sessionId)
      .eq("manche", manche);
    voteCounts = {};
    for (const v of votes || []) {
      voteCounts[v.card_id] = (voteCounts[v.card_id] || 0) + 1;
    }
  }

  // Get winner for this manche
  const { data: winner } = await admin
    .from("module12_winners")
    .select("card_id, winning_text")
    .eq("session_id", sessionId)
    .eq("manche", manche)
    .single();

  // Get all winners (for progress display)
  const { data: allWinnersData } = await admin
    .from("module12_winners")
    .select("manche, winning_text")
    .eq("session_id", sessionId)
    .order("manche");

  const allWinners = (allWinnersData || []).map((w: { manche: number; winning_text: string }) => ({
    manche: w.manche,
    text: w.winning_text,
  }));

  const mancheConfig = MANCHES[manche - 1];

  // Student warnings/kicked
  let studentWarnings = 0;
  let studentKicked = false;
  if (studentId) {
    const { data: student } = await admin
      .from("students")
      .select("warnings, kicked")
      .eq("id", studentId)
      .eq("session_id", sessionId)
      .single();
    studentWarnings = student?.warnings || 0;
    studentKicked = student?.kicked || false;
  }

  // Fetch the situation from DB for consistency
  const { data: situation } = await admin
    .from("situations")
    .select("*")
    .eq("module", 12)
    .eq("seance", 1)
    .eq("position", manche)
    .single();

  const levelMap: Record<string, string> = {
    primaire: "prompt_6_9",
    college: "prompt_10_13",
    lycee: "prompt_14_18",
  };
  const field = levelMap[session.level as string] || "prompt_10_13";
  const prompt = (situation?.[field as keyof typeof situation] as string) || "";

  return NextResponse.json({
    session: sessionBase,
    situation: situation
      ? {
          id: situation.id,
          position: situation.position,
          category: situation.category,
          restitutionLabel: situation.restitution_label,
          prompt,
          nudgeText: situation.nudge_text || null,
        }
      : null,
    module12: {
      type: "manche-vote" as const,
      manche,
      mancheLabel: mancheConfig?.label || `Manche ${manche}`,
      cards,
      studentVote,
      voteCounts,
      winner: winner ? { cardId: winner.card_id, text: winner.winning_text } : null,
      allWinners,
      poolReady,
    },
    hasResponded: !!studentVote,
    hasVoted: false,
    voteOptions: [],
    collectiveChoice: null,
    isMyResponseChosen: false,
    connectedCount: connectedCount || 0,
    responsesCount: 0,
    budgetStats: null,
    teacherNudge: null,
    studentWarnings,
    studentKicked,
    team: m12Team,
  });
}
