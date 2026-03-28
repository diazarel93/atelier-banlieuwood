import { NextRequest, NextResponse } from "next/server";
import { isValidUUID } from "@/lib/api-utils";
import { getStudentTeam } from "./shared";
import type { AdminClient } from "./types";

// ── MODULE 1 handler — Redesign Adrian ──
// Handles 5 séances: positioning (QCM), 3 images, notebook
export async function handleModule1(
  req: NextRequest,
  session: Record<string, unknown>,
  sessionId: string,
  admin: AdminClient,
) {
  const currentSeance = (session.current_seance as number) || 1;
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (studentId && !isValidUUID(studentId)) {
    return NextResponse.json({ error: "studentId invalide" }, { status: 400 });
  }

  // Connected count (shared)
  const { count: connectedCount } = await admin
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("is_active", true);

  const m1Team = await getStudentTeam(admin, studentId, sessionId);

  const sessionBase = {
    id: session.id,
    status: session.status,
    currentModule: 1,
    currentSeance,
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
    revealPhase: (session.reveal_phase as string) ?? null,
  };

  // ── SÉANCE 1: Positionnement (8 QCM) ──
  if (currentSeance === 1) {
    const { data: situations } = await admin
      .from("situations")
      .select(
        "id, position, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, options, question_type",
      )
      .eq("module", 1)
      .eq("seance", 1)
      .order("position");

    const levelMap: Record<string, string> = {
      primaire: "prompt_6_9",
      college: "prompt_10_13",
      lycee: "prompt_14_18",
    };
    const promptField = levelMap[session.level as string] || "prompt_10_13";

    const questions = (situations || []).map((sit: Record<string, unknown>, i: number) => ({
      index: i + 1,
      situationId: sit.id as string,
      text: sit[promptField] as string,
      measure: sit.restitution_label as string,
      options: sit.options as { key: string; label: string }[],
    }));

    // Check which questions the student has answered + what they picked (batch query)
    const answeredQuestions: Record<number, boolean> = {};
    const answeredOptions: Record<number, string> = {};
    const sitIds = (situations || []).map((s: Record<string, unknown>) => s.id as string);
    if (studentId && sitIds.length > 0) {
      const { data: studentResponses } = await admin
        .from("responses")
        .select("situation_id, text")
        .eq("session_id", sessionId)
        .eq("student_id", studentId)
        .in("situation_id", sitIds)
        .is("reset_at", null);
      const respMap = new Map<string, string>(
        (studentResponses || []).map((r: { situation_id: string; text: string }) => [r.situation_id, r.text]),
      );
      for (let i = 0; i < sitIds.length; i++) {
        answeredQuestions[i + 1] = respMap.has(sitIds[i]);
        if (respMap.has(sitIds[i])) answeredOptions[i + 1] = respMap.get(sitIds[i])!;
      }
    }

    // Count responses per question (batch query, exclude reset)
    const responseCounts: Record<number, number> = {};
    if (sitIds.length > 0) {
      const { data: allSessionResponses } = await admin
        .from("responses")
        .select("situation_id")
        .eq("session_id", sessionId)
        .in("situation_id", sitIds)
        .is("reset_at", null);
      const countMap = new Map<string, number>();
      for (const r of (allSessionResponses || []) as { situation_id: string }[]) {
        countMap.set(r.situation_id, (countMap.get(r.situation_id) || 0) + 1);
      }
      for (let i = 0; i < sitIds.length; i++) {
        responseCounts[i + 1] = countMap.get(sitIds[i]) || 0;
      }
    }

    // Get option distribution for current question (for screen stats, exclude reset)
    const currentQIndex = (session.current_situation_index as number) || 0;
    let optionDistribution: Record<string, number> | null = null;
    if (situations && situations[currentQIndex]) {
      const { data: allResponses } = await admin
        .from("responses")
        .select("text")
        .eq("session_id", sessionId)
        .eq("situation_id", (situations[currentQIndex] as { id: string }).id)
        .is("reset_at", null);
      if (allResponses) {
        optionDistribution = {};
        for (const r of allResponses as { text: string }[]) {
          optionDistribution[r.text] = (optionDistribution[r.text] || 0) + 1;
        }
      }
    }

    return NextResponse.json({
      session: sessionBase,
      module1: {
        type: "positioning" as const,
        questions,
        answeredQuestions,
        answeredOptions,
        responseCounts,
        optionDistribution,
        totalSeances: 5,
        currentSeance,
      },
      situation: null,
      hasResponded:
        Object.values(answeredQuestions).length === (situations?.length || 8) &&
        Object.values(answeredQuestions).every(Boolean),
      hasVoted: false,
      voteOptions: [],
      collectiveChoice: null,
      connectedCount: connectedCount || 0,
      responsesCount: Object.values(responseCounts).reduce((a, b) => a + b, 0),
      budgetStats: null,
    });
  }

  // ── SÉANCE 2-4: Image questions ──
  if (currentSeance >= 2 && currentSeance <= 4) {
    const imagePosition = currentSeance - 1; // seance 2 → image 1, seance 3 → image 2, seance 4 → image 3

    // Fetch image
    const { data: image } = await admin.from("module1_images").select("*").eq("position", imagePosition).single();

    // Fetch the single situation for this séance
    const { data: situation } = await admin
      .from("situations")
      .select(
        "id, position, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text, image_position",
      )
      .eq("module", 1)
      .eq("seance", currentSeance)
      .eq("position", 1)
      .single();

    // Fetch relance
    const ageLevel = (session.level as string) || "college";
    const { data: relance } = await admin
      .from("module1_relances")
      .select("relance_text")
      .eq("image_position", imagePosition)
      .eq("question_index", 1)
      .eq("age_level", ageLevel)
      .maybeSingle();

    // Get age-appropriate prompt
    const levelMap: Record<string, string> = {
      primaire: "prompt_6_9",
      college: "prompt_10_13",
      lycee: "prompt_14_18",
    };
    const promptField = levelMap[session.level as string] || "prompt_10_13";

    // Two-phase observation for Image 2 (séance 3)
    const isTwoPhase = currentSeance === 3;

    // Check if student already responded (exclude reset)
    let hasResponded = false;
    let phase1Text: string | null = null;
    let currentPhase = 1;
    if (studentId && situation) {
      // Get all responses for this situation (for two-phase tracking)
      const { data: allStudentResp } = await admin
        .from("responses")
        .select("id, text")
        .eq("session_id", sessionId)
        .eq("student_id", studentId)
        .eq("situation_id", situation.id)
        .is("reset_at", null)
        .order("submitted_at", { ascending: true });

      const respCount = allStudentResp?.length || 0;
      if (isTwoPhase) {
        if (respCount >= 1) {
          phase1Text = allStudentResp![0].text;
          currentPhase = 2;
        }
        if (respCount >= 2) {
          hasResponded = true; // Both phases completed
        }
      } else {
        hasResponded = respCount > 0;
      }
    }

    // Responses count (exclude reset)
    let responsesCount = 0;
    if (situation) {
      const { count } = await admin
        .from("responses")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId)
        .eq("situation_id", situation.id)
        .is("reset_at", null);
      responsesCount = count || 0;
    }

    // Confrontation: if status=reviewing, fetch the 2 highlighted responses
    let confrontation: { responseA: string; responseB: string } | null = null;
    if (session.status === "reviewing" && situation) {
      const { data: highlighted } = await admin
        .from("responses")
        .select("text")
        .eq("session_id", sessionId)
        .eq("situation_id", situation.id)
        .eq("is_highlighted", true)
        .limit(2);
      if (highlighted && highlighted.length === 2) {
        confrontation = {
          responseA: highlighted[0].text,
          responseB: highlighted[1].text,
        };
      }
    }

    // Phase-specific prompt text for two-phase observation
    let questionText = situation ? (situation[promptField as keyof typeof situation] as string) : "";
    if (isTwoPhase && currentPhase === 2) {
      questionText = "Que peuvent signifier ces détails ? Qu'est-ce que cette image raconte ?";
    } else if (isTwoPhase && currentPhase === 1) {
      questionText = "Décris ce que tu vois dans cette image. Les objets, les couleurs, la lumière.";
    }

    return NextResponse.json({
      session: sessionBase,
      module1: {
        type: "image" as const,
        image: image
          ? {
              position: image.position,
              title: image.title,
              description: image.description,
              url: image.image_url,
            }
          : null,
        question: situation
          ? {
              situationId: situation.id,
              text: questionText,
              relance: relance?.relance_text || situation.nudge_text || "",
              measure: situation.restitution_label,
            }
          : null,
        hasResponded,
        responsesCount,
        confrontation,
        totalSeances: 5,
        currentSeance,
        ...(isTwoPhase
          ? {
              twoPhase: true,
              currentPhase,
              phase1Text,
            }
          : {}),
      },
      situation: null,
      hasResponded,
      hasVoted: false,
      voteOptions: [],
      collectiveChoice: null,
      connectedCount: connectedCount || 0,
      responsesCount,
      budgetStats: null,
    });
  }

  // ── SÉANCE 5: Carnet d'idées ──
  if (currentSeance === 5) {
    // Fetch the notebook situation
    const { data: situation } = await admin
      .from("situations")
      .select("id, position, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text")
      .eq("module", 1)
      .eq("seance", 5)
      .eq("position", 1)
      .single();

    const levelMap: Record<string, string> = {
      primaire: "prompt_6_9",
      college: "prompt_10_13",
      lycee: "prompt_14_18",
    };
    const promptField = levelMap[session.level as string] || "prompt_10_13";

    // Check if student already submitted notebook text (exclude reset)
    let existingText: string | undefined;
    let hasResponded = false;
    if (studentId && situation) {
      const { data: resp } = await admin
        .from("responses")
        .select("text")
        .eq("session_id", sessionId)
        .eq("student_id", studentId)
        .eq("situation_id", situation.id)
        .is("reset_at", null)
        .maybeSingle();
      if (resp) {
        existingText = resp.text;
        hasResponded = true;
      }
    }

    // Count notebooks submitted (exclude reset)
    let responsesCount = 0;
    if (situation) {
      const { count } = await admin
        .from("responses")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId)
        .eq("situation_id", situation.id)
        .is("reset_at", null);
      responsesCount = count || 0;
    }

    return NextResponse.json({
      session: sessionBase,
      module1: {
        type: "notebook" as const,
        question: situation
          ? {
              situationId: situation.id,
              text: situation[promptField as keyof typeof situation] as string,
              relance: situation.nudge_text || "",
              measure: situation.restitution_label,
            }
          : null,
        existingText,
        responsesCount,
        totalSeances: 5,
        currentSeance,
        suggestions: ["une dispute", "un moment gênant", "un moment drôle", "une injustice"],
        encouragement: "Les meilleurs films racontent souvent des choses qui existent vraiment.",
      },
      situation: null,
      hasResponded,
      hasVoted: false,
      voteOptions: [],
      collectiveChoice: null,
      connectedCount: connectedCount || 0,
      responsesCount,
      budgetStats: null,
    });
  }

  // Fallback (shouldn't happen)
  return NextResponse.json({
    session: sessionBase,
    module1: { type: "positioning" as const, totalSeances: 5, currentSeance },
    situation: null,
    hasResponded: false,
    hasVoted: false,
    voteOptions: [],
    collectiveChoice: null,
    connectedCount: connectedCount || 0,
    responsesCount: 0,
    budgetStats: null,
  });
}
