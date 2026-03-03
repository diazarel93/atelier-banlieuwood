import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

// POST — submit assembled pitch
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "pitch", { max: 15, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const { studentId, objectif, obstacle, pitchText, chronoSeconds } = await req.json();

  if (!studentId || !objectif || !obstacle || !pitchText) {
    return NextResponse.json(
      { error: "studentId, objectif, obstacle et pitchText requis" },
      { status: 400 }
    );
  }

  if (typeof pitchText !== "string" || pitchText.trim().length < 10) {
    return NextResponse.json(
      { error: "Le pitch doit faire au moins 10 caractères" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Verify session is module 10, séance 2
  const { data: session } = await admin
    .from("sessions")
    .select("status, current_module, current_seance")
    .eq("id", sessionId)
    .single();

  if (!session || session.current_module !== 10 || (session.current_seance || 1) !== 2) {
    return NextResponse.json(
      { error: "Le pitch n'est pas disponible pour cette séance" },
      { status: 400 }
    );
  }

  if (session.status !== "responding") {
    return NextResponse.json(
      { error: "Les réponses ne sont pas ouvertes" },
      { status: 400 }
    );
  }

  // Verify student
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

  // Upsert pitch
  const { data, error } = await admin
    .from("module10_pitchs")
    .upsert(
      {
        session_id: sessionId,
        student_id: studentId,
        objectif: objectif.trim(),
        obstacle: obstacle.trim(),
        pitch_text: pitchText.trim(),
        chrono_seconds: chronoSeconds != null ? Number(chronoSeconds) : null,
      },
      { onConflict: "session_id,student_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// GET — get student's pitch or all pitchs
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ pitch: data });
  }

  // All pitchs (facilitator view)
  const { data, error } = await admin
    .from("module10_pitchs")
    .select("*, students(display_name, avatar), module10_personnages(prenom, avatar_data)")
    .eq("session_id", sessionId)
    .order("submitted_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pitchs: data || [], count: data?.length || 0 });
}

// PATCH — update chrono seconds only
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "pitch-chrono", { max: 10, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const { studentId, chronoSeconds } = await req.json();

  if (!studentId || chronoSeconds == null) {
    return NextResponse.json(
      { error: "studentId et chronoSeconds requis" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("module10_pitchs")
    .update({ chrono_seconds: Number(chronoSeconds) })
    .eq("session_id", sessionId)
    .eq("student_id", studentId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
