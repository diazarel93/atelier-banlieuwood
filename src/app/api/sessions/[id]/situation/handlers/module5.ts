import { NextRequest, NextResponse } from "next/server";
import type { AdminClient } from "./types";

// Standard situation handler with optional module5 data
export async function handleStandardWithModule5(
  req: NextRequest,
  session: Record<string, unknown>,
  sessionId: string,
  admin: AdminClient,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sessionBase: any,
  connectedCount: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module5Data: any,
) {
  const studentId = req.nextUrl.searchParams.get("studentId");

  // Get situation by module, seance, position
  const { data: variants } = await admin
    .from("situations")
    .select("*")
    .eq("module", session.current_module)
    .eq("seance", session.current_seance)
    .eq("position", (session.current_situation_index as number) + 1);

  let situation = variants?.[0] || null;
  if (variants && variants.length > 1) {
    const hash = sessionId.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const variantIndex = (hash + (session.current_situation_index as number)) % variants.length;
    situation = variants[variantIndex];
  }

  let hasResponded = false;
  let teacherNudge: string | null = null;
  let studentResponseId: string | null = null;

  if (studentId && situation) {
    const { data: response } = await admin
      .from("responses")
      .select("id, teacher_nudge")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .eq("situation_id", situation.id)
      .is("reset_at", null)
      .single();

    hasResponded = !!response;
    teacherNudge = response?.teacher_nudge || null;
    studentResponseId = response?.id || null;
  }

  // Vote options
  let voteOptions: { id: string; text: string }[] = [];
  let hasVoted = false;

  if (session.status === "voting" && situation) {
    const { data: responses } = await admin
      .from("responses")
      .select("id, text")
      .eq("session_id", sessionId)
      .eq("situation_id", situation.id)
      .eq("is_hidden", false)
      .eq("is_vote_option", true)
      .is("reset_at", null);

    voteOptions = responses || [];

    if (studentId) {
      const { data: vote } = await admin
        .from("votes")
        .select("id")
        .eq("session_id", sessionId)
        .eq("student_id", studentId)
        .eq("situation_id", situation.id)
        .single();

      hasVoted = !!vote;
    }
  }

  // Collective choice
  let collectiveChoice = null;
  if (situation) {
    const { data: choice } = await admin
      .from("collective_choices")
      .select("*")
      .eq("session_id", sessionId)
      .eq("situation_id", situation.id)
      .single();

    collectiveChoice = choice;
  }

  // Responses count (exclude reset)
  let responsesCount = 0;
  if (situation) {
    const { count: rCount } = await admin
      .from("responses")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .eq("situation_id", situation.id)
      .is("reset_at", null);
    responsesCount = rCount || 0;
  }

  // Level prompt
  let prompt = "";
  if (situation) {
    const levelMap: Record<string, string> = {
      primaire: "prompt_6_9",
      college: "prompt_10_13",
      lycee: "prompt_14_18",
    };
    const field = levelMap[session.level as string] || "prompt_10_13";
    prompt = situation[field as keyof typeof situation] as string;
  }

  return NextResponse.json({
    session: sessionBase,
    situation: situation
      ? {
          id: situation.id,
          position: situation.position,
          category: situation.category,
          restitutionLabel: situation.restitution_label,
          prompt,
          nudgeText: situation.nudge_text,
          questionType: situation.question_type,
          options: situation.options,
        }
      : null,
    ...(module5Data ? { module5: module5Data } : {}),
    hasResponded,
    hasVoted,
    voteOptions,
    collectiveChoice,
    isMyResponseChosen: !!(collectiveChoice && studentResponseId && collectiveChoice.source_response_id === studentResponseId),
    connectedCount,
    responsesCount,
    budgetStats: null,
    teacherNudge,
  });
}
