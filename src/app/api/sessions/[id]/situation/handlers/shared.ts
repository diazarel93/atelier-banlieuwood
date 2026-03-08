import type { AdminClient } from "./types";

// Helper: fetch student team info
export async function getStudentTeam(admin: AdminClient, studentId: string | null, sessionId: string) {
  if (!studentId) return null;
  const { data: student } = await admin
    .from("students")
    .select("team_id")
    .eq("id", studentId)
    .eq("session_id", sessionId)
    .single();
  if (!student?.team_id) return null;
  const { data: team } = await admin
    .from("teams")
    .select("id, team_name, team_color, team_number")
    .eq("id", student.team_id)
    .single();
  if (!team) return null;
  return { id: team.id, teamName: team.team_name, teamColor: team.team_color, teamNumber: team.team_number };
}
