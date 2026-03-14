import { NextResponse } from "next/server";
import { requireAdmin, withErrorHandler } from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/v2/admin/stats — global admin stats
export const GET = withErrorHandler<Record<string, never>>(async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();

  const [usersRes, pendingRes, sessionsRes, invitationsRes] = await Promise.all([
    admin.from("facilitators").select("id", { count: "exact", head: true }),
    admin.from("facilitators").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("sessions").select("id", { count: "exact", head: true }),
    admin.from("invitations").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return NextResponse.json({
    totalUsers: usersRes.count ?? 0,
    pendingUsers: pendingRes.count ?? 0,
    totalSessions: sessionsRes.count ?? 0,
    pendingInvitations: invitationsRes.count ?? 0,
  });
});
