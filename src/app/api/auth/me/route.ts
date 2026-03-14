import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth-helpers";
import { withErrorHandler } from "@/lib/api-utils";

export const GET = withErrorHandler<Record<string, never>>(async function GET() {
  const supabase = await createServerSupabase();
  const authUser = await getAuthUser(supabase);

  if (!authUser) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  return NextResponse.json({
    id: authUser.id,
    email: authUser.email,
    name: authUser.name,
    role: authUser.role,
    status: authUser.status,
    institution: authUser.institution,
  });
});
