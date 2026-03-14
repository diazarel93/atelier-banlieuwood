import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/api-utils";

// Blocked words for moderation
const BLOCKED_PATTERNS = [
  /\b(pute|salope|merde|fdp|ntm|nique|connard|connasse|enculé|pd)\b/i,
  /\b(kill|suicide|die)\b/i,
];

function isClean(text: string): boolean {
  return !BLOCKED_PATTERNS.some((p) => p.test(text));
}

// GET /api/team-chat — get team messages
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  const teamId = req.nextUrl.searchParams.get("teamId");

  if (!sessionId || !isValidUUID(sessionId)) {
    return NextResponse.json({ error: "sessionId requis (UUID)" }, { status: 400 });
  }

  let query = supabase
    .from("team_messages")
    .select(`
      *,
      student:students!team_messages_student_id_fkey(id, display_name, avatar)
    `)
    .eq("session_id", sessionId)
    .eq("flagged", false)
    .order("created_at", { ascending: true })
    .limit(100);

  if (teamId && isValidUUID(teamId)) {
    query = query.eq("team_id", teamId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[team-chat GET]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// POST /api/team-chat — send message
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { sessionId, teamId, studentId, content, messageType } = await req.json();

  if (!sessionId || !studentId || !content || !isValidUUID(sessionId) || !isValidUUID(studentId)) {
    return NextResponse.json(
      { error: "sessionId, studentId, et content requis" },
      { status: 400 },
    );
  }

  if (content.length > 200) {
    return NextResponse.json({ error: "Message trop long (200 car. max)" }, { status: 400 });
  }

  const flagged = !isClean(content);

  const { data, error } = await supabase
    .from("team_messages")
    .insert({
      session_id: sessionId,
      team_id: teamId || null,
      student_id: studentId,
      content: flagged ? "[Message modere]" : content,
      message_type: messageType || "text",
      is_moderated: true,
      flagged,
    })
    .select(`
      *,
      student:students!team_messages_student_id_fkey(id, display_name, avatar)
    `)
    .single();

  if (error) {
    console.error("[team-chat POST]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json(data);
}
