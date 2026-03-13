import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/v2/admin/users — list all users (admin only)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { searchParams } = req.nextUrl;
  const role = searchParams.get("role");
  const status = searchParams.get("status");

  const admin = createAdminClient();
  let query = admin
    .from("facilitators")
    .select("id, email, name, role, status, institution, created_at, validated_at")
    .order("created_at", { ascending: false });

  if (role) query = query.eq("role", role);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: data });
}

// PATCH /api/v2/admin/users — bulk update (admin only)
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { userIds, status } = await req.json();

  if (!Array.isArray(userIds) || !status) {
    return NextResponse.json({ error: "userIds et status requis" }, { status: 400 });
  }

  const admin = createAdminClient();
  const updateData: Record<string, unknown> = { status };

  if (status === "active") {
    updateData.validated_at = new Date().toISOString();
    updateData.validated_by = auth.authUser.id;
  }

  const { error } = await admin
    .from("facilitators")
    .update(updateData)
    .in("id", userIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: userIds.length });
}
