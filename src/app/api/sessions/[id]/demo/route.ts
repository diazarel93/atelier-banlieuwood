import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator } from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEMO_STUDENTS,
  DEMO_STUDENT_NAMES,
  getDemoResponsesForStudents,
} from "@/lib/demo-data";

// POST — activate demo mode: create 5 virtual students + responses for current situation
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();

  // Get session state
  const { data: session } = await admin
    .from("sessions")
    .select("current_module, current_seance, current_situation_index")
    .eq("id", sessionId)
    .single();

  if (!session) {
    return NextResponse.json(
      { error: "Session introuvable" },
      { status: 404 }
    );
  }

  // Check if demo students already exist
  const { data: existingDemo } = await admin
    .from("students")
    .select("id, display_name")
    .eq("session_id", sessionId)
    .in("display_name", DEMO_STUDENT_NAMES);

  if (existingDemo && existingDemo.length > 0) {
    return NextResponse.json(
      { error: "Le mode démo est déjà activé pour cette session" },
      { status: 409 }
    );
  }

  // Create 5 demo students
  const studentInserts = DEMO_STUDENTS.map((s) => ({
    session_id: sessionId,
    display_name: s.displayName,
    avatar: s.avatar,
    is_active: true,
    last_seen_at: new Date().toISOString(),
  }));

  const { data: createdStudents, error: studentError } = await admin
    .from("students")
    .insert(studentInserts)
    .select("id, display_name, avatar");

  if (studentError || !createdStudents) {
    return NextResponse.json(
      { error: "Erreur lors de la création des élèves virtuels" },
      { status: 500 }
    );
  }

  // Find current situation to create responses
  const situation = await getCurrentSituation(
    admin,
    sessionId,
    session.current_module,
    session.current_seance,
    session.current_situation_index
  );

  let responsesCreated = 0;

  if (situation) {
    // Get category for appropriate demo responses
    const category = situation.category || "personnage";
    const demoTexts = getDemoResponsesForStudents(
      category,
      createdStudents.length
    );

    const responseInserts = createdStudents.map(
      (student: { id: string }, i: number) => ({
        session_id: sessionId,
        student_id: student.id,
        situation_id: situation.id,
        text: demoTexts[i],
      })
    );

    const { data: createdResponses, error: responseError } = await admin
      .from("responses")
      .insert(responseInserts)
      .select("id");

    if (!responseError && createdResponses) {
      responsesCreated = createdResponses.length;
    }
  }

  return NextResponse.json({
    ok: true,
    students: createdStudents.map(
      (s: { id: string; display_name: string; avatar: string }) => ({
        id: s.id,
        displayName: s.display_name,
        avatar: s.avatar,
      })
    ),
    responsesCreated,
  });
}

// DELETE — remove demo students and all their responses
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();

  // Find demo students
  const { data: demoStudents } = await admin
    .from("students")
    .select("id")
    .eq("session_id", sessionId)
    .in("display_name", DEMO_STUDENT_NAMES);

  if (!demoStudents || demoStudents.length === 0) {
    return NextResponse.json({ ok: true, deleted: 0 });
  }

  const demoStudentIds = demoStudents.map((s: { id: string }) => s.id);

  // Delete responses from demo students first (FK constraint)
  await admin
    .from("responses")
    .delete()
    .eq("session_id", sessionId)
    .in("student_id", demoStudentIds);

  // Delete votes from demo students
  await admin
    .from("votes")
    .delete()
    .eq("session_id", sessionId)
    .in("student_id", demoStudentIds);

  // Delete the demo students themselves
  const { error: deleteError } = await admin
    .from("students")
    .delete()
    .eq("session_id", sessionId)
    .in("id", demoStudentIds);

  if (deleteError) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, deleted: demoStudentIds.length });
}

// ── Helper: find the current situation for the session ──

 
async function getCurrentSituation(
  admin: ReturnType<typeof createAdminClient>,
  sessionId: string,
  currentModule: number,
  currentSeance: number,
  currentSituationIndex: number
): Promise<{ id: string; category: string } | null> {
  // Query the situations table to find the situation at the current position
  const { data: variants } = await admin
    .from("situations")
    .select("id, category")
    .eq("module", currentModule)
    .eq("seance", currentSeance)
    .eq("position", currentSituationIndex + 1);

  if (!variants || variants.length === 0) return null;

  // Pick a variant deterministically (same logic as situation/route.ts)
  if (variants.length === 1) return variants[0];

  const hash = sessionId
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const variantIndex = (hash + currentSituationIndex) % variants.length;
  return variants[variantIndex];
}
