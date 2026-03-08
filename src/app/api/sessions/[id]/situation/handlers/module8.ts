import { NextRequest, NextResponse } from "next/server";
import { isValidUUID } from "@/lib/api-utils";
import { FICHES_METIER, QUIZ_METIERS, TALENT_CATEGORIES } from "@/lib/module-equipe-data";
import { getStudentTeam } from "./shared";
import type { AdminClient } from "./types";

// ── MODULE 8 handler — L'Équipe (5 positions) ──
export async function handleModule8(
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

  let module8Data: Record<string, unknown> = { type: "unknown", position };

  if (position === 1) {
    // Quiz métiers
    let studentAnswers: Record<string, unknown>[] = [];
    if (studentId) {
      const { data: answers } = await admin
        .from("module8_quiz")
        .select("metier_key, believed_role, correct")
        .eq("session_id", sessionId)
        .eq("student_id", studentId);
      studentAnswers = answers || [];
    }

    module8Data = {
      type: "quiz",
      position,
      quiz: QUIZ_METIERS.map((q) => ({
        metierKey: q.metierKey,
        metierLabel: q.metierLabel,
        metierEmoji: q.metierEmoji,
        commonBelief: q.commonBelief,
        reality: q.reality,
      })),
      studentAnswers: studentAnswers.map((a) => ({
        metierKey: a.metier_key,
        correct: a.correct,
      })),
      hasAnswered: studentAnswers.length > 0,
    };
  } else if (position === 2) {
    // Débrief — show results + corrections
    let classResults: Record<string, { correct: number; wrong: number }> | null = null;
    const { data: allAnswers } = await admin
      .from("module8_quiz")
      .select("metier_key, correct")
      .eq("session_id", sessionId);

    classResults = {};
    for (const a of allAnswers || []) {
      if (!classResults[a.metier_key]) classResults[a.metier_key] = { correct: 0, wrong: 0 };
      if (a.correct) classResults[a.metier_key].correct++;
      else classResults[a.metier_key].wrong++;
    }

    module8Data = {
      type: "debrief",
      position,
      corrections: QUIZ_METIERS.map((q) => ({
        metierKey: q.metierKey,
        metierLabel: q.metierLabel,
        metierEmoji: q.metierEmoji,
        commonBelief: q.commonBelief,
        reality: q.reality,
      })),
      classResults,
      fiches: FICHES_METIER,
    };
  } else if (position === 3) {
    // Choix de rôle
    // Get student's rank (without showing scores to them)
    let studentRank: number | null = null;
    let isMyTurn = false;

    if (studentId) {
      const { data: points } = await admin
        .from("module8_points")
        .select("rank")
        .eq("session_id", sessionId)
        .eq("student_id", studentId)
        .single();
      studentRank = points?.rank || null;
    }

    // Get taken roles
    const { data: takenRoles } = await admin
      .from("module8_roles")
      .select("role_key, student_id, is_veto")
      .eq("session_id", sessionId);

    // Get all ranked students (to determine whose turn)
    const { data: allPoints } = await admin
      .from("module8_points")
      .select("student_id, rank")
      .eq("session_id", sessionId)
      .order("rank");

    // Current turn: first student without a role
    const takenStudentIds = new Set((takenRoles || []).map((r: Record<string, unknown>) => r.student_id));
    const nextStudent = (allPoints || []).find((p: Record<string, unknown>) => !takenStudentIds.has(p.student_id as string));

    if (studentId && nextStudent) {
      isMyTurn = (nextStudent.student_id as string) === studentId;
    }

    // All roles are always available (multiple students can share a role)
    // Count how many students already chose each role
    const roleCounts: Record<string, number> = {};
    for (const r of takenRoles || []) {
      const key = r.role_key as string;
      roleCounts[key] = (roleCounts[key] || 0) + 1;
    }
    const availableRoles = FICHES_METIER;

    // Facilitator: full ranking with scores
    let ranking = null;
    if (!studentId) {
      const { data: fullPoints } = await admin
        .from("module8_points")
        .select("student_id, participation_score, creativity_score, engagement_score, total_score, rank")
        .eq("session_id", sessionId)
        .order("rank");

      // Get student names
      const studentIds = (fullPoints || []).map((p: Record<string, unknown>) => p.student_id);
      const { data: students } = await admin
        .from("students")
        .select("id, display_name")
        .in("id", studentIds);

      const nameMap: Record<string, string> = {};
      for (const s of students || []) {
        nameMap[s.id] = s.display_name;
      }

      ranking = (fullPoints || []).map((p: Record<string, unknown>) => ({
        studentId: p.student_id,
        displayName: nameMap[p.student_id as string] || "Élève",
        participation: p.participation_score,
        creativity: p.creativity_score,
        engagement: p.engagement_score,
        total: p.total_score,
        rank: p.rank,
        hasChosen: takenStudentIds.has(p.student_id as string),
      }));
    }

    module8Data = {
      type: "role-choice",
      position,
      studentRank,
      isMyTurn,
      availableRoles: availableRoles.map((f) => ({
        key: f.key,
        label: f.label,
        description: f.description,
        emoji: f.emoji,
        color: f.color,
        count: roleCounts[f.key] || 0,
      })),
      takenRoles: (takenRoles || []).map((r: Record<string, unknown>) => ({
        roleKey: r.role_key,
        studentId: r.student_id,
        isVeto: r.is_veto,
        roleLabel: FICHES_METIER.find((f) => f.key === r.role_key)?.label || r.role_key,
      })),
      ranking,
      pointsComputed: (allPoints || []).length > 0,
    };
  } else if (position === 4) {
    // Récap équipe
    const { data: roles } = await admin
      .from("module8_roles")
      .select("student_id, role_key, is_veto")
      .eq("session_id", sessionId);

    const studentIds = (roles || []).map((r: Record<string, unknown>) => r.student_id);
    const { data: students } = await admin
      .from("students")
      .select("id, display_name, avatar_seed")
      .in("id", studentIds.length > 0 ? studentIds : ["none"]);

    const studentMap: Record<string, Record<string, unknown>> = {};
    for (const s of students || []) {
      studentMap[s.id] = s;
    }

    module8Data = {
      type: "team-recap",
      position,
      team: (roles || []).map((r: Record<string, unknown>) => {
        const metier = FICHES_METIER.find((f) => f.key === r.role_key);
        const studentInfo = studentMap[r.student_id as string];
        return {
          studentId: r.student_id,
          displayName: studentInfo?.display_name || "Élève",
          avatarSeed: studentInfo?.avatar_seed || "",
          roleKey: r.role_key,
          roleLabel: metier?.label || r.role_key,
          roleEmoji: metier?.emoji || "🎬",
          roleColor: metier?.color || "#666",
          isVeto: r.is_veto,
        };
      }),
    };
  } else if (position === 5) {
    // Carte talent
    let talentCard = null;
    if (studentId) {
      const { data: card } = await admin
        .from("module8_talent_cards")
        .select("*")
        .eq("session_id", sessionId)
        .eq("student_id", studentId)
        .single();

      if (card) {
        const { data: studentInfo } = await admin
          .from("students")
          .select("display_name, avatar_seed")
          .eq("id", studentId)
          .single();

        // Check if this role was a veto assignment
        const { data: roleData } = await admin
          .from("module8_roles")
          .select("is_veto")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .maybeSingle();

        const role = FICHES_METIER.find((f) => f.key === card.role_key);
        const cat = TALENT_CATEGORIES.find((c) => c.key === card.talent_category);

        talentCard = {
          displayName: studentInfo?.display_name || "Élève",
          avatarSeed: studentInfo?.avatar_seed || "",
          roleKey: card.role_key,
          roleLabel: role?.label || card.role_key,
          roleEmoji: role?.emoji || "🎬",
          talentCategory: card.talent_category,
          talentCategoryLabel: cat?.label || card.talent_category,
          talentCategoryColor: cat?.color || "#666",
          strengths: card.strengths || [],
          isVeto: roleData?.is_veto || false,
        };
      }
    }

    module8Data = {
      type: "talent-card",
      position,
      talentCard,
    };
  }

  // Fetch situation from DB
  const { data: situation } = await admin
    .from("situations")
    .select("*")
    .eq("module", 8)
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
    module8: module8Data,
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
