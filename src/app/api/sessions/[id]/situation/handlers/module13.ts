import { NextRequest, NextResponse } from "next/server";
import { isValidUUID } from "@/lib/api-utils";
import { POSTPROD_STEPS } from "@/lib/module13-data";
import { getStudentTeam } from "./shared";
import type { AdminClient } from "./types";

// ── MODULE 13 handler — La Post-prod (8 étapes de finalisation) ──
export async function handleModule13(
  req: NextRequest,
  session: Record<string, unknown>,
  sessionId: string,
  admin: AdminClient,
) {
  const currentIndex = (session.current_situation_index as number) || 0;
  const position = currentIndex + 1; // 1-8

  const studentId = req.nextUrl.searchParams.get("studentId");
  if (studentId && !isValidUUID(studentId)) {
    return NextResponse.json({ error: "studentId invalide" }, { status: 400 });
  }

  const { count: connectedCount } = await admin
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("is_active", true);

  const team = await getStudentTeam(admin, studentId, sessionId);

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
  const { data: situation } = await admin
    .from("situations")
    .select("*")
    .eq("module", 13)
    .eq("seance", 1)
    .eq("position", position)
    .single();

  const levelMap: Record<string, string> = {
    primaire: "prompt_6_9",
    college: "prompt_10_13",
    lycee: "prompt_14_18",
  };
  const field = levelMap[session.level as string] || "prompt_10_13";
  const prompt = (situation?.[field as keyof typeof situation] as string) || "";

  // Get all validated results so far (for progress display)
  const { data: allResultsData } = await admin
    .from("module13_results")
    .select("position, result_type, result_data")
    .eq("session_id", sessionId)
    .order("position");

  const allResults = (allResultsData || []).map(
    (r: { position: number; result_type: string; result_data: unknown }) => ({
      position: r.position,
      type: r.result_type,
      data: r.result_data,
    }),
  );

  // Build position-specific module13 data
  const stepConfig = POSTPROD_STEPS[position - 1];
  let hasSubmitted = false;
  let submittedCount = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let positionData: Record<string, any> = {};

  // ── Position 1: Montage (scene order) ──
  if (position === 1) {
    // Fetch M12 winners for scene context
    const { data: winners } = await admin
      .from("module12_winners")
      .select("manche, winning_text")
      .eq("session_id", sessionId)
      .order("manche");

    positionData.scenes = (winners || []).map((w: { manche: number; winning_text: string }) => ({
      manche: w.manche,
      text: w.winning_text,
    }));

    if (studentId) {
      const { data: montage } = await admin
        .from("module13_montages")
        .select("scene_order")
        .eq("session_id", sessionId)
        .eq("student_id", studentId)
        .single();
      hasSubmitted = !!montage;
      positionData.studentOrder = montage?.scene_order || null;
    }
    const { count } = await admin
      .from("module13_montages")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);
    submittedCount = count || 0;
  }

  // ── Position 2: Musique ──
  if (position === 2) {
    if (studentId) {
      const { data: musique } = await admin
        .from("module13_musiques")
        .select("genre, mood, justification")
        .eq("session_id", sessionId)
        .eq("student_id", studentId)
        .single();
      hasSubmitted = !!musique;
      positionData.studentChoice = musique || null;
    }
    // Facilitator: all submissions
    if (!studentId) {
      const { data: all } = await admin
        .from("module13_musiques")
        .select("genre, mood, student_id")
        .eq("session_id", sessionId);
      positionData.allChoices = all || [];
    }
    const { count } = await admin
      .from("module13_musiques")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);
    submittedCount = count || 0;
  }

  // ── Position 3: Titre ──
  if (position === 3) {
    if (studentId) {
      const { data: titre } = await admin
        .from("module13_titres")
        .select("titre")
        .eq("session_id", sessionId)
        .eq("student_id", studentId)
        .single();
      hasSubmitted = !!titre;
      positionData.studentTitre = titre?.titre || null;
    }
    if (!studentId) {
      const { data: all } = await admin.from("module13_titres").select("titre, student_id").eq("session_id", sessionId);
      positionData.allTitres = all || [];
    }
    const { count } = await admin
      .from("module13_titres")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);
    submittedCount = count || 0;
  }

  // ── Position 4: Affiche ──
  if (position === 4) {
    if (studentId) {
      const { data: affiche } = await admin
        .from("module13_affiches")
        .select("style, description, tagline")
        .eq("session_id", sessionId)
        .eq("student_id", studentId)
        .single();
      hasSubmitted = !!affiche;
      positionData.studentAffiche = affiche || null;
    }
    if (!studentId) {
      const { data: all } = await admin
        .from("module13_affiches")
        .select("style, description, tagline, student_id")
        .eq("session_id", sessionId);
      positionData.allAffiches = all || [];
    }
    const { count } = await admin
      .from("module13_affiches")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);
    submittedCount = count || 0;
  }

  // ── Position 5: Bande-annonce ──
  if (position === 5) {
    // Provide M12 winners as "moments" source
    const { data: winners } = await admin
      .from("module12_winners")
      .select("manche, winning_text")
      .eq("session_id", sessionId)
      .order("manche");
    positionData.availableMoments = (winners || []).map((w: { manche: number; winning_text: string }) => ({
      manche: w.manche,
      text: w.winning_text,
    }));

    if (studentId) {
      const { data: trailer } = await admin
        .from("module13_trailers")
        .select("moments, voix_off")
        .eq("session_id", sessionId)
        .eq("student_id", studentId)
        .single();
      hasSubmitted = !!trailer;
      positionData.studentTrailer = trailer || null;
    }
    const { count } = await admin
      .from("module13_trailers")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);
    submittedCount = count || 0;
  }

  // ── Positions 6-8: Use standard Q&A (credits, critique, projection) ──
  if (position >= 6) {
    // These use the regular responses table like standard situations
    if (studentId && situation) {
      const { data: response } = await admin
        .from("responses")
        .select("id")
        .eq("session_id", sessionId)
        .eq("student_id", studentId)
        .eq("situation_id", situation.id)
        .is("reset_at", null)
        .single();
      hasSubmitted = !!response;
    }
    if (situation) {
      const { count } = await admin
        .from("responses")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId)
        .eq("situation_id", situation.id)
        .is("reset_at", null);
      submittedCount = count || 0;
    }
    // Mark that positions 6-8 use standard Q&A
    positionData.useStandardQA = true;
  }

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
    module13: {
      position,
      stepKey: stepConfig?.key || `step-${position}`,
      stepLabel: stepConfig?.label || `Étape ${position}`,
      stepEmoji: stepConfig?.emoji || "🎬",
      stepDescription: stepConfig?.description || "",
      hasSubmitted,
      submittedCount,
      allResults,
      ...positionData,
    },
    hasResponded: hasSubmitted,
    hasVoted: false,
    voteOptions: [],
    collectiveChoice: null,
    isMyResponseChosen: false,
    connectedCount: connectedCount || 0,
    responsesCount: submittedCount,
    budgetStats: null,
    teacherNudge: null,
    studentWarnings,
    studentKicked,
    team,
  });
}
