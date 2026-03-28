import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { safeJson, withErrorHandler } from "@/lib/api-utils";

// POST — submit assembled pitch
export const POST = withErrorHandler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rl = checkRateLimit(getIP(req), "pitch", { max: 15, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const { studentId, objectif, obstacle, objectifReason, pitchText, chronoSeconds } = parsed.data;

  if (!studentId || !objectif || !obstacle) {
    return NextResponse.json({ error: "studentId, objectif et obstacle requis" }, { status: 400 });
  }

  // pitchText is optional at the objectif step, required at the pitch assembly step
  if (
    pitchText != null &&
    typeof pitchText === "string" &&
    pitchText.trim().length > 0 &&
    pitchText.trim().length < 10
  ) {
    return NextResponse.json({ error: "Le pitch doit faire au moins 10 caractères" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify session is module 10, séance 2
  const { data: session } = await admin
    .from("sessions")
    .select("status, current_module, current_seance")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (!session || session.current_module !== 10 || (session.current_seance || 1) !== 2) {
    return NextResponse.json({ error: "Le pitch n'est pas disponible pour cette séance" }, { status: 400 });
  }

  if (session.status !== "responding") {
    return NextResponse.json({ error: "Les réponses ne sont pas ouvertes" }, { status: 400 });
  }

  // Verify student
  const { data: student } = await admin
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("session_id", sessionId)
    .single();

  if (!student) {
    return NextResponse.json({ error: "Joueur introuvable dans cette partie" }, { status: 404 });
  }

  // Upsert pitch — pitchText may be null at the objectif step
  const cleanPitch = pitchText && typeof pitchText === "string" ? pitchText.trim() : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upsertData: Record<string, any> = {
    session_id: sessionId,
    student_id: studentId,
    objectif: objectif.trim(),
    obstacle: obstacle.trim(),
    objectif_reason: objectifReason && typeof objectifReason === "string" ? objectifReason.trim() : null,
    chrono_seconds: chronoSeconds != null ? Number(chronoSeconds) : null,
  };
  // Only overwrite pitch_text if explicitly provided (don't erase existing pitch at objectif step)
  // DB has NOT NULL constraint, so use empty string as initial placeholder
  if (cleanPitch) {
    upsertData.pitch_text = cleanPitch;
  } else {
    // For objectif step: check if row already exists (don't overwrite existing pitch)
    const { data: existing } = await admin
      .from("module10_pitchs")
      .select("pitch_text")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .maybeSingle();
    upsertData.pitch_text = existing?.pitch_text || "";
  }

  const { data, error } = await admin
    .from("module10_pitchs")
    .upsert(upsertData, { onConflict: "session_id,student_id" })
    .select()
    .single();

  if (error) {
    console.error("[pitch POST]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
  return NextResponse.json(data);
});

// GET — get student's pitch or all pitchs
export const GET = withErrorHandler(async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const studentId = req.nextUrl.searchParams.get("studentId");
  const admin = createAdminClient();

  if (studentId) {
    const { data, error } = await admin
      .from("module10_pitchs")
      .select("*")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (error) {
      console.error("[pitch GET]", error.message);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
    return NextResponse.json({ pitch: data });
  }

  // All pitchs (facilitator view)
  const { data, error } = await admin
    .from("module10_pitchs")
    .select("*, students(display_name, avatar), module10_personnages(prenom, avatar_data)")
    .eq("session_id", sessionId)
    .order("submitted_at", { ascending: true });

  if (error) {
    console.error("[pitch GET all]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
  return NextResponse.json({ pitchs: data || [], count: data?.length || 0 });
});

// PATCH — update chrono seconds only
export const PATCH = withErrorHandler(async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rl = checkRateLimit(getIP(req), "pitch-chrono", { max: 10, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const { studentId, chronoSeconds } = parsed.data;

  if (!studentId || chronoSeconds == null) {
    return NextResponse.json({ error: "studentId et chronoSeconds requis" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("module10_pitchs")
    .update({ chrono_seconds: Number(chronoSeconds) })
    .eq("session_id", sessionId)
    .eq("student_id", studentId)
    .select()
    .single();

  if (error) {
    console.error("[pitch PATCH]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
  return NextResponse.json(data);
});
