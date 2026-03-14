import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const report = body["csp-report"] || body;

    Sentry.captureMessage("CSP Violation", {
      level: "warning",
      extra: {
        blockedUri: report["blocked-uri"],
        violatedDirective: report["violated-directive"],
        documentUri: report["document-uri"],
        sourceFile: report["source-file"],
      },
    });
  } catch {
    // Silently ignore malformed reports
  }

  return new NextResponse(null, { status: 204 });
}
