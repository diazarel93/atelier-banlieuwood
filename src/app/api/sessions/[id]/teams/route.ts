import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator } from "@/lib/api-utils";

const TEAM_COLORS = ["#FF6B35", "#4ECDC4", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444"];

// GET — list teams with their students
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const { data: teams, error } = await auth.supabase
    .from("teams")
    .select("id, team_name, team_color, team_number, students(id, display_name, avatar)")
    .eq("session_id", sessionId)
    .order("team_number");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(teams || []);
}

// POST — create a team
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const teamName = body.teamName || `Equipe ${body.teamNumber || 1}`;
  const teamNumber = body.teamNumber || 1;
  const teamColor = TEAM_COLORS[(teamNumber - 1) % TEAM_COLORS.length];

  const { data, error } = await auth.supabase
    .from("teams")
    .insert({
      session_id: sessionId,
      team_name: teamName,
      team_number: teamNumber,
      team_color: teamColor,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}

// DELETE — delete a team (reset students' team_id)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const teamId = req.nextUrl.searchParams.get("teamId");

  if (teamId) {
    // Delete specific team
    await auth.supabase.from("students").update({ team_id: null }).eq("team_id", teamId);
    await auth.supabase.from("teams").delete().eq("id", teamId).eq("session_id", sessionId);
  } else {
    // Delete all teams for session
    const { data: teams } = await auth.supabase
      .from("teams")
      .select("id")
      .eq("session_id", sessionId);
    if (teams?.length) {
      const teamIds = teams.map((t) => t.id);
      await auth.supabase.from("students").update({ team_id: null }).in("team_id", teamIds);
      await auth.supabase.from("teams").delete().eq("session_id", sessionId);
    }
  }

  return NextResponse.json({ ok: true });
}
