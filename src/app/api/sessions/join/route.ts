import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

const MAX_DISPLAY_NAME_LENGTH = 30;
const MAX_STUDENTS_PER_SESSION = 50;

// Validate avatar is a single emoji (1-2 codepoints)
function isValidEmoji(str: string): boolean {
  const segments = [...new Intl.Segmenter("fr", { granularity: "grapheme" }).segment(str)];
  return segments.length === 1 && /\p{Emoji}/u.test(str);
}

// POST — student joins a session with join code
export async function POST(req: NextRequest) {
  const rl = checkRateLimit(getIP(req), "join", { max: 10, windowSec: 60 });
  if (rl) {
    return NextResponse.json({ error: rl.error }, { status: 429 });
  }

  const { joinCode, displayName, avatar } = await req.json();

  if (!joinCode || !displayName || !avatar) {
    return NextResponse.json(
      { error: "Code, prénom et emoji requis" },
      { status: 400 }
    );
  }

  // Input validation
  const cleanName = String(displayName).trim().slice(0, MAX_DISPLAY_NAME_LENGTH);
  const cleanCode = String(joinCode).trim().toUpperCase().slice(0, 6);

  if (cleanName.length < 1) {
    return NextResponse.json(
      { error: "Prénom trop court" },
      { status: 400 }
    );
  }

  if (!isValidEmoji(String(avatar))) {
    return NextResponse.json(
      { error: "Avatar invalide — choisis un emoji" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Find session by join code
  const { data: session, error: sessionError } = await admin
    .from("sessions")
    .select("id, status")
    .eq("join_code", cleanCode)
    .single();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: "Ce code n'existe pas. Vérifie avec ton facilitateur." },
      { status: 404 }
    );
  }

  // Don't allow joining a finished session
  if (session.status === "done") {
    return NextResponse.json(
      { error: "Cette partie est terminée." },
      { status: 400 }
    );
  }

  // Check if student already exists (reconnection)
  const { data: existingStudent } = await admin
    .from("students")
    .select("id")
    .eq("session_id", session.id)
    .eq("display_name", cleanName)
    .eq("avatar", String(avatar))
    .single();

  if (existingStudent) {
    // Reconnection — update last_seen and return existing student
    await admin
      .from("students")
      .update({ is_active: true, last_seen_at: new Date().toISOString() })
      .eq("id", existingStudent.id);

    return NextResponse.json({
      studentId: existingStudent.id,
      sessionId: session.id,
    });
  }

  // Enforce max students per session
  const { count } = await admin
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("session_id", session.id);

  if (count !== null && count >= MAX_STUDENTS_PER_SESSION) {
    return NextResponse.json(
      { error: `Cette partie est pleine (${MAX_STUDENTS_PER_SESSION} joueurs max)` },
      { status: 400 }
    );
  }

  // Create new student
  const { data: student, error: studentError } = await admin
    .from("students")
    .insert({
      session_id: session.id,
      display_name: cleanName,
      avatar: String(avatar),
    })
    .select("id")
    .single();

  if (studentError || !student) {
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    studentId: student.id,
    sessionId: session.id,
  });
}
