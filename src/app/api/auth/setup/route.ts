import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeJson, withErrorHandler } from "@/lib/api-utils";
import { sendEmail } from "@/lib/email/resend-client";
import { welcomeEmail } from "@/lib/email/templates/welcome";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

export const POST = withErrorHandler<Record<string, never>>(async function POST(req: NextRequest) {
  const rl = checkRateLimit(getIP(req), "auth-setup", { max: 10, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const parsed = await safeJson<{
    name?: string;
    role?: string;
    institution?: string;
    invitationToken?: string;
  }>(req);
  if ("error" in parsed) return parsed.error;
  const { name, role, institution, invitationToken } = parsed.data;
  const admin = createAdminClient();

  // Check if facilitator already exists — don't downgrade active users
  const { data: existing } = await admin.from("facilitators").select("id, status, role").eq("id", user.id).single();

  if (existing && existing.status === "active") {
    // Already active — just return ok, don't overwrite role/status
    return NextResponse.json({ ok: true, role: existing.role, status: existing.status });
  }

  // Create or get org (for V1, one default org)
  let orgId: string;
  const { data: existingOrg } = await admin.from("organizations").select("id").eq("name", "Banlieuwood").single();

  if (existingOrg) {
    orgId = existingOrg.id;
  } else {
    const { data: newOrg, error: orgError } = await admin
      .from("organizations")
      .insert({ name: "Banlieuwood" })
      .select("id")
      .single();
    if (orgError || !newOrg) {
      return NextResponse.json({ error: "Erreur org" }, { status: 500 });
    }
    orgId = newOrg.id;
  }

  // Determine role and status
  let userRole = (role === "client" ? "client" : "intervenant") as string;
  let userStatus = "pending" as string;

  // Check invitation token — if valid, auto-activate
  if (invitationToken) {
    const { data: invitation } = await admin
      .from("invitations")
      .select("*")
      .eq("token", invitationToken)
      .eq("status", "pending")
      .single();

    if (invitation) {
      userRole = invitation.role;
      userStatus = "active";

      // Mark invitation as accepted
      await admin
        .from("invitations")
        .update({ status: "accepted", resolved_at: new Date().toISOString() })
        .eq("id", invitation.id);
    }
  }

  // Create facilitator profile
  const { error } = await admin.from("facilitators").upsert({
    id: user.id,
    org_id: orgId,
    email: user.email!,
    name: name || user.email!.split("@")[0],
    role: userRole,
    status: userStatus,
    institution: institution || null,
  });

  if (error) {
    console.error("[setup]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // Fire-and-forget welcome email for new users
  const userName = name || user.email!.split("@")[0];
  const { subject, html } = welcomeEmail(userName);
  sendEmail(user.email!, subject, html);

  return NextResponse.json({ ok: true, role: userRole, status: userStatus });
});
