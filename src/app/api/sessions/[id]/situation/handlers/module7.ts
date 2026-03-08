import { NextRequest, NextResponse } from "next/server";
import { isValidUUID } from "@/lib/api-utils";
import { PLANS_FONDAMENTAUX, COMPARISONS, buildDecoupageTemplate } from "@/lib/module-filmer-data";
import { getStudentTeam } from "./shared";
import type { AdminClient } from "./types";

// ── MODULE 7 handler — La Mise en scène (4 positions) ──
export async function handleModule7(
  req: NextRequest,
  session: Record<string, unknown>,
  sessionId: string,
  admin: AdminClient
) {
  const currentIndex = (session.current_situation_index as number) || 0;
  const position = currentIndex + 1; // 1-4

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

  // Fetch M6 scenes (for découpage)
  const { data: scenes } = await admin
    .from("module6_scenes")
    .select("id, scene_number, title, description, act")
    .eq("session_id", sessionId)
    .order("scene_number");

  // Build module7-specific response
  let module7Data: Record<string, unknown> = { type: "unknown", position };

  if (position === 1) {
    // Les 4 plans fondamentaux
    module7Data = {
      type: "plans",
      position,
      plans: PLANS_FONDAMENTAUX,
    };
  } else if (position === 2) {
    // Comparaison visuelle
    let studentComparisons: Record<string, unknown>[] = [];
    if (studentId) {
      const { data: comps } = await admin
        .from("module7_comparisons")
        .select("comparison_key, chosen_plan, reasoning")
        .eq("session_id", sessionId)
        .eq("student_id", studentId);
      studentComparisons = comps || [];
    }

    // Facilitator: aggregate results
    let comparisonResults: Record<string, Record<string, number>> | null = null;
    if (!studentId) {
      const { data: allComps } = await admin
        .from("module7_comparisons")
        .select("comparison_key, chosen_plan")
        .eq("session_id", sessionId);

      comparisonResults = {};
      for (const c of allComps || []) {
        if (!comparisonResults[c.comparison_key]) comparisonResults[c.comparison_key] = {};
        comparisonResults[c.comparison_key][c.chosen_plan] =
          (comparisonResults[c.comparison_key][c.chosen_plan] || 0) + 1;
      }
    }

    module7Data = {
      type: "comparaison",
      position,
      comparisons: COMPARISONS,
      studentComparisons: studentComparisons.map((c) => ({
        comparisonKey: c.comparison_key,
        chosenPlan: c.chosen_plan,
        reasoning: c.reasoning,
      })),
      comparisonResults,
    };
  } else if (position === 3) {
    // Découpage — Adrian: prioritize scenes with most action/tension
    // Confrontation > Resolution > Setup (by narrative tension)
    const ACT_PRIORITY: Record<string, number> = { confrontation: 3, resolution: 2, setup: 1 };
    const sorted = [...(scenes || [])].sort((a, b) =>
      (ACT_PRIORITY[b.act as string] || 0) - (ACT_PRIORITY[a.act as string] || 0)
    );
    const keyScenes = sorted.slice(0, 3);

    let studentDecoupages: Record<string, unknown>[] = [];
    let allDecoupages: Record<string, unknown>[] = [];
    if (studentId) {
      const { data: decoupages } = await admin
        .from("module7_decoupages")
        .select("scene_id, plans")
        .eq("session_id", sessionId)
        .eq("student_id", studentId);
      studentDecoupages = decoupages || [];
    } else {
      // Facilitator: all decoupages for progress tracking
      const { data: decoupages } = await admin
        .from("module7_decoupages")
        .select("scene_id, student_id, plans")
        .eq("session_id", sessionId);
      allDecoupages = decoupages || [];
    }

    module7Data = {
      type: "decoupage",
      position,
      keyScenes: keyScenes.map((s: Record<string, unknown>) => ({
        id: s.id,
        sceneNumber: s.scene_number,
        title: s.title,
        description: s.description,
        template: buildDecoupageTemplate({ title: s.title as string, description: s.description as string }),
      })),
      studentDecoupages: studentDecoupages.map((d) => ({
        sceneId: d.scene_id,
        plans: d.plans,
      })),
      // Facilitator: all decoupages for counting submissions per scene
      allDecoupages: allDecoupages.map((d) => ({
        sceneId: d.scene_id,
        studentId: d.student_id,
        plans: d.plans,
      })),
      planTypes: PLANS_FONDAMENTAUX.map((p) => ({ key: p.key, label: p.label })),
    };
  } else if (position === 4) {
    // Storyboard
    const { data: storyboard } = await admin
      .from("module7_storyboard")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    // Fetch all decoupages for assembly
    let allDecoupages: Record<string, unknown>[] = [];
    if (!studentId) {
      const { data: decoupages } = await admin
        .from("module7_decoupages")
        .select("scene_id, student_id, plans")
        .eq("session_id", sessionId);
      allDecoupages = decoupages || [];
    }

    module7Data = {
      type: "storyboard",
      position,
      storyboard: storyboard
        ? { scenes: storyboard.scenes, validated: storyboard.validated }
        : null,
      allDecoupages: allDecoupages.map((d) => ({
        sceneId: d.scene_id,
        studentId: d.student_id,
        plans: d.plans,
      })),
      scenes: (scenes || []).map((s: Record<string, unknown>) => ({
        id: s.id,
        sceneNumber: s.scene_number,
        title: s.title,
      })),
    };
  }

  // Fetch situation from DB
  const { data: situation } = await admin
    .from("situations")
    .select("*")
    .eq("module", 7)
    .eq("seance", 1)
    .eq("position", position)
    .single();

  const levelMap: Record<string, string> = {
    primaire: "prompt_6_9",
    college: "prompt_10_13",
    lycee: "prompt_14_18",
  };
  const field = levelMap[session.level as string] || "prompt_10_13";
  const prompt = situation?.[field as keyof typeof situation] as string || "";

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
    module7: module7Data,
    hasResponded: false,
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
    team,
  });
}
