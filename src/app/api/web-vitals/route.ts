import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

interface WebVitalMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  id: string;
}

// POST — receive Web Vitals metrics from the client
export async function POST(req: NextRequest) {
  try {
    const metrics: WebVitalMetric[] = await req.json();

    if (!Array.isArray(metrics)) {
      return NextResponse.json({ error: "Expected array" }, { status: 400 });
    }

    for (const metric of metrics) {
      // Send to Sentry as custom measurement via span
      Sentry.startSpan({ name: `web_vital.${metric.name}` }, () => {
        Sentry.setMeasurement(metric.name, metric.value, "millisecond");
      });

      // Structured log for observability pipelines
      if (metric.rating === "poor") {
        console.warn("[web-vitals]", JSON.stringify(metric));
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
