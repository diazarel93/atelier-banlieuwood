import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { isValidUUID, withErrorHandler } from "@/lib/api-utils";

// GET — fetch recap data for a student (collective story + personal contributions)
export const GET = withErrorHandler(async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const studentId = req.nextUrl.searchParams.get("studentId");

  if (!isValidUUID(sessionId)) {
    return NextResponse.json({ error: "Session invalide" }, { status: 400 });
  }

  // Auth check: require authenticated user who owns this session
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Ownership check via RLS-scoped query
  const { data: ownedSession } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();
  if (!ownedSession) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  const admin = createAdminClient();

  // Get session info
  const { data: session } = await admin
    .from("sessions")
    .select("id, title, status, current_module")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // Get all collective choices (the assembled story)
  const { data: choices } = await admin
    .from("collective_choices")
    .select("id, situation_id, category, restitution_label, chosen_text, source_response_id, validated_at")
    .eq("session_id", sessionId)
    .order("validated_at", { ascending: true });

  // Get student's own responses if studentId provided
  let myResponses: { situationId: string; text: string; id: string }[] = [];
  let myChosenCount = 0;

  if (studentId && isValidUUID(studentId)) {
    // Verify student belongs to this session
    const { data: studentCheck } = await admin
      .from("students")
      .select("id")
      .eq("id", studentId)
      .eq("session_id", sessionId)
      .single();
    if (!studentCheck) {
      return NextResponse.json({ error: "Élève introuvable dans cette session" }, { status: 403 });
    }

    const { data: responses } = await admin
      .from("responses")
      .select("id, situation_id, text")
      .eq("session_id", sessionId)
      .eq("student_id", studentId);

    myResponses = (responses || []).map((r) => ({
      id: r.id,
      situationId: r.situation_id,
      text: r.text,
    }));

    // Count how many of student's responses were chosen
    const myIds = new Set(myResponses.map((r) => r.id));
    myChosenCount = (choices || []).filter((c) => c.source_response_id && myIds.has(c.source_response_id)).length;
  }

  // Mark which choices came from this student
  const myResponseIds = new Set(myResponses.map((r) => r.id));
  const story = (choices || []).map((c) => ({
    id: c.id,
    category: c.category,
    restitutionLabel: c.restitution_label,
    chosenText: c.chosen_text,
    isMine: !!(c.source_response_id && myResponseIds.has(c.source_response_id)),
  }));

  // Module 10 data — pitch + personnage for this student
  let myPitch: {
    objectif: string;
    obstacle: string;
    pitchText: string;
    chronoSeconds: number | null;
    prenom: string;
    trait: string | null;
  } | null = null;
  if (studentId && isValidUUID(studentId)) {
    const { data: pitch } = await admin
      .from("module10_pitchs")
      .select("objectif, obstacle, pitch_text, chrono_seconds, module10_personnages(prenom, trait_dominant)")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (pitch && pitch.pitch_text && pitch.pitch_text.length > 0) {
      const perso = pitch.module10_personnages as unknown as { prenom: string; trait_dominant: string | null } | null;
      myPitch = {
        objectif: pitch.objectif,
        obstacle: pitch.obstacle,
        pitchText: pitch.pitch_text,
        chronoSeconds: pitch.chrono_seconds,
        prenom: perso?.prenom || "?",
        trait: perso?.trait_dominant || null,
      };
    }
  }

  return NextResponse.json({
    session: { id: session.id, title: session.title, status: session.status },
    story,
    myResponses,
    myChosenCount,
    totalChoices: story.length,
    myPitch,
  });
});
