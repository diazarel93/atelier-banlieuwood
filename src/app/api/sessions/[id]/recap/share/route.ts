import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUUID, withErrorHandler } from "@/lib/api-utils";
import { nanoid } from "nanoid";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

// POST — Generate a share token for a student's recap
export const POST = withErrorHandler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rl = checkRateLimit(getIP(req), "recap-share", { max: 10, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const body = await req.json().catch(() => ({}));
  const { studentId } = body as { studentId?: string };

  if (!isValidUUID(sessionId) || !studentId || !isValidUUID(studentId)) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify student belongs to this session
  const { data: student } = await admin
    .from("students")
    .select("id, share_token")
    .eq("id", studentId)
    .eq("session_id", sessionId)
    .single();

  if (!student) {
    return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
  }

  // If token already exists, return it
  if (student.share_token) {
    return NextResponse.json({ shareToken: student.share_token });
  }

  // Generate new token
  const shareToken = nanoid(16);
  const { error } = await admin.from("students").update({ share_token: shareToken }).eq("id", studentId);

  if (error) {
    return NextResponse.json({ error: "Erreur lors de la création du lien" }, { status: 500 });
  }

  return NextResponse.json({ shareToken });
});

// GET — Fetch recap data via share token (public, no auth)
export const GET = withErrorHandler(async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const token = req.nextUrl.searchParams.get("token");

  if (!isValidUUID(sessionId) || !token) {
    return NextResponse.json({ error: "Lien invalide" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Find student by share token
  const { data: student } = await admin
    .from("students")
    .select("id, display_name, avatar")
    .eq("session_id", sessionId)
    .eq("share_token", token)
    .single();

  if (!student) {
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 404 });
  }

  // Get session info
  const { data: session } = await admin
    .from("sessions")
    .select("id, title, status")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // Get collective choices (the story)
  const { data: choices } = await admin
    .from("collective_choices")
    .select("id, category, restitution_label, chosen_text, source_response_id, validated_at")
    .eq("session_id", sessionId)
    .order("validated_at", { ascending: true });

  // Get student's responses
  const { data: responses } = await admin
    .from("responses")
    .select("id, situation_id, text")
    .eq("session_id", sessionId)
    .eq("student_id", student.id);

  const myResponses = (responses || []).map((r) => ({
    id: r.id,
    situationId: r.situation_id,
    text: r.text,
  }));

  const myResponseIds = new Set(myResponses.map((r) => r.id));
  const myChosenCount = (choices || []).filter(
    (c) => c.source_response_id && myResponseIds.has(c.source_response_id),
  ).length;

  const story = (choices || []).map((c) => ({
    id: c.id,
    category: c.category,
    restitutionLabel: c.restitution_label,
    chosenText: c.chosen_text,
    isMine: !!(c.source_response_id && myResponseIds.has(c.source_response_id)),
  }));

  return NextResponse.json({
    session: { id: session.id, title: session.title, status: session.status },
    student: { displayName: student.display_name, avatar: student.avatar },
    story,
    myResponses,
    myChosenCount,
    totalChoices: story.length,
  });
});
