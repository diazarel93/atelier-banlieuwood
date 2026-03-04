import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Ensure facilitator profile exists (same as /api/auth/setup)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const admin = createAdminClient();

        // Get or create default org
        let orgId: string;
        const { data: existingOrg } = await admin
          .from("organizations")
          .select("id")
          .eq("name", "Banlieuwood")
          .single();

        if (existingOrg) {
          orgId = existingOrg.id;
        } else {
          const { data: newOrg } = await admin
            .from("organizations")
            .insert({ name: "Banlieuwood" })
            .select("id")
            .single();
          orgId = newOrg?.id ?? "";
        }

        if (orgId) {
          await admin.from("facilitators").upsert({
            id: user.id,
            org_id: orgId,
            email: user.email!,
            name:
              user.user_metadata?.name ||
              user.user_metadata?.full_name ||
              user.email!.split("@")[0],
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If code exchange fails, redirect to login with error
  return NextResponse.redirect(`${origin}/login`);
}
