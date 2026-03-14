import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { withErrorHandler } from "@/lib/api-utils";

// GET — find similar sessions and return comparison data
export const GET = withErrorHandler(async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id: sessionId } = await params;

  // Get current session
  const { data: session } = await supabase
    .from("sessions")
    .select("id, title, level, template, current_module, current_seance, facilitator_id")
    .eq("id", sessionId)
    .eq("facilitator_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // Find similar sessions (same facilitator, same module, different session)
  let query = supabase
    .from("sessions")
    .select("id, title, level, template, current_module, current_seance, created_at, status")
    .eq("facilitator_id", user.id)
    .eq("current_module", session.current_module)
    .is("deleted_at", null)
    .neq("id", sessionId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Prefer same template if set
  if (session.template) {
    query = query.eq("template", session.template);
  }

  const { data: similar } = await query;

  if (!similar || similar.length === 0) {
    return NextResponse.json({ similar: [], currentChoices: [] });
  }

  // Get collective choices for current session
  const { data: currentChoices } = await supabase
    .from("collective_choices")
    .select("id, situation_id, category, chosen_text, restitution_label")
    .eq("session_id", sessionId);

  // Get collective choices + student counts for similar sessions
  const comparisons = [];
  for (const s of similar.slice(0, 5)) {
    const { data: choices } = await supabase
      .from("collective_choices")
      .select("id, situation_id, category, chosen_text, restitution_label")
      .eq("session_id", s.id);

    const { count: studentCount } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("session_id", s.id)
      .eq("kicked", false);

    comparisons.push({
      session: {
        id: s.id,
        title: s.title,
        level: s.level,
        template: s.template,
        status: s.status,
        createdAt: s.created_at,
        studentCount: studentCount || 0,
      },
      choices: choices || [],
    });
  }

  return NextResponse.json({
    current: {
      id: session.id,
      title: session.title,
      level: session.level,
      template: session.template,
      module: session.current_module,
    },
    currentChoices: currentChoices || [],
    similar: comparisons,
  });
});
