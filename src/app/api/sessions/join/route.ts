import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { safeJson } from "@/lib/api-utils";
import { joinSessionSchema, formatZodError } from "@/lib/schemas";
import { signStudentToken } from "@/lib/student-token";

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

  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;

  const validated = joinSessionSchema.safeParse(parsed.data);
  if (!validated.success) {
    return NextResponse.json(
      { error: formatZodError(validated.error) },
      { status: 400 }
    );
  }

  const cleanName = validated.data.displayName.trim().slice(0, MAX_DISPLAY_NAME_LENGTH);
  const cleanCode = validated.data.joinCode.trim().toUpperCase().slice(0, 6);
  const avatar = validated.data.avatar;
  const profileCode = validated.data.profileCode?.trim().toUpperCase().slice(0, 4) || null;

  if (!isValidEmoji(String(avatar))) {
    return NextResponse.json(
      { error: "Avatar invalide — choisis un emoji" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Find session by join code (exclude soft-deleted)
  const { data: session, error: sessionError } = await admin
    .from("sessions")
    .select("id, status")
    .eq("join_code", cleanCode)
    .is("deleted_at", null)
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

    const token = signStudentToken(existingStudent.id, session.id);
    const response = NextResponse.json({
      studentId: existingStudent.id,
      sessionId: session.id,
      token,
    });
    response.cookies.set("bw-student-token", token, {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: 24 * 60 * 60,
    });
    return response;
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

  // If profileCode provided, try to find existing profile
  let linkedProfileId: string | null = null;
  if (profileCode && profileCode.length === 4) {
    const { data: existingProfile } = await admin
      .from("student_profiles")
      .select("id")
      .eq("profile_code", profileCode)
      .single();
    if (existingProfile) {
      linkedProfileId = existingProfile.id;
    }
  }

  // Create new student (with optional profile link)
  const insertData: Record<string, string> = {
    session_id: session.id,
    display_name: cleanName,
    avatar: String(avatar),
  };
  if (linkedProfileId) {
    insertData.profile_id = linkedProfileId;
  }

  const { data: student, error: studentError } = await admin
    .from("students")
    .insert(insertData)
    .select("id")
    .single();

  if (studentError || !student) {
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }

  const token = signStudentToken(student.id, session.id);
  const response = NextResponse.json({
    studentId: student.id,
    sessionId: session.id,
    token,
    ...(linkedProfileId ? { profileId: linkedProfileId } : {}),
  });
  response.cookies.set("bw-student-token", token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 24 * 60 * 60,
  });
  return response;
}
