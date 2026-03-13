import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/session/:path*",
    "/v2/:path*",
    // Auth routes (redirect if already logged in)
    "/login",
    "/reset-password",
    // Status pages (need auth check for role caching)
    "/pending",
    "/account-blocked",
  ],
};
