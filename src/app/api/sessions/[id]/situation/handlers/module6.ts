import { NextRequest, NextResponse } from "next/server";
import { isValidUUID } from "@/lib/api-utils";
import { FRISE_STEPS, MISSION_TYPES } from "@/lib/module-scenario-data";
import { getStudentTeam } from "./shared";
import type { AdminClient } from "./types";

// ── MODULE 6 handler — Le Scénario (5 positions) ──
export async function handleModule6(
  req: NextRequest,
  session: Record<string, unknown>,
  sessionId: string,
  admin: AdminClient
) {
  const currentIndex = (session.current_situation_index as number) || 0;
  const position = currentIndex + 1; // 1-5

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

  // Fetch all scenes for this session
  const { data: scenes } = await admin
    .from("module6_scenes")
    .select("*")
    .eq("session_id", sessionId)
    .order("scene_number");

  // Fetch all winners from M12
  const { data: winnersData } = await admin
    .from("module12_winners")
    .select("manche, winning_text")
    .eq("session_id", sessionId)
    .order("manche");

  const winners: Record<number, string> = {};
  for (const w of winnersData || []) {
    winners[w.manche] = w.winning_text;
  }

  // Fetch scenario assembly
  const { data: scenario } = await admin
    .from("module6_scenario")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  // Student-specific data
  let studentMission = null;
  let studentWarnings = 0;
  let studentKicked = false;

  if (studentId) {
    // Get mission for this student
    const { data: mission } = await admin
      .from("module6_missions")
      .select("*, module6_scenes(title, description, content)")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .single();
    studentMission = mission;

    const { data: student } = await admin
      .from("students")
      .select("warnings, kicked")
      .eq("id", studentId)
      .eq("session_id", sessionId)
      .single();
    studentWarnings = student?.warnings || 0;
    studentKicked = student?.kicked || false;
  }

  // All missions (for assembly view)
  let allMissions = null;
  if (position === 5 || !studentId) {
    const { data: missions } = await admin
      .from("module6_missions")
      .select("*, module6_scenes(title)")
      .eq("session_id", sessionId);
    allMissions = missions;
  }

  // Fetch situation from DB
  const { data: situation } = await admin
    .from("situations")
    .select("*")
    .eq("module", 5)
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

  // Build type-specific module6 response
  let module6Data: Record<string, unknown> = { type: "unknown", position };

  if (position === 1) {
    // Frise narrative
    module6Data = {
      type: "frise",
      position,
      friseSteps: FRISE_STEPS.map((step) => ({
        ...step,
        winnerText: winners[step.winnerManche] || null,
      })),
      winners,
    };
  } else if (position === 2) {
    // Scènes V0 + Lecture collective (Adrian: l'intervenant lit les scènes à voix haute)
    module6Data = {
      type: "scenes-v0",
      position,
      scenes: (scenes || []).map((s: Record<string, unknown>) => ({
        id: s.id,
        sceneNumber: s.scene_number,
        title: s.title,
        description: s.description,
        act: s.act,
        status: s.status,
        content: s.content,
      })),
      scenesReady: (scenes || []).length > 0,
      lectureCollective: true, // Adrian: collective reading before missions
    };
  } else if (position === 3) {
    // Mission
    module6Data = {
      type: "mission",
      position,
      mission: studentMission
        ? {
            id: studentMission.id,
            role: studentMission.role,
            roleLabel: MISSION_TYPES.find((m) => m.key === studentMission.role)?.label || studentMission.role,
            roleEmoji: MISSION_TYPES.find((m) => m.key === studentMission.role)?.emoji || "✏️",
            task: studentMission.task,
            sceneTitle: (studentMission.module6_scenes as Record<string, unknown>)?.title || "",
            sceneDescription: (studentMission.module6_scenes as Record<string, unknown>)?.description || "",
            status: studentMission.status,
            isScribe: studentMission.is_scribe || false,
          }
        : null,
      missionTypes: MISSION_TYPES,
    };
  } else if (position === 4) {
    // Écriture
    module6Data = {
      type: "ecriture",
      position,
      mission: studentMission
        ? {
            id: studentMission.id,
            role: studentMission.role,
            task: studentMission.task,
            content: studentMission.content || "",
            sceneTitle: (studentMission.module6_scenes as Record<string, unknown>)?.title || "",
            sceneContent: (studentMission.module6_scenes as Record<string, unknown>)?.content || "",
            status: studentMission.status,
          }
        : null,
    };
  } else if (position === 5) {
    // Assemblage
    module6Data = {
      type: "assemblage",
      position,
      scenes: (scenes || []).map((s: Record<string, unknown>) => ({
        id: s.id,
        sceneNumber: s.scene_number,
        title: s.title,
        description: s.description,
        act: s.act,
        content: s.content,
        status: s.status,
      })),
      missions: (allMissions || []).map((m: Record<string, unknown>) => ({
        id: m.id,
        studentId: m.student_id,
        role: m.role,
        content: m.content,
        status: m.status,
        sceneTitle: (m.module6_scenes as Record<string, unknown>)?.title || "",
      })),
      scenario: scenario
        ? { fullText: scenario.full_text, validated: scenario.validated }
        : null,
    };
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
    module6: module6Data,
    hasResponded: studentMission?.status === "done",
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
