import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { withErrorHandler } from "@/lib/api-utils";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

/**
 * POST /api/v2/student-profiles/[profileId]/notes
 * Create a teacher note for a student.
 *
 * DELETE /api/v2/student-profiles/[profileId]/notes?noteId=X
 * Delete a teacher note.
 */
export const POST = withErrorHandler<{ profileId: string }>(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> },
) {
  const rl = checkRateLimit(getIP(req), "student-notes", { max: 30, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { profileId } = await params;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json();
  const { noteType, content, sessionId } = body as {
    noteType: string;
    content: string;
    sessionId?: string;
  };

  if (!noteType || !content) {
    return NextResponse.json({ error: "noteType et content requis" }, { status: 400 });
  }

  const validTypes = ["observation", "strength", "concern", "goal"];
  if (!validTypes.includes(noteType)) {
    return NextResponse.json(
      { error: `noteType invalide. Valeurs acceptées : ${validTypes.join(", ")}` },
      { status: 400 },
    );
  }

  const { data: note, error } = await supabase
    .from("student_notes")
    .insert({
      profile_id: profileId,
      facilitator_id: user.id,
      note_type: noteType,
      content,
      session_id: sessionId || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[notes POST]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json(note, { status: 201 });
});

export const DELETE = withErrorHandler<{ profileId: string }>(async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> },
) {
  const rl = checkRateLimit(getIP(req), "student-notes", { max: 30, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { profileId } = await params;
  const noteId = req.nextUrl.searchParams.get("noteId");

  if (!noteId) {
    return NextResponse.json({ error: "noteId requis" }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { error } = await supabase
    .from("student_notes")
    .delete()
    .eq("id", noteId)
    .eq("profile_id", profileId)
    .eq("facilitator_id", user.id);

  if (error) {
    console.error("[notes DELETE]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
});
