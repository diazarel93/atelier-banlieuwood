import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip auth check if env vars are missing (avoids edge crash)
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected routes: dashboard and session management
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/session") ||
    pathname.startsWith("/v2");

  // Auth routes: login, reset-password
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/reset-password");

  // Redirect /dashboard → /v2
  if (pathname === "/dashboard" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/v2";
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth routes to dashboard
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/v2";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
