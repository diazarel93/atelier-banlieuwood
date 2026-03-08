import { NextRequest, NextResponse } from "next/server";
import { isValidUUID } from "@/lib/api-utils";
import { getElement } from "@/lib/module5-data";
import { handleStandardWithModule5 } from "./module5";
import type { AdminClient } from "./types";

// ── MODULE 2 handler — Émotion Cachée ──
export async function handleModule2EC(req: NextRequest, session: Record<string, unknown>, sessionId: string, admin: AdminClient) {
  const currentSeance = (session.current_seance as number) || 1;
  const currentIndex = (session.current_situation_index as number) || 0;
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
    template: (session.template as string) || null,
    timerEndsAt: (session.timer_ends_at as string) || null,
    mode: (session.mode as string) || "guided",
    sharingEnabled: (session.sharing_enabled as boolean) || false,
    broadcastMessage: (session.broadcast_message as string) || null,
    broadcastAt: (session.broadcast_at as string) || null,
    revealPhase: (session.reveal_phase as string) ?? null,
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
        .eq("module", 2)
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
