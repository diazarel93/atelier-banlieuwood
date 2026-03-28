import { NextRequest, NextResponse } from "next/server";
import { isValidUUID } from "@/lib/api-utils";
import { getCineStimulus, type CineStimulus } from "@/lib/module11-data";
import { getStudentTeam } from "./shared";
import type { AdminClient } from "./types";

// ── MODULE 11 handler — Ciné-Débat ──
// Standard Q&A enriched with stimulus data (author, video, poster, debat)
export async function handleModule11(
  req: NextRequest,
  session: Record<string, unknown>,
  sessionId: string,
  admin: AdminClient,
) {
  const currentSeance = (session.current_seance as number) || 1;
  const currentIndex = (session.current_situation_index as number) || 0;
  const position = currentIndex + 1;

  const studentId = req.nextUrl.searchParams.get("studentId");
  if (studentId && !isValidUUID(studentId)) {
    return NextResponse.json({ error: "studentId invalide" }, { status: 400 });
  }

  const { count: connectedCount } = await admin
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("is_active", true);

  const m11Team = await getStudentTeam(admin, studentId, sessionId);

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

  // Fetch situation from DB
  const { data: variants } = await admin
    .from("situations")
    .select("*")
    .eq("module", 11)
    .eq("seance", currentSeance)
    .eq("position", position);

  let situation = variants?.[0] || null;
  if (variants && variants.length > 1) {
    const hash = sessionId.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const variantIndex = (hash + currentIndex) % variants.length;
    situation = variants[variantIndex];
  }

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

  // Enrich with stimulus data
  const stimulus: CineStimulus | undefined = getCineStimulus(currentSeance, position);
  const module11Data = stimulus
    ? {
        type: stimulus.type,
        theme: stimulus.theme,
        text: stimulus.text,
        author: stimulus.author || null,
        authorRole: stimulus.authorRole || null,
        authorBio: stimulus.authorBio || null,
        authorImageUrl: stimulus.authorImageUrl || null,
        filmography: stimulus.filmography || null,
        imageUrl: stimulus.imageUrl || null,
        videoId: stimulus.videoId || null,
        videoStart: stimulus.videoStart ?? null,
        videoEnd: stimulus.videoEnd ?? null,
        sourceTitle: stimulus.sourceTitle || null,
        sourceYear: stimulus.sourceYear || null,
        debatOptions:
          stimulus.type === "debat"
            ? [
                { key: "daccord", label: "D'accord" },
                { key: "pasdaccord", label: "Pas d'accord" },
                { key: "nuance", label: "C'est plus nuancé" },
              ]
            : null,
      }
    : null;

  let hasResponded = false;
  let teacherNudge: string | null = null;
  let studentWarnings = 0;
  let studentKicked = false;
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

  let voteOptions: { id: string; text: string }[] = [];
  let hasVoted = false;
  if (session.status === "voting" && situation) {
    const { data: responses } = await admin
      .from("responses")
      .select("id, text")
      .eq("session_id", sessionId)
      .eq("situation_id", situation.id)
      .eq("is_hidden", false)
      .eq("is_vote_option", true);
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
        }
      : null,
    module11: module11Data,
    hasResponded,
    hasVoted,
    voteOptions,
    collectiveChoice,
    isMyResponseChosen: !!(
      collectiveChoice &&
      studentResponseId &&
      collectiveChoice.source_response_id === studentResponseId
    ),
    connectedCount: connectedCount || 0,
    responsesCount,
    budgetStats: null,
    teacherNudge,
    studentWarnings,
    studentKicked,
    team: m11Team,
  });
}
