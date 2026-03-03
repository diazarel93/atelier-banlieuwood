import { NextResponse } from "next/server";

const VALID_LOCALES = ["fr", "en"];

/**
 * POST /api/locale — Set locale preference via cookie
 * Body: { locale: "fr" | "en" }
 */
export async function POST(req: Request) {
  const { locale } = await req.json();

  if (!VALID_LOCALES.includes(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const response = NextResponse.json({ locale });
  response.cookies.set("locale", locale, {
    path: "/",
    maxAge: 365 * 24 * 60 * 60, // 1 year
    sameSite: "lax",
    httpOnly: false,
  });

  return response;
}
