import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { name } = await req.json();
  const admin = createAdminClient();

  // Create or get org (for V1, one default org)
  let orgId: string;
  const { data: existingOrg } = await admin
    .from("organizations")
    .select("id")
    .eq("name", "Banlieuwood")
    .single();

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

  // Create facilitator profile
  const { error } = await admin.from("facilitators").upsert({
    id: user.id,
    org_id: orgId,
    email: user.email!,
    name: name || user.email!.split("@")[0],
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
