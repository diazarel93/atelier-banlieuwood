import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, safeJson } from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend-client";
import { invitationEmail } from "@/lib/email/templates/invitation";

// GET /api/v2/admin/invitations — list all invitations
export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("invitations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invitations: data });
}

// POST /api/v2/admin/invitations — create an invitation (admin or public request)
export async function POST(req: NextRequest) {
  const parsed = await safeJson<{
    email: string;
    role: string;
    type?: string;
    institution?: string;
    message?: string;
  }>(req);
  if ("error" in parsed) return parsed.error;

  const { email, role, type = "invite", institution, message } = parsed.data;

  if (!email || !role) {
    return NextResponse.json({ error: "email et role requis" }, { status: 400 });
  }

  const admin = createAdminClient();

  // For invite type, require admin auth
  if (type === "invite") {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const { data, error } = await admin
      .from("invitations")
      .insert({
        email,
        role,
        type: "invite",
        institution,
        message,
        invited_by: auth.authUser.id,
      })
      .select("id, token")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send invitation email (fire-and-forget)
    if (data?.token) {
      const baseUrl = req.nextUrl.origin;
      const { subject, html } = invitationEmail(email, data.token, baseUrl, institution);
      sendEmail(email, subject, html);
    }

    return NextResponse.json({ invitation: data });
  }

  // For request type, no auth needed (public form)
  const { data, error } = await admin
    .from("invitations")
    .insert({
      email,
      role: role || "client",
      type: "request",
      institution,
      message,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
