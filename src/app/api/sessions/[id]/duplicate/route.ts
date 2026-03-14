import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { customAlphabet } from "nanoid";
import { withErrorHandler } from "@/lib/api-utils";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

// POST — duplicate a session as a fresh template (same title/level/template, reset state)
export const POST = withErrorHandler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "session-duplicate", { max: 10, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sourceId } = await params;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Fetch source session
  const { data: source, error: fetchError } = await supabase
    .from("sessions")
    .select("title, level, template, facilitator_id, org_id, thematique, class_label, description, question_timer")
    .eq("id", sourceId)
    .single();

  if (fetchError || !source) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // Must be owner
  if (source.facilitator_id !== user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const joinCode = nanoid();

  const { data: newSession, error: insertError } = await supabase
    .from("sessions")
    .insert({
      org_id: source.org_id,
      facilitator_id: user.id,
      title: `${source.title} (copie)`,
      level: source.level,
      template: source.template,
      thematique: source.thematique,
      class_label: source.class_label,
      description: source.description,
      question_timer: source.question_timer,
      join_code: joinCode,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json(newSession);
});
