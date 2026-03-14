import { NextRequest, NextResponse } from "next/server";
import { safeJson, withErrorHandler } from "@/lib/api-utils";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

const VALID_LOCALES = ["fr", "en"];

/**
 * POST /api/locale — Set locale preference via cookie
 * Body: { locale: "fr" | "en" }
 */
export const POST = withErrorHandler<Record<string, never>>(async function POST(req: NextRequest) {
  const rl = checkRateLimit(getIP(req), "locale", { max: 20, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

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
});
