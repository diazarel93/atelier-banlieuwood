import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUUID, withErrorHandler } from "@/lib/api-utils";

// GET — fetch student library data: own contributions, class responses (if sharing enabled),
// idea bank, collective choices, module-specific data
export const GET = withErrorHandler(async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const studentId = req.nextUrl.searchParams.get("studentId");

  if (!isValidUUID(sessionId)) {
    return NextResponse.json({ error: "Session invalide" }, { status: 400 });
  }
  if (!studentId || !isValidUUID(studentId)) {
    return NextResponse.json({ error: "Student ID requis" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Get session info
  const { data: session } = await admin
    .from("sessions")
    .select("id, title, status, current_module, current_seance, sharing_enabled, level")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // Verify student belongs to session
  const { data: student } = await admin
    .from("students")
    .select("id, display_name, avatar")
    .eq("id", studentId)
    .eq("session_id", sessionId)
    .single();

  if (!student) {
    return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
  }

  // Fetch all data in parallel
  const [
    myResponsesRes,
    collectiveChoicesRes,
    classResponsesRes,
    ideaBankRes,
    myEtsiRes,
    myPersonnageRes,
    myPitchRes,
    myScenesRes,
    myBudgetRes,
    studentCountRes,
  ] = await Promise.all([
    // 1. Student's own responses
    admin
      .from("responses")
      .select("id, situation_id, text, submitted_at, relance_text, relance_response, teacher_comment, teacher_score, ai_score")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .order("submitted_at", { ascending: true }),

    // 2. Collective choices (the assembled story)
    admin
      .from("collective_choices")
      .select("id, category, restitution_label, chosen_text, source_response_id, validated_at")
      .eq("session_id", sessionId)
      .order("validated_at", { ascending: true }),

    // 3. Class responses (only if sharing enabled) — anonymized
    session.sharing_enabled
      ? admin
          .from("responses")
          .select("id, text, submitted_at, situation_id")
          .eq("session_id", sessionId)
          .neq("student_id", studentId)
          .eq("is_hidden", false)
          .order("submitted_at", { ascending: false })
          .limit(100)
      : Promise.resolve({ data: null }),

    // 4. Idea bank (Module 10)
    admin
      .from("module10_idea_bank")
      .select("id, text, category, votes, student_id, created_at")
      .eq("session_id", sessionId)
      .order("votes", { ascending: false }),

    // 5. Student's "Et si..." texts (Module 10)
    admin
      .from("module10_etsi")
      .select("id, image_id, etsi_text, help_used, submitted_at")
      .eq("session_id", sessionId)
      .eq("student_id", studentId),

    // 6. Student's character (Module 10)
    admin
      .from("module10_personnages")
      .select("id, prenom, age, trait_dominant, avatar_data, submitted_at")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .maybeSingle(),

    // 7. Student's pitch (Module 10)
    admin
      .from("module10_pitchs")
      .select("id, objectif, obstacle, pitch_text, chrono_seconds, submitted_at")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .maybeSingle(),

    // 8. Student's scenes (Module 5/2)
    admin
      .from("module5_scenes")
      .select("id, emotion, intention, obstacle, changement, elements, tokens_used, ai_feedback, submitted_at")
      .eq("session_id", sessionId)
      .eq("student_id", studentId),

    // 9. Student's budget (Module 9)
    admin
      .from("module2_budgets")
      .select("id, choices, total_spent, budget_text, submitted_at")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .maybeSingle(),

    // 10. Student count
    admin
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .eq("kicked", false),
  ]);

  // Build my response IDs set for "isMine" marking
  const myResponses = myResponsesRes.data || [];
  const myResponseIds = new Set(myResponses.map((r) => r.id));

  // Mark collective choices
  const collectiveChoices = (collectiveChoicesRes.data || []).map((c) => ({
    id: c.id,
    category: c.category,
    restitutionLabel: c.restitution_label,
    chosenText: c.chosen_text,
    isMine: !!(c.source_response_id && myResponseIds.has(c.source_response_id)),
  }));

  const myChosenCount = collectiveChoices.filter((c) => c.isMine).length;

  // Build class gallery (anonymized, grouped by situation)
  const classGallery: { situationId: string; responses: { id: string; text: string }[] }[] = [];
  if (session.sharing_enabled && classResponsesRes.data) {
    const bySituation = new Map<string, { id: string; text: string }[]>();
    for (const r of classResponsesRes.data) {
      if (!bySituation.has(r.situation_id)) bySituation.set(r.situation_id, []);
      bySituation.get(r.situation_id)!.push({ id: r.id, text: r.text });
    }
    for (const [situationId, responses] of bySituation) {
      classGallery.push({ situationId, responses: responses.slice(0, 10) });
    }
  }

  // Build idea bank with isMine flag
  const ideaBank = (ideaBankRes.data || []).map((idea) => ({
    id: idea.id,
    text: idea.text,
    category: idea.category,
    votes: idea.votes ?? 0,
    isMine: idea.student_id === studentId,
  }));

  return NextResponse.json({
    session: {
      id: session.id,
      title: session.title,
      status: session.status,
      currentModule: session.current_module,
      currentSeance: session.current_seance,
      sharingEnabled: session.sharing_enabled,
      level: session.level,
    },
    student: {
      id: student.id,
      displayName: student.display_name,
      avatar: student.avatar,
    },
    // Global
    myResponses: myResponses.map((r) => ({
      id: r.id,
      situationId: r.situation_id,
      text: r.text,
      submittedAt: r.submitted_at,
      teacherComment: r.teacher_comment,
      teacherScore: r.teacher_score,
      aiScore: r.ai_score,
      hasRelance: !!r.relance_text,
      relanceResponse: r.relance_response,
    })),
    collectiveChoices,
    myChosenCount,
    totalChoices: collectiveChoices.length,
    classGallery,
    studentCount: studentCountRes.count || 0,
    // Module 10
    etsiTexts: (myEtsiRes.data || []).map((e) => ({
      imageId: e.image_id,
      text: e.etsi_text,
      helpUsed: e.help_used,
    })),
    personnage: myPersonnageRes.data
      ? {
          prenom: myPersonnageRes.data.prenom,
          trait: myPersonnageRes.data.trait_dominant,
          avatar: myPersonnageRes.data.avatar_data,
        }
      : null,
    pitch: myPitchRes.data
      ? {
          objectif: myPitchRes.data.objectif,
          obstacle: myPitchRes.data.obstacle,
          text: myPitchRes.data.pitch_text,
          chronoSeconds: myPitchRes.data.chrono_seconds,
        }
      : null,
    ideaBank,
    // Module 5/2
    scenes: (myScenesRes.data || []).map((s) => ({
      id: s.id,
      emotion: s.emotion,
      intention: s.intention,
      obstacle: s.obstacle,
      changement: s.changement,
      elements: s.elements,
      tokensUsed: s.tokens_used,
      aiFeedback: s.ai_feedback,
    })),
    // Module 9
    budget: myBudgetRes.data
      ? {
          choices: myBudgetRes.data.choices,
          totalSpent: myBudgetRes.data.total_spent,
          budgetText: myBudgetRes.data.budget_text,
        }
      : null,
  });
});
