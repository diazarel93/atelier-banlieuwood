"use client";

import { useRef, useCallback } from "react";
import { useReportWebVitals } from "next/web-vitals";

/**
 * Sentry Error Monitoring + Web Vitals collection.
 * Sentry is handled by @sentry/nextjs via withSentryConfig.
 */
function WebVitalsReporter() {
  const buffer = useRef<{ name: string; value: number; rating: string; id: string }[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushMetrics = useCallback(() => {
    if (buffer.current.length === 0) return;
    const metrics = [...buffer.current];
    buffer.current = [];
    // Use sendBeacon for reliability on page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/web-vitals", JSON.stringify(metrics));
    } else {
      fetch("/api/web-vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metrics),
        keepalive: true,
      }).catch(() => {});
    }
  }, []);

  useReportWebVitals((metric) => {
    buffer.current.push({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
    });
    // Debounce: flush after 2s of no new metrics
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flushMetrics, 2000);
  });

  return null;
}

export function Analytics() {
  return <WebVitalsReporter />;
}
