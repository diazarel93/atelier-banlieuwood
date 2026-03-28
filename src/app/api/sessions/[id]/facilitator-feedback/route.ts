import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth-helpers";
import { withErrorHandler } from "@/lib/api-utils";
import { z } from "zod";

const feedbackSchema = z.object({
  energyLevel: z.number().int().min(1).max(5),
  participationQuality: z.number().int().min(1).max(5),
  toolEase: z.number().int().min(1).max(5),
  wouldRedo: z.number().int().min(1).max(5),
  notes: z.string().max(1000).optional(),
});

// POST — submit facilitator post-session feedback
export const POST = withErrorHandler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const supabase = await createServerSupabase();
  const user = await getAuthUser(supabase);
  if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const body = await req.json();
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Donnees invalides", details: parsed.error.flatten() }, { status: 400 });
  }

  // Verify user owns this session
  const { data: session } = await supabase
    .from("sessions")
    .select("id, status")
    .eq("id", sessionId)
    .eq("facilitator_id", user.id)
    .single();

  if (!session) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  if (session.status !== "done") return NextResponse.json({ error: "La session n'est pas terminee" }, { status: 400 });

  const { data, error } = await supabase
    .from("session_facilitator_feedback")
    .upsert(
      {
        session_id: sessionId,
        energy_level: parsed.data.energyLevel,
        participation_quality: parsed.data.participationQuality,
        tool_ease: parsed.data.toolEase,
        would_redo: parsed.data.wouldRedo,
        notes: parsed.data.notes || null,
      },
      { onConflict: "session_id" },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
});

// GET — retrieve facilitator feedback for a session
export const GET = withErrorHandler(async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const supabase = await createServerSupabase();
  const user = await getAuthUser(supabase);
  if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { data } = await supabase.from("session_facilitator_feedback").select("*").eq("session_id", sessionId).single();

  return NextResponse.json(data || null);
});
