"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Script from "next/script";
import { useReportWebVitals } from "next/web-vitals";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";

/**
 * PostHog Analytics + Sentry Error Monitoring
 * PostHog only loads when analytics consent is given (RGPD).
 * Sentry remains unconditional (legitimate interest for error monitoring).
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
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    setAnalyticsAllowed(hasAnalyticsConsent());

    // Re-check on cookie changes (consent banner updates cookie)
    const interval = setInterval(() => {
      setAnalyticsAllowed(hasAnalyticsConsent());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* PostHog — only loads with consent */}
      {posthogKey && analyticsAllowed && (
        <Script
          id="posthog"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group identify setPersonProperties setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags startSessionRecording stopSessionRecording isSessionRecordingActive getDistinctId alias".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
              posthog.init('${posthogKey}', {
                api_host: '${posthogHost}',
                person_profiles: 'identified_only',
                capture_pageview: true,
                capture_pageleave: true,
                autocapture: false,
              });
            `,
          }}
        />
      )}

      {/* Sentry is now handled by @sentry/nextjs via withSentryConfig — no CDN script needed */}

      {/* Web Vitals collection */}
      <WebVitalsReporter />
    </>
  );
}
