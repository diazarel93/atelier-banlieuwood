import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { safeJson } from "@/lib/api-utils";
import { isValidEtsiImageId } from "@/lib/module10-data";

// POST — student submits "Et si..." text for an image
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "etsi", { max: 20, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const { studentId, imageId, etsiText, helpUsed } = parsed.data;

  if (!studentId || !imageId || !etsiText) {
    return NextResponse.json(
      { error: "studentId, imageId et etsiText requis" },
      { status: 400 }
    );
  }

  if (!isValidEtsiImageId(imageId)) {
    return NextResponse.json({ error: "Image invalide — choisis parmi les 10 images proposées" }, { status: 400 });
  }

  if (typeof etsiText !== "string" || etsiText.trim().length < 5) {
    return NextResponse.json(
      { error: "Le texte doit faire au moins 5 caractères" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Verify session is module 10, séance 1, responding
  const { data: session } = await admin
    .from("sessions")
    .select("status, current_module, current_seance")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (!session || session.current_module !== 10 || (session.current_seance || 1) !== 1) {
    return NextResponse.json(
      { error: "\"Et si...\" n'est pas disponible pour cette séance" },
      { status: 400 }
    );
  }

  if (session.status !== "responding") {
    return NextResponse.json(
      { error: "Les réponses ne sont pas ouvertes" },
      { status: 400 }
    );
  }

  // Verify student belongs to session
  const { data: student } = await admin
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("session_id", sessionId)
    .single();

  if (!student) {
    return NextResponse.json(
      { error: "Joueur introuvable dans cette partie" },
      { status: 404 }
    );
  }

  // Upsert etsi response (one per student per session)
  const { data, error } = await admin
    .from("module10_etsi")
    .upsert(
      {
        session_id: sessionId,
        student_id: studentId,
        image_id: imageId,
        etsi_text: etsiText.trim(),
        help_used: !!helpUsed,
      },
      { onConflict: "session_id,student_id,image_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// GET — get student's "Et si..." for current session
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const studentId = req.nextUrl.searchParams.get("studentId");
  const admin = createAdminClient();

  if (studentId) {
    // Get specific student's responses
    const { data, error } = await admin
      .from("module10_etsi")
      .select("*")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .order("submitted_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ responses: data || [] });
  }

  // Get all responses for session (facilitator view)
  const { data, error } = await admin
    .from("module10_etsi")
    .select("*, students(display_name, avatar)")
    .eq("session_id", sessionId)
    .order("submitted_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ responses: data || [], count: data?.length || 0 });
}
