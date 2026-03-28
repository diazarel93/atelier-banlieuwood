import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { safeJson, withErrorHandler } from "@/lib/api-utils";

// POST — add idea to shared bank
export const POST = withErrorHandler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rl = checkRateLimit(getIP(req), "idea-bank", { max: 15, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const { studentId, text, category } = parsed.data;

  if (!studentId || !text) {
    return NextResponse.json({ error: "studentId et text requis" }, { status: 400 });
  }

  if (typeof text !== "string" || text.trim().length < 5) {
    return NextResponse.json({ error: "L'idée doit faire au moins 5 caractères" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify session is module 10
  const { data: session } = await admin
    .from("sessions")
    .select("status, current_module")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (!session || session.current_module !== 10) {
    return NextResponse.json({ error: "La banque d'idées n'est pas disponible" }, { status: 400 });
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

  if (error) {
    console.error("[idea-bank POST]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
  return NextResponse.json(data);
});

// GET — list all ideas for session
export const GET = withErrorHandler(async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("module10_idea_bank")
    .select("*, students(display_name, avatar)")
    .eq("session_id", sessionId)
    .order("votes", { ascending: false });

  if (error) {
    console.error("[idea-bank GET]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
  return NextResponse.json({ ideas: data || [], count: data?.length || 0 });
});

// PATCH — vote on an idea (atomic increment, studentId for dedup)
export const PATCH = withErrorHandler(async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rl = checkRateLimit(getIP(req), "idea-vote", { max: 30, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const { ideaId, studentId } = parsed.data;

  if (!ideaId) {
    return NextResponse.json({ error: "ideaId requis" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Check idea exists
  const { data: idea } = await admin
    .from("module10_idea_bank")
    .select("id, votes, voted_by")
    .eq("id", ideaId)
    .eq("session_id", sessionId)
    .single();

  if (!idea) {
    return NextResponse.json({ error: "Idée introuvable" }, { status: 404 });
  }

  // Server-side dedup: check if student already voted
  const votedBy: string[] = (idea.voted_by as string[]) || [];
  if (studentId && votedBy.includes(studentId)) {
    return NextResponse.json({ error: "Déjà voté", alreadyVoted: true }, { status: 409 });
  }

  // Atomic update: increment votes + add studentId to voted_by array
  const newVotedBy = studentId ? [...votedBy, studentId] : votedBy;
  const { data, error } = await admin
    .from("module10_idea_bank")
    .update({ votes: (idea.votes || 0) + 1, voted_by: newVotedBy })
    .eq("id", ideaId)
    .eq("votes", idea.votes || 0) // Optimistic lock: only update if votes unchanged
    .select()
    .single();

  if (error) {
    console.error("[idea-bank PATCH]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
  if (!data) {
    // Race condition: votes changed between read and write, retry once
    const { data: retry } = await admin.from("module10_idea_bank").select("votes, voted_by").eq("id", ideaId).single();
    if (retry) {
      const retryVotedBy: string[] = (retry.voted_by as string[]) || [];
      if (studentId && retryVotedBy.includes(studentId)) {
        return NextResponse.json({ error: "Déjà voté", alreadyVoted: true }, { status: 409 });
      }
      const { data: d2, error: e2 } = await admin
        .from("module10_idea_bank")
        .update({ votes: (retry.votes || 0) + 1, voted_by: [...retryVotedBy, studentId || ""] })
        .eq("id", ideaId)
        .select()
        .single();
      if (e2) {
        console.error("[idea-bank PATCH retry]", e2.message);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
      }
      return NextResponse.json(d2);
    }
    return NextResponse.json({ error: "Conflit de votes, réessaye" }, { status: 409 });
  }
  return NextResponse.json(data);
});
