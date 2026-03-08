import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUUID } from "@/lib/api-utils";
import { QUIZ_METIERS } from "@/lib/module-equipe-data";

// GET — fetch scenario data for a session
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const admin = createAdminClient();

  const { data: scenes } = await admin
    .from("module6_scenes")
    .select("*")
    .eq("session_id", sessionId)
    .order("scene_number");

  const { data: missions } = await admin
    .from("module6_missions")
    .select("*")
    .eq("session_id", sessionId);

  const { data: scenario } = await admin
    .from("module6_scenario")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  return NextResponse.json({ scenes: scenes || [], missions: missions || [], scenario });
}

// POST — handle various module actions (M6 missions, M7 comparisons/decoupages, M8 quiz/roles)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const admin = createAdminClient();
  const body = await req.json();
  const { type, studentId } = body;

  if (studentId && !isValidUUID(studentId)) {
    return NextResponse.json({ error: "studentId invalide" }, { status: 400 });
  }

  // ── M7: Comparison answer ──
  if (type === "comparison") {
    const { comparisonKey, chosenPlan, reasoning } = body;
    const { error } = await admin.from("module7_comparisons").upsert(
      {
        session_id: sessionId,
        student_id: studentId,
        comparison_key: comparisonKey,
        chosen_plan: chosenPlan,
        reasoning: reasoning || "",
      },
      { onConflict: "session_id,student_id,comparison_key" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // ── M7: Découpage submission ──
  if (type === "decoupage") {
    const { sceneId, plans } = body;
    const { error } = await admin.from("module7_decoupages").upsert(
      {
        session_id: sessionId,
        student_id: studentId,
        scene_id: sceneId,
        plans,
      },
      { onConflict: "session_id,student_id,scene_id" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // ── M8: Quiz métier answer ──
  if (type === "quiz-metier") {
    const { metierKey } = body;
    const quizItem = QUIZ_METIERS.find((q) => q.metierKey === metierKey);
    // New format: students click roles they think they know → correct tracks engagement
    const correct = !!quizItem;

    const { error } = await admin.from("module8_quiz").upsert(
      {
        session_id: sessionId,
        student_id: studentId,
        metier_key: metierKey,
        correct,
      },
      { onConflict: "session_id,student_id,metier_key" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, correct });
  }

  // ── M8: Choose role ──
  // Multiple students can share a role (e.g. multiple actors in class of 25)
  if (type === "choose-role") {
    const { roleKey } = body;

    // Check if student already has a role
    const { data: studentRole } = await admin
      .from("module8_roles")
      .select("id")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .single();

    if (studentRole) {
      return NextResponse.json({ error: "Tu as déjà choisi un rôle" }, { status: 409 });
    }

    const { error } = await admin.from("module8_roles").insert({
      session_id: sessionId,
      student_id: studentId,
      role_key: roleKey,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Type d'action inconnu" }, { status: 400 });
}

// PATCH — update mission content (M6)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const admin = createAdminClient();
  const body = await req.json();
  const { missionId, studentId, content } = body;

  if (!missionId || !studentId || !content) {
    return NextResponse.json({ error: "missionId, studentId et content requis" }, { status: 400 });
  }

  // Update mission content and status
  const { error } = await admin
    .from("module6_missions")
    .update({
      content,
      status: "done",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", missionId)
    .eq("student_id", studentId)
    .eq("session_id", sessionId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Also update the scene content by appending the contribution
  const { data: mission } = await admin
    .from("module6_missions")
    .select("scene_id, role")
    .eq("id", missionId)
    .single();

  if (mission) {
    const { data: scene } = await admin
      .from("module6_scenes")
      .select("content")
      .eq("id", mission.scene_id)
      .single();

    const prefix = `[${mission.role.toUpperCase()}] `;
    const newContent = scene?.content
      ? `${scene.content}\n\n${prefix}${content}`
      : `${prefix}${content}`;

    await admin
      .from("module6_scenes")
      .update({ content: newContent, status: "in_progress" })
      .eq("id", mission.scene_id);
  }

  return NextResponse.json({ success: true });
}
