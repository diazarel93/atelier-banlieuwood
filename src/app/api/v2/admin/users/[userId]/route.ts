import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isValidUUID } from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend-client";
import { accountValidatedEmail } from "@/lib/email/templates/account-validated";
import { accountRejectedEmail } from "@/lib/email/templates/account-rejected";

// PATCH /api/v2/admin/users/[userId] — validate/reject/deactivate a user
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { userId } = await params;
  if (!isValidUUID(userId)) {
    return NextResponse.json({ error: "userId invalide" }, { status: 400 });
  }

  const { action } = await req.json();

  if (!["validate", "reject", "deactivate", "reactivate"].includes(action)) {
    return NextResponse.json(
      { error: "Action invalide (validate/reject/deactivate/reactivate)" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const statusMap: Record<string, string> = {
    validate: "active",
    reject: "rejected",
    deactivate: "deactivated",
    reactivate: "active",
  };

  const updateData: Record<string, unknown> = {
    status: statusMap[action],
  };

  if (action === "validate" || action === "reactivate") {
    updateData.validated_at = new Date().toISOString();
    updateData.validated_by = auth.authUser.id;
  }

  const { data, error } = await admin
    .from("facilitators")
    .update(updateData)
    .eq("id", userId)
    .select("id, email, name, role, status")
    .single();

  if (error) {
    console.error("[admin users PATCH]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // Send notification email (fire-and-forget)
  if (data) {
    const baseUrl = req.nextUrl.origin;
    if (action === "validate" || action === "reactivate") {
      const { subject, html } = accountValidatedEmail(data.name, `${baseUrl}/login`);
      sendEmail(data.email, subject, html);
    } else if (action === "reject") {
      const { subject, html } = accountRejectedEmail(data.name);
      sendEmail(data.email, subject, html);
    }
  }

  return NextResponse.json({ user: data });
}
