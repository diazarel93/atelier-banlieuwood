import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

// POST — add idea to shared bank
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "idea-bank", { max: 15, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const { studentId, text, category } = await req.json();

  if (!studentId || !text) {
    return NextResponse.json(
      { error: "studentId et text requis" },
      { status: 400 }
    );
  }

  if (typeof text !== "string" || text.trim().length < 5) {
    return NextResponse.json(
      { error: "L'idée doit faire au moins 5 caractères" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Verify session is module 10
  const { data: session } = await admin
    .from("sessions")
    .select("status, current_module")
    .eq("id", sessionId)
    .single();

  if (!session || session.current_module !== 10) {
    return NextResponse.json(
      { error: "La banque d'idées n'est pas disponible" },
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

  const { data, error } = await admin
    .from("module10_idea_bank")
    .insert({
      session_id: sessionId,
      student_id: studentId,
      text: text.trim(),
      category: category || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// GET — list all ideas for session
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("module10_idea_bank")
    .select("*, students(display_name, avatar)")
    .eq("session_id", sessionId)
    .order("votes", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ideas: data || [], count: data?.length || 0 });
}

// PATCH — vote on an idea
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "idea-vote", { max: 30, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const { ideaId } = await req.json();

  if (!ideaId) {
    return NextResponse.json({ error: "ideaId requis" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Increment vote count
  const { data: idea } = await admin
    .from("module10_idea_bank")
    .select("votes")
    .eq("id", ideaId)
    .eq("session_id", sessionId)
    .single();

  if (!idea) {
    return NextResponse.json({ error: "Idée introuvable" }, { status: 404 });
  }

  const { data, error } = await admin
    .from("module10_idea_bank")
    .update({ votes: (idea.votes || 0) + 1 })
    .eq("id", ideaId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
