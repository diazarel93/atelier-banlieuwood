import { NextRequest, NextResponse } from "next/server";
import { safeJson } from "@/lib/api-utils";

const VALID_LOCALES = ["fr", "en"];

/**
 * POST /api/locale — Set locale preference via cookie
 * Body: { locale: "fr" | "en" }
 */
export async function POST(req: NextRequest) {
  const parsed = await safeJson<{ locale: string }>(req);
  if ("error" in parsed) return parsed.error;
  const { locale } = parsed.data;

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
