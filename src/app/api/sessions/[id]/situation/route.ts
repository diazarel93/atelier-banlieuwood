import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUUID } from "@/lib/api-utils";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { getElement } from "@/lib/module5-data";
import { ETSI_IMAGES, getEtsiImage } from "@/lib/module10-data";
import { getCineStimulus, type CineStimulus } from "@/lib/module11-data";
// Module 1 redesign: no more static questions, everything from DB

// Helper: fetch student team info
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getStudentTeam(admin: any, studentId: string | null, sessionId: string) {
  if (!studentId) return null;
  const { data: student } = await admin
    .from("students")
    .select("team_id")
    .eq("id", studentId)
    .eq("session_id", sessionId)
    .single();
  if (!student?.team_id) return null;
  const { data: team } = await admin
    .from("teams")
    .select("id, team_name, team_color, team_number")
    .eq("id", student.team_id)
    .single();
  if (!team) return null;
  return { id: team.id, teamName: team.team_name, teamColor: team.team_color, teamNumber: team.team_number };
}

// GET — get current situation for a session (used by students via polling)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;

  // Rate limit: 30 requests per 10 seconds per IP (generous for 5s polling)
  const limited = checkRateLimit(getIP(req), `situation:${sessionId}`, { max: 30, windowSec: 10 });
  if (limited) {
    return NextResponse.json({ error: limited.error }, { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } });
  }

  const admin = createAdminClient();

  // Get session state
  const { data: session, error: sessionError } = await admin
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // ── MODULE 1: Confiance + Diagnostic (images) ──
  if (session.current_module === 1) {
    return handleModule1(req, session, sessionId, admin);
  }

  // ── MODULE 2: Émotion Cachée ──
  if (session.current_module === 2) {
    return handleModule2EC(req, session, sessionId, admin);
  }

  // ── MODULE 10: Et si... + Pitch ──
  if (session.current_module === 10) {
    return handleModule10(req, session, sessionId, admin);
  }

  // ── MODULE 11: Ciné-Débat ──
  if (session.current_module === 11) {
    return handleModule11(req, session, sessionId, admin);
  }

  // ── MODULE 3+ & 9: Situations normales ──

  // Get all variants for this position
  const { data: variants } = await admin
    .from("situations")
    .select("*")
    .eq("module", session.current_module)
    .eq("seance", session.current_seance)
    .eq("position", session.current_situation_index + 1);

  // Pick a variant deterministically based on session ID + position
  let situation = variants?.[0] || null;
  if (variants && variants.length > 1) {
    const hash = sessionId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const variantIndex = (hash + session.current_situation_index) % variants.length;
    situation = variants[variantIndex];
  }

  // Get the student ID from query params (for checking if already responded)
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (studentId && !isValidUUID(studentId)) {
    return NextResponse.json({ error: "studentId invalide" }, { status: 400 });
  }
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

  // Get student warnings/kicked status + team info
  let studentTeam: { id: string; teamName: string; teamColor: string; teamNumber: number } | null = null;
  if (studentId) {
    const { data: student } = await admin
      .from("students")
      .select("warnings, kicked")
      .eq("id", studentId)
      .eq("session_id", sessionId)
      .single();

    studentWarnings = student?.warnings || 0;
    studentKicked = student?.kicked || false;
    studentTeam = await getStudentTeam(admin, studentId, sessionId);
  }

  // Get vote options if status is 'voting'
  let voteOptions: { id: string; text: string }[] = [];
  let hasVoted = false;

  if (session.status === "voting" && situation) {
    // Only return responses the facilitator selected for voting
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

  // Get collective choice if status is 'done' or we're reviewing
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

  // Get connected students count
  const { count } = await admin
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("is_active", true);

  // Get responses count for current situation (exclude reset responses)
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

  // Get budget stats if module 9 séance 2 (budget quiz, old M2)
  let budgetStats: { averages: Record<string, number>; submittedCount: number } | null = null;
  if (session.current_module === 9 && (session.current_seance || 1) === 2) {
    const { data: budgets } = await admin
      .from("module2_budgets")
      .select("choices")
      .eq("session_id", sessionId);

    if (budgets && budgets.length > 0) {
      const budgetKeys = ["acteurs", "decors", "technique", "son", "montage"];
      const averages: Record<string, number> = {};
      for (const cat of budgetKeys) {
        const values = budgets.map((b) => ((b.choices as Record<string, number>)?.[cat] || 0));
        averages[cat] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      }
      budgetStats = { averages, submittedCount: budgets.length };
    } else {
      budgetStats = { averages: {}, submittedCount: 0 };
    }
  }

  // Get prompt for the session's level
  let prompt = "";
  if (situation) {
    const levelMap: Record<string, string> = {
      primaire: "prompt_6_9",
      college: "prompt_10_13",
      lycee: "prompt_14_18",
    };
    const field = levelMap[session.level] || "prompt_10_13";
    prompt = situation[field as keyof typeof situation] as string;
  }

  return NextResponse.json({
    session: {
      id: session.id,
      status: session.status,
      currentModule: session.current_module,
      currentSeance: session.current_seance,
      currentSituationIndex: session.current_situation_index,
      level: session.level,
      title: session.title,
      joinCode: session.join_code,
      template: session.template || null,
      timerEndsAt: session.timer_ends_at || null,
      mode: session.mode || "guided",
      sharingEnabled: session.sharing_enabled || false,
      broadcastMessage: session.broadcast_message || null,
      broadcastAt: session.broadcast_at || null,
      muteSounds: session.mute_sounds ?? false,
    },
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
    hasResponded,
    hasVoted,
    voteOptions,
    collectiveChoice,
    isMyResponseChosen: !!(collectiveChoice && studentResponseId && collectiveChoice.source_response_id === studentResponseId),
    connectedCount: count || 0,
    responsesCount,
    budgetStats,
    teacherNudge,
    studentWarnings,
    studentKicked,
    team: studentTeam,
  });
}

// ── MODULE 1 handler — Redesign Adrian ──
// Handles 5 séances: positioning (QCM), 3 images, notebook
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleModule1(req: NextRequest, session: any, sessionId: string, admin: any) {
  const currentSeance = session.current_seance || 1;
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
    template: session.template || null,
    timerEndsAt: session.timer_ends_at || null,
    mode: session.mode || "guided",
    sharingEnabled: session.sharing_enabled || false,
    broadcastMessage: session.broadcast_message || null,
    broadcastAt: session.broadcast_at || null,
  };

  // ── SÉANCE 1: Positionnement (8 QCM) ──
  if (currentSeance === 1) {
    const { data: situations } = await admin
      .from("situations")
      .select("id, position, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, options, question_type")
      .eq("module", 1)
      .eq("seance", 1)
      .order("position");

    const levelMap: Record<string, string> = {
      primaire: "prompt_6_9",
      college: "prompt_10_13",
      lycee: "prompt_14_18",
    };
    const promptField = levelMap[session.level] || "prompt_10_13";

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
      const respMap = new Map<string, string>((studentResponses || []).map((r: { situation_id: string; text: string }) => [r.situation_id, r.text]));
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
    const currentQIndex = session.current_situation_index || 0;
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
      hasResponded: Object.values(answeredQuestions).length === (situations?.length || 8) && Object.values(answeredQuestions).every(Boolean),
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
    const { data: image } = await admin
      .from("module1_images")
      .select("*")
      .eq("position", imagePosition)
      .single();

    // Fetch the single situation for this séance
    const { data: situation } = await admin
      .from("situations")
      .select("id, position, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text, image_position")
      .eq("module", 1)
      .eq("seance", currentSeance)
      .eq("position", 1)
      .single();

    // Fetch relance
    const ageLevel = session.level || "college";
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
    const promptField = levelMap[session.level] || "prompt_10_13";

    // Check if student already responded (exclude reset)
    let hasResponded = false;
    if (studentId && situation) {
      const { data: resp } = await admin
        .from("responses")
        .select("id")
        .eq("session_id", sessionId)
        .eq("student_id", studentId)
        .eq("situation_id", situation.id)
        .is("reset_at", null)
        .maybeSingle();
      hasResponded = !!resp;
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

    return NextResponse.json({
      session: sessionBase,
      module1: {
        type: "image" as const,
        image: image ? {
          position: image.position,
          title: image.title,
          description: image.description,
          url: image.image_url,
        } : null,
        question: situation ? {
          situationId: situation.id,
          text: situation[promptField as keyof typeof situation] as string,
          relance: relance?.relance_text || situation.nudge_text || "",
          measure: situation.restitution_label,
        } : null,
        hasResponded,
        responsesCount,
        confrontation,
        totalSeances: 5,
        currentSeance,
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
    const promptField = levelMap[session.level] || "prompt_10_13";

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
        question: situation ? {
          situationId: situation.id,
          text: situation[promptField as keyof typeof situation] as string,
          relance: situation.nudge_text || "",
          measure: situation.restitution_label,
        } : null,
        existingText,
        responsesCount,
        totalSeances: 5,
        currentSeance,
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

// ── MODULE 2 handler — Émotion Cachée ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleModule2EC(req: NextRequest, session: any, sessionId: string, admin: any) {
  const currentSeance = session.current_seance || 1;
  const currentIndex = session.current_situation_index || 0;
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (studentId && !isValidUUID(studentId)) {
    return NextResponse.json({ error: "studentId invalide" }, { status: 400 });
  }

  // Connected count
  const { count: connectedCount } = await admin
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("is_active", true);

  const sessionBase = {
    id: session.id,
    status: session.status,
    currentModule: 2,
    currentSeance,
    currentSituationIndex: currentIndex,
    level: session.level,
    title: session.title,
    joinCode: session.join_code,
    template: session.template || null,
    timerEndsAt: session.timer_ends_at || null,
    mode: session.mode || "guided",
    sharingEnabled: session.sharing_enabled || false,
    broadcastMessage: session.broadcast_message || null,
    broadcastAt: session.broadcast_at || null,
  };

  // ── SÉANCE 1, INDEX 0: Checklist (special component) ──
  if (currentSeance === 1 && currentIndex === 0) {
    let checklist = null;
    let submitted = false;
    if (studentId) {
      const { data } = await admin
        .from("module5_checklists")
        .select("*")
        .eq("session_id", sessionId)
        .eq("student_id", studentId)
        .maybeSingle();
      checklist = data;
      submitted = !!data;
    }

    // Top items for facilitator
    const { data: allChecklists } = await admin
      .from("module5_checklists")
      .select("selected_items")
      .eq("session_id", sessionId);

    const itemCounts: Record<string, number> = {};
    for (const cl of allChecklists || []) {
      for (const key of (cl.selected_items as string[]) || []) {
        itemCounts[key] = (itemCounts[key] || 0) + 1;
      }
    }

    const topItems = Object.entries(itemCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([key, count]) => ({ key, count }));

    const { count: checklistCount } = await admin
      .from("module5_checklists")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);

    return NextResponse.json({
      session: sessionBase,
      situation: null,
      module5: {
        type: "checklist" as const,
        checklist,
        topItems,
        submitted,
        submittedCount: checklistCount || 0,
      },
      hasResponded: submitted,
      hasVoted: false,
      voteOptions: [],
      collectiveChoice: null,
      connectedCount: connectedCount || 0,
      responsesCount: checklistCount || 0,
      budgetStats: null,
    });
  }

  // ── SÉANCE 2, INDEX 1: Scene Builder (special component) ──
  if (currentSeance === 2 && currentIndex === 1) {
    let scene = null;
    let submitted = false;
    let chosenEmotion: string | null = null;

    if (studentId) {
      // Get student's scene if exists
      const { data } = await admin
        .from("module5_scenes")
        .select("*")
        .eq("session_id", sessionId)
        .eq("student_id", studentId)
        .maybeSingle();
      scene = data;
      submitted = !!data;

      // Get student's emotion choice from B1 (closed question at séance 2, position 1)
      const { data: emotionSit } = await admin
        .from("situations")
        .select("id")
        .eq("module", 8)
        .eq("seance", 2)
        .eq("position", 1)
        .single();

      if (emotionSit) {
        const { data: emotionResp } = await admin
          .from("responses")
          .select("text")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .eq("situation_id", emotionSit.id)
          .maybeSingle();
        chosenEmotion = emotionResp?.text || null;
      }
    }

    const { count: sceneCount } = await admin
      .from("module5_scenes")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);

    // Emotion distribution
    const { data: allScenes } = await admin
      .from("module5_scenes")
      .select("emotion")
      .eq("session_id", sessionId);

    const emotionDistribution: Record<string, number> = {};
    for (const s of allScenes || []) {
      emotionDistribution[s.emotion] = (emotionDistribution[s.emotion] || 0) + 1;
    }

    return NextResponse.json({
      session: sessionBase,
      situation: null,
      module5: {
        type: "scene-builder" as const,
        scene,
        submitted,
        chosenEmotion,
        submittedCount: sceneCount || 0,
        emotionDistribution,
      },
      hasResponded: submitted,
      hasVoted: false,
      voteOptions: [],
      collectiveChoice: null,
      connectedCount: connectedCount || 0,
      responsesCount: sceneCount || 0,
      budgetStats: null,
    });
  }

  // ── SÉANCE 3: Comparison — attach comparison data to standard flow ──
  if (currentSeance === 3) {
    // Try to load comparison
    const { data: comparison } = await admin
      .from("module5_comparisons")
      .select("scene_a_id, scene_b_id")
      .eq("session_id", sessionId)
      .maybeSingle();

    let comparisonData = null;
    if (comparison) {
      const { data: scenes } = await admin
        .from("module5_scenes")
        .select("id, emotion, intention, obstacle, changement, elements, tokens_used, slots_used")
        .in("id", [comparison.scene_a_id, comparison.scene_b_id]);

      if (scenes && scenes.length === 2) {
        const enrichElements = (elements: { key: string }[] | null) =>
          (elements || []).map((el) => {
            const def = getElement(el.key);
            return def
              ? { key: def.key, label: def.label, tier: def.tier, cost: def.cost }
              : { key: el.key, label: el.key, tier: 0, cost: 0 };
          });
        const rawA = scenes.find((s: { id: string }) => s.id === comparison.scene_a_id) || scenes[0];
        const rawB = scenes.find((s: { id: string }) => s.id === comparison.scene_b_id) || scenes[1];
        comparisonData = {
          sceneA: { ...rawA, elements: enrichElements((rawA as { elements: { key: string }[] | null }).elements) },
          sceneB: { ...rawB, elements: enrichElements((rawB as { elements: { key: string }[] | null }).elements) },
        };
      }
    }

    // Fall through to standard situation handling with comparison data attached
    return handleStandardWithModule5(req, session, sessionId, admin, sessionBase, connectedCount || 0, {
      type: "comparison" as const,
      comparison: comparisonData,
    });
  }

  // ── All other positions: standard Q&A (notebook, open, closed) ──
  return handleStandardWithModule5(req, session, sessionId, admin, sessionBase, connectedCount || 0, null);
}

// Standard situation handler with optional module5 data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleStandardWithModule5(
  req: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any,
  sessionId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
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
    .eq("position", session.current_situation_index + 1);

  let situation = variants?.[0] || null;
  if (variants && variants.length > 1) {
    const hash = sessionId.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const variantIndex = (hash + session.current_situation_index) % variants.length;
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
    const field = levelMap[session.level] || "prompt_10_13";
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

// ── MODULE 10 handler — Et si... + Pitch ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleModule10(req: NextRequest, session: any, sessionId: string, admin: any) {
  const currentSeance = session.current_seance || 1;
  const currentIndex = session.current_situation_index || 0;
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (studentId && !isValidUUID(studentId)) {
    return NextResponse.json({ error: "studentId invalide" }, { status: 400 });
  }

  // Connected count
  const { count: connectedCount } = await admin
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("is_active", true);

  const sessionBase = {
    id: session.id,
    status: session.status,
    currentModule: 10,
    currentSeance: currentSeance,
    currentSituationIndex: currentIndex,
    level: session.level,
    title: session.title,
    joinCode: session.join_code,
    template: session.template || null,
    timerEndsAt: session.timer_ends_at || null,
    mode: session.mode || "guided",
    sharingEnabled: session.sharing_enabled || false,
    broadcastMessage: session.broadcast_message || null,
    broadcastAt: session.broadcast_at || null,
  };

  const baseResponse = {
    situation: null,
    hasResponded: false,
    hasVoted: false,
    voteOptions: [],
    collectiveChoice: null,
    connectedCount: connectedCount || 0,
    responsesCount: 0,
    budgetStats: null,
  };

  // ── SÉANCE 1: Et si... ──
  if (currentSeance === 1) {
    // pos 0 = Image + "Et si..." writing (special component)
    if (currentIndex === 0) {
      // Pick image based on session hash for determinism
      const hash = sessionId.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
      const imageIndex = hash % ETSI_IMAGES.length;
      const image = ETSI_IMAGES[imageIndex];

      let etsiText: string | undefined;
      let helpUsed = false;
      let submitted = false;

      if (studentId) {
        const { data: etsi } = await admin
          .from("module10_etsi")
          .select("*")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .eq("image_id", image.id)
          .maybeSingle();

        if (etsi) {
          etsiText = etsi.etsi_text;
          helpUsed = etsi.help_used;
          submitted = true;
        }
      }

      // Count submissions
      const { count: etsiCount } = await admin
        .from("module10_etsi")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId)
        .eq("image_id", image.id);

      // Facilitator view: return all submissions
      let allSubmissions: { studentName: string; text: string; studentId: string }[] | undefined;
      if (!studentId) {
        const { data: allEtsi } = await admin
          .from("module10_etsi")
          .select("etsi_text, student_id, students(display_name)")
          .eq("session_id", sessionId)
          .eq("image_id", image.id)
          .order("submitted_at", { ascending: true });

        if (allEtsi) {
          allSubmissions = allEtsi.map((e: { etsi_text: string; student_id: string; students: { display_name: string } | null }) => ({
            studentName: e.students?.display_name || "?",
            text: e.etsi_text,
            studentId: e.student_id,
          }));
        }
      }

      return NextResponse.json({
        session: sessionBase,
        module10: {
          type: "etsi" as const,
          image,
          etsiText,
          helpUsed,
          submitted,
          submittedCount: etsiCount || 0,
          allSubmissions,
        },
        ...baseResponse,
        hasResponded: submitted,
        responsesCount: etsiCount || 0,
      });
    }

    // pos 1 = QCM narrative direction (standard situation flow with module10 data)
    if (currentIndex === 1) {
      return handleStandardWithModule10(req, session, sessionId, admin, sessionBase, connectedCount || 0, {
        type: "qcm" as const,
      });
    }

    // pos 2 = Idea bank (special component)
    if (currentIndex === 2) {
      const { data: ideas } = await admin
        .from("module10_idea_bank")
        .select("id, text, votes, student_id")
        .eq("session_id", sessionId)
        .order("votes", { ascending: false });

      let submitted = false;
      if (studentId) {
        const hasIdea = (ideas || []).some((i: { student_id: string }) => i.student_id === studentId);
        submitted = hasIdea;
      }

      return NextResponse.json({
        session: sessionBase,
        module10: {
          type: "idea-bank" as const,
          ideaBankItems: (ideas || []).map((i: { id: string; text: string; votes: number }) => ({
            id: i.id,
            text: i.text,
            votes: i.votes || 0,
          })),
          ideaBankCount: ideas?.length || 0,
          submitted,
          submittedCount: ideas?.length || 0,
        },
        ...baseResponse,
        hasResponded: submitted,
        responsesCount: ideas?.length || 0,
      });
    }
  }

  // ── SÉANCE 2: Pitch ──
  if (currentSeance === 2) {
    // pos 0 = Avatar builder (special component)
    if (currentIndex === 0) {
      let personnage = null;
      let submitted = false;

      if (studentId) {
        const { data } = await admin
          .from("module10_personnages")
          .select("*")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .maybeSingle();

        if (data) {
          personnage = {
            prenom: data.prenom,
            age: data.age,
            trait: data.trait_dominant,
            avatar: data.avatar_data,
          };
          submitted = true;
        }
      }

      const { count: persoCount } = await admin
        .from("module10_personnages")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId);

      // Facilitator view: return all personnages
      let allSubmissions: { studentName: string; text: string; studentId: string; avatar?: Record<string, unknown> }[] | undefined;
      if (!studentId) {
        const { data: allPerso } = await admin
          .from("module10_personnages")
          .select("prenom, age, trait_dominant, avatar_data, student_id, students(display_name)")
          .eq("session_id", sessionId)
          .order("submitted_at", { ascending: true });

        if (allPerso) {
          allSubmissions = allPerso.map((p: { prenom: string; age: string; trait_dominant: string; avatar_data: Record<string, unknown>; student_id: string; students: { display_name: string } | null }) => ({
            studentName: p.students?.display_name || "?",
            text: `${p.prenom}${p.age ? `, ${p.age}` : ""}${p.trait_dominant ? ` — ${p.trait_dominant}` : ""}`,
            studentId: p.student_id,
            avatar: p.avatar_data,
          }));
        }
      }

      return NextResponse.json({
        session: sessionBase,
        module10: {
          type: "avatar" as const,
          personnage,
          submitted,
          submittedCount: persoCount || 0,
          allSubmissions,
        },
        ...baseResponse,
        hasResponded: submitted,
        responsesCount: persoCount || 0,
      });
    }

    // pos 1 = Objectif + obstacle (special component)
    if (currentIndex === 1) {
      let objectif: string | null = null;
      let obstacle: string | null = null;
      let submitted = false;

      if (studentId) {
        const { data: pitch } = await admin
          .from("module10_pitchs")
          .select("objectif, obstacle")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .maybeSingle();

        if (pitch) {
          objectif = pitch.objectif;
          obstacle = pitch.obstacle;
          submitted = true;
        }
      }

      // Also get personnage for context
      let personnage = null;
      if (studentId) {
        const { data: perso } = await admin
          .from("module10_personnages")
          .select("prenom, trait_dominant, avatar_data")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .maybeSingle();

        if (perso) {
          personnage = {
            prenom: perso.prenom,
            age: null,
            trait: perso.trait_dominant,
            avatar: perso.avatar_data,
          };
        }
      }

      // Facilitator view: return all objectif+obstacle submissions
      let allSubmissions: { studentName: string; text: string; studentId: string }[] | undefined;
      let submittedCount = 0;
      if (!studentId) {
        const { data: allPitchs } = await admin
          .from("module10_pitchs")
          .select("objectif, obstacle, student_id, students(display_name)")
          .eq("session_id", sessionId)
          .not("objectif", "is", null)
          .order("created_at", { ascending: true });

        if (allPitchs) {
          submittedCount = allPitchs.length;
          allSubmissions = allPitchs.map((p: { objectif: string; obstacle: string; student_id: string; students: { display_name: string } | null }) => ({
            studentName: p.students?.display_name || "?",
            text: `🎯 ${p.objectif || "?"} — 🧱 ${p.obstacle || "?"}`,
            studentId: p.student_id,
          }));
        }
      }

      return NextResponse.json({
        session: sessionBase,
        module10: {
          type: "objectif" as const,
          personnage,
          objectif,
          obstacle,
          submitted,
          submittedCount,
          allSubmissions,
        },
        ...baseResponse,
        hasResponded: submitted,
        responsesCount: submittedCount,
      });
    }

    // pos 2 = Pitch assembly (special component)
    if (currentIndex === 2) {
      let pitchText: string | null = null;
      let objectif: string | null = null;
      let obstacle: string | null = null;
      let submitted = false;
      let personnage = null;

      if (studentId) {
        const { data: pitch } = await admin
          .from("module10_pitchs")
          .select("*")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .maybeSingle();

        if (pitch) {
          objectif = pitch.objectif;
          obstacle = pitch.obstacle;
          pitchText = pitch.pitch_text;
          submitted = !!pitch.pitch_text;
        }

        const { data: perso } = await admin
          .from("module10_personnages")
          .select("prenom, trait_dominant, avatar_data")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .maybeSingle();

        if (perso) {
          personnage = {
            prenom: perso.prenom,
            age: null,
            trait: perso.trait_dominant,
            avatar: perso.avatar_data,
          };
        }
      }

      // Get student's "Et si..." for context
      let etsiText: string | undefined;
      if (studentId) {
        const { data: etsi } = await admin
          .from("module10_etsi")
          .select("etsi_text")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .limit(1)
          .maybeSingle();

        etsiText = etsi?.etsi_text;
      }

      const { count: pitchCount } = await admin
        .from("module10_pitchs")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId)
        .not("pitch_text", "is", null);

      // Facilitator view: return all pitch texts
      let allSubmissions: { studentName: string; text: string; studentId: string }[] | undefined;
      if (!studentId) {
        const { data: allPitchs } = await admin
          .from("module10_pitchs")
          .select("pitch_text, student_id, students(display_name)")
          .eq("session_id", sessionId)
          .not("pitch_text", "is", null)
          .order("created_at", { ascending: true });

        if (allPitchs) {
          allSubmissions = allPitchs.map((p: { pitch_text: string; student_id: string; students: { display_name: string } | null }) => ({
            studentName: p.students?.display_name || "?",
            text: p.pitch_text,
            studentId: p.student_id,
          }));
        }
      }

      return NextResponse.json({
        session: sessionBase,
        module10: {
          type: "pitch" as const,
          personnage,
          objectif,
          obstacle,
          pitchText,
          etsiText,
          submitted,
          submittedCount: pitchCount || 0,
          allSubmissions,
        },
        ...baseResponse,
        hasResponded: submitted,
        responsesCount: pitchCount || 0,
      });
    }

    // pos 3 = Chrono test (special component)
    if (currentIndex === 3) {
      let pitchText: string | null = null;
      let chronoSeconds: number | null = null;
      let submitted = false;

      if (studentId) {
        const { data: pitch } = await admin
          .from("module10_pitchs")
          .select("pitch_text, chrono_seconds")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .maybeSingle();

        if (pitch) {
          pitchText = pitch.pitch_text;
          chronoSeconds = pitch.chrono_seconds;
          submitted = chronoSeconds != null;
        }
      }

      const { count: chronoCount } = await admin
        .from("module10_pitchs")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId)
        .not("chrono_seconds", "is", null);

      // Facilitator view: return all chrono results
      let allSubmissions: { studentName: string; text: string; studentId: string }[] | undefined;
      if (!studentId) {
        const { data: allChronos } = await admin
          .from("module10_pitchs")
          .select("chrono_seconds, student_id, students(display_name), module10_personnages(prenom)")
          .eq("session_id", sessionId)
          .not("chrono_seconds", "is", null)
          .order("chrono_seconds", { ascending: true });

        if (allChronos) {
          allSubmissions = allChronos.map((c: { chrono_seconds: number; student_id: string; students: { display_name: string } | null; module10_personnages: { prenom: string } | null }) => ({
            studentName: c.students?.display_name || "?",
            text: `${c.module10_personnages?.prenom || "?"} — ${c.chrono_seconds}s`,
            studentId: c.student_id,
          }));
        }
      }

      return NextResponse.json({
        session: sessionBase,
        module10: {
          type: "chrono" as const,
          pitchText,
          chronoSeconds,
          submitted,
          submittedCount: chronoCount || 0,
          allSubmissions,
        },
        ...baseResponse,
        hasResponded: submitted,
        responsesCount: chronoCount || 0,
      });
    }

    // pos 4 = Confrontation + vote (special component)
    if (currentIndex === 4) {
      // Get all pitchs for confrontation selection
      const { data: allPitchs } = await admin
        .from("module10_pitchs")
        .select("pitch_text, student_id, module10_personnages(prenom)")
        .eq("session_id", sessionId)
        .not("pitch_text", "is", null);

      // Teacher can pick specific pitches via query params
      const pickA = req.nextUrl.searchParams.get("pitchA");
      const pickB = req.nextUrl.searchParams.get("pitchB");
      let confrontation = null;
      if (allPitchs && allPitchs.length >= 2) {
        // Use teacher's picks if provided, otherwise first 2
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pA = (pickA && allPitchs.find((p: any) => p.student_id === pickA)) || allPitchs[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pB = (pickB && allPitchs.find((p: any) => p.student_id === pickB)) || allPitchs[1];
        confrontation = {
          pitchA: {
            text: pA.pitch_text,
            studentId: pA.student_id,
            prenom: (pA.module10_personnages as { prenom: string } | null)?.prenom || "?",
          },
          pitchB: {
            text: pB.pitch_text,
            studentId: pB.student_id,
            prenom: (pB.module10_personnages as { prenom: string } | null)?.prenom || "?",
          },
        };
      }

      // Also return all pitchs for teacher picker
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pitchList = (allPitchs || []).map((p: any) => ({
        studentId: p.student_id,
        prenom: (p.module10_personnages as { prenom: string } | null)?.prenom || "?",
        text: typeof p.pitch_text === "string" ? p.pitch_text.slice(0, 80) : "",
      }));

      return NextResponse.json({
        session: sessionBase,
        module10: {
          type: "confrontation" as const,
          confrontation,
          pitchList,
          submittedCount: allPitchs?.length || 0,
        },
        ...baseResponse,
        responsesCount: allPitchs?.length || 0,
      });
    }
  }

  // Fallback: use standard situation handler
  return handleStandardWithModule10(req, session, sessionId, admin, sessionBase, connectedCount || 0, null);
}

// Standard situation handler with optional module10 data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleStandardWithModule10(
  req: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any,
  sessionId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sessionBase: any,
  connectedCount: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module10Data: any,
) {
  const studentId = req.nextUrl.searchParams.get("studentId");

  // Get situation by module, seance, position
  const { data: variants } = await admin
    .from("situations")
    .select("*")
    .eq("module", session.current_module)
    .eq("seance", session.current_seance)
    .eq("position", session.current_situation_index + 1);

  let situation = variants?.[0] || null;
  if (variants && variants.length > 1) {
    const hash = sessionId.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const variantIndex = (hash + session.current_situation_index) % variants.length;
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
    const field = levelMap[session.level] || "prompt_10_13";
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
    ...(module10Data ? { module10: module10Data } : {}),
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

// ── MODULE 11 handler — Ciné-Débat ──
// Standard Q&A enriched with stimulus data (author, video, poster, debat)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleModule11(req: NextRequest, session: any, sessionId: string, admin: any) {
  const currentSeance = session.current_seance || 1;
  const currentIndex = session.current_situation_index || 0;
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
    template: session.template || null,
    timerEndsAt: session.timer_ends_at || null,
    mode: session.mode || "guided",
    sharingEnabled: session.sharing_enabled || false,
    broadcastMessage: session.broadcast_message || null,
    broadcastAt: session.broadcast_at || null,
    muteSounds: session.mute_sounds ?? false,
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
    const field = levelMap[session.level] || "prompt_10_13";
    prompt = situation[field as keyof typeof situation] as string;
  }

  // Enrich with stimulus data
  const stimulus: CineStimulus | undefined = getCineStimulus(currentSeance, position);
  const module11Data = stimulus ? {
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
    debatOptions: stimulus.type === "debat"
      ? [{ key: "daccord", label: "D'accord" }, { key: "pasdaccord", label: "Pas d'accord" }, { key: "nuance", label: "C'est plus nuancé" }]
      : null,
  } : null;

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
    isMyResponseChosen: !!(collectiveChoice && studentResponseId && collectiveChoice.source_response_id === studentResponseId),
    connectedCount: connectedCount || 0,
    responsesCount,
    budgetStats: null,
    teacherNudge,
    studentWarnings,
    studentKicked,
    team: m11Team,
  });
}
